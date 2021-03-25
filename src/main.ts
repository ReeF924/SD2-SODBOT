import { CommonUtil } from "./general/common";
import { DiscordBot } from "./general/discordBot";

CommonUtil.init();
var bot = new DiscordBot();
bot.login();