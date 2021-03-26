"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DivisionCommandHelper = exports.DivisionCommand = void 0;
var discordBot_1 = require("../general/discordBot");
var divisions_1 = require("sd2-data/divisions");
var ascii_table3_1 = require("ascii-table3/ascii-table3");
var common_1 = require("../general/common");
var DivisionCommand = /** @class */ (function () {
    function DivisionCommand() {
    }
    DivisionCommand.rdiv = function (message, input) {
        var divs;
        if (input.length == 0) {
            divs = __spreadArray(__spreadArray([], divisions_1.divisionsAllies), divisions_1.divisionsAxis);
        }
        else {
            var side = input[0].toLowerCase();
            if (side !== "axis" && side !== "allies") {
                discordBot_1.MsgHelper.reply(message, "Unknown side, please specify 'axis' or 'allies' as a side if you want to pick a side.");
                return;
            }
            if (side == "allies")
                divs = divisions_1.divisionsAllies;
            if (side == "axis")
                divs = divisions_1.divisionsAxis;
        }
        //check for bans
        if (DivisionCommand.bans[message.member.id]) {
            var _loop_1 = function (key) {
                divs = divs.filter(function (x) {
                    return x.id != key;
                });
            };
            for (var _i = 0, _a = DivisionCommand.bans[message.member.id].keys(); _i < _a.length; _i++) {
                var key = _a[_i];
                _loop_1(key);
            }
        }
        if (divs.length == 0)
            discordBot_1.MsgHelper.reply(message, "all divisions have been banned. Please unban some divisions");
        else
            discordBot_1.MsgHelper.reply(message, divs[Math.floor(Math.random() * divs.length)].name);
    };
    DivisionCommand.allDivs = function (message, input) {
        var table = new ascii_table3_1.AsciiTable3("Divisions");
        table.setHeading("Allies", "Axis");
        for (var i = 0; i < divisions_1.divisionsAllies.length; i++) {
            table.addRow(divisions_1.divisionsAllies[i].name, divisions_1.divisionsAxis[i].name);
        }
        discordBot_1.MsgHelper.say(message, "``" + table.toString() + "``");
    };
    DivisionCommand.unbanDivision = function (message, input) {
        if (input.length == 0) {
            discordBot_1.MsgHelper.reply(message, "I don't know what that division is, please use " + common_1.CommonUtil.config("prefix") + "alldivs, to get the list of divisions.");
            return;
        }
        if (input[0].toLocaleLowerCase() == "all") {
            DivisionCommand.bans.delete(message.author.id);
            discordBot_1.MsgHelper.reply(message, 'unbanned all divisions');
            return;
        }
        var _loop_2 = function (line) {
            var divs = __spreadArray(__spreadArray([], divisions_1.divisionsAllies), divisions_1.divisionsAxis);
            var target = divs.filter(function (x) {
                return line.toLocaleLowerCase().localeCompare(x.name.toLocaleLowerCase());
            });
            if (target.length == 0) {
                discordBot_1.MsgHelper.say(message, "I don't know what that division is, did you mean ***" + common_1.CommonUtil.lexicalGuesser(line, divs.map(function (x) { return x.name; })) + "*** instead of ***" + line + "***.\nNo divisions have been unbanned.");
                return { value: void 0 };
            }
            else {
                DivisionCommand.bans[message.author.id][target[0].id] = false;
                discordBot_1.MsgHelper.reply(message, line + " has been unbanned.");
                var all = true;
                for (var _a = 0, _b = DivisionCommand.bans[message.author.id]; _a < _b.length; _a++) {
                    var z = _b[_a];
                    all = z && all;
                }
                if (!all)
                    DivisionCommand.bans.delete(message.author.id);
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
            discordBot_1.MsgHelper.reply(message, "Please specify a division to ban. Use " + common_1.CommonUtil.config("prefix") + "alldivs, to get the list of divisions.");
            return;
        }
        var _loop_3 = function (line) {
            var divs = __spreadArray(__spreadArray([], divisions_1.divisionsAllies), divisions_1.divisionsAxis);
            var target = divs.filter(function (x) {
                return line.toLocaleLowerCase().localeCompare(x.name.toLocaleLowerCase());
            });
            if (target.length == 0) {
                discordBot_1.MsgHelper.say(message, "I don't know what that division is, did you mean ***" + common_1.CommonUtil.lexicalGuesser(line, divs.map(function (x) { return x.name; })) + "*** instead of ***" + line + "***.\nNo divisions have been banned.");
                return { value: void 0 };
            }
            else {
                DivisionCommand.bans[message.author.id][target[0].id] = true;
                discordBot_1.MsgHelper.reply(message, line + " has been banned.");
            }
        };
        for (var _i = 0, input_2 = input; _i < input_2.length; _i++) {
            var line = input_2[_i];
            var state_2 = _loop_3(line);
            if (typeof state_2 === "object")
                return state_2.value;
        }
    };
    DivisionCommand.unbanDivisionAll = function (message, input) {
        DivisionCommand.unbanDivision(message, ["all"]);
    };
    DivisionCommand.bannedDivisions = function (message, input) {
        var bannedDivs = DivisionCommand.bans[message.author.id];
        if (!bannedDivs) {
            discordBot_1.MsgHelper.reply(message, "You have no banned Divisions");
            return;
        }
        else {
            var divs_1 = __spreadArray(__spreadArray([], divisions_1.divisionsAllies), divisions_1.divisionsAxis);
            var divString = bannedDivs.map(function (x) {
                divs_1.find(function (y) {
                    y.id == x;
                })[0];
            });
            var ret = "";
            for (var _i = 0, divString_1 = divString; _i < divString_1.length; _i++) {
                var name_1 = divString_1[_i];
                ret += name_1 + "\n";
            }
            discordBot_1.MsgHelper.reply(message, "You Have Banned: \n ``" + ret + '``');
        }
    };
    return DivisionCommand;
}());
exports.DivisionCommand = DivisionCommand;
var DivisionCommandHelper = /** @class */ (function () {
    function DivisionCommandHelper() {
    }
    DivisionCommandHelper.addCommands = function (bot) {
        bot.registerCommand("rdiv", DivisionCommand.rdiv);
        bot.registerCommand("alldivs", DivisionCommand.allDivs);
        bot.registerCommand("unbandiv", DivisionCommand.unbanDivision);
        bot.registerCommand("resetdivs", DivisionCommand.unbanDivisionAll);
        bot.registerCommand("bandiv", DivisionCommand.banDivision);
        bot.registerCommand("banneddivs", DivisionCommand.bannedDivisions);
    };
    return DivisionCommandHelper;
}());
exports.DivisionCommandHelper = DivisionCommandHelper;
