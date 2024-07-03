import {ChatInputCommandInteraction, Message, SlashCommandBuilder, TextChannel} from "discord.js";
import {admins, DiscordBot, MsgHelper} from "../general/discordBot";
import {getChannel, postChannel} from '../db/services/adminsService';
import {SkillLevel} from "../db/models/replay";
import {Replays} from "../results/replays";
import {dbChannel, Franchise} from "../db/models/admin";


export class AdminCommand {

    public constructor(private bot: DiscordBot) {
    }


    // private async setChannelPrems(interaction: Message, input: string[]) {
    //     let user = await this.database.getDiscordUser(interaction.user.id)
    //     let prem = {
    //         id: "",
    //         name: "",
    //         blockElo: 0,
    //         blockCommands: 0,
    //         blockReplay: 0,
    //         blockChannelElo: 0,
    //         blockServerElo: 0,
    //         blockGlobalElo: 0
    //     }

    //     const bot = DiscordBot.getInstance();

    //     //Check if requestor has admin access
    //     if (user.globalAdmin == true) {
    //         // Check if formatted correctly
    //         if (input.length == 1) {
    //             interaction.reply("This command requires a channel id and one or more premission commands to be correctly formatted")
    //             return
    //         }
    //         else if (input.length > 1) {
    //             // Check if server is already in ChannelBlacklist table
    //             prem = await this.database.getChannelPermissions(input[0])
    //             console.log(prem)
    //             let channel = bot.channels.cache.get(input[0])
    //             // If it isn't create a default
    //             if (prem == null) {
    //                 prem = {
    //                     id: input[0],
    //                     name: (channel as GuildChannel).name,
    //                     blockElo: -1,
    //                     blockCommands: -1,
    //                     blockReplay: -1,
    //                     blockChannelElo: -1,
    //                     blockServerElo: -1,
    //                     blockGlobalElo: -1
    //                 }
    //             }
    //             // Update the settings
    //             for (let x = 1; x < input.length; x++) {
    //                 let command = input[x]
    //                 switch (command) {
    //                     case "blockElo":
    //                         prem.blockElo = 1
    //                         break;
    //                     case "blockCommands":
    //                         prem.blockCommands = 1
    //                         break;
    //                     case "blockReplay":
    //                         prem.blockReplay = 1
    //                         break;
    //                     case "blockChannelElo":
    //                         prem.blockChannelElo = 1
    //                         break;
    //                     case "blockServerElo":
    //                         prem.blockServerElo = 1
    //                         break;
    //                     case "blockGlobalElo":
    //                         prem.blockGlobalElo = 1
    //                         break;
    //                     case "blockall":
    //                         prem.blockElo = 1
    //                         prem.blockCommands = 1
    //                         prem.blockReplay = 1
    //                         prem.blockChannelElo = 1
    //                         prem.blockServerElo = 1
    //                         prem.blockGlobalElo = 1
    //                         break;
    //                     default:
    //                         console.log("we in in default of the case statement" + command);
    //                         interaction.reply("One of the permission settings is not a valid command");
    //                 }
    //             }
    //             await this.database.setChannelPermissions(prem);
    //             MsgHelper.replyPing(interaction, "The permission settings of Discord channel " + (channel as GuildChannel).name + " has been updated ")
    //         }
    //         else {
    //             interaction.reply("This command is not correctly formatted, it requires one channel as a argument");
    //             return
    //         }

    //     }
    //     else {
    //         interaction.reply("You do not have the admin access to use this command")
    //         return
    //     }
    // }
    // private async resetChannelPrems(interaction: Message, input: string[]) {
    //     let channel = DiscordBot.bot.channels.cache.get(input[0])
    //     if (input.length === 1) {
    //         let prem = {
    //             id: input[0],
    //             name: (channel as GuildChannel).name,
    //             blockElo: -1,
    //             blockCommands: -1,
    //             blockReplay: -1,
    //             blockChannelElo: -1,
    //             blockServerElo: -1,
    //             blockGlobalElo: -1
    //         }
    //         await this.database.setChannelPermissions(prem);
    //         MsgHelper.replyPing(interaction, "The permission settings of Discord channel " + (channel as GuildChannel).name + " has been reset back to default settings.")
    //     }
    //     else {
    //         MsgHelper.replyPing(interaction, "Command not formatted correctly, this command just takes a channel id only as its argument")
    //     }
    // }

    private async setReplayType(interaction: ChatInputCommandInteraction) {

        const type = interaction.options.getString("type");

        if (type === null) {
            await interaction.deferReply({ephemeral: true});

            const response = await this.GetReplayType(interaction.channel.id);

            interaction.followUp({content: response, ephemeral: true});
            return;
        }

        if (!this.checkAccess(interaction)) {
            MsgHelper.reply(interaction, "You do not have the admin access to use this command", true);
            return;
        }

        await interaction.deferReply({ephemeral: true});
        let replayType: SkillLevel = SkillLevel[type as keyof typeof SkillLevel];

        const response = await postChannel({
            Id: interaction.guild.id,
            Name: interaction.guild.name,
            Channel: {
                Id: interaction.channel.id,
                Name: interaction.channel.name,
                SkillLevel: replayType,
                PrimaryMode: Franchise.sd2
            }
        });

        if (typeof response === "string") {
            interaction.followUp({content: "Error setting replay type for channel", ephemeral: true});
            return;
        }
        interaction.followUp({
            content: `Replay type set to ${SkillLevel[replayType]} for this channel.`,
            ephemeral: true
        });
    }

    private async GetReplayType(channelId: string): Promise<string> {

        try {
            let channel = await getChannel(channelId);

            if (typeof channel === "string") {
                return "Replays in this channel are considered others level."
            }

            channel = channel as dbChannel;
            return `Replays in this channel are considered ${SkillLevel[channel.skillLevel]} level.`;
        } catch (e) {
            console.log('error', e);
            return "Error getting replay type for channel";
        }
    }

    private async yoink(interaction: ChatInputCommandInteraction): Promise<void> {
        const reefy = await this.bot.getAdmin();

        if (!this.checkAccess(interaction)) {
            MsgHelper.reply(interaction, "You do not have the admin access to use this command", true);
            return;
        }


        const dateString = interaction.options.getString("date");

        // const version = interaction.options.getNumber("version");
        //
        // let count = interaction.options.getInteger("count");

        const channel: TextChannel = interaction.channel as TextChannel;

        const date = dateString
            ? new Date(parseInt(dateString.substring(0, 4)), parseInt(dateString.substring(4, 6)) - 1, parseInt(dateString.substring(6, 8)))
            : new Date(0);

        MsgHelper.reply(interaction, "starting to yoink messages", true);


        const messages = await this.getMessages(channel, date, undefined);
        const n = messages.length - 1;
        const tenPercent = Math.round(n / 10);

        let counter = 0;
        let failed = 0;

        for (let i = n; i >= 0; i--) {

            let message = messages[i];
            console.log(`${n - i}/${n}: ${message.createdAt.getFullYear()}/${message.createdAt.getMonth()}/${message.createdAt.getDate()}`);

            if (!message || !message.attachments) {
                continue;
            }

            const replays = Array.from(message.attachments.values()).filter((a) => a.url.includes(".rpl3"));

            for (let j = 0; j < replays.length; j++) {

                const r = replays[j];
                try {
                    //makes it a bit faster
                    if ((i + j) % 3 === 0) {
                        await Replays.extractReplayInfo(message, r.url, false);
                    }
                    else{
                        Replays.extractReplayInfo(message, r.url, false);
                    }

                    counter++;

                } catch (e) {
                    console.error(`Failed to upload a replay ${message.createdAt.toDateString()}`);
                    failed++;
                }
            }

            if ((n-i) % tenPercent === 0) {
                const percentage = 100 - Math.round(i / n * 100)
                console.log('Progress: ', percentage + '%');
                reefy.send(`Progress: ${percentage}% Date: ${message.createdAt.toDateString()}`);
            }

        }
        console.log("Mischief managed!");
        reefy.send("Yoinked " + counter + " replays, failed to yoink " + failed + " replays");

    }

    private async delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private async getMessages(channel: TextChannel, date: Date, lastMessageId: string): Promise<Message[]> {

        // let messages = await channel.messages.fetch({limit: 1});
        // messages.clear();

        const messages: Message<true>[] = [];
        let done = false;
        let counter = 0;
        const started = new Date();

        while (!done) {
            //to not get banned by DiscordAPI (fetch limit)
            if (counter % 40 === 0) {
                this.delay(started.getTime() - new Date().getTime());
            }

            const options = {limit: 100, before: lastMessageId};

            let fetched = await channel.messages.fetch(options);

            if (fetched.size === 0) {
                break;
            }

            const fetchSize = fetched.size;
            let lastFetched = fetched.last();

            fetched = fetched.filter(message => message.createdTimestamp > date.getTime() && message.attachments.size > 0);

            console.log(`fetched: ${fetchSize}, filtered: ${fetched.size}`);

            if (fetched.size > 0) {
                lastFetched = fetched.last();
            }

            lastMessageId = lastFetched.id;

            if (lastFetched.createdTimestamp < date.getTime()) {
                done = true;
                fetched = fetched.filter(message => message.createdTimestamp < date.getTime());
            }

            fetched.forEach(message => messages.push(message));

            counter++;
        }
        console.log(`Total messages: ${messages.length}`);

        return messages;
    }


    private checkAccess(interaction: ChatInputCommandInteraction): boolean {
        return admins.includes(interaction.user.id);
    }

    public addCommands(): void {
        const setReplayType = new SlashCommandBuilder()
            .setName("replaytype").setDescription("Sets the channel to be a replay channel");

        setReplayType.addStringOption(option =>
            option.setName("type").setDescription("The type of replay channel to set")
                .addChoices(
                    {name: "div1", value: "div1"}, {name: "div2", value: "div2"},
                    {name: "div3", value: "div3"}, {name: "div4", value: "div4"},
                    {name: "div5", value: "div5"}, {name: "others", value: "others"}
                ).setRequired(false))

        this.bot.registerCommand(setReplayType, this.setReplayType.bind(this));

        const yoink = new SlashCommandBuilder()
            .setName("yoink").setDescription("Sneaky, sneaky bot");

        // yoink.addNumberOption(option => option.setName("version")
        //     .setDescription("Oldest version to accept.").setRequired(false))
        yoink.addStringOption(option => option.setName("date").setDescription("Oldest possible date. Format yyyyMMdd").setRequired(false))
        // .addIntegerOption(option =>
        //     option.setName("count").setDescription("Max count of messages to go through. Default: If date is set - Unlimited. Otherwise 100").setRequired(false));

        this.bot.registerCommand(yoink, this.yoink.bind(this));
    }
}
