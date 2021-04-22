import { Connection, Request, TediousType, TYPES } from 'tedious'
import { CommonUtil } from './common';
import { Logs } from "./logs";
import * as fs from 'fs'
import { Message } from 'discord.js';
import { RawGameData } from 'sd2-utilities/lib/parser/gameParser';
import { types } from 'node:util';

export class SqlHelper {

  static config = {
    authentication: {
      options: {
        userName: "",
        password: ""
      },
      type: "default"
    },
    server: "sodbotdb.database.windows.net",
    options: {
      database: "sodbot",
      encrypt: true,
      rowCollectionOnRequestCompletion: true,
      useColumnNames: true
    }
  }

  static connection: Connection


  //Functions by Table (matching createTables.sql)

  //players

  static async setPlayer(player:Player): Promise<DBObject> {
    const data = {
      id: player.id,
      elo: player.elo,
      pickBanElo: player.pickBanElo,
      impliedName: player.impliedName,
      lastPlayed: player.lastPlayed
      
    }
    return await SqlHelper.exec(SqlHelper.updatePlayerSql,data,{id:TYPES.Int,elo:TYPES.Float,pickBanElo:TYPES.Float,lastPlayed:TYPES.DateTime})
  }

  static async getPlayer(eugenId:number): Promise<Player> {
    const xx = await SqlHelper.exec("Select * from players where id = '" + eugenId + "';")
    if(xx.rows.length > 0){
      const x = xx.rows[0];
      return {
        id: Number(x.id.value),
        elo: Number(x.elo.value),
        pickBanElo: Number(x.pickBanElo.value),
        impliedName:  x.impliedName != null ? x.impliedName.value as string : null,
        lastPlayed: x.lastPlayed != null ? new Date(x.lastPlayed.value as Date) : null
      }
    }
    else
      return null;
  }

  //channel admin
  static async getChannelPermissions(channelId:number): Promise<ChannelPermissionSet>{
    const xx = await SqlHelper.exec("Select * from channelBlacklist where id = '" + channelId + "';")
    if(xx.rows.length > 0){
      const x = xx.rows[0];
      return {
        id : String(x.id.value),
        channelName : String(x.channelName.value),
        blockElo : Boolean(x.blockElo.value),
        blockCommands : Boolean (x.blockCommands.value),
        blockReplay : Boolean (x.blockReplay.value)
      }
    }
    else
      return null;
  }


  
  //elos

  static async getElos(discordId:string, channel:string, server:string):Promise<Elos>{
    const xx = await SqlHelper.exec(SqlHelper.getElosSql,{discordId:discordId,channelId:channel,serverId:server},{eugenId:TYPES.VarChar,channelId:TYPES.VarChar,serverId:TYPES.VarChar})
    if(xx.rows.length > 0){
      const x = xx.rows[0];
      return {
        eugenId: Number(x.eugenId.value),
        serverId: String(x.serverId.value),
        channelId: String(x.channelId.value),
        channelElo: x.channelElo ? Number(x.channelElo.value) : 1500,
        serverElo: x.serverElo ? Number(x.serverElo.value) : 1500,
        globalElo: Number(x.globalElo.value),
        pickBanGlobalElo: Number(x.pickBanGlobalElo.value),
        playerName: String(x.playerName.value)
      }
    }
    else
      return null;
  }

  static async setElos(elos:Elos):Promise<DBObject>{
    return await SqlHelper.exec(SqlHelper.updateElosSql,(elos as unknown as Record<string,unknown>),
    {eugenId: TYPES.Int, serverId: TYPES.VarChar,channelId: TYPES.VarChar,channelElo: TYPES.Float,serverElo: TYPES.Float,globalElo: TYPES.Float,pickBanGlobalElo: TYPES.Float,playerName: TYPES.Text})
  }

  static async setDivisionElo(elo:DivElo): Promise<DBObject>{
    const data = {
      id: elo.id,
      elo: elo.elo,
      divName: elo.divName
      
    }
    return await SqlHelper.exec(SqlHelper.updateDivEloSql,data,{id:TYPES.VarChar,elo:TYPES.Float,pickBanElo:TYPES.Float})
  }

  static async getDivisionElo(id:string):Promise<DivElo>{
    const xx = await SqlHelper.exec("Select * from divisionElo where id = '" + id + "';")
    if(xx.rows.length > 0){
      const x = xx.rows[0];
      return {
        id : String(x.id.value),
        divName : String(x.divName.value),
        elo : Number(x.elo.value),
      }
    }
    else
      return null;
  }
  //discordUser

  static async getDiscordUser(discordId: string): Promise<DiscordUser> {
    const xx = await SqlHelper.exec("Select * from discordUsers where id = '" + discordId + "';")

    if(xx.rows.length > 0){
      const x = xx.rows[0];
      return {
        id: String(x.id.value),
        playerId: x.playerId.value as number,
        serverAdmin: JSON.parse(x.serverAdmin.value as string),
        globalAdmin: Boolean(x.globalAdmin.value),
        impliedName: String(x.impliedName.value)
      }
    }
    else
      return null;
  }

  static async getDiscordUserFromEugenId(eugenId: number): Promise<DiscordUser> {
    const xx = await SqlHelper.exec("Select * from discordUsers where playerId =  "+ eugenId + ";")
    if(xx.rows.length > 0){
      const x = xx.rows[0];
      return {
        id: String(x.id.value),
        playerId: x.playerId.value as number,
        serverAdmin: JSON.parse(x.serverAdmin.value as string),
        globalAdmin: Boolean(x.globalAdmin.value),
        impliedName: String(x.impliedName.value)
      }
    }
    else
      return null;
  }

  static async setDiscordUser(user: DiscordUser): Promise<DBObject> {
    const data = {
      id: String(user.id),
      playerId: user.playerId,
      serverAdmin: "" + JSON.stringify(user.serverAdmin),
      globalAdmin: user.globalAdmin,
      impliedName: user.impliedName
    }
    console.log(data)
    return await SqlHelper.exec(SqlHelper.setDiscordUserSql,data,{id:TYPES.VarChar,playerId:TYPES.Int,globalAdmin:TYPES.Bit,serverAdmin:TYPES.Text,impliedName:TYPES.Text})
  }


  //Other functions


  static async getGlobalLadder(): Promise<Array<EloLadderElement>> {
    const sql = "SELECT players.id as eugenid, pickBanElo, discordUsers.id, impliedName as discordId FROM players LEFT JOIN discordUsers ON discordUsers.playerId = players.id ORDER BY players.pickBanElo DESC"
    const xx = await SqlHelper.exec(sql);
    const ret = new Array<EloLadderElement>();
    let r = 1;
    if(xx.rows.length > 0){
      const x = xx.rows[0];
      ret.push({
        rank: r,
        elo: Number(x.elo.value),
        discordId: String(x.discordId.value),
        name: String(x.impliedName.value)
      })
      r++;
    }
    return ret;
  }

  /*
  static async getPlayerElo(eugenId:number): Promise<Player> {
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
  */





  static setDiscordUserSql = ""
  static addReplaySql = ""
  static addPlayerEloSql = ""
  static updatePlayerSql = ""
  static updateDivEloSql = ""
  static updateElosSql = ""
  static getElosSql = ""


  static init(): void {
    SqlHelper.setDiscordUserSql = fs.readFileSync("sql/updateDiscordUser.sql").toLocaleString();
    SqlHelper.updatePlayerSql = fs.readFileSync("sql/updatePlayer.sql").toLocaleString();
    SqlHelper.addReplaySql = fs.readFileSync("sql/addReplay.sql").toLocaleString();
    SqlHelper.addPlayerEloSql = fs.readFileSync("sql/addNewPlayer.sql").toLocaleString();
    SqlHelper.addPlayerEloSql = fs.readFileSync("sql/updateDivElo.sql").toLocaleString();
    SqlHelper.getElosSql = fs.readFileSync("sql/getElos.sql").toLocaleString();
    SqlHelper.updateElosSql = fs.readFileSync("sql/updateElos.sql").toLocaleString();
    SqlHelper.config.authentication.options.password = CommonUtil.config("sqlpassword");
    SqlHelper.config.authentication.options.userName = CommonUtil.config("sqluser")
    SqlHelper.connection = new Connection(SqlHelper.config);
    SqlHelper.connection.on('connect', function (err) {
      Logs.log("Connected to SQL @ " + SqlHelper.config.server);
      if (err) Logs.error(JSON.stringify(err));
      //check to see if DB needs seeding and seed DB if needed.
      const req = new Request("SELECT vers FROM vers", (err) => {
        if (err && err.message == "Invalid object name 'vers'.") {
          Logs.log("making new tables")
          const sql = fs.readFileSync("sql/createTables.sql").toLocaleString()
          const req2 = new Request(sql, Logs.error)
          SqlHelper.connection.execSql(req2)
        } else if (err) Logs.error(err)
      })
      SqlHelper.connection.execSql(req)
    })
    SqlHelper.connection.connect();

  }

  static async setReplay(message:Message, replay:RawGameData): Promise<DBObject>{
    //( @discordId, @serverId, @channelId, @replay, @gameId, @uuid )
    const dbRow = { 
      discordId: message.author.id,
      serverId: message.guild.id,
      channelId: message.channel.id,
      replay: JSON.stringify(replay),
      uuid: replay.uniqueSessionId
    }

    const types = {
      discordId: TYPES.VarChar,
      serverId: TYPES.VarChar,
      channelId: TYPES.VarChar,
      replay: TYPES.Text,
      uuid: TYPES.VarChar
    }
    console.log(dbRow)
    console.log(dbRow.replay.length)
    console.log(SqlHelper.addReplaySql)
    Logs.log("Committing replay: " + dbRow.uuid)
    return await SqlHelper.exec(SqlHelper.addReplaySql,dbRow,types)
  }


  static exec(string: string, params?:Record<string,unknown>, types?:Record<string,TediousType>): Promise<DBObject> {
    const ret = new Promise<DBObject>((resolve) => {
      const request = new Request(string, (err, rowCount, rows) => {
        Logs.error(err);
        const obj = { rows: rows, rowCount: rowCount };
        resolve(obj);
      });
      if(params && types){
       for(const key of Object.keys(params)) {
         request.addParameter(key,types[key],params[key])
       }
      }
      SqlHelper.connection.execSql(request);
    });
    return ret;
  }
}


interface DBObject {
  rows?: Record<string,{value:unknown}>[],
  rowCount: number
}

export interface DiscordUser {
  id: string,
  playerId: number,
  serverAdmin: number[],
  globalAdmin: boolean,
  impliedName: string
}

export interface EloLadderElement {
  rank:number,
  elo:number,
  discordId:string,
  name:string
}

export interface Player {
  id: number,
  elo: number,
  pickBanElo: number,
  impliedName?: string,
  lastPlayed?:Date
}

export interface Elos {
  eugenId: number,
  serverId: string,
  channelId: string,
  channelElo: number,
  serverElo: number,
  globalElo: number,
  pickBanGlobalElo: number,
  playerName: string
}

export interface ChannelPermissionSet{
  id: string,
  channelName: string,
  blockElo: boolean,
  blockCommands: boolean,
  blockReplay: boolean
}

export interface DivElo{
  id: string,
  divName: string,
  elo: number
} 