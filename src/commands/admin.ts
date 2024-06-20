import {ChatInputCommandInteraction, Message, SlashCommandBuilder, TextChannel} from "discord.js";
import {admins, DiscordBot, MsgHelper} from "../general/discordBot";
import {getChannel, postChannel} from '../db/admins/adminsService';
import {mapStringToEnum} from '../db/dbService';
import {MapType, SkillLevel} from "../db/replays/replaysModels";
import {Replays} from "../results/replays";


export class AdminCommand {

    public constructor() {

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

        try {
            if (type === null) {
                const channel = await getChannel(parseInt(interaction.channel.id));

                if (channel === null) {
                    MsgHelper.reply(interaction, "Replays in this channel are considered others level.", true);
                    return;
                }

                MsgHelper.reply(interaction, `Replays in this channel are considered ${SkillLevel[channel.skillLevel]} level.`, true);
                return;
            }
        } catch (e) {
            MsgHelper.reply(interaction, "Error getting replay type for channel", true);
            return;
        }

        if (!this.checkAccess(interaction)) {
            MsgHelper.reply(interaction, "You do not have the admin access to use this command", true);
            return;
        }

        let replayType: SkillLevel = SkillLevel[type as keyof typeof SkillLevel];

        const response = await postChannel({
            Id: parseInt(interaction.guild.id),
            Name: interaction.guild.name,
            Channel: {
                Id: parseInt(interaction.channel.id),
                Name: interaction.channel.name,
                SkillLevel: replayType,
                PrimaryMode: 0
            }
        });

        if (typeof response === "string") {
            MsgHelper.reply(interaction, "Error setting replay type for channel", true);
            return;
        }
        MsgHelper.reply(interaction, `Replay type set to ${SkillLevel[replayType]} for this channel.`, true);
    }

    private async yoink(interaction: ChatInputCommandInteraction): Promise<void> {

        if (!this.checkAccess(interaction)) {
            MsgHelper.reply(interaction, "You do not have the admin access to use this command", true);
            return;
        }

        const dateString = interaction.options.getString("date");

        // const version = interaction.options.getNumber("version");
        //
        // let count = interaction.options.getInteger("count");

        const channel: TextChannel = interaction.channel as TextChannel;

        const date = new Date(parseInt(dateString.substring(0, 4)), parseInt(dateString.substring(4, 6)) - 1, parseInt(dateString.substring(6, 8)));

        interaction.reply("starting to yoink messages");

        const messages = await this.getMessages(channel, date, undefined);

        let counter = 0;
        let failed = 0;


        for (let i = 0; i < messages.length; i++) {

            let message = messages[i];

            if (!message || !message.attachments) {
                continue;
            }

            const replays = Array.from(message.attachments.values()).filter((a) => a.url.includes(".rpl3"));

            for (let j = 0; j < replays.length; j++) {
                const r = replays[j];

                try {
                    await Replays.extractReplayInfo(message, r.url, false);
                    counter++;

                } catch (e) {
                    console.error(`Failed to upload a replay ${message.createdAt.toDateString()}`);
                    failed++;
                }
            }


            if (counter % 10 === 0 - replays.length + 1) {
                interaction.editReply(`Processing. Already yoinked ${counter} replays. Failed ${failed}`);
            }

        }
        interaction.editReply(`Yoinked ${counter} replays. Failed ${failed}`);
        console.log("Mischief achieved")

    }

    private async getMessages(channel: TextChannel, date: Date, lastMessageId: string): Promise<Message[]> {

        // let messages = await channel.messages.fetch({limit: 1});
        // messages.clear();

        const messages: Message<true>[] = [];
        let done = false;
        let counter = 0;

        while (!done && counter < 5) {
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

        return messages;
    }


    private checkAccess(interaction: ChatInputCommandInteraction): boolean {
        return admins.includes(interaction.user.id);
    }

    public addCommands(bot: DiscordBot): void {
        const setReplayType = new SlashCommandBuilder()
            .setName("replaytype").setDescription("Sets the channel to be a replay channel");

        setReplayType.addStringOption(option =>
            option.setName("type").setDescription("The type of replay channel to set")
                .addChoices(
                    {name: "div1", value: "div1"}, {name: "div2", value: "div2"},
                    {name: "div3", value: "div3"}, {name: "div4", value: "div4"},
                    {name: "div5", value: "div5"}, {name: "others", value: "others"}
                ).setRequired(false))

        bot.registerCommand(setReplayType, this.setReplayType.bind(this));

        const yoink = new SlashCommandBuilder()
            .setName("yoink").setDescription("Sneaky bot sneaky bot");

        // yoink.addNumberOption(option => option.setName("version")
        //     .setDescription("Oldest version to accept.").setRequired(false))
        yoink.addStringOption(option => option.setName("date").setDescription("Oldest possible date. Format yyyyMMdd").setRequired(true))
        // .addIntegerOption(option =>
        //     option.setName("count").setDescription("Max count of messages to go through. Default: If date is set - Unlimited. Otherwise 100").setRequired(false));


        bot.registerCommand(yoink, this.yoink.bind(this));
    }
}
