import { Connection, Request, TediousType, TYPES } from 'tedious'
import { CommonUtil } from './common';
import { Logs } from "./logs";
import * as fs from 'fs'
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

  static setDiscordUserSql = ""

  static init(): void {
    SqlHelper.setDiscordUserSql = fs.readFileSync("sql/updateDiscordUser.sql").toLocaleString();
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