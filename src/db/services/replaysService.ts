import {MapType, ReplayDto, ReplayPlayerDto, ReplayWithOldEloDto, VictoryCondition} from "../models/replay";
import {RawGameData, RawPlayer} from "sd2-utilities/lib/parser/gameParser";
import {misc} from "sd2-data";
import {getChannel} from "./adminsService";
import {Franchise} from "../models/admin";
import {apiErrorMessage} from "../db";


interface UploadInformation {
    uploadedIn: string;
    uploadedBy: string;
    uploadedAt: Date;
}

async function convertToReplayDto(data: RawGameData, uploadInfo: UploadInformation): Promise<ReplayDto | string> {

    let victoryCondition: VictoryCondition;

    switch (misc.victory[data.result.victory].substring(0, 2)) {
        case "Dr":
            victoryCondition = VictoryCondition.draw;
            break;
        case "Mi":
            victoryCondition = VictoryCondition.minor;
            break;
        case "Ma":
            victoryCondition = VictoryCondition.major;
            break;
        case "To":
            victoryCondition = VictoryCondition.total;
            break;
        default:
            return "Wrong victory condition";
    }
    const franchise = data.players[0].deck.franchise === "SD2" ? Franchise.sd2 : Franchise.warno;

    let mapType: MapType | null = null;

    if (franchise === Franchise.sd2) {
        const regex = /([0-9]{1,2})v([0-9]{1,2})/;

        const match = data.mapName.match(regex);

        if (match !== null) {
            const type = "_" + match[0];
            mapType = MapType[type as keyof typeof MapType];
        }
    }

    return {
        sessionId: data.uniqueSessionId,
        uploadedIn: uploadInfo.uploadedIn,
        uploadedBy: uploadInfo.uploadedBy,
        uploadedAt: uploadInfo.uploadedAt,
        franchise: franchise,
        version: data.version,
        isTeamGame: data.players.length > 2,
        map: data.mapName,
        mapType: mapType,
        victoryCondition: victoryCondition,
        durationSec: data.result.duration,
        replayType: null,
        replayPlayers: [
            ...data.players.map(player => convertToReplayPlayerDto(player)),
        ]
    };
}

export function convertToReplayPlayerDto(player: RawPlayer): ReplayPlayerDto {
    return {
        playerId: player.id,
        nickname: player.name,
        elo: player.elo,
        mapSide: null,
        victory: player.winner,
        division: player.deck.raw.division,
        faction: player.deck.faction,
        income: player.deck.franchise === "SD2" ? player.deck.raw.income : null,
        deckCode: player.deck.raw.code
    }
}

export async function uploadReplay(data: RawGameData, uploadInfo: UploadInformation): Promise<ReplayWithOldEloDto | string> {
    if (data.players.some(w => w.deck.division.startsWith("ERROR"))) {
        return "Unknown division";
    }

    const replay: ReplayDto | string = await convertToReplayDto(data, uploadInfo);


    if (typeof replay === "string") {
        return replay;
    }

    const url = process.env.API_URL + "/replays";


    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(replay)
        });


        if (response.status === 409) {

            console.log("Replay is a duplicate")
            return await response.json() as ReplayWithOldEloDto;
        }

        if (!response.ok) {
            const errorText: apiErrorMessage = await response.json();
            const errorMessage = `Failed to upload replay try: ${errorText.message}`;
            console.log(errorMessage, response);

            return "Failed to upload replay";
        }
        console.log("Successfully uploaded replay");

        return await response.json() as ReplayWithOldEloDto;

    } catch (e) {
        console.log("Failed to upload replay catch, error: ", e)

        return "Failed to upload replay";
    }
}
