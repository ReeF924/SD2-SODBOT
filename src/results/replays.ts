import {Message, EmbedBuilder, EmbedField} from "discord.js"
import {GameParser, RawGameData, RawPlayer} from "sd2-utilities/lib/parser/gameParser"
import {misc, maps} from "sd2-data"
import * as axios from "axios"
import {DB} from "../general/db";
import {DiscordBot, MsgHelper} from "../general/discordBot";
import {PermissionsSet} from "../general/permissions";

const ax = axios.default;
//todo maps - 2v2..., mode - brk, cqc, meet, maybe add to embed? (display only if not default?)
//todo what if-else shit in retractPlayerInfo
//todo crases when there are multiple players? maybe something to do with db save?cd

export class Replays {
    private static readonly blankEmbedField: EmbedField = {name: '\u200b', value: '\u200b', inline: true};

    //todo delete, will be in sdData
    private static readonly AILevel = {
        0: "Very Easy",
        1: "Easy",
        2: "Medium",
        3: "Hard",
        4: "Very Hard"
    }

    static extractReplayInfo(message: Message, perms: PermissionsSet, database: DB, url: string): void {
        ax.get(url).then(async (res) => {
            const g = GameParser.parseRaw(res.data);


            //determine who won and lost, calculate ELO
            const winnerList: RawPlayer[] = []
            const loserList: RawPlayer[] = []

            const result = g.result.victory > 3 ? g.ingamePlayerId >= g.players.length / 2 : g.ingamePlayerId < g.players.length / 2;


            for (const player of g.players) {
                (result ? player.alliance === 1 : player.alliance === 0) ? winnerList.push(player) : loserList.push(player);
            }

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

            let name = '';

            if (p.name === "" && p.aiLevel < 5)
                p.name = "AI " + Replays.AILevel[p.aiLevel];

            name = p.name;
            const maxLength = Math.min(longestName, 20);
            name = name.substring(0, maxLength);
            name = name.padEnd(maxLength, '-');

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
        if (!map) {
            //Pure guess, it's usually the name, but not always, better than nothing tho
            map = g.map_raw.split('_')[2];
            MsgHelper.say(message, "Map not found, please contact <@607962880154927113> to add it.");
        }

        // Create embed header
        //temp, to make the debug easier
        let embed = new EmbedBuilder()
            .setTitle(g.serverName || "Game")
            .setColor("#0099ff")
            .addFields(
                [{name: "Winner", value: `||${winners}||`, inline: true},
                    Replays.blankEmbedField,
                    {name: "Loser", value: `||${losers}||`, inline: true},
                    {name: "Map", value: map, inline: true},
                    {name: "Duration", value: `||${Replays.duration(g.result.duration)}||`, inline: true},
                    {name: "Victory State", value: `||${misc.victory[g.result.victory]}||`, inline: true},
                    {name: "Score Limit", value: g.scoreLimit.toString(), inline: true},
                    Replays.blankEmbedField,
                    {name: "Time Limit", value: g.timeLimit.toString(), inline: true},
                    {name: "Income Rate", value: misc.incomeLevel[g.incomeRate], inline: true},
                    {name: "Game Mode", value: Replays.getGameMode(g.map_raw), inline: true},
                    {name: "Starting Points", value: `${g.initMoney} pts`, inline: true},
                ]);

        const playerSeparator: string = "---------------------------------------------------";
        const enemyTeamSeparator: string = "-------------------OPPOSING TEAM-------------------";

        // g.players = Replays.sortPlayers(g.players, g.ingamePlayerId);


        let counter = 1;
        for (const player of g.players) {
            const sep = counter === g.players.length / 2 + 1 && g.players.length > 2 ? enemyTeamSeparator : playerSeparator;

            embed.addFields(
                [{name: "\u200b", value: sep, inline: false},
                    {name: "Player", value: player.name, inline: false},
                    {name: "Elo", value: player.elo.toString(), inline: false},
                    {name: "Division", value: player.deck!.division, inline: true},
                    {name: "Income", value: player.deck!.income, inline: true},
                    {name: "Deck Code", value: player.deck!.raw.code, inline: false}]
            );

            if (player.deck!.franchise === "WARNO") {
                embed.addFields([{
                    name: "Deck",
                    value: `[VIEW](https://war-yes.com/deck-builder?code=${player.deck!.raw.code} 'view on war-yes.com')`,
                    inline: false
                }]);
            }

            //every fourth, in the beginning there can be only 2 players
            //I don't like this, could propably improve it somehow
            if ((counter % 4 === 0 || counter === 2) && counter !== 0 && counter !== g.players.length) {

                if (g.players.length === 2) break;

                MsgHelper.sendEmbed(message, embed);
                embed = new EmbedBuilder()
                    .setColor("#0099ff")
            }
            counter++;
        }
        MsgHelper.sendEmbed(message, embed);
    }

    static sortPlayers(players: RawPlayer[], winnerAl: number): RawPlayer[] {
        return [
            ...players.filter(p => p.alliance === winnerAl),
            ...players.filter(p => p.alliance !== winnerAl)
        ];

    }

    static getWinnersAndLosers(players: RawPlayer[], winnerAl: number): { winners: RawPlayer[], losers: RawPlayer[] } {
        const winners: RawPlayer[] = [];
        const losers: RawPlayer[] = [];


        for (const player of players) {
            const n = players.length;

            if (player.alliance >= n / 2) {
                winnerAl === 1 ? winners.push(player) : losers.push(player);
            } else {
                winnerAl === 0 ? winners.push(player) : losers.push(player);
            }


        }


        return {winners: winners, losers: losers}
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