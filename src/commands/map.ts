import { Message } from "discord.js";
import { DiscordBot, MsgHelper } from "../general/discordBot";
import * as Data from "sd2-data"
import { CommonUtil } from "../general/common";
import { Logs } from "../general/logs";
import { MessageEmbed } from "discord.js";

export class MapCommand {
    static bans:Map<string,Map<string,boolean>> = new Map<string,Map<string,boolean>>() ; // 2d array of playerIds to banned divisions.

    // Returns a random map  can be League, 1v1, 2v2, 3v3, 4v4
    static randomMap(message:Message,input:string[]):void {
        
        let maplist:string[] = []
        const importedMapData = Data.maps;
        Logs.log("command Random Map with Inputs "+JSON.stringify(input));
        if(input.length == 0){
            maplist = importedMapData.mapData.sd2League;
        }else{
            const size = input[0].toLowerCase();
            switch(size) {
                case "1v1": maplist = importedMapData.mapData.byPlayerSize[2]; break;
                case "2v2": maplist = importedMapData.mapData.byPlayerSize[4]; break;
                case "3v3": maplist = importedMapData.mapData.byPlayerSize[6]; break;
                case "4v4": maplist = importedMapData.mapData.byPlayerSize[8]; break;
                default: MsgHelper.reply(message, size + " is not a valid map size. for example, 1v1.");
                return
            }
        }
        //check for bans
        if(MapCommand.bans[message.member.id]){
            for (const key of Object.keys(MapCommand.bans[message.member.id])){
                maplist = maplist.filter((x)=>{
                    return x != key;
                })
            }
        }
        if(maplist.length == 0)
            MsgHelper.reply(message,"all maps have been banned. Please unban some maps");
        else{
            const pick = maplist[Math.floor(Math.random()*maplist.length)]
            Logs.log(message.author.id + " has picked " + pick + " from "+ JSON.stringify(maplist) + " side: " + input );
            message.reply(pick, { files: ["./src/general/images/"+pick+".png"] });
        
        }
        
            
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static allMaps(message:Message,input:string[]):void {
        const importedMapData = Data.maps;
        console.log(JSON.stringify(importedMapData));
        const bannedMaps = MapCommand.bans[message.author.id];
        //Set up discord embed
        let embed = new MessageEmbed().setTitle(message.author.username + '\'s Maps')
        let text1v1 = "";
        let text2v2 = "";
        let text3v3 = "";
        let text4v4 = "";
        for (let i = 0; i < importedMapData.mapData.byPlayerSize[2].length; i++) {
            let maps1 = importedMapData.mapData.byPlayerSize[2][i];
            let maps2 = importedMapData.mapData.byPlayerSize[4][i];
            let maps3 = importedMapData.mapData.byPlayerSize[6][i];
            let maps4 = importedMapData.mapData.byPlayerSize[8][i];
        
            if (!maps1) {
              maps1 = "";
            }else if(bannedMaps && bannedMaps[maps1]){
                maps1 = '~~'+maps1+'~~';
            }
            if (!maps2) {
              maps2 = "";
            }else if(bannedMaps && bannedMaps[maps2]){
                maps2 = '~~'+maps2+'~~';
            }
            if (!maps3) {
              maps3 = "";
            }else if(bannedMaps && bannedMaps[maps3]){
                maps3 = '~~'+maps3+'~~';
            }
            if (!maps4) {
              maps4 = "";
            }else if(bannedMaps && bannedMaps[maps4]){
                maps4 = '~~'+maps4+'~~';
            }
            text1v1 += maps1 + "\n";
            text2v2 += maps2 + "\n";
            text3v3 += maps3 + "\n";
            text4v4 += maps4 + "\n";
        }
        embed = embed.addFields(
            {name:"1v1", value: text1v1,inline:true},
            {name:"2v2", value: text2v2,inline:true},
            {name:"3v3", value: text3v3,inline:true},
            {name:"4v4", value: text4v4,inline:true}
        )
        embed = embed.setFooter("Maps are stike-through'd when banned")
        message.channel.send(embed);
    }


    static unbanMap(message:Message,input:string[]):void{
        if(input.length == 0 ) {
            MsgHelper.reply(message,`I don't know what that map is, please use ${CommonUtil.config("prefix")}maps, to get the list of all maps.`)
            return;
        }
        if(input[0].toLocaleLowerCase() == "all")
        {
            MapCommand.bans[message.author.id] = null;
            Logs.log(message.author.id + " has unbanned all maps" );
            MsgHelper.reply(message,'unbanned all maps');
            return;     
        }
        for(const line of input){
            const mapPool = Data.maps.allMapNames;
            const target = mapPool.filter((x)=>{
                return 0 == line.toLocaleLowerCase().localeCompare(x.toLocaleLowerCase());
            })
            if(target.length == 0){
                MsgHelper.say(
                    message,
                    `I don't know what map that is, did you mean ***${
                    CommonUtil.lexicalGuesser(line,mapPool)
                    }*** instead of ***${line}***... It has not been unbanned.`
                  );
                return;
            }else{
                MapCommand.bans[message.author.id][target[0]]=null;
                Logs.log(message.author.id + " has unbanned " + JSON.stringify(target[0]) )
                MsgHelper.reply(message,line + " has been unbanned.")
                let all = false;
                for(const z of Object.values(MapCommand.bans[message.author.id])){
                    console.log(z);
                    all = !!z || all;
                }
                if(!all) MapCommand.bans[message.author.id] = null;
            }
        }
    }

    static banMap(message:Message,input:string[]):void{
        if(input.length == 0) {
            MsgHelper.reply(message,`Please specify a map to ban. Use ${CommonUtil.config("prefix")}maps, to get the list of all maps.`)
            return;
        }
        for(const line of input){
            const targetMaps = Data.maps.allMapNames;
            const target = targetMaps.filter((x)=>{
                return 0 == line.toLocaleLowerCase().localeCompare(x.toLocaleLowerCase());
            })
            if(target.length == 0){
                MsgHelper.say(
                    message,
                    `I don't know what map that is, did you mean ***${
                    CommonUtil.lexicalGuesser(line,targetMaps)
                    }*** instead of ***${line}***... It has not been banned.` 
                  );
                return;
            }else{
                if(!MapCommand.bans[message.author.id]){
                    MapCommand.bans[message.author.id] = new Map();
                }
                MapCommand.bans[message.author.id][target[0]]=true;
                Logs.log(message.author.id + " has banned " + JSON.stringify(target[0]) )
                MsgHelper.reply(message,line + " has been banned.")
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static unbanMapAll(message:Message,input:string[]):void{
        MapCommand.unbanMap(message,["all"]);
    }
}
export class MapCommandHelper {
    static addCommands(bot:DiscordBot):void{
        bot.registerCommand("rmap",MapCommand.randomMap);
        bot.registerCommand("maps",MapCommand.allMaps);
        bot.registerCommand("unbanmap",MapCommand.unbanMap);
        bot.registerCommand("resetmaps",MapCommand.unbanMapAll);
        bot.registerCommand("banmap",MapCommand.banMap);
        //bot.registerCommand("defaultMapPool",MapCommand.defaultMapPool); @todo
    }
}