import { DMChannel, Message } from "discord.js";
import { DiscordBot, MsgHelper } from "../general/discordBot";
import { Logs } from "../general/logs";
import { MessageEmbed } from "discord.js";

export class HelpCommand {

    static help(message:Message,input:string[]):void {
        switch (input[0]) {
            case "maps":
                HelpCommand.helpMaps(message)
                break;

            case "divs":
                HelpCommand.helpDivs(message)
                break;

            case "misc":
                HelpCommand.helpMisc(message)
                break;

            case "player":
                HelpCommand.helpPlayer(message)
                break;
            
            case "replays":
                HelpCommand.helpReplays(message)
                break;

            default:
                const embed = new MessageEmbed()
                    .setTitle("Help Commands")
                    .addFields([
                        {   name: "$help", 
                            value: "Gives this message", 
                            inline: false },
                        {
                            name: "$help maps", 
                            value:"Gives help info about all of the map commands.", 
                            inline: false },
                        { 
                            name: "$help divs", 
                            value: 'Gives help info about all of the division commands.', 
                            inline: false },
                        { 
                            name: "$help misc", 
                            value: 'Gives help info about all of the misc commands.', 
                            inline: false },
                        { 
                            name: "$help player", 
                            value: 'Gives help info about all of the commands that relate to the player', 
                            inline: false },
                        { 
                            name: "$help replays", 
                            value: 'Gives help info about the submitting of match replay files', 
                            inline: false }
                    
                    ])
                    message.author.send(embed);
        }      
    }    
            


    static helpMaps(message:Message){
        const embed = new MessageEmbed()
        .setTitle("Help - Maps Commands")
        .addFields([
            {   name: "$rmap", 
                value: "Returns a random map from the list of approved SD2 League 1v1 Maps.",
                inline: false },
            { 
                name: "$rmap XXX", 
                value: "In addition to $rampa you can also add the following arguments 1v1, 2v2, 3v3 or 4v4 to return a random map from the list of maps within those size categories", 
                inline: false },
            { 
                name: "$maps  or  $allmaps", 
                value: "Returns a list of all the current maps\nIf a map is currently banned its name will have strike through it", 
                inline: false },
            { 
                name: "$banmaps", 
                value: "You can use $banmaps to eliminate a map/maps from the active list of available maps for selection with $rmap\neg. $banmaps Slutsk, Leniana  would remove both Slutsk and Lenina from both the SD2League and 1v1 Lists", 
                inline: false },
            { 
                name: "$unbanmaps", 
                value: "You can use $unbanmaps to unban a map/maps from the list of available maps for selection with $rmap\neg. $unbanmaps Slutsk  would remove the ban from Slutsk from both the SD2League and 1v1 Lists", 
                inline: false },
            { 
                name: "$resetmaps", 
                value: "This command will clear all currently banned maps and reset the maps list back to its default state", 
                inline: false }        
        ])
        message.author.send(embed);
    }


    static helpDivs(message:Message){
        const embed = new MessageEmbed()
        .setTitle("Help - Division Commands")
        .addFields([
            {   name: "$rdiv", 
                value: "Returns a random div from all of the available division, it exlcudes any banned divisions\nYou may also add the argument Allies or Axis to narrw the random selection down to only that faction.\nie. $rdiv Axis will return a random div from the available axis divisions.",
             inline: false },
            {   name: "$divs or $alldivs", 
                value: "Returns a list of all Divisions, includes the division name and its alias",
                inline: false },
            { 
                name: "$bandiv", 
                value: "Allows you to ban a division (or multiple divisions) and remove it from the active list of divisions\nYou may use the offical name of the division or its alias\neg. $bandiv 1. Skijager  and  $bandiv 1SJ  work the same way", 
                inline: false },
            { 
                name: "$unbandiv", 
                value: "Allows you to unban a division (or multiple divisions) and make it available again in the list of divisions.\nYou may use the offical name of the division or its alias\neg. $unbandiv 1. Skijager and  $bandiv 1SJ  work the same way", 
                inline: false },
            { 
                name: "$resetdiv", 
                value: "Will remove all bans and reset the divisions list bck to its default state", 
                inline: false },
            { 
                name: "$banneddivs", 
                value: "Will provide a list of the currently banned divisions", 
                inline: false }
        ])
        message.author.send(embed);
    }


    static helpMisc(message:Message){
        const embed = new MessageEmbed()
        .setTitle("Help - Misc Commands")
        .addFields([
            {   name: "$piat", 
                value: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
             inline: false },
            {   name: "$info", 
                value: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
                inline: false },
            { 
                name: "$faction", 
                value: "Returns a d=random faction eg. Returns Allies or Axis", 
                inline: false },
            { 
                name: "$flip", 
                value: "Returns Heads or Tails, like a coin toss", 
                inline: false },
            { 
                name: "$random", 
                value: "Returns a random sized game from the list of availabe sizes (1v1, 2v2, 3v3, 4v4)", 
                inline: false }
        ])
        message.author.send(embed);
    }


    static helpPlayer(message:Message){
        const embed = new MessageEmbed()
        .setTitle("Help - Player Commands")
        .addFields([
            {   name: "$register", 
                value: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
             inline: false },
            {   name: "$player", 
                value: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
                inline: false },
            { 
                name: "$rating", 
                value: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", 
                inline: false },
            { 
                name: "$allratings", 
                value: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", 
                inline: false }
        ])
        message.author.send(embed);
    }


    static helpReplays(message:Message){
        const embed = new MessageEmbed()
        .setTitle("Help - Replays")
        .addFields([
            {   name: "Uploading a game replay", 
                value: "By uploading a game replay into one of the channels supported by the bot will trigger the bot to return a embed of summary information about the match.",
                inline: false },
            {   name: "\u200b", 
                value: "This will includes information about the match (eg. Winner, Loser, VictoryState, Duration, Map etc as well as information about the players themselves (eg Discord and Eugen Names, Lvl, Rating, Deck and Income used)",
                inline: false },
            {   name: "Replay Location", 
                value: "First thing is to navigate in-game to Profile/Replays and ensure the check box \"Cloud\" is unchecked, this will ensure a copy of the game has been saved to your local device.",
                inline: false },
            {   name: "\u200b", 
                value: "Not every computer is the same but generally you can find your replay files under\nC:/user/xxxxxx/",
                inline: false }
        ])
        message.author.send(embed);
    }

}







export class HelpCommandHelper {
    static addCommands(bot:DiscordBot):void{
        bot.registerCommand("help",HelpCommand.help);
    
    }
}




