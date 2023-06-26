import { Client, Message, GuildChannel, GuildMember } from "discord.js";
import { DiscordBot, MsgHelper } from "../general/discordBot";
import { Logs } from "../general/logs";
import { DB } from "../general/db";
import { DiscordServer } from "../general/db";
// import {redis} from "redis";
export class AdminCommand {
    //Only RoguishTiger or Kuriosly can set Admin rights 
    //ReeF: added myself for the tests, maybe for later use, dunno how active is Kuriosly
    private admins:string[] = ["687898043005272096" , "271792666910392325", "607962880154927113"];
    private async setAdmin(message: Message, input: string[]) {
        if (this.admins.some(adminId => message.author.id == adminId)) {
            //Check for argument
            if (input.length == 1) {
                (async () => {
                    //Get user from the DiscordUsers Table
                    let user = await DB.getDiscordUser(input[0])
                    const discordUser = await DiscordBot.bot.users.fetch(String(input[0]))
                    //If user is already registered up their Admin permisson
                    if (user) {
                        if (user.globalAdmin == false) {
                            user.globalAdmin = (true)
                            await DB.setDiscordUser(user);
                            MsgHelper.reply(message, "Discord account " + discordUser.username + " has been updated with global admin access")
                            Logs.log("Changed globalAdmin access to user " + discordUser.username + " to true")
                            return
                        }
                        else if (user.globalAdmin == true) {
                            console.log("User's GlobalAdmin setting is already set to " + user.globalAdmin)
                            MsgHelper.reply(message, "The user already has global admin access!")
                            return
                        }
                    }
                    //If user is not registered
                    else {
                        MsgHelper.reply(message, "This user is not currently registered to the bot, they must first register before you can add them as a admin")
                        return
                    }
                })()
            }
        }
    }
    private async adjustElo(message: Message, input: string[]) {
        let user = await DB.getDiscordUser(message.author.id)
        //Check if requestor has admin access
        if (user.globalAdmin == true) {
            //Check that the command is correctly formatted
            if (input.length < 3) {
                console.log("Not enough arguments")
                message.reply("This command requires three arguments EugenID, New League ELO, New Global ELO.  All seperated by commas")
                return
            }
            else if (input.length == 3) {
                let eugenId = input[0]
                let newLeagueElo = input[1]
                let newGlobalElo = input[2]
                //await DB.setPlayer(eugenId, newLeagueElo, newGlobalElo);
                //message.reply("Eugen Acct "+eugenId+ " has been updated with LeagueELO "+newLeagueElo+" and GlobalELO "+newGlobalElo)
                return
            }
            else {
                message.reply("This command is not correctly formatted, it requires three arguments EugenID, New League ELO, New Global ELO.  All seperated by commas")
            }
        }
        else {
            message.reply("You do not have the admin access to use this command")

        }
    }
    private async setChannelPrems(message: Message, input: string[]) {
        let user = await DB.getDiscordUser(message.author.id)
        let prem = {
            id: "",
            name: "",
            blockElo: 0,
            blockCommands: 0,
            blockReplay: 0,
            blockChannelElo: 0,
            blockServerElo: 0,
            blockGlobalElo: 0
        }
        //Check if requestor has admin access
        if (user.globalAdmin == true) {
            // Check if formatted correctly
            if (input.length == 1) {
                message.reply("This command requires a channel id and one or more premission commands to be correctly formatted")
                return
            }
            else if (input.length > 1) {
                // Check if server is already in ChannelBlacklist table
                prem = await DB.getChannelPermissions(input[0])
                console.log(prem)
                let channel = DiscordBot.bot.channels.cache.get(input[0])
                // If it isn't create a default
                if (prem == null) {
                    prem = {
                        id: input[0],
                        name: (channel as GuildChannel).name,
                        blockElo: -1,
                        blockCommands: -1,
                        blockReplay: -1,
                        blockChannelElo: -1,
                        blockServerElo: -1,
                        blockGlobalElo: -1
                    }
                }
                // Update the settings
                for (let x = 1; x < input.length; x++) {
                    let command = input[x]
                    switch (command) {
                        case "blockElo":
                            prem.blockElo = 1
                            break;
                        case "blockCommands":
                            prem.blockCommands = 1
                            break;
                        case "blockReplay":
                            prem.blockReplay = 1
                            break;
                        case "blockChannelElo":
                            prem.blockChannelElo = 1
                            break;
                        case "blockServerElo":
                            prem.blockServerElo = 1
                            break;
                        case "blockGlobalElo":
                            prem.blockGlobalElo = 1
                            break;
                        case "blockall":
                            prem.blockElo = 1
                            prem.blockCommands = 1
                            prem.blockReplay = 1
                            prem.blockChannelElo = 1
                            prem.blockServerElo = 1
                            prem.blockGlobalElo = 1
                            break;
                        default:
                            console.log("we in in default of the case statement" + command);
                            message.reply("One of the permission settings is not a valid command");
                    }
                }
                await DB.setChannelPermissions(prem);
                MsgHelper.reply(message, "The permission settings of Discord channel " + (channel as GuildChannel).name + " has been updated ")
            }
            else {
                message.reply("This command is not correctly formatted, it requires one channel as a argument");
                return
            }

        }
        else {
            message.reply("You do not have the admin access to use this command")
            return
        }
    }
    private async resetChannelPrems(message: Message, input: string[]) {
        let channel = DiscordBot.bot.channels.cache.get(input[0])
        if (input.length == 1) {
            let prem = {
                id: input[0],
                name: (channel as GuildChannel).name,
                blockElo: -1,
                blockCommands: -1,
                blockReplay: -1,
                blockChannelElo: -1,
                blockServerElo: -1,
                blockGlobalElo: -1
            }
            await DB.setChannelPermissions(prem);
            MsgHelper.reply(message, "The permission settings of Discord channel " + (channel as GuildChannel).name + " has been reset back to default settings.")
        }
        else {
            MsgHelper.reply(message, "Command not formatted corrctly, this command just takes a channel id only as its argument")
        }
    }
    private async setPrimaryMode(message: Message, input: string[]) {
        if (!(message.member instanceof GuildMember)) {
            const user = await DB.getDiscordUser(message.author.id);
            if(user.globalAdmin == false){
                message.reply("Only server admin can change the primary mode");
                return;
            }
        }
        if (input.length > 1) {
            message.reply("Invalid arguments for method set primary mode.");
            return;
        }
        const serverId: string = message.guild.id;
        


    }
    public addCommands(bot: DiscordBot): void {
        bot.registerCommand("adjustelo", this.adjustElo);
        bot.registerCommand("setadmin", this.setAdmin);
        bot.registerCommand("setchannel", this.setChannelPrems);
        bot.registerCommand("resetchannel", this.resetChannelPrems);
        bot.registerCommand("setPrimaryMode", this.setPrimaryMode);
    }
}
