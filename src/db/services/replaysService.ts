import {MapType, Replay, ReplayDto, ReplayPlayerDto, UploadReplayResponse, ReplayReport, VictoryCondition} from "../models/replay";
import {RawGameData, RawPlayer} from "sd2-utilities/lib/parser/gameParser";
import {misc} from "sd2-data";
import {Franchise} from "../models/admin";
import {response} from "express";

interface UploadReplayResult{
    message: string;
    replay: UploadReplayResponse;
}

interface UploadInformation {
    uploadedIn: string;
    uploadedBy: string;
    uploadedAt: Date;
}

export async function getReplay(id:number) : Promise<Replay | string>{
    const url = process.env.API_URL + "/replays/" + id;

    try {
        const response = await fetch(url);

        if(response.ok){
            const ret = await response.json();
            return ret.replay as Replay;
        }

        if(response.status === 404){
            return "Replay not found.";
        }

        return "Error occurred while retrieving replay.";

    }
    catch (error) {
        console.log(`Error while retrieving replay in guild --- ` + error);
    }

    return "Error occurred while retrieving replay.";
}

export async function uploadReplay(data: RawGameData, uploadInfo: UploadInformation): Promise<UploadReplayResponse | string> {


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

        // @ts-ignore
        const res: UploadReplayResult = await response.json();

        if (!response.ok && response.status !== 409) {
            const errorMessage = `Failed to upload replay try: ${res.message}`;
            console.log(errorMessage, response);

            return "Failed to upload replay (API Error)";
        }

        //Successfully uploaded or duplicate
        return res.replay;

    } catch (e) {
        console.log("Failed to upload replay catch, error: ", e)

        return "Failed to upload replay";
    }
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
    const franchise = data.franchise === "SD2" ? Franchise.sd2 : Franchise.warno;

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
        skillLevel: null,
        replayPlayers: [
            ...data.players.map(player => convertToReplayPlayerDto(player, data.franchise)),
        ]
    };
}

export function convertToReplayPlayerDto(player: RawPlayer, franchise:"SD2" | "WARNO"): ReplayPlayerDto {
    return {
        playerId: player.id,
        nickname: player.name,
        elo: player.elo,
        mapSide: null,
        victory: player.winner,
        division: player.deck.raw.division,
        faction: player.deck.faction,
        income: franchise === "SD2" ? player.deck.raw.income : null,
        deckCode: player.deck.raw.code
    }
}

export async function uploadReplayReport(report: ReplayReport): Promise<Replay[] | string> {

    const url = process.env.API_URL + "/replays/bans";
    let response:Response;
    let ret:any;
    try {
        response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(report)
        });
        ret = await response.json();
    }
    catch (error) {
        console.error("Error while fetching API:", error);
        return "Failed to upload report";
    }

    if(response.status === 500 || response.status === 404 || response.status === 400) {
        return ret.message;
    }

   return ret.replays;
}