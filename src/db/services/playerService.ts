import {player, playerPutDto} from "../models/player";
import {apiErrorMessage} from '../db';
import axios from 'axios';


export async function getPlayer(id: number): Promise<player | string> {

    const url = process.env.API_URL + "/players/" + id;

    const response = await fetch(url);

    if (response.ok) {
        return await response.json();
    }

    if (response.status === 404) {
        return "Player not found";
    }

    console.log("Error getting player: " + response.statusText);
    return "Error when getting player";
}

export async function getPlayersByIds(ids: number[]): Promise<player[] | string> {

    let url = process.env.API_URL + "/players/getPlayersByIds";

    const params = new URLSearchParams();

    ids.forEach(id => params.append('ids', id.toString()));

    url += '?' + params.toString();


    const response = fetch(url);
    response.catch(e => console.log('Error while getting player by ids', e));

    const anwser = await response;

    if (anwser.ok) {
        return await anwser.json() as Promise<player[]>;
    }

    if (anwser.status === 404) {
        return "Player not found";
    }

    console.log("Failed to get players: " + anwser.statusText);
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


export async function updatePlayersDiscordId(id: number, input: playerPutDto): Promise<player | string> {

    const url = process.env.API_URL + "/players/" + id;

    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(input)
        });
        if (response.ok) {
            return await response.json() as player;
        }
        if (response.status === 400) {
            const errorMessage: apiErrorMessage = await response.json();
            return errorMessage.message;
        }

        if (response.status === 409) {
            const errorMessage: apiErrorMessage = await response.json();
            return errorMessage.message;
        }

        console.log("Bad response while uploading player: ", response.statusText);
        return 'Failed to upload player';

    } catch (e) {
        console.log('Error while uploading player', e);
        return 'Failed to upload player';
    }


}
