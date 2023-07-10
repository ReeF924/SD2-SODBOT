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
exports.PlayerCommand = void 0;
const discordBot_1 = require("../general/discordBot");
const discord_js_1 = require("discord.js");
const sd2_data_1 = require("sd2-data");
const logs_1 = require("../general/logs");
const common_1 = require("../general/common");
const Command_1 = require("./Command");
class PlayerCommand extends Command_1.CommandDB {
    constructor(database) {
        super(database);
    }
    getPlayer(message, input, perms) {
        return __awaiter(this, void 0, void 0, function* () {
            const embed = new discord_js_1.MessageEmbed();
            let player;
            let icon;
            //Determine the target player
            if (input.length == 0) {
                player = message.author.id;
                icon = message.author.displayAvatarURL();
            }
            else if (input.length == 1) {
                player = input[0].slice(3, -1); //this is magic.
                const usr = message.mentions.users.first();
                icon = usr.displayAvatarURL();
            }
            else {
                discordBot_1.MsgHelper.reply(message, `This command can only query 1 player at a time`);
                return;
            }
            const Elos = yield this.database.getDiscordElos(player, message.channel.id, message.guild.id);
            console.log(Elos);
            if (Elos == null) {
                if (input.length == 0)
                    discordBot_1.MsgHelper.reply(message, `You are not currently registered to the bot, please use $register "EugenId" to register to the bot`);
                else
                    discordBot_1.MsgHelper.reply(message, `That player is not currently registered to the bot, the player needs to use $register "EugenId" to register to the bot`);
                return;
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
            // Extract recent games
            const xx = yield this.database.getReplaysByEugenId(Elos.eugenId);
            let uploadDate = "";
            let opponent = "";
            let playerDiv = "";
            let opponentDiv = "";
            let gameMap = "";
            let gameResult = "";
            let numGames = 0;
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
                for (let i = 0; i < numGames; i++) {
                    const x = xx.rows[i];
                    try {
                        const replayString = x.replay;
                        const replayJson = JSON.parse(replayString);
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
                                for (const player of replayJson.players) {
                                    if (replayJson.ingamePlayerId = player.alliance)
                                        if (player.name = Elos.eugenId)
                                            gameResult = "Victory" + "\n";
                                        else
                                            gameResult = "Defeat" + "\n";
                                }
                            }
                            else if (replayJson.result.victory < 3) {
                                for (const player of replayJson.players) {
                                    if (replayJson.ingamePlayerId = player.alliance)
                                        if (player.name = Elos.eugenId)
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
        });
    }
    pad(num) {
        var rounded = Math.round(num * 10) / 10;
        var fixed = rounded.toFixed(1);
        return fixed.padEnd(7);
    }
    getLadder(message, input, perms) {
        return __awaiter(this, void 0, void 0, function* () {
            let ladder;
            if (perms.isGlobalEloShown)
                ladder = yield this.database.getGlobalLadder();
            else
                ladder = yield this.database.getServerLadder(message.guild.id);
            const embed = new discord_js_1.MessageEmbed();
            embed.setTitle("Top Players");
            embed.setColor("75D1EA");
            var playerDetails = "";
            var yearAgoTime = new Date();
            yearAgoTime.setFullYear(yearAgoTime.getFullYear() - 1);
            let x = 0;
            let playerFound = false;
            while (x < ladder.length || (playerFound && x >= 25)) {
                if (yearAgoTime < ladder[x].lastActive) {
                    if (x < 15) {
                        if (ladder[x].discordId != "null") {
                            playerDetails += ladder[x].rank + ":    \u2003" + this.pad(ladder[x].elo) + "\u2003<@!" + ladder[x].discordId + "> \n";
                            if (ladder[x].discordId == message.author.id)
                                playerFound = true;
                        }
                        else {
                            playerDetails += ladder[x].rank + ":    \u2003" + this.pad(ladder[x].elo) + "\u2003 " + ladder[x].name + "\n";
                        }
                    }
                    else {
                        if (ladder[x].discordId != "null" && ladder[x].discordId == message.author.id) {
                            playerDetails += ladder[x].rank + ":    \u2003" + this.pad(ladder[x].elo) + "\u2003<@!" + ladder[x].discordId + "> \n";
                        }
                    }
                }
                x++;
            }
            if (ladder.length == 0 || playerDetails.length == 0) {
                discordBot_1.MsgHelper.reply(message, "Noone uploaded a ranked replay within a year. The ladder is empty.");
                return;
            }
            embed.addField("Pos      Elo           Name", playerDetails, true);
            //Send Final Embed
            //embed.setDescription("For full global leaderboard please goto http://eugenplz.com") --site isn't ready
            embed.setFooter("Only those players who have been involved in a submitted match in the last year will appear in the ladder");
            discordBot_1.MsgHelper.say(message, embed, false);
        });
    }
    //Register a player to the bot
    register(message, input) {
        if (input.length == 1 && Number(input[0])) {
            (() => __awaiter(this, void 0, void 0, function* () {
                let user = yield this.database.getDiscordUserFromEugenId(Number(input[0]));
                if (user) {
                    if (user.id = message.author.id) {
                        discordBot_1.MsgHelper.reply(message, "you are already registered to Eugen account " + input[0]);
                        logs_1.Logs.log("Eugen account " + input[0] + "is already registered to user " + user.id);
                    }
                    else {
                        user.id = (message.author.id);
                        yield this.database.setDiscordUser(user);
                        discordBot_1.MsgHelper.reply(message, "Eugen account " + input[0] + " has been updated to your discord userid");
                        logs_1.Logs.log("Changed eugen account " + input[0] + " to user " + user.id);
                    }
                }
                else {
                    console.log(Number(message.author.id));
                    user = {
                        id: (message.author.id),
                        playerId: Number(input[0]),
                        serverAdmin: [],
                        globalAdmin: false,
                        impliedName: message.author.username
                    };
                    yield this.database.setDiscordUser(user);
                    discordBot_1.MsgHelper.reply(message, "Eugen account " + input[0] + " has been added to the Player Database and connected to your Discord userid");
                    logs_1.Logs.log("Added eugen account " + input[0] + " to user " + user.id);
                }
            }))();
        }
    }
    addCommands(bot) {
        bot.registerCommand("player", this.getPlayer);
        bot.registerCommand("ladder", this.getLadder);
        bot.registerCommand("register", this.register);
    }
}
exports.PlayerCommand = PlayerCommand;
//# sourceMappingURL=player.js.map