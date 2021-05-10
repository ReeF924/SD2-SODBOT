import { Connection, Request, TediousType, TYPES, } from 'tedious'
import { CommonUtil } from './common';
import { Logs } from "./logs";
import * as fs from 'fs'
import { Message } from 'discord.js';
import { RawGameData } from 'sd2-utilities/lib/parser/gameParser';
import * as sql from 'mssql'


export class SqlHelper {

  static config = {
    user: "",
    password: "",
    server: "sodbotdb.database.windows.net",
    database: "sodbot",
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    },
    options: {
      encrypt: true,
      rowCollectionOnRequestCompletion: true,
      useColumnNames: true
    }
  }

  static connection: Connection
  static connectionPool: sql.ConnectionPool


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
    return await SqlHelper.exec(SqlHelper.updatePlayerSql,data,{id:sql.Int,elo:sql.Float,pickBanElo:sql.Float,lastPlayed:sql.DateTime})
  }

  static async getPlayer(eugenId:number): Promise<Player> {
    const xx = await SqlHelper.exec("Select * from players where id = '" + eugenId + "';")
    if(xx.rows.length > 0){
      const x = xx.rows[0];
      return {
        id: Number(x.id),
        elo: Number(x.elo),
        pickBanElo: Number(x.pickBanElo),
        impliedName:  x.impliedName != null ? String(x.impliedName) : null,
        lastPlayed: x.lastPlayed != null ? new Date(x.lastPlayed as Date) : null
      }
    }
    else
      return null;
  }


  
  //elos

  static async getElos(eugenId:number, channel:string, server:string):Promise<Elos>{
    const xx = await SqlHelper.exec(SqlHelper.getElosSql,{playerId:eugenId,channelId:channel,serverId:server},{playerId:sql.Int,channelId:sql.VarChar,serverId:sql.VarChar})
    if(xx.rows.length > 0){
      const x = xx.rows[0];
      Logs.log("getElos Fetched: " + JSON.stringify(x))
      return {
        eugenId: Number(x.eugenId),
        serverId: String(x.serverId),
        channelId: String(x.channelId),
        channelElo: x.channelElo ? Number(x.channelElo) : 1500,
        serverElo: x.serverElo ? Number(x.serverElo) : 1500,
        globalElo: Number(x.globalElo),
        pickBanGlobalElo: Number(x.pickBanGlobalElo),
        playerName: String(x.playerName)
      }
    }
    else
    Logs.log("getElos User Not Found: " + eugenId)
    return {
      eugenId: eugenId,
      serverId: server,
      channelId: channel,
      channelElo:  1500,
      serverElo:  1500,
      globalElo: 1500,
      pickBanGlobalElo: 1500,
      playerName: ""
    }
  }

  static async getDiscordElos(discordId:string, channel:string, server:string):Promise<Elos>{
    const xx = await SqlHelper.exec(SqlHelper.getElosDiscordSql,{playerId:discordId,channelId:channel,serverId:server},{playerId:sql.VarChar,channelId:sql.VarChar,serverId:sql.VarChar})
    if(xx.rows.length > 0){
      const x = xx.rows[0];
      return {
        eugenId: Number(x.eugenId),
        serverId: String(x.serverId),
        channelId: String(x.channelId),
        channelElo: x.channelElo ? Number(x.channelElo) : 1500,
        serverElo: x.serverElo ? Number(x.serverElo) : 1500,
        globalElo: Number(x.globalElo),
        pickBanGlobalElo: Number(x.pickBanGlobalElo),
        playerName: String(x.playerName)
      }
    }
    else
      return null;
  }

  static async setElos(elos:Elos,info:EloInfo):Promise<DBObject>{
    const elosData = {playerId:elos.eugenId, serverId:elos.serverId, channelId:elos.channelId, channelElo:elos.channelElo, serverElo:elos.serverElo, globalElo:elos.globalElo, pickBanGlobalElo: elos.pickBanGlobalElo, ...info}
    Logs.log("saving elos: "+ JSON.stringify(elosData))
    return await SqlHelper.exec(SqlHelper.updateElosSql,
      ( elosData as unknown as Record<string,unknown>),
    {playerId:sql.Int, impliedName: sql.VarChar, serverName:sql.VarChar, channelName: sql.VarChar, eugenId: sql.Int, serverId: sql.VarChar,channelId: sql.VarChar,channelElo: sql.Float,serverElo: sql.Float,globalElo: sql.Float,pickBanGlobalElo: sql.Float,playerName: sql.Text})
  }

  static async setDivisionElo(elo:DivElo): Promise<number>{
    console.log(elo)
    const data = {
      id: elo.id,
      elo: elo.elo,
      divName: elo.divName
      
    }
    const i = await (await SqlHelper.exec(SqlHelper.updateDivEloSql,data,{id:sql.Int,elo:sql.Float,divName:sql.VarChar})).rowCount
    console.log(i)
    return i
  }

  static async getDivisionElo(id:number):Promise<DivElo>{
    const xx = await SqlHelper.exec("Select * from divisionElo where id = '" + id + "';")
    if(xx.rows.length > 0){
      const x = xx.rows[0];
      return {
        id : Number(x.id),
        divName : String(x.divName),
        elo : Number(x.elo),
      }
    }
    else
      return null;
  }

  static async getAllDivisionElo():Promise<DivElo[]>{
    const xx = await SqlHelper.exec("Select * from divisionElo ORDER BY elo DESC;")
    const ret:DivElo[] = [];
    if(xx.rows.length > 0){
      for(const x of xx.rows)
        ret.push({
          id : Number(x.id),
          divName : String(x.divName),
          elo : Number(x.elo),
        })
    }
    return ret;
  }
  
  //permissions
  static async getServerPermissions(serverId: string): Promise<Blacklist>{
    const xx = await SqlHelper.exec("Select * from serverBlackList where id = '" + serverId + "';")
    if(xx.rows.length > 0){
      const x = xx.rows[0];
      return {
        id: String(x.id),
        name: String(x.serverName),
        blockElo: Number(x.blockElo),
        blockCommands: Number(x.blockCommands),
        blockReplay: Number(x.blockReplay),
        blockChannelElo: Number(x.blockChannelElo),
        blockServerElo: Number(x.blockServerElo),
        blockGlobalElo: Number(x.blockGlobalElo)
      }
    }else{
      return null;
    }
  }

  static async getChannelPermissions(channelId: string): Promise<Blacklist>{
    const xx = await SqlHelper.exec("Select * from channelBlackList where id = '" + channelId + "';")
    if(xx.rows.length > 0){
      const x = xx.rows[0];
      return {
        id: String(x.id),
        name: String(x.channelName),
        blockElo: Number(x.blockElo),
        blockCommands: Number(x.blockCommands),
        blockReplay: Number(x.blockReplay),
        blockChannelElo: Number(x.blockChannelElo),
        blockServerElo: Number(x.blockServerElo),
        blockGlobalElo: Number(x.blockGlobalElo)
      }
    }else{
      return null;
    }
  }

  static async setChannelPermissions(prem: Blacklist): Promise<DBObject>{

    const data = {
      id: prem.id,
      name: prem.name,
      blockElo: prem.blockElo,
      blockCommands: prem.blockCommands,
      blockReplay: prem.blockReplay,
      blockChannelElo: prem.blockChannelElo,
      blockServerElo: prem.blockServerElo,
      blockGlobalElo: prem.blockGlobalElo
    }
    return await SqlHelper.exec(SqlHelper.setChannelPermissionsSql,data,{id:sql.VarChar,name:sql.VarChar,blockElo:sql.Int,blockCommands:sql.Int,blockReplay:sql.Int,blockChannelElo:sql.Int,blockServerElo:sql.Int,blockGlobalElo:sql.Int})
    
  }


  //discordUser

  static async getDiscordUser(discordId: string): Promise<DiscordUser> {
    const xx = await SqlHelper.exec("Select * from discordUsers where id = '" + discordId + "';")

    if(xx.rows.length > 0){
      const x = xx.rows[0];
      return {
        id: String(x.id),
        playerId: x.playerId as number,
        serverAdmin: JSON.parse(x.serverAdmin as string),
        globalAdmin: Boolean(x.globalAdmin),
        impliedName: String(x.impliedName)
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
        id: String(x.id),
        playerId: x.playerId as number,
        serverAdmin: JSON.parse(x.serverAdmin as string),
        globalAdmin: Boolean(x.globalAdmin),
        impliedName: String(x.impliedName)
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
    return await SqlHelper.exec(SqlHelper.setDiscordUserSql,data,{id:sql.VarChar,playerId:sql.Int,globalAdmin:sql.Bit,serverAdmin:sql.Text,impliedName:sql.Text})
  }


  //Other functions


  static async getGlobalLadder(): Promise<Array<EloLadderElement>> {
    const sql = "SELECT players.id as eugenid, pickBanElo, elo, discordUsers.id as discordId, discordUsers.impliedName as discordName, players.impliedName as eugenName, players.lastPlayed as lastActive FROM players LEFT JOIN discordUsers ON discordUsers.playerId = players.id ORDER BY players.elo DESC"
    const xx = await SqlHelper.exec(sql);
    const ret = new Array<EloLadderElement>();
    let r = 1;
    while(xx.rows.length > r-1){
      const x = xx.rows[r-1];
      ret.push({
        rank: r,
        elo: Number(x.elo),
        discordId: String(x.discordId),
        name: String(x.eugenName),
        lastActive: new Date(x.lastActive as number)
      })
      r++;
    }
    return ret;
  }


  static async getServerLadder(serverId:string): Promise<Array<EloLadderElement>> {
    const sqlstr = "SELECT players.id as eugenid, pickBanElo, elo.elo, discordUsers.id as discordId, discordUsers.impliedName as discordName, players.impliedName as eugenName, players.lastPlayed as lastActive FROM players LEFT JOIN discordUsers ON discordUsers.playerId = players.id LEFT JOIN elo ON resourceId = @serverId AND elo.playerId = players.id ORDER BY elo.elo DESC"
    const xx = await SqlHelper.exec(sqlstr,{serverId:serverId},{serverId:sql.VarChar});
    const ret = new Array<EloLadderElement>();
    let r = 1;
    while(xx.rows.length > r-1){
      const x = xx.rows[r-1];
      ret.push({
        rank: r,
        elo: Number(x.elo),
        discordId: String(x.discordId),
        name: String(x.eugenName),
        lastActive: new Date(x.lastActive as number)
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
      console.log(x.id);
      return {
        id: String(x.id),
        elo: x.elo as number,
        pickBanElo: x.pickBanElo as number,
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
        id: String(x.id),
        elo: x.elo as number,
        pickBanElo: x.pickBanElo as number,
      }
    }
    return null
  }

  static async createPlayerElo(eugenId: number) {
    const data = {
      playerId: eugenId
    }
      await SqlHelper.exec(SqlHelper.addPlayerEloSql,data,{playerId:sql.Int})
      return 
  }
  */





  static setDiscordUserSql = ""
  static setChannelPermissionsSql = ""
  static addReplaySql = ""
  static addPlayerEloSql = ""
  static updatePlayerSql = ""
  static updateDivEloSql = ""
  static updateElosSql = ""
  static getElosSql = ""
  static getElosDiscordSql = ""
  

  static connectionPoolConnect:Promise<sql.ConnectionPool>

  static init(): void {
    SqlHelper.setDiscordUserSql = fs.readFileSync("sql/updateDiscordUser.sql").toLocaleString();
    SqlHelper.updatePlayerSql = fs.readFileSync("sql/updatePlayer.sql").toLocaleString();
    SqlHelper.addReplaySql = fs.readFileSync("sql/addReplay.sql").toLocaleString();
    SqlHelper.addPlayerEloSql = fs.readFileSync("sql/addNewPlayer.sql").toLocaleString();
    SqlHelper.addPlayerEloSql = fs.readFileSync("sql/updateDivElo.sql").toLocaleString();
    SqlHelper.getElosSql = fs.readFileSync("sql/getElos.sql").toLocaleString();
    SqlHelper.updateElosSql = fs.readFileSync("sql/updateElos.sql").toLocaleString();
    SqlHelper.getElosDiscordSql = fs.readFileSync("sql/getElosDiscord.sql").toLocaleString();
    SqlHelper.updateDivEloSql = fs.readFileSync("sql/updateDivElo.sql").toLocaleString();
    SqlHelper.setChannelPermissionsSql = fs.readFileSync("sql/updateChannelPermissions.sql").toLocaleString();
    SqlHelper.config.password = CommonUtil.config("sqlpassword");
    SqlHelper.config.user = CommonUtil.config("sqluser");
    SqlHelper.config.database = CommonUtil.config("database","sodbot")
    SqlHelper.connectionPool = new sql.ConnectionPool(SqlHelper.config)
    SqlHelper.connectionPoolConnect = SqlHelper.connectionPool.connect();
    SqlHelper.connectionPool.on('error', Logs.error )

    SqlHelper.connection = new Connection(SqlHelper.config);
    (async ()=>{
      await SqlHelper.connectionPoolConnect
      try{
        const request = SqlHelper.connectionPool.request();
        const result = await request.query("SELECT vers FROM vers")
      }catch (err){
        if (err && err.message == "Invalid object name 'vers'.") {
          Logs.log("making new tables")
            const sql = fs.readFileSync("sql/createTables.sql").toLocaleString()
            await SqlHelper.exec(sql)
        }
        else
        Logs.error(err)
      }
    })();  
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

    const type = {
      discordId: sql.VarChar,
      serverId: sql.VarChar,
      channelId: sql.VarChar,
      replay: sql.Text,
      uuid: sql.VarChar
    }
    Logs.log("Committing replay: " + dbRow.uuid)
    return await SqlHelper.exec(SqlHelper.addReplaySql,dbRow,type)
  }
  
  //This is expensive. And an unprepared statement. and it returns *....
  //it needs work. @todo
  static async getReplaysByEugenId(eugenId:number):Promise<DBObject>{
    return SqlHelper.exec("SELECT * FROM replays WHERE JSON_VALUE(cast([replay] as nvarchar(max)), '$.players[0].id') LIKE '" +eugenId+ "' OR JSON_VALUE(cast([replay] as nvarchar(max)), '$.players[1].id') LIKE '" +eugenId+ "' ORDER BY uploadedAt DESC;")
  }
  


  private static async exec(string:string, params?:Record<string,unknown>, sql?:Record<string,sql.ISqlTypeFactory>): Promise<DBObject> {
      let request = SqlHelper.connectionPool.request()
      //const request = new Request(string, (err, rowCount, rows) => {
      //  Logs.error(err);
      //  const obj = { rows: rows, rowCount: rowCount };
      // resolve(obj);
      //});
      if(params && sql){
       for(const key of Object.keys(params)) {
         request.input(key,{type:sql[key]},params[key])
         //request.addParameter(key,sql[key],params[key])
       }
      }
      request.addListener('err',Logs.error)
      const result = (await request.query(string))
      console.log(result)
      let len = 0
      if(result.recordset) len = result.recordset.length;
      return {rowCount:len, rows:result.recordset}
  }
}


interface DBObject {
  rows?: Record<string,unknown>[],
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
  name:string,
  lastActive: Date
}

export interface EloInfo{
  impliedName:string,
  serverName:string,
  channelName:string
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
  playerName: string,
}

export interface ElosDelta extends Elos {
  serverDelta: number,
  channelDelta: number,
  globalDelta: number,
  pickBanDelta: number
}
export interface DivElo{
  id: number,
  divName: string,
  elo: number
} 
export interface Blacklist{
    id: string,
    name: string,
    blockElo: number,
    blockCommands: number,
    blockReplay: number,
    blockChannelElo: number,
    blockServerElo: number,
    blockGlobalElo: number
}