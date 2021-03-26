import { DivisionCommandHelper } from "./commands/division";
import { MiscCommandHelper } from "./commands/misc";
import { CommonUtil } from "./general/common";
import { DiscordBot } from "./general/discordBot";

require('source-map-support').install();

CommonUtil.init();
var bot = new DiscordBot();
DivisionCommandHelper.addCommands(bot);
MiscCommandHelper.addCommands(bot);
bot.login();