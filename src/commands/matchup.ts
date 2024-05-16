import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { DiscordBot, MsgHelper } from "../general/discordBot";
import type { DivisionStruct } from "sd2-data";
import { divisions } from "sd2-data";
import { EmbedBuilder } from "discord.js";
import { match } from "assert";



function pickRandomDiv(divs) {
    const pick = Math.floor(Math.random() * divs.length)
    const choosenDiv = divs[pick]
    return choosenDiv
}


function createMatchup(firstDivPool, secondDivPool) {
    const divA = pickRandomDiv(firstDivPool)
    const divB = pickRandomDiv(secondDivPool)

    const matchup = `${divA.name} vs ${divB.name}`
    return matchup
}


export class MatchupCommand {


    private randomMatchup(input: ChatInputCommandInteraction): void {
        let firstDivPool: DivisionStruct[] = [];
        let secondDivPool: DivisionStruct[] = [];

        const game = input.options.getString("game") ?? "sd2";
        const count = input.options.getInteger("count") ?? 1;
        const mirrors = input.options.getBoolean("mirrors") ?? false;

        //I think I threw up writing this
        if (game == "sd2") {
            if (!mirrors) {
                firstDivPool = divisions.divisionsAllies
                secondDivPool = divisions.divisionsAxis
            }
            else {
                firstDivPool = [...divisions.divisionsAllies, ...divisions.divisionsAxis]
                secondDivPool = firstDivPool;
            }
        }

        if (game == "warno") {
            if (!mirrors) {
                firstDivPool = divisions.divisionsNato
                secondDivPool = divisions.divisionsPact
            }
            else {
                firstDivPool = [...divisions.divisionsNato, ...divisions.divisionsPact]
                secondDivPool = firstDivPool;
            }
        }

        let output = ""

        for (let i = 0; i < count; i++) {
            const matchup = createMatchup(firstDivPool, secondDivPool);
            output += `${i + 1}) \t ${matchup} \n`;
        }

        MsgHelper.reply(input, output);
    }
    public addCommands(bot: DiscordBot): void {
        const matchup = new SlashCommandBuilder()
        matchup.setName("matchup").setDescription("Random matchup generator");

        matchup.addStringOption(option => option.setName("game").setDescription("Game to pick from. Default: 'sd2'")
            .setRequired(false).setChoices({ name: "sd2", value: "sd2" }, { name: "warno", value: "warno" }));

        matchup.addIntegerOption(option => option.setName("count")
            .setDescription("Number of matchups to generate. Default: 1")
            .setRequired(false).setMinValue(1).setMaxValue(10));

        matchup.addBooleanOption(option => option.setName("mirrors")
            .setDescription("Specifies whether the matchups can be mirror sides. Default: False")
            .setRequired(false));

        bot.registerCommand(matchup, this.randomMatchup.bind(this));
    }
}