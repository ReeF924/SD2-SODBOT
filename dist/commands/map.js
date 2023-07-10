"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapCommand = void 0;
const discordBot_1 = require("../general/discordBot");
const Data = require("sd2-data");
const common_1 = require("../general/common");
const logs_1 = require("../general/logs");
const discord_js_1 = require("discord.js");
class MapCommand {
    constructor() {
        this.bans = new Map(); // 2d array of playerIds to banned divisions.
        this.warnoMaps = [
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
        ];
        this.warnoMaps3v3 = [
            "Two Ways 3v3",
            "Danger Hills 3v3",
            "Mount River 3v3",
            "Volcano 3v3",
            "Triple Strike 3v3",
            "Rift 3v3",
            "Cyrus 3v3",
            "Rocks 3v3",
            "Twin Cities 3v3"
        ];
        this.warnoMaps4v4 = [
            "Chemical 4v4",
            "Dark Stream 4v4",
            "Iron Waters 10",
            "Loop 10",
            "Crown 10",
            "Geisa 10"
        ];
        this.warnoMapsWaryes2v2 = [
            "Two Lakes",
            "Two Ways 2v2",
            "Vertigo",
            "Chemical 2v2",
            "Ripple",
            "Mount River 3v3",
            "Cyrus 3v3",
            "Loop"
        ];
    }
    // Returns a random map  can be League, 1v1, 2v2, 3v3, 4v4
    randomMap(message, input) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            function getRandomMaps(mapList, count = 1) {
                let availableMaps = [...mapList];
                let maps = [];
                while (count > 0) {
                    const pickIndex = Math.floor(Math.random() * availableMaps.length);
                    const pick = availableMaps[pickIndex];
                    availableMaps = availableMaps.filter(m => m !== pick);
                    maps.push(pick);
                    count--;
                }
                return maps;
            }
            let maplist = [];
            const importedMapData = Data.maps;
            let pickCount = 1;
            let count = 1;
            logs_1.Logs.log("command Random Map with Inputs " + JSON.stringify(input));
            let size = (_a = input[0]) !== null && _a !== void 0 ? _a : "";
            if (!size.includes("warno") && !size.includes("sd2")) {
                if (size !== "")
                    size += " ";
                size += yield common_1.CommonUtil.getPrimaryGame(message);
            }
            switch (size) {
                case "sd2":
                    maplist = importedMapData.mapData.sd2League;
                    break;
                case "get2 sdl sd2":
                    maplist = importedMapData.mapData.sd2League;
                    count = 2;
                    break;
                case "get3 sdl sd2":
                    maplist = importedMapData.mapData.sd2League;
                    count = 3;
                    break;
                case "get4 sdl sd2":
                    maplist = importedMapData.mapData.sd2League;
                    count = 3;
                    break;
                case "get5 sdl sd2":
                    maplist = importedMapData.mapData.sd2League;
                    count = 5;
                    break;
                case "1v1 sd2":
                    maplist = importedMapData.mapData.byPlayerSize[2];
                    break;
                case "get2 sd2":
                    maplist = importedMapData.mapData.byPlayerSize[2];
                    count = 2;
                    break;
                case "get3 sd2":
                    maplist = importedMapData.mapData.byPlayerSize[2];
                    count = 3;
                    break;
                case "get4 sd2":
                    maplist = importedMapData.mapData.byPlayerSize[2];
                    count = 4;
                    break;
                case "get5 sd2":
                    maplist = importedMapData.mapData.byPlayerSize[2];
                    count = 5;
                    break;
                case "get6 sd2":
                    maplist = importedMapData.mapData.byPlayerSize[2];
                    count = 6;
                    break;
                case "2v2 sd2":
                    maplist = importedMapData.mapData.byPlayerSize[4];
                    break;
                case "get5 2v2 sd2":
                    maplist = importedMapData.mapData.byPlayerSize[4];
                    count = 5;
                    break;
                case "3v3 sd2":
                    maplist = importedMapData.mapData.byPlayerSize[6];
                    break;
                case "4v4 sd2":
                    maplist = importedMapData.mapData.byPlayerSize[8];
                    break;
                case "warno": maplist = this.warnoMaps;
                case "1v1 warno":
                    maplist = this.warnoMaps;
                    break;
                case "get2 warno":
                    maplist = this.warnoMaps;
                    count = 2;
                    break;
                case "get3 warno":
                    maplist = this.warnoMaps;
                    count = 3;
                    break;
                case "get4 warno":
                    maplist = this.warnoMaps;
                    count = 4;
                    break;
                case "get5 warno":
                    maplist = this.warnoMaps;
                    count = 5;
                    break;
                case "2v2 warno":
                    maplist = this.warnoMapsWaryes2v2;
                    break; //ReeF: not sure why warnoMapsWaryes2v2 but whatever
                case "3v3 warno":
                    maplist = this.warnoMaps3v3;
                    break;
                case "4v4 warno":
                    maplist = this.warnoMaps4v4;
                    break;
                case "waryes 2v2 warno":
                    maplist = this.warnoMapsWaryes2v2;
                    break;
                default:
                    discordBot_1.MsgHelper.reply(message, size + " is not a valid map size. for example, 1v1.");
                    return;
            }
            /*         //check for bans
                    if (this.bans[message.member.id]) {
                        for (const key of Object.keys(this.bans[message.member.id])) {
                            maplist = maplist.filter((x) => {
                                return x != key;
                            })
                        }
                    } */
            let picks = 0;
            while (picks < pickCount) {
                if (maplist.length == 0) {
                    discordBot_1.MsgHelper.reply(message, "all maps have been banned. Please unban some maps");
                    break;
                }
                else {
                    if (count > 1) {
                        const maps = getRandomMaps(maplist, count);
                        logs_1.Logs.log(message.author.id + " has picked " + maps.join(",") + " from " + JSON.stringify(maplist) + " side: " + input);
                        message.reply(maps.join(", "));
                        return;
                    }
                    const pickIndex = Math.floor(Math.random() * maplist.length);
                    const pick = maplist[pickIndex];
                    maplist = maplist.filter((x, index) => { return pickIndex != index; });
                    logs_1.Logs.log(message.author.id + " has picked " + pick + " from " + JSON.stringify(maplist) + " side: " + input);
                    message.reply(pick, { files: ["./src/general/images/" + pick + ".png"] });
                }
                picks++;
            }
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    allMaps(message, input) {
        const importedMapData = Data.maps;
        // console.log(JSON.stringify(importedMapData));
        const bannedMaps = this.bans[message.author.id];
        const legaueMaps = importedMapData.mapData.sd2League;
        //Set up discord embed
        let embed = new discord_js_1.MessageEmbed().setTitle(message.author.username + '\'s Maps');
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
            }
            else if (bannedMaps && bannedMaps[maps1]) {
                maps1 = '~~' + maps1 + '~~';
            }
            else if (maps1 && !legaueMaps.includes(maps1)) {
                maps1 += " *";
            }
            if (!maps2) {
                maps2 = "";
            }
            else if (bannedMaps && bannedMaps[maps2]) {
                maps2 = '~~' + maps2 + '~~';
            }
            if (!maps3) {
                maps3 = "";
            }
            else if (bannedMaps && bannedMaps[maps3]) {
                maps3 = '~~' + maps3 + '~~';
            }
            if (!maps4) {
                maps4 = "";
            }
            else if (bannedMaps && bannedMaps[maps4]) {
                maps4 = '~~' + maps4 + '~~';
            }
            text1v1 += maps1 + "\n";
            text2v2 += maps2 + "\n";
            text3v3 += maps3 + "\n";
            text4v4 += maps4 + "\n";
        }
        embed = embed.addFields({ name: "1v1", value: text1v1, inline: true }, { name: "2v2", value: text2v2, inline: true }, { name: "3v3", value: text3v3, inline: true }, { name: "4v4", value: text4v4, inline: true });
        embed = embed.setFooter("Maps are stike-through'd when banned\n* maps are not in the league pool (rmap without specifying 1v1)");
        message.channel.send(embed);
    }
    unbanMap(message, input) {
        if (input.length == 0) {
            discordBot_1.MsgHelper.reply(message, `I don't know what that map is, please use ${common_1.CommonUtil.config("prefix")}maps, to get the list of all maps.`);
            return;
        }
        if (input[0].toLocaleLowerCase() == "all") {
            this.bans[message.author.id] = null;
            logs_1.Logs.log(message.author.id + " has unbanned all maps");
            discordBot_1.MsgHelper.reply(message, 'unbanned all maps');
            return;
        }
        for (const line of input) {
            const mapPool = Data.maps.allMapNames;
            const target = mapPool.filter((x) => {
                return 0 == line.toLocaleLowerCase().localeCompare(x.toLocaleLowerCase());
            });
            if (target.length == 0) {
                discordBot_1.MsgHelper.say(message, `I don't know what map that is, did you mean ***${common_1.CommonUtil.lexicalGuesser(line, mapPool)}*** instead of ***${line}***... It has not been unbanned.`);
                return;
            }
            else {
                this.bans[message.author.id][target[0]] = null;
                logs_1.Logs.log(message.author.id + " has unbanned " + JSON.stringify(target[0]));
                discordBot_1.MsgHelper.reply(message, line + " has been unbanned.");
                let all = false;
                for (const z of Object.values(this.bans[message.author.id])) {
                    console.log(z);
                    all = !!z || all;
                }
                if (!all)
                    this.bans[message.author.id] = null;
            }
        }
    }
    banMap(message, input) {
        if (input.length == 0) {
            discordBot_1.MsgHelper.reply(message, `Please specify a map to ban. Use ${common_1.CommonUtil.config("prefix")}maps, to get the list of all maps.`);
            return;
        }
        for (const line of input) {
            const targetMaps = Data.maps.allMapNames;
            const target = targetMaps.filter((x) => {
                return 0 == line.toLocaleLowerCase().localeCompare(x.toLocaleLowerCase());
            });
            if (target.length == 0) {
                discordBot_1.MsgHelper.say(message, `I don't know what map that is, did you mean ***${common_1.CommonUtil.lexicalGuesser(line, targetMaps)}*** instead of ***${line}***... It has not been banned.`);
                return;
            }
            else {
                if (!this.bans[message.author.id]) {
                    this.bans[message.author.id] = new Map();
                }
                this.bans[message.author.id][target[0]] = true;
                logs_1.Logs.log(message.author.id + " has banned " + JSON.stringify(target[0]));
                discordBot_1.MsgHelper.reply(message, line + " has been banned.");
            }
        }
        this.allMaps(message, input);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    unbanMapAll(message, input) {
        this.unbanMap(message, ["all"]);
    }
    addCommands(bot) {
        bot.registerCommand("rmap", this.randomMap.bind(this));
        bot.registerCommand("allmaps", this.allMaps);
        bot.registerCommand("maps", this.allMaps);
        bot.registerCommand("unbanmap", this.unbanMap);
        bot.registerCommand("resetmaps", this.unbanMapAll);
        bot.registerCommand("banmap", this.banMap);
        //bot.registerCommand("defaultMapPool",this.defaultMapPool); @todo
    }
}
exports.MapCommand = MapCommand;
//# sourceMappingURL=map.js.map