import {DiscordBot, MsgHelper} from "../general/discordBot";
import {ChatInputCommandInteraction, SlashCommandBuilder, User} from "discord.js";
import puppeteer, {Browser, Page} from "puppeteer";
import {ReplayReport, ReplayReportPlayer, PickOrder} from "../db/models/replay";
import {divisions} from "sd2-data"
import {uploadReplayReport} from "../db/services/replaysService";


export class ReplayReportsCommand {

    public browser:Browser = null;

    public async init(){
        this.browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
    }

    //todo just a temporary solution
    public static reportAdmins: string[] = [
        '607962880154927113', //Reef
        '539185057894498314', //Protoss
        '288657972857667584', //RyenSaotome
        '204536372390920192', //Aim_Deusi
        '463685897699852289', //Stahlbrecher
        '664098832413491200' //Fatkid
    ];

    private async picksAndBansUpload(interaction: ChatInputCommandInteraction, host:User|null = null) {

        if(this.browser === null){
           await this.init();
        }

        const guestUser = interaction.options.getUser("guest");

        host ??= interaction.user;

        if(guestUser.bot || host.bot){
            await MsgHelper.reply(interaction, "Cannot mention bots!");
            return;
        }

        if(guestUser.id == interaction.user.id){
            await MsgHelper.reply(interaction, "Cannot mention yourself!");
            return;
        }

        if (!interaction.guild) {
            await MsgHelper.reply(interaction, "This command can't be used outside servers.");
            return;
        }

        const guestUserId = guestUser.id;

        const sessionCode = interaction.options.getString("session_code");

        //const regex = new RegExp("^https:\/\/aoe2cm\.net\/draft\/\w{5,8}$")
        const regex = new RegExp("^[a-zA-z]{5,8}$")

        if (!regex.test(sessionCode)) {
            await MsgHelper.reply(interaction, "Invalid url");
            return;
        }

        await interaction.deferReply()

        const page = await this.browser.newPage();

        const url = "https://aoe2cm.net/draft/" + sessionCode;

        await page.goto(url, {waitUntil: "networkidle2"});

        let hostPromise: Promise<ReplayReportPlayer>;
        let guestPromise: Promise<ReplayReportPlayer>;

        try {
            hostPromise = this.getDivisionsFromPABSession(page, host.id, 'host');
            guestPromise = this.getDivisionsFromPABSession(page, guestUserId, 'guest');
        } catch (err) {
            console.log("Error while getting data from P&B webiste: ", err);
            await interaction.editReply("Error while uploading report. Please contact admin.");
            console.log("Closing page:");
            await page.close();
            return;
        }

        const report: ReplayReport = {
            host: await hostPromise,
            guest: await guestPromise,
            channelId: interaction.channelId,
            persistentSearch: interaction.options.getBoolean("search_all") ?? false
        }

        await page.close();

        this.normalisePickOrder(report);

        //await interaction.editReply("Finished.");
        const ret = await uploadReplayReport(report);

        if (typeof (ret) === "string") {
            await interaction.editReply(ret);
            return;
        }

        let reply = "Uploaded report to these replays: ";

        ret.forEach(r => {
            const date = new Date(r.uploadedAt);
            //the discord timestamp format
            reply += `\n ${r.replayPlayers[0].nickname} vs ${r.replayPlayers[1].nickname}` +
                '; Uploaded: ' + '<t:' + Math.floor(date.getTime() / 1000) + ':f\>';
        });

        await interaction.editReply(reply);
    }

    private async adminPicksAndBansUpload(interaction: ChatInputCommandInteraction) {

        const host= interaction.options.getUser("host");

        if(!ReplayReportsCommand.reportAdmins.includes(interaction.user.id)){
            await interaction.reply("You don't have permission to use this command.");
            return;
        }

        await this.picksAndBansUpload(interaction, host);
    }

    private async getDivisionsFromPABSession(page: Page, playerId: string, playerType: "host" | "guest"): Promise<ReplayReportPlayer> {

        const player: ReplayReportPlayer = new ReplayReportPlayer(playerId);

        //find the bans in DOM
        let bans: string[] = await page.$$eval(
            "#player-" + playerType + " .chosen .bans div .element-stack div .stretchy-text",
            divs => divs.map(el => el.textContent?.trim())
        );

        //every map name starts with a dot
        bans.forEach(ban => {
            if (ban.startsWith('.')) {
                player.mapBans.push(ban.substring(1));
            } else {
                player.divBans.push(this.getDivisionIdFromName(ban));
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

                    return {pickOrder, text};
                });
            }
        );

        //the $$eval can't access my variables outside its scope, so this is a workaround
        for (const {pickOrder, text} of picksData) {
            if (text.startsWith('.')) {
                player.mapPicks.push({
                    order: pickOrder,
                    pick: text.substring(1)
                });
            } else {
                player.divPicks.push({
                    order: pickOrder,
                    pick: this.getDivisionIdFromName(text)
                });
            }
        }
        return player;
    }


    private async cancelLastUpload(interaction: ChatInputCommandInteraction) {

    }

    //orders the picks in the order of games played
    private normalisePickOrder(report: ReplayReport) {

        const sortFunc = (a: PickOrder, b: PickOrder) => {
            if (a.order < b.order) {
                return -1;
            }
            if (a.order > b.order) {
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

    private getDivisionIdFromName(divName: string): number {

        let div = divisions.divisionsPact.find(div => div.name.toLowerCase() === divName.toLowerCase());

        if (div) {
            return div.id;
        }

        const divs = divisions.divisionsNato;

        div = divisions.divisionsNato.find(div => div.name.toLowerCase() === divName.toLowerCase());

        if (!div) {
            throw new Error("Unable to find division by name! Div name: " + divName);
        }

        return div.id;
    }

    public addCommands(bot: DiscordBot): void {

        const pabUpload = new SlashCommandBuilder().setName("pabupload").setDescription("Upload url to completed picks and bans");

        pabUpload.addStringOption(option => option.setRequired(true).setName("session_code")
            .setDescription("Session code to completed picks and bans (only the code, not the entire URL"));

        pabUpload.addUserOption(option => option.setRequired(true).setName("guest")
            .setDescription("Mention the user that joined the P&B session."));

        pabUpload.addBooleanOption(option => option.setName("search_all")
            .setDescription("Looks through all replays in this channel. Don't use unless necessary! Default max. age: 7 days"));

        bot.registerCommand(pabUpload, this.picksAndBansUpload.bind(this));


        const adminPabUpload = new SlashCommandBuilder().setName("adminpabupload")
            .setDescription("Upload url to completed picks and bans. Only for admin.");

        adminPabUpload.addStringOption(option => option.setRequired(true).setName("session_code")
            .setDescription("Session code to completed picks and bans (only the code, not the entire URL"));

        adminPabUpload.addUserOption(option => option.setRequired(true).setName("host")
            .setDescription("Mention the user that hosted the P&B session."));

        adminPabUpload.addUserOption(option => option.setRequired(true).setName("guest")
            .setDescription("Mention the user that joined the P&B session."));

        adminPabUpload.addBooleanOption(option => option.setName("search_all")
            .setDescription("Looks through all replays in this channel. Don't use unless necessary! Default max. age: 7 days"));

        bot.registerCommand(adminPabUpload, this.adminPicksAndBansUpload.bind(this));






    }
}