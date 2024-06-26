import {MapType, ReplayDto, ReplayPlayerDto, VictoryCondition} from "./replaysModels";
import {RawGameData, RawPlayer} from "sd2-utilities/lib/parser/gameParser";
import {misc} from "sd2-data";
import {getChannel} from "../admins/adminsService";
import {Franchise} from "../admins/adminsModels";


interface UploadInformation {
    uploadedIn: number;
    uploadedBy: number;
    uploadedAt: Date;
}

async function convertToReplayDto(data: RawGameData, winners: RawPlayer[], losers: RawPlayer[], uploadInfo: UploadInformation, mapName: string): Promise<ReplayDto | string> {

    let victoryCondition: VictoryCondition;

    //todo add DRAW!!!!!!!
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

    //not a fan of this, but fuck Eugen for not being consistent
    let mapType: MapType;

    if (franchise === Franchise.sd2) {
        const regex = /([0-9])v([0-9])/;

        const match = data.map_raw.match(regex);

        //autobahn doesn't have the 2v2 in it's name (only sd one), Tannenberg has 10vs10...
        if (match === null) {
            if (mapName === ("Autobahn_Zur_Holle"))
                mapType = MapType._2v2;
            else if (mapName === "Tannenberg 10v10")
                mapType = MapType._10v10;
            else
                mapType = null;
        } else {
            const type = match[0] === "0v0" ? "_10v10" : "_" + match[0];

            mapType = MapType[type as keyof typeof MapType];
        }
    //now for warno, because Eugen don't even name their maps consistently
    } else {
        const match = data.map_raw.match(/([0-9])vs([0-9])/) ?? mapName.match(/([0-9])v([0-9])/);

        if (match === null) {
            if(data.players.length === 2)
                mapType = MapType._1v1;
            else
                mapType = null;

        } else {
            const type = match[0] === "0vs0" || match[0] === "0v0" ? "_10v10" : "_" + match[0].replace("vs", "v");

            mapType = MapType[type as keyof typeof MapType];
        }


    }

    const channel = await getChannel(uploadInfo.uploadedIn);

    const replayType = channel ? channel.skillLevel : null;


    const replay: ReplayDto = {
        sessionId: data.uniqueSessionId,
        uploadedIn: uploadInfo.uploadedIn,
        uploadedBy: uploadInfo.uploadedBy,
        uploadedAt: uploadInfo.uploadedAt,
        franchise: franchise,
        version: data.version,
        isTeamGame: data.players.length > 2,
        map: mapName,
        mapType: mapType,
        victoryCondition: victoryCondition,
        durationSec: data.result.duration,
        replayType: replayType,
        replayPlayers: [
            ...winners.map(player => convertToReplayPlayerDto(player, true)),
            ...losers.map(player => convertToReplayPlayerDto(player, false))
        ]
    }
    return replay;
}

function convertToReplayPlayerDto(player: RawPlayer, victory: boolean): ReplayPlayerDto {
    return {
        playerId: player.id,
        nickname: player.name,
        elo: player.elo,
        mapSide: null,
        victory: victory,
        division: player.deck.raw.division,
        faction: player.deck.faction,
        income: player.deck.franchise === "SD2" ? player.deck.raw.income : null,
        deckCode: player.deck.raw.code

    }

}

export async function uploadReplay(data: RawGameData, winners: RawPlayer[], losers: RawPlayer[], uploadInfo: UploadInformation, mapName: string): Promise<ReplayDto | string> {
    if (winners.some(w => w.deck.division.startsWith("ERROR")) || losers.some(l => l.deck.division.startsWith("ERROR"))) {
        return "Unknown division";
    }

    const replay: ReplayDto | string = await convertToReplayDto(data, winners, losers, uploadInfo, mapName);


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
            return "Replay is a duplicate.";
        }

        if (!response.ok) {
            const errorText = await response.text();
            const errorMessage = `Failed to upload replay try: ${errorText}`;
            console.log(errorMessage, response);

            return "Failed to upload replay";
        }
        console.log("Succesfully uploaded replay");
        return replay;

    } catch (e) {
        console.log("Failed to upload replay catch, error: ", e)

        return "Failed to upload replay";
    }
}
