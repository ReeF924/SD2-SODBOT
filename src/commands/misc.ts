import { Message } from "discord.js";
import { DiscordBot, MsgHelper } from "../general/discordBot";

export class MiscCommand{
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static flip(message:Message,input:string[]):void{
        if(Math.random() > 0.5){
            MsgHelper.reply(message,"Heads");
        }else{
            MsgHelper.reply(message,"Tails");
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static faction(message:Message,input:string[]):void{
        if(Math.random() > 0.5){
            MsgHelper.reply(message,"Axis");
        }else{
            MsgHelper.reply(message,"Allied");
        }
    }
}

export class MiscCommandHelper{
    static addCommands(bot:DiscordBot):void{
        bot.registerCommand("flip",MiscCommand.flip);
        bot.registerCommand("faction",MiscCommand.faction);
    }
}
