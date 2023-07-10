import 'dotenv/config'
import { MiscCommand} from "./commands/misc";
import { HelpCommand} from "./commands/help";
import { PlayerCommand } from "./commands/player";
import { AdminCommand } from "./commands/admin";
import { MatchupCommand } from "./commands/matchup"

import { CommonUtil } from "./general/common";
import { DiscordBot } from "./general/discordBot";

import * as smp from 'source-map-support';
import * as http from 'http';
import { Logs } from "./general/logs";
import { DB, Player } from "./general/db";
import { API } from "./api/api";
import { misc } from 'sd2-data';
import { DivisionCommand } from './commands/division';
import { MapCommand } from './commands/map';
import { match } from 'assert';

const p = require("../package.json")

const database:DB = new DB(); 
CommonUtil.init(database);
Logs.init();

smp.install();
Logs.log("Starting Bot");
const bot = new DiscordBot(database);
const adminCommand: AdminCommand = new AdminCommand(database);
const miscCommand: MiscCommand = new MiscCommand(database);
const playerCommand: PlayerCommand = new PlayerCommand(database);
const divCommand: DivisionCommand = new DivisionCommand();
const mapCommand: MapCommand = new MapCommand(); 
const helpCommand: HelpCommand = new HelpCommand();
const matchCommand: MatchupCommand = new MatchupCommand();

adminCommand.addCommands(bot);
miscCommand.addCommands(bot);
playerCommand.addCommands(bot);
divCommand.addCommands(bot);
mapCommand.addCommands(bot);
helpCommand.addCommands(bot);
matchCommand.addCommands(bot);

bot.login();
const healthcheck = http.createServer(function (req, res) {
    Logs.log(req);
    res.write("pong");
    res.end();
});
Logs.log(`Starting healthcheck server on 8080, version ${p.version}`)
//healthcheck.listen(8080);
const api = new API(database);
api.start();