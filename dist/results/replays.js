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
exports.Replays = void 0;
var discord_js_1 = require("discord.js");
var gameParser_1 = require("sd2-utilities/lib/parser/gameParser");
var sd2_data_1 = require("sd2-data");
var axios = require("axios");
var discordBot_1 = require("../general/discordBot");
var rating_1 = require("./rating");
var ax = axios.default;
var Replays = /** @class */ (function () {
    function Replays() {
    }
    Replays.extractReplayInfo = function (message, perms, database) {
        var _this = this;
        var url = message.attachments.first().url;
        var ratingEng = new rating_1.RatingEngine(database);
        ax.get(url).then(function (res) { return __awaiter(_this, void 0, void 0, function () {
            var g, replayPlayer, updatedDocumentCount, winners, loosers, winnerList, looserList, ratings, channel, _i, _a, player, playerid, replayPlayer_1, replayPlayer_2, replayPlayer_3, p1Elo, p2Elo, _b, _c, player, playerid, replayPlayer_4, replayPlayer_5, replayPlayer_6, p1Elo, p2Elo, p1Elo, p2Elo, winnersLength, losersLength, i, i, embed, _d, _e, player, playerid, playerElo, discordId, discordUser, user, raitingsString, counter, _f, _g, player, playerid, playerElo, discordId, discordUser, user;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        g = gameParser_1.GameParser.parseRaw(res.data);
                        replayPlayer = g.players[g.ingamePlayerId];
                        return [4 /*yield*/, database.setReplay(message, g)];
                    case 1:
                        updatedDocumentCount = _h.sent();
                        message.channel.send("Results Submitted");
                        // and check if game has been uploaded in a non-ELO channel
                        if (!perms.isEloComputed) {
                            discordBot_1.MsgHelper.say(message, "This game is unranked");
                        }
                        // and check the game is 1v1, if it isn't warn that results will not be rated
                        else if (g.players.length > 2) {
                            discordBot_1.MsgHelper.say(message, "This reply is not a 1v1 player game, outcome will not be used in ELO");
                        }
                        // and check if the game already existed in DB 
                        else if (updatedDocumentCount == 1) {
                            discordBot_1.MsgHelper.say(message, "This is a duplicate upload and will not be counted for ELO");
                        }
                        // and check if the game already existed in DB 
                        else if (g.version < 51345) {
                            discordBot_1.MsgHelper.say(message, "This replay is from a older version of the game and won't be used in ELO Calcs");
                        }
                        winners = "";
                        loosers = "";
                        winnerList = [];
                        looserList = [];
                        return [4 /*yield*/, discordBot_1.DiscordBot.bot.channels.fetch(message.channel.id)];
                    case 2:
                        channel = _h.sent();
                        if (!(g.result.victory < 3)) return [3 /*break*/, 8];
                        for (_i = 0, _a = g.players; _i < _a.length; _i++) {
                            player = _a[_i];
                            playerid = player.name;
                            if (g.players.length == 2) {
                                if (g.ingamePlayerId == player.alliance) {
                                    loosers += playerid;
                                    looserList.push(player);
                                }
                                else {
                                    winners += playerid;
                                    winnerList.push(player);
                                }
                            }
                            else if (g.players.length == 4) {
                                replayPlayer_1 = 0;
                                if (g.ingamePlayerId == 2 || g.ingamePlayerId == 3) {
                                    replayPlayer_1 = 1;
                                }
                                if (replayPlayer_1 == player.alliance) {
                                    loosers += playerid + "\n";
                                    looserList.push(player);
                                }
                                else {
                                    winners += playerid + "\n";
                                    winnerList.push(player);
                                }
                            }
                            else if (g.players.length == 6) {
                                replayPlayer_2 = 0;
                                if (g.ingamePlayerId == 3 || g.ingamePlayerId == 4 || g.ingamePlayerId == 4) {
                                    replayPlayer_2 = 1;
                                }
                                if (replayPlayer_2 == player.alliance) {
                                    loosers += playerid + "\n";
                                    looserList.push(player);
                                }
                                else {
                                    winners += playerid + "\n";
                                    winnerList.push(player);
                                }
                            }
                            else if (g.players.length == 8) {
                                replayPlayer_3 = 0;
                                if (g.ingamePlayerId == 4 || g.ingamePlayerId == 5 || g.ingamePlayerId == 6 || g.ingamePlayerId == 7) {
                                    replayPlayer_3 = 1;
                                }
                                if (replayPlayer_3 == player.alliance) {
                                    loosers += playerid + "\n";
                                    looserList.push(player);
                                }
                                else {
                                    winners += playerid + "\n";
                                    winnerList.push(player);
                                }
                            }
                        }
                        if (!(g.players.length == 2 && updatedDocumentCount == 0 && perms.isEloComputed && g.version >= 51345)) return [3 /*break*/, 7];
                        return [4 /*yield*/, database.getElos(winnerList[0].id, message.channel.id, message.guild.id)];
                    case 3:
                        p1Elo = _h.sent();
                        return [4 /*yield*/, database.getElos(looserList[0].id, message.channel.id, message.guild.id)];
                    case 4:
                        p2Elo = _h.sent();
                        ratings = ratingEng.rateMatch(p1Elo, p2Elo, 1);
                        return [4 /*yield*/, database.setElos(ratings.p1, { impliedName: winnerList[0].name, serverName: message.guild.name, channelName: channel.name })];
                    case 5:
                        _h.sent();
                        return [4 /*yield*/, database.setElos(ratings.p2, { impliedName: looserList[0].name, serverName: message.guild.name, channelName: channel.name })];
                    case 6:
                        _h.sent();
                        ratingEng.doDivisionElo(winnerList[0].deck, looserList[0].deck, 5);
                        _h.label = 7;
                    case 7: return [3 /*break*/, 19];
                    case 8:
                        if (!(g.result.victory > 3)) return [3 /*break*/, 14];
                        for (_b = 0, _c = g.players; _b < _c.length; _b++) {
                            player = _c[_b];
                            playerid = player.name;
                            if (g.players.length == 2) {
                                if (g.ingamePlayerId != player.alliance) {
                                    loosers += playerid;
                                    looserList.push(player);
                                }
                                else {
                                    winners += playerid;
                                    winnerList.push(player);
                                }
                            }
                            else if (g.players.length == 4) {
                                replayPlayer_4 = 0;
                                if (g.ingamePlayerId == 2 || g.ingamePlayerId == 3) {
                                    replayPlayer_4 = 1;
                                }
                                if (replayPlayer_4 != player.alliance) {
                                    loosers += playerid + "\n";
                                    looserList.push(player);
                                }
                                else {
                                    winners += playerid + "\n";
                                    winnerList.push(player);
                                }
                            }
                            else if (g.players.length == 6) {
                                replayPlayer_5 = 0;
                                if (g.ingamePlayerId == 3 || g.ingamePlayerId == 4 || g.ingamePlayerId == 4) {
                                    replayPlayer_5 = 1;
                                }
                                if (replayPlayer_5 != player.alliance) {
                                    loosers += playerid + "\n";
                                    looserList.push(player);
                                }
                                else {
                                    winners += playerid + "\n";
                                    winnerList.push(player);
                                }
                            }
                            else if (g.players.length == 8) {
                                replayPlayer_6 = 0;
                                if (g.ingamePlayerId == 4 || g.ingamePlayerId == 5 || g.ingamePlayerId == 6 || g.ingamePlayerId == 7) {
                                    replayPlayer_6 = 1;
                                }
                                if (replayPlayer_6 != player.alliance) {
                                    loosers += playerid + "\n";
                                    looserList.push(player);
                                }
                                else {
                                    winners += playerid + "\n";
                                    winnerList.push(player);
                                }
                            }
                        }
                        if (!(g.players.length == 2 && updatedDocumentCount == 0 && perms.isEloComputed && g.version >= 51345)) return [3 /*break*/, 13];
                        return [4 /*yield*/, database.getElos(winnerList[0].id, message.channel.id, message.guild.id)];
                    case 9:
                        p1Elo = _h.sent();
                        return [4 /*yield*/, database.getElos(looserList[0].id, message.channel.id, message.guild.id)];
                    case 10:
                        p2Elo = _h.sent();
                        ratings = ratingEng.rateMatch(p1Elo, p2Elo, 1);
                        return [4 /*yield*/, database.setElos(ratings.p1, { impliedName: winnerList[0].name, serverName: message.guild.name, channelName: channel.name })];
                    case 11:
                        _h.sent();
                        return [4 /*yield*/, database.setElos(ratings.p2, { impliedName: looserList[0].name, serverName: message.guild.name, channelName: channel.name })];
                    case 12:
                        _h.sent();
                        ratingEng.doDivisionElo(winnerList[0].deck, looserList[0].deck, 5);
                        _h.label = 13;
                    case 13: return [3 /*break*/, 19];
                    case 14:
                        winners = "no one";
                        loosers = "everyone";
                        if (!(g.players.length == 2 && updatedDocumentCount == 0 && perms.isEloComputed && g.version >= 51345)) return [3 /*break*/, 19];
                        return [4 /*yield*/, database.getElos(g.players[0].id, message.channel.id, message.guild.id)];
                    case 15:
                        p1Elo = _h.sent();
                        return [4 /*yield*/, database.getElos(g.players[1].id, message.channel.id, message.guild.id)];
                    case 16:
                        p2Elo = _h.sent();
                        ratings = ratingEng.rateMatch(p1Elo, p2Elo, .5);
                        return [4 /*yield*/, database.setElos(ratings.p1, { impliedName: g.players[0].name, serverName: message.guild.name, channelName: channel.name })];
                    case 17:
                        _h.sent();
                        return [4 /*yield*/, database.setElos(ratings.p2, { impliedName: g.players[1].name, serverName: message.guild.name, channelName: channel.name })];
                    case 18:
                        _h.sent();
                        ratingEng.doDivisionElo(winnerList[0].deck, looserList[0].deck, 3);
                        _h.label = 19;
                    case 19:
                        // For 1v1 Adjust Winner & Losers Fields to be same length
                        if (g.players.length == 2) {
                            winnersLength = winners.length;
                            losersLength = loosers.length;
                            if (winnersLength < 19) {
                                for (i = winnersLength; i < 19; i++) {
                                    winners = winners.concat("-");
                                }
                            }
                            else {
                                winners = winners.substring(0, 19);
                            }
                            if (losersLength < 20) {
                                for (i = losersLength; i < 19; i++) {
                                    loosers = loosers.concat("-");
                                }
                            }
                            else {
                                loosers = loosers.substring(0, 19);
                            }
                        }
                        embed = new discord_js_1.MessageEmbed()
                            .setTitle(g.serverName)
                            .setColor("#0099ff")
                            .addField("Winner", "||".concat(winners, "||"), true)
                            .addField("Loser", "||".concat(loosers, "||"), true)
                            .addField("victoryState", "||".concat(sd2_data_1.misc.victory[g.result.victory], "||"), true)
                            .addField("Duration", "||".concat(Replays.duration(g.result.duration), "||"), true)
                            .setFooter("Game Version: ".concat(g.version))
                            .addField("Score Limit", g.scoreLimit, true)
                            .addField("Time Limit", g.timeLimit, true)
                            .addField('Income Rate', sd2_data_1.misc.incomeLevel[g.incomeRate], true)
                            .addField('Game Mode', sd2_data_1.misc.mode[g.gameMode], true)
                            .addField('Starting Points', g.initMoney + " pts", true)
                            .addField('Map', sd2_data_1.misc.map[g.map_raw], true);
                        if (!(g.players.length < 4)) return [3 /*break*/, 26];
                        _d = 0, _e = g.players;
                        _h.label = 20;
                    case 20:
                        if (!(_d < _e.length)) return [3 /*break*/, 26];
                        player = _e[_d];
                        playerid = player.name;
                        playerElo = player.elo;
                        discordId = "";
                        return [4 /*yield*/, database.getDiscordUserFromEugenId(player.id)];
                    case 21:
                        discordUser = _h.sent();
                        if (discordUser)
                            discordId = discordUser.id;
                        if (!(discordId != "")) return [3 /*break*/, 23];
                        return [4 /*yield*/, discordBot_1.DiscordBot.bot.users.fetch(String(discordId))];
                    case 22:
                        user = _h.sent();
                        if (!user)
                            playerid = "BORKED! Please yell at <@!271792666910392325>";
                        else
                            playerid += " *<@!" + user.id + ">*";
                        return [3 /*break*/, 24];
                    case 23:
                        playerid += "(id:" + player.id + ")";
                        _h.label = 24;
                    case 24:
                        raitingsString = function (delta) {
                            var sign = "";
                            if (delta > 0)
                                sign = "+";
                            return sign + Math.round(delta);
                        };
                        // This code is not longer used as the bot has lost the elo db
                        //if(g.players.length == 2 && updatedDocumentCount == 0 && perms.isEloComputed && g.version >= 51345){
                        //    if(ratings.p1.eugenId == player.id){
                        //        if (perms.isChannelEloShown){            
                        //            elo += `Channel ELO: ||${Math.round(ratings.p1.channelElo)} (${raitingsString(ratings.p1.channelDelta)})||`
                        //        }
                        //        if (perms.isServerEloShown){
                        //            elo += `\nServer ELO: ||${Math.round(ratings.p1.serverElo)}   (${raitingsString(ratings.p1.serverDelta)})||`
                        //        }
                        //        if (perms.isGlobalEloShown){
                        //            elo += `\nGlobal ELO: ||${Math.round(ratings.p1.globalElo)}   (${raitingsString(ratings.p1.globalDelta)})||`
                        //        }
                        //    } else if(ratings.p2.eugenId == player.id){
                        //        if (perms.isChannelEloShown){            
                        //            elo += `Channel ELO: ||${Math.round(ratings.p2.channelElo)} (${raitingsString(ratings.p2.channelDelta)})||`
                        //        }
                        //        if (perms.isServerEloShown){
                        //            elo += `\nServer ELO: ||${Math.round(ratings.p2.serverElo)}   (${raitingsString(ratings.p2.serverDelta)})||`
                        //        }
                        //        if (perms.isGlobalEloShown){
                        //            elo += `\nGlobal ELO: ||${Math.round(ratings.p2.globalElo)}   (${raitingsString(ratings.p2.globalDelta)})||`
                        //        }
                        //    }
                        //} 
                        //else {
                        //        const elox = await DB.getElos(player.id,message.channel.id,message.guild.id)
                        //        if (perms.isChannelEloShown){            
                        //            elo += `Channel ELO: ${Math.round(elox.channelElo)}`
                        //        }
                        //        if (perms.isServerEloShown){
                        //            elo += `\nServer ELO: ${Math.round(elox.serverElo)}`
                        //        }
                        //        if (perms.isGlobalEloShown){
                        //            elo += `\nGlobal ELO: ${Math.round(elox.globalElo)}`
                        //        }
                        //}
                        // Add the player details to the embed
                        embed = embed.addField("\u200b", "-------------------------------------------------")
                            .addField("Player", playerid, false)
                            .addField("Elo", playerElo, false)
                            .addField("Division", player.deck.division, true)
                            .addField("Income", player.deck.income, true)
                            .addField("Deck Code", player.deck.raw.code, false);
                        _h.label = 25;
                    case 25:
                        _d++;
                        return [3 /*break*/, 20];
                    case 26:
                        message.channel.send(embed);
                        if (!(g.players.length >= 4)) return [3 /*break*/, 34];
                        counter = 0;
                        embed = new discord_js_1.MessageEmbed()
                            .setColor("#0099ff");
                        _f = 0, _g = g.players;
                        _h.label = 27;
                    case 27:
                        if (!(_f < _g.length)) return [3 /*break*/, 33];
                        player = _g[_f];
                        playerid = player.name;
                        playerElo = player.elo;
                        discordId = "";
                        return [4 /*yield*/, database.getDiscordUserFromEugenId(player.id)];
                    case 28:
                        discordUser = _h.sent();
                        if (discordUser)
                            discordId = discordUser.id;
                        if (!(discordId != "")) return [3 /*break*/, 30];
                        return [4 /*yield*/, discordBot_1.DiscordBot.bot.users.fetch(String(discordId))];
                    case 29:
                        user = _h.sent();
                        if (!user)
                            playerid = "BORKED! Please yell at <@!271792666910392325>";
                        else
                            playerid += "*<@!" + user.id + ">*";
                        return [3 /*break*/, 31];
                    case 30:
                        playerid += " (id:" + player.id + ")";
                        _h.label = 31;
                    case 31:
                        // This code is no longer used as bot has lost the elo DB
                        //let elo = ""
                        //const elox = await DB.getElos(player.id,message.channel.id,message.guild.id)
                        //        if (perms.isChannelEloShown){            
                        //            elo += `Channel ELO: ${Math.round(elox.channelElo)}`
                        //        }
                        //        if (perms.isServerEloShown){
                        //            elo += `\nServer ELO: ${Math.round(elox.serverElo)}`
                        //        }
                        //        if (perms.isGlobalEloShown){
                        //            elo += `\nGlobal ELO: ${Math.round(elox.globalElo)}`
                        //        }
                        embed = embed.addField("-------------------------------------------------", "\u200B")
                            .addField("Player", playerid, false)
                            .addField("Elo", playerElo, false)
                            .addField("Division", player.deck.division, true)
                            .addField("Income", player.deck.income, true)
                            .addField("Deck Code", player.deck.raw.code, false);
                        counter++;
                        if (counter == 4) {
                            message.channel.send(embed);
                            embed = new discord_js_1.MessageEmbed()
                                .setColor("#0099ff");
                            counter = 0;
                        }
                        _h.label = 32;
                    case 32:
                        _f++;
                        return [3 /*break*/, 27];
                    case 33:
                        message.channel.send(embed);
                        _h.label = 34;
                    case 34: return [2 /*return*/];
                }
            });
        }); });
    };
    Replays.duration = function (seconds) {
        return "".concat(Math.floor(seconds / 60), " Minutes and ").concat(seconds % 60, " Seconds");
    };
    return Replays;
}());
exports.Replays = Replays;
//# sourceMappingURL=replays.js.map