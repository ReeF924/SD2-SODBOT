"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DivisionCommand = void 0;
const discordBot_1 = require("../general/discordBot");
const sd2_data_1 = require("sd2-data");
const common_1 = require("../general/common");
const logs_1 = require("../general/logs");
const discord_js_1 = require("discord.js");
//@todo clean up array mess in this file created by addition of divsion alias names.
class DivisionCommand {
    constructor() {
        this.bans = new Map(); // 2d array of playerIds to banned divisions.
    }
    randomDiv(message, input) {
        let divs;
        logs_1.Logs.log("command Random Division with Inputs " + JSON.stringify(input));
        if (input.length == 0) {
            divs = [...sd2_data_1.divisions.divisionsAllies, ...sd2_data_1.divisions.divisionsAxis];
        }
        else {
            const side = input[0].toLowerCase();
            if (side !== "axis" && side !== "allies" && side !== "warno") {
                discordBot_1.MsgHelper.reply(message, "Unknown faction, please specify 'axis' or 'allies' or 'warno' as a faction if you want to pick a certain faction or choose a warno division.");
                return;
            }
            if (side == "allies")
                divs = sd2_data_1.divisions.divisionsAllies;
            if (side == "axis")
                divs = sd2_data_1.divisions.divisionsAxis;
            if (side == "warno")
                divs = [...sd2_data_1.divisions.divisionsNato, ...sd2_data_1.divisions.divisionsPact];
        }
        //check for bans
        if (this.bans[message.member.id]) {
            for (const key of Object.keys(this.bans[message.member.id])) {
                divs = divs.filter((x) => {
                    return x.id != Number(key);
                });
            }
        }
        if (divs.length == 0)
            discordBot_1.MsgHelper.reply(message, "all divisions have been banned. Please unban some divisions");
        else {
            const pick = Math.floor(Math.random() * divs.length);
            const pickname = divs[pick].name;
            logs_1.Logs.log(message.author.id + " has picked " + pickname + " from " + JSON.stringify(divs) + " side: " + input);
            discordBot_1.MsgHelper.reply(message, pickname);
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    allDivs(message, input) {
        let allieddivs = "";
        let axisdivs = "";
        for (let i = 0; i < sd2_data_1.divisions.divisionsAllies.length; i++) {
            if (sd2_data_1.divisions.divisionsAllies[i])
                allieddivs += sd2_data_1.divisions.divisionsAllies[i].name + '\n';
            //if(divisions.divisionsAllies[i]) alliedalias = divisions.divisionsAllies[i].alias;
            if (sd2_data_1.divisions.divisionsAxis[i])
                axisdivs += sd2_data_1.divisions.divisionsAxis[i].name + '\n';
            //if(divisions.divisionsAxis[i]) axisalias = divisions.divisionsAxis[i].alias;
        }
        let alliedembed = new discord_js_1.MessageEmbed().setTitle("-- All Divisions --");
        alliedembed = alliedembed.addFields({ name: "Allied Divisions", value: allieddivs, inline: true });
        message.channel.send(alliedembed);
        let axisembed = new discord_js_1.MessageEmbed();
        axisembed = axisembed.addFields({ name: "Axis Divisions", value: axisdivs, inline: true });
        message.channel.send(axisembed);
    }
    unbanDivision(message, input) {
        if (input.length == 0) {
            discordBot_1.MsgHelper.reply(message, `I don't know what that division is, please use ${common_1.CommonUtil.config("prefix")}alldivs, to get the list of divisions.`);
            return;
        }
        if (input[0].toLocaleLowerCase() == "all") {
            this.bans[message.author.id] = null;
            logs_1.Logs.log(message.author.id + " has unbanned all");
            discordBot_1.MsgHelper.reply(message, 'unbanned all divisions');
            return;
        }
        for (const line of input) {
            const divs = [...sd2_data_1.divisions.divisionsAllies, ...sd2_data_1.divisions.divisionsAxis];
            const target = divs.filter((x) => {
                return 0 == line.toLocaleLowerCase().localeCompare(x.name.toLocaleLowerCase());
            });
            if (target.length == 0) {
                const target = divs.filter((x) => {
                    for (const i of x.alias) {
                        if (0 == i.toLocaleLowerCase().localeCompare(line.toLocaleLowerCase()))
                            return true;
                    }
                    return false;
                });
            }
            if (target.length == 0) {
                discordBot_1.MsgHelper.say(message, `I don't know what that division is, did you mean ***${common_1.CommonUtil.lexicalGuesser(line, divs.map(x => { return x["name"]; }))}*** instead of ***${line}***... It has not been unbanned.`);
                return;
            }
            else {
                this.bans[message.author.id][target[0].id] = null;
                logs_1.Logs.log(message.author.id + " has unbanned " + JSON.stringify(target[0]));
                discordBot_1.MsgHelper.reply(message, target[0].name + " has been unbanned.");
                let all = false;
                for (const z of this.bans[message.author.id]) {
                    all = z || all;
                }
                console.log(all);
                if (!all)
                    this.bans[message.author.id] = null;
            }
        }
    }
    banDivision(message, input) {
        if (input.length == 0) {
            discordBot_1.MsgHelper.reply(message, `Please specify a division to ban. Use ${common_1.CommonUtil.config("prefix")}alldivs, to get the list of divisions.`);
            return;
        }
        for (const line of input) {
            const divs = [...sd2_data_1.divisions.divisionsAllies, ...sd2_data_1.divisions.divisionsAxis];
            let target = divs.filter((x) => {
                return 0 == line.toLocaleLowerCase().localeCompare(x.name.toLocaleLowerCase());
            });
            if (target.length == 0) {
                target = divs.filter((x) => {
                    for (const i of x.alias) {
                        if (0 == i.toLocaleLowerCase().localeCompare(line.toLocaleLowerCase()))
                            return true;
                    }
                    return false;
                });
            }
            if (target.length == 0) {
                discordBot_1.MsgHelper.say(message, `I don't know what that division is, did you mean ***${common_1.CommonUtil.lexicalGuesser(line, divs.map(x => { return x["name"]; }))}*** instead of ***${line}***... It has not been banned.`);
                console.log(JSON.stringify(divs.map(x => { return x["name"]; })));
                return;
            }
            else {
                if (!this.bans[message.author.id]) {
                    this.bans[message.author.id] = new Map();
                }
                this.bans[message.author.id][target[0].id] = true;
                logs_1.Logs.log(message.author.id + " has banned " + JSON.stringify(target[0]));
                discordBot_1.MsgHelper.reply(message, target[0].name + " has been banned.");
            }
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    unbanDivisionAll(message, input) {
        this.unbanDivision(message, ["all"]);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    bannedDivisions(message, input) {
        const bannedDivs = this.bans[message.author.id];
        if (!bannedDivs) {
            discordBot_1.MsgHelper.reply(message, "You have no banned Divisions");
            return;
        }
        else {
            const divs = [...sd2_data_1.divisions.divisionsAllies, ...sd2_data_1.divisions.divisionsAxis];
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
            logs_1.Logs.log(message.author.id + " requested list of banned divisions " + JSON.stringify(bannedDivs));
            discordBot_1.MsgHelper.reply(message, ret);
        }
    }
    addCommands(bot) {
        bot.registerCommand("rdiv", this.randomDiv);
        bot.registerCommand("alldivs", this.allDivs);
        bot.registerCommand("divs", this.allDivs);
        bot.registerCommand("unbandiv", this.unbanDivision);
        bot.registerCommand("resetdivs", this.unbanDivisionAll);
        bot.registerCommand("bandiv", this.banDivision);
        bot.registerCommand("banneddivs", this.bannedDivisions);
    }
}
exports.DivisionCommand = DivisionCommand;
//# sourceMappingURL=division.js.map