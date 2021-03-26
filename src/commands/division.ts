import { Message } from "discord.js";
import { DiscordBot, MsgHelper } from "../general/discordBot";
import divisions, { divisionsAllies, divisionsAxis} from "sd2-data/divisions";
import type { DivisionStruct } from "sd2-data/types/index";
import { AsciiTable3 } from "ascii-table3/ascii-table3";
import { CommonUtil } from "../general/common";
import { Logs } from "../general/logs";

export class DivisionCommand {
    static bans:Map<string,Map<string,boolean>> = new Map<string,Map<string,boolean>>() ; // 2d array of playerIds to banned divisions.

    static randomDiv(message:Message,input:string[]):void {
        
        var divs:DivisionStruct[];
        Logs.log("command Random Division with Inputs "+JSON.stringify(input));
        if(input.length == 0){
            divs = [...divisionsAllies, ...divisionsAxis];
        }else{
            const side = input[0].toLowerCase();
            if (side !== "axis" && side !== "allies") {
                MsgHelper.reply(message, "Unknown side, please specify 'axis' or 'allies' as a side if you want to pick a side.");
                return;
            }
            if(side == "allies") divs = divisionsAllies;
            if(side == "axis") divs = divisionsAxis;
        }
        //check for bans
        if(DivisionCommand.bans[message.member.id]){
            for (let key of Object.keys(DivisionCommand.bans[message.member.id])){
                divs = divs.filter((x)=>{
                    return x.id != key;
                })
            }
        }
        if(divs.length == 0)
            MsgHelper.reply(message,"all divisions have been banned. Please unban some divisions");
        else{
            let pick = divs[Math.floor(Math.random()*divs.length)].name
            Logs.log(message.author.id + " has picked " + pick + " from "+ JSON.stringify(divs) + " side: " + input );
            MsgHelper.reply(message,pick);
        }
            
    }
    static allDivs(message:Message,input:string[]):void {
        const table = new AsciiTable3("Divisions");
        table.setHeading("Allies","Axis");
        for(var i = 0; i < divisionsAllies.length; i++){
            var axis = "";
            var allied = "";
            if(divisionsAllies[i]) allied = divisionsAllies[i].name;
            if(divisionsAxis[i]) axis = divisionsAxis[i].name; 
            table.addRow(allied, axis);
            ;
        }
        table.setStyle("compact");
        Logs.log(table.toString());
        MsgHelper.say(message,"``" + table.toString() + "``");
    }
    static unbanDivision(message:Message,input:string[]):void{
        if(input.length == 0) {
            MsgHelper.reply(message,`I don't know what that division is, please use ${CommonUtil.config("prefix")}alldivs, to get the list of divisions.`)
            return;
        }
        if(input[0].toLocaleLowerCase() == "all")
        {
            DivisionCommand.bans[message.author.id] = null;
            Logs.log(message.author.id + " has unbanned all" );
            MsgHelper.reply(message,'unbanned all divisions');
            return;     
        }
        for(let line of input){
            let divs = [...divisionsAllies, ...divisionsAxis];
            let target = divs.filter((x)=>{
                return 0 == line.toLocaleLowerCase().localeCompare(x.name.toLocaleLowerCase());
            })
            if(target.length == 0){
                MsgHelper.say(
                    message,
                    `I don't know what that division is, did you mean ***${
                    CommonUtil.lexicalGuesser(line,divs.map(x=>{return x["name"]}))
                    }*** instead of ***${line}***... It has not been unbanned.`
                  );
                return;
            }else{
                DivisionCommand.bans[message.author.id][target[0].id]=null;
                Logs.log(message.author.id + " has unbanned " + JSON.stringify(target[0]) )
                MsgHelper.reply(message,line + " has been unbanned.")
                let all = false;
                for(let z of DivisionCommand.bans[message.author.id]){
                    all = z || all;
                }
                console.log(all);
                if(!all) DivisionCommand.bans[message.author.id] = null;
            }
        }
    }

    static banDivision(message:Message,input:string[]):void{
        if(input.length == 0) {
            MsgHelper.reply(message,`Please specify a division to ban. Use ${CommonUtil.config("prefix")}alldivs, to get the list of divisions.`)
            return;
        }
        for(let line of input){
            let divs = [...divisionsAllies, ...divisionsAxis];
            let target = divs.filter((x)=>{
                return 0 == line.toLocaleLowerCase().localeCompare(x.name.toLocaleLowerCase());
            })
            if(target.length == 0){
                MsgHelper.say(
                    message,
                    `I don't know what that division is, did you mean ***${
                    CommonUtil.lexicalGuesser(line,divs.map(x=>{return x["name"]}))
                    }*** instead of ***${line}***... It has not been banned.` 
                  );
                  console.log(JSON.stringify(divs.map(x=>{return x["name"]})));
                return;
            }else{
                if(!DivisionCommand.bans[message.author.id]){
                    DivisionCommand.bans[message.author.id] = new Map();
                }
                DivisionCommand.bans[message.author.id][target[0].id]=true;
                Logs.log(message.author.id + " has banned " + JSON.stringify(target[0]) )
                MsgHelper.reply(message,line + " has been banned.")
            }
        }
    }

    static unbanDivisionAll(message:Message,input:string[]){
        DivisionCommand.unbanDivision(message,["all"]);
    }

    static bannedDivisions(message:Message,input:string[]){
        let bannedDivs:Map<string,boolean> = DivisionCommand.bans[message.author.id];
        if(!bannedDivs){
            MsgHelper.reply(message,"You have no banned Divisions");
            return;
        }
        else{
            let divs = [...divisionsAllies, ...divisionsAxis];
            let divString = [];
            for(let x of Object.keys(bannedDivs)){
                console.log(x);
                divString.push(divs.find((y)=>{
                    return y["id"] == String(x);
                }).name);
            };
            let ret = "You have Banned: ";
            for(let name of divString){
                ret += "`" + name + "`,";
            }
            ret = ret.slice(0,ret.length-1);
            Logs.log(message.author.id + " requested list of banned divisions " + JSON.stringify(bannedDivs));
            MsgHelper.reply(message, ret )
            
        }
    }
}
export class DivisionCommandHelper {
    static addCommands(bot:DiscordBot){
        bot.registerCommand("rdiv",DivisionCommand.randomDiv);
        //bot.registerCommand("alldivs",DivisionCommand.allDivs); this command is toooo huge. Discord complains about message size.
        bot.registerCommand("unbandiv",DivisionCommand.unbanDivision);
        bot.registerCommand("resetdivs",DivisionCommand.unbanDivisionAll);
        bot.registerCommand("bandiv",DivisionCommand.banDivision);
        bot.registerCommand("banneddivs",DivisionCommand.bannedDivisions);
    }
}