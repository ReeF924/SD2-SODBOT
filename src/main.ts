import { DivisionCommandHelper } from "./commands/division";
import { MapCommandHelper } from "./commands/map";
import { MiscCommandHelper } from "./commands/misc";
import { CommonUtil } from "./general/common";
import { DiscordBot } from "./general/discordBot";

import * as smp from 'source-map-support';
import * as http from 'http';


smp.install();

CommonUtil.init();
const bot = new DiscordBot();
DivisionCommandHelper.addCommands(bot);
MiscCommandHelper.addCommands(bot);
MapCommandHelper.addCommands(bot);
bot.login();
const healthcheck = http.createServer(function (req,res){
    res.write("pong");
    res.end();
});
healthcheck.listen(8080);