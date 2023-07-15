import {ChannelData, Message, MessageEmbed} from "discord.js"
import {GameParser, RawPlayer} from "sd2-utilities/lib/parser/gameParser"
import {misc} from "sd2-data"
import * as axios from "axios"
import {EloLadderElement, Elos, ElosDelta, DB} from "../general/db";
import {DiscordBot, MsgHelper} from "../general/discordBot";
import {RatingEngine} from "./rating";
import {PermissionsSet} from "../general/permissions";

const ax = axios.default;

export class Replays {
    static extractReplayInfo(message: Message, perms: PermissionsSet, database: DB): void {
        const url = message.attachments.first().url
        const ratingEng: RatingEngine = new RatingEngine(database);
        ax.get(url).then(async (res) => {
            const g = GameParser.parseRaw(res.data)
            //discover winning team alliance....Not sure we need this now?
            const replayPlayer = g.players[g.ingamePlayerId];

            //we need to commit the replay to the DB
            let updatedDocumentCount = await database.setReplay(message, g);
            message.channel.send("Results Submitted")

            // and check if game has been uploaded in a non-ELO channel
            if (!perms.isEloComputed) {
                MsgHelper.say(message, "This game is unranked")
            }
            // and check the game is 1v1, if it isn't warn that results will not be rated
            else if (g.players.length > 2) {
                MsgHelper.say(message, "This reply is not a 1v1 player game, outcome will not be used in ELO")
            }
            // and check if the game already existed in DB 
            else if (updatedDocumentCount == 1) {
                MsgHelper.say(message, "This is a duplicate upload and will not be counted for ELO")
            }
            // and check if the game already existed in DB 
            else if (g.version < 51345) {
                MsgHelper.say(message, "This replay is from a older version of the game and won't be used in ELO Calcs")
            }

            //determine who won and lost, calculate ELO
            let winners = ""
            let loosers = ""
            let winnerList: RawPlayer[] = []
            let looserList: RawPlayer[] = []
            let ratings: { p1: ElosDelta, p2: ElosDelta }
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
                if (g.players.length == 2 && updatedDocumentCount == 0 && perms.isEloComputed && g.version >= 51345) {
                    const p1Elo = await database.getElos(winnerList[0].id, message.channel.id, message.guild.id)
                    const p2Elo = await database.getElos(looserList[0].id, message.channel.id, message.guild.id)
                    ratings = ratingEng.rateMatch(p1Elo, p2Elo, 1)
                    await database.setElos(ratings.p1, {impliedName: winnerList[0].name, serverName: message.guild.name, channelName: channel.name})
                    await database.setElos(ratings.p2, {impliedName: looserList[0].name, serverName: message.guild.name, channelName: channel.name})
                    ratingEng.doDivisionElo(winnerList[0].deck, looserList[0].deck, 5)
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
                if (g.players.length == 2 && updatedDocumentCount == 0 && perms.isEloComputed && g.version >= 51345) {
                    const p1Elo = await database.getElos(winnerList[0].id, message.channel.id, message.guild.id)
                    const p2Elo = await database.getElos(looserList[0].id, message.channel.id, message.guild.id)
                    ratings = ratingEng.rateMatch(p1Elo, p2Elo, 1)
                    await database.setElos(ratings.p1, {impliedName: winnerList[0].name, serverName: message.guild.name, channelName: channel.name})
                    await database.setElos(ratings.p2, {impliedName: looserList[0].name, serverName: message.guild.name, channelName: channel.name})
                    ratingEng.doDivisionElo(winnerList[0].deck, looserList[0].deck, 5)
                }
            } else {
                winners = "no one"
                loosers = "everyone"
                if (g.players.length == 2 && updatedDocumentCount == 0 && perms.isEloComputed && g.version >= 51345) {
                    const p1Elo = await database.getElos(g.players[0].id, message.channel.id, message.guild.id)
                    const p2Elo = await database.getElos(g.players[1].id, message.channel.id, message.guild.id)
                    ratings = ratingEng.rateMatch(p1Elo, p2Elo, .5)
                    await database.setElos(ratings.p1, {impliedName: g.players[0].name, serverName: message.guild.name, channelName: channel.name})
                    await database.setElos(ratings.p2, {impliedName: g.players[1].name, serverName: message.guild.name, channelName: channel.name})
                    ratingEng.doDivisionElo(winnerList[0].deck, looserList[0].deck, 3)
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
            }

            // Create embed header
            let embed = new MessageEmbed()
                .setTitle(g.serverName || "Game")
                .setColor("#0099ff")
                .addField("Winner", `||${winners}||`, true)
                .addField("Loser", `||${loosers}||`, true)
                .addField("victoryState", `||${misc.victory[g.result.victory]}||`, true)
                .addField("Duration", `||${Replays.duration(g.result.duration)}||`, true)
                .setFooter(`Game Version: ${g.version}`)
                .addField("Score Limit", g.scoreLimit, true)
                .addField("Time Limit", g.timeLimit, true)
                .addField('Income Rate', misc.incomeLevel[g.incomeRate], true)
                .addField('Game Mode', misc.mode[g.gameMode], true)
                .addField('Starting Points', g.initMoney + " pts", true)
                .addField('Map', misc.map[g.map_raw], true)

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

                    const raitingsString = (delta: number) => {
                        let sign = "";
                        if (delta > 0) sign = "+";
                        return sign + Math.round(delta)
                    }

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
                        .addField("Deck Code", player.deck.raw.code, false)
                        .setTimestamp()

                    if (player.deck.franchise === "WARNO") {
                        embed.addField("Deck", `[VIEW](https://war-yes.com/deck-builder?code=${player.deck.raw.code} 'view on war-yes.com')`, false)

                    }
                }
            }
            message.channel.send(embed)

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
                        .addField("Deck Code", player.deck.raw.code, false)
                    counter++;
                    if (counter == 4) {
                        message.channel.send(embed)
                        embed = new MessageEmbed()
                            .setColor("#0099ff")
                        counter = 0;
                    }
                }
                message.channel.send(embed)
            }

        })

    }


    static duration(seconds: number): string {
        return `${Math.floor(seconds / 60)} Minutes and ${seconds % 60} Seconds`
    }

}