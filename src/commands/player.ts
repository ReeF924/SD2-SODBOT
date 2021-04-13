import { Message } from "discord.js";
import { DiscordBot, MsgHelper } from "../general/discordBot";
import * as Data from "sd2-data"
import { CommonUtil } from "../general/common";
import { Logs } from "../general/logs";
import { MessageEmbed } from "discord.js";
import { SqlHelper } from "../general/sqlHelper";
import { RatingEngine } from "../results/rating";

export class PlayerCommand {
    static getPlayer(message:Message,input:string[]):void {
        if(input.length == 0)
            (async () => {
                const discordUser = await SqlHelper.getDiscordUser(message.author.id)
                console.log(discordUser.playerId)       
                const playerdetails = await RatingEngine.getPlayerElo(discordUser.playerId);
                
                const embed = new MessageEmbed()
                .setTitle("Player Details")
                .setColor("75D1EA")
                .addFields([
                    {name:"Player Name", value: message.author.username,inline:false},
                    {name:"Eugen Id", value: playerdetails.id,inline:false},
                    {name:"League Rating", value: playerdetails.elo,inline:true},
                    {name:"PickBanElo", value: playerdetails.pickBanElo,inline:true},
                ])
                message.channel.send(embed);
            })()

    }

    static submitRating(message:Message, input:string[]):void{
        (async () => {
            const newGameRating = await RatingEngine.rateMatch(message, 1471338, 1442542, 1, 0)
            console.log(newGameRating) 
        })()
    }

}

export class PlayerCommandHelper {
    static addCommands(bot:DiscordBot):void{
        bot.registerCommand("player",PlayerCommand.getPlayer);
        bot.registerCommand("rating",PlayerCommand.submitRating);
    }
}