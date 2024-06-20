import {Message, EmbedBuilder, EmbedField} from "discord.js"
import {GameParser, RawGameData, RawPlayer} from "sd2-utilities/lib/parser/gameParser"
import {misc, maps} from "sd2-data"
import * as axios from "axios"
import {uploadReplay} from "../db/replays/replaysService";

import {Logs} from "../general/logs";
import {MsgHelper} from "../general/discordBot";

const ax = axios.default;
//todo what if-else shit in retractPlayerInfo
//todo crases when there are multiple players? maybe something to do with db save?cd

export class Replays {
    private static readonly blankEmbedField: EmbedField = {name: '\u200b', value: '\u200b', inline: true};

    //gets data out of replay and prepares them for the embed
    static async extractReplayInfo(message: Message, url: string, sendEmbed: boolean = true): Promise<void> {
        
        ax.get(url).then(async (res) => {
            const g: RawGameData = GameParser.parseRaw(res.data);


            const winnerList: RawPlayer[] = []
            const loserList: RawPlayer[] = []

            //decides if a player lost or won
            const result = g.result.victory > 3 ? g.ingamePlayerId >= g.players.length / 2 : g.ingamePlayerId < g.players.length / 2;

            for (const player of g.players) {
                (result ? player.alliance === 1 : player.alliance === 0) ? winnerList.push(player) : loserList.push(player);
            }


            //randomly chooses which team goes first (so you cannot tell who win from it)
            g.players.splice(0, g.players.length);
            Math.random() < 0.5 ? g.players.push(...winnerList, ...loserList) : g.players.push(...loserList, ...winnerList);


            let longestName = Math.max(...winnerList.map(p => p.name.length), ...loserList.map(p => p.name.length));

            let winners = Replays.joinPlayersToString(winnerList, longestName);
            let losers = Replays.joinPlayersToString(loserList, longestName);

            const map = await Replays.getMapName(g);

            if (sendEmbed)
                Replays.sendEmbed(message, g, winners, losers, map);


            const valid = Replays.isValidReplay(g);
            //checks if the replay is valid to be uploaded to the db
            //todo this is only half of the job
            if (valid !== null) {
                console.log(`Invalid replay: ${valid}`);
                return;
            }

            //uploads replay to the database
            try {
                const response = await uploadReplay(g, winnerList, loserList,
                    {
                        uploadedAt: message.createdAt,
                        uploadedBy: parseInt(message.author.id),
                        uploadedIn: parseInt(message.channel!.id)
                    }, map);
                if (typeof response === 'string') {
                    console.log(response);
                }

            } catch (e) {

                if(e.cause.code === "ECONNREFUSED" && e instanceof TypeError){
                    console.log("API offline");
                    return;
                }

                console.log(e);
            }

        });
    }

    private static joinPlayersToString(players: RawPlayer[], longestName: number): string {
        let result = "";

        players.forEach(p => {
            //Fixes Koneig's name, he always gets it wrong
            p.name = p.name.replace(/[Kk]oenig/g, "Koneig");

            let name = p.name;
            const maxLength = Math.min(longestName, 20);
            name = name.substring(0, maxLength);
            name = name.padEnd(maxLength, '/');

            result += name + "\n";
        });
        return result.substring(0, result.length - 1);
    }

    private static isValidReplay(g: RawGameData): string | null {
        if (g.aiCount > 0) return "aiCount";
        if (g.gameMode != 1) return "gameMode"; //Check misc.js after
        if (g.incomeRate != 3 && g.players.length == 2) return "incomeRate"; //don't accept other for 1v1s
        if (g.scoreLimit != 2000) return "scoreLimit";
        return null;
    }

    private static async getMapName(g: RawGameData): Promise<string> {
        let map = misc.map[g.map_raw];

        //if the map's not in sd2-data, this tries to guess it's name
        if (!map) {
            const arr = g.map_raw.split('_');
            map = arr[2];
            let counter = 3;
            while (counter < arr.length && isNaN(parseInt(arr[counter][0]))) {

                if (arr[counter] === 'LD') {
                    counter++;
                    continue;
                }

                map += ' ' + arr[counter];
                counter++;
            }


            if (!await Logs.logToFile(g.map_raw)) {
                console.log('\nnewMap:', g.map_raw + '\n');
            }
        }

        return map;
    }

    static async sendEmbed(message: Message, g: RawGameData, winners: string, losers: string, mapName:string): Promise<void> {


        let embed = new EmbedBuilder()
            .setTitle(!g.serverName ? "Game" : g.serverName)
            .setColor("#0099ff")
            .addFields(
                [
                    {name: "Winner", value: `||${winners}||`, inline: true},
                    Replays.blankEmbedField,
                    {name: "Loser", value: `||${losers}||`, inline: true},
                    {name: "Map", value: mapName, inline: true},
                    {name: "Duration", value: `||${Replays.duration(g.result.duration)}||`, inline: true},
                    {name: "Victory State", value: `||${misc.victory[g.result.victory]}||`, inline: true},
                    {name: "Score Limit", value: g.scoreLimit.toString(), inline: true},
                    Replays.blankEmbedField,
                    {name: "Time Limit", value: g.timeLimit.toString(), inline: true},
                    {name: "Income Rate", value: misc.incomeLevel[g.incomeRate], inline: true},
                    {name: "Game Mode", value: Replays.getGameMode(g.map_raw), inline: true},
                    {name: "Starting Points", value: `${g.initMoney} pts`, inline: true},
                ]);

        const playerSeparator: string = "-------------------------------------------";
        const enemyTeamSeparator: string = "-------OPPOSING TEAM-------";


        let counter = 1;
        for (const player of g.players) {
            const sep = counter === g.players.length / 2 + 1 && g.players.length > 2 ? enemyTeamSeparator : playerSeparator;

            embed.addFields(
                [{name: "\u200b", value: sep, inline: false},
                    {name: "Player", value: player.name, inline: false},
                    {name: "Elo", value: player.elo.toString(), inline: false},
                    {name: "Division", value: player.deck!.division, inline: true},
                    {name: "Deck Code", value: player.deck!.raw.code, inline: false}
                ]);


            if (player.deck!.franchise === "SD2") {
                embed.addFields([{name: "Income", value: player.deck!.income, inline: true}]);
            }

            //every fourth, in the beginning there can be only 2 players
            //I don't like this, could propably improve it somehow
            if ((counter % 4 === 0 || counter === 2) && counter !== 0 && counter !== g.players.length) {

                if (g.players.length === 2) break;

                message.channel.send({embeds: [embed]});
                embed = new EmbedBuilder()
                    .setColor("#0099ff")
            }
            counter++;
        }

        // MsgHelper.sendEmbed(message, embed);
        message.channel.send({embeds: [embed]});
    }

    static sortPlayers(players: RawPlayer[], winnerAl: number): RawPlayer[] {
        return [
            ...players.filter(p => p.alliance === winnerAl),
            ...players.filter(p => p.alliance !== winnerAl)
        ];

    }

    static getGameMode(mapName: string): string {
        switch (mapName) {
            case 'CQC':
                return 'Closer Combat';
            case 'BKT':
                return 'Breakthrough';
            case 'DEST':
                return 'Destruction';
            default:
                return 'Conquest';
        }
    }

    static duration(seconds: number): string {
        return `${Math.floor(seconds / 60)} Minutes and ${seconds % 60} Seconds`
    }

}