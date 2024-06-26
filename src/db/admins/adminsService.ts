import {dbGuild, dbChannel, dbGuildPostDto, dbChannelPostDto} from "./adminsModels";

export async function getChannel(id:number ):Promise<dbChannel | null>{


    const url = process.env.API_URL + "/guilds/channels/" + id;

    const response = await fetch(url);

    if (response.ok){
        return await response.json();
    }
    if(response.status === 404){
        return null;
    }

    console.log("Error getting channel: " + response.statusText);
    return null;
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
