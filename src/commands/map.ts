import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { DiscordBot, MsgHelper } from "../general/discordBot";
import * as Data from "sd2-data"
import { CommonUtil } from "../general/common";
import { Logs } from "../general/logs";
import * as fs from "fs";

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
        "Loop",
        "Airport",
        "Hesse",
        "Urban Frontlines"
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
        "Loop",
        "Urban frontlines"
    ]


    // Returns a random map  can be League, 1v1, 2v2, 3v3, 4v4
    private randomMap(input: ChatInputCommandInteraction): void {


        function getRandomMaps(mapList: String[], count: number): String[] {
            let availableMaps = [...mapList];
            let maps: String[] = [];

            // const includeBanned = input.options.getBoolean("banned") ?? true;

            // if (!includeBanned) {
            //     const bannedMaps = this.bans[input.user.id];
            //
            //     if (bannedMaps) {
            //         availableMaps = availableMaps.filter(map => !bannedMaps.includes(map));
            //     }
            // }

            for (count; count > 0; count--) {
                const pickIndex = Math.floor(Math.random() * availableMaps.length)
                const pick = availableMaps[pickIndex]
                availableMaps = availableMaps.filter(m => m !== pick)
                maps.push(pick)
            }

            return maps;
        }

        const importedMapData = Data.maps;
        let maplist: string[] = Data.maps.mapData.sd2League;


        const mapType = input.options.getString("type") ?? "1v1";


        switch (mapType) {
            case "1v1": maplist = importedMapData.mapData.byPlayerSize[2]; break;
            case "2v2": maplist = importedMapData.mapData.byPlayerSize[4]; break;
            case "3v3": maplist = importedMapData.mapData.byPlayerSize[6]; break;
            case "4v4": maplist = importedMapData.mapData.byPlayerSize[8]; break;

            case "warno 1v1": maplist = this.warnoMaps; break;
            case "warno 2v2": maplist = this.warnoMapsWaryes2v2; break;
            case "warno 3v3": maplist = this.warnoMaps3v3; break;
            case "warno 4v4": maplist = this.warnoMaps4v4; break;

            default: MsgHelper.reply(input, "Wrong arguments."); return;
        }
        const mapCount = input.options.getInteger("count") ?? 1;

        if (maplist.length < mapCount) {
            MsgHelper.reply(input, `There aren't enough maps to pick from. There are ${maplist.length} maps in the pool.`);
            return;
        }

        if (mapCount > 1) {
            const maps = getRandomMaps(maplist, mapCount)
            MsgHelper.reply(input, maps.join(", "));
            return;
        }

        const pickIndex = Math.floor(Math.random() * maplist.length);
        const pick = maplist[pickIndex];

        fs.existsSync("./assets/images/" + pick + ".png")
            ? input.reply({ content: pick, files: ["./assets/images/" + pick + ".png"] })
            : input.reply(pick);
    }
    private allMaps(input: ChatInputCommandInteraction): void {
        const importedMapData = Data.maps;
        console.log(JSON.stringify(importedMapData));
        const bannedMaps = this.bans[input.user.id];
        const legaueMaps = importedMapData.mapData.sd2League;
        //Set up discord embed
        let embed = new EmbedBuilder().setTitle(input.user.username + '\'s Maps')
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
        // embed = embed.setFooter("Maps are stike-through'd when banned\n* maps are not in the league pool (rmap without specifying 1v1)")
        embed = embed.setFooter({ text: "Maps are stike-through'd when banned\n* maps are not in the league pool (rmap without specifying 1v1)" });

        MsgHelper.sendEmbeds(input, [embed]);
    }

    /*
    private unbanMap(chatInput: ChatInputCommandInteraction): void {
        // if (input.length == 0) {
        //     MsgHelper.replyPing(message, `I don't know what that map is, please use ${CommonUtil.config("prefix")}maps, to get the list of all maps.`)
        //     return;
        // }

        const map = chatInput.options.getString("map", true);

        if (map == "all") {
            this.bans[chatInput.user.id] = null;
            Logs.log(chatInput.user.id + " has unbanned all maps");
            MsgHelper.reply(chatInput, 'unbanned all maps');
            return;
        }

        const input = map.split(",");

        for (let line of input) {
            line = line.toLocaleLowerCase().trim();
            const mapPool = Data.maps.allMapNames;
            const target = mapPool.filter((x) => {
                return 0 == line.localeCompare(x.toLocaleLowerCase());
            })
            if (target.length == 0) {
                MsgHelper.say(
                    chatInput,
                    `I don't know what map that is, did you mean ***${CommonUtil.lexicalGuesser(line, mapPool)
                    }*** instead of ***${line}***... It has not been unbanned.`
                );
                return;
            } else {
                this.bans[chatInput.user.id][target[0]] = null;
                Logs.log(chatInput.user.id + " has unbanned " + JSON.stringify(target[0]))
                MsgHelper.reply(chatInput, line + " has been unbanned.")
                let all = false;
                for (const z of Object.values(this.bans[chatInput.user.id])) {
                    console.log(z);
                    all = !!z || all;
                }
                if (!all) this.bans[chatInput.user.id] = null;
            }
        }
    }

    private banMap(input: ChatInputCommandInteraction): void {
        const maps = input.options.getString("map", true).split(",");

        for (let line of maps) {
            line = line.toLocaleLowerCase().trim();
            const targetMaps = Data.maps.allMapNames;
            const target = targetMaps.filter((x) => {
                return 0 == line.toLocaleLowerCase().localeCompare(x.toLocaleLowerCase());
            })
            if (target.length == 0) {
                MsgHelper.say(
                    input,
                    `I don't know what map that is, did you mean ***${CommonUtil.lexicalGuesser(line, targetMaps)
                    }*** instead of ***${line}***... It has not been banned.`
                );
                return;
            } else {
                if (!this.bans[input.user.id]) {
                    this.bans[input.user.id] = new Map();
                }
                this.bans[input.user.id][target[0]] = true;
                Logs.log(input.user.id + " has banned " + JSON.stringify(target[0]))
                MsgHelper.reply(input, line + " has been banned.")
            }
        }
    }
     */
    public addCommands(bot: DiscordBot): void {

        const rmap: SlashCommandBuilder = new SlashCommandBuilder().setName("rmap").setDescription("Random map picker");

        //@todo check if it shows the options, otherwise show an example in description for warno
        rmap.addStringOption((option) => option.setName("type").setDescription("Map type. Default: 1v1").setRequired(false)
            .addChoices({ name: "1v1", value: "1v1" }, { name: "2v2", value: "2v2" }, { name: "3v3", value: "3v3" },
                { name: "4v4", value: "4v4" }, { name: "warno 1v1", value: "warno 1v1" },
                { name: "warno 2v2", value: "warno 2v2" }, { name: "warno 3v3", value: "warno 3v3" },
                { name: "warno 4v4", value: "warno 4v4" }))
            .addIntegerOption(option => option.setName("count").setDescription("Number of maps to pick. Default: 1")
                .setRequired(false).setMinValue(1).setMaxValue(10))
            .addBooleanOption(option => option.setName("banned").setDescription("Include banned maps. Default: True")
                .setRequired(false));

        bot.registerCommand(rmap, this.randomMap.bind(this));

        const maps = new SlashCommandBuilder().setName("allmaps").setDescription("List all maps");
        bot.registerCommand(maps, this.allMaps.bind(this));

        //@todo I don't even know if warno is somehow implemented..
        //for you can only ban and unban one map per command, wanna fix that later
        //const unbanMap = new SlashCommandBuilder().setName("unbanmap").setDescription("Unban a map");
        //unbanMap.addStringOption(option => option.setName("map").setDescription("Map to unban. 'All' unbans all maps. Seperate multiple maps with comma.").setRequired(true));
        //bot.registerCommand(unbanMap, this.unbanMap.bind(this));

        //const banMap = new SlashCommandBuilder().setName("banmap").setDescription("Ban a map");
        //banMap.addStringOption(option => option.setName("map").setDescription("Map to ban. Seperate multiple maps with comma.").setRequired(true));

        //bot.registerCommand(banMap, this.banMap.bind(this));
        //bot.registerCommand("defaultMapPool",this.defaultMapPool); @todo
    }
}