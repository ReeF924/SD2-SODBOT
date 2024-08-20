import {Message, EmbedBuilder, EmbedField} from "discord.js"
import {GameParser, RawGameData, RawPlayer} from "sd2-utilities/lib/parser/gameParser"
import {misc, maps} from "sd2-data"
import * as axios from "axios"
import {convertToReplayPlayerDto, uploadReplay} from "../db/services/replaysService";
import {getPlayersByIds} from "../db/services/playerService";
import {Logs} from "../general/logs";
import {Player} from "../db/models/player";
import {MsgHelper} from "../general/discordBot";
import {ReplayPlayerWithEloDto, ReplayWithOldEloDto} from "../db/models/replay";

const ax = axios.default;
//todo what if-else shit in retractPlayerInfo
//todo crases when there are multiple players? maybe something to do with db save?cd

export class Replays {
    private static readonly blankEmbedField: EmbedField = {name: '\u200b', value: '\u200b', inline: true};

    //gets data out of replay and prepares them for the embed
    static async extractReplayInfo(message: Message, url: string, sendEmbed: boolean = true): Promise<RawGameData | null> {

        const gres = await ax.get(url);

        const g: RawGameData = GameParser.parseRaw(gres.data);

        const {winners, losers} = Replays.SplitWinnersLosers(g.players, g.result.victory, g.ingamePlayerId);

        //randomly chooses which team goes first (so you cannot tell who win from it)
        g.players.splice(0, g.players.length);
        Math.random() < 0.5 ? g.players.push(...winners, ...losers) : g.players.push(...losers, ...winners);


        const map = await Replays.getMapName(g);

        const valid = Replays.isValidReplay(g);

        let apiResponded = true;

        //checks if the replay is valid to be uploaded to the db
        //todo this is only half of the job
        if (valid === null) {
            let replay: ReplayWithOldEloDto = null;
            //uploads replay to the database
            try {
                replay = await Replays.uploadReplay(g, winners, losers, message, map);

            } catch (e) {
                if (e.cause.code === "ECONNREFUSED" && e instanceof TypeError) {
                    console.log("API offline");
                    apiResponded = false;
                    return null;
                }

                console.log(e);
            }

            if (sendEmbed)
                await Replays.sendEmbed(message, g, winners, losers, map, apiResponded, replay);

            return;
        }

        if (sendEmbed)
            await Replays.sendEmbed(message, g, winners, losers, map, apiResponded, null);

        console.log(`Invalid replay: ${valid}`);
        return null;

    }

    private static async uploadReplay(g: RawGameData, winnerList: RawPlayer[], loserList: RawPlayer[], message: Message, map: string): Promise<ReplayWithOldEloDto> {
        const response = await uploadReplay(g, winnerList, loserList,
            {
                uploadedAt: message.createdAt,
                uploadedBy: message.author.id,
                uploadedIn: message.channel!.id
            }, map);

        if (typeof response === 'string') {
            console.log(response);
            return null;
        }

        return response;
    }

    private static joinPlayersToString(players: RawPlayer[], longestName: number): string {
        let result = "```\n";

        players.forEach(p => {
            //Fixes Koneig's name, he always gets it wrong
            p.name = p.name.replace(/[Kk]oenig/g, "Koneig");

            let name = p.name;
            const maxLength = Math.min(longestName, 36);
            name = name.substring(0, maxLength).padEnd(36, ' ');
            // name = name.padEnd(maxLength, ' ');

            result += name + "\n";
        });
        return result.substring(0, result.length - 1) + "```";
    }

    private static isValidReplay(g: RawGameData): string | null {
        if (g.aiCount > 0) return "aiCount";
        if (g.gameMode != 1) return "gameMode";
        if (g.incomeRate != 3 && g.players.length == 2) return "incomeRate"; //don't accept other for 1v1s
        if (g.scoreLimit != 2000) return "scoreLimit";
        return null;
    }

    private static async getMapName(g: RawGameData): Promise<string> {
        let map = misc.map[g.map_raw];

        //if the map's not in sd2-data, this tries to guess it's name
        if (!map) {

            if(!g.map_raw.includes('_')){
                return g.map_raw;
            }

            const arr = g.map_raw.split('_');

            if(arr.length < 3){
                return g.map_raw;
            }

            map = arr[2];
            let counter = 3;
            while (counter < arr.length && isNaN(parseInt(arr[counter][0]))) {

                if (arr[counter] === 'LD') {
                    break;
                }

                map += ' ' + arr[counter];
                counter++;
            }

            map = map.replace(/([A-Z])/g, ' $1').trim();


            if (!await Logs.logToFile(g.map_raw + " : " + map)) {
                console.log('\nnewMap:', g.map_raw + ' : ' + map + '\n');
            }
        }

        return map;
    }

    static async sendEmbed(message: Message, g: RawGameData, winners: RawPlayer[], losers: RawPlayer[], mapName: string, apiResponded:boolean, replay: ReplayWithOldEloDto = null): Promise<void> {
        let players:PlayerInfo[] = [];


        if(!replay){
            players = await Replays.GetPlayerByIds(winners, losers, apiResponded);
        }
        else{
            for(const player of replay.replayPlayers){
                const p = g.players.find(r => r.id === player.playerId);

                players.push({player: p, discordId: player.discordId, sodbotElo: player.sodbotElo, oldSodbotElo: player.oldSodbotElo});
            }


        }




        let longestName = Math.max(...winners.map(p => p.name.length), ...losers.map(p => p.name.length));

        let winnersJoined = Replays.joinPlayersToString(winners, longestName);
        let losersJoined = Replays.joinPlayersToString(losers, longestName);

        let embed = new EmbedBuilder()
            .setTitle(!g.serverName ? "Game" : g.serverName)
            .setColor("#0099ff")
            .addFields(
                [
                    {name: "Winner", value: `||${winnersJoined}||`, inline: true},
                    {name: "Loser", value: `||${losersJoined}||`, inline: true},
                    {name: "Map", value: mapName, inline: false},
                    {name: "Duration", value: `||${Replays.duration(g.result.duration)}||`, inline: true},
                    {name: "Victory State", value: `||${misc.victory[g.result.victory]}||`, inline: true},
                    // {name: "Score Limit", value: g.scoreLimit.toString(), inline: true},
                    // {name: "Time Limit", value: g.timeLimit.toString(), inline: true},
                    // {name: "Income Rate", value: misc.incomeLevel[g.incomeRate], inline: true},
                    // {name: "Game Mode", value: Replays.getGameMode(g.map_raw), inline: true},
                    // {name: "Starting Points", value: `${g.initMoney} pts`, inline: true},
                ]);

        const playerSeparator: string = "-------------------------------------------";
        const enemyTeamSeparator: string = "-------OPPOSING TEAM-------";


        let counter = 1;
        for (const player of players) {
            const sep = counter === g.players.length / 2 + 1 && g.players.length > 2 ? enemyTeamSeparator : playerSeparator;


            const embedPlayerField = player.discordId
                ? {name: "Discord", value: `<@${player.discordId}>`, inline: true}
                : {name: "EugenId", value: player.player.id.toString(), inline: true};


            let eloText:string = "error";
            if(player.sodbotElo){
                eloText = player.sodbotElo.toFixed(2);

                if(player.oldSodbotElo){
                    const eloDiff = player.sodbotElo - player.oldSodbotElo;
                    let char = "";
                    char = eloDiff > 0 ? "+" : "-";
                    eloText += ` ||(${char}${Math.abs(eloDiff).toFixed(2)})||`;
                }
            }

            embed.addFields(
                [{name: "\u200b", value: sep, inline: false},
                    {name: "Player", value: player.player.name, inline: true},
                    embedPlayerField,
                    {name: "EugenElo", value: player.player.elo.toFixed(2), inline: false},
                    {name: "SodbotElo", value: eloText, inline: false},
                    {name: "Division", value: player.player.deck!.division, inline: false},
                    {name: "Deck Code", value: player.player.deck.raw.code, inline: false}
                ]);


            if (player.player.deck!.franchise === "SD2") {
                embed.addFields([{name: "Income", value: player.player.deck!.income, inline: true}]);
            }

            //every third player, but in the beginning there can be only 2 players (basic info)
            //to not exceed the limit of fields in an embed (25)
            //I don't like this, could propably improve it somehow
            if ((counter - 2) % 3 === 0 && counter !== 0 && counter !== g.players.length) {
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

    static SplitWinnersLosers(players: RawPlayer[],victoryResult:number, ingamePlayerId: number): {winners: RawPlayer[], losers: RawPlayer[]} {
        const winnerList: RawPlayer[] = []
        const loserList: RawPlayer[] = []

        //decides if a player lost or won
        const result = victoryResult > 3 ? ingamePlayerId >= players.length / 2 : ingamePlayerId < players.length / 2;

        for (const player of players) {
            (result ? player.alliance === 1 : player.alliance === 0) ? winnerList.push(player) : loserList.push(player);
        }

        return {winners: winnerList, losers: loserList};
    }

    static async GetPlayerByIds(winners: RawPlayer[], losers: RawPlayer[], apiResponded: boolean): Promise<PlayerInfo[]> {
        let response: Player[] | string;
        if(apiResponded){
            try {

                response = await getPlayersByIds([...winners.map(p => p.id), ...losers.map(p => p.id)]);

            } catch (e) {

                if (e.cause.code === "ECONNREFUSED" && e instanceof TypeError) {
                    console.log("API offline");
                } else {
                    console.log('failed to get players by ids', e);
                }
                response = 'Error'
            }

            if (typeof response === 'string') {
                console.log('logPlayers', response);
                response = [];
            }
        }
        else{
            response = [];
        }

        //decides which elo to return
        const rp = winners[0];
        const elo = rp.deck.franchise === "SD2" ? winners.length + losers.length > 2 ? "SdTeamGameElo" : "sdElo"
            : winners.length + losers.length > 2 ? "warnoTeamGameElo" : "warnoElo";


        // const output: ReplayPlayerWithEloDto[] = [];
        const output: PlayerInfo[] = [];

        [...winners, ...losers].forEach(rp => {
            const player = response.filter(p => p.id === rp.id)[0];

            if(player){
                output.push({player:rp, discordId: player.discordId, sodbotElo: player[elo], oldSodbotElo: null});
            }
            else{
                output.push({player:rp, discordId: null, sodbotElo: null, oldSodbotElo: null});
            }
        })

        return output;
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

declare interface PlayerInfo{
    player: RawPlayer;
    discordId?: string;
    sodbotElo?: number;
    oldSodbotElo?: number;
}