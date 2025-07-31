import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { DiscordBot } from "../general/discordBot";
import { EmbedBuilder } from "discord.js";

export class HelpCommand {

    private help(input: ChatInputCommandInteraction): void {
        const category = input.options.getString("category") ?? "";
        switch (category) {
            case "maps":
                this.helpMaps(input);
                break;

            case "divs":
                this.helpDivs(input);
                break;

            case "misc":
                this.helpMisc(input);
                break;

            case "player":
                this.helpPlayer(input);
                break;

            case "replays":
                this.helpReplays(input);
                break;
            // case "admin":
            //     this.helpAdmins(input);
            //     break;

            default:
                const embed = this.createEmbed("Help Commands", [
                    {
                        name: "/help",
                        value: "Gives this message",
                        inline: false
                    },
                    {
                        name: "/help maps",
                        value: "Gives help info about all of the map commands.",
                        inline: false
                    },
                    {
                        name: "/help divs",
                        value: 'Gives help info about all of the division commands.',
                        inline: false
                    },
                    {
                        name: "/help misc",
                        value: 'Gives help info about all of the misc commands.',
                        inline: false
                    },
                    {
                        name: "/help player",
                        value: 'Gives help info about all of the commands that relate to the player.',
                        inline: false
                    },
                    {
                        name: "/help replays",
                        value: 'Gives help info about the submitting of match replay files.',
                        inline: false
                    },
                    // {
                    //     name: "/help admin",
                    //     value: 'Gives help info about commands for admins.',
                    //     inline: false
                    // }
                    {
                        name: "Commands usage",
                        value: "Commands might have additional arguments, some are optional some not. Discord will show you possible options when typing the command. Using Tab will autocomplete the command or the arguments for you. If you cannot see the commands use Ctrl + R to refresh discord.",
                        inline: false
                    },
                    {
                        name: "Arguments",
                        value: "To use an argument you need to specify it. For instance /rmap count:5, /rmap 5 is not enough and bot will not understand it and return only one map instead.",
                        inline: false
                    },
                    {
                        name: "Warning",
                        value: "Bans and some other commands are either temporarily disabled or they have no effect (bans for instance), they will be restored hopefully soon.",
                        inline: false
                    }
                ]);
                input.reply({ embeds: [embed], ephemeral: true });
        }
    }



    private helpMaps(input: ChatInputCommandInteraction) {
        const embed = this.createEmbed("Help - Maps Commands", [
            {
                name: "/rmap",
                value: "Returns a random map from the list of approved SD2 League 1v1 Maps or warno 1v1 map.",
                inline: false
            },
            {
                name: "/allmaps",
                value: "Returns a list of all the current sd2 maps\nIf a map is currently banned this will be indicated by its name being struck out.",
                inline: false
            },
            {
                name: "/banmaps",
                value: "You can use /banmaps to eliminate a map/maps from the active list of available maps for selection with /rmap. You can add multiple maps by using a comma inbetween maps.\nExample Usage: /banmaps Slutsk, Orsha East",
                inline: false
            },
            {
                name: "/unbanmaps",
                value: "You can use /unbanmaps to remove the ban on a map/maps from the list of available maps for selection with /rmap. You can remove the ban from multiple maps by placing a comma between maps.\nExample Usage: /unbanmaps Slutsk, Orsha East",
                inline: false
            },
            {
                name: "/resetmaps",
                value: "This command will clear all currently banned maps and reset the maps list back to its default state.",
                inline: false
            }
        ]);
        input.reply({ embeds: [embed], ephemeral: true });
    }


    private helpDivs(input: ChatInputCommandInteraction) {
        const embed = this.createEmbed("Help - Division Commands", [
            {
                name: "/rdiv",
                value: "Returns a random division from all of the available divisions, it excludes any banned divisions.\nYou may also add the argument Allies or Axis to narrow the random selection down to only that faction.\nExample Usage /rdiv Axis",
                inline: false
            },
            {
                name: "/alldivs",
                value: "Returns a list of all divisions, it includes the division name and its alias.",
                inline: false
            },
            {
                name: "/bandiv",
                value: "Allows you to ban a division (or multiple divisions) and remove it from the active list of divisions.\nYou may use the offical name of the division or its alias.\nExample Usage: /bandiv 1. Skijager  and  /bandiv 1SJ  (both work the same way)",
                inline: false
            },
            {
                name: "/unbandiv",
                value: "Allows you to remove the ban on a division (or multiple divisions) and make it available again in the list of divisions.\nYou may use the offical name of the division or its alias.\nExample Usage: /unbandiv 1. Skijager and  /unbandiv 1SJ  (both work the same way)",
                inline: false
            },
            {
                name: "/resetdivs",
                value: "Will remove all bans and reset the division's list back to its default state.",
                inline: false
            },
            {
                name: "/banneddivs",
                value: "Will provide a list of the currently banned divisions.",
                inline: false
            }
        ]);
        input.reply({ embeds: [embed], ephemeral: true });
    }


    private helpMisc(input: ChatInputCommandInteraction) {
        const embed = this.createEmbed("Help - Misc Commands", [
            {
                name: "/piat",
                value: "FIRE the Piat Can you get a Hit, find the secret messages?",
                inline: false
            },
            {
                name: "/info",
                value: "Shows info about the bot.",
                inline: false
            },
            {
                name: "/faction",
                value: "Returns a random faction, ie. returns Allies or Axis.",
                inline: false
            },
            {
                name: "/flip",
                value: "Returns Heads or Tails, like a coin toss.",
                inline: false
            },
            {
                name: "/random",
                value: "Returns a random sized game from the list of availabe sizes, ie 1v1, 2v2, 3v3, 4v4.",
                inline: false
            }
        ])
        input.reply({ embeds: [embed], ephemeral: true });
    }


    private helpPlayer(input: ChatInputCommandInteraction) {
        const embed = this.createEmbed("Help - Player Commands", [
            {
                name: "/register",
                value: "This command will register (if they are unknown to the bot)\n The command makes a link between the Discord User submitting the request and the Eugen Player ID provided in the request.\nExample Usage: /register 123456 (where 123456 is the player's Eugen Player ID). In case your Eugen or Discord Id is already registered contact sodbot admins.",
                inline: false
            },
            // {
            //     name: "/player",
            //     value: "Provides a summary of the player. When submitted without an argument will return information about the submitter.  When used with the @player argument will return information about that player.\n Exmaple Usage: /player @ExamplePlayer (returns player information for ExamplePlayer)",
            //     inline: false
            // },
            // {
            //     name: "/allratings",
            //     value: "Returns a list of the top 100 active players and their ratings.\nA active player is defined as a player who has been listed in a submitted rated match in the last 6 months.",
            //     inline: false
            // }
        ]);
        input.reply({ embeds: [embed], ephemeral: true });
    }
    private helpReplays(input: ChatInputCommandInteraction) {
        const embed = this.createEmbed("Help - Replays", [
            {
                name: "Uploading a game replay",
                value: "Uploading a game replay into one of the channels supported by the bot will trigger the bot to return summary information about the match.",
                inline: false
            },
            {
                name: "\u200b",
                value: "This includes information about the match (eg. Winner, Loser, VictoryState, Duration, Map etc as well as information about the players themselves (eg Discord and Eugen Names, Lvl, Rating, Deck and Income used)",
                inline: false
            },
            {
                name: "-------------------------------------------------------------",
                value: "\u200b",
                inline: false
            },
            {
              name: "/deck",
              value:"Returns ",
              inline: false
            },
            {
                name: "Replay Location On Your PC",
                value: "First thing is to navigate in-game to Profile/Replays and ensure the check box \"Cloud\" is unchecked on the replay, this will ensure a copy of the game has been saved to your local device.",
                inline: false
            },
            {
                name: "\u200b",
                value: "Not every computer is the same but generally you can find your locally saved replay files under -\nC:/users/%%Username%%/SavedGames/EugenSystems/(WARNO OR Steel Division 2)",
                inline: false
            }
        ])
        input.reply({ embeds: [embed], ephemeral: true });
    }
    private helpAdmins(input: ChatInputCommandInteraction) {
        const embed = this.createEmbed("Help - Admin commands", [
            {
                name: "/primarymode",
                value: "Provides info about the primary mode of a server.\nAdding a game name as an argument changes the primary mode.",
                inline: false
            },
            {
                name: "/addchannel",
                value: "Adds channel into the opposite channels.\nAdding channel id as an argument adds that channel.",
                inline: false
            },
            {
                name: "/removechannel",
                value: "Removes channel from the opposite channels.\nAdding channel id as an argument removes that channel.\nAdding argument 'all' removes all the opposite channels.",
                inline: false
            }
        ]);
        input.reply({ embeds: [embed], ephemeral: true });
    }



    private createEmbed(title: string, fields: EmbedField[]): EmbedBuilder {
        return new EmbedBuilder()
            .setTitle(title)
            .addFields(fields)
    }

    public addCommands(bot: DiscordBot): void {
        const help = new SlashCommandBuilder()
            .setName("help")
            .setDescription("Sends a DM with additional information about the commands");


        help.addStringOption(option => option.setName("category")
            .setDescription("The category of commands you want help with.")
            .setChoices({ name: "maps", value: "maps" }, { name: "divs", value: "divs" },
                { name: "misc", value: "misc" }, { name: "player", value: "player" },
                { name: "replays", value: "replays" }/*, { name: "admin", value: "admin" }*/));

        bot.registerCommand(help, this.help.bind(this));

    }
}

declare type EmbedField = {
    name: string,
    value: string,
    inline: boolean
}



