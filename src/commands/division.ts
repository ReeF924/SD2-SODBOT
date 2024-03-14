import {Embed, Message} from "discord.js";
import { DiscordBot, MsgHelper } from "../general/discordBot";
import type { DivisionStruct } from "sd2-data";
import { divisions } from "sd2-data";
import { CommonUtil } from "../general/common";
import { Logs } from "../general/logs";
import { EmbedBuilder } from "discord.js";


//@todo clean up array mess in this file created by addition of divsion alias names.
export class DivisionCommand {
    private bans: Map<string, Map<number, boolean>> = new Map<string, Map<number, boolean>>(); // 2d array of playerIds to banned divisions.

    private randomDiv(message: Message, input: string[]): void {

        Logs.log("command Random Division with Inputs " + JSON.stringify(input));

        let divCount = 1;
        let divs: DivisionStruct[] = [...divisions.divisionsAllies, ...divisions.divisionsAxis];

        if (input.length > 0) {
            const inputArgs = input[0].toLowerCase().split(' ');

            const divCountIndex = inputArgs.findIndex((x) => !isNaN(Number(x)));

            divCount = divCountIndex == -1 ? 1 : Number(inputArgs.splice(divCountIndex, 1));

            if (divCount > 20) {
                MsgHelper.reply(message, "Please select less than 21 divisions.")
                return;
            }

            if (inputArgs.length > 1) {
                MsgHelper.reply(message, "Allowed arguments are 'axis', 'allies' or 'warno' and a number of divisions to pick. Example: $rdiv axis 3")
                return;
            }


            if (inputArgs.length == 1) { // I'm lucky my programming teacher will never see this. I'm too tired sorry 
                const side = inputArgs[0];
                if (side !== "axis" && side !== "allies" && side !== "warno") {
                    MsgHelper.reply(message, "Unknown faction, please specify 'axis' or 'allies' or 'warno' as a faction if you want to pick a certain faction or choose a warno division.");
                    return;
                }
                if (side == "allies") divs = divisions.divisionsAllies;
                if (side == "axis") divs = divisions.divisionsAxis;
                if (side == "warno") divs = [...divisions.divisionsNato, ...divisions.divisionsPact];
            }
        }

        if (divs?.length == 0 || divs?.length < divCount) {
            MsgHelper.reply(message, "There aren't enough divs to pick from. If some are banned, you might wanna unban them. To unban all type $resetdivs.");
            return;
        }

        const picks: DivisionStruct[] = [];
        let response = "";


        for (let i = 0; i < divCount; i++) {
            const pick = Math.floor(Math.random() * divs.length);

            picks.push(divs[pick]);
            divs.splice(pick, 1);
            response += picks[i].name + ', ';
        }

        //In case some smartass enters 0
        response = response.length > 3 ? response.substring(0, response.length - 2) : "No divisions available.";

        MsgHelper.reply(message, response);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private allDivs(message: Message, input: string[]): void {
        let allieddivs = "";
        let axisdivs = "";
        for (let i = 0; i < divisions.divisionsAllies.length; i++) {
            if (divisions.divisionsAllies[i]) allieddivs += divisions.divisionsAllies[i].name + '\n';
            //if(divisions.divisionsAllies[i]) alliedalias = divisions.divisionsAllies[i].alias;
            if (divisions.divisionsAxis[i]) axisdivs += divisions.divisionsAxis[i].name + '\n';

            //if(divisions.divisionsAxis[i]) axisalias = divisions.divisionsAxis[i].alias;
        }
        const alliedDivsEmbed = new EmbedBuilder()
            .setTitle("-- All Divisions --");
        alliedDivsEmbed.addFields({ name: 'Allied Divisions', value: allieddivs, inline: true });

        let axisDivsEmbed = new EmbedBuilder();
        axisDivsEmbed = axisDivsEmbed.addFields({ name: "Axis Divisions", value: axisdivs, inline: true });
        message.channel.send({embeds: [alliedDivsEmbed, axisDivsEmbed]});
    }

    private unbanDivision(message: Message, input: string[]): void {
        if (input.length == 0) {
            MsgHelper.reply(message, `I don't know what that division is, please use ${CommonUtil.config("prefix")}alldivs, to get the list of divisions.`)
            return;
        }
        if (input[0].toLocaleLowerCase() == "all") {
            this.bans[message.author.id] = null;
            Logs.log(message.author.id + " has unbanned all");
            MsgHelper.reply(message, 'unbanned all divisions');
            return;
        }
        for (const line of input) {
            const divs = [...divisions.divisionsAllies, ...divisions.divisionsAxis];
            const target = divs.filter((x) => {
                return 0 == line.toLocaleLowerCase().localeCompare(x.name.toLocaleLowerCase());
            })
            if (target.length == 0) {
                const target = divs.filter((x) => {
                    for (const i of x.alias) {
                        if (0 == i.toLocaleLowerCase().localeCompare(line.toLocaleLowerCase())) return true;
                    }
                    return false
                })
            }
            if (target.length == 0) {
                MsgHelper.say(
                    message,
                    `I don't know what that division is, did you mean ***${CommonUtil.lexicalGuesser(line, divs.map(x => {
                        return x["name"]
                    }))
                    }*** instead of ***${line}***... It has not been unbanned.`
                );
                return;
            } else {
                this.bans[message.author.id][target[0].id] = null;
                Logs.log(message.author.id + " has unbanned " + JSON.stringify(target[0]))
                MsgHelper.reply(message, target[0].name + " has been unbanned.")
                let all = false;
                for (const z of this.bans[message.author.id]) {
                    all = z || all;
                }
                console.log(all);
                if (!all) this.bans[message.author.id] = null;
            }
        }
    }

    private banDivision(message: Message, input: string[]): void {
        if (input.length == 0) {
            MsgHelper.reply(message, `Please specify a division to ban. Use ${CommonUtil.config("prefix")}alldivs, to get the list of divisions.`)
            return;
        }
        for (const line of input) {
            const divs = [...divisions.divisionsAllies, ...divisions.divisionsAxis];
            let target = divs.filter((x) => {
                return 0 == line.toLocaleLowerCase().localeCompare(x.name.toLocaleLowerCase());
            })

            if (target.length == 0) {
                target = divs.filter((x) => {
                    for (const i of x.alias) {
                        if (0 == i.toLocaleLowerCase().localeCompare(line.toLocaleLowerCase())) return true;
                    }
                    return false
                })
            }

            if (target.length == 0) {
                MsgHelper.say(
                    message,
                    `I don't know what that division is, did you mean ***${CommonUtil.lexicalGuesser(line, divs.map(x => {
                        return x["name"]
                    }))
                    }*** instead of ***${line}***... It has not been banned.`
                );
                console.log(JSON.stringify(divs.map(x => {
                    return x["name"]
                })));
                return;
            } else {
                if (!this.bans[message.author.id]) {
                    this.bans[message.author.id] = new Map();
                }
                this.bans[message.author.id][target[0].id] = true;
                Logs.log(message.author.id + " has banned " + JSON.stringify(target[0]))
                MsgHelper.reply(message, target[0].name + " has been banned.")
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private unbanDivisionAll(message: Message, input: string[]): void {
        this.unbanDivision(message, ["all"]);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private bannedDivisions(message: Message, input: string[]): void {
        const bannedDivs: Map<number, boolean> = this.bans[message.author.id];
        if (!bannedDivs) {
            MsgHelper.reply(message, "You have no banned Divisions");
            return;
        } else {
            const divs = [...divisions.divisionsAllies, ...divisions.divisionsAxis];
            const divString = [];
            for (const x of Object.keys(bannedDivs)) {
                console.log(x);
                divString.push(divs.find((y) => {
                    return y["id"] == Number(x);
                }).name);
            }
            let ret = "You have Banned: ";
            for (const name of divString) {
                ret += "`" + name + "`,";
            }
            ret = ret.slice(0, ret.length - 1);
            Logs.log(message.author.id + " requested list of banned divisions " + JSON.stringify(bannedDivs));
            MsgHelper.reply(message, ret)

        }
    }

    public addCommands(bot: DiscordBot): void {
        bot.registerCommand("rdiv", this.randomDiv.bind(this));
        bot.registerCommand("alldivs", this.allDivs.bind(this));
        bot.registerCommand("divs", this.allDivs.bind(this));
        bot.registerCommand("unbandiv", this.unbanDivision.bind(this));
        bot.registerCommand("resetdivs", this.unbanDivisionAll.bind(this));
        bot.registerCommand("bandiv", this.banDivision.bind(this));
        bot.registerCommand("banneddivs", this.bannedDivisions.bind(this));
    }
}