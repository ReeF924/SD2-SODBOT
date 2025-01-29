import 'dotenv/config'

import { DiscordBot, MsgHelper } from "../general/discordBot";
import { Logs } from '../general/logs';
import { DB, Player } from "../general/db";

Logs.init();
Logs.log(`Started to broadcast to servers`);


const database = new DB();
const bot = new DiscordBot(database, true);


