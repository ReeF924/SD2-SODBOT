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
exports.MsgHelper = exports.DiscordBot = void 0;
`use strict`;
const common_1 = require("./common");
const discord_js_1 = require("discord.js");
const logs_1 = require("./logs");
const replays_1 = require("../results/replays");
const permissions_1 = require("./permissions");
class DiscordBot {
    constructor(database) {
        this.commands = new Map();
        //this.loadBlacklist();
        this.database = database;
        this.perms = new permissions_1.Permissions(database);
        DiscordBot.bot = new discord_js_1.Client();
        DiscordBot.bot.on("message", this.onMessage.bind(this));
        DiscordBot.bot.on("ready", () => __awaiter(this, void 0, void 0, function* () {
            yield this.onReady(database);
        }));
        DiscordBot.bot.on("error", this.onError.bind(this));
        DiscordBot.bot.on('unhandledRejection', this.onError.bind(this));
    }
    login() {
        DiscordBot.bot.login(process.env.discordToken);
    }
    registerCommand(command, funct) {
        this.commands[command] = funct;
    }
    removeCommand(command) {
        this.commands.delete(command);
    }
    onError(message) {
        logs_1.Logs.error(message);
    }
    runCommand(message, command, perms) {
        let input = [];
        const ii = message.content.indexOf(" ");
        if (ii > 0) {
            const i = message.content.substr(ii + 1);
            input = i.split(/,/);
            for (const index in input) {
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
    }
    onMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            let channel, guild;
            if (message.channel)
                channel = message.channel.id;
            if (message.guild)
                guild = message.guild.id;
            if (message.content.startsWith(common_1.CommonUtil.config("prefix"))) {
                const perms = this.perms.getPermissions(channel, guild);
                if (!(yield perms).areCommandsBlocked) {
                    const inputList = message.content
                        .substr(1, message.content.length)
                        .toLowerCase()
                        .replace(/\n/g, " ")
                        .split(" ");
                    const command = inputList[0];
                    if (message.channel.type === "dm") {
                        return;
                    }
                    this.runCommand(message, command, (yield perms));
                }
            }
            if (message.attachments.first()) {
                const perms = this.perms.getPermissions(channel, guild);
                if (!(yield perms).areReplaysBlocked) {
                    if (message.attachments.first().url.endsWith(".rpl3")) {
                        if (message.channel.type !== "dm") {
                            replays_1.Replays.extractReplayInfo(message, (yield perms), this.database);
                        }
                    }
                }
            }
        });
    }
    onReady(database) {
        return __awaiter(this, void 0, void 0, function* () {
            yield database.redisClient.connect();
            yield database.redisSaveServers(null);
            yield database.saveNewServers(DiscordBot.bot);
            logs_1.Logs.log("Bot Online!");
            DiscordBot.bot.user.setActivity("Use " + common_1.CommonUtil.config("prefix") + "help to see commands!", {
                type: "LISTENING"
            });
            // DB.saveNewServers(DiscordBot.bot);
        });
    }
}
exports.DiscordBot = DiscordBot;
class MsgHelper {
    static reply(message, content, mentions = true) {
        const opts = {};
        //if(!mentions){
        //    opts["allowed_mentions"] = true;
        //}
        message.reply(content);
    }
    static say(message, content, mentions = true) {
        const opts = {};
        if (!mentions) {
            opts["allowed_mentions"] = "{parse:[]}";
        }
        if (typeof content != String) {
            opts["embed"] = "rich";
        }
        logs_1.Logs.log(content);
        message.channel.send(content);
    }
    static dmUser(message, content) {
        message.author.send(content);
    }
}
exports.MsgHelper = MsgHelper;
//# sourceMappingURL=discordBot.js.map