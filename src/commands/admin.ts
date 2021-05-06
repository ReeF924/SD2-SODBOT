import { Message } from "discord.js";
import { DiscordBot, MsgHelper } from "../general/discordBot";
import { Logs } from "../general/logs";
import { SqlHelper } from "../general/sqlHelper";

export class AdminCommand {

    static async setAdmin(message:Message,input:string[]){
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


    static async setPrem(message:Message,input:string[]){
        let user = await SqlHelper.getDiscordUser(message.author.id)
        //Check if requestor has admin access
        if (user.globalAdmin == true){
            // Check if formatted correctly
            if (input.length == 1){
                message.reply("This command requires a channel id and one or more premission commands to be correctly formatted")
                return
            }
            else if (input.length > 1){
                let channel = input[0]
                let x = 1
                for (const command of  input) {
                    switch (command) {
                        case "blockElo":
                            
                            break;
            
                        case "blockCommands":
                            
                            break;

                        case "blockReplay":
                            
                            break;
                        
                        case "blockChannelElo":
                            
                            break;

                        case "blockServerElo":
                            
                            break;

                        case "blockGlobalElo":
                            
                            break;

                        case "blockall":

                            break;

                        default:
                            message.reply("Sorry that is not a valid command")
                    }



                }
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
        bot.registerCommand("setchannel",AdminCommand.setPrem);
    }
}
