import { DivisionCommandHelper } from "./commands/division";
import { MapCommandHelper } from "./commands/map";
import { MiscCommandHelper } from "./commands/misc";
import { CommonUtil } from "./general/common";
import { DiscordBot } from "./general/discordBot";

import * as smp from 'source-map-support';
import * as http from 'http';
import { Logs } from "./general/logs";


smp.install();

CommonUtil.init();
Logs.log("Starting Bot");
const bot = new DiscordBot();
DivisionCommandHelper.addCommands(bot);
MiscCommandHelper.addCommands(bot);
MapCommandHelper.addCommands(bot);
bot.login();
const healthcheck = http.createServer(function (req,res){
    Logs.log(req);
    res.write("pong");
    res.end();
});
Logs.log("Starting healthcheck server on 8080")
healthcheck.listen(8080);