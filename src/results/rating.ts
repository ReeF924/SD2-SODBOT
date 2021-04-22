import { Connection, Request, TediousType, TYPES } from 'tedious'
import { Message, MessageEmbed } from "discord.js"
import * as axios from "axios"
import { SqlHelper } from "../general/sqlHelper";
import { DiscordBot } from "../general/discordBot";
import { Logs } from '../general/logs';

const k_value = 32;

export class RatingEngine {
    
  static async rateMatch(message: Message, p1uid:number, p2uid:number, p1Score:number, p2Score:number ): Promise<RatedGame> {
    console.log("Have arrived in rateMatch")
    var p1Elo:PlayerDetails
    var p2Elo:PlayerDetails


    p1Elo = await RatingEngine.getPlayerElo(p1uid)
    p2Elo = await RatingEngine.getPlayerElo(p2uid)
    
    console.log(p1Elo.id)
    console.log(p2Elo.id)

    const newP1Elo =
      p1Elo.elo + k_value * (p1Score - RatingEngine.getChanceToWin(p1Elo.elo, p2Elo.elo));
    const newP2Elo =
      p2Elo.elo + k_value * (p2Score - RatingEngine.getChanceToWin(p2Elo.elo, p1Elo.elo));
    
    const p1EloChange = newP1Elo - p1Elo.elo;
    const p2EloChange = newP2Elo - p2Elo.elo;

    return {
      newP1Elo: newP1Elo as number,
      NewP2Elo: newP2Elo as number,
      p1EloChange: p1EloChange as number,
      P2EloChange: p2EloChange as number
    }
  }

  static getChanceToWin(a:number, b:number): number {
    const c = (1 / (1 + Math.pow(10, (b - a) / 400)));
    return c;    
  }


  static createLadder():[EloLadderElement]{
    const ladder = [];
    var numPlayers = 0
    var pName = ""
    var pId = ""
    var pElo = ""
    const playerList = await SqlHelper.exec()
    Logs.log("Number of players's returned "+playerList.rows.length)
    if (playerList.rows.length < 100){
        numPlayers = playerList.rows.length
    }else{
        numPlayers = 100
    }
    // Run through list of players
    for (let i = 0; i < numPlayers; i++){
        
        const x = playerList.rows[i]
        Logs.log(x.id.value)
        const p1 = await SqlHelper.exec("SELECT id FROM discordUsers WHERE playerId = '" +x.id.value+ "' ;")
        Logs.log("How many rows returned "+p1.rows.length)
        if (p1.rows.length == 1){
            const p1Id = p1.rows[0]
            Logs.log(p1Id.id.value)
            const discordUser = await DiscordBot.bot.users.fetch(String(p1Id.id.value))
            Logs.log("Get the DiscordUser name "+discordUser.username)
            Logs.log("Discord User ID "+discordUser.id)

            pName += discordUser.username + "\n";
            pId += x.id.value + "\n";
            pElo += x.elo.value + "\n";
        }
    }
    //Create and send the embed
    const embed = new MessageEmbed();
    embed.setTitle("Player Ranking")
    embed.setColor("75D1EA")
    embed.addFields([
        {name:"Player Name", value: pName,inline:true},
        {name:"Eugen Id", value: pId,inline:true},
        {name:"SDL Rating", value: pElo,inline:true}
    ])
    return ladder

  }
  
}

export interface RatedGame {
  newP1Elo: number,
  NewP2Elo: number,
  p1EloChange: number,
  P2EloChange: number
}