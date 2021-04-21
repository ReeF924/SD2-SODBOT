import { Message, ReactionUserManager, User } from "discord.js";
import { DiscordBot, MsgHelper } from "../general/discordBot";
import * as Data from "sd2-data"
import { CommonUtil } from "../general/common";
import { Logs } from "../general/logs";
import { MessageEmbed } from "discord.js";
import { SqlHelper } from "../general/sqlHelper";
import { RatingEngine } from "../results/rating";
import { misc } from "sd2-data";
import { Console } from "node:console";

export class AdminCommand {

    static async setAdmin(message:Message,input:string[]){
        console.log(message.author.id)
        if (message.author.id == "687898043005272096" || message.author.id == "271792666910392325"){
            console.log("You are a approver to set admin")
       
       
        }

    }





    static async adjustElo(message:Message,input:string[]){
        
        if (message.author.id == ""){
            
        
            if (input.length < 3){
                console.log("Not enough arguments")
                message.reply("This command requires three arguments EugenID, newLeague ELO, New Global ELO")
            }
        }
    }

}



export class AdminCommandHelper {
    static addCommands(bot:DiscordBot):void{
        bot.registerCommand("adjustelo",AdminCommand.adjustElo);
        bot.registerCommand("setadmin",AdminCommand.setAdmin);
    }
}
