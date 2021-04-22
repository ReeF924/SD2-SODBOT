import { Connection, Request, TediousType, TYPES } from 'tedious'
import { CommonUtil } from './common';
import { Logs } from "./logs";
import * as fs from 'fs'
import { Message } from 'discord.js';
import { RawGameData } from 'sd2-utilities/lib/parser/gameParser';

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

  static async getDiscordUser(id: string): Promise<DiscordUser> {
    const xx = await SqlHelper.exec("Select * from discordUsers where id = '" + id + "';")

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


  static async getDiscordUserFromEugenId(id: number): Promise<DiscordUser> {
    const xx = await SqlHelper.exec("Select * from discordUsers where playerId =  "+ id + ";")
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
      globalAdmin: user.globalAdmin
    }
    console.log(data)
    return await SqlHelper.exec(SqlHelper.setDiscordUserSql,data,{id:TYPES.VarChar,playerId:TYPES.Int,globalAdmin:TYPES.Bit,serverAdmin:TYPES.Text})
  }

<<<<<<< HEAD
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

=======
  static async setPlayer(id, elo, globalElo): Promise<DBObject> {
    const data = {
      id: id,
      elo: elo,
      pickBanElo: globalElo
    }
    console.log(data)
    return await SqlHelper.exec(SqlHelper.updatePlayerSql,data,{id:TYPES.Int,elo:TYPES.Int,pickBanElo:TYPES.Int})
  }


>>>>>>> e69bd4605a7de9eb4e447e69304a184ba8ab6605

  static setDiscordUserSql = ""
  static addReplaySql = ""
  static addPlayerEloSql = ""
  static updatePlayerSql = ""


  static init(): void {
    SqlHelper.setDiscordUserSql = fs.readFileSync("sql/updateDiscordUser.sql").toLocaleString();
    SqlHelper.updatePlayerSql = fs.readFileSync("sql/updatePlayer.sql").toLocaleString();
    SqlHelper.addReplaySql = fs.readFileSync("sql/addReplay.sql").toLocaleString();
    SqlHelper.addPlayerEloSql = fs.readFileSync("sql/addnewplayer.sql").toLocaleString();
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
<<<<<<< HEAD
  globalAdmin: boolean,
  impliedName: string
}

export interface EloLadderElement {
  rank:number,
  elo:number,
  discordId:string,
  name:string
}

export interface PlayerDetails {
  id: string,
=======
  globalAdmin: boolean
}

export interface Player {
  id: number,
>>>>>>> e69bd4605a7de9eb4e447e69304a184ba8ab6605
  elo: number,
  pickBanElo: number
}