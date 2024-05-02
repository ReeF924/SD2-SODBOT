import { GuildChannel, Message, SlashCommandBuilder } from "discord.js";
import { DiscordBot, MsgHelper, SodbotCommand } from "../general/discordBot";
import { Logs } from "../general/logs";
import { DB } from "../general/db";
import { CommandsCollection } from "./Command";
export class AdminCommand extends CommandsCollection {
    //Only RoguishTiger or Kuriosly can set Admin rights 
    //ReeF: added myself for the tests, maybe for later use, dunno how active is Kuriosly
    public constructor(database: DB) {
        super(database);
    }
    // private admins: string[] = ["687898043005272096", "271792666910392325", "607962880154927113", "477889434642153482"];
    // private async setAdmin(interaction: Message, input: string[]) {
    //     if (this.admins.some(adminId => interaction.author.id == adminId)) {
    //         //Check for argument
    //         if (input.length === 1) {
    //             await (async () => {
    //                 //Get user from the DiscordUsers Table
    //                 let user = await this.database.getDiscordUser(input[0])
    //                 const discordUser = await DiscordBot.bot.users.fetch(String(input[0]))
    //                 //If user is already registered up their Admin permisson
    //                 if (user) {
    //                     if (user.globalAdmin == false) {
    //                         user.globalAdmin = (true)
    //                         await this.database.setDiscordUser(user);
    //                         MsgHelper.replyPing(interaction, "Discord account " + discordUser.username + " has been updated with global admin access")
    //                         Logs.log("Changed globalAdmin access to user " + discordUser.username + " to true")
    //                         return
    //                     }
    //                     else if (user.globalAdmin == true) {
    //                         console.log("User's GlobalAdmin setting is already set to " + user.globalAdmin)
    //                         MsgHelper.replyPing(interaction, "The user already has global admin access!")
    //                         return
    //                     }
    //                 }
    //                 //If user is not registered
    //                 else {
    //                     MsgHelper.replyPing(interaction, "This user is not currently registered to the bot, they must first register before you can add them as a admin")
    //                     return
    //                 }
    //             })()
    //         }
    //     }
    // }
    private async adjustElo(interaction: Message, input: string[]) {
        let user = await this.database.getDiscordUser(interaction.author.id)
        //Check if requestor has admin access
        if (user.globalAdmin === true) {
            //Check that the command is correctly formatted
            if (input.length < 3) {
                console.log("Not enough arguments")
                interaction.reply("This command requires three arguments EugenID, New League ELO, New Global ELO.  All seperated by commas")
                return
            }
            else if (input.length === 3) {
                let eugenId = input[0]
                let newLeagueElo = input[1]
                let newGlobalElo = input[2]
                //await this.database.setPlayer(eugenId, newLeagueElo, newGlobalElo);
                //interaction.reply("Eugen Acct "+eugenId+ " has been updated with LeagueELO "+newLeagueElo+" and GlobalELO "+newGlobalElo)
                return
            }
            else {
                interaction.reply("This command is not correctly formatted, it requires three arguments EugenID, New League ELO, New Global ELO.  All seperated by commas")
            }
        }
        else {
            interaction.reply("You do not have the admin access to use this command")

        }
    }
    // private async setChannelPrems(interaction: Message, input: string[]) {
    //     let user = await this.database.getDiscordUser(interaction.user.id)
    //     let prem = {
    //         id: "",
    //         name: "",
    //         blockElo: 0,
    //         blockCommands: 0,
    //         blockReplay: 0,
    //         blockChannelElo: 0,
    //         blockServerElo: 0,
    //         blockGlobalElo: 0
    //     }

    //     const bot = DiscordBot.getInstance();

    //     //Check if requestor has admin access
    //     if (user.globalAdmin == true) {
    //         // Check if formatted correctly
    //         if (input.length == 1) {
    //             interaction.reply("This command requires a channel id and one or more premission commands to be correctly formatted")
    //             return
    //         }
    //         else if (input.length > 1) {
    //             // Check if server is already in ChannelBlacklist table
    //             prem = await this.database.getChannelPermissions(input[0])
    //             console.log(prem)
    //             let channel = bot.channels.cache.get(input[0])
    //             // If it isn't create a default
    //             if (prem == null) {
    //                 prem = {
    //                     id: input[0],
    //                     name: (channel as GuildChannel).name,
    //                     blockElo: -1,
    //                     blockCommands: -1,
    //                     blockReplay: -1,
    //                     blockChannelElo: -1,
    //                     blockServerElo: -1,
    //                     blockGlobalElo: -1
    //                 }
    //             }
    //             // Update the settings
    //             for (let x = 1; x < input.length; x++) {
    //                 let command = input[x]
    //                 switch (command) {
    //                     case "blockElo":
    //                         prem.blockElo = 1
    //                         break;
    //                     case "blockCommands":
    //                         prem.blockCommands = 1
    //                         break;
    //                     case "blockReplay":
    //                         prem.blockReplay = 1
    //                         break;
    //                     case "blockChannelElo":
    //                         prem.blockChannelElo = 1
    //                         break;
    //                     case "blockServerElo":
    //                         prem.blockServerElo = 1
    //                         break;
    //                     case "blockGlobalElo":
    //                         prem.blockGlobalElo = 1
    //                         break;
    //                     case "blockall":
    //                         prem.blockElo = 1
    //                         prem.blockCommands = 1
    //                         prem.blockReplay = 1
    //                         prem.blockChannelElo = 1
    //                         prem.blockServerElo = 1
    //                         prem.blockGlobalElo = 1
    //                         break;
    //                     default:
    //                         console.log("we in in default of the case statement" + command);
    //                         interaction.reply("One of the permission settings is not a valid command");
    //                 }
    //             }
    //             await this.database.setChannelPermissions(prem);
    //             MsgHelper.replyPing(interaction, "The permission settings of Discord channel " + (channel as GuildChannel).name + " has been updated ")
    //         }
    //         else {
    //             interaction.reply("This command is not correctly formatted, it requires one channel as a argument");
    //             return
    //         }

    //     }
    //     else {
    //         interaction.reply("You do not have the admin access to use this command")
    //         return
    //     }
    // }
    // private async resetChannelPrems(interaction: Message, input: string[]) {
    //     let channel = DiscordBot.bot.channels.cache.get(input[0])
    //     if (input.length === 1) {
    //         let prem = {
    //             id: input[0],
    //             name: (channel as GuildChannel).name,
    //             blockElo: -1,
    //             blockCommands: -1,
    //             blockReplay: -1,
    //             blockChannelElo: -1,
    //             blockServerElo: -1,
    //             blockGlobalElo: -1
    //         }
    //         await this.database.setChannelPermissions(prem);
    //         MsgHelper.replyPing(interaction, "The permission settings of Discord channel " + (channel as GuildChannel).name + " has been reset back to default settings.")
    //     }
    //     else {
    //         MsgHelper.replyPing(interaction, "Command not formatted correctly, this command just takes a channel id only as its argument")
    //     }
    // }

    // private async setReplayChannel(interaction: Message, input: string[]) {
    //     //Check if requestor has admin access
    //     if (!this.checkAccess(interaction)) {
    //         interaction.reply("You do not have the admin access to use this command");
    //         return;
    //     }
    //     // Check if formatted correctly
    //     if (input.length != 1) {
    //         interaction.reply("Try channel <replays Type>");
    //         return
    //     }
    //
    //     let server: DiscordServer = await this.database.getServer(interaction.guild.id) ?? new DiscordServer(interaction.guild.id);
    //
    //     this.addChannel(interaction, input, server);
    //     // this.database.putServer(server);
    // }

    // private addChannel(interaction: Message, input: string[], server: DiscordServer): void {
    //     if (this.defaultReplayTypes.includes(input[0])) {
    //         server.channels.set(interaction.channel.id, { defaultRules: true, tournamentType: input[0] });
    //     }
    //     else {
    //         server.channels.set(interaction.channel.id, { defaultRules: false, tournamentType: "other" });
    //     }
    // }

    // private checkAccess(interaction: Message): boolean {
    //     return this.admins.some(adminID => interaction.author.id === adminID);
    // }
    public addCommands(bot: DiscordBot): void {
        // bot.registerCommand(new SlashCommandBuilder().setName("setChanne"))
        //
        // bot.registerCommand("adjustelo", { data:  this.adjustElo.bind(this));
        // bot.registerCommand("setadmin", this.setAdmin.bind(this));
        // bot.registerCommand("setchannel", this.setChannelPrems.bind(this));
        // bot.registerCommand("resetchannel", this.resetChannelPrems.bind(this));
    }
}
