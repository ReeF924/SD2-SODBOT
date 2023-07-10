"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordServer = exports.DB = void 0;
const Datastore = require('nedb-promises');
const Redis = require("redis");
class DatastoreWrapper {
    constructor(filename) {
        this.db = Datastore.create(filename);
    }
    find(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield this.db.find(...args);
            return res;
        });
    }
    insert(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield this.db.insert(...args);
            return { rowCount: res.length, rows: res };
        });
    }
    update(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield this.db.update(...args);
            return res;
        });
    }
    findOne(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield this.db.findOne(...args);
            return res;
        });
    }
    loadDatabase() {
        return __awaiter(this, void 0, void 0, function* () {
            this.db.loadDatabase();
        });
    }
}
let serverStore = new DatastoreWrapper('./data/server.db');
let userStore = new DatastoreWrapper('./data/user.db');
let replayStore = new DatastoreWrapper('./data/replay.db');
let eloStore = new DatastoreWrapper('./data/user.db');
global["serverStore"] = serverStore;
global["replayStore"] = replayStore;
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
const logs_1 = require("./logs");
const discordBot_1 = require("./discordBot");
class DB {
    constructor() {
        this.redisClient = Redis.createClient();
        let redisClient = Redis.createClient();
    }
    setServer(server) {
        return __awaiter(this, void 0, void 0, function* () {
            // const data = {
            //     _id: server.id,
            //     primaryMode: server.primaryMode,
            //     oppositeChannelIds: server.oppositeChannelIds
            // };
            return serverStore.insert(server);
        });
    }
    getAllServers() {
        return __awaiter(this, void 0, void 0, function* () {
            let servers = yield serverStore.find({});
            return servers;
        });
    }
    getServer(serverId, saveNew = true) {
        return __awaiter(this, void 0, void 0, function* () {
            let server = yield serverStore.findOne({ _id: serverId });
            if (server === null && saveNew) {
                yield this.saveNewServers(discordBot_1.DiscordBot.bot);
                server = yield serverStore.findOne({ _id: serverId });
            }
            return server;
        });
    }
    putServer(server) {
        return __awaiter(this, void 0, void 0, function* () {
            yield serverStore.update({ _id: server._id }, { $set: { primaryMode: server.primaryMode, oppositeChannelIds: server.oppositeChannelIds } });
            serverStore.loadDatabase();
            this.setRedis(server);
        });
    }
    //Called on ready in discordBot.ts
    saveNewServers(client) {
        return __awaiter(this, void 0, void 0, function* () {
            const guildServers = this.getSodbotServers(client);
            for (const server of guildServers) {
                const savedServer = yield this.getFromRedis(server._id, false);
                if (savedServer === null) {
                    yield this.setServer(server);
                    yield this.setRedis(server);
                }
            }
        });
    }
    getSodbotServers(client) {
        const servers = client.guilds.cache.map(guild => new DiscordServer(guild.id));
        return servers;
    }
    setRedis(server) {
        return __awaiter(this, void 0, void 0, function* () {
            // redisClient.set("servers", JSON.stringify(servers));
            const data = {
                primaryMode: server.primaryMode,
                oppositeChannelIds: server.oppositeChannelIds
            };
            yield this.redisClient.set(server._id, JSON.stringify(data));
        });
    }
    getFromRedis(serverId, saveNew = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.redisClient.get(serverId);
            if (data === null) {
                return yield this.getServer(serverId, saveNew);
            }
            const parsed = JSON.parse(data);
            return new DiscordServer(serverId, parsed.primaryMode, parsed.oppositeChannelIds);
        });
    }
    redisSaveServers(servers) {
        return __awaiter(this, void 0, void 0, function* () {
            if (servers == null) {
                servers = yield this.getAllServers();
            }
            servers.forEach((server) => __awaiter(this, void 0, void 0, function* () {
                yield this.setRedis(server);
            }));
        });
    }
    //players
    setPlayer(player) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = {
                _id: player.id,
                id: player.id,
                elo: player.elo,
                pickBanElo: player.pickBanElo,
                impliedName: player.impliedName,
                lastPlayed: player.lastPlayed
            };
            return userStore.insert(data);
            // return await DB.exec(DB.updatePlayerSql,data,{id:sql.Int,elo:sql.Float,pickBanElo:sql.Float,lastPlayed:sql.DateTime})
        });
    }
    getPlayer(eugenId) {
        return __awaiter(this, void 0, void 0, function* () {
            const player = yield userStore.find({ eugenId });
            if (!player)
                return null;
            return {
                id: Number(player.id),
                elo: Number(player.elo),
                pickBanElo: Number(player.pickBanElo),
                impliedName: player.impliedName != null ? String(player.impliedName) : null,
                lastPlayed: player.lastPlayed != null ? new Date(player.lastPlayed) : null
            };
        });
    }
    //elos
    getElos(eugenId, channel, server) {
        return __awaiter(this, void 0, void 0, function* () {
            const elo = yield eloStore.find({ eugenId, channel, server });
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
                };
            }
            logs_1.Logs.log("getElos Fetched: " + JSON.stringify(elo));
            return {
                eugenId: Number(elo.eugenId),
                serverId: String(elo.serverId),
                channelId: String(elo.channelId),
                channelElo: elo.channelElo ? Number(elo.channelElo) : 1500,
                serverElo: elo.serverElo ? Number(elo.serverElo) : 1500,
                globalElo: Number(elo.globalElo),
                pickBanGlobalElo: Number(elo.pickBanGlobalElo),
                playerName: String(elo.playerName)
            };
        });
    }
    getDiscordElos(discordId, channel, server) {
        return __awaiter(this, void 0, void 0, function* () {
            const elo = yield eloStore.find({ discordId, channel, server });
            // const xx = await DB.exec(DB.getElosDiscordSql, { playerId: discordId, channelId: channel, serverId: server }, { playerId: sql.VarChar, channelId: sql.VarChar, serverId: sql.VarChar })
            if (!elo)
                return null;
            return {
                eugenId: Number(elo.eugenId),
                serverId: String(elo.serverId),
                channelId: String(elo.channelId),
                channelElo: elo.channelElo ? Number(elo.channelElo) : 1500,
                serverElo: elo.serverElo ? Number(elo.serverElo) : 1500,
                globalElo: Number(elo.globalElo),
                pickBanGlobalElo: Number(elo.pickBanGlobalElo),
                playerName: String(elo.playerName)
            };
        });
    }
    setElos(elos, info) {
        return __awaiter(this, void 0, void 0, function* () {
            const elosData = Object.assign({ _id: elos.eugenId, playerId: elos.eugenId, serverId: elos.serverId, channelId: elos.channelId, channelElo: elos.channelElo, serverElo: elos.serverElo, globalElo: elos.globalElo, pickBanGlobalElo: elos.pickBanGlobalElo }, info);
            logs_1.Logs.log("saving elos: " + JSON.stringify(elosData));
            return yield eloStore.update({ _id: elos.eugenId }, elosData, { upsert: true });
        });
    }
    setDivisionElo(elo) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(elo);
            const data = {
                id: elo.id,
                elo: elo.elo,
                divName: elo.divName
            };
            const i = yield eloStore.update({ _id: elo.id }, data, { upsert: true });
            // const i = await (await DB.exec(DB.updateDivEloSql, data, { id: sql.Int, elo: sql.Float, divName: sql.VarChar })).rowCount
            // TODO: TEST 
            console.log(i);
            return i;
        });
    }
    getDivisionElo(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const elo = yield eloStore.find({ _id: id });
            if (!elo)
                return null;
            //const xx = await DB.exec("Select * from divisionElo where id = '" + id + "';")
            return {
                id: Number(elo.id),
                divName: String(elo.divName),
                elo: Number(elo.elo),
            };
        });
    }
    getAllDivisionElo() {
        return __awaiter(this, void 0, void 0, function* () {
            const elos = yield eloStore.find({});
            const ret = elos.map(elo => {
                ret.push({
                    id: Number(elo.id),
                    divName: String(elo.divName),
                    elo: Number(elo.elo),
                });
            });
            return ret;
        });
    }
    //permissions
    getServerPermissions(serverId) {
        return __awaiter(this, void 0, void 0, function* () {
            const perms = yield serverStore.find({ serverId, type: "perms" });
            if (!perms)
                return null;
            return {
                id: String(perms.id),
                name: String(perms.serverName),
                blockElo: Number(perms.blockElo),
                blockCommands: Number(perms.blockCommands),
                blockReplay: Number(perms.blockReplay),
                blockChannelElo: Number(perms.blockChannelElo),
                blockServerElo: Number(perms.blockServerElo),
                blockGlobalElo: Number(perms.blockGlobalElo)
            };
        });
    }
    getChannelPermissions(channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            const perms = yield serverStore.find({ channelId, type: "perms-channel" });
            if (!perms)
                return null;
            return {
                id: String(perms.id),
                name: String(perms.channelName),
                blockElo: Number(perms.blockElo),
                blockCommands: Number(perms.blockCommands),
                blockReplay: Number(perms.blockReplay),
                blockChannelElo: Number(perms.blockChannelElo),
                blockServerElo: Number(perms.blockServerElo),
                blockGlobalElo: Number(perms.blockGlobalElo)
            };
        });
    }
    setChannelPermissions(prem) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = {
                id: prem.id,
                name: prem.name,
                blockElo: prem.blockElo,
                blockCommands: prem.blockCommands,
                blockReplay: prem.blockReplay,
                blockChannelElo: prem.blockChannelElo,
                blockServerElo: prem.blockServerElo,
                blockGlobalElo: prem.blockGlobalElo
            };
            return yield serverStore.update({ _id: prem.id }, data, { upsert: true });
            // return await DB.exec(DB.setChannelPermissionsSql, data, { id: sql.VarChar, name: sql.VarChar, blockElo: sql.Int, blockCommands: sql.Int, blockReplay: sql.Int, blockChannelElo: sql.Int, blockServerElo: sql.Int, blockGlobalElo: sql.Int })
        });
    }
    //discordUser
    getDiscordUser(discordId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userStore.findOne({ discordId });
            //const xx = await DB.exec("Select * from discordUsers where id = '" + discordId + "';")
            if (!user)
                return null;
            return {
                id: String(user.id),
                playerId: user.playerId,
                serverAdmin: JSON.parse(user.serverAdmin),
                globalAdmin: Boolean(user.globalAdmin),
                impliedName: String(user.impliedName)
            };
        });
    }
    getDiscordUserFromEugenId(eugenId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userStore.findOne({ eugenId });
            //const xx = await DB.exec("Select * from discordUsers where playerId =  " + eugenId + ";")
            if (!user)
                return null;
            return {
                id: String(user.id),
                playerId: user.playerId,
                serverAdmin: JSON.parse(user.serverAdmin),
                globalAdmin: Boolean(user.globalAdmin),
                impliedName: String(user.impliedName)
            };
        });
    }
    setDiscordUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = {
                id: String(user.id),
                playerId: user.playerId,
                serverAdmin: "" + JSON.stringify(user.serverAdmin),
                globalAdmin: user.globalAdmin,
                impliedName: user.impliedName
            };
            console.log(data);
            return yield userStore.update({ _id: data.id }, data, { upsert: true });
            // return await DB.exec(DB.setDiscordUserSql, data, { id: sql.VarChar, playerId: sql.Int, globalAdmin: sql.Bit, serverAdmin: sql.Text, impliedName: sql.Text })
        });
    }
    //Other functions
    getGlobalLadder() {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: this probably wont work out of the box.
            const users = yield eloStore.find({});
            // const sql = "SELECT players.id as eugenid, pickBanElo, elo, discordUsers.id as discordId, discordUsers.impliedName as discordName, players.impliedName as eugenName, players.lastPlayed as lastActive FROM players LEFT JOIN discordUsers ON discordUsers.playerId = players.id ORDER BY players.elo DESC"
            //  const ret = new Array<EloLadderElement>();
            return users.map((elo, index) => {
                return {
                    rank: index + 1,
                    elo: Number(elo.elo),
                    discordId: String(elo.discordId),
                    name: String(elo.eugenName),
                    lastActive: new Date(elo.lastActive)
                };
            });
        });
    }
    getServerLadder(serverId) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: this probably wont work out of the box.
            const users = yield eloStore.find({ serverId });
            // const sql = "SELECT players.id as eugenid, pickBanElo, elo, discordUsers.id as discordId, discordUsers.impliedName as discordName, players.impliedName as eugenName, players.lastPlayed as lastActive FROM players LEFT JOIN discordUsers ON discordUsers.playerId = players.id ORDER BY players.elo DESC"
            //  const ret = new Array<EloLadderElement>();
            return users.map((elo, index) => {
                return {
                    rank: index + 1,
                    elo: Number(elo.elo),
                    discordId: String(elo.discordId),
                    name: String(elo.eugenName),
                    lastActive: new Date(elo.lastActive)
                };
            });
        });
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
    setReplay(message, replay) {
        return __awaiter(this, void 0, void 0, function* () {
            let existing = yield replayStore.find({ uuid: replay.uniqueSessionId });
            const replayData = {
                discordId: message.author.id,
                serverId: message.guild.id,
                channelId: message.channel.id,
                replay: JSON.stringify(replay),
                uuid: replay.uniqueSessionId
            };
            logs_1.Logs.log("Committing replay: " + replayData.uuid);
            yield replayStore.update({ uuid: replayData.uuid }, replay, { upsert: true });
            return existing ? 1 : 0;
            // return await DB.exec(DB.addReplaySql, dbRow, type)
        });
    }
    //This is expensive. And an unprepared statement. and it returns *....
    //it needs work. @todo
    getReplaysByEugenId(eugenId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield replayStore.find({ eugenId });
            // return DB.exec("SELECT * FROM replays WHERE JSON_VALUE(cast([replay] as nvarchar(max)), '$.players[0].id') LIKE '" + eugenId + "' OR JSON_VALUE(cast([replay] as nvarchar(max)), '$.players[1].id') LIKE '" + eugenId + "' ORDER BY uploadedAt DESC;")
        });
    }
    exec(...dots) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Not implemented");
            return { rowCount: 0, rows: [] };
        });
    }
}
exports.DB = DB;
class DiscordServer {
    constructor(id, primaryMode = "sd2", oppositeChannelIds = new Array()) {
        this._id = id;
        this.primaryMode = primaryMode;
        this.oppositeChannelIds = oppositeChannelIds;
    }
}
exports.DiscordServer = DiscordServer;
exports.default = DB;
//# sourceMappingURL=db.js.map