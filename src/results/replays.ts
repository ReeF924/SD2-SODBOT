import { Message, MessageEmbed } from "discord.js"
import { GameParser } from "sd2-utilities/lib/parser/gameParser"
import { misc } from "sd2-data"
import * as axios from "axios"
import { SqlHelper } from "../general/sqlHelper";
import { DiscordBot } from "../general/discordBot";

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
                .addField("Winner", `||${winners}||`, true)
                .addField("Loser", `||${loosers}||`, true)
                .addField("victoryState", `||${misc.victory[g.result.victory]}||`, true)
                .addField("Duration", `||${Replays.duration(g.result.duration)}||`, true)
                .setColor("#0099ff")
                .setFooter(`Game Version: ${g.version}`)
                .addField("Score Limit", g.scoreLimit, true)
                .addField("Time Limit", g.timeLimit, true)
                .addField('Income Rate', misc.incomeLevel[g.incomeRate], true)
                .addField('Game Mode', misc.mode[g.gameMode], true)
                .addField('Starting Points', g.initMoney + " pts", true)
                .addField('Map', misc.map[g.map_raw], true)
                // converts raw map data to more useable map names, once SD2-data has map names 

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
                    embed = embed.addField("-------------------------------------------------", "\u200B")
                        .addField("Player", playerid, true)
                        .addField("Level", player.level, true)
                        .addField('\u200b', '\u200b', true)
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
                    .addField("Player", playerid, true)
                    .addField("Level", player.level, true)
                    .addField('\u200b', '\u200b', true)
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
        })
    }

    static duration(seconds: number): string {
        return `${Math.floor(seconds / 60)} Minutes and ${seconds % 60} Seconds`
    }

}