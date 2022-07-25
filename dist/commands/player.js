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
exports.PlayerCommandHelper = exports.PlayerCommand = void 0;
var discordBot_1 = require("../general/discordBot");
var discord_js_1 = require("discord.js");
var db_1 = require("../general/db");
var sd2_data_1 = require("sd2-data");
var logs_1 = require("../general/logs");
var common_1 = require("../general/common");
var PlayerCommand = /** @class */ (function () {
    function PlayerCommand() {
    }
    PlayerCommand.getPlayer = function (message, input, perms) {
        return __awaiter(this, void 0, void 0, function () {
            var embed, player, icon, usr, Elos, xx, uploadDate, opponent, playerDiv, opponentDiv, gameMap, gameResult, numGames, i, x, replayString, replayJson, _i, _a, player_1, _b, _c, player_2;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        embed = new discord_js_1.MessageEmbed();
                        //Determine the target player
                        if (input.length == 0) {
                            player = message.author.id;
                            icon = message.author.displayAvatarURL();
                        }
                        else if (input.length == 1) {
                            player = input[0].slice(3, -1); //this is magic.
                            usr = message.mentions.users.first();
                            icon = usr.displayAvatarURL();
                        }
                        else {
                            discordBot_1.MsgHelper.reply(message, "This command can only query 1 player at a time");
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, db_1.DB.getDiscordElos(player, message.channel.id, message.guild.id)];
                    case 1:
                        Elos = _d.sent();
                        console.log(Elos);
                        if (Elos == null) {
                            if (input.length == 0)
                                discordBot_1.MsgHelper.reply(message, "You are not currently registered to the bot, please use $register \"EugenId\" to register to the bot");
                            else
                                discordBot_1.MsgHelper.reply(message, "That player is not currently registered to the bot, the player needs to use $register \"EugenId\" to register to the bot");
                            return [2 /*return*/];
                        }
                        embed.setTitle("Player Details");
                        embed.setColor("75D1EA");
                        embed.addField("Player Name", "<@!" + player + ">", false);
                        embed.setThumbnail(icon);
                        // Add ELO Data
                        if (perms.isChannelEloShown) {
                            embed.addField("Channel Rating", Math.round(Elos.channelElo), true);
                        }
                        if (perms.isServerEloShown) {
                            embed.addField("Server Rating", Math.round(Elos.serverElo), true);
                        }
                        if (perms.isGlobalEloShown) {
                            embed.addField("Global Rating", Math.round(Elos.globalElo), true);
                            embed.addField("\u200b", "\u200b", true);
                        }
                        return [4 /*yield*/, db_1.DB.getReplaysByEugenId(Elos.eugenId)];
                    case 2:
                        xx = _d.sent();
                        uploadDate = "";
                        opponent = "";
                        playerDiv = "";
                        opponentDiv = "";
                        gameMap = "";
                        gameResult = "";
                        numGames = 0;
                        //Check that rows were returned (ie Game Replays for this player exist)
                        if (xx.rows.length > 0) {
                            embed.addFields([
                                { name: "Recent 1v1 Matches", value: "-----------------------------------------------------", inline: false }
                            ]);
                            if (xx.rows.length > 3) {
                                numGames = 3;
                            }
                            else {
                                numGames = xx.rows.length;
                            }
                            for (i = 0; i < numGames; i++) {
                                x = xx.rows[i];
                                try {
                                    replayString = x.replay;
                                    replayJson = JSON.parse(replayString);
                                    console.log(replayJson.players.length);
                                    //Check that each row is a 1v1 match    
                                    if (replayJson.players.length == 2) {
                                        //Identify the date uploaded
                                        uploadDate = common_1.CommonUtil.formatDate(x.uploadedAt);
                                        //Identify who the opponent was
                                        if (replayJson.players[0].id != Elos.eugenId) {
                                            opponent = replayJson.players[0].name + "\n";
                                            opponentDiv = replayJson.players[0].deck.division;
                                            playerDiv = replayJson.players[1].deck.division;
                                        }
                                        else {
                                            opponent = replayJson.players[1].name + "\n";
                                            opponentDiv = replayJson.players[1].deck.division;
                                            playerDiv = replayJson.players[0].deck.division;
                                        }
                                        //Identify the map played
                                        gameMap = sd2_data_1.misc.map[replayJson.map_raw] + "\n";
                                        //Identify the result 
                                        if (replayJson.result.victory > 3) {
                                            for (_i = 0, _a = replayJson.players; _i < _a.length; _i++) {
                                                player_1 = _a[_i];
                                                if (replayJson.ingamePlayerId = player_1.alliance)
                                                    if (player_1.name = Elos.eugenId)
                                                        gameResult = "Victory" + "\n";
                                                    else
                                                        gameResult = "Defeat" + "\n";
                                            }
                                        }
                                        else if (replayJson.result.victory < 3) {
                                            for (_b = 0, _c = replayJson.players; _b < _c.length; _b++) {
                                                player_2 = _c[_b];
                                                if (replayJson.ingamePlayerId = player_2.alliance)
                                                    if (player_2.name = Elos.eugenId)
                                                        gameResult = "Defeat" + "\n";
                                                    else
                                                        gameResult = "Victory" + "\n";
                                            }
                                        }
                                        else {
                                            gameResult = "Draw" + "\n";
                                        }
                                        embed.addFields([
                                            { name: "Uploaded", value: uploadDate, inline: true },
                                            { name: "Map", value: gameMap, inline: true },
                                            { name: "Result", value: gameResult, inline: true },
                                            { name: "Player Division", value: playerDiv, inline: false },
                                            { name: "Opponent Division", value: opponentDiv, inline: true },
                                            { name: "Opponent", value: opponent, inline: true },
                                            { name: "---------------------------", value: "\u200b", inline: false }
                                        ]);
                                    }
                                }
                                catch (err) {
                                    console.log("Error happended here");
                                    console.error(err);
                                }
                            }
                        }
                        else {
                            console.log("No Games found");
                        }
                        //Send Final Embed  
                        discordBot_1.MsgHelper.say(message, embed, false);
                        return [2 /*return*/];
                }
            });
        });
    };
    PlayerCommand.pad = function (num) {
        var rounded = Math.round(num * 10) / 10;
        var fixed = rounded.toFixed(1);
        return fixed.padEnd(7);
    };
    PlayerCommand.getLadder = function (message, input, perms) {
        return __awaiter(this, void 0, void 0, function () {
            var ladder, embed, playerDetails, yearAgoTime, x, playerFound;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!perms.isGlobalEloShown) return [3 /*break*/, 2];
                        return [4 /*yield*/, db_1.DB.getGlobalLadder()];
                    case 1:
                        ladder = _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, db_1.DB.getServerLadder(message.guild.id)];
                    case 3:
                        ladder = _a.sent();
                        _a.label = 4;
                    case 4:
                        embed = new discord_js_1.MessageEmbed();
                        embed.setTitle("Top Players");
                        embed.setColor("75D1EA");
                        playerDetails = "";
                        yearAgoTime = new Date();
                        yearAgoTime.setFullYear(yearAgoTime.getFullYear() - 1);
                        x = 0;
                        playerFound = false;
                        while (x < ladder.length || (playerFound && x >= 25)) {
                            if (yearAgoTime < ladder[x].lastActive) {
                                if (x < 15) {
                                    if (ladder[x].discordId != "null") {
                                        playerDetails += ladder[x].rank + ":    \u2003" + PlayerCommand.pad(ladder[x].elo) + "\u2003<@!" + ladder[x].discordId + "> \n";
                                        if (ladder[x].discordId == message.author.id)
                                            playerFound = true;
                                    }
                                    else {
                                        playerDetails += ladder[x].rank + ":    \u2003" + PlayerCommand.pad(ladder[x].elo) + "\u2003 " + ladder[x].name + "\n";
                                    }
                                }
                                else {
                                    if (ladder[x].discordId != "null" && ladder[x].discordId == message.author.id) {
                                        playerDetails += ladder[x].rank + ":    \u2003" + PlayerCommand.pad(ladder[x].elo) + "\u2003<@!" + ladder[x].discordId + "> \n";
                                    }
                                }
                            }
                            x++;
                        }
                        if (ladder.length == 0 || playerDetails.length == 0) {
                            discordBot_1.MsgHelper.reply(message, "Noone uploaded a ranked replay within a year. The ladder is empty.");
                            return [2 /*return*/];
                        }
                        embed.addField("Pos      Elo           Name", playerDetails, true);
                        //Send Final Embed
                        //embed.setDescription("For full global leaderboard please goto http://eugenplz.com") --site isn't ready
                        embed.setFooter("Only those players who have been involved in a submitted match in the last year will appear in the ladder");
                        discordBot_1.MsgHelper.say(message, embed, false);
                        return [2 /*return*/];
                }
            });
        });
    };
    //Register a player to the bot
    PlayerCommand.register = function (message, input) {
        var _this = this;
        if (input.length == 1 && Number(input[0])) {
            (function () { return __awaiter(_this, void 0, void 0, function () {
                var user;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, db_1.DB.getDiscordUserFromEugenId(Number(input[0]))];
                        case 1:
                            user = _a.sent();
                            if (!user) return [3 /*break*/, 5];
                            if (!(user.id = message.author.id)) return [3 /*break*/, 2];
                            discordBot_1.MsgHelper.reply(message, "you are already registered to Eugen account " + input[0]);
                            logs_1.Logs.log("Eugen account " + input[0] + "is already registered to user " + user.id);
                            return [3 /*break*/, 4];
                        case 2:
                            user.id = (message.author.id);
                            return [4 /*yield*/, db_1.DB.setDiscordUser(user)];
                        case 3:
                            _a.sent();
                            discordBot_1.MsgHelper.reply(message, "Eugen account " + input[0] + " has been updated to your discord userid");
                            logs_1.Logs.log("Changed eugen account " + input[0] + " to user " + user.id);
                            _a.label = 4;
                        case 4: return [3 /*break*/, 7];
                        case 5:
                            console.log(Number(message.author.id));
                            user = {
                                id: (message.author.id),
                                playerId: Number(input[0]),
                                serverAdmin: [],
                                globalAdmin: false,
                                impliedName: message.author.username
                            };
                            return [4 /*yield*/, db_1.DB.setDiscordUser(user)];
                        case 6:
                            _a.sent();
                            discordBot_1.MsgHelper.reply(message, "Eugen account " + input[0] + " has been added to the Player Database and connected to your Discord userid");
                            logs_1.Logs.log("Added eugen account " + input[0] + " to user " + user.id);
                            _a.label = 7;
                        case 7: return [2 /*return*/];
                    }
                });
            }); })();
        }
    };
    return PlayerCommand;
}());
exports.PlayerCommand = PlayerCommand;
var PlayerCommandHelper = /** @class */ (function () {
    function PlayerCommandHelper() {
    }
    PlayerCommandHelper.addCommands = function (bot) {
        bot.registerCommand("player", PlayerCommand.getPlayer);
        bot.registerCommand("ladder", PlayerCommand.getLadder);
        bot.registerCommand("register", PlayerCommand.register);
    };
    return PlayerCommandHelper;
}());
exports.PlayerCommandHelper = PlayerCommandHelper;
//# sourceMappingURL=player.js.map