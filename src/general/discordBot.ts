`use strict`

import {CommonUtil} from "./common";
import {Client, Message, IntentsBitField, EmbedBuilder, SlashCommandBuilder, Collection} from "discord.js";
import {Logs} from "./logs";
import {Replays} from "../results/replays";
import {Permissions, PermissionsSet} from "./permissions"
import {DB} from "./db";

export type BotCommand = (message: Message, input: string[], perm?: PermissionsSet) => void;
class DiscordClient extends Client{
    commands: Collection<string, SlashCommandBuilder>;
    constructor(intents: IntentsBitField, commands: Collection<string, SlashCommandBuilder>){
        super({intents: intents});
        this.commands = new Collection();
    }
}
export class DiscordBot {
    public DiscordClient: DiscordClient;
    private static instance: DiscordBot;
    // private commands: Map<string, BotCommand> = new Map<string, BotCommand>();
    private database: DB;

    private constructor(database: DB) {
        //this.loadBlacklist();
        this.database = database;

        const intents = new IntentsBitField([IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.MessageContent]);

        const client = new Client({intents: intents});
        this.DiscordClient = new DiscordClient(intents, new Collection());


    }

    public static getInstance(database: DB): DiscordBot {
        if (!this.instance) {
            this.instance = new DiscordBot(database);
        }
        return this.instance;   
    }

    login(): void {
        this.DiscordClient.login(process.env.DISCORD_TOKEN);
    }

    registerCommand(slashCommand: SlashCommandBuilder, commandFunc): void {
        this.DiscordClient.commands.set(slashCommand.name ,slashCommand);
    }

    removeCommand(command: string): void {
        const index = this.DiscordClient.commands.findIndex((c) => c.name === command);
        if (index >= 0) {
            this.DiscordClient.commands.splice(index, 1);
        }
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
        this.DiscordClient.user.setActivity("Use " + CommonUtil.config("prefix") + "help to see commands!", {
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
