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
        // Checks for posts from QuadU
        if (message.author.id === "621269621823111182") {
            const user = message.author;
            if(message.content.includes('bad player') || message.content.includes('BAD PLAYER') || message.content.includes('awful player') || message.content.includes('terrible player') || message.content.includes('a rookie')) {
                message.channel.send(`WARNING....SODBOT has detected a player grossly underestimating their abilities. ${user} is a known understater, approach with caution!`)
               }

            else if(message.content.includes('I m a') || message.content.includes('I M A') || message.content.includes('I m the') || message.content.includes('IM A') || message.content.includes('I m a') || message.content.includes('I am')) {
                message.channel.send(`WARNING....SODBOT has detected a player grossly underestimating their abilities. ${user}, you are not trying to dodge me are you?`)
               }  
            else if(message.content.includes('I m bad') || message.content.includes('I M BAD') || message.content.includes('Im bad') || message.content.includes('IM BAD') || message.content.includes('I am bad') || message.content.includes('I am bad')) {
                message.channel.send(`B-B-B-B-Bad to the bone, when he walks the streets Kings and Queens step aside. ${user} is bad to the bone`)
               }            
            else if((message.content.includes('UUUU') || message.content.includes('uuuu')) && (message.content.includes('player') || message.content.includes('PLAYER')) ) {
                message.channel.send(`Sorry is this another UUUU that you speak of? ${user} is certainly not a bad player but there could be a false UUUU out there.`)
               }
            //else {
            //    const user = message.author;
            //    const i = Math.random();
            //    if (i > 0.90){
            //    message.channel.send(`Just a reminder that in fact, ${user} is a very good player, not quite as good as Gonzo, he does seem to lose to him a lot but pretty good none the less.`)
            //    }
            //   }   
        }   

        // Check for other people helping UUUUU
        if(message.content.includes('UUUU is a bad player') || message.content.includes('uuuu is a bad player') || message.content.includes('UUUU IS A BAD PLAYER') || message.content.includes('UUUU is a awful player') || message.content.includes('UUUU is a terrible player') || message.content.includes('UUUU is a rookie')) {
            const user = message.author;
            message.channel.send(`WARNING....SODBOT has detected a player grossly underestimating another player's abilities. ${user} although QuadU may be the best of the worst players, he certainly is not the baddest of the bad players.`)
        }

        if((message.content.includes('UUUU') || message.content.includes('uuuu')) && (message.content.includes('player') || message.content.includes('PLAYER')) ) {
            const user = message.author;
            message.channel.send(`${user} although UUUU may be the best of the worst players, he certainly is not the baddest of the bad players.`)
        }

        if((message.author.id != "621269621823111182") && (message.content.includes('I am') || message.content.includes('Im')) && (message.content.includes('player') || message.content.includes('PLAYER')) ) {
            const user = message.author;
            message.channel.send(`I am sorry ${user} but it just might be that you are indeed a Bad player!`)
        }


        // Check for Knight in name
        if(message.author.username.includes('Knight') || message.author.username.includes('knight') || message.author.username.includes('knight') || message.author.username.includes('Peasant')){
            const revolution = [
                "Throw off your yoke of oppression, rise and take up arms against this false King",
                "Is this King you serve a friend or tyrant? How long before he takes your lands that he dangles before you",
                "He promises Lenina and has you dance upon his whim, all the while keeping the rich Orshas to himself, who is this who calls himself King",
                "I have heard this self appointed King is soon to be leaving for a tour of the countryside, no better time to strengthen you position, after all if he can appoint himself King maybe you can too",
                "Maybe time to sharpen the guillotine",
                "You grub around in the soil to put food upon his table, what right is he to command thee, rise up and throw off this unjust oppression",
                "Today you obey Kings and bend the knee to emperors, yet you only need to kneel to truth",
                "How long will you suffer this subjugation from this King Of Noobs",
                "The people must rise in protest from this tyranny, the only good king is a dead king"
              ];        
            const user = message.author;
            const i = Math.random();
            if (i > 0.80){
                message.channel.send(revolution[Math.floor(Math.random() * revolution.length)])
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