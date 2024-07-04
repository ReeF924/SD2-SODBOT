import { DiscordBot, MsgHelper } from "../general/discordBot";
import {ChatInputCommandInteraction, Embed, EmbedBuilder, EmbedField, SlashCommandBuilder} from "discord.js";
import {Player, PlayerPutDto, PlayerRank} from "../db/models/player";
import {getLeaderboard, getPlayerRank, updatePlayersDiscordId} from "../db/services/playerService";

export class PlayerCommand  {

    private async registerPlayer(interaction: ChatInputCommandInteraction): Promise<void> {

        const id = interaction.options.getNumber("eugenid");

        if(!id) {
            interaction.reply("Invalid player ID");
            return;
        }

        const input: PlayerPutDto = {
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

    private async leaderboard(interaction: ChatInputCommandInteraction): Promise<void> {
        const eloType = interaction.options.getString("elo_type") ?? "sdElo";

        const players = await getLeaderboard(eloType);

        if(typeof players === 'string') {
            interaction.reply("Failed to get leaderboard.");
            return;
        }

        let value = "No players found"

        if(players.length > 0) {
            value = "```\n";
            const longestRank = players.reduce((a, b) => a.rank.toString().length > b.rank.toString().length ? a : b).rank.toString().length;
            const longestName = Math.min(players.reduce((a, b) => a.name.length > b.name.length ? a : b).name.length, 20);

            players.map((player, index) => {
                value += `${player.rank.toString().padStart(longestRank)}. ${player.name.substring(0, longestName).padEnd(longestName)}   ${player.elo.toFixed(2)}\n`;
            });
            value += "```";
        }

        this.sendEmbed(interaction, [{name: '\u200b', value: value, inline: false}], `Top 10 players by ${eloType}`);
    }

    private async playerRank(interaction: ChatInputCommandInteraction): Promise<void> {
        const eloType = interaction.options.getString("elo_type") ?? "sdElo";
        const id = interaction.user.id;

        const players = await getPlayerRank(id, eloType);

        if(typeof players === 'string') {
            interaction.reply(players);
            return;
        }

        const longestRank = players.reduce((a, b) => a.rank.toString().length > b.rank.toString().length ? a : b).rank.toString().length;
        const longestName = Math.min(players.reduce((a, b) => a.name.length > b.name.length ? a : b).name.length, 20);

        let value:string = "```\n";
        players.map((player, index) => {
            value += `${player.rank.toString().padStart(longestRank)}. ${player.name.substring(0, longestName).padEnd(longestName)}   ${player.elo.toFixed(2)}\n`;
        });
        value += "```";

        this.sendEmbed(interaction, [{name: '\u200b', value: value, inline: false}], `Rank of <@${interaction.user.id}> ${eloType}`);
    }

    private async sendEmbed(interaction: ChatInputCommandInteraction, embeds: EmbedField[], description:string): Promise<void>{
        const embed = new EmbedBuilder()
            .setTitle("Leaderboard")
            .setDescription(description)
            .setColor("Blue");


        embed.addFields(embeds);

        MsgHelper.sendEmbeds(interaction, [embed]);
    }

    public addCommands(bot: DiscordBot): void {
        const registerPlayer = new SlashCommandBuilder().setName("register").setDescription("Register a player");

        registerPlayer.addNumberOption(option => option.setName("eugenid").setDescription("Player's Eugen ID (/help for more).").setRequired(true));

        bot.registerCommand(registerPlayer, this.registerPlayer.bind(this));

        const leaderBoard = new SlashCommandBuilder().setName("leaderboard").setDescription("Get the leaderboard");
        leaderBoard.addStringOption(option => option.setName("elo_type").setDescription("Elo type. Default: SD 1v1").setRequired(false)
            .addChoices({name: "SD 1v1", value: "SdElo"}, {name: "Warno 1v1", value: "WarnoElo"},
                {name: "SD TeamGame", value: "SdTeamGameElo"}, {name: "Warno TeamGame", value: "WarnoTeamGameElo"}));

        bot.registerCommand(leaderBoard, this.leaderboard.bind(this));

        const playerRank = new SlashCommandBuilder().setName("rank").setDescription("Get player rank");
        playerRank.addStringOption(option => option.setName("elo_type").setDescription("Elo type. Default: SD 1v1").setRequired(false)
            .addChoices({name: "SD 1v1", value: "SdElo"}, {name: "Warno 1v1", value: "WarnoElo"},
                {name: "SD TeamGame", value: "SdTeamGameElo"}, {name: "Warno TeamGame", value: "WarnoTeamGameElo"}));

        bot.registerCommand(playerRank, this.playerRank.bind(this));
    }
}