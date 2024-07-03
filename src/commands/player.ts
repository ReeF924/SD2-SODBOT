import { DiscordBot, MsgHelper } from "../general/discordBot";
import {ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder} from "discord.js";
import {player, playerPutDto} from "../db/models/player";
import {updatePlayersDiscordId} from "../db/services/playerService";

export class PlayerCommand  {

    private async registerPlayer(interaction: ChatInputCommandInteraction): Promise<void> {

        const id = interaction.options.getNumber("eugenid");

        if(!id) {
            interaction.reply("Invalid player ID");
            return;
        }

        const input: playerPutDto = {
            discordId: interaction.user.id,
            nickname: interaction.user.username
        }

        let response = await updatePlayersDiscordId(id, input);

        if(typeof response === 'string') {
            interaction.reply(response);
            return;
        }

        interaction.reply(`Player ${id} registered.`);
    }



    public addCommands(bot: DiscordBot): void {
        const registerPlayer = new SlashCommandBuilder().setName("register").setDescription("Register a player");

        registerPlayer.addNumberOption(option => option.setName("eugenid").setDescription("Player's Eugen ID (/help for more).").setRequired(true));

        bot.registerCommand(registerPlayer, this.registerPlayer.bind(this));
    }
}