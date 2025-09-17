import {DiscordBot, MsgHelper} from "../general/discordBot";
import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import puppeteer, {Page} from "puppeteer";
import {ReplayReport, ReplayReportPlayer, PickOrder} from "../db/models/replay";
import {divisions} from "sd2-data"


export class ReplayReportsCommand {

    private async picksAndBansUpload(interaction: ChatInputCommandInteraction){


        const guestUser= interaction.options.getUser("guest");

        //if(guestUser.bot){
        //    await MsgHelper.reply(interaction, "Cannot mention bots!");
        //    return;
        //}

        //if(guestUser.id == interaction.user.id){
        //    await MsgHelper.reply(interaction, "Cannot mention yourself!");
        //    return;
        //}

        if(!interaction.guild){
            await MsgHelper.reply(interaction, "This command can't be used outside servers.");
            return;
        }

        const guestUserId = guestUser.id;

        const sessionCode = interaction.options.getString("session_code");

        //const regex = new RegExp("^https:\/\/aoe2cm\.net\/draft\/\w{5,8}$")
        const regex = new RegExp("^[a-zA-z]{5,8}$")

        if(!regex.test(sessionCode)){
            await MsgHelper.reply(interaction, "Invalid url");
            return;
        }

        await interaction.deferReply()


        const browser = await puppeteer.launch({
            headless: true ,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();

        const url = "https://aoe2cm.net/draft/" + sessionCode;

        await page.goto(url, { waitUntil: "networkidle2" });

        const host = this.getDivisionsFromPABSession(page, interaction.user.id, 'host');
        const guest = this.getDivisionsFromPABSession(page, guestUserId, 'guest');


        const report: ReplayReport = {
            host: await host,
            guest: await guest,
            channelId: interaction.channelId,
            persistentSearch: interaction.options.getBoolean("search_all") ?? false
        }

       this.normalisePickOrder(report);




        


        await interaction.editReply("Finished.");

    }

    private async getDivisionsFromPABSession(page: Page, playerId:string, playerType: "host" | "guest"):Promise<ReplayReportPlayer>{

        const player: ReplayReportPlayer = new ReplayReportPlayer(playerId);

        //find the bans in DOM
        let bans :string[]= await page.$$eval(
            "#player-" + playerType + " .chosen .bans div .element-stack div .stretchy-text",
            divs => divs.map(el => el.textContent?.trim())
        );

        //every map name starts with a dot
        bans.forEach(ban => {
            if(ban.startsWith('.')){
                player.mapBans.push(ban.substring(1));
            }
            else{
                player.divBans.push(ban);
            }
        });

        //the same as with the maps, just need to remember the pick order
        //to know in which game what was played
        let picksData = await page.$$eval(
            "#player-" + playerType + " .chosen .picks .pick",
            divs => {
                return divs.map(div => {
                    const picks = div.getElementsByClassName("stretchy-text");

                    if (picks.length !== 1) {
                        throw new Error("Unexpected state, more than one element");
                    }

                    const pick = picks[0];

                    const pickOrder = Number(div.id.substring(11));
                    const text = pick.textContent;

                    return { pickOrder, text };
                });
            }
        );

        //the $$eval can't access my variables outside its scope, so this is a workaround
        for (const { pickOrder, text } of picksData) {
            if (text.startsWith('.')) {
                player.mapPicks.push({
                    order:pickOrder,
                    pick: text.substring(1)
                });
            } else {
                player.divPicks.push({
                    order:pickOrder,
                    pick: this.getDivisionIdFromName(text)
                });
            }
        }
        return player;
    }

    private normalisePickOrder(report:ReplayReport){

        const sortFunc = (a: PickOrder, b: PickOrder) => {
            if(a.order < b.order){
                return -1;
            }
            if(a.order > b.order){
                return 1;
            }
            return 0;
        }

        report.host.divPicks.sort(sortFunc);
        for (let i = 0; i < report.host.divPicks.length; i++) {
            report.host.divPicks[i].order = i;
        }

        report.guest.divPicks.sort(sortFunc);
        for (let i = 0; i < report.guest.divPicks.length; i++) {
           report.guest.divPicks[i].order = i;
        }

        const maxIndex = report.host.mapPicks.length + report.guest.mapPicks.length;
        let lowestPick = report.host.mapPicks[0];

        for (let counter = 0; counter < maxIndex; counter++) {

           for (let i = 0; i < report.host.mapPicks.length; i++) {
              lowestPick = lowestPick.order < report.host.mapPicks[i].order && lowestPick.order > counter
                  ? lowestPick : report.host.mapPicks[i];
           }

           for (let i = 0; i < report.guest.mapPicks.length; i++) {
               lowestPick = lowestPick.order < report.guest.mapPicks[i].order && lowestPick.order > counter
                   ? lowestPick : report.guest.mapPicks[i];
           }

          lowestPick.order = counter;
       }
    }

    private getDivisionIdFromName(divName:string):number{
        let div = divisions.divisionsPact.find(div => div.name === divName);

        if(div){
            return div.id;
        }

        div = divisions.divisionsPact.find(div => div.name === divName);

        if(!div){
            throw new Error("Unable to find division by name! Div name: " + divName);
        }

        return div.id;
    }

    public addCommands(bot: DiscordBot):void {

       const pabUpload = new SlashCommandBuilder().setName("pabupload").setDescription("Upload url to completed picks and bans");

       pabUpload.addStringOption(option => option.setRequired(true).setName("session_code")
           .setDescription("Session code to completed picks and bans (only the code, not the entire URL"));

       pabUpload.addUserOption(option => option.setRequired(true).setName("guest")
           .setDescription("Mention the user that joined the P&B session."));

       pabUpload.addBooleanOption(option => option.setName("search_all")
           .setDescription("Looks through all replays in this channel. Default max. age: 7 days"));

       bot.registerCommand(pabUpload, this.picksAndBansUpload.bind(this));
    }
}