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
    Routes,
    GuildManager,
    Guild
} from "discord.js";

import { Logs } from "./logs";
import { Replays } from "../results/replays";
import { Permissions, PermissionsSet } from "./permissions"
import { DB } from "./db";
import brc from "../scripts/broadcast";

export type BotCommand = (message: Message, input: string[], perm?: PermissionsSet) => void;

export const admins: string[] = ["607962880154927113"];

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
    // private commands: Map<string, BotCommand> = new Map<string, BotCommand>();
    private database: DB;

    constructor(database: DB, broadcast: boolean = false) {
        //this.loadBlacklist();
        this.database = database;

        const intents = new IntentsBitField([IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.MessageContent]);

        this.DiscordClient = new DiscordClient(intents, new Collection());

        this.DiscordClient.on("ready", () => this.onReady(broadcast));

        this.DiscordClient.on("interactionCreate", (interaction: ChatInputCommandInteraction) => this.onInteraction(interaction));

        this.DiscordClient.on("messageCreate", (message: Message) => {
            if (message.author.bot) return;
            this.onMessage(message);
        });

        this.database = database;

        const token = process.env.DISCORD_TOKEN;

        this.initBot(database, !broadcast);

    }
    private async initBot(database: DB, registerCommands: boolean = true): Promise<void> {
        this.database = database;

        const token = process.env.DISCORD_TOKEN;

        await this.DiscordClient.login(token);

        if (!registerCommands) return;

        const rest = new REST().setToken(process.env.DISCORD_TOKEN);
        this.registerCommands(rest);
    }

    public registerCommand(slashCommand: SlashCommandBuilder, commandBody: (interaction: ChatInputCommandInteraction) => Promise<void>): void {
        this.DiscordClient.commands.set(slashCommand.name, { data: slashCommand, execute: commandBody });
    }

    private async registerCommands(rest: REST): Promise<void> {
        try {
            const commandsArray = this.DiscordClient.commands.map(command => command.data.toJSON());

            const data = await rest.put(Routes.applicationCommands(this.DiscordClient.user.id), {
                body: commandsArray
            });

            Logs.log(`Successfully reloaded application (/) commands.`);
        } catch (error) {
            // And of course, make sure you catch and log any errors!
            console.error(error);
        }
    }


    private onError(message: unknown) {
        Logs.error(message)
    }

    private async onInteraction(interaction: ChatInputCommandInteraction) {
        if (!interaction.isChatInputCommand()) return;

        const command: SodbotCommand | undefined = this.DiscordClient.commands.get(interaction.commandName);

        //propably not needed, but y not :D
        if (!command) {
            interaction.reply("unknown command");
            return;
        }

        command.execute(interaction);
    }

    private async onMessage(message: Message) {
        // const perms = await Permissions.getPermissions(channel, guild, this.database);

        // if (perms.areReplaysBlocked) return;

        if (message.content.startsWith("$")) {
            message.reply("Please use / instead of $ for commands. For more information, use /help");
            return;
        }

        const replays = Array.from(message.attachments.values()).filter((a) => a.url.includes(".rpl3"));
        replays.forEach((r) => {
            Logs.log(`Replay: sent by ${message.author.username} in ${message.guild.name} in channel ${message.channel.id}`);
            try {
                Replays.extractReplayInfo(message, r.url);
            } catch (e) {
                Logs.error(e);
                message.reply('Error processing replay, contact <@607962880154927113>');
            }
        });
    }

    private async onReady(broadcast: boolean) {
        Logs.log(`Bot Online!`);
        this.DiscordClient.user.setActivity("Use " + CommonUtil.config("prefix") + "help to see commands!", {
            type: 2
        });

        if (!broadcast) return;

        await brc(this);
    }

    public async getGuilds(): Promise<Collection<string, Guild>> {
        const data = this.DiscordClient.guilds.cache;
        return data;
    }
}

export class MsgHelper {

    static reply(interaction: ChatInputCommandInteraction, content: string, secret: boolean = false) {
        return interaction.reply({ content: content, ephemeral: secret });
    }

    static say(interaction: ChatInputCommandInteraction, content: string) {
        return interaction.channel.send(content);
    }

    static sendEmbed(interaction: ChatInputCommandInteraction, content: EmbedBuilder[], secret: boolean = false) {
        return interaction.reply({ embeds: content, ephemeral: secret });
    }

    static dmUser(interaction: ChatInputCommandInteraction, content: string)  {
        return interaction.user.send(content);
    }

}
