"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordServer = exports.DB = void 0;
var Datastore = require('nedb-promises');
// const Redis = require("redis");
var DatastoreWrapper = /** @class */ (function () {
    function DatastoreWrapper(filename) {
        this.db = Datastore.create(filename);
    }
    DatastoreWrapper.prototype.find = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var res;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (_a = this.db).find.apply(_a, args)];
                    case 1:
                        res = _b.sent();
                        return [2 /*return*/, res];
                }
            });
        });
    };
    DatastoreWrapper.prototype.insert = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var res;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (_a = this.db).insert.apply(_a, args)];
                    case 1:
                        res = _b.sent();
                        return [2 /*return*/, { rowCount: res.length, rows: res }];
                }
            });
        });
    };
    DatastoreWrapper.prototype.update = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var res;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (_a = this.db).update.apply(_a, args)];
                    case 1:
                        res = _b.sent();
                        return [2 /*return*/, res];
                }
            });
        });
    };
    DatastoreWrapper.prototype.findOne = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var res;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (_a = this.db).findOne.apply(_a, args)];
                    case 1:
                        res = _b.sent();
                        return [2 /*return*/, res];
                }
            });
        });
    };
    DatastoreWrapper.prototype.loadDatabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.db.loadDatabase();
                return [2 /*return*/];
            });
        });
    };
    return DatastoreWrapper;
}());
var serverStore = new DatastoreWrapper('./data/server.db');
var userStore = new DatastoreWrapper('./data/user.db');
var replayStore = new DatastoreWrapper('./data/replay.db');
var eloStore = new DatastoreWrapper('./data/user.db');
// const redisClient = Redis.createClient();
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
var logs_1 = require("./logs");
var DB = /** @class */ (function () {
    function DB() {
    }
    //players
    DB.setServer = function (server) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // const data = {
                //     _id: server.id,
                //     primaryMode: server.primaryMode,
                //     oppositeChannelIds: server.oppositeChannelIds
                // };
                return [2 /*return*/, serverStore.insert(server)];
            });
        });
    };
    DB.getAllServers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var servers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, serverStore.find({})];
                    case 1:
                        servers = _a.sent();
                        return [2 /*return*/, servers];
                }
            });
        });
    };
    DB.getServer = function (serverId) {
        return __awaiter(this, void 0, void 0, function () {
            var server;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, serverStore.findOne({ _id: serverId })];
                    case 1:
                        server = _a.sent();
                        return [2 /*return*/, server];
                }
            });
        });
    };
    DB.putServer = function (server) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, serverStore.update({ _id: server._id }, { $set: { primaryMode: server.primaryMode, oppositeChannelIds: server.oppositeChannelIds } })];
                    case 1:
                        _a.sent();
                        serverStore.loadDatabase();
                        // DB.setRedis(server);
                        console.log("succesful Put");
                        return [2 /*return*/];
                }
            });
        });
    };
    DB.setPlayer = function (player) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                data = {
                    _id: player.id,
                    id: player.id,
                    elo: player.elo,
                    pickBanElo: player.pickBanElo,
                    impliedName: player.impliedName,
                    lastPlayed: player.lastPlayed
                };
                return [2 /*return*/, userStore.insert(data)
                    // return await DB.exec(DB.updatePlayerSql,data,{id:sql.Int,elo:sql.Float,pickBanElo:sql.Float,lastPlayed:sql.DateTime})
                ];
            });
        });
    };
    DB.getPlayer = function (eugenId) {
        return __awaiter(this, void 0, void 0, function () {
            var player;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, userStore.find({ eugenId: eugenId })];
                    case 1:
                        player = _a.sent();
                        if (!player)
                            return [2 /*return*/, null];
                        return [2 /*return*/, {
                                id: Number(player.id),
                                elo: Number(player.elo),
                                pickBanElo: Number(player.pickBanElo),
                                impliedName: player.impliedName != null ? String(player.impliedName) : null,
                                lastPlayed: player.lastPlayed != null ? new Date(player.lastPlayed) : null
                            }];
                }
            });
        });
    };
    //elos
    DB.getElos = function (eugenId, channel, server) {
        return __awaiter(this, void 0, void 0, function () {
            var elo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, eloStore.find({ eugenId: eugenId, channel: channel, server: server })];
                    case 1:
                        elo = _a.sent();
                        if (!elo) {
                            return [2 /*return*/, {
                                    eugenId: eugenId,
                                    serverId: server,
                                    channelId: channel,
                                    channelElo: 1500,
                                    serverElo: 1500,
                                    globalElo: 1500,
                                    pickBanGlobalElo: 1500,
                                    playerName: ""
                                }];
                        }
                        logs_1.Logs.log("getElos Fetched: " + JSON.stringify(elo));
                        return [2 /*return*/, {
                                eugenId: Number(elo.eugenId),
                                serverId: String(elo.serverId),
                                channelId: String(elo.channelId),
                                channelElo: elo.channelElo ? Number(elo.channelElo) : 1500,
                                serverElo: elo.serverElo ? Number(elo.serverElo) : 1500,
                                globalElo: Number(elo.globalElo),
                                pickBanGlobalElo: Number(elo.pickBanGlobalElo),
                                playerName: String(elo.playerName)
                            }];
                }
            });
        });
    };
    DB.getDiscordElos = function (discordId, channel, server) {
        return __awaiter(this, void 0, void 0, function () {
            var elo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, eloStore.find({ discordId: discordId, channel: channel, server: server })
                        // const xx = await DB.exec(DB.getElosDiscordSql, { playerId: discordId, channelId: channel, serverId: server }, { playerId: sql.VarChar, channelId: sql.VarChar, serverId: sql.VarChar })
                    ];
                    case 1:
                        elo = _a.sent();
                        // const xx = await DB.exec(DB.getElosDiscordSql, { playerId: discordId, channelId: channel, serverId: server }, { playerId: sql.VarChar, channelId: sql.VarChar, serverId: sql.VarChar })
                        if (!elo)
                            return [2 /*return*/, null];
                        return [2 /*return*/, {
                                eugenId: Number(elo.eugenId),
                                serverId: String(elo.serverId),
                                channelId: String(elo.channelId),
                                channelElo: elo.channelElo ? Number(elo.channelElo) : 1500,
                                serverElo: elo.serverElo ? Number(elo.serverElo) : 1500,
                                globalElo: Number(elo.globalElo),
                                pickBanGlobalElo: Number(elo.pickBanGlobalElo),
                                playerName: String(elo.playerName)
                            }];
                }
            });
        });
    };
    DB.setElos = function (elos, info) {
        return __awaiter(this, void 0, void 0, function () {
            var elosData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        elosData = __assign({ _id: elos.eugenId, playerId: elos.eugenId, serverId: elos.serverId, channelId: elos.channelId, channelElo: elos.channelElo, serverElo: elos.serverElo, globalElo: elos.globalElo, pickBanGlobalElo: elos.pickBanGlobalElo }, info);
                        logs_1.Logs.log("saving elos: " + JSON.stringify(elosData));
                        return [4 /*yield*/, eloStore.update({ _id: elos.eugenId }, elosData, { upsert: true })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DB.setDivisionElo = function (elo) {
        return __awaiter(this, void 0, void 0, function () {
            var data, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log(elo);
                        data = {
                            id: elo.id,
                            elo: elo.elo,
                            divName: elo.divName
                        };
                        return [4 /*yield*/, eloStore.update({ _id: elo.id }, data, { upsert: true })
                            // const i = await (await DB.exec(DB.updateDivEloSql, data, { id: sql.Int, elo: sql.Float, divName: sql.VarChar })).rowCount
                            // TODO: TEST 
                        ];
                    case 1:
                        i = _a.sent();
                        // const i = await (await DB.exec(DB.updateDivEloSql, data, { id: sql.Int, elo: sql.Float, divName: sql.VarChar })).rowCount
                        // TODO: TEST 
                        console.log(i);
                        return [2 /*return*/, i];
                }
            });
        });
    };
    DB.getDivisionElo = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var elo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, eloStore.find({ _id: id })];
                    case 1:
                        elo = _a.sent();
                        if (!elo)
                            return [2 /*return*/, null
                                //const xx = await DB.exec("Select * from divisionElo where id = '" + id + "';")
                            ];
                        //const xx = await DB.exec("Select * from divisionElo where id = '" + id + "';")
                        return [2 /*return*/, {
                                id: Number(elo.id),
                                divName: String(elo.divName),
                                elo: Number(elo.elo),
                            }];
                }
            });
        });
    };
    DB.getAllDivisionElo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var elos, ret;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, eloStore.find({})];
                    case 1:
                        elos = _a.sent();
                        ret = elos.map(function (elo) {
                            ret.push({
                                id: Number(elo.id),
                                divName: String(elo.divName),
                                elo: Number(elo.elo),
                            });
                        });
                        return [2 /*return*/, ret];
                }
            });
        });
    };
    //permissions
    DB.getServerPermissions = function (serverId) {
        return __awaiter(this, void 0, void 0, function () {
            var perms;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, serverStore.find({ serverId: serverId, type: "perms" })];
                    case 1:
                        perms = _a.sent();
                        if (!perms)
                            return [2 /*return*/, null];
                        return [2 /*return*/, {
                                id: String(perms.id),
                                name: String(perms.serverName),
                                blockElo: Number(perms.blockElo),
                                blockCommands: Number(perms.blockCommands),
                                blockReplay: Number(perms.blockReplay),
                                blockChannelElo: Number(perms.blockChannelElo),
                                blockServerElo: Number(perms.blockServerElo),
                                blockGlobalElo: Number(perms.blockGlobalElo)
                            }];
                }
            });
        });
    };
    DB.getChannelPermissions = function (channelId) {
        return __awaiter(this, void 0, void 0, function () {
            var perms;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, serverStore.find({ channelId: channelId, type: "perms-channel" })];
                    case 1:
                        perms = _a.sent();
                        if (!perms)
                            return [2 /*return*/, null];
                        return [2 /*return*/, {
                                id: String(perms.id),
                                name: String(perms.channelName),
                                blockElo: Number(perms.blockElo),
                                blockCommands: Number(perms.blockCommands),
                                blockReplay: Number(perms.blockReplay),
                                blockChannelElo: Number(perms.blockChannelElo),
                                blockServerElo: Number(perms.blockServerElo),
                                blockGlobalElo: Number(perms.blockGlobalElo)
                            }];
                }
            });
        });
    };
    DB.setChannelPermissions = function (prem) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = {
                            id: prem.id,
                            name: prem.name,
                            blockElo: prem.blockElo,
                            blockCommands: prem.blockCommands,
                            blockReplay: prem.blockReplay,
                            blockChannelElo: prem.blockChannelElo,
                            blockServerElo: prem.blockServerElo,
                            blockGlobalElo: prem.blockGlobalElo
                        };
                        return [4 /*yield*/, serverStore.update({ _id: prem.id }, data, { upsert: true })
                            // return await DB.exec(DB.setChannelPermissionsSql, data, { id: sql.VarChar, name: sql.VarChar, blockElo: sql.Int, blockCommands: sql.Int, blockReplay: sql.Int, blockChannelElo: sql.Int, blockServerElo: sql.Int, blockGlobalElo: sql.Int })
                        ];
                    case 1: return [2 /*return*/, _a.sent()
                        // return await DB.exec(DB.setChannelPermissionsSql, data, { id: sql.VarChar, name: sql.VarChar, blockElo: sql.Int, blockCommands: sql.Int, blockReplay: sql.Int, blockChannelElo: sql.Int, blockServerElo: sql.Int, blockGlobalElo: sql.Int })
                    ];
                }
            });
        });
    };
    //discordUser
    DB.getDiscordUser = function (discordId) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, userStore.findOne({ discordId: discordId })
                        //const xx = await DB.exec("Select * from discordUsers where id = '" + discordId + "';")
                    ];
                    case 1:
                        user = _a.sent();
                        //const xx = await DB.exec("Select * from discordUsers where id = '" + discordId + "';")
                        if (!user)
                            return [2 /*return*/, null];
                        return [2 /*return*/, {
                                id: String(user.id),
                                playerId: user.playerId,
                                serverAdmin: JSON.parse(user.serverAdmin),
                                globalAdmin: Boolean(user.globalAdmin),
                                impliedName: String(user.impliedName)
                            }];
                }
            });
        });
    };
    DB.getDiscordUserFromEugenId = function (eugenId) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, userStore.findOne({ eugenId: eugenId })
                        //const xx = await DB.exec("Select * from discordUsers where playerId =  " + eugenId + ";")
                    ];
                    case 1:
                        user = _a.sent();
                        //const xx = await DB.exec("Select * from discordUsers where playerId =  " + eugenId + ";")
                        if (!user)
                            return [2 /*return*/, null];
                        return [2 /*return*/, {
                                id: String(user.id),
                                playerId: user.playerId,
                                serverAdmin: JSON.parse(user.serverAdmin),
                                globalAdmin: Boolean(user.globalAdmin),
                                impliedName: String(user.impliedName)
                            }];
                }
            });
        });
    };
    DB.setDiscordUser = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = {
                            id: String(user.id),
                            playerId: user.playerId,
                            serverAdmin: "" + JSON.stringify(user.serverAdmin),
                            globalAdmin: user.globalAdmin,
                            impliedName: user.impliedName
                        };
                        console.log(data);
                        return [4 /*yield*/, userStore.update({ _id: data.id }, data, { upsert: true })
                            // return await DB.exec(DB.setDiscordUserSql, data, { id: sql.VarChar, playerId: sql.Int, globalAdmin: sql.Bit, serverAdmin: sql.Text, impliedName: sql.Text })
                        ];
                    case 1: return [2 /*return*/, _a.sent()
                        // return await DB.exec(DB.setDiscordUserSql, data, { id: sql.VarChar, playerId: sql.Int, globalAdmin: sql.Bit, serverAdmin: sql.Text, impliedName: sql.Text })
                    ];
                }
            });
        });
    };
    //Called on ready in discordBot.ts
    DB.saveNewServers = function (client) {
        return __awaiter(this, void 0, void 0, function () {
            var servers, _i, servers_1, server, savedServer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        servers = DB.getSodbotServers(client);
                        _i = 0, servers_1 = servers;
                        _a.label = 1;
                    case 1:
                        if (!(_i < servers_1.length)) return [3 /*break*/, 4];
                        server = servers_1[_i];
                        return [4 /*yield*/, DB.getServer(server._id)];
                    case 2:
                        savedServer = _a.sent();
                        console.log(server._id);
                        console.log(savedServer);
                        if (savedServer == null) {
                            console.log("new");
                            DB.setServer(server);
                            // DB.setRedis(server);
                        }
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DB.getSodbotServers = function (client) {
        // let servers: DiscordServer[];
        // client.guilds.cache.forEach(guild => {
        //    servers.push(new DiscordServer(guild.id, guild.name));
        // });
        // let servers :DiscordServer[]
        //  client.guilds.cache.map(guild => {
        //     new DiscordServer(guild.id);
        // }, servers);
        var servers = new Array();
        var guildIds = client.guilds.cache.map(function (guild) { return guild.id; });
        guildIds.forEach(function (guild) { return servers.push(new DiscordServer(guild)); });
        if (servers == null || servers.length == 0) {
            console.log("empty");
        }
        return servers;
        // client.on("ready", () => {
        //     const Guilds = client.guilds.cache.map(guild => guild.id);
        //     console.log(Guilds);
        // });
    };
    // static setRedis(server: DiscordServer): void {
    //     // redisClient.set("servers", JSON.stringify(servers));
    //     const data = {
    //         primaryMode: server.primaryMode,
    //         oppositeChannelIds: server.oppositeChannelIds
    //     }
    //     redisClient.set(server._id, JSON.stringify(data));
    // }
    // static getFromRedis(serverId: string): DiscordServer {
    //     const data = redisClient.get(serverId);
    //     const parsed = data.parse();
    //     return new DiscordServer(serverId, parsed.primaryMode, parsed.oppositeChannelIds);
    // }
    //Other functions
    DB.getGlobalLadder = function () {
        return __awaiter(this, void 0, void 0, function () {
            var users;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, eloStore.find({})
                        // const sql = "SELECT players.id as eugenid, pickBanElo, elo, discordUsers.id as discordId, discordUsers.impliedName as discordName, players.impliedName as eugenName, players.lastPlayed as lastActive FROM players LEFT JOIN discordUsers ON discordUsers.playerId = players.id ORDER BY players.elo DESC"
                        //  const ret = new Array<EloLadderElement>();
                    ];
                    case 1:
                        users = _a.sent();
                        // const sql = "SELECT players.id as eugenid, pickBanElo, elo, discordUsers.id as discordId, discordUsers.impliedName as discordName, players.impliedName as eugenName, players.lastPlayed as lastActive FROM players LEFT JOIN discordUsers ON discordUsers.playerId = players.id ORDER BY players.elo DESC"
                        //  const ret = new Array<EloLadderElement>();
                        return [2 /*return*/, users.map(function (elo, index) {
                                return {
                                    rank: index + 1,
                                    elo: Number(elo.elo),
                                    discordId: String(elo.discordId),
                                    name: String(elo.eugenName),
                                    lastActive: new Date(elo.lastActive)
                                };
                            })];
                }
            });
        });
    };
    DB.getServerLadder = function (serverId) {
        return __awaiter(this, void 0, void 0, function () {
            var users;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, eloStore.find({ serverId: serverId })
                        // const sql = "SELECT players.id as eugenid, pickBanElo, elo, discordUsers.id as discordId, discordUsers.impliedName as discordName, players.impliedName as eugenName, players.lastPlayed as lastActive FROM players LEFT JOIN discordUsers ON discordUsers.playerId = players.id ORDER BY players.elo DESC"
                        //  const ret = new Array<EloLadderElement>();
                    ];
                    case 1:
                        users = _a.sent();
                        // const sql = "SELECT players.id as eugenid, pickBanElo, elo, discordUsers.id as discordId, discordUsers.impliedName as discordName, players.impliedName as eugenName, players.lastPlayed as lastActive FROM players LEFT JOIN discordUsers ON discordUsers.playerId = players.id ORDER BY players.elo DESC"
                        //  const ret = new Array<EloLadderElement>();
                        return [2 /*return*/, users.map(function (elo, index) {
                                return {
                                    rank: index + 1,
                                    elo: Number(elo.elo),
                                    discordId: String(elo.discordId),
                                    name: String(elo.eugenName),
                                    lastActive: new Date(elo.lastActive)
                                };
                            })];
                }
            });
        });
    };
    /*
    static async getPlayerElo(eugenId:number): Promise<Player> {
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

  
    static async createPlayerElo(eugenId: number) {
      const data = {
        playerId: eugenId
      }
        await DB.exec(DB.addPlayerEloSql,data,{playerId:sql.Int})
        return
    }
    */
    DB.init = function () {
        // this.saveNewServers(client);
        console.log("DB initialized");
    };
    // Returns 0 for new replay and 1 for existing replay
    DB.setReplay = function (message, replay) {
        return __awaiter(this, void 0, void 0, function () {
            var existing, replayData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, replayStore.find({ uuid: replay.uniqueSessionId })];
                    case 1:
                        existing = _a.sent();
                        replayData = {
                            discordId: message.author.id,
                            serverId: message.guild.id,
                            channelId: message.channel.id,
                            replay: JSON.stringify(replay),
                            uuid: replay.uniqueSessionId
                        };
                        logs_1.Logs.log("Committing replay: " + replayData.uuid);
                        return [4 /*yield*/, replayStore.update({ uuid: replayData.uuid }, replay, { upsert: true })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, existing ? 1 : 0
                            // return await DB.exec(DB.addReplaySql, dbRow, type)
                        ];
                }
            });
        });
    };
    //This is expensive. And an unprepared statement. and it returns *....
    //it needs work. @todo
    DB.getReplaysByEugenId = function (eugenId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, replayStore.find({ eugenId: eugenId })
                        // return DB.exec("SELECT * FROM replays WHERE JSON_VALUE(cast([replay] as nvarchar(max)), '$.players[0].id') LIKE '" + eugenId + "' OR JSON_VALUE(cast([replay] as nvarchar(max)), '$.players[1].id') LIKE '" + eugenId + "' ORDER BY uploadedAt DESC;")
                    ];
                    case 1: return [2 /*return*/, _a.sent()
                        // return DB.exec("SELECT * FROM replays WHERE JSON_VALUE(cast([replay] as nvarchar(max)), '$.players[0].id') LIKE '" + eugenId + "' OR JSON_VALUE(cast([replay] as nvarchar(max)), '$.players[1].id') LIKE '" + eugenId + "' ORDER BY uploadedAt DESC;")
                    ];
                }
            });
        });
    };
    DB.exec = function () {
        var dots = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            dots[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log("Not implemented");
                return [2 /*return*/, { rowCount: 0, rows: [] }];
            });
        });
    };
    return DB;
}());
exports.DB = DB;
var DiscordServer = /** @class */ (function () {
    function DiscordServer(id, primaryMode, oppositeChannelIds) {
        if (primaryMode === void 0) { primaryMode = "sd2"; }
        if (oppositeChannelIds === void 0) { oppositeChannelIds = new Array(); }
        this._id = id;
        this.primaryMode = primaryMode;
        this.oppositeChannelIds = oppositeChannelIds;
    }
    return DiscordServer;
}());
exports.DiscordServer = DiscordServer;
exports.default = DB;
//# sourceMappingURL=db.js.map