import { Message, EmbedBuilder, EmbedField } from "discord.js"
import { GameParser, RawGameData, RawPlayer } from "sd2-utilities/lib/parser/gameParser"
import { misc, maps } from "sd2-data"
import * as axios from "axios"
import { DB } from "../general/db";
import { DiscordBot, MsgHelper } from "../general/discordBot";
import { PermissionsSet } from "../general/permissions";
import { Logs } from "../general/logs";

const ax = axios.default;
//todo maps - 2v2..., mode - brk, cqc, meet, maybe add to embed? (display only if not default?)
//todo what if-else shit in retractPlayerInfo
//todo crases when there are multiple players? maybe something to do with db save?cd

export class Replays {
    private static readonly blankEmbedField: EmbedField = { name: '\u200b', value: '\u200b', inline: true };

    //todo delete, will be in sdData
    private static readonly AILevel = {
        0: "Very Easy",
        1: "Easy",
        2: "Medium",
        3: "Hard",
        4: "Very Hard"
    }

    static extractReplayInfo(message: Message, database: DB, url: string): void {
        ax.get(url).then(async (res) => {
            const g = GameParser.parseRaw(res.data);

            const winnerList: RawPlayer[] = []
            const loserList: RawPlayer[] = []

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

            await Replays.sendEmbed(message, g, database, winners, losers);
        });
    }

    private static joinPlayersToString(players: RawPlayer[], longestName: number): string {
        let result = "";

        players.forEach(p => {
            //propably not the most optimal way to check for Ai, maybe AICount?

            const regex = new RegExp("[Kk]oenig");
            p.name = p.name.replace(/[Kk]oenig/g, "Koneig")


            if (p.name === "" && p.aiLevel < 5) {
                p.name = "AI " + Replays.AILevel[p.aiLevel];
            }

            let name = p.name;
            const maxLength = Math.min(longestName, 20);
            name = name.substring(0, maxLength);
            name = name.padEnd(maxLength, '/');

            result += name + "\n";
        });
        return result.substring(0, result.length - 1);
    }

    private static isValidReplay(g: RawGameData): string | null {
        if (g.players.length != 2) return "playerLength";
        if (g.aiCount > 0) return "aiCount";
        if (g.players[0]?.deck?.franchise != "SD2") return "franchise";
        if (g.gameMode != 1) return "gameMode"; //Check misc.js after
        if (g.incomeRate != 3) return "incomeRate";
        if (g.scoreLimit != 2000) return "scoreLimit";
        return null;
    }

    static async sendEmbed(message: Message, g: RawGameData, database: DB, winners: string, losers: string): Promise<void> {

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

            if (!await Logs.addMap(g.map_raw)) {
                console.log('\nnewMap:', g.map_raw + '\n');
            }
        }


        let embed = new EmbedBuilder()
            .setTitle(!g.serverName ? "Game" : g.serverName)
            .setColor("#0099ff")
            .addFields(
                [
                    { name: "Winner", value: `||${winners}||`, inline: true },
                    Replays.blankEmbedField,
                    { name: "Loser", value: `||${losers}||`, inline: true },
                    { name: "Map", value: map, inline: true },
                    { name: "Duration", value: `||${Replays.duration(g.result.duration)}||`, inline: true },
                    { name: "Victory State", value: `||${misc.victory[g.result.victory]}||`, inline: true },
                    { name: "Score Limit", value: g.scoreLimit.toString(), inline: true },
                    Replays.blankEmbedField,
                    { name: "Time Limit", value: g.timeLimit.toString(), inline: true },
                    { name: "Income Rate", value: misc.incomeLevel[g.incomeRate], inline: true },
                    { name: "Game Mode", value: Replays.getGameMode(g.map_raw), inline: true },
                    { name: "Starting Points", value: `${g.initMoney} pts`, inline: true },
                ]);

        const playerSeparator: string = "-------------------------------------------";
        const enemyTeamSeparator: string = "---------------OPPOSING TEAM---------------";


        let counter = 1;
        for (const player of g.players) {
            const sep = counter === g.players.length / 2 + 1 && g.players.length > 2 ? enemyTeamSeparator : playerSeparator;

            embed.addFields(
                [{ name: "\u200b", value: sep, inline: false },
                { name: "Player", value: player.name, inline: false },
                { name: "Elo", value: player.elo.toString(), inline: false },
                { name: "Division", value: player.deck!.division, inline: true },
                { name: "Deck Code", value: player.deck!.raw.code, inline: false }
                ]);


            if (player.deck!.franchise === "SD2") {
                embed.addFields([{ name: "Income", value: player.deck!.income, inline: true }]);
            }

            //every fourth, in the beginning there can be only 2 players
            //I don't like this, could propably improve it somehow
            if ((counter % 4 === 0 || counter === 2) && counter !== 0 && counter !== g.players.length) {

                if (g.players.length === 2) break;

                message.channel.send({ embeds: [embed] });
                embed = new EmbedBuilder()
                    .setColor("#0099ff")
            }
            counter++;
        }

        // MsgHelper.sendEmbed(message, embed);
        message.channel.send({ embeds: [embed] });
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