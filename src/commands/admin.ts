import { Client, Message, GuildChannel } from "discord.js";
import { Console } from "node:console";
import { DiscordBot, MsgHelper } from "../general/discordBot";
import { Logs } from "../general/logs";
import { SqlHelper } from "../general/sqlHelper";

export class AdminCommand {

    static async setAdmin(message:Message, input:string[]){
        //Only RoguishTiger or Kuriosly can set Admin rights
        if (message.author.id == "687898043005272096" || message.author.id == "271792666910392325"){
            //Check for argument
            if(input.length == 1){
                (async () => {
                    //Get user from the DiscordUsers Table
                    let user = await SqlHelper.getDiscordUser(input[0])
                    const discordUser = await DiscordBot.bot.users.fetch(String(input[0]))
                    //If user is already registered up their Admin permisson
                    if(user){
                        if(user.globalAdmin == false){
                            user.globalAdmin =(true)
                            await SqlHelper.setDiscordUser(user);
                            MsgHelper.reply(message,"Discord account " + discordUser.username +" has been updated with global admin access")
                            Logs.log("Changed globalAdmin access to user "+ discordUser.username + " to true")
                            return
                        }
                        else if (user.globalAdmin == true){
                            console.log("User's GlobalAdmin setting is already set to "+user.globalAdmin)
                            MsgHelper.reply(message,"The user already has global admin access!")
                            return
                        }
                    }
                    //If user is not registered
                    else{
                        MsgHelper.reply(message,"This user is not currently registered to the bot, they must first register before you can add them as a admin")
                        return
                    }
                })()
            }
        }
    }


    static async adjustElo(message:Message,input:string[]){
        let user = await SqlHelper.getDiscordUser(message.author.id)
        //Check if requestor has admin access
        if (user.globalAdmin == true){
            //Check that the command is correctly formatted
            if (input.length < 3){
                console.log("Not enough arguments")
                message.reply("This command requires three arguments EugenID, New League ELO, New Global ELO.  All seperated by commas")
                return
            }
            else if (input.length == 3){
                let eugenId = input[0]
                let newLeagueElo = input[1]
                let newGlobalElo = input[2]
                //await SqlHelper.setPlayer(eugenId, newLeagueElo, newGlobalElo);
                //message.reply("Eugen Acct "+eugenId+ " has been updated with LeagueELO "+newLeagueElo+" and GlobalELO "+newGlobalElo)
                return
            }
            else{
                message.reply("This command is not correctly formatted, it requires three arguments EugenID, New League ELO, New Global ELO.  All seperated by commas")
            }
        }
        else{
            message.reply("You do not have the admin access to use this command")

        }
    }


    static async setChannelPrems(message:Message, input:string[]){
        let user = await SqlHelper.getDiscordUser(message.author.id)
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
        if (user.globalAdmin == true){
            // Check if formatted correctly
            if (input.length == 1){
                message.reply("This command requires a channel id and one or more premission commands to be correctly formatted")
                return
            }
            else if (input.length > 1){
                // Check if server is already in ChannelBlacklist table
                prem = await SqlHelper.getChannelPermissions(input[0])
                console.log(prem)
                let channel = DiscordBot.bot.channels.cache.get(input[0]) 
                // If it isn't create a default
                if (prem == null){
                    prem = {
                        id: input[0],
                        name:(channel as GuildChannel).name,
                        blockElo: 0,
                        blockCommands: 0,
                        blockReplay: 0,
                        blockChannelElo: 0,
                        blockServerElo: 0,
                        blockGlobalElo: 0
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
                await SqlHelper.setChannelPermissions(prem);
                MsgHelper.reply(message,"The permission settings of Discord channel " + (channel as GuildChannel).name +" has been updated ")
            }
            else {
                message.reply("This command is not correctly formatted, it requires one channel as a argument");
                return
            }

        }
        else{
            message.reply("You do not have the admin access to use this command")
            return
        }
    }
}



export class AdminCommandHelper {
    static addCommands(bot:DiscordBot):void{
        bot.registerCommand("adjustelo",AdminCommand.adjustElo);
        bot.registerCommand("setadmin",AdminCommand.setAdmin);
        bot.registerCommand("setchannel",AdminCommand.setChannelPrems);
    }
}
