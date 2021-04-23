import { Connection, Request, TediousType, TYPES } from 'tedious'
import { Message, MessageEmbed } from "discord.js"
import * as axios from "axios"
import { Elos, ElosDelta, Player, SqlHelper } from "../general/sqlHelper";
import { DiscordBot } from "../general/discordBot";
import { Logs } from '../general/logs';



export class RatingEngine {

  static k_value = 32;
    
  static rateMatch(p1:Elos, p2:Elos, victor:number ): {p1:ElosDelta,p2:ElosDelta} {
    console.log("Have arrived in rateMatch")
    const global = RatingEngine.generateElo(p1.globalElo,p2.globalElo,victor)
    const server = RatingEngine.generateElo(p1.serverElo,p2.serverElo,victor)
    const channel = RatingEngine.generateElo(p1.channelElo,p2.channelElo,victor)
    const p1x = p1 as ElosDelta;
    const p2x = p2 as ElosDelta;
    p1x.globalElo = global.p1Elo
    p1x.globalDelta = global.p1EloDelta
    p2x.globalElo = global.p2Elo
    p2x.globalDelta = global.p2EloDelta
    p1x.serverElo = server.p1Elo
    p1x.serverDelta = server.p1EloDelta
    p2x.serverElo = server.p2Elo
    p2x.serverDelta = server.p2EloDelta
    p1x.channelElo = channel.p1Elo
    p1x.channelDelta = channel.p1EloDelta
    p2x.channelElo = channel.p2Elo
    p2x.channelDelta = channel.p2EloDelta
    return {p1:p1x, p2:p2x}

  }

  /**
  /@param gameState: 0 for p1 loss, 1 for p1 win, .5 for draw...
  **/
  static generateElo(p1Elo:number, p2Elo:number,gameState:number):{p1Elo:number,p1EloDelta:number,p2Elo:number,p2EloDelta:number}{
    const newP1Elo =
       RatingEngine.k_value * (gameState - RatingEngine.getChanceToWin(p1Elo, p2Elo));
    const newP2Elo =
       RatingEngine.k_value * ((1-gameState) - RatingEngine.getChanceToWin(p2Elo, p1Elo));
    return {p1Elo:(p1Elo + newP1Elo), p1EloDelta: newP1Elo,p2Elo:(p2Elo + newP2Elo), p2EloDelta:newP2Elo}
  }



  static getChanceToWin(a:number, b:number): number {
    const c = (1 / (1 + Math.pow(10, (b - a) / 400)));
    return c;    
  }

  static async getPlayerElo(discordId:string,message:Message):Promise<Elos>{
    return SqlHelper.getDiscordElos(discordId,message.channel.id,message.guild.id)
  }

  static async createLadder(){
    return await SqlHelper.getGlobalLadder();
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