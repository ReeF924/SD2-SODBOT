import { Message } from "discord.js";
import { DiscordBot, MsgHelper } from "../general/discordBot";
import * as Data from "sd2-data"
import { CommonUtil } from "../general/common";
import { Logs } from "../general/logs";
import { MessageEmbed } from "discord.js";
import { map } from "mssql";

export class MapCommand {
    static bans: Map<string, Map<string, boolean>> = new Map<string, Map<string, boolean>>(); // 2d array of playerIds to banned divisions.

    static warnoMaps = [
        "Mount River",
        "Geisa",
        "Death Row",
        "Two Lakes",
        "Vertigo",
        "Two Ways",
        "Black Forest",
        "Ripple",
        "Chemical"
    ]

    static warnoMaps3v3 = [
        "Two Ways 3v3",
        "Danger Hills 3v3",
        "Mount River 3v3",
        "Volcano 3v3",
        "Triple Strike 3v3",
        "Rift 3v3",
        "Cyrus 3v3"
    ]

    static warnoMaps4v4 = [
        "Chemical 4v4",
        "Iron Waters 10",
        "Loop 10",
        "Crown 10",
        "Geisa 10"
    ]


    // Returns a random map  can be League, 1v1, 2v2, 3v3, 4v4
    static randomMap(message: Message, input: string[]): void {


        function getRandomMaps(mapList, count = 1) {
            let availableMaps = [...mapList]
            let maps = []
            while (count > 0) {
                const pickIndex = Math.floor(Math.random() * availableMaps.length)
                const pick = availableMaps[pickIndex]
                availableMaps = availableMaps.filter(m => m !== pick)
                maps.push(pick)
                count--
            }
            return maps
        }

        let maplist: string[] = []
        const importedMapData = Data.maps;
        let pickCount = 1;
        let count = 1;
        Logs.log("command Random Map with Inputs " + JSON.stringify(input));
        if (input.length == 0) {
            maplist = importedMapData.mapData.sd2League;
        } else {
            const size = input[0].toLowerCase();
            switch (size) {
                case "1v1": maplist = importedMapData.mapData.byPlayerSize[2]; break;
                case "get2": maplist = importedMapData.mapData.byPlayerSize[2]; count = 2; break;
                case "get3": maplist = importedMapData.mapData.byPlayerSize[2]; count = 3; break;
                case "get4": maplist = importedMapData.mapData.byPlayerSize[2]; count = 4; break;
                case "get5": maplist = importedMapData.mapData.byPlayerSize[2]; count = 5; break;
                case "get6": maplist = importedMapData.mapData.byPlayerSize[2]; count = 6; break;
                case "2v2": maplist = importedMapData.mapData.byPlayerSize[4]; break;
                case "get5 2v2": maplist = importedMapData.mapData.byPlayerSize[4]; count = 5; break;
                case "3v3": maplist = importedMapData.mapData.byPlayerSize[6]; break;
                case "4v4": maplist = importedMapData.mapData.byPlayerSize[8]; break;

                case "warno": maplist = MapCommand.warnoMaps; break;
                case "warno 1v1": maplist = MapCommand.warnoMaps; break;
                case "warno 2v2": maplist = MapCommand.warnoMaps; break;
                case "warno 3v3": maplist = MapCommand.warnoMaps3v3; break;
                case "warno 4v4": maplist = MapCommand.warnoMaps4v4; break;

                default: MsgHelper.reply(message, size + " is not a valid map size. for example, 1v1.");
                    return
            }
        }
        //check for bans
        if (MapCommand.bans[message.member.id]) {
            for (const key of Object.keys(MapCommand.bans[message.member.id])) {
                maplist = maplist.filter((x) => {
                    return x != key;
                })
            }
        }
        let picks = 0
        while (picks < pickCount) {
            if (maplist.length == 0) {
                MsgHelper.reply(message, "all maps have been banned. Please unban some maps");
                break;
            }
            else {

                if (count > 1) {
                    const maps = getRandomMaps(maplist, count)
                    Logs.log(message.author.id + " has picked " + maps.join(",") + " from " + JSON.stringify(maplist) + " side: " + input);
                    message.reply(maps.join(", "));
                    return
                }
                const pickIndex = Math.floor(Math.random() * maplist.length)
                const pick = maplist[pickIndex]
                maplist = maplist.filter((x, index) => { return pickIndex != index; })
                Logs.log(message.author.id + " has picked " + pick + " from " + JSON.stringify(maplist) + " side: " + input);
                message.reply(pick, { files: ["./src/general/images/" + pick + ".png"] });

            }
            picks++;
        }


    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static allMaps(message: Message, input: string[]): void {
        const importedMapData = Data.maps;
        console.log(JSON.stringify(importedMapData));
        const bannedMaps = MapCommand.bans[message.author.id];
        const legaueMaps = importedMapData.mapData.sd2League;
        //Set up discord embed
        let embed = new MessageEmbed().setTitle(message.author.username + '\'s Maps')
        let text1v1 = "";
        let text2v2 = "";
        let text3v3 = "";
        let text4v4 = "";
        for (let i = 0; i < importedMapData.mapData.byPlayerSize[2].length; i++) { //this needs to be rewritten into 4 loops.
            let maps1 = importedMapData.mapData.byPlayerSize[2][i];
            let maps2 = importedMapData.mapData.byPlayerSize[4][i];
            let maps3 = importedMapData.mapData.byPlayerSize[6][i];
            let maps4 = importedMapData.mapData.byPlayerSize[8][i];

            if (!maps1) {
                maps1 = "";
            } else if (bannedMaps && bannedMaps[maps1]) {
                maps1 = '~~' + maps1 + '~~';
            } else if (maps1 && !legaueMaps.includes(maps1)) {
                maps1 += " *"
            }
            if (!maps2) {
                maps2 = "";
            } else if (bannedMaps && bannedMaps[maps2]) {
                maps2 = '~~' + maps2 + '~~';
            }
            if (!maps3) {
                maps3 = "";
            } else if (bannedMaps && bannedMaps[maps3]) {
                maps3 = '~~' + maps3 + '~~';
            }
            if (!maps4) {
                maps4 = "";
            } else if (bannedMaps && bannedMaps[maps4]) {
                maps4 = '~~' + maps4 + '~~';
            }
            text1v1 += maps1 + "\n";
            text2v2 += maps2 + "\n";
            text3v3 += maps3 + "\n";
            text4v4 += maps4 + "\n";
        }
        embed = embed.addFields(
            { name: "1v1", value: text1v1, inline: true },
            { name: "2v2", value: text2v2, inline: true },
            { name: "3v3", value: text3v3, inline: true },
            { name: "4v4", value: text4v4, inline: true }
        )
        embed = embed.setFooter("Maps are stike-through'd when banned\n* maps are not in the league pool (rmap without specifying 1v1)")
        message.channel.send(embed);
    }


    static unbanMap(message: Message, input: string[]): void {
        if (input.length == 0) {
            MsgHelper.reply(message, `I don't know what that map is, please use ${CommonUtil.config("prefix")}maps, to get the list of all maps.`)
            return;
        }
        if (input[0].toLocaleLowerCase() == "all") {
            MapCommand.bans[message.author.id] = null;
            Logs.log(message.author.id + " has unbanned all maps");
            MsgHelper.reply(message, 'unbanned all maps');
            return;
        }
        for (const line of input) {
            const mapPool = Data.maps.allMapNames;
            const target = mapPool.filter((x) => {
                return 0 == line.toLocaleLowerCase().localeCompare(x.toLocaleLowerCase());
            })
            if (target.length == 0) {
                MsgHelper.say(
                    message,
                    `I don't know what map that is, did you mean ***${
                    CommonUtil.lexicalGuesser(line, mapPool)
                    }*** instead of ***${line}***... It has not been unbanned.`
                );
                return;
            } else {
                MapCommand.bans[message.author.id][target[0]] = null;
                Logs.log(message.author.id + " has unbanned " + JSON.stringify(target[0]))
                MsgHelper.reply(message, line + " has been unbanned.")
                let all = false;
                for (const z of Object.values(MapCommand.bans[message.author.id])) {
                    console.log(z);
                    all = !!z || all;
                }
                if (!all) MapCommand.bans[message.author.id] = null;
            }
        }
    }

    static banMap(message: Message, input: string[]): void {
        if (input.length == 0) {
            MsgHelper.reply(message, `Please specify a map to ban. Use ${CommonUtil.config("prefix")}maps, to get the list of all maps.`)
            return;
        }
        for (const line of input) {
            const targetMaps = Data.maps.allMapNames;
            const target = targetMaps.filter((x) => {
                return 0 == line.toLocaleLowerCase().localeCompare(x.toLocaleLowerCase());
            })
            if (target.length == 0) {
                MsgHelper.say(
                    message,
                    `I don't know what map that is, did you mean ***${
                    CommonUtil.lexicalGuesser(line, targetMaps)
                    }*** instead of ***${line}***... It has not been banned.`
                );
                return;
            } else {
                if (!MapCommand.bans[message.author.id]) {
                    MapCommand.bans[message.author.id] = new Map();
                }
                MapCommand.bans[message.author.id][target[0]] = true;
                Logs.log(message.author.id + " has banned " + JSON.stringify(target[0]))
                MsgHelper.reply(message, line + " has been banned.")
            }
        }
        MapCommand.allMaps(message, input);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static unbanMapAll(message: Message, input: string[]): void {
        MapCommand.unbanMap(message, ["all"]);
    }
}
export class MapCommandHelper {
    static addCommands(bot: DiscordBot): void {
        bot.registerCommand("rmap", MapCommand.randomMap);
        bot.registerCommand("allmaps", MapCommand.allMaps);
        bot.registerCommand("maps", MapCommand.allMaps);
        bot.registerCommand("unbanmap", MapCommand.unbanMap);
        bot.registerCommand("resetmaps", MapCommand.unbanMapAll);
        bot.registerCommand("banmap", MapCommand.banMap);
        //bot.registerCommand("defaultMapPool",MapCommand.defaultMapPool); @todo
    }
}