`use strict`

import { CommonUtil } from "./common";
import {
    Client,
    Message,
    IntentsBitField,
    EmbedBuilder,
    SlashCommandBuilder,
    Collection,
    ChatInputCommandInteraction,
    REST,
    Routes,
    Guild, TextChannel, User, PermissionsBitField, GuildMember
} from "discord.js";

import { Logs } from "./logs";
import { Replays } from "../results/replays";
import brc from "../scripts/broadcast";

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

    constructor(broadcast: boolean = false) {
        //this.loadBlacklist();

        const intents = new IntentsBitField([IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages,
            IntentsBitField.Flags.GuildMembers, IntentsBitField.Flags.MessageContent]);

        this.DiscordClient = new DiscordClient(intents, new Collection());

        this.DiscordClient.on("ready", () => this.onReady(broadcast));

        this.DiscordClient.on("interactionCreate", (interaction: ChatInputCommandInteraction) => this.onInteraction(interaction));

        this.DiscordClient.on("messageCreate", async (message: Message) => {
            if (message.author.bot) return;
            await this.onMessage(message);
        });

        this.initBot(!broadcast);

    }
    private async initBot(registerCommands: boolean = true): Promise<void> {
        const token = process.env.DISCORD_TOKEN;

        await this.DiscordClient.login(token);

        if (!registerCommands) return;

        const rest = new REST().setToken(process.env.DISCORD_TOKEN);
        await this.registerCommands(rest);
    }

    public registerCommand(slashCommand: SlashCommandBuilder, commandBody: (interaction: ChatInputCommandInteraction) => Promise<void>): void {
        this.DiscordClient.commands.set(slashCommand.name, { data: slashCommand, execute: commandBody });
    }

    private async registerCommands(rest: REST): Promise<void> {
        try {
            const commandsArray = this.DiscordClient.commands.map(command => command.data.toJSON());

            await rest.put(Routes.applicationCommands(this.DiscordClient.user.id),
                {body: commandsArray}
            );

            Logs.log(`Successfully reloaded application (/) commands.`);
        } catch (error) {
            // And of course, make sure you catch and log any errors!
            console.error(error);
        }
    }

    public async getAdmin():Promise<User> {
        return await this.DiscordClient.users.fetch(admins[0]);
    }

    private onError(message: unknown) {
        Logs.error(message)
    }

    private async onInteraction(interaction: ChatInputCommandInteraction) {
        if (!interaction.isChatInputCommand()){
            console.log("Unknown command");

            await MsgHelper.reply(interaction, "Unknown command. Try /help", true);
            return;
        }



        //logs the command and its args (for debugging in production lmao (bro I swear people are able to fuck up the bot in ways I just can't imagine))
        if(interaction.guild)
            //to avoid crashes (will delete the null checks later)
            console.log(`User ${interaction.user?.username ?? 'undefined'} ` +
            `in ${interaction.guild?.name ?? 'undefined'}:${interaction.channel?.name ?? 'undefined'}` +
            `used ${interaction.commandName} with args ${JSON.stringify(interaction.options) ?? null}`);
        else{
            console.log(`User ${interaction.user?.username } in DM's used ${interaction.commandName} with args ${JSON.stringify(interaction.options) ?? null}`);
        }

        const command: SodbotCommand | undefined = this.DiscordClient.commands.get(interaction.commandName);

        //probably not needed
        if (!command) {
            await MsgHelper.reply(interaction, "Unknown command. Try /help", true);
            return;
        }

        try{
            await command.execute(interaction);
        }
        catch(error) {
            console.error("Error while executing slash command: ",error);
           if(interaction.deferred){
               await interaction.editReply("Error while executing a command.");
               return;
           }
           await MsgHelper.reply(interaction, "Error while executing a command.");
        }
    }

    private async onMessage(message: Message) {

        //the bot might not have a permission to write in the channel, this alerts the admins and the sender
        if (message.content.startsWith("$")) {
            await message.reply("Please use / instead of $ for commands. For more information, use /help");
            return;
        }

        const replays = Array.from(message.attachments.values()).filter((a) => a.url.includes(".rpl3"));
        replays.forEach((r) => {
            const channel = message.channel as TextChannel;

            // Logs.log(`Replay: sent by ${message.author.username} in ${message.guild.name} in channel ${channel.name}`);

            try {
                Replays.responseToReplay(message, r.url);
            } catch (e) {
                Logs.error(e);
                                                                //my discord ID (Reef)
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

    //test

    public async getGuilds(): Promise<Collection<string, Guild>> {
        return this.DiscordClient.guilds.cache;
    }
}

export class MsgHelper {

    public static async reply(interaction: ChatInputCommandInteraction, content: string, secret: boolean = false) {
        return interaction.reply({ content: content, ephemeral: secret });
    }

    public static async sendEmbeds(interaction: ChatInputCommandInteraction, content: EmbedBuilder[], secret: boolean = false) {
        return await interaction.reply({ embeds: content, ephemeral: secret });
    }

    public static async sendMessage(m:Message, message:string) {
        if(!MsgHelper.HasSendMessagePerms(m)){
            await MsgHelper.AlertAdminsAndUser(m, this.getAlert(m))
            return;
        }

        await m.channel.send(message);
    }


    public static async sendEmbedMessage(m:Message, embeds:EmbedBuilder[]) {
        if(!MsgHelper.HasSendMessagePerms(m)){
            await MsgHelper.AlertAdminsAndUser(m, this.getAlert(m))
            return;
        }

        await m.channel.send({ embeds: embeds });
    }

    public static async DmUser(user:User, message:string){
       try{
           await user.send(message);
       }
       catch(err){
           //person has blocked DM's
       }
    }

    public static getAlert(message:Message): string {
        const channel: any = message.channel;

        if(channel.name){
            return `The bot has view channel permission in guild ${message.guild.name} in channel ${channel.name}, ` +
               `but not send messages permission. Please either remove the view channel permission or add the send message permission ` +
               `(removing the view permission will not affect the bot's ability to respond to slash commands in that channel).`
        }

        return `The bot has view channel permission in guild ${message.guild.name} in one of your channels, ` +
               `but not send messages permission. Please either remove the view channel permission or add the send message permission ` +
               `(removing the view permission will not affect the bot's ability to respond to slash commands in that channel).`
    }

    public static HasSendMessagePerms(message: Message): boolean{

        if (message.guild && message.channel) {

            if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.SendMessages)
                && !message.guild.members.me.permissions.has(PermissionsBitField.Flags.EmbedLinks)) {

                return false;
            }
        }
        return true;
    }
    public static async AlertAdminsAndUser(message: Message, adminAlert: string): Promise<void> {

        const admins = await getAdmins(message.guild);

        //as long as it isn't DM's it has to have a name
        const channel = await message.channel.fetch() as any;

        await Promise.all(
            admins.map(async (admin) => {
                try {
                    await admin.send(adminAlert);
                } catch (err) {
                    console.error(`Failed to DM ${admin.user.tag}:`, err);
                }
            })
        );

        await this.DmUser(message.author,
            "The bot doesn't have write permissions in this channel, please try different one (admin team has been alerted of the issue).")
    }
}

async function getAdmins(guild: Guild) :Promise<Collection<string, GuildMember>> | null{
    try {
        await guild.members.fetch();

        const members = await guild.members.fetch();

        return members.filter(member => member.permissions.has(PermissionsBitField.Flags.Administrator));
    }catch(e) {
        return null;
    }
}
