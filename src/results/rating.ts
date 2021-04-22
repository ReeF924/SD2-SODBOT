import { Connection, Request, TediousType, TYPES } from 'tedious'
import { Message, MessageEmbed } from "discord.js"
import * as axios from "axios"
import { Elos, Player, SqlHelper } from "../general/sqlHelper";
import { DiscordBot } from "../general/discordBot";
import { Logs } from '../general/logs';

const k_value = 32;

export class RatingEngine {
    
  static async rateMatch(message: Message, p1uid:string, p2uid:string, p1Score:number, p2Score:number ): Promise<RatedGame> {
    console.log("Have arrived in rateMatch")


    const p1Elo = await RatingEngine.getPlayerElo(p1uid,message)
    const p2Elo = await RatingEngine.getPlayerElo(p2uid,message)
    

    const newP1Elo =
      p1Elo.globalElo + k_value * (p1Score - RatingEngine.getChanceToWin(p1Elo.globalElo, p2Elo.globalElo));
    const newP2Elo =
      p2Elo.globalElo + k_value * (p2Score - RatingEngine.getChanceToWin(p2Elo.globalElo, p1Elo.globalElo));
    
    const p1EloChange = newP1Elo - p1Elo.globalElo;
    const p2EloChange = newP2Elo - p2Elo.globalElo;

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

  static async getPlayerElo(discordId:string,message:Message):Promise<Elos>{
    return SqlHelper.getElos(discordId,message.channel.id,message.guild.id)
  }

  static async createLadder(){
    const ladder = [];
    var numPlayers = 0
    var pName = ""
    var pId = ""
    var pElo = ""
    const playerList = await SqlHelper.getGlobalLadder();
    Logs.log("Number of players's returned "+playerList.length)
    if (playerList.length < 100){
        numPlayers = playerList.length
    }else{
        numPlayers = 100
    }
    // Run through list of players
    for (let i = 0; i < numPlayers; i++){
        
        const x = playerList[i]
      
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
  }
  
}

export interface RatedGame {
  newP1Elo: number,
  NewP2Elo: number,
  p1EloChange: number,
  P2EloChange: number
}

export interface EloLadderElement {
  name:string,
  pos: number,
  elo: number,
  lastActive: Date
}