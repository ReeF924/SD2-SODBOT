import 'dotenv/config'

import { DiscordBot, MsgHelper } from "../general/discordBot";
import { Logs } from '../general/logs';
import { DB, Player } from "../general/db";
import { Collection, Guild, GuildBasedChannel, GuildMember, NonThreadGuildBasedChannel, TextChannel, channelMention } from 'discord.js';
import { readFileSync } from 'fs';
import * as readLine from 'readline';

const p = require("../package.json")


//bot ID:1218688003262644334
const bot = DiscordBot.getInstance();

const database = new DB();

Logs.init();
Logs.log(`Started to broadcast to servers`);





(async () => {

    await bot.init(database, false);

    const guilds: Collection<string, Guild> = await bot.getGuilds();

    const channels: TextChannel[] = await getChannelsWithMessages(guilds.map(guild => guild));

    const path = process.argv[2];
    const message = readFileSync(path, 'utf8');
    console.log(`Message: ${message}`);

    await Promise.all(channels.map(channel => console.log(`guild: ${channel.guild.name}; channel: ${channel.name}`)));


    const rl = readLine.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Do you want to send the message to these channels? Pick "e" if you also want to ping everyone (y/e/n)\n', (answer) => {

        if (answer.toLowerCase() === 'e') {
            console.log('Sending with ping');
            channels.forEach(channel => {
                channel.send("@everyone " + message);
            });
        }
        else if (answer.toLowerCase() === 'y') {
            console.log('Sending without ping');
            channels.forEach(channel => {
                channel.send(message);
            });
        }

        // process.exit(0);
    });

})();

async function getChannelsWithMessages(guilds: Guild[]): Promise<TextChannel[]> {
    const channels: TextChannel[] = [];

    for (const guild of guilds) {
        const guildChannels = guild.channels.cache.filter(channel => channel.type === 0 &&
            channel.permissionsFor(guild.members.me).has('ViewChannel'))
            .map(channel => channel as TextChannel);

        for (const channel of guildChannels) {
            const messages = await channel.messages.fetch({ limit: 30 });
            const botId = guild.members.me.id;

            if (messages.some(message => message.author.id === botId)) {
                channels.push(channel);
            }

        }
    }
    return channels;
}