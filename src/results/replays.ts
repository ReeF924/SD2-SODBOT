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

    public static async responseToReplay(message: Message, url: string, sendEmbed: boolean = true): Promise<void> {

        const game = await this.extractReplayInfo(url);

        //get additional info about players from the API
        //if game gets uploaded, it gets the info from the response
        let players: PlayerInfo[] = [];
        
        try {
            //checks if the replay is valid to be uploaded to the db
            if (game.validForUpload === null) {
                const replay = await Replays.uploadReplay(game, message);

                for (const player of replay.replayPlayers) {
                    const p = game.players.find(r => r.id === player.playerId);

                    players.push({
                        raw: p,
                        mostUsedNickname: player.mostUsedNickname,
                        discordId: player.discordId,
                        sodbotElo: player.sodbotElo,
                        oldSodbotElo: player.oldSodbotElo
                    });
                }
            }
            //if it doesn't get uploaded, get it directly
            else {
                players = await Replays.GetPlayerByIds(game.players, game.aiCount != 0);
            }
        }
            //if there's an error, just use only the info available
        catch (error) {
            if (error instanceof TypeError) {
                console.log("API offline or unreachable");
            } else {
                console.log(`Error while uploading replays in guild ${message.guild} channel ${message.channel} --- ` + error);
            }

            for (const player of game.players) {
                players.push({
                    raw: player,
                    mostUsedNickname: player.name,
                    discordId: null,
                    sodbotElo: null,
                    oldSodbotElo: null,
                })
            }
        }

        if(!sendEmbed){
            return;
        }

        await this.sendEmbed(message, game, players);
    }

    static async sendEmbed(message: Message, g: RawGameData, players: PlayerInfo[]): Promise<void> {

        let longestName = Math.max(...g.players.map(p => p.name.length));
        longestName = longestName <= 24 ? longestName : 24;

        //join all the players (if it's a teamgame)
        let winnersJoined = Replays.joinPlayersToString(g.players.filter(p => p.winner));
        let losersJoined = Replays.joinPlayersToString(g.players.filter(p => !p.winner));

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

        //send the embed with response (split to make it simpler to understand)
        if (players.length <= 2) {
            await this.sendEmbed_1v1(message, players, embed);
            return;
        }

        await this.sendEmbed_teamGame(message, players, embed);
    }

    static async sendEmbed_1v1(message: Message, players: PlayerInfo[], embed: EmbedBuilder) {
        const playerSeparator: string = "-------------------------------------------";

        for (const player of players) {
            this.addPlayerFieldsToEmbed(embed, player, playerSeparator);
        }
        // MsgHelper.sendEmbed(message, embed);
        message.channel.send({embeds: [embed]});
    }

    static async sendEmbed_teamGame(message: Message, players: PlayerInfo[], embed: EmbedBuilder) {

        //randomly chooses which team goes first (so you cannot tell who win from it)
        if(Math.random() > 0.5){
            players.sort((a, b) => Number(a.raw.winner) - Number(b.raw.winner));
        }
        else{
            players.sort((a, b) => Number(b.raw.winner) - Number(a.raw.winner));
        }

        //seperates players inside the embeds
        const playerSeparator: string = "-------------------------------------------";
        const enemyTeamSeparator: string = "-------OPPOSING TEAM-------";

        let counter = 1;
        let playerResult:boolean = players[0].raw.winner;
        for (const player of players) {

            let sep = playerSeparator;

            if(player.raw.winner != playerResult) {
                sep = enemyTeamSeparator;
                playerResult = player.raw.winner;
            }

            this.addPlayerFieldsToEmbed(embed, player, sep);

            //every third player, but in the beginning there can be only 2 players (because of the replay info)
            //to not exceed the limit of fields in an embed (25)

            //last iteration is sent after the for-loop (to avoid double-send)
            if(counter === players.length){
                break;
            }
            //avoid the first iteration
            if(counter === 0){
                counter++;
                continue;
            }
            //every third player (without the first 2)
            if ((counter - 2) % 3 === 0)
            {
                message.channel.send({embeds: [embed]});

                embed = new EmbedBuilder().setColor("#0099ff")
            }
            counter++;
        }

    // MsgHelper.sendEmbed(message, embed);
        message.channel.send({embeds: [embed]});
    }

    //gets data out of replay
    private static async extractReplayInfo(url: string): Promise<RawGameData | null> {
        const gres = await ax.get(url);

        return GameParser.parseRaw(gres.data);
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

    private static addPlayerFieldsToEmbed(embed: EmbedBuilder, player: PlayerInfo, sep:string) {
        const playerIsAI = isPlayerAI(player.raw);


        //show discord if he has one or show most used name (if it's different)
        let embedPlayerField = this.blankEmbedField;

        if (player.discordId) {
            embedPlayerField = {name: "Discord", value: `<@${player.discordId}>`, inline: true};
        }
        else if (player.raw.name.trim().toLowerCase() != player.mostUsedNickname.trim().toLowerCase()) {
            embedPlayerField = {name: "Most used name", value: player.mostUsedNickname, inline: true};
        }

        //show elo stored in the database
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

        //if the game is SD, add income as well
        let embedDivIncome: EmbedField = {name: "Division", value: player.raw.deck!.division, inline: true};
        if (player.raw.deck!.franchise === "SD2") {
            embedDivIncome = {
                name: "Division + Income",
                value: player.raw.deck!.division + "\n" + player.raw.deck.income,
                inline: true
            };
        }

        embed.addFields(
            [{name: "\u200b", value: sep, inline: false},
                {name: "Player", value: player.raw.name, inline: true},
                embedPlayerField,
                !playerIsAI ? {
                    name: "EugenId",
                    value: player.raw.id.toString(),
                    inline: true
                } : this.blankEmbedField,
                embedDivIncome,
                {name: "EugenElo", value: player.raw.elo.toFixed(2), inline: true},
                !playerIsAI ? {name: "SodbotElo", value: eloText, inline: true} : {
                    name: "\u200b",
                    value: "\u200b",
                    inline: true
                },

                {name: "Deck Code", value: player.raw.deck.raw.code, inline: false}
            ]);
    }

    private static joinPlayersToString(players: RawPlayer[]): string {
        let result = "```\n";

        players.forEach(p => {
            //Fixes Koneig's name, he always gets it wrong (meme feel free to get rid of it)
            p.name = p.name.replace(/[Kk]oenig/g, "Koneig");

            const name = p.name.substring(0, 24);

            result += name + "\n";
        });

        return result.substring(0, result.length - 1) + "```";
    }

    static async GetPlayerByIds(players: RawPlayer[], containsAIs: boolean): Promise<PlayerInfo[]> {
        let response: Player[] | string;

        const ids: number[] = !containsAIs
            ? players.map(p => p.id)
            : players.filter(p => !isPlayerAI(p)).map(p => p.id);


        response = await getPlayersByIds(ids);


        if (typeof response === 'string') {
            console.log('logPlayers', response);
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
                    raw: rp,
                    mostUsedNickname: player.nickname,
                    discordId: player.discordId,
                    sodbotElo: player[elo],
                    oldSodbotElo: null
                });
            } else {
                output.push({
                    raw: rp,
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
    raw: RawPlayer;
    mostUsedNickname: string | null;
    discordId?: string;
    sodbotElo?: number;
    oldSodbotElo?: number;
}