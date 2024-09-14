import {Player, PlayerAliases, PlayerPutDto, PlayerRank} from "../models/player";
import {apiErrorMessage} from '../db';
import axios from 'axios';
import {Logs} from "../../general/logs";


export async function getPlayer(id: number): Promise<Player | string> {

    const url = process.env.API_URL + "/players/" + id;

    const response = await fetch(url);

    if (response.ok) {
        return await response.json();
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

    const anwser = await response;

    if (anwser.ok) {
        return await anwser.json() as Promise<Player[]>;
    }

    if (anwser.status === 404) {
        return "Player not found";
    }

    Logs.log("Failed to get players: " + anwser.statusText);
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


export async function updatePlayersDiscordId(id: number , input: PlayerPutDto): Promise<Player | string> {

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
            return await response.json() as Player;
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

export async function getLeaderboard(eloType:string): Promise<PlayerRank[] | string> {

    const url = process.env.API_URL + "/players/rank?pageNumber=1&pageSize=10&eloType=" + eloType;

    try {
        const response = await fetch(url);

        if (response.ok) {
            return await response.json() as PlayerRank[];
        }

        const errorMessage: apiErrorMessage = await response.json();

        Logs.error("Failed to get leaderboard: " + errorMessage.message);
        return "Failed to get leaderboard";
    } catch (e) {
        Logs.error('Error while getting leaderboard: ' + e);
        return 'Failed to get leaderboard';
    }
}

export async function getPlayerRank(playerId:string, eloType: string): Promise<PlayerRank[] | string> {

    const url = process.env.API_URL + "/players/rank/" + playerId + "?eloType=" + eloType;

    try {
        const response = await fetch(url);

        if (response.ok) {
            return await response.json() as PlayerRank[];
        }

        if(response.status === 404) {
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

    try{
        const response = await fetch(url);

        if(response.ok){
            return await response.json() as PlayerAliases;
        }

        if(response.status === 404){
            return "Player not found";
        }

        return "Failed to get player aliases";
    }
    catch (e){
        Logs.error('Error while getting player aliases: ' + e);
        return 'Failed to get player aliases';
    }


}
















