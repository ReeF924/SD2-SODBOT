import {Message, EmbedBuilder, EmbedField} from "discord.js"
import {GameParser, RawGameData, RawPlayer} from "sd2-utilities/lib/parser/gameParser"
import {misc} from "sd2-data"
import * as axios from "axios"
import {uploadReplay} from "../db/services/replaysService";
import {getPlayersByIds, isPlayerAI} from "../db/services/playerService";
import {Player} from "../db/models/player";
import {UploadReplayResponse} from "../db/models/replay";

const ax = axios.default;

export class Replays {
    private static readonly blankEmbedField: EmbedField = {name: '\u200b', value: '\u200b', inline: true};

    //gets data out of replay
    static async extractReplayInfo(message: Message, url: string, sendEmbed: boolean = true): Promise<RawGameData | null> {

        const gres = await ax.get(url);

        const g: RawGameData = GameParser.parseRaw(gres.data);

        let apiResponded = true;

        //checks if the replay is valid to be uploaded to the db
        //todo maybe make the checks more through, not that important, for later
        //todo definitely rename so it's not confusing af
        if (g.validForUpload) {
            if (sendEmbed)
                await Replays.sendEmbed(message, g, apiResponded, null);

            console.log(`Invalid replay: ${g.validForUpload.reduce((a, b) => `${a}, ${b}`)}`);
            return null;
        }

        let replay: UploadReplayResponse = null;
        //uploads replay to the database
        try {
            replay = await Replays.uploadReplay(g, message);

        } catch (e) {

            if (e.cause.code === "ECONNREFUSED" && e instanceof TypeError) {
                console.log("API offline");
                apiResponded = false;
            }

            console.log(e);
        }

        if (sendEmbed)
            await Replays.sendEmbed(message, g, apiResponded, replay);

        return apiResponded ? g : null;
    }

    private static async uploadReplay(g: RawGameData, message: Message): Promise<UploadReplayResponse> {
        const response = await uploadReplay(g,
            {
                uploadedAt: message.createdAt,
                uploadedBy: message.author.id,
                uploadedIn: message.channel!.id
            });

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

            //26 is the max to not wrap the line (padding because of phone (have to click on text to reveal spoiler))
            let name = p.name;
            const maxLength = Math.min(longestName, 26);
            name = name.substring(0, maxLength).padEnd(26, ' ');
            // name = name.padEnd(maxLength, ' ');

            result += name + "\n";
        });
        return result.substring(0, result.length - 1) + "```";
    }


    static async sendEmbed(message: Message, g: RawGameData, apiResponded: boolean, replay: UploadReplayResponse = null): Promise<void> {
        let players: PlayerInfo[] = [];
        const containsAIs = g.aiCount != 0;

        if (!replay) {
            players = await Replays.GetPlayerByIds(g.players, containsAIs, apiResponded);
        } else if(replay.replayPlayers !== undefined) {
            for (const player of replay.replayPlayers) {
                const p = g.players.find(r => r.id === player.playerId);

                players.push({
                    player: p,
                    mostUsedNickname: player.mostUsedNickname,
                    discordId: player.discordId,
                    sodbotElo: player.sodbotElo,
                    oldSodbotElo: player.oldSodbotElo
                });
            }
        }
        else{
            for (const player of g.players) {
                players.push({
                    player: player,
                    mostUsedNickname: player.name,
                    discordId: null,
                    sodbotElo: null,
                    oldSodbotElo: null,
                })
            }
        }

        let longestName = Math.max(...g.players.map(p => p.name.length));

        let winnersJoined = Replays.joinPlayersToString(g.players.filter(p => p.winner), longestName);
        let losersJoined = Replays.joinPlayersToString(g.players.filter(p => !p.winner), longestName);

        let embed = new EmbedBuilder()
            .setTitle(!g.serverName ? "Game" : g.serverName)
            .setColor("#0099ff")
            .addFields(
                [
                    {name: "Winner", value: `||${winnersJoined}||`, inline: true},
                    {name: "Loser", value: `||${losersJoined}||`, inline: true},
                    {name: "Map", value: g.mapName, inline: false},
                    {
                        name: "Duration",
                        value: `||${Replays.formatDuration(g.result.duration)}||`,
                        inline: true
                    },
                    {name: "Victory State", value: `||${misc.victory[g.result.victory]}||`, inline: true},
                    // {name: "Score Limit", value: g.scoreLimit.toString(), inline: true},
                    // {name: "Time Limit", value: g.timeLimit.toString(), inline: true},
                    // {name: "Income Rate", value: misc.incomeLevel[g.incomeRate], inline: true},
                    // {name: "Game Mode", value: Replays.getGameMode(g.map_raw), inline: true},
                    // {name: "Starting Points", value: `${g.initMoney} pts`, inline: true},
                ]);

        const playerSeparator: string = "-------------------------------------------";
        const enemyTeamSeparator: string = "-------OPPOSING TEAM-------";

        //randomly chooses which team goes first (so you cannot tell who win from it)
        Math.random() < 0.5 ? g.players.sort((a, b) => a.winner === b.winner ? 0 : a.winner ? 1 : -1) : g.players.sort((a, b) => a.winner === b.winner ? 0 : a.winner ? -1 : 1);

        //adds players to embed
        //the fields in embeds are limit, so for more players it splits it into more
        let counter = 1;
        for (const player of players) {
            const sep = counter === g.players.length / 2 + 1 && g.players.length > 2 ? enemyTeamSeparator : playerSeparator;

            //show discord if he has one or show most used name (if it's different)
            let embedPlayerField = this.blankEmbedField;
            if (player.discordId) {
                embedPlayerField = {name: "Discord", value: `<@${player.discordId}>`, inline: true};
            } else if (player.player.name.trim().toLowerCase() != player.mostUsedNickname.trim().toLowerCase()) {
                embedPlayerField = {name: "Most used name", value: player.mostUsedNickname, inline: true};
            }

            let eloText: string = "Unknown";
            if (player.sodbotElo) {
                eloText = player.sodbotElo.toFixed(2);

                if (player.oldSodbotElo) {
                    const eloDiff = player.sodbotElo - player.oldSodbotElo;
                    let char = "";
                    char = eloDiff > 0 ? "+" : "-";
                    eloText += ` ||(${char}${Math.abs(eloDiff).toFixed(2)})||`;
                }
            }

            let embedDivIncome: EmbedField = {name: "Division", value: player.player.deck!.division, inline: false};
            if (player.player.deck!.franchise === "SD2") {
                embedDivIncome = {name: "Division + Income", value: player.player.deck!.division + " + " + player.player.deck.income, inline: false};
            }

            const playerIsAI = isPlayerAI(player.player);

            embed.addFields(
                [{name: "\u200b", value: sep, inline: false},
                    {name: "Player", value: player.player.name, inline: true},
                    embedPlayerField,
                    !playerIsAI ? {name: "EugenId", value: player.player.id.toString(), inline: true} : this.blankEmbedField,
                    {name: "EugenElo", value: player.player.elo.toFixed(2), inline: false},
                    !playerIsAI ? {name: "SodbotElo", value: eloText, inline: false} : {name: "\u200b", value: "\u200b", inline: false},
                    embedDivIncome,
                    {name: "Deck Code", value: player.player.deck.raw.code, inline: false}
                ]);


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

    static async GetPlayerByIds(players: RawPlayer[], containsAIs: boolean, apiResponded: boolean): Promise<PlayerInfo[]> {
        let response: Player[] | string;
        if (apiResponded) {

            const ids: number[] = !containsAIs
            ? players.map(p => p.id)
            : players.filter(p => !isPlayerAI(p)).map(p => p.id);

            try {
                response = await getPlayersByIds(ids);
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
        } else {
            response = [];
        }

        //decides which elo to return
        const rp = players[0];
        const elo = rp.deck.franchise === "SD2" ? players.length > 2 ? "sdTeamGameElo" : "sdElo"
            : players.length > 2 ? "warnoTeamGameElo" : "warnoElo";


        // const output: ReplayPlayerWithEloDto[] = [];
        const output: PlayerInfo[] = [];

        players.forEach(rp => {
            const player = response.filter(p => p.id === rp.id)[0];

            if (player) {
                output.push({
                    player: rp,
                    mostUsedNickname: player.nickname,
                    discordId: player.discordId,
                    sodbotElo: player[elo],
                    oldSodbotElo: null
                });
            } else {
                output.push({
                    player: rp,
                    mostUsedNickname: rp.name,
                    discordId: null,
                    sodbotElo: null,
                    oldSodbotElo: null
                });
            }
        });

        return output;
    }

    static formatDuration(seconds: number): string {
        return `${Math.floor(seconds / 60)} Minutes and ${seconds % 60} Seconds`
    }
}

declare interface PlayerInfo {
    player: RawPlayer;
    mostUsedNickname: string | null;
    discordId?: string;
    sodbotElo?: number;
    oldSodbotElo?: number;
}