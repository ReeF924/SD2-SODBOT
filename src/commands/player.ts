import { Message, ReactionUserManager } from "discord.js";
import { DiscordBot, MsgHelper } from "../general/discordBot";
import * as Data from "sd2-data"
import { CommonUtil } from "../general/common";
import { Logs } from "../general/logs";
import { MessageEmbed } from "discord.js";
import { SqlHelper } from "../general/sqlHelper";
import { RatingEngine } from "../results/rating";

export class PlayerCommand {
    static getPlayer(message:Message,input:string[]):void {
        
        if(input.length == 0){
            (async () => {
                const discordUser = await SqlHelper.getDiscordUser(message.author.id)
                console.log(discordUser.playerId)    
                if(discordUser.playerId == null ){
                    MsgHelper.reply(message,`The player is not currently registered to the bot, please use $register "EugenId" to register to the bot`)
                    return
                }

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
            return
        } else if(input.length == 1){
            (async () => {
                console.log(input[0])
                const p1 = input[0].slice(3)
                console.log(p1) 
                const discordUser = await SqlHelper.getDiscordUser(p1)
                console.log(discordUser)    
                if(discordUser == null ){
                    MsgHelper.reply(message,`That player is not currently registered to the bot, the player needs to use $register "EugenId" to register to the bot`)
                    return
                }

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
        } else if (input.length > 1){
            MsgHelper.reply(message,`This command can only query 1 player at a time`)
            return
        }   
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