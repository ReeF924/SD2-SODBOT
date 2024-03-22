`use strict`

import {CommonUtil} from "./common";
import {Client, Message, IntentsBitField, EmbedBuilder, Collection, SlashCommandBuilder} from "discord.js";
import {Logs} from "./logs";
import {Replays} from "../results/replays";
import {Permissions, PermissionsSet} from "./permissions"
import {DB} from "./db";

const {GatewayIntentBits} = require('discord.js');

export type BotCommand = (message: Message, input: string[], perm?: PermissionsSet) => void;

export class DiscordBot {

    static bot: Client;
    private commands: Map<string, BotCommand> = new Map<string, BotCommand>();
    private database: DB;

    constructor(database: DB) {
        //this.loadBlacklist();
        this.database = database;

        const intents = new IntentsBitField([IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.MessageContent]);

        DiscordBot.bot = new Client({intents: intents});

        DiscordBot.bot.on("messageCreate", this.onMessage.bind(this));
        DiscordBot.bot.on("ready", async () => {
            await this.onReady(database);
        });
        DiscordBot.bot.on("error", this.onError.bind(this));
        // DiscordBot.bot.on('', this.onError.bind(this));
    }

    login(): void {
        DiscordBot.bot.login(process.env.DISCORD_TOKEN);
    }

    registerCommand(command: string, funct: BotCommand): void {
        this.commands[command] = funct;
    }

    removeCommand(command: string): void {
        this.commands.delete(command);
    }

    private onError(message: unknown) {
        Logs.error(message)
    }

    private runCommand(message: Message, command: string, perms: PermissionsSet) {
        let input: string[] = [];
        const ii = message.content.indexOf(" ");
        if (ii > 0) {
            const i = message.content.substr(ii + 1);
            input = i.split(/,/);
            for (const index in input) {
                input[index] = input[index]
                    //.replace(/&/g, "&amp;")
                    //.replace(/"/g, "&quot;") //why we do this?
                    .trim();
            }
        }
        if (this.commands[command]) {
            this.commands[command](message, input, perms);
        } else {
            MsgHelper.reply(message, "Unknown Command. Did you mean " + CommonUtil.config("prefix") + CommonUtil.lexicalGuesser(command, Object.keys(this.commands)))
        }
    }

    private async onMessage(message: Message) {
        let channel, guild;
        if (message.channel) channel = message.channel.id;
        if (message.guild) guild = message.guild.id;
        if (message.content.startsWith(CommonUtil.config("prefix"))) {
            const perms = Permissions.getPermissions(channel, guild, this.database);
            if (!(await perms).areCommandsBlocked) {
                const inputList = message.content
                    .substr(1, message.content.length)
                    .toLowerCase()
                    .replace(/\n/g, " ")
                    .split(" ");
                const command = inputList[0];

                this.runCommand(message, command, (await perms));
                Logs.log(`Command: "${command}" by ${message.author.username} in ${message.guild.name}`);
            }
        }
        const perms = await Permissions.getPermissions(channel, guild, this.database);

        if (perms.areReplaysBlocked) return;

        const replays = [...message.attachments.values()].filter((a) => a.url.includes(".rpl3"));
        replays.forEach((r) => {
            Logs.log(`Replay: sent by ${message.author.username} in ${message.guild.name} in channel ${message.channel.id}`);
            try {
                Replays.extractReplayInfo(message, perms, this.database, r.url);
            }
            catch (e){
                Logs.error(e);
                message.reply('Error processing replay, contact <@607962880154927113>');
            }
        });
    }

    private async onReady(database: DB) {
        Logs.log(`Bot Online!`);
        DiscordBot.bot.user.setActivity("Use " + CommonUtil.config("prefix") + "help to see commands!", {
            type: 2
        });

    }
}

export interface DiscordCommand {
    data: SlashCommandBuilder;
    execute: (message: Message) => Promise<void>;
}

export class MsgHelper {

    static reply(message: Message, content: string): void {
        message.reply(`${message.author} ${content}`);
    }

    static say(message: Message, content: string): void {
        message.channel.send(content);
    }

    static sendEmbed(message: Message, content: EmbedBuilder): void {
        message.channel.send({embeds: [content]});
    }

    static dmUser(message: Message, content: string): void {
        message.author.send(content);
    }

}
