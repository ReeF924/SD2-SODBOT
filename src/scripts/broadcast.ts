
import { Collection, Guild, TextChannel} from 'discord.js';
import { readFileSync } from 'fs';
import * as readLine from 'readline';
import { DiscordBot } from "../general/discordBot";


//sends a message to all channels where the bot has sent a message in the last 30 messages
//the message is read from a file, you can add everyone ping by typing "e" in the confirmation prompt
//add the path to the message file as an argument
//this executes in discordBot in onReady(), I dunno how else I'd await the bot startup
//maybe events are a better way, but I dunno how they work here, so it's like this for now


async function broadcast(bot: DiscordBot) {

    const guilds: Collection<string, Guild> = await bot.getGuilds();

    console.log(`Found ${guilds.size} guilds`);

    const channels: TextChannel[] = await getChannelsWithMessages(guilds.map(guild => guild));

    const path = process.argv[2];
    const message = readFileSync(path, 'utf8');
    console.log(`Message: ${message}`);


    channels.forEach(channel => {
        console.log(`Guild: ${channel.guild.name}; Channel: ${channel.name}`);
    });

    const rl = readLine.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Do you want to send the message to these channels? Pick "e" if you also want to ping everyone (y/e/n)\n',
        async (answer) => {

            if (answer.toLowerCase() === 'e') {
                console.log('Sending with ping');
                for (let i = 0; i < channels.length; i++) {
                    await channels[i].send("@everyone " + message);
                }
            }
            else if (answer.toLowerCase() === 'y') {
                console.log('Sending without ping');
                for (let i = 0; i < channels.length; i++) {
                    await channels[i].send(message);
                }
            }

            process.exit(0);
        });

};

declare type guildChannel = {
    channel: TextChannel,
    botMessages: number
}

export async function getChannelsWithMessages(guilds: Guild[]): Promise<TextChannel[]> {
    const output: TextChannel[] = [];


    for (const guild of guilds) {
        const channels: guildChannel[] = [];
        const guildChannels = guild.channels.cache.filter(channel => channel.type === 0 &&
            channel.permissionsFor(guild.members.me).has('ViewChannel'))
            .map(channel => channel as TextChannel);

        console.log(`Guild: ${guild.name} - ${guildChannels.length} channels found`);

        for (const channel of guildChannels) {
            const messages = await channel.messages.fetch({ limit: 30 });
            const botId = guild.members.me.id;

            // if (messages.some(message => message.author.id === botId)) {
            //     channels.push(channel);
            // }

            let messageCount = 0;

            messages.forEach(message => {
                if (message.author.id === botId) {
                    messageCount++;
                }
            });

            if (messageCount > 0) {
                channels.push({ channel, botMessages: messageCount });
            }
        }


        //check if there is at least one public
        //if more than one, find the one with the most message

        const everyone = guild.roles.everyone;

        const publicChannels = channels.filter(guildChannel => {
            const perm = guildChannel.channel.permissionsFor(everyone).has('ViewChannel');
            console.log(`Channel: ${guildChannel.channel.name} - ${perm}`);
            return perm;
        });

        if (publicChannels.length > 1) {

            const primary = publicChannels.reduce((prev, curr) => {
                return prev.botMessages > curr.botMessages ? prev : curr;
            });

            output.push(primary.channel);
            continue;
        }

        else if (publicChannels.length === 1) {
            output.push(publicChannels[0].channel);
            continue;
        }

        console.log(`No public channels found for guild ${guild.name}`);
        channels.forEach(guildChannel => output.push(guildChannel.channel));
    }

    return output;
}

export default broadcast;