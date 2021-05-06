import { ChannelData, Message, MessageEmbed } from "discord.js"
import { GameParser, RawPlayer } from "sd2-utilities/lib/parser/gameParser"
import { misc } from "sd2-data"
import * as axios from "axios"
import { EloLadderElement, Elos, ElosDelta, SqlHelper } from "../general/sqlHelper";
import { DiscordBot, MsgHelper } from "../general/discordBot";
import { RatingEngine } from "./rating";
import { PermissionsSet } from "../general/permissions";

const ax = axios.default;


export class Replays {
    static extractReplayInfo(message: Message, perms:PermissionsSet): void {
        const url = message.attachments.first().url
        ax.get(url).then(async (res) => {
            const g = GameParser.parseRaw(res.data)
            //discover winning team alliance....Not sure we need this now?
            const replayPlayer = g.players[g.ingamePlayerId];

            //we need to commit the replay to the DB
            let uuid = await SqlHelper.setReplay(message,g);
            message.channel.send("Results Submitted")
            console.log(uuid.rows)
        
            // and check if game has been uploaded in a non-ELO channel
            if (!perms.isEloComputed){
                MsgHelper.say(message,"This game is unranked")
            }
            // and check the game is 1v1, if it isn't warn that results will not be rated
            else if (g.players.length > 2){
                MsgHelper.say(message,"This reply is not a 1v1 player game, outcome will not be used in ELO")
            }
            // and check if the game already existed in DB 
            else if(uuid.rows.length == 1){
                MsgHelper.say(message,"This is a duplicate upload and will not be counted for ELO")
            }
            // and check if the game already existed in DB 
            else if(g.version < 51345){
                MsgHelper.say(message,"This replay is from a older version of the game and won't be used in ELO Calcs")
            }
            //determine who won and lost, calculate ELO
            let winners = ""
            let loosers = ""
            let winnerList:RawPlayer[] = []
            let looserList:RawPlayer[] = []
            let ratings:{p1:ElosDelta,p2:ElosDelta}
            const channel = await DiscordBot.bot.channels.fetch(message.channel.id) as ChannelData
            if (g.result.victory < 3) {
                for (const player of g.players) {
                    const playerid = player.name
                    if (g.ingamePlayerId == player.alliance){
                        loosers += playerid + "\n"
                        looserList.push(player)
                    }else{
                        winners += playerid + "\n"
                        winnerList.push(player)
                    }    
                }
                if(g.players.length == 2 && uuid.rows.length == 0 && perms.isEloComputed && g.version >= 51345){
                    const p1Elo = await SqlHelper.getElos(winnerList[0].id,message.channel.id,message.guild.id)
                    const p2Elo = await SqlHelper.getElos(looserList[0].id,message.channel.id,message.guild.id)
                    ratings = RatingEngine.rateMatch(p1Elo,p2Elo,1)
                    await SqlHelper.setElos(ratings.p1,{impliedName:winnerList[0].name,serverName:message.guild.name,channelName:channel.name})
                    await SqlHelper.setElos(ratings.p2,{impliedName:looserList[0].name,serverName:message.guild.name,channelName:channel.name})
                    RatingEngine.doDivisionElo(winnerList[0].deck,looserList[0].deck,5)
                }  
            } else if (g.result.victory > 3) {
                for (const player of g.players) {
                    const playerid = player.name
                    if (g.ingamePlayerId != player.alliance){
                        loosers += playerid + "\n"
                        looserList.push(player)
                    }else{
                        winners += playerid + "\n"
                        winnerList.push(player)
                    }
                }
                if(g.players.length == 2 && uuid.rows.length == 0 && perms.isEloComputed && g.version >= 51345){
                    const p1Elo = await SqlHelper.getElos(winnerList[0].id,message.channel.id,message.guild.id)
                    const p2Elo = await SqlHelper.getElos(looserList[0].id,message.channel.id,message.guild.id)
                    ratings = RatingEngine.rateMatch(p1Elo,p2Elo,1)
                    await SqlHelper.setElos(ratings.p1,{impliedName:winnerList[0].name,serverName:message.guild.name,channelName:channel.name})
                    await SqlHelper.setElos(ratings.p2,{impliedName:looserList[0].name,serverName:message.guild.name,channelName:channel.name})
                    RatingEngine.doDivisionElo(winnerList[0].deck,looserList[0].deck,5)
                }
            } else {
                winners = "no one"
                loosers = "everyone"
                if(g.players.length == 2 && uuid.rows.length == 0 && perms.isEloComputed && g.version >= 51345){
                    const p1Elo = await SqlHelper.getElos(g.players[0].id,message.channel.id,message.guild.id)
                    const p2Elo = await SqlHelper.getElos(g.players[1].id,message.channel.id,message.guild.id)
                    ratings = RatingEngine.rateMatch(p1Elo,p2Elo,.5)
                    await SqlHelper.setElos(ratings.p1,{impliedName:g.players[0].name,serverName:message.guild.name,channelName:channel.name})
                    await SqlHelper.setElos(ratings.p2,{impliedName:g.players[1].name,serverName:message.guild.name,channelName:channel.name})
                    RatingEngine.doDivisionElo(winnerList[0].deck,looserList[0].deck,3)
                }
            }
            //Test remove later
            console.log("Winners "+winners)
            console.log("Losers "+loosers)
            console.log("VictoryState "+misc.victory[g.result.victory])
            console.log("Duration "+Replays.duration(g.result.duration))
            console.log("Game Version "+g.version)
            console.log("ScoreLimit "+g.scoreLimit)
            console.log("Timelimit "+g.timeLimit)
            console.log("IncomeRate "+misc.incomeLevel[g.incomeRate])
            console.log("Game Mode "+misc.mode[g.gameMode])
            console.log("StartingPoints "+g.initMoney)
            console.log("Map "+ misc.map[g.map_raw])


            // Create embed header
            let embed = new MessageEmbed()
                .setTitle(g.serverName)
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
            if (g.players.length < 4){
                for (const player of g.players) {
                    let playerid = player.name;
                    let discordId = ""
                    let elo = ""
                    const discordUser = await SqlHelper.getDiscordUserFromEugenId(player.id);
                    if(discordUser)
                        discordId = discordUser.id
                    if (discordId != "") {
                        const user = await DiscordBot.bot.users.fetch(String(discordId))
                        if(!user)
                            playerid =  "BORKED! Please yell at <@!271792666910392325>"
                        else
                            playerid += " *<@!" + user.id +">*"
                    } else {
                        playerid += "(id:" + player.id + ")";
                    }

                    if(g.players.length == 2 && uuid.rows.length == 0 && perms.isEloComputed && g.version >= 51345){
                        if(ratings.p1.eugenId == player.id){
                            if (perms.isChannelEloShown){            
                                elo += `Channel ELO: ||${Math.round(ratings.p1.channelElo)} (${Math.round(ratings.p1.channelDelta)})||`
                            }
                            if (perms.isServerEloShown){
                                elo += `\nServer ELO: ||${Math.round(ratings.p1.serverElo)}   (${Math.round(ratings.p1.serverDelta)})||`
                            }
                            if (perms.isGlobalEloShown){
                                elo += `\nGlobal ELO: ||${Math.round(ratings.p1.globalElo)}   (${Math.round(ratings.p1.globalDelta)})||`
                            }
                        } else if(ratings.p2.eugenId == player.id){
                            if (perms.isChannelEloShown){            
                                elo += `Channel ELO: ||${Math.round(ratings.p2.channelElo)} (${Math.round(ratings.p2.channelDelta)})||`
                            }
                            if (perms.isServerEloShown){
                                elo += `\nServer ELO: ||${Math.round(ratings.p2.serverElo)}   (${Math.round(ratings.p2.serverDelta)})||`
                            }
                            if (perms.isGlobalEloShown){
                                elo += `\nGlobal ELO: ||${Math.round(ratings.p2.globalElo)}   (${Math.round(ratings.p2.globalDelta)})||`
                            }
                        }
                    } 
                    else {
                            const elox = await SqlHelper.getElos(player.id,message.channel.id,message.guild.id)
                            if (perms.isChannelEloShown){            
                                elo += `Channel ELO: ${Math.round(elox.channelElo)}`
                            }
                            if (perms.isServerEloShown){
                                elo += `\nServer ELO: ${Math.round(elox.serverElo)}`
                            }
                            if (perms.isGlobalEloShown){
                                elo += `\nGlobal ELO: ${Math.round(elox.globalElo)}`
                            }
                    }

                    // Add the player details to the embed
                    embed = embed.addField("\u200b", "-------------------------------------------------")
                        .addField("Player", playerid, false)
                        .addField("Elo", elo, false)
                        .addField("Division", player.deck.division, true)
                        .addField("Income", player.deck.income, true)
                        .addField("Deck Code", player.deck.raw.code, false)
                        
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
                    let discordId = ""
                    const discordUser = await SqlHelper.getDiscordUserFromEugenId(player.id);
                    if(discordUser)
                        discordId = discordUser.id
                    if (discordId != "") {
                        const user = await DiscordBot.bot.users.fetch(String(discordId))
                        if(!user)
                        playerid =  "BORKED! Please yell at <@!271792666910392325>"
                    else
                        playerid += "*<@!" + user.id +">*"
                    } else {
                        playerid += " (id:" + player.id + ")";
                    }
                    embed = embed.addField("-------------------------------------------------", "\u200B")
                        .addField("Player", playerid, false)
                        .addField("Level", player.level, false)
                        .addField("Division", player.deck.division, true)
                        .addField("Income", player.deck.income, true)
                        .addField("Deck Code", player.deck.raw.code, false)
                    counter++;
                    if (counter == 5) {
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