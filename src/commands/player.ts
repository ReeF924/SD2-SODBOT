import { DiscordBot, } from "../general/discordBot";
import {ChatInputCommandInteraction, EmbedBuilder, EmbedField, SlashCommandBuilder} from "discord.js";
import { PlayerPutDto, PlayerRank, PlayerAliases} from "../db/models/player";
import {
    getLeaderboard,
    getPlayer,
    getPlayerAliases,
    getPlayerRank, guessPlayerFromDiscordId,
    updatePlayersDiscordId
} from "../db/services/playerService";

export class PlayerCommand  {

    private async registerPlayer(interaction: ChatInputCommandInteraction): Promise<void> {

        const id = interaction.options.getNumber("eugenid");

        if(!id || id < 0) {
            await interaction.reply("Invalid player ID");
            return;
        }

        await interaction.deferReply();

        const input: PlayerPutDto = {
            discordId: interaction.user.id,
            nickname: interaction.user.username
        }

        let response = await updatePlayersDiscordId(id, input);

        if(typeof response === 'string') {
            await interaction.editReply(response);
            return;
        }

        await interaction.editReply(`Player ${id} registered.`);
    }

    private async leaderboard(interaction: ChatInputCommandInteraction): Promise<void> {
        const eloType = interaction.options.getString("elo_type") ?? "sdElo";

        await interaction.deferReply();

        const players = await getLeaderboard(eloType);

        if(typeof players === 'string') {
            await interaction.editReply("Failed to get leaderboard.");
            return;
        }

        let value = "No players found"

        if(players.length > 0) {
            value = "```\n";
            const longestRank = this.getLongestRank(players);
            const longestName = this.getLongestName(players);

            players.map((player, index) => {
                value += `${player.rank.toString().padStart(longestRank)}. ${player.name.substring(0, longestName).padEnd(longestName)}   ${player.elo.toFixed(2)}\n`;
            });
            value += "```";
        }

        await this.editReplyEmbed(interaction, [{name: '\u200b', value: value, inline: false}], `Top 10 players by ${eloType}`);
    }

    private async playerRank(interaction: ChatInputCommandInteraction): Promise<void> {
        const eloType = interaction.options.getString("elo_type") ?? "sdElo";
        // const id = interaction.user.id;

        //Check if user provided his id
        let idInput = interaction.options.getNumber("eugenid");

        let id: string;

        //if not, then put in his discord ID (API accepts both)
        if(!idInput){
            id = interaction.user.id;
        }
        else{
            if(idInput < 0){
                await interaction.reply("Invalid player ID");

                return;
            }
            id = idInput.toString();
        }


        await interaction.deferReply();

        const players = await getPlayerRank(id, eloType);

        if(typeof players === 'string') {
            await interaction.editReply(players);
            return;
        }

        const longestRank = this.getLongestRank(players);
        const longestName = this.getLongestName(players);

        let value:string = "```\n";
        players.map((player, index) => {
            value += `${player.rank.toString().padStart(longestRank)}. ${player.name.substring(0, longestName).padEnd(longestName)}   ${player.elo.toFixed(2)}\n`;
        });
        value += "```";

        await this.editReplyEmbed(interaction, [{name: '\u200b', value: value, inline: false}], `Rank of <@${interaction.user.id}> ${eloType}`);
    }

    private async editReplyEmbed(interaction: ChatInputCommandInteraction, embeds: EmbedField[], description:string): Promise<void>{
        const embed = new EmbedBuilder()
            .setTitle("Leaderboard")
            .setDescription(description)
            .setColor("Blue");


        embed.addFields(embeds);

        await interaction.editReply({embeds: [embed]});
    }

    private getLongestRank(players: PlayerRank[]): number {
        return players.reduce((a, b) => a.rank.toString().length > b.rank.toString().length ? a : b).rank.toString().length;
    }

    private async snitch(interaction: ChatInputCommandInteraction){
        const id = interaction.options.getNumber("eugenid");

        if(!id) {
            await interaction.reply("Invalid player ID");
            return;
        }

        await interaction.deferReply();

        const response = await getPlayerAliases(id);

        if(typeof response === 'string') {
            await interaction.editReply(response);
            return;
        }


        let value = 'The most used known aliases are: **';

        const playerWithAliases = response as PlayerAliases;

        playerWithAliases.aliases.forEach((alias) => {
            value += alias + ', ';
        });

        value = value.substring(0, value.length-2) + '**';

        await interaction.editReply(value);
    }

    private async whoami(interaction: ChatInputCommandInteraction){

        const discordId:string = interaction.user.id;

        await interaction.deferReply();

        const [statusCode, player] = await guessPlayerFromDiscordId(discordId);

        if(statusCode === 0){
            await interaction.editReply("Unexpected error.");
            return;
        }

        if(statusCode === 404){
           await interaction.editReply("Results inconclusive. Couldn't guess eugen ID reliably.");
           return;
        }

       if(player === null){
           await interaction.editReply("Unexpected error.");
           return;
       }

       let response = `Player id is ${player.id}`;

       if(statusCode === 208){
          response += " Not yet registered.";
       }

       await interaction.editReply(response);
    }

    private getLongestName(players: PlayerRank[]): number {
        return Math.min(players.reduce((a, b) => a.name.length > b.name.length ? a : b).name.length, 15);
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

        playerRank.addNumberOption(option => option.setName("eugenid").setDescription("Player's Eugen ID (/help for more).").setRequired(false));

        playerRank.addStringOption(option => option.setName("elo_type").setDescription("Elo type. Default: SD 1v1").setRequired(false)
            .addChoices({name: "SD 1v1", value: "SdElo"}, {name: "Warno 1v1", value: "WarnoElo"},
                {name: "SD TeamGame", value: "SdTeamGameElo"}, {name: "Warno TeamGame", value: "WarnoTeamGameElo"}));

        bot.registerCommand(playerRank, this.playerRank.bind(this));

        const snitch = new SlashCommandBuilder().setName("snitch").setDescription("Returns known aliases of given ID");
        snitch.addNumberOption(option => option.setName("eugenid").setDescription("Player's Eugen ID (/help for more).").setRequired(true));

        bot.registerCommand(snitch, this.snitch.bind(this));

        const whoami = new SlashCommandBuilder().setName("whoami")
            .setDescription("Guesses Eugen ID from replays you've uploaded." +
                " Unreliable, if most of uploads weren't your games.");

        bot.registerCommand(whoami, this.whoami.bind(this));
        //const deck = new SlashCommandBuilder().setName("deck").setDescription("Returns deck code from a specified replay (/help for details)");
        //deck.addNumberOption(option => option.setName("replayid").setDescription("Id of wanted replay"))

    }
}