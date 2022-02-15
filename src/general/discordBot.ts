`use strict`

import { CommonUtil } from "./common";
import {APIMessageContentResolvable, Client, Message, MessageEmbed} from "discord.js";
import { Logs } from "./logs";
import { Replays } from "../results/replays";
import { Permissions, PermissionsSet } from "./permissions"


export type BotCommand = (message:Message,input:string[],perm?:PermissionsSet)=>void;

export class DiscordBot {

    static bot:Client;
    commands:Map<string,BotCommand> = new Map<string,BotCommand>();
    

    constructor(){
        //this.loadBlacklist();
        DiscordBot.bot = new Client();
        DiscordBot.bot.on("message", this.onMessage.bind(this));
        DiscordBot.bot.on("ready",this.onReady.bind(this));
        DiscordBot.bot.on("error",this.onError.bind(this));
        DiscordBot.bot.on('unhandledRejection',this.onError.bind(this));
    }

    login():void{
        DiscordBot.bot.login(CommonUtil.config("discordToken"));
    }

    registerCommand(command:string, funct:BotCommand):void{

        this.commands[command] = funct;
    }

    removeCommand(command:string):void{
        this.commands.delete(command);
    }

    private onError(message:unknown){
        Logs.error(message)
    }

    private runCommand(message:Message,command:string,perms:PermissionsSet){
        let input:string[] = [];
        const ii = message.content.indexOf(" ");
        if(ii>0){
            const i = message.content.substr(ii + 1);
            input = i.split(/,/);
            for (const index in input) {
            input[index] = input[index]
                //.replace(/&/g, "&amp;")
                //.replace(/"/g, "&quot;") //why we do this?
                .trim();
            }
        }
        if(this.commands[command]){
            this.commands[command](message,input,perms);
        }else{
            MsgHelper.reply(message, "Unknown Command. Did you mean " +CommonUtil.config("prefix") + CommonUtil.lexicalGuesser(command,Object.keys(this.commands)))
        }
    }

    private async onMessage(message:Message){
        let channel, guild
        if(message.channel) channel = message.channel.id;
        if(message.guild) guild = message.guild.id;
        if (message.content.startsWith(CommonUtil.config("prefix"))) {
            const perms = Permissions.getPermissions(channel,guild)
            if(!(await perms).areCommandsBlocked){
                const inputList = message.content
                .substr(1, message.content.length)
                .toLowerCase()
                .replace(/\n/g, " ")
                .split(" ");
                const command = inputList[0];
        
                if (message.channel.type === "dm") {
                    return;
                }
                this.runCommand(message, command,(await perms));
            }
        }
    
        if (message.attachments.first()) {
            const perms = Permissions.getPermissions(channel,guild)
            if(!(await perms).areReplaysBlocked){
                if (message.attachments.first().url.endsWith(".rpl3")) {
                    if (message.channel.type !== "dm") {
                        Replays.extractReplayInfo(message,(await perms));
                    }
                }
            }
        }

        // Check for certain message from certain players
        // Checks for posts from Roguish Tiger
        if (message.author.id === "687898043005272096") {
            const user = message.author;
            if(message.content.includes('bad player' || 'a rookie')) {
                message.channel.send(`WARNING....SODBOT has detected a player grossly underestimating their abilities. ${user} is a know understater, approach with caution.`)
               }
            
        }



    }

    private async onReady(){
        Logs.log("Bot Online!");
        DiscordBot.bot.user.setActivity("Use " + CommonUtil.config("prefix") + "help to see commands!", {
          type: "LISTENING"
        });
    }
}

export class MsgHelper{
    
    static reply (message:Message, content:APIMessageContentResolvable|MessageEmbed, mentions=true):void{
        const opts = {};
        //if(!mentions){
        //    opts["allowed_mentions"] = true;
        //}
        message.reply(content);
    }

    static say (message:Message, content:APIMessageContentResolvable|MessageEmbed,  mentions=true):void{
        const opts = {};
        if(!mentions){
            opts["allowed_mentions"] = "{parse:[]}";
        }
        if(typeof content as any  != String){
            opts["embed"] = "rich";
        }
        Logs.log(content);
        message.channel.send(content);
    }

    static dmUser(message:Message, content:APIMessageContentResolvable|MessageEmbed):void{
        message.author.send(content);
    }

}