import 'dotenv/config'
import { MiscCommand } from "./commands/misc";
import { HelpCommand } from "./commands/help";
import { PlayerCommand } from "./commands/player";
import { AdminCommand } from "./commands/admin";
import { MatchupCommand } from "./commands/matchup"

import { CommonUtil } from "./general/common";
import { DiscordBot } from "./general/discordBot";

import * as smp from 'source-map-support';
import { Logs } from "./general/logs";
import { DivisionCommand } from './commands/division';
import { MapCommand } from './commands/map';
import {ReplayReportsCommand} from "./commands/replayReports";

CommonUtil.init();
Logs.init();

smp.install();

Logs.log("Starting Bot");
const bot = new DiscordBot();

const adminCommand: AdminCommand = new AdminCommand(bot);
const playerCommand: PlayerCommand = new PlayerCommand();
const miscCommand: MiscCommand = new MiscCommand();
const divCommand: DivisionCommand = new DivisionCommand();
const mapCommand: MapCommand = new MapCommand();
const helpCommand: HelpCommand = new HelpCommand();
const matchCommand: MatchupCommand = new MatchupCommand();
const replayReportCommand: ReplayReportsCommand = new ReplayReportsCommand();
adminCommand.addCommands();
playerCommand.addCommands(bot);
miscCommand.addCommands(bot);
divCommand.addCommands(bot);
mapCommand.addCommands(bot);
helpCommand.addCommands(bot);
matchCommand.addCommands(bot);
replayReportCommand.addCommands(bot);