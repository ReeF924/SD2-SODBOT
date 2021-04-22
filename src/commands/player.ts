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

export class PlayerCommand {
    
    static async getPlayer(message:Message,input:string[]){
        const embed = new MessageEmbed();
        var playerName:User
        var eugenId
        var leagueElo
        var globalElo
        //Check that no arguments are present
        if(input.length == 0){
            //Get the message author's id
            const discordUser = await SqlHelper.getDiscordUser(message.author.id)
            //Check that you received a id back from the DB    
            if(discordUser.playerId == null ){
                MsgHelper.reply(message,`You are not currently registered to the bot, please use $register "EugenId" to register to the bot`)
                return
            }
            //Get the player's details
            const playerDetails = await RatingEngine.getPlayerElo(discordUser.id,message)
            playerName = await DiscordBot.bot.users.fetch(String(message.author.id))
            eugenId = playerDetails.eugenId
            leagueElo = playerDetails.globalElo
            globalElo = playerDetails.pickBanGlobalElo

        // If there is a argument, then we are getting another player's details
        } else if(input.length == 1){
            const p1 = input[0].slice(3,-1)
            const discordUser = await SqlHelper.getDiscordUser(p1) 
            // Check that you received back player discord id    
            if(discordUser == null ){
                MsgHelper.reply(message,`That player is not currently registered to the bot, the player needs to use $register "EugenId" to register to the bot`)
                return
            }
            // Get player details from DB
            const playerDetails = await RatingEngine.getPlayerElo(discordUser.id,message)
            playerName = await DiscordBot.bot.users.fetch(String(p1))
            eugenId = playerDetails.eugenId
            leagueElo = playerDetails.globalElo
            globalElo = playerDetails.pickBanGlobalElo
        // If there is more than 1 argument then the command is not valid
        } else if (input.length > 1){
            MsgHelper.reply(message,`This command can only query 1 player at a time`)
            return
        }   
        // Create the Embed
        embed.setTitle("Player Details")
        embed.setColor("75D1EA")
        embed.addFields([
            {name:"Player Name", value: playerName,inline:false},
            {name:"Eugen Id", value: eugenId,inline:false},
            {name:"SDL Rating", value: leagueElo,inline:true},
            {name:"Global Elo", value: globalElo,inline:true},
            {name:"\u200b", value: "\u200b",inline:true}
        ]);
        // Extract recent games
        const xx = await SqlHelper.exec("SELECT * FROM replays WHERE JSON_VALUE(cast([replay] as nvarchar(max)), '$.players[0].id') LIKE '" +eugenId+ "' OR JSON_VALUE(cast([replay] as nvarchar(max)), '$.players[1].id') LIKE '" +eugenId+ "';")
        let opponent = "";
        let gameMap = "";
        let gameResult = "";
        let numGames = 0;
        //Check that rows were returned
        if(xx.rows.length > 0 ){  
            if(xx.rows.length > 5){
                numGames = 5;
            } else {
                numGames = xx.rows.length;
            } 
            for (let i = 0; i < numGames; i++) {        
                const x = xx.rows[i];
                try{
                    const replayString = x.replay.value as string;
                    const replayJson = JSON.parse(replayString);

                    console.log(replayJson.players.length)

                //Check that each row is a 1v1 match    
                if (replayJson.players.length == 2){
                    //identify who the opponent was
                    if (replayJson.players[0].id != eugenId){
                        opponent += replayJson.players[0].name + "\n";
                    }else{
                        opponent += replayJson.players[1].name + "\n";
                    }
                    //Identify the map played
                    gameMap += misc.map[replayJson.map_raw] + "\n";
                    //Identify the result 
                    if (replayJson.result.victory > 3) {
                        for (const player of replayJson.players) {
                            if (replayJson.ingamePlayerId = player.alliance)
                                if (player.name = eugenId)
                                    gameResult += "Victory" + "\n"
                                    else
                                    gameResult += "Defeat" + "\n" 
                        }  
                    } else if (replayJson.result.victory < 3) {
                        for (const player of replayJson.players) {
                            if (replayJson.ingamePlayerId = player.alliance)
                                if (player.name = eugenId)
                                    gameResult += "Defeat" + "\n"
                                    else
                                    gameResult += "Victory" + "\n"
                                
                        }  
                    } else {
                           gameResult += "Draw" + "\n"
                    }
                }
                }catch(err){
                    console.log("Error happended here")
                    console.error(err)
                }
            }
            //Complete embed by adding recent matches
            embed.addFields([
                {name:"Most Recent 1v1 Games Uploaded To The Bot", value:"-----------------------------------------------------", inline:false},
                {name:"Opponent", value: opponent,inline:true},
                {name:"Map", value: gameMap, inline:true},
                {name:"Result", value: gameResult,inline:true}
            ])
        }
        else {
            console.log("No Games found")
        }
        //Send Final Embed
        message.channel.send(embed);
    }



    static async getLadder(message:Message, input:string[]){
        var numPlayers = 0
        var pName = ""
        var pPos = ""
        var pElo = ""
        const playerList = await SqlHelper.exec("SELECT * FROM players ORDER BY pickBanElo DESC;")
        console.log("Number of players's returned "+playerList.rows.length)
        if (playerList.rows.length < 100){
            numPlayers = playerList.rows.length
        }else{
            numPlayers = 100
        }
        // Run through list of players
        let y = 1
        for (let i = 0; i < numPlayers; i++){            
            const x = playerList.rows[i]
            const p1 = await SqlHelper.exec("SELECT id FROM discordUsers WHERE playerId = '" +x.id.value+ "' ;")
            if (p1.rows.length == 1){
                const p1Id = p1.rows[0]
                const discordUser = await DiscordBot.bot.users.fetch(String(p1Id.id.value))
    
                pPos += y + "\n"
                pName += discordUser.username + "\n";
                pElo += x.pickBanElo.value + "\n";
                y += 1
            }
        }
        //Create and send the embed
        console.log(message.guild.id)
        console.log(message.guild.name)
       
        const embed = new MessageEmbed();
        embed.setTitle("Player Ranking")
        embed.setColor("75D1EA")
        embed.addFields([
            {name:"Pos", value: pPos,inline:true},
            {name:"Player Name", value: pName,inline:true},
            {name:"ELO", value: pElo,inline:true}
        ])
        //Send Final Embed
        message.channel.send(embed);

    }


    static submitRating(message:Message, input:string[]):void{
        (async () => {
            const newGameRating = await RatingEngine.rateMatch(message, "1471338", "1442542", 1, 0)
            console.log(newGameRating) 
        })()
    }

}

export class PlayerCommandHelper {
    static addCommands(bot:DiscordBot):void{
        bot.registerCommand("player",PlayerCommand.getPlayer);
        bot.registerCommand("ladder",PlayerCommand.getLadder);
        bot.registerCommand("rating",PlayerCommand.submitRating); // purge this / secure this BEFORE we release.
    }
}