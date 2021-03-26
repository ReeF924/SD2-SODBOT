import { Message } from "discord.js";
import { DiscordBot, MsgHelper } from "../general/discordBot";
import divisions, { divisionsAllies, divisionsAxis} from "sd2-data/divisions";
import type { DivisionStruct } from "sd2-data/types/index";
import { AsciiTable3 } from "ascii-table3/ascii-table3";
import { CommonUtil } from "../general/common";

export class DivisionCommand {
    static bans:Map<string,Map<string,boolean>>; // 2d array of playerIds to banned divisions.

    static rdiv(message:Message,input:string[]):void {
        
        var divs:DivisionStruct[];
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
            for (let key of DivisionCommand.bans[message.member.id].keys()){
                divs = divs.filter((x)=>{
                    return x.id != key;
                })
            }
        }
        if(divs.length == 0)
            MsgHelper.reply(message,"all divisions have been banned. Please unban some divisions");
        else
            MsgHelper.reply(message,divs[Math.floor(Math.random()*divs.length)].name);
    }
    static allDivs(message:Message,input:string[]):void {
        const table = new AsciiTable3("Divisions");
        table.setHeading("Allies","Axis");
        for(var i = 0; i < divisionsAllies.length; i++){
            table.addRow(divisionsAllies[i].name,divisionsAxis[i].name);
        }
        MsgHelper.say(message,"``" + table.toString() + "``");
    }
    static unbanDivision(message:Message,input:string[]):void{
        if(input.length == 0) {
            MsgHelper.reply(message,`I don't know what that division is, please use ${CommonUtil.config("prefix")}alldivs, to get the list of divisions.`)
            return;
        }
        if(input[0].toLocaleLowerCase() == "all")
        {
            DivisionCommand.bans.delete(message.author.id);
            MsgHelper.reply(message,'unbanned all divisions');
            return;     
        }
        for(let line of input){
            let divs = [...divisionsAllies, ...divisionsAxis];
            let target = divs.filter((x)=>{
                return line.toLocaleLowerCase().localeCompare(x.name.toLocaleLowerCase());
            })
            if(target.length == 0){
                MsgHelper.say(
                    message,
                    `I don't know what that division is, did you mean ***${
                    CommonUtil.lexicalGuesser(line,divs.map(x=>{return x.name}))
                    }*** instead of ***${line}***.\nNo divisions have been unbanned.`
                  );
                return;
            }else{
                DivisionCommand.bans[message.author.id][target[0].id]=false;
                MsgHelper.reply(message,line + " has been unbanned.")
                let all = true;
                for(let z of DivisionCommand.bans[message.author.id]){
                    all = z && all;
                }
                if(!all) DivisionCommand.bans.delete(message.author.id);
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
                return line.toLocaleLowerCase().localeCompare(x.name.toLocaleLowerCase());
            })
            if(target.length == 0){
                MsgHelper.say(
                    message,
                    `I don't know what that division is, did you mean ***${
                    CommonUtil.lexicalGuesser(line,divs.map(x=>{return x.name}))
                    }*** instead of ***${line}***.\nNo divisions have been banned.`
                  );
                return;
            }else{
                DivisionCommand.bans[message.author.id][target[0].id]=true;
                MsgHelper.reply(message,line + " has been banned.")
            }
        }
    }

    static unbanDivisionAll(message:Message,input:string[]){
        DivisionCommand.unbanDivision(message,["all"]);
    }

    static bannedDivisions(message:Message,input:string[]){
        let bannedDivs = DivisionCommand.bans[message.author.id];
        if(!bannedDivs){
            MsgHelper.reply(message,"You have no banned Divisions");
            return;
        }
        else{
            let divs = [...divisionsAllies, ...divisionsAxis];
            let divString = bannedDivs.map((x)=>{
                divs.find((y)=>{
                    y.id == x;
                })[0];
            });
            let ret = "";
            for(let name of divString){
                ret += name + "\n";
            }
            MsgHelper.reply(message,"You Have Banned: \n ``" + ret + '``')
            
        }
    }
}
export class DivisionCommandHelper {
    static addCommands(bot:DiscordBot){
        bot.registerCommand("rdiv",DivisionCommand.rdiv);
        bot.registerCommand("alldivs",DivisionCommand.allDivs);
        bot.registerCommand("unbandiv",DivisionCommand.unbanDivision);
        bot.registerCommand("resetdivs",DivisionCommand.unbanDivisionAll);
        bot.registerCommand("bandiv",DivisionCommand.banDivision);
        bot.registerCommand("banneddivs",DivisionCommand.bannedDivisions);
    }
}