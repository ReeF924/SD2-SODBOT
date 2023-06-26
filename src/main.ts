import 'dotenv/config'
import { DivisionCommandHelper } from "./commands/division";
import { MapCommandHelper } from "./commands/map";
import { MiscCommandHelper } from "./commands/misc";
import { HelpCommandHelper } from "./commands/help";
import { PlayerCommandHelper } from "./commands/player";
import { AdminCommand } from "./commands/admin";
import { MatchupCommandHelper } from "./commands/matchup"

import { CommonUtil } from "./general/common";
import { DiscordBot } from "./general/discordBot";

import * as smp from 'source-map-support';
import * as http from 'http';
import { Logs } from "./general/logs";
import { DB } from "./general/db";
import { API } from "./api/api";

const p = require("../package.json")

smp.install();
Logs.log("Starting Bot");
const bot = new DiscordBot();

CommonUtil.init();
DB.init();
const adminCommand: AdminCommand = new AdminCommand();

DivisionCommandHelper.addCommands(bot);
MiscCommandHelper.addCommands(bot);
MapCommandHelper.addCommands(bot);
HelpCommandHelper.addCommands(bot);
PlayerCommandHelper.addCommands(bot);
adminCommand.addCommands(bot);
MatchupCommandHelper.addCommands(bot);

bot.login();
const healthcheck = http.createServer(function (req, res) {
    Logs.log(req);
    res.write("pong");
    res.end();
});
Logs.log(`Starting healthcheck server on 8080, version ${p.version}`)
//healthcheck.listen(8080);
const api = new API()
api.start();