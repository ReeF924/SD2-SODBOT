import { Message } from "discord.js"
import { DB, Elos, ElosDelta } from "../general/db";
import { DeckData } from 'sd2-utilities/lib/parser/deckParser';


export class RatingEngine {
  private database:DB;
  constructor(database:DB){
    this.database = database;
  }
  private k_value = 32;
    
  public rateMatch(p1:Elos, p2:Elos, victor:number ): {p1:ElosDelta,p2:ElosDelta} {
    console.log("Have arrived in rateMatch")
    const global = this.generateElo(p1.globalElo,p2.globalElo,victor)
    const server = this.generateElo(p1.serverElo,p2.serverElo,victor)
    const channel = this.generateElo(p1.channelElo,p2.channelElo,victor)
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
  public generateElo(p1Elo:number, p2Elo:number,gameState:number):{p1Elo:number,p1EloDelta:number,p2Elo:number,p2EloDelta:number}{
    const newP1Elo =
       this.k_value * (gameState - this.getChanceToWin(p1Elo, p2Elo));
    const newP2Elo =
       this.k_value * ((1-gameState) - this.getChanceToWin(p2Elo, p1Elo));
    return {p1Elo:(p1Elo + newP1Elo), p1EloDelta: newP1Elo,p2Elo:(p2Elo + newP2Elo), p2EloDelta:newP2Elo}
  }

  public async doDivisionElo(deck1:DeckData,deck2:DeckData,victoryState:number){
      let div1 = this.database.getDivisionElo(Number(deck1.raw.division));
      let div2 = this.database.getDivisionElo(Number(deck2.raw.division));
      let elo, e1, e2;
      if(!(await div1)) e1 = 1500; else e1 = (await div1).elo;
      if(!(await div2)) e2 = 1500; else e2 = (await div1).elo;
      if(victoryState > 3){
        elo = this.generateElo(e1,e2,1)
      }else if(victoryState == 3){
        elo = this.generateElo(e1,e2,.5)
      }else if(victoryState < 3){
        elo = this.generateElo(e2,e1,1)
      }
      console.log(`div 1: ${deck1.division} div2: ${deck2.division}`)
      console.log(elo)
      await this.database.setDivisionElo({id:Number(deck1.raw.division),divName:deck1.division,elo:elo.p1Elo})
      await this.database.setDivisionElo({id:Number(deck2.raw.division),divName:deck2.division,elo:elo.p2Elo})
  }



  public getChanceToWin(a:number, b:number): number {
    const c = (1 / (1 + Math.pow(10, (b - a) / 400)));
    return c;    
  }

  public async getPlayerElo(discordId:string,message:Message):Promise<Elos>{
    return this.database.getDiscordElos(discordId,message.channel.id,message.guild.id)
  }

  public async createLadder(){
    return await this.database.getGlobalLadder();
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