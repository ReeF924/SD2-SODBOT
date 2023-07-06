import { Message } from "discord.js";
import { DiscordBot, MsgHelper } from "../general/discordBot";
import type { DivisionStruct } from "sd2-data";
import { divisions } from "sd2-data";
import { CommonUtil } from "../general/common";
import { Logs } from "../general/logs";
import { MessageEmbed } from "discord.js";
import { CommandDB } from "./Command";


//@todo clean up array mess in this file created by addition of divsion alias names.
export class DivisionCommand{
    private bans:Map<string,Map<number,boolean>> = new Map<string,Map<number,boolean>>() ; // 2d array of playerIds to banned divisions.

    private randomDiv(message:Message,input:string[]):void {
        let divs:DivisionStruct[];
        Logs.log("command Random Division with Inputs "+JSON.stringify(input));
        if(input.length == 0){
            divs = [...divisions.divisionsAllies, ...divisions.divisionsAxis];
        }else{
            const side = input[0].toLowerCase();
            if (side !== "axis" && side !== "allies" && side !== "warno") {
                MsgHelper.reply(message, "Unknown faction, please specify 'axis' or 'allies' or 'warno' as a faction if you want to pick a certain faction or choose a warno division.");
                return;
            }
            if(side == "allies") divs = divisions.divisionsAllies;
            if(side == "axis") divs = divisions.divisionsAxis;
            if(side == "warno") divs = [...divisions.divisionsNato, ...divisions.divisionsPact];
        }
        //check for bans
        if(this.bans[message.member.id]){
            for (const key of Object.keys(this.bans[message.member.id])){
                divs = divs.filter((x)=>{
                    return x.id != Number(key);
                })
            }
        }
        if(divs.length == 0)
            MsgHelper.reply(message,"all divisions have been banned. Please unban some divisions");
        else{
            const pick = Math.floor(Math.random()*divs.length)
            const pickname = divs[pick].name
            Logs.log(message.author.id + " has picked " + pickname + " from "+ JSON.stringify(divs) + " side: " + input );
            MsgHelper.reply(message,pickname);
        }
            
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private allDivs(message:Message,input:string[]):void {        
        let allieddivs = "";
        let axisdivs = "";
        for(let i = 0; i < divisions.divisionsAllies.length; i++){
            if(divisions.divisionsAllies[i]) allieddivs  += divisions.divisionsAllies[i].name + '\n';
            //if(divisions.divisionsAllies[i]) alliedalias = divisions.divisionsAllies[i].alias;
            if(divisions.divisionsAxis[i]) axisdivs += divisions.divisionsAxis[i].name + '\n';
        
            //if(divisions.divisionsAxis[i]) axisalias = divisions.divisionsAxis[i].alias;
        }
        let alliedembed = new MessageEmbed().setTitle("-- All Divisions --")
        alliedembed = alliedembed.addFields(
            {name:"Allied Divisions", value: allieddivs,inline:true},
            )
        message.channel.send(alliedembed);
        let axisembed = new MessageEmbed()
        axisembed = axisembed.addFields(
            {name:"Axis Divisions", value: axisdivs,inline:true},
            )
        message.channel.send(axisembed);

    }

    private unbanDivision(message:Message,input:string[]):void{
        if(input.length == 0) {
            MsgHelper.reply(message,`I don't know what that division is, please use ${CommonUtil.config("prefix")}alldivs, to get the list of divisions.`)
            return;
        }
        if(input[0].toLocaleLowerCase() == "all")
        {
            this.bans[message.author.id] = null;
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
                    for(const i of x.alias){
                        if(0 == i.toLocaleLowerCase().localeCompare(line.toLocaleLowerCase())) return true;
                    }
                    return false
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
                this.bans[message.author.id][target[0].id]=null;
                Logs.log(message.author.id + " has unbanned " + JSON.stringify(target[0]) )
                MsgHelper.reply(message,target[0].name + " has been unbanned.")
                let all = false;
                for(const z of this.bans[message.author.id]){
                    all = z || all;
                }
                console.log(all);
                if(!all) this.bans[message.author.id] = null;
            }
        }
    }

    private banDivision(message:Message,input:string[]):void{
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
                    for(const i of x.alias){
                        if(0 == i.toLocaleLowerCase().localeCompare(line.toLocaleLowerCase())) return true;
                    }
                    return false
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
                if(!this.bans[message.author.id]){
                    this.bans[message.author.id] = new Map();
                }
                this.bans[message.author.id][target[0].id]=true;
                Logs.log(message.author.id + " has banned " + JSON.stringify(target[0]) )
                MsgHelper.reply(message,target[0].name + " has been banned.")
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private unbanDivisionAll(message:Message,input:string[]):void{
        this.unbanDivision(message,["all"]);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private bannedDivisions(message:Message,input:string[]):void{
        const bannedDivs:Map<number,boolean> = this.bans[message.author.id];
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
    public addCommands(bot:DiscordBot):void{
        bot.registerCommand("rdiv",this.randomDiv);
        bot.registerCommand("alldivs",this.allDivs);
        bot.registerCommand("divs",this.allDivs);
        bot.registerCommand("unbandiv",this.unbanDivision);
        bot.registerCommand("resetdivs",this.unbanDivisionAll);
        bot.registerCommand("bandiv",this.banDivision);
        bot.registerCommand("banneddivs",this.bannedDivisions);
    }
}