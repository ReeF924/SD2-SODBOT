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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminCommandHelper = exports.AdminCommand = void 0;
var discordBot_1 = require("../general/discordBot");
var logs_1 = require("../general/logs");
var db_1 = require("../general/db");
var AdminCommand = /** @class */ (function () {
    function AdminCommand() {
    }
    AdminCommand.setAdmin = function (message, input) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                //Only RoguishTiger or Kuriosly can set Admin rights
                if (message.author.id == "687898043005272096" || message.author.id == "271792666910392325") {
                    //Check for argument
                    if (input.length == 1) {
                        (function () { return __awaiter(_this, void 0, void 0, function () {
                            var user, discordUser;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, db_1.DB.getDiscordUser(input[0])];
                                    case 1:
                                        user = _a.sent();
                                        return [4 /*yield*/, discordBot_1.DiscordBot.bot.users.fetch(String(input[0]))
                                            //If user is already registered up their Admin permisson
                                        ];
                                    case 2:
                                        discordUser = _a.sent();
                                        if (!user) return [3 /*break*/, 6];
                                        if (!(user.globalAdmin == false)) return [3 /*break*/, 4];
                                        user.globalAdmin = (true);
                                        return [4 /*yield*/, db_1.DB.setDiscordUser(user)];
                                    case 3:
                                        _a.sent();
                                        discordBot_1.MsgHelper.reply(message, "Discord account " + discordUser.username + " has been updated with global admin access");
                                        logs_1.Logs.log("Changed globalAdmin access to user " + discordUser.username + " to true");
                                        return [2 /*return*/];
                                    case 4:
                                        if (user.globalAdmin == true) {
                                            console.log("User's GlobalAdmin setting is already set to " + user.globalAdmin);
                                            discordBot_1.MsgHelper.reply(message, "The user already has global admin access!");
                                            return [2 /*return*/];
                                        }
                                        _a.label = 5;
                                    case 5: return [3 /*break*/, 7];
                                    case 6:
                                        discordBot_1.MsgHelper.reply(message, "This user is not currently registered to the bot, they must first register before you can add them as a admin");
                                        return [2 /*return*/];
                                    case 7: return [2 /*return*/];
                                }
                            });
                        }); })();
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    AdminCommand.adjustElo = function (message, input) {
        return __awaiter(this, void 0, void 0, function () {
            var user, eugenId, newLeagueElo, newGlobalElo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.DB.getDiscordUser(message.author.id)
                        //Check if requestor has admin access
                    ];
                    case 1:
                        user = _a.sent();
                        //Check if requestor has admin access
                        if (user.globalAdmin == true) {
                            //Check that the command is correctly formatted
                            if (input.length < 3) {
                                console.log("Not enough arguments");
                                message.reply("This command requires three arguments EugenID, New League ELO, New Global ELO.  All seperated by commas");
                                return [2 /*return*/];
                            }
                            else if (input.length == 3) {
                                eugenId = input[0];
                                newLeagueElo = input[1];
                                newGlobalElo = input[2];
                                //await DB.setPlayer(eugenId, newLeagueElo, newGlobalElo);
                                //message.reply("Eugen Acct "+eugenId+ " has been updated with LeagueELO "+newLeagueElo+" and GlobalELO "+newGlobalElo)
                                return [2 /*return*/];
                            }
                            else {
                                message.reply("This command is not correctly formatted, it requires three arguments EugenID, New League ELO, New Global ELO.  All seperated by commas");
                            }
                        }
                        else {
                            message.reply("You do not have the admin access to use this command");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    AdminCommand.setChannelPrems = function (message, input) {
        return __awaiter(this, void 0, void 0, function () {
            var user, prem, channel, x, command;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.DB.getDiscordUser(message.author.id)];
                    case 1:
                        user = _a.sent();
                        prem = {
                            id: "",
                            name: "",
                            blockElo: 0,
                            blockCommands: 0,
                            blockReplay: 0,
                            blockChannelElo: 0,
                            blockServerElo: 0,
                            blockGlobalElo: 0
                        };
                        if (!(user.globalAdmin == true)) return [3 /*break*/, 7];
                        if (!(input.length == 1)) return [3 /*break*/, 2];
                        message.reply("This command requires a channel id and one or more premission commands to be correctly formatted");
                        return [2 /*return*/];
                    case 2:
                        if (!(input.length > 1)) return [3 /*break*/, 5];
                        return [4 /*yield*/, db_1.DB.getChannelPermissions(input[0])];
                    case 3:
                        // Check if server is already in ChannelBlacklist table
                        prem = _a.sent();
                        console.log(prem);
                        channel = discordBot_1.DiscordBot.bot.channels.cache.get(input[0]);
                        // If it isn't create a default
                        if (prem == null) {
                            prem = {
                                id: input[0],
                                name: channel.name,
                                blockElo: -1,
                                blockCommands: -1,
                                blockReplay: -1,
                                blockChannelElo: -1,
                                blockServerElo: -1,
                                blockGlobalElo: -1
                            };
                        }
                        // Update the settings
                        for (x = 1; x < input.length; x++) {
                            command = input[x];
                            switch (command) {
                                case "blockElo":
                                    prem.blockElo = 1;
                                    break;
                                case "blockCommands":
                                    prem.blockCommands = 1;
                                    break;
                                case "blockReplay":
                                    prem.blockReplay = 1;
                                    break;
                                case "blockChannelElo":
                                    prem.blockChannelElo = 1;
                                    break;
                                case "blockServerElo":
                                    prem.blockServerElo = 1;
                                    break;
                                case "blockGlobalElo":
                                    prem.blockGlobalElo = 1;
                                    break;
                                case "blockall":
                                    prem.blockElo = 1;
                                    prem.blockCommands = 1;
                                    prem.blockReplay = 1;
                                    prem.blockChannelElo = 1;
                                    prem.blockServerElo = 1;
                                    prem.blockGlobalElo = 1;
                                    break;
                                default:
                                    console.log("we in in default of the case statement" + command);
                                    message.reply("One of the permission settings is not a valid command");
                            }
                        }
                        return [4 /*yield*/, db_1.DB.setChannelPermissions(prem)];
                    case 4:
                        _a.sent();
                        discordBot_1.MsgHelper.reply(message, "The permission settings of Discord channel " + channel.name + " has been updated ");
                        return [3 /*break*/, 6];
                    case 5:
                        message.reply("This command is not correctly formatted, it requires one channel as a argument");
                        return [2 /*return*/];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        message.reply("You do not have the admin access to use this command");
                        return [2 /*return*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    AdminCommand.resetChannelPrems = function (message, input) {
        return __awaiter(this, void 0, void 0, function () {
            var channel, prem;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        channel = discordBot_1.DiscordBot.bot.channels.cache.get(input[0]);
                        if (!(input.length == 1)) return [3 /*break*/, 2];
                        prem = {
                            id: input[0],
                            name: channel.name,
                            blockElo: -1,
                            blockCommands: -1,
                            blockReplay: -1,
                            blockChannelElo: -1,
                            blockServerElo: -1,
                            blockGlobalElo: -1
                        };
                        return [4 /*yield*/, db_1.DB.setChannelPermissions(prem)];
                    case 1:
                        _a.sent();
                        discordBot_1.MsgHelper.reply(message, "The permission settings of Discord channel " + channel.name + " has been reset back to default settings.");
                        return [3 /*break*/, 3];
                    case 2:
                        discordBot_1.MsgHelper.reply(message, "Command not formatted corrctly, this command just takes a channel id only as its argument");
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return AdminCommand;
}());
exports.AdminCommand = AdminCommand;
var AdminCommandHelper = /** @class */ (function () {
    function AdminCommandHelper() {
    }
    AdminCommandHelper.addCommands = function (bot) {
        bot.registerCommand("adjustelo", AdminCommand.adjustElo);
        bot.registerCommand("setadmin", AdminCommand.setAdmin);
        bot.registerCommand("setchannel", AdminCommand.setChannelPrems);
        bot.registerCommand("resetchannel", AdminCommand.resetChannelPrems);
    };
    return AdminCommandHelper;
}());
exports.AdminCommandHelper = AdminCommandHelper;
//# sourceMappingURL=admin.js.map