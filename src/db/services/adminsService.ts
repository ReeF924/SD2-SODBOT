import {dbGuild, dbChannel, dbGuildPostDto, dbChannelPostDto} from "../models/admin";
import {apiErrorMessage} from "../db";

export async function getChannel(id:string ):Promise<dbChannel | string>{


    const url = process.env.API_URL + "/guilds/channels/" + id;

    const response = await fetch(url);

    
    if (response.ok){
        return await response.json();
    }
    if(response.status === 404){
        const resMess:apiErrorMessage = await response.json();
        return resMess.message;
    }

    console.log("Error getting channel: " + response.statusText);
    return "Error when getting channel";
}


export async function postChannel(guild: dbGuildPostDto):Promise<dbChannel | string>{

    // const url = "http://localhost:5278/guilds/channels";
    const url = process.env.API_URL + "/guilds/channels";

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(guild)
    });

    const channel: dbChannel = await response.json();

    if (response.ok){
        return channel;
    }

    return "Error posting channel: " + response.statusText;
}
