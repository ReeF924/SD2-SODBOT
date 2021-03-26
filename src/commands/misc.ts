import { Message } from "discord.js";
import { DiscordBot, MsgHelper } from "../general/discordBot";

export class MiscCommand{
    static flip(message:Message,input:string[]){
        if(Math.random() > 0.5){
            MsgHelper.reply(message,"Heads");
        }else{
            MsgHelper.reply(message,"Tails");
        }
    }
    static faction(message:Message,input:string[]){
        if(Math.random() > 0.5){
            MsgHelper.reply(message,"Axis");
        }else{
            MsgHelper.reply(message,"Allied");
        }
    }
}

export class MiscCommandHelper{
    static addCommands(bot:DiscordBot){
        bot.registerCommand("flip",MiscCommand.flip);
        bot.registerCommand("faction",MiscCommand.faction);
    }
}
