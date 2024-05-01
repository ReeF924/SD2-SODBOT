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
        let divs: DivisionStruct[] = [];

        const game = input.options.getString("game") ?? "sd2";
        const count = input.options.getInteger("count") ?? 1;

        if (game == "sd2") divs = [...divisions.divisionsAllies, ...divisions.divisionsAxis];
        if (game == "warno") divs = [...divisions.divisionsNato, ...divisions.divisionsPact];


        let i = 1
        let output = ""

        for (let i = 0; i <= count; i++) {
            const matchup = createMatchup(divs, divs)
            output += `${i + 1}) \t ${matchup} \n`
        }

        MsgHelper.say(input, output);
    }
    public addCommands(bot: DiscordBot): void {
        const matchup = new SlashCommandBuilder().setName("matchup").setDescription("Random matchup generator");
        matchup.addStringOption(option => option.setName("game").setDescription("Game to pick from. Default: 'sd2'")
            .setRequired(false).setChoices({ name: "sd2", value: "sd2" }, { name: "warno", value: "warno" }))
            .addIntegerOption(option => option.setName("count").setDescription("Number of matchups to generate. Default: 1")
                .setRequired(false).setMinValue(1).setMaxValue(10))
            .addBooleanOption(option => option.setName("oppositeFactions").setDescription("Specifies whether the matchups can be mirror sides.")
                .setRequired(false));

        bot.registerCommand(matchup, this.randomMatchup.bind(this));
    }
}