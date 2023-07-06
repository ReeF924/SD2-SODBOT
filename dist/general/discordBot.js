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
exports.MsgHelper = exports.DiscordBot = void 0;
var common_1 = require("./common");
var discord_js_1 = require("discord.js");
var logs_1 = require("./logs");
var replays_1 = require("../results/replays");
var permissions_1 = require("./permissions");
var db_1 = require("./db");
var DiscordBot = /** @class */ (function () {
    function DiscordBot(database) {
        var _this = this;
        this.commands = new Map();
        //this.loadBlacklist();
        this.database = database;
        this.perms = new permissions_1.Permissions(database);
        DiscordBot.bot = new discord_js_1.Client();
        DiscordBot.bot.on("message", this.onMessage.bind(this));
        DiscordBot.bot.on("ready", function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database.saveNewServers(DiscordBot.bot)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.onReady()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        DiscordBot.bot.on("error", this.onError.bind(this));
        DiscordBot.bot.on('unhandledRejection', this.onError.bind(this));
    }
    DiscordBot.prototype.login = function () {
        DiscordBot.bot.login(process.env.discordToken);
    };
    DiscordBot.prototype.registerCommand = function (command, funct) {
        this.commands[command] = funct;
    };
    DiscordBot.prototype.removeCommand = function (command) {
        this.commands.delete(command);
    };
    DiscordBot.prototype.getSodbotServers = function () {
        var servers;
        DiscordBot.bot.guilds.cache.forEach(function (guild) {
            servers.push(new db_1.DiscordServer(guild.id, guild.name));
        });
        return servers;
    };
    DiscordBot.prototype.onError = function (message) {
        logs_1.Logs.error(message);
    };
    DiscordBot.prototype.runCommand = function (message, command, perms) {
        var input = [];
        var ii = message.content.indexOf(" ");
        if (ii > 0) {
            var i = message.content.substr(ii + 1);
            input = i.split(/,/);
            for (var index in input) {
                input[index] = input[index]
                    //.replace(/&/g, "&amp;")
                    //.replace(/"/g, "&quot;") //why we do this?
                    .trim();
            }
        }
        if (this.commands[command]) {
            this.commands[command](message, input, perms);
        }
        else {
            MsgHelper.reply(message, "Unknown Command. Did you mean " + common_1.CommonUtil.config("prefix") + common_1.CommonUtil.lexicalGuesser(command, Object.keys(this.commands)));
        }
    };
    DiscordBot.prototype.onMessage = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var channel, guild, perms, inputList, command, _a, _b, perms, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        if (message.channel)
                            channel = message.channel.id;
                        if (message.guild)
                            guild = message.guild.id;
                        if (!message.content.startsWith(common_1.CommonUtil.config("prefix"))) return [3 /*break*/, 3];
                        perms = this.perms.getPermissions(channel, guild);
                        return [4 /*yield*/, perms];
                    case 1:
                        if (!!(_f.sent()).areCommandsBlocked) return [3 /*break*/, 3];
                        inputList = message.content
                            .substr(1, message.content.length)
                            .toLowerCase()
                            .replace(/\n/g, " ")
                            .split(" ");
                        command = inputList[0];
                        if (message.channel.type === "dm") {
                            return [2 /*return*/];
                        }
                        _a = this.runCommand;
                        _b = [message, command];
                        return [4 /*yield*/, perms];
                    case 2:
                        _a.apply(this, _b.concat([(_f.sent())]));
                        _f.label = 3;
                    case 3:
                        if (!message.attachments.first()) return [3 /*break*/, 6];
                        perms = this.perms.getPermissions(channel, guild);
                        return [4 /*yield*/, perms];
                    case 4:
                        if (!!(_f.sent()).areReplaysBlocked) return [3 /*break*/, 6];
                        if (!message.attachments.first().url.endsWith(".rpl3")) return [3 /*break*/, 6];
                        if (!(message.channel.type !== "dm")) return [3 /*break*/, 6];
                        _d = (_c = replays_1.Replays).extractReplayInfo;
                        _e = [message];
                        return [4 /*yield*/, perms];
                    case 5:
                        _d.apply(_c, _e.concat([(_f.sent()), this.database]));
                        _f.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    DiscordBot.prototype.onReady = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                logs_1.Logs.log("Bot Online!");
                DiscordBot.bot.user.setActivity("Use " + common_1.CommonUtil.config("prefix") + "help to see commands!", {
                    type: "LISTENING"
                });
                return [2 /*return*/];
            });
        });
    };
    return DiscordBot;
}());
exports.DiscordBot = DiscordBot;
var MsgHelper = /** @class */ (function () {
    function MsgHelper() {
    }
    MsgHelper.reply = function (message, content, mentions) {
        if (mentions === void 0) { mentions = true; }
        var opts = {};
        //if(!mentions){
        //    opts["allowed_mentions"] = true;
        //}
        message.reply(content);
    };
    MsgHelper.say = function (message, content, mentions) {
        if (mentions === void 0) { mentions = true; }
        var opts = {};
        if (!mentions) {
            opts["allowed_mentions"] = "{parse:[]}";
        }
        if (typeof content != String) {
            opts["embed"] = "rich";
        }
        logs_1.Logs.log(content);
        message.channel.send(content);
    };
    MsgHelper.dmUser = function (message, content) {
        message.author.send(content);
    };
    return MsgHelper;
}());
exports.MsgHelper = MsgHelper;
//# sourceMappingURL=discordBot.js.map