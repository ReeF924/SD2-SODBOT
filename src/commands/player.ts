import { Message } from "discord.js";
import { DiscordBot, MsgHelper } from "../general/discordBot";
import { MessageEmbed } from "discord.js";
import { SqlHelper } from "../general/sqlHelper";
import { RatingEngine } from "../results/rating";
import { misc } from "sd2-data";
import { Logs } from "../general/logs";

export class PlayerCommand {
    
    static async getPlayer(message:Message,input:string[]){
        const embed = new MessageEmbed();
        var player:string;
        //Determine the target player
        if(input.length == 0){
            player = message.author.id
        }else if(input.length == 1){
            player = input[0].slice(3,-1) //this is magic.
        }else{
            MsgHelper.reply(message,`This command can only query 1 player at a time`)
            return;
        }
        const Elos = await SqlHelper.getDiscordElos(player,message.channel.id,message.guild.id);
             
        if(Elos == null ){
            if(input.length == 0)
                MsgHelper.reply(message,`You are not currently registered to the bot, please use $register "EugenId" to register to the bot`)
            else
                MsgHelper.reply(message,`That player is not currently registered to the bot, the player needs to use $register "EugenId" to register to the bot`)
            return
        }
        
        embed.setTitle("Player Details")
        embed.setColor("75D1EA")
        embed.addFields([
            {name:"Player Name", value: "<@!"+player+">",inline:false},
            //{name:"Eugen Id", value: eugenId,inline:false}, --we don't really want people messing with this/registering as others. Yes I know you can find it via replays.
            {name:"Server Rating", value: Elos.serverElo,inline:true},
            {name:"Channel Rating", value: Elos.channelElo,inline:true},
            {name:"Global Elo", value: Elos.globalElo,inline:true},
            {name:"\u200b", value: "\u200b",inline:true}
        ]);
        // Extract recent games
        //thou shall not use exec.
        const xx = await SqlHelper.getReplaysByEugenId(Elos.eugenId)
        let opponent = "";
        let gameMap = "";
        let gameResult = "";
        let numGames = 0;
        //Check that rows were returned
        if(xx.rows.length > 0 ){  
            if(xx.rows.length > 5){
                numGames = 5;
            } else {
                numGames = xx.rows.length;
            } 
            for (let i = 0; i < numGames; i++) {        
                const x = xx.rows[i];
                try{
                    const replayString = x.replay.value as string;
                    const replayJson = JSON.parse(replayString);

                    console.log(replayJson.players.length)

                //Check that each row is a 1v1 match    
                if (replayJson.players.length == 2){
                    //identify who the opponent was
                    if (replayJson.players[0].id != Elos.eugenId){
                        opponent += replayJson.players[0].name + "\n";
                    }else{
                        opponent += replayJson.players[1].name + "\n";
                    }
                    //Identify the map played
                    gameMap += misc.map[replayJson.map_raw] + "\n";
                    //Identify the result 
                    if (replayJson.result.victory > 3) {
                        for (const player of replayJson.players) {
                            if (replayJson.ingamePlayerId = player.alliance)
                                if (player.name = Elos.eugenId)
                                    gameResult += "Victory" + "\n"
                                    else
                                    gameResult += "Defeat" + "\n" 
                        }  
                    } else if (replayJson.result.victory < 3) {
                        for (const player of replayJson.players) {
                            if (replayJson.ingamePlayerId = player.alliance)
                                if (player.name = Elos.eugenId)
                                    gameResult += "Defeat" + "\n"
                                    else
                                    gameResult += "Victory" + "\n"
                                
                        }  
                    } else {
                           gameResult += "Draw" + "\n"
                    }
                }
                }catch(err){
                    console.log("Error happended here")
                    console.error(err)
                }
            }
            //Complete embed by adding recent matches
            embed.addFields([
                {name:"Most Recent 1v1 Games Uploaded To The Bot", value:"-----------------------------------------------------", inline:false},
                {name:"Opponent", value: opponent,inline:true},
                {name:"Map", value: gameMap, inline:true},
                {name:"Result", value: gameResult,inline:true}
            ])
        }
        else {
            console.log("No Games found")
        }
        //Send Final Embed
       MsgHelper.say(message,embed,false)
    }

    private static pad(num:number):string {
        return String(Math.fround(num)).padEnd(7);
    }

    static async getLadder(message:Message, input:string[]){
        const ladder = await SqlHelper.getGlobalLadder();
       
        const embed = new MessageEmbed();
        embed.setTitle("Top 10 Players")
        embed.setColor("75D1EA")
        let x = 0;
        while(x < 10 && x < ladder.length){
            if(ladder[x].discordId)
                embed.addField("\u200b", PlayerCommand.pad(ladder[x].elo) + ": <@!" + ladder[x].discordId + ">",false)
            else
                embed.addField("\u200b", PlayerCommand.pad(ladder[x].elo) + ": " + ladder[x].name,false)
        }
        //Send Final Embed
        embed.setDescription("For full global leaderboard please goto http://eugenplz.com")
        MsgHelper.say(message,embed,false)
    }

        //Register a player to the bot
        static register(message:Message, input:string[]):void{
            if(input.length == 1 && Number(input[0])){
                (async () => {
                    let user = await SqlHelper.getDiscordUserFromEugenId(Number(input[0]))
                    if(user){
                        if(user.id = message.author.id){
                            MsgHelper.reply(message,"you are already registered to Eugen account " + input[0])
                            Logs.log("Eugen account "+ input[0] + "is already registered to user " + user.id )
                        }else{
                            user.id =(message.author.id)
                            await SqlHelper.setDiscordUser(user);
                            MsgHelper.reply(message,"Eugen account " + input[0] + " has been updated to your discord userid")
                            Logs.log("Changed eugen account "+ input[0] + " to user " + user.id )
                        }
                    }else{
                        console.log(Number(message.author.id))
                        user = {
                            id: (message.author.id),
                            playerId: Number(input[0]),
                            serverAdmin: [],
                            globalAdmin: false,
                            impliedName: message.author.username
                        }
                        await SqlHelper.setDiscordUser(user);
                        MsgHelper.reply(message,"Eugen account " + input[0] + " has been added to the Player Database and connected to your Discord userid")
                        Logs.log("Added eugen account "+ input[0] + " to user " + user.id )
                    }
                })()
            }
        }
}

export class PlayerCommandHelper {
    static addCommands(bot:DiscordBot):void{
        bot.registerCommand("player",PlayerCommand.getPlayer);
        bot.registerCommand("ladder",PlayerCommand.getLadder);
        bot.registerCommand("register",PlayerCommand.register)
    }
}