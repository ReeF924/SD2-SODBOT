import 'dotenv/config'

import { DiscordBot } from "../general/discordBot";
import { Logs } from '../general/logs';

Logs.init();
Logs.log(`Started to broadcast to servers`);

const bot = new DiscordBot(true);


