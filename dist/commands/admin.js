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
exports.AdminCommand = void 0;
const discord_js_1 = require("discord.js");
const discordBot_1 = require("../general/discordBot");
const logs_1 = require("../general/logs");
const Command_1 = require("./Command");
class AdminCommand extends Command_1.CommandDB {
    //Only RoguishTiger or Kuriosly can set Admin rights 
    //ReeF: added myself for the tests, maybe for later use, dunno how active is Kuriosly
    constructor(database) {
        super(database);
        this.admins = ["687898043005272096", "271792666910392325", "607962880154927113", "477889434642153482"];
    }
    setAdmin(message, input) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.admins.some(adminId => message.author.id == adminId)) {
                //Check for argument
                if (input.length === 1) {
                    (() => __awaiter(this, void 0, void 0, function* () {
                        //Get user from the DiscordUsers Table
                        let user = yield this.database.getDiscordUser(input[0]);
                        const discordUser = yield discordBot_1.DiscordBot.bot.users.fetch(String(input[0]));
                        //If user is already registered up their Admin permisson
                        if (user) {
                            if (user.globalAdmin == false) {
                                user.globalAdmin = (true);
                                yield this.database.setDiscordUser(user);
                                discordBot_1.MsgHelper.reply(message, "Discord account " + discordUser.username + " has been updated with global admin access");
                                logs_1.Logs.log("Changed globalAdmin access to user " + discordUser.username + " to true");
                                return;
                            }
                            else if (user.globalAdmin == true) {
                                console.log("User's GlobalAdmin setting is already set to " + user.globalAdmin);
                                discordBot_1.MsgHelper.reply(message, "The user already has global admin access!");
                                return;
                            }
                        }
                        //If user is not registered
                        else {
                            discordBot_1.MsgHelper.reply(message, "This user is not currently registered to the bot, they must first register before you can add them as a admin");
                            return;
                        }
                    }))();
                }
            }
        });
    }
    adjustElo(message, input) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield this.database.getDiscordUser(message.author.id);
            //Check if requestor has admin access
            if (user.globalAdmin === true) {
                //Check that the command is correctly formatted
                if (input.length < 3) {
                    console.log("Not enough arguments");
                    message.reply("This command requires three arguments EugenID, New League ELO, New Global ELO.  All seperated by commas");
                    return;
                }
                else if (input.length === 3) {
                    let eugenId = input[0];
                    let newLeagueElo = input[1];
                    let newGlobalElo = input[2];
                    //await this.database.setPlayer(eugenId, newLeagueElo, newGlobalElo);
                    //message.reply("Eugen Acct "+eugenId+ " has been updated with LeagueELO "+newLeagueElo+" and GlobalELO "+newGlobalElo)
                    return;
                }
                else {
                    message.reply("This command is not correctly formatted, it requires three arguments EugenID, New League ELO, New Global ELO.  All seperated by commas");
                }
            }
            else {
                message.reply("You do not have the admin access to use this command");
            }
        });
    }
    setChannelPrems(message, input) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield this.database.getDiscordUser(message.author.id);
            let prem = {
                id: "",
                name: "",
                blockElo: 0,
                blockCommands: 0,
                blockReplay: 0,
                blockChannelElo: 0,
                blockServerElo: 0,
                blockGlobalElo: 0
            };
            //Check if requestor has admin access
            if (user.globalAdmin == true) {
                // Check if formatted correctly
                if (input.length == 1) {
                    message.reply("This command requires a channel id and one or more premission commands to be correctly formatted");
                    return;
                }
                else if (input.length > 1) {
                    // Check if server is already in ChannelBlacklist table
                    prem = yield this.database.getChannelPermissions(input[0]);
                    console.log(prem);
                    let channel = discordBot_1.DiscordBot.bot.channels.cache.get(input[0]);
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
                    for (let x = 1; x < input.length; x++) {
                        let command = input[x];
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
                    yield this.database.setChannelPermissions(prem);
                    discordBot_1.MsgHelper.reply(message, "The permission settings of Discord channel " + channel.name + " has been updated ");
                }
                else {
                    message.reply("This command is not correctly formatted, it requires one channel as a argument");
                    return;
                }
            }
            else {
                message.reply("You do not have the admin access to use this command");
                return;
            }
        });
    }
    resetChannelPrems(message, input) {
        return __awaiter(this, void 0, void 0, function* () {
            let channel = discordBot_1.DiscordBot.bot.channels.cache.get(input[0]);
            if (input.length === 1) {
                let prem = {
                    id: input[0],
                    name: channel.name,
                    blockElo: -1,
                    blockCommands: -1,
                    blockReplay: -1,
                    blockChannelElo: -1,
                    blockServerElo: -1,
                    blockGlobalElo: -1
                };
                yield this.database.setChannelPermissions(prem);
                discordBot_1.MsgHelper.reply(message, "The permission settings of Discord channel " + channel.name + " has been reset back to default settings.");
            }
            else {
                discordBot_1.MsgHelper.reply(message, "Command not formatted corresctly, this command just takes a channel id only as its argument");
            }
        });
    }
    primaryMode(message, input) {
        return __awaiter(this, void 0, void 0, function* () {
            const guild = message.guild;
            //ReeF: No idea why it doesn't work, the below works for some reason so who cares
            // let server:DiscordServer = await this.database.getServer(serverId); 
            let server = yield this.database.getFromRedis(guild.id);
            if (input.length === 0) {
                let reply = this.getOppositeChannelsReply(guild, server.oppositeChannelIds);
                message.reply(`Server's primary mode is ${server.primaryMode}, ${reply}`);
                return;
            }
            if (input[0].split(' ').length > 1) {
                message.reply("Invalid arguments for the command.");
                return;
            }
            //Check if the user has rights to change the primary mode (the commments implemented user.db but it's not used appereantly)
            if (!this.checkAccess(message)) {
                message.reply("Only server admin can change the primary mode");
                return;
            }
            switch (input[0].toLocaleLowerCase()) {
                case "steeldivision":
                case "steeldivision2":
                case "sd":
                case "sd2":
                    server.primaryMode = "sd2";
                    break;
                case "warno":
                case "objectivelyworseeugengame":
                    server.primaryMode = "warno";
                    break;
                default:
                    message.reply("Invalid input, try sd2 or warno");
                    return;
            }
            yield this.database.putServer(server);
            message.reply(`Primary mode changed to ${server.primaryMode}`);
        });
    }
    addChannel(message, input) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.checkAccess(message)) {
                message.reply("Only server admin can change oppositeChannels");
                return false;
            }
            const guild = message.guild;
            const channel = message.channel;
            let server = yield this.database.getFromRedis(guild.id);
            if (input.length > 0) {
                if (guild.channels.cache.some(channel => channel.id === input[0])) {
                    server.oppositeChannelIds.push(input[0]);
                    yield this.database.putServer(server);
                    const channelName = yield guild.channels.cache.find(channel => channel.id === input[0]).name;
                    message.reply(`Channel "${channelName}" has been added to the list of opposite channels`);
                    return;
                }
                message.reply("Invalid arguments.");
                return;
            }
            if (server.oppositeChannelIds.some(channelId => channel.id === channelId)) {
                message.reply("This channel is already in the opposite channels, if you wish to delete it, use $removechannel");
                return;
            }
            server.oppositeChannelIds.push(channel.id);
            yield this.database.putServer(server);
            message.reply("Channel has been added to the list of opposite channels");
        });
    }
    removeChannel(message, input) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.checkAccess(message)) {
                message.reply("Only server admin can remove oppositeChannels");
                return false;
            }
            const guild = message.guild;
            const channel = message.channel;
            let server = yield this.database.getFromRedis(guild.id);
            if (input.length > 0) {
                if (input[0] === "all") {
                    server.oppositeChannelIds = [];
                    yield this.database.putServer(server);
                    message.reply("The list of opposite channels has been cleared.");
                    return;
                }
                if (yield this.filterChannel(server, input[0], message)) {
                    return;
                }
                message.reply("Invalid arguments, did you mean \"all\"?");
                return;
            }
            if (yield this.filterChannel(server, channel.id, message)) {
                return;
            }
            message.reply("This channel isn't in the opposite channels list, if you wish to add it, use $removechannel");
            return;
        });
    }
    filterChannel(server, channelId, message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (server.oppositeChannelIds.some(oppositeChannelId => oppositeChannelId === channelId)) {
                server.oppositeChannelIds = server.oppositeChannelIds.filter(id => id !== channelId);
                yield this.database.putServer(server);
                message.reply("Channel has been removed from the list of opposite channels.");
                return true;
            }
            return false;
        });
    }
    checkAccess(message) {
        return (message.member instanceof discord_js_1.GuildMember) || this.admins.some(adminID => message.member.id === adminID);
    }
    getOppositeChannelsReply(guild, channelIds) {
        if (channelIds.length === 0) {
            return "server has no opposite channels";
        }
        let names = this.getChannelNamesFromIds(guild, channelIds);
        return `opposite channels are: ${names.join(", ")}`;
    }
    getChannelNamesFromIds(guild, channelIds) {
        let names = [];
        channelIds.forEach((channelId) => __awaiter(this, void 0, void 0, function* () {
            names.push(guild.channels.cache.find(channel => channel.id === channelId).name);
        }));
        return names;
    }
    addCommands(bot) {
        bot.registerCommand("adjustelo", this.adjustElo);
        bot.registerCommand("setadmin", this.setAdmin);
        bot.registerCommand("setchannel", this.setChannelPrems);
        bot.registerCommand("resetchannel", this.resetChannelPrems);
        bot.registerCommand("primarymode", this.primaryMode.bind(this));
        bot.registerCommand("addchannel", this.addChannel.bind(this));
        bot.registerCommand("removechannel", this.removeChannel.bind(this));
    }
}
exports.AdminCommand = AdminCommand;
//# sourceMappingURL=admin.js.map