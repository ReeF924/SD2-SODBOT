`use strict`

import { CommonUtil } from "./common";
import {
    Client,
    Message,
    IntentsBitField,
    EmbedBuilder,
    SlashCommandBuilder,
    Collection,
    BaseInteraction, ChatInputCommandInteraction,
    REST,
    Routes
} from "discord.js";

import { Logs } from "./logs";
import { Replays } from "../results/replays";
import { Permissions, PermissionsSet } from "./permissions"
import { DB } from "./db";

export type BotCommand = (message: Message, input: string[], perm?: PermissionsSet) => void;

class DiscordClient extends Client {
    public commands: Collection<string, SodbotCommand>;

    constructor(intents: IntentsBitField, commands: Collection<string, SlashCommandBuilder>) {
        super({ intents: intents });
        this.commands = new Collection();
    }
}

export class SodbotCommand {
    data: SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
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

        // const client = new Client({intents: intents});
        this.DiscordClient = new DiscordClient(intents, new Collection());

        this.DiscordClient.on("ready", () => this.onReady(database));
        // this.DiscordClient.on("messageCreate", (message) => this.onMessage(message));
        this.DiscordClient.on("interactionCreate", (interaction: ChatInputCommandInteraction) => {
            if (!interaction.isChatInputCommand()) return;

            const command: SodbotCommand | undefined = this.DiscordClient.commands.get(interaction.commandName);

            //not sure if this is needed, but y not :D
            if (!command) {
                interaction.reply("unknown command");
                return;
            }

            command.execute(interaction);

            // interaction.reply("success");
        });

        this.DiscordClient.on("messageCreate", (message: Message) => {
            if (message.author.bot) return;
            this.onMessage(message);
        });



    }
    public init(database: DB): void {
        this.database = database;
        this.DiscordClient.login(process.env.DISCORD_TOKEN);


        //registering commands
        const rest = new REST().setToken(process.env.DISCORD_TOKEN);
        (async () => {
            try {
                const commandsArray = this.DiscordClient.commands.map(command => command.data.toJSON());

                const data = await rest.put(Routes.applicationCommands("1218688003262644334"), {
                    body: commandsArray
                });

                Logs.log(`Successfully reloaded application (/) commands.`);
            } catch (error) {
                // And of course, make sure you catch and log any errors!
                console.error(error);
            }
        })();

    }

    public static getInstance(): DiscordBot {
        if (!this.instance) {
            this.instance = new DiscordBot(new DB());
        }
        return this.instance;
    }

    registerCommand(slashCommand: SlashCommandBuilder, commandBody: (interaction: ChatInputCommandInteraction) => Promise<void>): void {
        this.DiscordClient.commands.set(slashCommand.name, { data: slashCommand, execute: commandBody });

    }

    // removeCommand(command: string): void {
    //     const index = this.DiscordClient.commands.findIndex((c) => c.name === command);
    //     if (index >= 0) {
    //         this.DiscordClient.commands.splice(index, 1);
    //     }
    // }

    private onError(message: unknown) {
        Logs.error(message)
    }
    private async onMessage(message: Message) {
        // let channel, guild;
        // if (message.channel) channel = message.channel.id;
        // if (message.guild) guild = message.guild.id;
        // if (message.content.startsWith(CommonUtil.config("prefix"))) {
        //     const perms = Permissions.getPermissions(channel, guild, this.database);

        //     //he trimms the '$' here, watch out for that
        //     if (!(await perms).areCommandsBlocked) {
        //         const inputList = message.content
        //             .substr(1, message.content.length)
        //             .toLowerCase()
        //             .replace(/\n/g, " ")
        //             .split(" ");
        //         const command = inputList[0];

        //         // this.runCommand(message, command, (await perms));
        //         Logs.log(`Command: "${command}" by ${message.author.username} in ${message.guild.name}`);
        //     }
        // }
        // const perms = await Permissions.getPermissions(channel, guild, this.database);

        // if (perms.areReplaysBlocked) return;

        const replays = [...message.attachments.values()].filter((a) => a.url.includes(".rpl3"));
        replays.forEach((r) => {
            Logs.log(`Replay: sent by ${message.author.username} in ${message.guild.name} in channel ${message.channel.id}`);
            try {
                Replays.extractReplayInfo(message, this.database, r.url);
            } catch (e) {
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

export class MsgHelper {

    static reply(interaction: ChatInputCommandInteraction, content: string): void {
        interaction.reply(content);
    }

    static replySecret(interaction: ChatInputCommandInteraction, content: string): void {
        interaction.reply({ content: content, ephemeral: true });
    }

    static say(interaction: ChatInputCommandInteraction, content: string): void {
        interaction.channel.send(content);
    }

    static sendEmbed(interaction: ChatInputCommandInteraction, content: EmbedBuilder): void {
        interaction.channel.send({ embeds: [content] });
    }

    static dmUser(interaction: ChatInputCommandInteraction, content: string): void {
        interaction.user.send(content);
    }

}
