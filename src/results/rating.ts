import { Connection, Request, TediousType, TYPES } from 'tedious'
import { Message, MessageEmbed } from "discord.js"
import * as axios from "axios"
import { SqlHelper } from "../general/sqlHelper";
import { DiscordBot } from "../general/discordBot";

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


  static async getPlayerElo(eugenId:number): Promise<PlayerDetails> {
    console.log("It gets to getPlayerELO");
    const xx = await SqlHelper.exec("Select * from players where id = '" + eugenId + "';");
    console.log("Back from sql")
    if(xx.rows.length > 0){
      const x = xx.rows[0];
      console.log(x.id.value);
      return {
        id: String(x.id.value),
        elo: x.elo.value as number,
        pickBanElo: x.pickBanElo.value as number,
      }
    }
    // Only here in case we have a user without a entry in the players table
    console.log("No player found, need to create record")
    RatingEngine.createPlayerElo(eugenId);
    const yy = await SqlHelper.exec("Select * from players where id = '" + eugenId + "';")
    if(xx.rows.length > 0){
      const x = xx.rows[0];
      console.log(x);
      return {
        id: String(x.id.value),
        elo: x.elo.value as number,
        pickBanElo: x.pickBanElo.value as number,
      }
    }
    return null
  }

  static async createPlayerElo(eugenId: number) {
    const data = {
      playerId: eugenId
    }
      await SqlHelper.exec(SqlHelper.addPlayerEloSql,data,{playerId:TYPES.Int})
      return 
  }

}



export interface PlayerDetails {
  id: string,
  elo: number,
  pickBanElo: number
}

export interface RatedGame {
  newP1Elo: number,
  NewP2Elo: number,
  p1EloChange: number,
  P2EloChange: number
}