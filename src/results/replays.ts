import { ChannelData, Message, MessageEmbed } from "discord.js"
import { GameParser } from "sd2-utilities/lib/parser/gameParser"
import { misc } from "sd2-data"
import * as axios from "axios"
import { EloLadderElement, Elos, ElosDelta, SqlHelper } from "../general/sqlHelper";
import { DiscordBot, MsgHelper } from "../general/discordBot";
import { RatingEngine } from "./rating";
import { Console } from "node:console";

const ax = axios.default;


export class Replays {
    static extractReplayInfo(message: Message): void {
        const url = message.attachments.first().url
        ax.get(url).then(async (res) => {
            const g = GameParser.parseRaw(res.data)
            //discover winning team
            const replayPlayer = g.players[g.ingamePlayerId];
            
            //and we need to commit this to DB....
            let uuid = await SqlHelper.setReplay(message,g);
            message.channel.send("Results Submitted")
            console.log(uuid.rows)
            let winners = ""
            let loosers = ""
            let winnerList = []
            let looserList = []
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
                if(g.players.length == 2 && uuid.rows.length == 0){
                    const p1Elo = await SqlHelper.getElos(winnerList[0].id,message.channel.id,message.guild.id)
                    const p2Elo = await SqlHelper.getElos(looserList[0].id,message.channel.id,message.guild.id)
                    ratings = RatingEngine.rateMatch(p1Elo,p2Elo,1)
                    
                    await SqlHelper.setElos(ratings.p1,{impliedName:winnerList[0].name,serverName:message.guild.name,channelName:channel.name})
                    await SqlHelper.setElos(ratings.p2,{impliedName:looserList[0].name,serverName:message.guild.name,channelName:channel.name})
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
                if(g.players.length == 2 && uuid.rows.length == 0){
                    const p1Elo = await SqlHelper.getElos(winnerList[0].id,message.channel.id,message.guild.id)
                    const p2Elo = await SqlHelper.getElos(looserList[0].id,message.channel.id,message.guild.id)
                    ratings = RatingEngine.rateMatch(p1Elo,p2Elo,1)
                    await SqlHelper.setElos(ratings.p1,{impliedName:winnerList[0].name,serverName:message.guild.name,channelName:channel.name})
                    await SqlHelper.setElos(ratings.p2,{impliedName:looserList[0].name,serverName:message.guild.name,channelName:channel.name})
                }
            } else {
                winners = "no one"
                loosers = "everyone"
                if(g.players.length == 2 && uuid.rows.length == 0){
                    const p1Elo = await SqlHelper.getElos(g.players[0].id,message.channel.id,message.guild.id)
                    const p2Elo = await SqlHelper.getElos(g.players[1].id,message.channel.id,message.guild.id)
                    ratings = RatingEngine.rateMatch(p1Elo,p2Elo,.5)
                    await SqlHelper.setElos(ratings.p1,{impliedName:g.players[0].name,serverName:message.guild.name,channelName:channel.name})
                    await SqlHelper.setElos(ratings.p2,{impliedName:g.players[1].name,serverName:message.guild.name,channelName:channel.name})
                }
            }

            let embed = new MessageEmbed()
                .setTitle(g.serverName)
                .setColor("#347C17")
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

            if (g.players.length < 4)
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
                    if(g.players.length == 2 && uuid.rows.length == 0){
                        if(ratings.p1.eugenId == player.id){
                            elo += `Global: ${Math.round(ratings.p1.globalElo)}   (${Math.round(ratings.p1.globalDelta)})\nServer: ${Math.round(ratings.p1.serverElo)}   (${ratings.p1.serverDelta})\nChannel: ${Math.round(ratings.p1.channelElo)} (${Math.round(ratings.p1.channelDelta)})`
                        }else if(ratings.p2.eugenId == player.id){
                            elo += `Global: ${Math.round(ratings.p2.globalElo)}   (${Math.round(ratings.p2.globalDelta)})\nServer: ${Math.round(ratings.p2.serverElo)}   (${ratings.p2.serverDelta})\nChannel: ${Math.round(ratings.p2.channelElo)} (${Math.round(ratings.p2.channelDelta)})`
                        }
                    }else{
                        const elox = await SqlHelper.getElos(player.id,message.channel.id,message.guild.id)
                        elo += `Global:   ${Math.round(elox.globalElo)}\nServer:   ${Math.round(elox.serverElo)}\nChannel: ${Math.round(elox.channelElo)}`
                    }
                    embed = embed.addField("\u200b", "-------------------------------------------------")
                        .addField("Player", playerid, false)
                        .addField("Elo", elo, false)
                        .addField("Division", player.deck.division, true)
                        .addField("Income", player.deck.income, true)
                        .addField("Deck Code", player.deck.raw.code, false)
                }
            message.channel.send(embed)
            

            if (g.players.length >= 4) {
                embed = new MessageEmbed()
                    .setColor("#0099ff")
                let counter = 0;
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
                // Check the game is 1v1 and warn that results will not be rated
                message.channel.send(embed)
            }    
            if (g.players.length > 2){
                MsgHelper.say(message,"This reply is not a 1v1 player game, outcome will not be used in ELO")
            } 
            if(uuid.rows.length == 1){
                MsgHelper.say(message,"This is a duplicate upload and will not be counted for ELO")
            } 
        })
        
    }


    static duration(seconds: number): string {
        return `${Math.floor(seconds / 60)} Minutes and ${seconds % 60} Seconds`
    }

}