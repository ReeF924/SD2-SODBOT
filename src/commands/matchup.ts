import { Message } from "discord.js";
import { DiscordBot, MsgHelper } from "../general/discordBot";
import type { DivisionStruct } from "sd2-data";
import { divisions } from "sd2-data";
import { CommonUtil } from "../general/common";
import { Logs } from "../general/logs";
import { MessageEmbed } from "discord.js";
import { log } from "console";


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


    private randomMatchup(message: Message, input: string[]): void {
        let divs: DivisionStruct[] = [];

        let [side = "sd2", count = 1] = input[0].toLowerCase().split(" ")
        side = side || "sd2"
        count = Math.min(parseInt(`${count}` || "1"), 20)
        console.log({side, count})

        if (input.length == 0) {
            MsgHelper.reply(message, "Unknown game, please specify 'sd2' or 'warno'");
            return;
        }

        if (side == "sd2") divs = [...divisions.divisionsAllies, ...divisions.divisionsAxis];
        if (side == "warno") divs = [...divisions.divisionsNato, ...divisions.divisionsPact];
 
        
        let i = 0
        let out = ""
        while(i < count){
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
        bot.registerCommand("matchup", this.randomMatchup.bind(this));
    }
}