`use strict`

import { CommonUtil } from "./common";
import {APIMessageContentResolvable, Client, Message} from "discord.js";
import { SqlHelper } from "./sqlHelper";
import { Logs } from "./logs";
import { Replays } from "../results/replays";
import { strict } from "node:assert";


export type BotCommand = (message:Message,input:string[])=>void;

export class DiscordBot {

    bot:Client;
    commands:Map<string,BotCommand> = new Map<string,BotCommand>();
    

    constructor(){
        //this.loadBlacklist();
        this.bot = new Client();
        this.bot.on("message", this.onMessage.bind(this));
        this.bot.on("ready",this.onReady.bind(this));
        this.bot.on("error",this.onError.bind(this));
    }

    login():void{
        this.bot.login(CommonUtil.config("discordToken"));
    }

    registerCommand(command:string, funct:BotCommand){

        this.commands[command] = funct;
    }

    removeCommand(command:string){
        this.commands.delete(command);
    }

    private onError(message:any){
        Logs.error(message)
    }

    private runCommand(message:Message,command:string){
        let input:string[] = [];
        let ii = message.content.indexOf(" ");
        if(ii>0){
            let i = message.content.substr(ii + 1);
            input = i.split(/,/);
            for (let index in input) {
            input[index] = input[index]
                //.replace(/&/g, "&amp;")
                //.replace(/"/g, "&quot;") //why we do this?
                .trim();
            }
        }
        if(this.commands[command]){
            this.commands[command](message,input);
        }
    }

    private async onMessage(message:Message){
        if (message.content.startsWith(CommonUtil.config("prefix"))) {
            const inputList = message.content
            .substr(1, message.content.length)
            .toLowerCase()
            .replace(/\n/g, " ")
            .split(" ");
            const command = inputList[0];
    
            if (message.channel.type === "dm") {
                return;
            }
            this.runCommand(message, command);
        }
    
        if (message.attachments.first()) {
            if (message.attachments.first().url.endsWith(".rpl3")) {
            if (message.channel.type !== "dm") {
                Replays.extractReplayInfo(message);
            }
            }
        }
    }

    private async onReady(){
        Logs.log("Bot Online!");
        this.bot.user.setActivity("Use " + CommonUtil.config("prefix") + "help to see commands!", {
          type: "LISTENING"
        });
    }
}

export class MsgHelper{
    
    static reply (message:Message, content:APIMessageContentResolvable, tts?:any){
        let opts = {};
        if(CommonUtil.configBoolean("tts_enabled_global")){
            opts["tts"] = tts;
        }
        message.reply(content, opts);
    }

    static say (message:Message, content:APIMessageContentResolvable, tts?:any){
        let opts = {};
        if(CommonUtil.configBoolean("tts_enabled_global")){
            opts["tts"] = tts;
        }
        message.channel.send(content, opts);
    }

    static dmUser(message:Message, content:APIMessageContentResolvable){
        message.author.send(content);
    }

}