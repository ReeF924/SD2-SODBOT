"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapCommand = void 0;
var discordBot_1 = require("../general/discordBot");
var Data = require("sd2-data");
var common_1 = require("../general/common");
var logs_1 = require("../general/logs");
var discord_js_1 = require("discord.js");
var MapCommand = /** @class */ (function () {
    function MapCommand() {
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
    MapCommand.prototype.randomMap = function (message, input) {
        function getRandomMaps(mapList, count) {
            if (count === void 0) { count = 1; }
            var availableMaps = __spreadArray([], mapList, true);
            var maps = [];
            var _loop_2 = function () {
                var pickIndex = Math.floor(Math.random() * availableMaps.length);
                var pick = availableMaps[pickIndex];
                availableMaps = availableMaps.filter(function (m) { return m !== pick; });
                maps.push(pick);
                count--;
            };
            while (count > 0) {
                _loop_2();
            }
            return maps;
        }
        var maplist = [];
        var importedMapData = Data.maps;
        var pickCount = 1;
        var count = 1;
        logs_1.Logs.log("command Random Map with Inputs " + JSON.stringify(input));
        if (input.length == 0) {
            maplist = importedMapData.mapData.sd2League;
        }
        else {
            var size = input[0].toLowerCase();
            switch (size) {
                case "1v1":
                    maplist = importedMapData.mapData.byPlayerSize[2];
                    break;
                case "get2":
                    maplist = importedMapData.mapData.byPlayerSize[2];
                    count = 2;
                    break;
                case "get3":
                    maplist = importedMapData.mapData.byPlayerSize[2];
                    count = 3;
                    break;
                case "get4":
                    maplist = importedMapData.mapData.byPlayerSize[2];
                    count = 4;
                    break;
                case "get5":
                    maplist = importedMapData.mapData.byPlayerSize[2];
                    count = 5;
                    break;
                case "get6":
                    maplist = importedMapData.mapData.byPlayerSize[2];
                    count = 6;
                    break;
                case "2v2":
                    maplist = importedMapData.mapData.byPlayerSize[4];
                    break;
                case "get5 2v2":
                    maplist = importedMapData.mapData.byPlayerSize[4];
                    count = 5;
                    break;
                case "3v3":
                    maplist = importedMapData.mapData.byPlayerSize[6];
                    break;
                case "4v4":
                    maplist = importedMapData.mapData.byPlayerSize[8];
                    break;
                case "warno":
                    maplist = this.warnoMaps;
                    break;
                case "warno 1v1":
                    maplist = this.warnoMaps;
                    break;
                case "warno 2v2":
                    maplist = this.warnoMaps;
                    break;
                case "warno 3v3":
                    maplist = this.warnoMaps3v3;
                    break;
                case "warno 4v4":
                    maplist = this.warnoMaps4v4;
                    break;
                case "warno waryes 2v2":
                    maplist = this.warnoMapsWaryes2v2;
                    break;
                default:
                    discordBot_1.MsgHelper.reply(message, size + " is not a valid map size. for example, 1v1.");
                    return;
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
        var picks = 0;
        var _loop_1 = function () {
            if (maplist.length == 0) {
                discordBot_1.MsgHelper.reply(message, "all maps have been banned. Please unban some maps");
                return "break";
            }
            else {
                if (count > 1) {
                    var maps = getRandomMaps(maplist, count);
                    logs_1.Logs.log(message.author.id + " has picked " + maps.join(",") + " from " + JSON.stringify(maplist) + " side: " + input);
                    message.reply(maps.join(", "));
                    return { value: void 0 };
                }
                var pickIndex_1 = Math.floor(Math.random() * maplist.length);
                var pick = maplist[pickIndex_1];
                maplist = maplist.filter(function (x, index) { return pickIndex_1 != index; });
                logs_1.Logs.log(message.author.id + " has picked " + pick + " from " + JSON.stringify(maplist) + " side: " + input);
                message.reply(pick, { files: ["./src/general/images/" + pick + ".png"] });
            }
            picks++;
        };
        while (picks < pickCount) {
            var state_1 = _loop_1();
            if (typeof state_1 === "object")
                return state_1.value;
            if (state_1 === "break")
                break;
        }
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    MapCommand.prototype.allMaps = function (message, input) {
        var importedMapData = Data.maps;
        // console.log(JSON.stringify(importedMapData));
        var bannedMaps = this.bans[message.author.id];
        var legaueMaps = importedMapData.mapData.sd2League;
        //Set up discord embed
        var embed = new discord_js_1.MessageEmbed().setTitle(message.author.username + '\'s Maps');
        var text1v1 = "";
        var text2v2 = "";
        var text3v3 = "";
        var text4v4 = "";
        for (var i = 0; i < importedMapData.mapData.byPlayerSize[2].length; i++) { //this needs to be rewritten into 4 loops.
            var maps1 = importedMapData.mapData.byPlayerSize[2][i];
            var maps2 = importedMapData.mapData.byPlayerSize[4][i];
            var maps3 = importedMapData.mapData.byPlayerSize[6][i];
            var maps4 = importedMapData.mapData.byPlayerSize[8][i];
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
    };
    MapCommand.prototype.unbanMap = function (message, input) {
        if (input.length == 0) {
            discordBot_1.MsgHelper.reply(message, "I don't know what that map is, please use ".concat(common_1.CommonUtil.config("prefix"), "maps, to get the list of all maps."));
            return;
        }
        if (input[0].toLocaleLowerCase() == "all") {
            this.bans[message.author.id] = null;
            logs_1.Logs.log(message.author.id + " has unbanned all maps");
            discordBot_1.MsgHelper.reply(message, 'unbanned all maps');
            return;
        }
        var _loop_3 = function (line) {
            var mapPool = Data.maps.allMapNames;
            var target = mapPool.filter(function (x) {
                return 0 == line.toLocaleLowerCase().localeCompare(x.toLocaleLowerCase());
            });
            if (target.length == 0) {
                discordBot_1.MsgHelper.say(message, "I don't know what map that is, did you mean ***".concat(common_1.CommonUtil.lexicalGuesser(line, mapPool), "*** instead of ***").concat(line, "***... It has not been unbanned."));
                return { value: void 0 };
            }
            else {
                this_1.bans[message.author.id][target[0]] = null;
                logs_1.Logs.log(message.author.id + " has unbanned " + JSON.stringify(target[0]));
                discordBot_1.MsgHelper.reply(message, line + " has been unbanned.");
                var all = false;
                for (var _a = 0, _b = Object.values(this_1.bans[message.author.id]); _a < _b.length; _a++) {
                    var z = _b[_a];
                    console.log(z);
                    all = !!z || all;
                }
                if (!all)
                    this_1.bans[message.author.id] = null;
            }
        };
        var this_1 = this;
        for (var _i = 0, input_1 = input; _i < input_1.length; _i++) {
            var line = input_1[_i];
            var state_2 = _loop_3(line);
            if (typeof state_2 === "object")
                return state_2.value;
        }
    };
    MapCommand.prototype.banMap = function (message, input) {
        if (input.length == 0) {
            discordBot_1.MsgHelper.reply(message, "Please specify a map to ban. Use ".concat(common_1.CommonUtil.config("prefix"), "maps, to get the list of all maps."));
            return;
        }
        var _loop_4 = function (line) {
            var targetMaps = Data.maps.allMapNames;
            var target = targetMaps.filter(function (x) {
                return 0 == line.toLocaleLowerCase().localeCompare(x.toLocaleLowerCase());
            });
            if (target.length == 0) {
                discordBot_1.MsgHelper.say(message, "I don't know what map that is, did you mean ***".concat(common_1.CommonUtil.lexicalGuesser(line, targetMaps), "*** instead of ***").concat(line, "***... It has not been banned."));
                return { value: void 0 };
            }
            else {
                if (!this_2.bans[message.author.id]) {
                    this_2.bans[message.author.id] = new Map();
                }
                this_2.bans[message.author.id][target[0]] = true;
                logs_1.Logs.log(message.author.id + " has banned " + JSON.stringify(target[0]));
                discordBot_1.MsgHelper.reply(message, line + " has been banned.");
            }
        };
        var this_2 = this;
        for (var _i = 0, input_2 = input; _i < input_2.length; _i++) {
            var line = input_2[_i];
            var state_3 = _loop_4(line);
            if (typeof state_3 === "object")
                return state_3.value;
        }
        this.allMaps(message, input);
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    MapCommand.prototype.unbanMapAll = function (message, input) {
        this.unbanMap(message, ["all"]);
    };
    MapCommand.prototype.addCommands = function (bot) {
        bot.registerCommand("rmap", this.randomMap);
        bot.registerCommand("allmaps", this.allMaps);
        bot.registerCommand("maps", this.allMaps);
        bot.registerCommand("unbanmap", this.unbanMap);
        bot.registerCommand("resetmaps", this.unbanMapAll);
        bot.registerCommand("banmap", this.banMap);
        //bot.registerCommand("defaultMapPool",this.defaultMapPool); @todo
    };
    return MapCommand;
}());
exports.MapCommand = MapCommand;
//# sourceMappingURL=map.js.map