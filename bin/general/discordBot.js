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
var sqlHelper_1 = require("./sqlHelper");
var logs_1 = require("./logs");
var replays_1 = require("../results/replays");
var DiscordBot = /** @class */ (function () {
    function DiscordBot() {
        this.loadBlacklist();
        this.bot = new discord_js_1.Client();
        this.bot.on("message", this.onMessage);
        this.bot.on("ready", this.onReady);
        this.bot.on("error", this.onError);
    }
    DiscordBot.prototype.login = function () {
        this.bot.login(common_1.CommonUtil.config("discordToken"));
    };
    DiscordBot.prototype.registerCommand = function (command, funct) {
        this.commands[command] = funct;
    };
    DiscordBot.prototype.removeCommand = function (command) {
        this.commands.delete(command);
    };
    DiscordBot.prototype.onError = function (message) {
        logs_1.Logs.error(message);
    };
    DiscordBot.prototype.loadBlacklist = function () {
        this.blacklist = sqlHelper_1.SqlHelper.getBlacklist();
    };
    DiscordBot.prototype.isBlackListed = function (id) {
        if (this.blacklist[id])
            return true;
        return false;
    };
    DiscordBot.prototype.runCommand = function (message, command) {
        var i = message.content.substr(message.content.indexOf(" ") + 1);
        var input = i.split(/,/);
        for (var index in input) {
            input[index] = input[index]
                //.replace(/&/g, "&amp;")
                //.replace(/"/g, "&quot;") //why we do this?
                .trim();
        }
        if (this.commands[command]) {
            this.commands[command](message, input);
        }
    };
    DiscordBot.prototype.onMessage = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var userIsBlackListed, inputList, command;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.isBlackListed(message.author.id)];
                    case 1:
                        userIsBlackListed = _a.sent();
                        if (!userIsBlackListed) {
                            if (message.content.startsWith(common_1.CommonUtil.config("prefix"))) {
                                inputList = message.content
                                    .substr(1, message.content.length)
                                    .toLowerCase()
                                    .replace(/\n/g, " ")
                                    .split(" ");
                                command = inputList[0];
                                if (message.channel.type === "dm") {
                                    return [2 /*return*/];
                                }
                                this.runCommand(message, command);
                            }
                            if (message.attachments.first()) {
                                if (message.attachments.first().url.endsWith(".rpl3")) {
                                    if (message.channel.type !== "dm") {
                                        replays_1.Replays.extractReplayInfo(message);
                                    }
                                }
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    DiscordBot.prototype.onReady = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                logs_1.Logs.log("Bot Online!");
                this.bot.user.setActivity("Use " + common_1.CommonUtil.config("prefix") + "help to see commands!", {
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
    MsgHelper.reply = function (message, content, tts) {
        var opts = {};
        if (common_1.CommonUtil.configBoolean("tts_enabled_global")) {
            opts["tts"] = tts;
        }
        message.reply(content, opts);
    };
    MsgHelper.say = function (message, content, tts) {
        var opts = {};
        if (common_1.CommonUtil.configBoolean("tts_enabled_global")) {
            opts["tts"] = tts;
        }
        message.channel.send(content, opts);
    };
    MsgHelper.dmUser = function (message, content) {
        message.author.send(content);
    };
    return MsgHelper;
}());
exports.MsgHelper = MsgHelper;
