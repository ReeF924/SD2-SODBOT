"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var division_1 = require("./commands/division");
var common_1 = require("./general/common");
var discordBot_1 = require("./general/discordBot");
common_1.CommonUtil.init();
var bot = new discordBot_1.DiscordBot();
division_1.DivisionCommandHelper.addCommands(bot);
bot.login();
