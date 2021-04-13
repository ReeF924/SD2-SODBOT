import { Message, MessageEmbed } from "discord.js"
import { GameParser } from "sd2-utilities/lib/parser/gameParser"
import { misc } from "sd2-data"
import * as axios from "axios"
import { SqlHelper } from "../general/sqlHelper";
import { DiscordBot } from "../general/discordBot";
import { RatingEngine } from "./rating";

const ax = axios.default;


export class Replays {
    static extractReplayInfo(message: Message): void {
        const url = message.attachments.first().url
        ax.get(url).then(async (res) => {
            const g = GameParser.parseRaw(res.data)
            //discover winning team
            const replayPlayer = g.players[g.ingamePlayerId];
            let winners = ""
            let loosers = ""
            if (g.result.victory < 3) {
                //replay creator lost
                for (const player of g.players) {
                    const playerid = player.name;
                    if (player.alliance == replayPlayer.alliance)
                        loosers += playerid + "\n"
                    else
                        winners += playerid + "\n"
                }
            } else if (g.result.victory > 3) {
                //replay creator won
                for (const player of g.players) {
                    const playerid = player.name;
                    if (player.alliance != replayPlayer.alliance)
                        loosers += playerid + "\n"
                    else
                        winners += playerid + "\n"
                }

            } else {
                winners = "noone"
                loosers = "everyone"
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
                    const discordUser = await SqlHelper.getDiscordUserFromEugenId(player.id);
                    if(discordUser)
                        discordId = discordUser.id
                    if (discordId != "") {
                        const user = await DiscordBot.bot.users.fetch(String(discordId))
                        if(!user)
                            playerid =  "BORKED! Please yell at <@271792666910392325>"
                        else
                            playerid += " *<@" + user.id +">*"
                    } else {
                        playerid += "(id:" + player.id + ")";
                    }
                
                    embed = embed.addField("\u200b", "-------------------------------------------------")
                        .addField("Player", playerid, false)
                        .addField("Level", player.level, false)
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
                        playerid =  "BORKED! Please yell at <@271792666910392325>"
                    else
                        playerid += "*<@" + user.id +">*"
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
            //and we need to commit this to DB....
            SqlHelper.setReplay(message,g);
            message.channel.send("Results Submitted")
            
            //and we need to update ELO (If 2 Players)
            console.log("This is the number of players" + g.players.length)
            if (g.players.length <= 2){    //And from League Server??
                let pWinner: number = 0
                let pLoser: number = 0
                if (g.result.victory < 3) {
                    //replay creator lost
                    if (g.players[0].alliance == replayPlayer.alliance){
                        pLoser = g.players[0].id
                        pWinner = g.players[1].id
                    }else
                        pWinner = g.players[0].id
                        pLoser = g.players[1].id
                }
                else if (g.result.victory > 3) {
                    //replay creator won
                    if (g.players[0].alliance != replayPlayer.alliance){
                        pLoser = g.players[0].id
                        pWinner = g.players[1].id
                    }else
                        pWinner = g.players[0].id
                        pLoser = g.players[1].id
                }
                console.log("Winner is " +pWinner)
                console.log("Loser is " +pLoser)
                console.log(g.players[0].id)
                console.log(g.players[1].id)
                console.log("Victory Condition " + g.result.victory);
                
                const ratedGame = await RatingEngine.rateMatch(message, pWinner, pLoser, 1, 0)
                console.log(ratedGame); 
                
                message.channel.send(`<@${pWinner}> Updated ELO: ||${(ratedGame.newP1Elo.toFixed(2))} (
                        ${ratedGame.p1EloChange < 0 ? "" : "+"}
                        ${ratedGame.p1EloChange.toFixed(2)})||<@${pLoser}> Updated ELO: ||
                        ${ratedGame.NewP2Elo.toFixed(2)} (
                        ${ratedGame.P2EloChange < 0 ? "" : "+"}
                        ${ratedGame.P2EloChange.toFixed(2)})||`);
            }   
        })
        
    }


    static duration(seconds: number): string {
        return `${Math.floor(seconds / 60)} Minutes and ${seconds % 60} Seconds`
    }

}