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
exports.DivisionCommandHelper = exports.DivisionCommand = void 0;
var discordBot_1 = require("../general/discordBot");
var sd2_data_1 = require("sd2-data");
var common_1 = require("../general/common");
var logs_1 = require("../general/logs");
var discord_js_1 = require("discord.js");
//@todo clean up array mess in this file created by addition of divsion alias names.
var DivisionCommand = /** @class */ (function () {
    function DivisionCommand() {
    }
    DivisionCommand.randomDiv = function (message, input) {
        var divs;
        logs_1.Logs.log("command Random Division with Inputs " + JSON.stringify(input));
        if (input.length == 0) {
            divs = __spreadArray(__spreadArray([], sd2_data_1.divisions.divisionsAllies, true), sd2_data_1.divisions.divisionsAxis, true);
        }
        else {
            var side = input[0].toLowerCase();
            if (side !== "axis" && side !== "allies" && side !== "warno") {
                discordBot_1.MsgHelper.reply(message, "Unknown faction, please specify 'axis' or 'allies' or 'warno' as a faction if you want to pick a certain faction or choose a warno division.");
                return;
            }
            if (side == "allies")
                divs = sd2_data_1.divisions.divisionsAllies;
            if (side == "axis")
                divs = sd2_data_1.divisions.divisionsAxis;
            if (side == "warno")
                divs = __spreadArray(__spreadArray([], sd2_data_1.divisions.divisionsNato, true), sd2_data_1.divisions.divisionsPact, true);
        }
        //check for bans
        if (DivisionCommand.bans[message.member.id]) {
            var _loop_1 = function (key) {
                divs = divs.filter(function (x) {
                    return x.id != Number(key);
                });
            };
            for (var _i = 0, _a = Object.keys(DivisionCommand.bans[message.member.id]); _i < _a.length; _i++) {
                var key = _a[_i];
                _loop_1(key);
            }
        }
        if (divs.length == 0)
            discordBot_1.MsgHelper.reply(message, "all divisions have been banned. Please unban some divisions");
        else {
            var pick = Math.floor(Math.random() * divs.length);
            var pickname = divs[pick].name;
            logs_1.Logs.log(message.author.id + " has picked " + pickname + " from " + JSON.stringify(divs) + " side: " + input);
            discordBot_1.MsgHelper.reply(message, pickname);
        }
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    DivisionCommand.allDivs = function (message, input) {
        var allieddivs = "";
        var axisdivs = "";
        for (var i = 0; i < sd2_data_1.divisions.divisionsAllies.length; i++) {
            if (sd2_data_1.divisions.divisionsAllies[i])
                allieddivs += sd2_data_1.divisions.divisionsAllies[i].name + '\n';
            //if(divisions.divisionsAllies[i]) alliedalias = divisions.divisionsAllies[i].alias;
            if (sd2_data_1.divisions.divisionsAxis[i])
                axisdivs += sd2_data_1.divisions.divisionsAxis[i].name + '\n';
            //if(divisions.divisionsAxis[i]) axisalias = divisions.divisionsAxis[i].alias;
        }
        var alliedembed = new discord_js_1.MessageEmbed().setTitle("-- All Divisions --");
        alliedembed = alliedembed.addFields({ name: "Allied Divisions", value: allieddivs, inline: true });
        message.channel.send(alliedembed);
        var axisembed = new discord_js_1.MessageEmbed();
        axisembed = axisembed.addFields({ name: "Axis Divisions", value: axisdivs, inline: true });
        message.channel.send(axisembed);
    };
    DivisionCommand.unbanDivision = function (message, input) {
        if (input.length == 0) {
            discordBot_1.MsgHelper.reply(message, "I don't know what that division is, please use ".concat(common_1.CommonUtil.config("prefix"), "alldivs, to get the list of divisions."));
            return;
        }
        if (input[0].toLocaleLowerCase() == "all") {
            DivisionCommand.bans[message.author.id] = null;
            logs_1.Logs.log(message.author.id + " has unbanned all");
            discordBot_1.MsgHelper.reply(message, 'unbanned all divisions');
            return;
        }
        var _loop_2 = function (line) {
            var divs = __spreadArray(__spreadArray([], sd2_data_1.divisions.divisionsAllies, true), sd2_data_1.divisions.divisionsAxis, true);
            var target = divs.filter(function (x) {
                return 0 == line.toLocaleLowerCase().localeCompare(x.name.toLocaleLowerCase());
            });
            if (target.length == 0) {
                var target_1 = divs.filter(function (x) {
                    for (var _i = 0, _a = x.alias; _i < _a.length; _i++) {
                        var i = _a[_i];
                        if (0 == i.toLocaleLowerCase().localeCompare(line.toLocaleLowerCase()))
                            return true;
                    }
                    return false;
                });
            }
            if (target.length == 0) {
                discordBot_1.MsgHelper.say(message, "I don't know what that division is, did you mean ***".concat(common_1.CommonUtil.lexicalGuesser(line, divs.map(function (x) { return x["name"]; })), "*** instead of ***").concat(line, "***... It has not been unbanned."));
                return { value: void 0 };
            }
            else {
                DivisionCommand.bans[message.author.id][target[0].id] = null;
                logs_1.Logs.log(message.author.id + " has unbanned " + JSON.stringify(target[0]));
                discordBot_1.MsgHelper.reply(message, target[0].name + " has been unbanned.");
                var all = false;
                for (var _a = 0, _b = DivisionCommand.bans[message.author.id]; _a < _b.length; _a++) {
                    var z = _b[_a];
                    all = z || all;
                }
                console.log(all);
                if (!all)
                    DivisionCommand.bans[message.author.id] = null;
            }
        };
        for (var _i = 0, input_1 = input; _i < input_1.length; _i++) {
            var line = input_1[_i];
            var state_1 = _loop_2(line);
            if (typeof state_1 === "object")
                return state_1.value;
        }
    };
    DivisionCommand.banDivision = function (message, input) {
        if (input.length == 0) {
            discordBot_1.MsgHelper.reply(message, "Please specify a division to ban. Use ".concat(common_1.CommonUtil.config("prefix"), "alldivs, to get the list of divisions."));
            return;
        }
        var _loop_3 = function (line) {
            var divs = __spreadArray(__spreadArray([], sd2_data_1.divisions.divisionsAllies, true), sd2_data_1.divisions.divisionsAxis, true);
            var target = divs.filter(function (x) {
                return 0 == line.toLocaleLowerCase().localeCompare(x.name.toLocaleLowerCase());
            });
            if (target.length == 0) {
                target = divs.filter(function (x) {
                    for (var _i = 0, _a = x.alias; _i < _a.length; _i++) {
                        var i = _a[_i];
                        if (0 == i.toLocaleLowerCase().localeCompare(line.toLocaleLowerCase()))
                            return true;
                    }
                    return false;
                });
            }
            if (target.length == 0) {
                discordBot_1.MsgHelper.say(message, "I don't know what that division is, did you mean ***".concat(common_1.CommonUtil.lexicalGuesser(line, divs.map(function (x) { return x["name"]; })), "*** instead of ***").concat(line, "***... It has not been banned."));
                console.log(JSON.stringify(divs.map(function (x) { return x["name"]; })));
                return { value: void 0 };
            }
            else {
                if (!DivisionCommand.bans[message.author.id]) {
                    DivisionCommand.bans[message.author.id] = new Map();
                }
                DivisionCommand.bans[message.author.id][target[0].id] = true;
                logs_1.Logs.log(message.author.id + " has banned " + JSON.stringify(target[0]));
                discordBot_1.MsgHelper.reply(message, target[0].name + " has been banned.");
            }
        };
        for (var _i = 0, input_2 = input; _i < input_2.length; _i++) {
            var line = input_2[_i];
            var state_2 = _loop_3(line);
            if (typeof state_2 === "object")
                return state_2.value;
        }
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    DivisionCommand.unbanDivisionAll = function (message, input) {
        DivisionCommand.unbanDivision(message, ["all"]);
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    DivisionCommand.bannedDivisions = function (message, input) {
        var bannedDivs = DivisionCommand.bans[message.author.id];
        if (!bannedDivs) {
            discordBot_1.MsgHelper.reply(message, "You have no banned Divisions");
            return;
        }
        else {
            var divs = __spreadArray(__spreadArray([], sd2_data_1.divisions.divisionsAllies, true), sd2_data_1.divisions.divisionsAxis, true);
            var divString = [];
            var _loop_4 = function (x) {
                console.log(x);
                divString.push(divs.find(function (y) {
                    return y["id"] == Number(x);
                }).name);
            };
            for (var _i = 0, _a = Object.keys(bannedDivs); _i < _a.length; _i++) {
                var x = _a[_i];
                _loop_4(x);
            }
            var ret = "You have Banned: ";
            for (var _b = 0, divString_1 = divString; _b < divString_1.length; _b++) {
                var name_1 = divString_1[_b];
                ret += "`" + name_1 + "`,";
            }
            ret = ret.slice(0, ret.length - 1);
            logs_1.Logs.log(message.author.id + " requested list of banned divisions " + JSON.stringify(bannedDivs));
            discordBot_1.MsgHelper.reply(message, ret);
        }
    };
    DivisionCommand.bans = new Map(); // 2d array of playerIds to banned divisions.
    return DivisionCommand;
}());
exports.DivisionCommand = DivisionCommand;
var DivisionCommandHelper = /** @class */ (function () {
    function DivisionCommandHelper() {
    }
    DivisionCommandHelper.addCommands = function (bot) {
        bot.registerCommand("rdiv", DivisionCommand.randomDiv);
        bot.registerCommand("alldivs", DivisionCommand.allDivs);
        bot.registerCommand("divs", DivisionCommand.allDivs);
        bot.registerCommand("unbandiv", DivisionCommand.unbanDivision);
        bot.registerCommand("resetdivs", DivisionCommand.unbanDivisionAll);
        bot.registerCommand("bandiv", DivisionCommand.banDivision);
        bot.registerCommand("banneddivs", DivisionCommand.bannedDivisions);
    };
    return DivisionCommandHelper;
}());
exports.DivisionCommandHelper = DivisionCommandHelper;
//# sourceMappingURL=division.js.map