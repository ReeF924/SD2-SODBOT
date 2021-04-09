import { DMChannel, Message } from "discord.js";
import { DiscordBot, MsgHelper } from "../general/discordBot";
import { Logs } from "../general/logs";
import { MessageEmbed } from "discord.js";

export class HelpCommand {

    static help(message:Message,input:string[]):void {
        const dm = message.author.createDM();
        
        if (input.length == 0){
            let embed = new MessageEmbed().setTitle("-- Help --");
            embed = embed.setColor(3447003);

            embed = embed.addFields(
                {name:"$Help", value:"This list of help information"}
            )
            
        }


    }    
            
}

export class HelpCommandHelper {
    static addCommands(bot:DiscordBot):void{
        bot.registerCommand("help",HelpCommand.help);
    
    }
}




