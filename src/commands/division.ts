import { Message } from "discord.js";
import { DiscordBot, MsgHelper } from "../general/discordBot";
import type { DivisionStruct } from "sd2-data";
import { divisions } from "sd2-data";
import { CommonUtil } from "../general/common";
import { Logs } from "../general/logs";
import { MessageEmbed } from "discord.js";

//@todo clean up array mess in this file created by addition of divsion alias names.
export class DivisionCommand {
    static bans:Map<string,Map<number,boolean>> = new Map<string,Map<number,boolean>>() ; // 2d array of playerIds to banned divisions.

    static randomDiv(message:Message,input:string[]):void {
        let divs:DivisionStruct[];
        Logs.log("command Random Division with Inputs "+JSON.stringify(input));
        if(input.length == 0){
            divs = [...divisions.divisionsAllies, ...divisions.divisionsAxis];
        }else{
            const side = input[0].toLowerCase();
            if (side !== "axis" && side !== "allies") {
                MsgHelper.reply(message, "Unknown side, please specify 'axis' or 'allies' as a side if you want to pick a side.");
                return;
            }
            if(side == "allies") divs = divisions.divisionsAllies;
            if(side == "axis") divs = divisions.divisionsAxis;
        }
        //check for bans
        if(DivisionCommand.bans[message.member.id]){
            for (const key of Object.keys(DivisionCommand.bans[message.member.id])){
                divs = divs.filter((x)=>{
                    return x.id != Number(key);
                })
            }
        }
        if(divs.length == 0)
            MsgHelper.reply(message,"all divisions have been banned. Please unban some divisions");
        else{
            const pick = divs[Math.floor(Math.random()*divs.length)].name
            Logs.log(message.author.id + " has picked " + pick + " from "+ JSON.stringify(divs) + " side: " + input );
            MsgHelper.reply(message,pick);
        }
            
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static allDivs(message:Message,input:string[]):void {        
        let embed = new MessageEmbed().setTitle("-- All Divisions --")
        let allieddivs = "";
        let allieddivsalias = "";
        let axisdivs = "";
        let axisdivsalias = "";
        for(let i = 0; i < divisions.divisionsAllies.length; i++){
            let allied = "";
            let alliedalias = "";
            let axis = "";
            let axisalias = "";
            if(divisions.divisionsAllies[i]) allied = divisions.divisionsAllies[i].name;
            if(divisions.divisionsAllies[i]) alliedalias = divisions.divisionsAllies[i].alias;
            if(divisions.divisionsAxis[i]) axis = divisions.divisionsAxis[i].name;
            if(divisions.divisionsAxis[i]) axisalias = divisions.divisionsAxis[i].alias;


            allieddivs += allied + "\n";
            allieddivsalias += alliedalias + "\n";
            axisdivs += axis + "\n";
            axisdivsalias += axisalias + "\n";
        }
        embed = embed.addFields(
            {name:"Allied Divisions", value: allieddivs,inline:true},
            {name:"Allied (Alias)", value: allieddivsalias,inline:true},
            {name:'\u200b', value:'\u200b',inline:false},
            {name:"Axis Divisions", value: axisdivs,inline:true},
            {name:"Axis (Alias)", value: axisdivsalias,inline:true}
            )
        message.channel.send(embed);

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
        for(const line of input){
            const divs = [...divisions.divisionsAllies, ...divisions.divisionsAxis];
            const target = divs.filter((x)=>{
                return 0 == line.toLocaleLowerCase().localeCompare(x.name.toLocaleLowerCase());
            })
            if(target.length == 0){
                const target = divs.filter((x)=>{
                    return 0 == line.toLocaleLowerCase().localeCompare(x.alias.toLocaleLowerCase());
                })
            }
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
                MsgHelper.reply(message,target[0].name + " has been unbanned.")
                let all = false;
                for(const z of DivisionCommand.bans[message.author.id]){
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
        for(const line of input){
            const divs = [...divisions.divisionsAllies, ...divisions.divisionsAxis];
            let target = divs.filter((x)=>{
                return 0 == line.toLocaleLowerCase().localeCompare(x.name.toLocaleLowerCase());
            })
            
            if(target.length == 0){
                target = divs.filter((x)=>{
                    return 0 == line.toLocaleLowerCase().localeCompare(x.alias.toLocaleLowerCase());
                })
            }

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
                MsgHelper.reply(message,target[0].name + " has been banned.")
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static unbanDivisionAll(message:Message,input:string[]):void{
        DivisionCommand.unbanDivision(message,["all"]);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static bannedDivisions(message:Message,input:string[]):void{
        const bannedDivs:Map<number,boolean> = DivisionCommand.bans[message.author.id];
        if(!bannedDivs){
            MsgHelper.reply(message,"You have no banned Divisions");
            return;
        }
        else{
            const divs = [...divisions.divisionsAllies, ...divisions.divisionsAxis];
            const divString = [];
            for(const x of Object.keys(bannedDivs)){
                console.log(x);
                divString.push(divs.find((y)=>{
                    return y["id"] == Number(x);
                }).name);
            }
            let ret = "You have Banned: ";
            for(const name of divString){
                ret += "`" + name + "`,";
            }
            ret = ret.slice(0,ret.length-1);
            Logs.log(message.author.id + " requested list of banned divisions " + JSON.stringify(bannedDivs));
            MsgHelper.reply(message, ret )
            
        }
    }
}
export class DivisionCommandHelper {
    static addCommands(bot:DiscordBot):void{
        bot.registerCommand("rdiv",DivisionCommand.randomDiv);
        bot.registerCommand("alldivs",DivisionCommand.allDivs);
        bot.registerCommand("divs",DivisionCommand.allDivs);
        bot.registerCommand("unbandiv",DivisionCommand.unbanDivision);
        bot.registerCommand("resetdivs",DivisionCommand.unbanDivisionAll);
        bot.registerCommand("bandiv",DivisionCommand.banDivision);
        bot.registerCommand("banneddivs",DivisionCommand.bannedDivisions);
    }
}