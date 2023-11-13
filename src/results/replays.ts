import { ChannelData, Message, MessageAttachment, MessageEmbed } from "discord.js"
import { GameParser, RawGameData, RawPlayer, StoredPlayerData } from "sd2-utilities/lib/parser/gameParser"
import { misc } from "sd2-data"
import * as axios from "axios"
import { EloLadderElement, Elos, ElosDelta, DB } from "../general/db";
import { DiscordBot, MsgHelper } from "../general/discordBot";
import { PermissionsSet } from "../general/permissions";
import { StoredDeckData } from "sd2-utilities/lib/parser/deckParser";

const ax = axios.default;

export class Replays {
    static extractReplayInfo(message: Message, perms: PermissionsSet, database: DB, url: string): void {
        ax.get(url).then(async (res) => {
            const g = GameParser.parseRaw(res.data);


            //determine who won and lost, calculate ELO
            let winners = ""
            let loosers = ""
            let winnerList: RawPlayer[] = []
            let looserList: RawPlayer[] = []

            const channel = await DiscordBot.bot.channels.fetch(message.channel.id) as ChannelData
            if (g.result.victory < 3) {
                for (const player of g.players) {
                    const playerid = player.name
                    if (g.players.length == 2) {
                        if (g.ingamePlayerId == player.alliance) {
                            loosers += playerid
                            looserList.push(player)
                        } else {
                            winners += playerid
                            winnerList.push(player)
                        }
                    } else if (g.players.length == 4) {
                        let replayPlayer = 0
                        if (g.ingamePlayerId == 2 || g.ingamePlayerId == 3) {
                            replayPlayer = 1
                        }
                        if (replayPlayer == player.alliance) {
                            loosers += playerid + "\n"
                            looserList.push(player)
                        } else {
                            winners += playerid + "\n"
                            winnerList.push(player)
                        }
                    } else if (g.players.length == 6) {
                        let replayPlayer = 0
                        if (g.ingamePlayerId == 3 || g.ingamePlayerId == 4 || g.ingamePlayerId == 4) {
                            replayPlayer = 1
                        }
                        if (replayPlayer == player.alliance) {
                            loosers += playerid + "\n"
                            looserList.push(player)
                        } else {
                            winners += playerid + "\n"
                            winnerList.push(player)
                        }
                    } else if (g.players.length == 8) {
                        let replayPlayer = 0
                        if (g.ingamePlayerId == 4 || g.ingamePlayerId == 5 || g.ingamePlayerId == 6 || g.ingamePlayerId == 7) {
                            replayPlayer = 1
                        }
                        if (replayPlayer == player.alliance) {
                            loosers += playerid + "\n"
                            looserList.push(player)
                        } else {
                            winners += playerid + "\n"
                            winnerList.push(player)
                        }
                    }
                }
            } else if (g.result.victory > 3) {
                for (const player of g.players) {
                    const playerid = player.name
                    if (g.players.length == 2) {
                        if (g.ingamePlayerId != player.alliance) {
                            loosers += playerid
                            looserList.push(player)
                        } else {
                            winners += playerid
                            winnerList.push(player)
                        }
                    } else if (g.players.length == 4) {
                        let replayPlayer = 0
                        if (g.ingamePlayerId == 2 || g.ingamePlayerId == 3) {
                            replayPlayer = 1
                        }
                        if (replayPlayer != player.alliance) {
                            loosers += playerid + "\n"
                            looserList.push(player)
                        } else {
                            winners += playerid + "\n"
                            winnerList.push(player)
                        }
                    } else if (g.players.length == 6) {
                        let replayPlayer = 0
                        if (g.ingamePlayerId == 3 || g.ingamePlayerId == 4 || g.ingamePlayerId == 4) {
                            replayPlayer = 1
                        }
                        if (replayPlayer != player.alliance) {
                            loosers += playerid + "\n"
                            looserList.push(player)
                        } else {
                            winners += playerid + "\n"
                            winnerList.push(player)
                        }
                    } else if (g.players.length == 8) {
                        let replayPlayer = 0
                        if (g.ingamePlayerId == 4 || g.ingamePlayerId == 5 || g.ingamePlayerId == 6 || g.ingamePlayerId == 7) {
                            replayPlayer = 1
                        }
                        if (replayPlayer != player.alliance) {
                            loosers += playerid + "\n"
                            looserList.push(player)
                        } else {
                            winners += playerid + "\n"
                            winnerList.push(player)
                        }
                    }
                }
            }

            // For 1v1 Adjust Winner & Losers Fields to be same length
            if (g.players.length == 2) {
                const winnersLength = winners.length
                const losersLength = loosers.length
                if (winnersLength < 19) {
                    for (let i = winnersLength; i < 19; i++) {
                        winners = winners.concat("-")
                    }
                } else {
                    winners = winners.substring(0, 19)
                }
                if (losersLength < 20) {
                    for (let i = losersLength; i < 19; i++) {
                        loosers = loosers.concat("-")
                    }
                } else {
                    loosers = loosers.substring(0, 19)
                }

                const players = Replays.createStoredPlayers(g);

                //if valid insert to db (setReplay returns if is duplicate)
                const valid = Replays.isValidReplay(g);
                let reply: string;
                if (valid != null) {
                    reply = "Replay not saved to database:" + valid + 'prb: ' + g.gameMode;
                }
                else {
                    reply = await database.setReplay(message, g, players)
                        ? "Results Submitted" : "This is a duplicate replay won't be saved to database.";
                }

                MsgHelper.say(message, reply);
            }
            else {
                MsgHelper.say(message, "Only 1v1 replays are uploaded in database.");
            }
            Replays.sendEmbed(message, g, database, winners, loosers);
        });
    }
    static createStoredPlayers(g: RawGameData) {
        let winner: StoredPlayerData, loser: StoredPlayerData;
        for (const player of g.players) {

            const deck: StoredDeckData = {
                income: player.deck.raw.income,
                division: player.deck.raw.division,
                code: player.deck.raw.code
            }

            if (g.ingamePlayerId == player.alliance) {
                loser = {
                    id: player.id,
                    alliance: player.alliance,
                    elo: player.elo,
                    level: player.level,
                    name: player.name,
                    deckCode: deck,
                    scoreLimit: player.scoreLimit,
                    incomeRate: player.incomeRate,
                    mapPos: player.mapPos
                }
            } else {
                winner = {
                    id: player.id,
                    alliance: player.alliance,
                    elo: player.elo,
                    level: player.level,
                    name: player.name,
                    deckCode: deck,
                    scoreLimit: player.scoreLimit,
                    incomeRate: player.incomeRate,
                    mapPos: player.mapPos
                }
            }
        }
        return {
            winner: winner,
            loser: loser
        }
    }

    private static isValidReplay(g: RawGameData): string {
        if (g.players.length != 2) return "playerLength";
        if (g.aiCount > 0) return "aiCount";
        if (g.players[0]?.deck?.franchise != "SD2") return "franchise";
        if (g.gameMode != 1) return "gameMode"; //Check misc.js after
        if (g.incomeRate != 3) return "incomeRate";
        if (g.scoreLimit != 2000) return "scoreLimit";
        return null;
    }
    static async sendEmbed(message: Message, g: RawGameData, database: DB, winners: string, losers: string): Promise<void> {

        // Create embed header
        let embed = new MessageEmbed()
            .setTitle(g.serverName || "Game")
            .setColor("#0099ff")
            .addField("Winner", `||${winners}||`, true)
            .addField("Loser", `||${losers}||`, true)
            .addField("victoryState", `||${misc.victory[g.result.victory]}||`, true)
            .addField("Duration", `||${Replays.duration(g.result.duration)}||`, true)
            .setFooter(`Game Version: ${g.version}`)
            .addField("Score Limit", g.scoreLimit, true)
            .addField("Time Limit", g.timeLimit, true)
            .addField('Income Rate', misc.incomeLevel[g.incomeRate], true)
            .addField('Game Mode', misc.mode[g.gameMode], true)
            .addField('Starting Points', g.initMoney + " pts", true)
            .addField('Map', misc.map[g.map_raw], true);


        // If embed is less than 4 we can send in single embed
        if (g.players.length < 4) {
            for (const player of g.players) {
                let playerid = player.name;
                let playerElo = player.elo;
                let discordId = ""
                //let elo = ""
                const discordUser = await database.getDiscordUserFromEugenId(player.id);
                if (discordUser)
                    discordId = discordUser.id
                if (discordId != "") {
                    const user = await DiscordBot.bot.users.fetch(String(discordId))
                    if (!user)
                        playerid = "BORKED! Please yell at <@!271792666910392325>"
                    else
                        playerid += " *<@!" + user.id + ">*"
                } else {
                    playerid += "(id:" + player.id + ")";
                }

                // Add the player details to the embed
                embed = embed.addField("\u200b", "-------------------------------------------------")
                    .addField("Player", playerid, false)
                    .addField("Elo", playerElo, false)
                    .addField("Division", player.deck.division, true)
                    .addField("Income", player.deck.income, true)
                    .addField("Deck Code", player.deck.raw.code, false)
                    .setTimestamp();

                if (player.deck.franchise === "WARNO") {
                    embed.addField("Deck", `[VIEW](https://war-yes.com/deck-builder?code=${player.deck.raw.code} 'view on war-yes.com')`, false);
                }
            }
            message.channel.send(embed);
            return;
        }
        message.channel.send(embed);
            // But if the number so players are equal to or greater than 4 we need to break it over several embeds 
            if (g.players.length >= 4) {
                let counter = 0;
                embed = new MessageEmbed()
                    .setColor("#0099ff")
                for (const player of g.players) {
                    let playerid = player.name;
                    let playerElo = player.elo;
                    let discordId = ""
                    const discordUser = await database.getDiscordUserFromEugenId(player.id);
                    if (discordUser)
                        discordId = discordUser.id
                    if (discordId != "") {
                        const user = await DiscordBot.bot.users.fetch(String(discordId))
                        if (!user)
                            playerid = "BORKED! Please yell at <@!271792666910392325>"
                        else
                            playerid += "*<@!" + user.id + ">*"
                    } else {
                        playerid += " (id:" + player.id + ")";
                    }
                    embed = embed.addField("-------------------------------------------------", "\u200B")
                        .addField("Player", playerid, false)
                        .addField("Elo", playerElo, false)
                        .addField("Division", player.deck.division, true)
                        .addField("Income", player.deck.income, true)
                        .addField("Deck Code", player.deck.raw.code, false)
                    counter++;
                    if (counter == 4) {
                        message.channel.send(embed)
                        embed = new MessageEmbed()
                            .setColor("#0099ff")
                        counter = 0;
                    }
            }
        }
    }


    static duration(seconds: number): string {
        return `${Math.floor(seconds / 60)} Minutes and ${seconds % 60} Seconds`
    }

}