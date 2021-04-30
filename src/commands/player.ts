import { Message, User } from "discord.js";
import { DiscordBot, MsgHelper } from "../general/discordBot";
import { MessageEmbed } from "discord.js";
import { SqlHelper } from "../general/sqlHelper";
import { RatingEngine } from "../results/rating";
import { misc } from "sd2-data";
import { Logs } from "../general/logs";
import e = require("express");

export class PlayerCommand {
    
    static async getPlayer(message:Message,input:string[]){
        const embed = new MessageEmbed();
        var player:string;
        var icon:string
        //Determine the target player
        if(input.length == 0){
            player = message.author.id
            icon = message.author.displayAvatarURL()
        }else if(input.length == 1){
            player = input[0].slice(3,-1) //this is magic.
            let usr = message.mentions.users.first();
            icon = usr.displayAvatarURL()
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
        embed.addField("Player Name", "<@!"+player+">",false)
        embed.setThumbnail(icon)
          
        // 
        //This code needs to be re-written once we have the blacklist tables up and working 
        //
        let blackListServer = "false"
        let blackListChannel = "false"   
        if (blackListChannel == "true"){            
            embed.addField("Elo Rating", Math.round(Elos.channelElo),true)
            embed.setFooter("Note: This Elo rating is specific for this channel")
        } else if (blackListServer == "true"){
            embed.addField("Elo Rating", Math.round(Elos.serverElo),true)
            embed.setFooter("Note: This Elo rating is specific for the " + message.guild.name + " server")
        } else {
            embed.addField("Elo Rating", Math.round(Elos.globalElo),true)
            embed.setFooter("Note: This Elo rating is a global rating and takes into account all approved uploaded matches")

            embed.addField("\u200b", "\u200b",true)
        }
        
        
        // Extract recent games
        //thou shall not use exec.
        /*
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
        */
       MsgHelper.say(message,embed,false)
    }

    private static pad(num:number):string {
        var rounded = Math.round(num*10)/10
        var fixed = rounded.toFixed(1)
        return fixed.padEnd(7);
    }

    static async getLadder(message:Message, input:string[]){
        const ladder = await SqlHelper.getGlobalLadder();
       
        const embed = new MessageEmbed();
        embed.setTitle("Top 50 Players")
        embed.setColor("75D1EA")
        var playerDetails = ""
        var yearAgoTime = new Date()
        yearAgoTime.setFullYear(yearAgoTime.getFullYear()-1)
        let x = 0;
        while(x < 50 && x < ladder.length){
            if (yearAgoTime < ladder[x].lastActive){
                if(ladder[x].discordId != "null"){
                    playerDetails += ladder[x].rank + ":    \u2003" + PlayerCommand.pad(ladder[x].elo) + "\u2003<@!" + ladder[x].discordId + "> \n"

                }else{
                    playerDetails += ladder[x].rank + ":    \u2003" + PlayerCommand.pad(ladder[x].elo) + "\u2003 " + ladder[x].name + "\n"
                }
            }
            x++;
        }
        embed.addField("Pos      Elo           Name", playerDetails, true)
        //Send Final Embed
        embed.setDescription("For full global leaderboard please goto http://eugenplz.com")
        embed.setFooter("Only those players who have been involved in a submitted match in the last year will appear in the ladder")
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