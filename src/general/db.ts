
const Datastore = require('nedb-promises')
const Redis = require("redis");

class DatastoreWrapper {
    private db

    constructor(filename) {
        this.db = Datastore.create(filename)
    }

    async find(...args) {
        let res = await this.db.find(...args)
        return res
    }

    async insert(...args) {
        let res = await this.db.insert(...args)
        return { rowCount: res.length, rows: res }
    }

    async update(...args) {
        let res = await this.db.update(...args)
        return res
    }

    async findOne(...args) {
        let res = await this.db.findOne(...args)
        return res
    }
    async loadDatabase() {
        this.db.loadDatabase();
    }

}

let serverStore = new DatastoreWrapper('./data/server.db')
let userStore = new DatastoreWrapper('./data/user.db')
let replayStore = new DatastoreWrapper('./data/replay.db')
let eloStore = new DatastoreWrapper('./data/user.db')

global["serverStore"] = serverStore
global["replayStore"] = replayStore

/* Tanner: This is a shitty database, but it works "ok" at low scale and with the freedom to use backups :D */
/* Couldn't be bothered the pain to create Azure SQL DB */
/* https://www.npmjs.com/package/nedb-promises */

/* // #1
datastore.find({ field: true })
  .then(...)
  .catch(...)
  
// #2
datastore.find({ field: true })
  .exec(...)
  .then(...)
  .catch(...)

// #1 and #2 are equivalent

datastore.findOne({ field: true })
  .then(...)
  .catch(...)
  
datastore.insert({ doc: 'yourdoc' })
  .then(...)
  .catch(...)
  
// or in an async function
async function findSorted(page, perPage = 10) {
  return await datastore.find(...)
      .sort(...)
        .limit(perPage)
        .skip(page * perPage)
} */

import { Logs } from "./logs";
import { Message } from 'discord.js';
import { RawGameData } from 'sd2-utilities/lib/parser/gameParser';
import { Client } from 'discord.js';
import { DiscordBot } from "./discordBot";
import { BlobOptions } from "buffer";

export class DB {
    public redisClient = Redis.createClient();
    public  constructor() {
        let redisClient = Redis.createClient();
    }

    public async setServer(server: DiscordServer): Promise<DBObject> {
        // const data = {
        //     _id: server.id,
        //     primaryMode: server.primaryMode,
        //     oppositeChannelIds: server.oppositeChannelIds
        // };

        return serverStore.insert(server);
    }
    public async getAllServers(): Promise<DiscordServer[]> {
        let servers = await serverStore.find({});
        return servers;
    }
    public async getServer(serverId: string, saveNew:boolean = true): Promise<DiscordServer> {
        let server = await serverStore.findOne({ _id: serverId });
        if(server === null && saveNew){
            await this.saveNewServers(DiscordBot.bot);
            server = await serverStore.findOne({ _id: serverId });
        }
        return server;
    }
    public async putServer(server: DiscordServer) {
        await serverStore.update({ _id: server._id }, { $set: { primaryMode: server.primaryMode, oppositeChannelIds: server.oppositeChannelIds } });
        serverStore.loadDatabase();
        this.setRedis(server);
    }
    //Called on ready in discordBot.ts
    public async saveNewServers(client: Client): Promise<void> {
        const guildServers: DiscordServer[] = this.getSodbotServers(client);
        for (const server of guildServers) {
            const savedServer = await this.getFromRedis(server._id, false);
            if (savedServer === null) {
                await this.setServer(server);
                await this.setRedis(server);
            }
        }
    }
    public getSodbotServers(client: Client): DiscordServer[] {
        const servers:DiscordServer[] = client.guilds.cache.map(guild => new DiscordServer(guild.id));

        return servers;
    }
    public async setRedis(server: DiscordServer): Promise<void> {
        // redisClient.set("servers", JSON.stringify(servers));
        const data = {
            primaryMode: server.primaryMode,
            oppositeChannelIds: server.oppositeChannelIds
        }
        await this.redisClient.set(server._id, JSON.stringify(data));
    }
    public async getFromRedis(serverId: string, saveNew:boolean = true): Promise<DiscordServer> {
        const data = await this.redisClient.get(serverId);
        if(data === null){
            return await this.getServer(serverId, saveNew);
        }
        const parsed = JSON.parse(data);
        return new DiscordServer(serverId, parsed.primaryMode, parsed.oppositeChannelIds);
    }
    public async redisSaveServers(servers:DiscordServer[]): Promise<void>{
        if(servers == null){
            servers = await this.getAllServers();
        }
        servers.forEach(async server => {
            await this.setRedis(server);
        });
    }
    //players

    public async setPlayer(player: Player): Promise<DBObject> {
        const data = {
            _id: player.id,
            id: player.id,
            elo: player.elo,
            pickBanElo: player.pickBanElo,
            impliedName: player.impliedName,
            lastPlayed: player.lastPlayed
        }

        return userStore.insert(data)
        // return await DB.exec(DB.updatePlayerSql,data,{id:sql.Int,elo:sql.Float,pickBanElo:sql.Float,lastPlayed:sql.DateTime})
    }
    public async getPlayer(eugenId: number): Promise<Player> {
        const player = await userStore.find({ eugenId })
        if (!player) return null
        return {
            id: Number(player.id),
            elo: Number(player.elo),
            pickBanElo: Number(player.pickBanElo),
            impliedName: player.impliedName != null ? String(player.impliedName) : null,
            lastPlayed: player.lastPlayed != null ? new Date(player.lastPlayed as Date) : null
        }
    }
    //elos
    public async getElos(eugenId: number, channel: string, server: string): Promise<Elos> {

        const elo = await eloStore.find({ eugenId, channel, server })

        if (!elo) {
            return {
                eugenId: eugenId,
                serverId: server,
                channelId: channel,
                channelElo: 1500,
                serverElo: 1500,
                globalElo: 1500,
                pickBanGlobalElo: 1500,
                playerName: ""
            }
        }

        Logs.log("getElos Fetched: " + JSON.stringify(elo))
        return {
            eugenId: Number(elo.eugenId),
            serverId: String(elo.serverId),
            channelId: String(elo.channelId),
            channelElo: elo.channelElo ? Number(elo.channelElo) : 1500,
            serverElo: elo.serverElo ? Number(elo.serverElo) : 1500,
            globalElo: Number(elo.globalElo),
            pickBanGlobalElo: Number(elo.pickBanGlobalElo),
            playerName: String(elo.playerName)
        }
    }
    public async getDiscordElos(discordId: string, channel: string, server: string): Promise<Elos> {
        const elo = await eloStore.find({ discordId, channel, server })
        // const xx = await DB.exec(DB.getElosDiscordSql, { playerId: discordId, channelId: channel, serverId: server }, { playerId: sql.VarChar, channelId: sql.VarChar, serverId: sql.VarChar })
        if (!elo) return null
        return {
            eugenId: Number(elo.eugenId),
            serverId: String(elo.serverId),
            channelId: String(elo.channelId),
            channelElo: elo.channelElo ? Number(elo.channelElo) : 1500,
            serverElo: elo.serverElo ? Number(elo.serverElo) : 1500,
            globalElo: Number(elo.globalElo),
            pickBanGlobalElo: Number(elo.pickBanGlobalElo),
            playerName: String(elo.playerName)
        }
    }
    public async setElos(elos: Elos, info: EloInfo): Promise<DBObject> {
        const elosData = { _id: elos.eugenId, playerId: elos.eugenId, serverId: elos.serverId, channelId: elos.channelId, channelElo: elos.channelElo, serverElo: elos.serverElo, globalElo: elos.globalElo, pickBanGlobalElo: elos.pickBanGlobalElo, ...info }
        Logs.log("saving elos: " + JSON.stringify(elosData))
        return await eloStore.update({ _id: elos.eugenId }, elosData, { upsert: true })
    }
    public async setDivisionElo(elo: DivElo): Promise<number> {
        console.log(elo)
        const data = {
            id: elo.id,
            elo: elo.elo,
            divName: elo.divName

        }
        const i = await eloStore.update({ _id: elo.id }, data, { upsert: true })
        // const i = await (await DB.exec(DB.updateDivEloSql, data, { id: sql.Int, elo: sql.Float, divName: sql.VarChar })).rowCount
        // TODO: TEST 
        console.log(i)
        return i
    }
    public async getDivisionElo(id: number): Promise<DivElo> {
        const elo = await eloStore.find({ _id: id })
        if (!elo) return null
        //const xx = await DB.exec("Select * from divisionElo where id = '" + id + "';")
        return {
            id: Number(elo.id),
            divName: String(elo.divName),
            elo: Number(elo.elo),
        }
    }
    public async getAllDivisionElo(): Promise<DivElo[]> {
        const elos = await eloStore.find({})
        const ret: DivElo[] = elos.map(elo => {
            ret.push({
                id: Number(elo.id),
                divName: String(elo.divName),
                elo: Number(elo.elo),
            })
        })

        return ret;
    }
    //permissions
    public async getServerPermissions(serverId: string): Promise<Blacklist> {
        const perms = await serverStore.find({ serverId, type: "perms" })
        if (!perms) return null
        return {
            id: String(perms.id),
            name: String(perms.serverName),
            blockElo: Number(perms.blockElo),
            blockCommands: Number(perms.blockCommands),
            blockReplay: Number(perms.blockReplay),
            blockChannelElo: Number(perms.blockChannelElo),
            blockServerElo: Number(perms.blockServerElo),
            blockGlobalElo: Number(perms.blockGlobalElo)
        }
    }
    public async getChannelPermissions(channelId: string): Promise<Blacklist> {
        const perms = await serverStore.find({ channelId, type: "perms-channel" })
        if (!perms) return null
        return {
            id: String(perms.id),
            name: String(perms.channelName),
            blockElo: Number(perms.blockElo),
            blockCommands: Number(perms.blockCommands),
            blockReplay: Number(perms.blockReplay),
            blockChannelElo: Number(perms.blockChannelElo),
            blockServerElo: Number(perms.blockServerElo),
            blockGlobalElo: Number(perms.blockGlobalElo)
        }
    }
    public async setChannelPermissions(prem: Blacklist): Promise<DBObject> {

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
        return await serverStore.update({ _id: prem.id }, data, { upsert: true })
        // return await DB.exec(DB.setChannelPermissionsSql, data, { id: sql.VarChar, name: sql.VarChar, blockElo: sql.Int, blockCommands: sql.Int, blockReplay: sql.Int, blockChannelElo: sql.Int, blockServerElo: sql.Int, blockGlobalElo: sql.Int })

    }
    //discordUser
    public async getDiscordUser(discordId: string): Promise<DiscordUser> {
        const user = await userStore.findOne({ discordId })
        //const xx = await DB.exec("Select * from discordUsers where id = '" + discordId + "';")
        if (!user) return null

        return {
            id: String(user.id),
            playerId: user.playerId as number,
            serverAdmin: JSON.parse(user.serverAdmin as string),
            globalAdmin: Boolean(user.globalAdmin),
            impliedName: String(user.impliedName)
        }
    }
    public async getDiscordUserFromEugenId(eugenId: number): Promise<DiscordUser> {
        const user = await userStore.findOne({ eugenId })
        //const xx = await DB.exec("Select * from discordUsers where playerId =  " + eugenId + ";")
        if (!user) return null
        return {
            id: String(user.id),
            playerId: user.playerId as number,
            serverAdmin: JSON.parse(user.serverAdmin as string),
            globalAdmin: Boolean(user.globalAdmin),
            impliedName: String(user.impliedName)
        }
    }
    public async setDiscordUser(user: DiscordUser): Promise<DBObject> {
        const data = {
            id: String(user.id),
            playerId: user.playerId,
            serverAdmin: "" + JSON.stringify(user.serverAdmin),
            globalAdmin: user.globalAdmin,
            impliedName: user.impliedName
        }
        console.log(data)
        return await userStore.update({ _id: data.id }, data, { upsert: true })
        // return await DB.exec(DB.setDiscordUserSql, data, { id: sql.VarChar, playerId: sql.Int, globalAdmin: sql.Bit, serverAdmin: sql.Text, impliedName: sql.Text })
    }



    //Other functions
    public async getGlobalLadder(): Promise<Array<EloLadderElement>> {
        // TODO: this probably wont work out of the box.
        const users = await eloStore.find({})
        // const sql = "SELECT players.id as eugenid, pickBanElo, elo, discordUsers.id as discordId, discordUsers.impliedName as discordName, players.impliedName as eugenName, players.lastPlayed as lastActive FROM players LEFT JOIN discordUsers ON discordUsers.playerId = players.id ORDER BY players.elo DESC"
        //  const ret = new Array<EloLadderElement>();
        return users.map((elo, index) => {
            return {
                rank: index + 1,
                elo: Number(elo.elo),
                discordId: String(elo.discordId),
                name: String(elo.eugenName),
                lastActive: new Date(elo.lastActive as number)
            }
        })
    }
    public async getServerLadder(serverId: string): Promise<Array<EloLadderElement>> {
        // TODO: this probably wont work out of the box.
        const users = await eloStore.find({ serverId })
        // const sql = "SELECT players.id as eugenid, pickBanElo, elo, discordUsers.id as discordId, discordUsers.impliedName as discordName, players.impliedName as eugenName, players.lastPlayed as lastActive FROM players LEFT JOIN discordUsers ON discordUsers.playerId = players.id ORDER BY players.elo DESC"
        //  const ret = new Array<EloLadderElement>();
        return users.map((elo, index) => {
            return {
                rank: index + 1,
                elo: Number(elo.elo),
                discordId: String(elo.discordId),
                name: String(elo.eugenName),
                lastActive: new Date(elo.lastActive as number)
            }
        })
    }
    /*
    public async getPlayerElo(eugenId:number): Promise<Player> {
      console.log("It gets to getPlayerELO");
      const xx = await DB.exec("Select * from players where id = '" + eugenId + "';");
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
      const yy = await DB.exec("Select * from players where id = '" + eugenId + "';")
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

  
    public async createPlayerElo(eugenId: number) {
      const data = {
        playerId: eugenId
      }
        await DB.exec(DB.addPlayerEloSql,data,{playerId:sql.Int})
        return 
    }
    */


    // Returns 0 for new replay and 1 for existing replay
    public async setReplay(message: Message, replay: RawGameData): Promise<number> {
        let existing = await replayStore.find({ uuid: replay.uniqueSessionId })
        const replayData = {
            discordId: message.author.id,
            serverId: message.guild.id,
            channelId: message.channel.id,
            replay: JSON.stringify(replay),
            uuid: replay.uniqueSessionId
        }

        Logs.log("Committing replay: " + replayData.uuid)
        await replayStore.update({ uuid: replayData.uuid }, replay, { upsert: true })
        return existing ? 1 : 0
        // return await DB.exec(DB.addReplaySql, dbRow, type)
    }

    //This is expensive. And an unprepared statement. and it returns *....
    //it needs work. @todo
    public async getReplaysByEugenId(eugenId: number): Promise<DBObject> {
        return await replayStore.find({ eugenId })
        // return DB.exec("SELECT * FROM replays WHERE JSON_VALUE(cast([replay] as nvarchar(max)), '$.players[0].id') LIKE '" + eugenId + "' OR JSON_VALUE(cast([replay] as nvarchar(max)), '$.players[1].id') LIKE '" + eugenId + "' ORDER BY uploadedAt DESC;")
    }
    private async exec(...dots: any): Promise<DBObject> {
        console.log("Not implemented");

        return { rowCount: 0, rows: [] }
    }
}

interface DBObject {
    rows?: Record<string, unknown>[],
    rowCount: number
}

export interface DiscordUser {
    id: string,
    playerId: number,
    serverAdmin: number[],
    globalAdmin: boolean,
    impliedName: string
}

export class DiscordServer {
    _id: string;
    primaryMode: string;
    oppositeChannelIds: Array<string>; //always the opposite than primaryMode

    public constructor(id: string, primaryMode: string = "sd2", oppositeChannelIds = new Array<string>()) {
        this._id = id;
        this.primaryMode = primaryMode;
        this.oppositeChannelIds = oppositeChannelIds;
    }
}

export interface EloLadderElement {
    rank: number,
    elo: number,
    discordId: string,
    name: string,
    lastActive: Date
}

export interface EloInfo {
    impliedName: string,
    serverName: string,
    channelName: string
}

export interface Player {
    id: number,
    elo: number,
    pickBanElo: number,
    impliedName?: string,
    lastPlayed?: Date
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
export interface DivElo {
    id: number,
    divName: string,
    elo: number
}
export interface Blacklist {
    id: string,
    name: string,
    blockElo: number,
    blockCommands: number,
    blockReplay: number,
    blockChannelElo: number,
    blockServerElo: number,
    blockGlobalElo: number
}



export default DB