import { Message, MessageEmbed } from "discord.js"
import { GameParser } from "sd2-utilities/lib/parser/gameParser"
import { misc } from "sd2-data"
import * as axios from "axios"

const ax = axios.default;
export class Replays {
    static extractReplayInfo(message: Message): void {
        const url = message.attachments.first().url
        ax.get(url).then((res) => {
            const g = GameParser.parseRaw(res.data)
            //discover winning team
            const replayPlayer = g.players[g.ingamePlayerId];
            let winners = ""
            let loosers = ""
            if (g.result.victory < 3) {
                //replay creator lost
                for (const player of g.players) {
                    if (player.alliance == replayPlayer.alliance)
                        loosers += player.name + "\n"
                    else
                        winners += player.name + "\n"
                }
            } else if (g.result.victory > 3) {
                //replay creator won
                for (const player of g.players) {
                    if (player.alliance != replayPlayer.alliance)
                        loosers += player.name + "\n"
                    else
                        winners += player.name + "\n"
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
                    .addField('Income', misc.incomeLevel[g.incomeRate], true)
                    .addField('Game Mode', misc.mode[g.gameMode], true)
                    .addField('Starting Points', g.initMoney + " pts", true)
                    .addField('Map', g.map_raw, true)

                if(g.players.length < 4)
                    for (const player of g.players) {
                        embed = embed.addField("-------------------------------------------------", "\u200B")
                            .addField("Player", player.name, true)
                            .addField("Division", player.deck.division, true)
                            .addField("Level", player.level, true)
                            .addField("Deck Code", player.deck.raw.code, true)
                    }
                message.channel.send(embed)
                if(g.players.length >= 4){
                    embed = new MessageEmbed()
                    .setColor("#0099ff")
                    let counter = 0;
                    for (const player of g.players) {
                        embed = embed.addField("-------------------------------------------------", "\u200B")
                            .addField("Player", player.name, true)
                            .addField("Division", player.deck.division, true)
                            .addField("Level", player.level, true)
                            .addField("Deck Code", player.deck.raw.code, true)
                            counter ++;
                            if(counter == 5){
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