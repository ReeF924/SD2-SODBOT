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

  static async getDiscordUser(id: string): Promise<DiscordUser> {
    const xx = await SqlHelper.exec("Select * from discordUsers where id = '" + id + "';")

    if(xx.rows.length > 0){
      const x = xx.rows[0];
      return {
        id: String(x.id.value),
        playerId: x.playerId.value as number,
        serverAdmin: JSON.parse(x.serverAdmin.value as string),
        globalAdmin: Boolean(x.globalAdmin.value)
      }
    }
    else
      return null;
  }


  static async getDiscordUserFromEugenId(id: number): Promise<DiscordUser> {
    const xx = await SqlHelper.exec("Select * from discordUsers where playerId =  "+ id + ";")
    if(xx.rows.length > 0){
      const x = xx.rows[0];
      return {
        id: String(x.id.value),
        playerId: x.playerId.value as number,
        serverAdmin: JSON.parse(x.serverAdmin.value as string),
        globalAdmin: Boolean(x.globalAdmin.value)
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

  static async setPlayer(id, elo, globalElo): Promise<DBObject> {
    const data = {
      id: id,
      elo: elo,
      pickBanElo: globalElo
    }
    console.log(data)
    return await SqlHelper.exec(SqlHelper.updatePlayerSql,data,{id:TYPES.Int,elo:TYPES.Int,pickBanElo:TYPES.Int})
  }



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
  globalAdmin: boolean
}

export interface Player {
  id: number,
  elo: number,
  pickBanElo: number
}