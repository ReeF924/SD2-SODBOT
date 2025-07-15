import { dbChannel, dbGuildPostDto } from "../models/admin";
import { Logs } from "../../general/logs";

export interface apiErrorMessage {
    message: string;
}
export async function getChannel(id: string): Promise<dbChannel | string> {


    const url = process.env.API_URL + "/guilds/channels/" + id;

    const response = await fetch(url);


    if (response.ok) {
        const ret = await response.json();
        return ret.channel;
    }
    if (response.status === 404) {
        const resMess: apiErrorMessage = await response.json();
        return resMess.message;
    }

    Logs.error("Error getting channel: " + response.statusText);
    return "Error when getting channel";
}


export async function postChannel(guild: dbGuildPostDto): Promise<dbChannel | string> {

    // const url = "http://localhost:5278/guilds/channels";
    const url = process.env.API_URL + "/guilds/channels";

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(guild)
    });

    const obj = await response.json();

    if (response.ok) {
        return obj.channel;
    }

    return "Error posting channel: " + response.statusText;
}
