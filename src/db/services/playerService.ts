import { Player, PlayerAliases, PlayerPutDto, PlayerRank } from "../models/player";
import { apiErrorMessage } from './adminsService';
import { Logs } from "../../general/logs";
import { RawPlayer } from "sd2-utilities/lib/parser/gameParser";


export async function getPlayer(id: number | string): Promise<Player | string> {

    const url = process.env.API_URL + "/players/" + id;

    const response = await fetch(url);

    if (response.ok) {
        const ret = await response.json();
        return ret.player as Player;
    }

    if (response.status === 404) {
        return "Player not found";
    }

    Logs.error("Error getting player: " + response.statusText);
    return "Error when getting player";
}

export async function getPlayersByIds(ids: number[]): Promise<Player[] | string> {

    let url = process.env.API_URL + "/players/getPlayersByIds";

    const params = new URLSearchParams();

    ids.forEach(id => params.append('ids', id.toString()));

    url += '?' + params.toString();


    const response = fetch(url);
    response.catch(e => Logs.error(`Error while getting player by ids: ${e}`));

    const answer = await response;

    if (answer.ok) {
        const ret = await answer.json();
        return ret.players as Promise<Player[]>;
    }

    if (answer.status === 404) {
        return "Player not found";
    }

    Logs.log("Failed to get players: " + answer.statusText);
    return "Error when getting player";

    // } catch (e) {
    //     if (e.cause.code === "ECONNREFUSED" && e instanceof TypeError) {
    //         console.log("API offline");
    //     } else {
    //         // console.log('Error while getting player by ids', e);
    //         console.log('CATCH PLSERVICE');
    //     }
    //
    //     return 'Failed to get player by ids RTRNPLSERVICE';
    // }
    // return 'Unknown error'
}

//best I can do for now, it works, so... :)
export function isPlayerAI(p: RawPlayer): boolean {
    return p.aiLevel < 10 && p.name.includes("AI") && p.level === 0;
}

export async function updatePlayersDiscordId(id: number, input: PlayerPutDto): Promise<Player | string> {

    const url = process.env.API_URL + "/players/" + id.toString();

    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(input)
        });
        if (response.ok) {
            const ret = await response.json();
            return ret.player as Player;
        }
        if (response.status === 400) {
            const errorMessage: apiErrorMessage = await response.json();
            return errorMessage.message;
        }

        if (response.status === 409) {
            const errorMessage: apiErrorMessage = await response.json();
            return errorMessage.message;
        }

        Logs.error("Bad response while uploading player: " + response.statusText);
        return 'Failed to upload player';

    } catch (e) {
        Logs.error('Error while uploading player :' + e);
        return 'Failed to upload player';
    }
}

export async function getLeaderboard(eloType: string): Promise<PlayerRank[] | string> {

    const url = process.env.API_URL + "/players/rank?pageNumber=1&pageSize=10&eloType=" + eloType;

    try {
        const response = await fetch(url);

        if (response.ok) {
            const ret = await response.json();
            return ret.players as PlayerRank[];
        }

        const errorMessage: apiErrorMessage = await response.json();

        Logs.error("Failed to get leaderboard: " + errorMessage.message);
        return "Failed to get leaderboard";
    } catch (e) {
        Logs.error('Error while getting leaderboard: ' + e);
        return 'Failed to get leaderboard';
    }
}

export async function getPlayerRank(playerId: string, eloType: string): Promise<PlayerRank[] | string> {

    const url = process.env.API_URL + "/players/rank/" + playerId + "?eloType=" + eloType;

    try {
        const response = await fetch(url);

        if (response.ok) {
            const ret = await response.json();
            return ret.players as PlayerRank[];
        }

        if (response.status === 404) {
            const errorMessage: apiErrorMessage = await response.json();
            Logs.error("Failed to get leaderboard: " + errorMessage.message);
            return errorMessage.message;
        }

        return "Failed to get leaderboard";

    } catch (e) {
        Logs.error('Error while getting leaderboard: ' + e);
        return 'Failed to get leaderboard';
    }
}

export const getPlayerAliases = async (id: number): Promise<PlayerAliases | string> => {
    const url = process.env.API_URL + "/players/aliases/" + id;

    try {
        const response = await fetch(url);

        if (response.ok) {
            const ret = await response.json();
            return ret.player as PlayerAliases
        }

        if (response.status === 404) {
            return "Player not found";
        }

        return "Failed to get player aliases";
    }
    catch (e) {
        Logs.error('Error while getting player aliases: ' + e);
        return 'Failed to get player aliases';
    }


}


















