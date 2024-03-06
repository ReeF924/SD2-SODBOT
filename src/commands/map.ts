import { Message } from "discord.js";
import { DiscordBot, MsgHelper } from "../general/discordBot";
import * as Data from "sd2-data"
import { CommonUtil } from "../general/common";
import { Logs } from "../general/logs";
import { MessageEmbed } from "discord.js";
import { map } from "mssql";

export class MapCommand {
    private bans: Map<string, Map<string, boolean>> = new Map<string, Map<string, boolean>>(); // 2d array of playerIds to banned divisions.

    private warnoMaps = [
        "Mount River",
        "Geisa",
        "Death Row",
        "Two Lakes",
        "Vertigo",
        "Two Ways",
        "Black Forest",
        "Ripple",
        "Chemical",
        "Loop"
    ]

    private warnoMaps3v3 = [
        "Two Ways 3v3",
        "Danger Hills 3v3",
        "Mount River 3v3",
        "Volcano 3v3",
        "Triple Strike 3v3",
        "Rift 3v3",
        "Cyrus 3v3",
        "Rocks 3v3",
        "Twin Cities 3v3"
    ]

    private warnoMaps4v4 = [
        "Chemical 4v4",
        "Dark Stream 4v4",
        "Iron Waters 10",
        "Loop 10",
        "Crown 10",
        "Geisa 10"
    ]

    private warnoMapsWaryes2v2 = [
        "Two Lakes",
        "Two Ways 2v2",
        "Vertigo",
        "Chemical 2v2",
        "Ripple",
        "Mount River 3v3",
        "Cyrus 3v3",
        "Loop"
    ]


    // Returns a random map  can be League, 1v1, 2v2, 3v3, 4v4
    private randomMap(message: Message, input: string[]): void {


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

        const importedMapData = Data.maps;
        let maplist: string[] = Data.maps.mapData.sd2League;
        let count = 1;
        Logs.log("command Random Map with Inputs " + JSON.stringify(input));

        if (input.length > 0) {
            const inputArgs = input[0].toLowerCase().split(' ');

            const countArgIndex = inputArgs.findIndex((x) => !isNaN(Number(x)));

            count = countArgIndex == -1 ? 1 : Number(inputArgs.splice(countArgIndex, 1));

            if (count > 9) {
                MsgHelper.reply(message, "Please select less than 10 maps.")
                return;
            }

            if (count < 1) {
                MsgHelper.reply(message, "Please select at least 1 map.")
                return;
            }

            if (inputArgs.length > 0) {
                //not nice, but I won't refactor this rn, you started with this monstrosity
                inputArgs.join(' ');
                const mapType = inputArgs[0].toLowerCase();
                switch (mapType) {
                    case "1v1": maplist = importedMapData.mapData.byPlayerSize[2]; break;
                    case "2v2": maplist = importedMapData.mapData.byPlayerSize[4]; break;
                    case "3v3": maplist = importedMapData.mapData.byPlayerSize[6]; break;
                    case "4v4": maplist = importedMapData.mapData.byPlayerSize[8]; break;

                    case "warno": maplist = this.warnoMaps; break;
                    case "warno 1v1": maplist = this.warnoMaps; break;
                    case "warno 2v2": maplist = this.warnoMaps; break;
                    case "warno 2v2": maplist = this.warnoMapsWaryes2v2; break;
                    case "warno 3v3": maplist = this.warnoMaps3v3; break;
                    case "warno 4v4": maplist = this.warnoMaps4v4; break;


                    default: MsgHelper.reply(message, mapType + " Wrong arguments. For instance try $rmap 1v1 3 or $rmap warno 2v2 3");
                        return
                }
            }
        }
        /*         //check for bans
                if (this.bans[message.member.id]) {
                    for (const key of Object.keys(this.bans[message.member.id])) {
                        maplist = maplist.filter((x) => {
                            return x != key;
                        })
                    }
                } */


        if (maplist.length < count) {
            MsgHelper.reply(message, "There aren't enough maps to pick from. If some are banned, you might wanna unban them. To unban all type $resetmaps");
            return;
        }

        if (count > 1) {
            const maps = getRandomMaps(maplist, count)
            Logs.log(message.author.id + " has picked " + maps.join(",") + " from " + JSON.stringify(maplist) + " side: " + input);
            message.reply(maps.join(", "));
            return;
        }

        const pickIndex = Math.floor(Math.random() * maplist.length);
        const pick = maplist[pickIndex];
        maplist = maplist.filter((x, index) => { return pickIndex != index; });
        message.reply(pick, { files: ["./assets/images/" + pick + ".png"] });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private allMaps(message: Message, input: string[]): void {
        const importedMapData = Data.maps;
        console.log(JSON.stringify(importedMapData));
        const bannedMaps = this.bans[message.author.id];
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


    private unbanMap(message: Message, input: string[]): void {
        if (input.length == 0) {
            MsgHelper.reply(message, `I don't know what that map is, please use ${CommonUtil.config("prefix")}maps, to get the list of all maps.`)
            return;
        }
        if (input[0].toLocaleLowerCase() == "all") {
            this.bans[message.author.id] = null;
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
                    `I don't know what map that is, did you mean ***${CommonUtil.lexicalGuesser(line, mapPool)
                    }*** instead of ***${line}***... It has not been unbanned.`
                );
                return;
            } else {
                this.bans[message.author.id][target[0]] = null;
                Logs.log(message.author.id + " has unbanned " + JSON.stringify(target[0]))
                MsgHelper.reply(message, line + " has been unbanned.")
                let all = false;
                for (const z of Object.values(this.bans[message.author.id])) {
                    console.log(z);
                    all = !!z || all;
                }
                if (!all) this.bans[message.author.id] = null;
            }
        }
    }

    private banMap(message: Message, input: string[]): void {
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
                    `I don't know what map that is, did you mean ***${CommonUtil.lexicalGuesser(line, targetMaps)
                    }*** instead of ***${line}***... It has not been banned.`
                );
                return;
            } else {
                if (!this.bans[message.author.id]) {
                    this.bans[message.author.id] = new Map();
                }
                this.bans[message.author.id][target[0]] = true;
                Logs.log(message.author.id + " has banned " + JSON.stringify(target[0]))
                MsgHelper.reply(message, line + " has been banned.")
            }
        }
        this.allMaps(message, input);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private unbanMapAll(message: Message, input: string[]): void {
        this.unbanMap(message, ["all"]);
    }
    public addCommands(bot: DiscordBot): void {
        bot.registerCommand("rmap", this.randomMap.bind(this));
        bot.registerCommand("allmaps", this.allMaps.bind(this));
        bot.registerCommand("maps", this.allMaps.bind(this));
        bot.registerCommand("unbanmap", this.unbanMap.bind(this));
        bot.registerCommand("resetmaps", this.unbanMapAll.bind(this));
        bot.registerCommand("banmap", this.banMap.bind(this));
        //bot.registerCommand("defaultMapPool",this.defaultMapPool); @todo
    }
}