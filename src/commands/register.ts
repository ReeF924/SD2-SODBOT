import { Message } from "discord.js";
import { DiscordBot, MsgHelper } from "../general/discordBot";
import * as Data from "sd2-data"
import { AsciiTable3 } from "ascii-table3/ascii-table3";
import { CommonUtil } from "../general/common";
import { Logs } from "../general/logs";
import { MessageEmbed } from "discord.js";

export class RegisterCommand {

    //Register a new player to the BOT Database
    static registerPlayer(message:Message,input:string[]):void {
        console.log(input[0])
        Logs.log("command register with Inputs "+JSON.stringify(input));
        
        if(input.length == 0){
            message.reply("This command requires a EugenID to work");
        }else{
            const eugenid = input[0].toLowerCase();
            message.reply("Player's EugenID to be registered is " + input[0]);
            return
        }

    }


    //Update the player details (Discord UserName and EugenID)
    static updatePlayer(message:Message,input:string[]):void {

    }


    //Return Player details DiscordID, Discord Username, EugenID, ELO
    static playerDetails(message:Message,input:string[]):void {

    }
}

export class RegisterCommandHelper {
    static addCommands(bot:DiscordBot):void{
        bot.registerCommand("register",RegisterCommand.registerPlayer);
        bot.registerCommand("updateplayer",RegisterCommand.updatePlayer);
        bot.registerCommand("playerdetails",RegisterCommand.playerDetails);
    }
}