import { Embed, SlashCommandBuilder, ChatInputCommandInteraction, SlashCommandIntegerOption } from "discord.js";
import { DiscordBot, MsgHelper } from "../general/discordBot";
import type { DivisionStruct } from "sd2-data";
import { divisions } from "sd2-data";
import { CommonUtil } from "../general/common";
import { Logs } from "../general/logs";
import { EmbedBuilder } from "discord.js";


//@todo clean up array mess in this file created by addition of divsion alias names.
export class DivisionCommand {
    private bans: Map<string, Map<number, boolean>> = new Map<string, Map<number, boolean>>(); // 2d array of playerIds to banned divisions.

    private randomDiv(input: ChatInputCommandInteraction): void {

        let divCount = input.options.getInteger("count") ?? 1;
        let divs: DivisionStruct[] = [...divisions.divisionsAllies, ...divisions.divisionsAxis];


        const side = input.options.getString("side") ?? "allies";

        if (side == "allies") divs = divisions.divisionsAllies;
        if (side == "axis") divs = divisions.divisionsAxis;
        if (side == "nato") divs = divisions.divisionsNato;
        if (side == "pact") divs = divisions.divisionsPact;
        if (side == "warno") divs = [...divisions.divisionsNato, ...divisions.divisionsPact];


        if (divs.length < divCount) {
            MsgHelper.reply(input, `There aren't enough divs to pick from. There are ${divs.length} divisions to choose from.`);
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

        MsgHelper.reply(input, response);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private allDivs(input: ChatInputCommandInteraction): void {
        let alliedDivs = "";
        let axisDivs = "";


        const alliedDivsEmbed = new EmbedBuilder().setTitle("-- All Divisions --");

        alliedDivs = divisions.divisionsAllies.slice(0, divisions.divisionsAllies.length / 2).map(x => x.name).join('\n');
        alliedDivsEmbed.addFields({ name: '\u200b', value: alliedDivs, inline: true });

        alliedDivs = divisions.divisionsAllies.slice(divisions.divisionsAllies.length / 2).map(x => x.name).join('\n');
        alliedDivsEmbed.addFields({ name: '\u200b', value: alliedDivs, inline: true });


        const axisDivsEmbed = new EmbedBuilder();
        axisDivs = divisions.divisionsAxis.slice(0, divisions.divisionsAxis.length / 2)
            .map(x => "\u200b" + x.name).join('\n');
        axisDivsEmbed.addFields({ name: '\u200b', value: axisDivs, inline: true });

        axisDivs = divisions.divisionsAxis.slice(divisions.divisionsAxis.length / 2)
            .map(x => "\u200b" + x.name).join('\n');
        axisDivsEmbed.addFields({ name: '\u200b', value: axisDivs, inline: true });

        MsgHelper.sendEmbed(input, [alliedDivsEmbed, axisDivsEmbed]);
    }

    private unbanDivision(chatInput: ChatInputCommandInteraction, input: string[]): void {


        if (input[0].toLocaleLowerCase() == "all") {
            this.bans[chatInput.user.id] = null;
            Logs.log(chatInput.user.id + " has unbanned all");
            MsgHelper.reply(chatInput, 'unbanned all divisions');
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
                    chatInput,
                    `I don't know what that division is, did you mean ***${CommonUtil.lexicalGuesser(line, divs.map(x => {
                        return x["name"]
                    }))
                    }*** instead of ***${line}***... It has not been unbanned.`
                );
                return;
            } else {
                this.bans[chatInput.user.id][target[0].id] = null;
                Logs.log(chatInput.user.id + " has unbanned " + JSON.stringify(target[0]))
                MsgHelper.reply(chatInput, target[0].name + " has been unbanned.")
                let all = false;
                for (const z of this.bans[chatInput.user.id]) {
                    all = z || all;
                }
                console.log(all);
                if (!all) this.bans[chatInput.user.id] = null;
            }
        }
    }

    private banDivision(message: ChatInputCommandInteraction, input: string[]): void {
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
                if (!this.bans[message.user.id]) {
                    this.bans[message.user.id] = new Map();
                }
                this.bans[message.user.id][target[0].id] = true;
                Logs.log(message.user.id + " has banned " + JSON.stringify(target[0]))
                MsgHelper.reply(message, target[0].name + " has been banned.")
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private unbanDivisionAll(message: ChatInputCommandInteraction, input: string[]): void {
        this.unbanDivision(message, ["all"]);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private bannedDivisions(message: ChatInputCommandInteraction, input: string[]): void {
        const bannedDivs: Map<number, boolean> = this.bans[message.user.id];
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
            Logs.log(message.user.id + " requested list of banned divisions " + JSON.stringify(bannedDivs));
            MsgHelper.reply(message, ret)

        }
    }

    public addCommands(bot: DiscordBot): void {
        const rdiv = new SlashCommandBuilder().setName("rdiv").setDescription("Returns random division");
        rdiv.addStringOption(option => option.setName("side").addChoices(
            { name: "sd2", value: "sd" }, { name: "warno", value: "warno" },
            { name: "axis", value: "axis" }, { name: "allies", value: "allies" },
            { name: "nato", value: "nato" }, { name: "pact", value: "pact" })
            .setRequired(false).setDescription("Choose side or game to choose divisions from. Default: 'sd'"))

            .addIntegerOption(option =>
                option.setName('count').setDescription("Number of divisions to get. Default: 1")
                    .setRequired(false).setMinValue(1).setMaxValue(20));


        bot.registerCommand(rdiv, this.randomDiv.bind(this));

        const allDivs = new SlashCommandBuilder().setName("alldivs").setDescription("Returns all divisions");
        bot.registerCommand(allDivs, this.allDivs.bind(this));

        //temporarily disabled, will revive this after I'll start using a database, otherwise it sucks
        // bot.registerCommand("unbandiv", this.unbanDivision.bind(this));
        // bot.registerCommand("resetdivs", this.unbanDivisionAll.bind(this));
        // bot.registerCommand("bandiv", this.banDivision.bind(this));
        // bot.registerCommand("banneddivs", this.bannedDivisions.bind(this));
    }
}