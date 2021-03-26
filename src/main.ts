import { DivisionCommandHelper } from "./commands/division";
import { CommonUtil } from "./general/common";
import { DiscordBot } from "./general/discordBot";

require('source-map-support').install();

CommonUtil.init();
var bot = new DiscordBot();
DivisionCommandHelper.addCommands(bot);
bot.login();