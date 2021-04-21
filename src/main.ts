import { DivisionCommandHelper } from "./commands/division";
import { MapCommandHelper } from "./commands/map";
import { MiscCommandHelper } from "./commands/misc";
import { HelpCommandHelper } from "./commands/help";
import { PlayerCommandHelper } from "./commands/player";
import { AdminCommandHelper } from "./commands/admin";

import { CommonUtil } from "./general/common";
import { DiscordBot } from "./general/discordBot";

import * as smp from 'source-map-support';
import * as http from 'http';
import { Logs } from "./general/logs";
import { SqlHelper } from "./general/sqlHelper";

smp.install();

CommonUtil.init();
SqlHelper.init();
Logs.log("Starting Bot");
const bot = new DiscordBot();
DivisionCommandHelper.addCommands(bot);
MiscCommandHelper.addCommands(bot);
MapCommandHelper.addCommands(bot);
HelpCommandHelper.addCommands(bot);
PlayerCommandHelper.addCommands(bot);
AdminCommandHelper.addCommands(bot);
bot.login();
const healthcheck = http.createServer(function (req,res){
    Logs.log(req);
    res.write("pong");
    res.end();
});
Logs.log("Starting healthcheck server on 8080")
healthcheck.listen(8080);