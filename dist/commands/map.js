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
exports.MapCommandHelper = exports.MapCommand = void 0;
var discordBot_1 = require("../general/discordBot");
var Data = require("sd2-data");
var common_1 = require("../general/common");
var logs_1 = require("../general/logs");
var discord_js_1 = require("discord.js");
var MapCommand = /** @class */ (function () {
    function MapCommand() {
    }
    // Returns a random map  can be League, 1v1, 2v2, 3v3, 4v4
    MapCommand.randomMap = function (message, input) {
        function getRandomMaps(mapList, count) {
            if (count === void 0) { count = 1; }
            var availableMaps = __spreadArray([], mapList, true);
            var maps = [];
            var _loop_3 = function () {
                var pickIndex = Math.floor(Math.random() * availableMaps.length);
                var pick = availableMaps[pickIndex];
                availableMaps = availableMaps.filter(function (m) { return m !== pick; });
                maps.push(pick);
                count--;
            };
            while (count > 0) {
                _loop_3();
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
                case "3v3":
                    maplist = importedMapData.mapData.byPlayerSize[6];
                    break;
                case "4v4":
                    maplist = importedMapData.mapData.byPlayerSize[8];
                    break;
                case "warno":
                    maplist = MapCommand.warnoMaps;
                    break;
                case "warno 1v1":
                    maplist = MapCommand.warnoMaps;
                    break;
                case "warno 2v2":
                    maplist = MapCommand.warnoMaps;
                    break;
                case "warno 3v3":
                    maplist = MapCommand.warnoMaps3v3;
                    break;
                case "warno 4v4":
                    maplist = MapCommand.warnoMaps4v4;
                    break;
                default:
                    discordBot_1.MsgHelper.reply(message, size + " is not a valid map size. for example, 1v1.");
                    return;
            }
        }
        //check for bans
        if (MapCommand.bans[message.member.id]) {
            var _loop_1 = function (key) {
                maplist = maplist.filter(function (x) {
                    return x != key;
                });
            };
            for (var _i = 0, _a = Object.keys(MapCommand.bans[message.member.id]); _i < _a.length; _i++) {
                var key = _a[_i];
                _loop_1(key);
            }
        }
        var picks = 0;
        var _loop_2 = function () {
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
            var state_1 = _loop_2();
            if (typeof state_1 === "object")
                return state_1.value;
            if (state_1 === "break")
                break;
        }
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    MapCommand.allMaps = function (message, input) {
        var importedMapData = Data.maps;
        console.log(JSON.stringify(importedMapData));
        var bannedMaps = MapCommand.bans[message.author.id];
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
    MapCommand.unbanMap = function (message, input) {
        if (input.length == 0) {
            discordBot_1.MsgHelper.reply(message, "I don't know what that map is, please use ".concat(common_1.CommonUtil.config("prefix"), "maps, to get the list of all maps."));
            return;
        }
        if (input[0].toLocaleLowerCase() == "all") {
            MapCommand.bans[message.author.id] = null;
            logs_1.Logs.log(message.author.id + " has unbanned all maps");
            discordBot_1.MsgHelper.reply(message, 'unbanned all maps');
            return;
        }
        var _loop_4 = function (line) {
            var mapPool = Data.maps.allMapNames;
            var target = mapPool.filter(function (x) {
                return 0 == line.toLocaleLowerCase().localeCompare(x.toLocaleLowerCase());
            });
            if (target.length == 0) {
                discordBot_1.MsgHelper.say(message, "I don't know what map that is, did you mean ***".concat(common_1.CommonUtil.lexicalGuesser(line, mapPool), "*** instead of ***").concat(line, "***... It has not been unbanned."));
                return { value: void 0 };
            }
            else {
                MapCommand.bans[message.author.id][target[0]] = null;
                logs_1.Logs.log(message.author.id + " has unbanned " + JSON.stringify(target[0]));
                discordBot_1.MsgHelper.reply(message, line + " has been unbanned.");
                var all = false;
                for (var _a = 0, _b = Object.values(MapCommand.bans[message.author.id]); _a < _b.length; _a++) {
                    var z = _b[_a];
                    console.log(z);
                    all = !!z || all;
                }
                if (!all)
                    MapCommand.bans[message.author.id] = null;
            }
        };
        for (var _i = 0, input_1 = input; _i < input_1.length; _i++) {
            var line = input_1[_i];
            var state_2 = _loop_4(line);
            if (typeof state_2 === "object")
                return state_2.value;
        }
    };
    MapCommand.banMap = function (message, input) {
        if (input.length == 0) {
            discordBot_1.MsgHelper.reply(message, "Please specify a map to ban. Use ".concat(common_1.CommonUtil.config("prefix"), "maps, to get the list of all maps."));
            return;
        }
        var _loop_5 = function (line) {
            var targetMaps = Data.maps.allMapNames;
            var target = targetMaps.filter(function (x) {
                return 0 == line.toLocaleLowerCase().localeCompare(x.toLocaleLowerCase());
            });
            if (target.length == 0) {
                discordBot_1.MsgHelper.say(message, "I don't know what map that is, did you mean ***".concat(common_1.CommonUtil.lexicalGuesser(line, targetMaps), "*** instead of ***").concat(line, "***... It has not been banned."));
                return { value: void 0 };
            }
            else {
                if (!MapCommand.bans[message.author.id]) {
                    MapCommand.bans[message.author.id] = new Map();
                }
                MapCommand.bans[message.author.id][target[0]] = true;
                logs_1.Logs.log(message.author.id + " has banned " + JSON.stringify(target[0]));
                discordBot_1.MsgHelper.reply(message, line + " has been banned.");
            }
        };
        for (var _i = 0, input_2 = input; _i < input_2.length; _i++) {
            var line = input_2[_i];
            var state_3 = _loop_5(line);
            if (typeof state_3 === "object")
                return state_3.value;
        }
        MapCommand.allMaps(message, input);
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    MapCommand.unbanMapAll = function (message, input) {
        MapCommand.unbanMap(message, ["all"]);
    };
    MapCommand.bans = new Map(); // 2d array of playerIds to banned divisions.
    MapCommand.warnoMaps = [
        "Death Row",
        "Two Way",
        "Two Lakes",
        "Black Forest",
        "Vertigo"
    ];
    MapCommand.warnoMaps3v3 = [
        "Danger Hills",
        "Mount River",
        "Triple Strike"
    ];
    MapCommand.warnoMaps4v4 = [
        "Chemical",
        "Iron Waters",
        "Loop",
        "Geisa"
    ];
    return MapCommand;
}());
exports.MapCommand = MapCommand;
var MapCommandHelper = /** @class */ (function () {
    function MapCommandHelper() {
    }
    MapCommandHelper.addCommands = function (bot) {
        bot.registerCommand("rmap", MapCommand.randomMap);
        bot.registerCommand("allmaps", MapCommand.allMaps);
        bot.registerCommand("maps", MapCommand.allMaps);
        bot.registerCommand("unbanmap", MapCommand.unbanMap);
        bot.registerCommand("resetmaps", MapCommand.unbanMapAll);
        bot.registerCommand("banmap", MapCommand.banMap);
        //bot.registerCommand("defaultMapPool",MapCommand.defaultMapPool); @todo
    };
    return MapCommandHelper;
}());
exports.MapCommandHelper = MapCommandHelper;
//# sourceMappingURL=map.js.map