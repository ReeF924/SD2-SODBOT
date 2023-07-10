import { Message } from "discord.js";
import { DiscordBot, MsgHelper } from "../general/discordBot";
import type { DivisionStruct } from "sd2-data";
import { divisions } from "sd2-data";
import { CommonUtil } from "../general/common";
import { Logs } from "../general/logs";
import { MessageEmbed } from "discord.js";
import { log } from "console";
import { Replays } from "../results/replays";


function pickRandomDiv(divs) {
    const pick = Math.floor(Math.random() * divs.length)
    const choosenDiv = divs[pick]
    return choosenDiv
}


function createMatchup(divs) {
    const divA = pickRandomDiv(divs)
    const divB = pickRandomDiv(divs)

    const matchup = `${divA.name} vs ${divB.name}`
    return matchup
}


export class MatchupCommand {


    private async randomMatchup(message: Message, input: string[]): Promise<void> {
        let divs: DivisionStruct[] = [];
        let side;
        let count = 1;
        const inputs: string[] = input.length > 0 ? input[0].split(" ") : [];
        if (inputs.length === 0) {
        }
        else if (inputs.length === 1) {
            const tryParse: number = parseInt(input[0]);
            if (tryParse) {
                count = tryParse;
            }
            else {
                side = input[0];
            }
        }
        else if (inputs.length === 2) {
            const inputGame = inputs[1];
            switch (inputGame) {
                case "sd2": side = inputGame; break;
                case "warno": side = inputGame; break;
                default: {
                    message.reply("Invalid arguments, try $matchup");
                    return;
                }
            }
            count = parseInt(inputs[0]);
        }
        else {
            message.reply("Invalid arguments, try $matchup");
            return;
        }

        count = Math.min(count || 1, 20);
        side = side || await CommonUtil.getPrimaryGame(message);
        // let [side = game, count = 1] = input[0].toLowerCase().split(" ");
        // side = side || "sd2";
        // count = Math.min(parseInt(`${count}` || "1"), 20);

        console.log({ side, count: count });

        if (side == "sd2") divs = [...divisions.divisionsAllies, ...divisions.divisionsAxis];
        if (side == "warno") divs = [...divisions.divisionsNato, ...divisions.divisionsPact];


        let i = 0
        let out = ""
        while (i < count) {
            i++
            const matchup = createMatchup(divs)
            out += `${i}) \t ${matchup} \n`
        }

        let embed = new MessageEmbed()
        embed = embed.addFields(
            { name: `Matchups ${side}`, value: out, inline: true },
        )

        message.channel.send(embed);

    }
    public addCommands(bot: DiscordBot): void {
        bot.registerCommand("matchup", this.randomMatchup);

    }
}