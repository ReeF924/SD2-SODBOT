import { Logs } from "./logs";
import * as fs from 'fs';
import * as Levenshtein from  'levenshtein';
import {DB, DiscordServer} from "./db";
import { DiscordBot } from "./discordBot";
import { Message } from "discord.js";

export class CommonUtil {

    static configData:Map<string,unknown> = new Map<string,unknown>();
    static database: DB;
    static async getPrimaryGame(message:Message):Promise<string>{
        const serverId = message.guild.id;
        let server:DiscordServer = await CommonUtil.database.getFromRedis(serverId);
        
        if(server.oppositeChannelIds.some(channelId => channelId === message.channel.id)){
            if(server.primaryMode === "sd2") return "warno";
            return "sd2";
        }
        return server.primaryMode;
    }
    static init(database:DB):void{
        CommonUtil.database = database;
        //load config file;
        const load = JSON.parse(fs.readFileSync("config.json",{encoding:"utf8"}));
        for(const key of Object.keys(load)){
            this.configData[key.toLocaleLowerCase()] = load[key];
        }
        //this.configData = JSON.parse(fs.readFileSync("config.json",{encoding:"utf8"}));
        Logs.init();
    }

    static configBoolean(key:string,defaultSetting = false):boolean {
        key = key.toLocaleLowerCase();
        if(this.configData[key]) 
            return Boolean(this.configData[key]);
        return defaultSetting;
    }

    static config(key:string, defaultSetting = ''):string {
        key = key.toLocaleLowerCase();
        if(this.configData[key]) 
            return String(this.configData[key]);
        return defaultSetting;
    }

    static formatDate(date: Date) {
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        let month = '' + months[date.getMonth()]
        let day = '' + date.getDate()
        let year = date.getFullYear()

        if (day.length < 2) 
            day = '0' + day;
    
        return [day, month, year].join('-');
    }

    static lexicalGuesser = (input:string, obj:string[]):string => {
        let closestWord = "";
        let closestNumber = 9999999;
      
        obj.forEach(i => {
          const x = new Levenshtein(input,i);
          if (x.distance < closestNumber) {
            closestNumber = x.distance;
            closestWord = i;
          }
        });
        return closestWord;
    };

}