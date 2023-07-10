"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiscCommand = void 0;
const discord_js_1 = require("discord.js");
const common_1 = require("../general/common");
const discordBot_1 = require("../general/discordBot");
const deckParser_1 = require("sd2-utilities/lib/parser/deckParser");
const Command_1 = require("./Command");
class MiscCommand extends Command_1.CommandDB {
    constructor(database) {
        super(database);
        this.sodbotReplies = [
            "Ping! Your shot bounced!",
            "You miss 100% of the shots you don't take. Or in your case, 100% of those that you do as well...",
            "Miss! Your shot couldn't hit the broad side of a barn!",
            "Miss! Come on bruh, just boogaloo it",
            "Another miss! Your aim is like Gonzo's analysis....lacking",
            "Miss! This piat is rubbish, just use your Sherman",
            "Miss! Just side shot it bro",
            "Miss! You cabbage, aim straight next time",
            "Hit! Jerry's in trouble now",
            "Bounce! You do know that is a King Tiger right?",
            "Hit! We're Airborne. We don't start fights, we finish 'em!",
            "Hit! Up the Ox and Bucks. Up the Ox and Bucks.",
            "Hit! There are few things more fundamentally encouraging and stimulating than seeing someone else die.",
            "Hit! Payback’s a bitch and her stripper name is Karma",
            "Hit! Ideals are peaceful. History is violent.",
            "Hit! It's better to stand and fight. If you run, you'll only die tired.",
            "Hit! Any problem caused by a tank can be solved by a piat",
            "Hit! Who needs a 0.50cal if you have the mighty piat!",
            "Hit! You cannot hide from me Jerry, even under the sea isn't safe",
            "Hit! Jack be nimble, Jack be quick, Jack claps your Panther tank!",
            "Hit! That is a mighty fine Hungarian helmet you are wearing there sir.",
            "Hit! Oh no, spiced ham is on the menu again.",
            "Hit! Is that a Sturmpistole in your pocket or are you just happy to see me.",
            "Hit! Ke mahi te tawa uho ki te riri.",
            "Hit! Śmierć wrogom ojczyzny",
            "Hit, I am so bad at this, only my fourth panther destroyed today",
            "Hit, piat goes brrrrrrrrrrrrr",
            "Hit, Jai Mahakali, Ayo Gorkhali!",
            "Hit, Rhodesians never die!",
            "Miss!, keep practicing, one day you might be able to last 10mins with Nilla",
            "Hit! Finally it is the piat meta",
            "Hit! Lets dance I will show you how to tango you hobo",
            "Miss! You know every time you salute the Captain, you make him a target for the Germans. So do us a favor, don't do it. Especially when I'm standing next to him, capisce?"
        ];
        this.sodbotReplies2 = [
            "Hit! Target destroyed!",
            "Miss! Mission failed. We'll get em next time!",
            "Miss! Damn it where's my .50 cal",
            "Miss! Are you even trying to hit anymore?",
            "Oh come on, that shot was pathetic... Put your back into it!",
            "Bounce! You do know that is a King Tiger right?",
            "Hit! Your name is unknown. Your deed is immortal.",
            "Hit! For Mother Russia",
            "Hit! We blew him away",
            "Hit!, Target Neutralised!",
            "Hit!, Keep those trucks coming",
            "Hit!, Ura!",
            "Hit! Never tell a soldier that he does not know the cost of war.",
            "Hit! Every war is different, every war is the same",
            "Hit! Oh no, there are PRTD squads in our rear",
            "Hit! In the silence of the night, we will always hear the screams.",
            "Miss! Maybe you need the piat instead",
            "Hit! Only the dead have seen the end of war",
            "Hit! In war there are no prizes for runner-up",
            "Hit!, Another cheese platter sir",
            "Hit!, sneaky sneaky you little ptrd squad",
            "Hit!, hi ho hi ho a transport sniping we go"
        ];
        this.sodbotReplies3 = [
            "Hit! Target destroyed!",
            "Hit! We blew him away",
            "Hit! They drew first blood!",
            "Hit! Don't push it or I'll give you a war you won't believe.",
            "Hit! I want them to know that death is coming, and there is nothing they can do to stop it.",
            "Hit! Old men start it, young men fight It, nobody wins, everybody in the middle dies, and nobody tells the truth!",
            "Hit! Live for nothing or die for something.",
            "Hit! I like the smell of napalm in the morning. It smells like... victory.",
            "Hit! Terminate... with extreme prejudice.",
            "Miss! You can either surf, or you can fight!",
            "Miss! I am sick and tired of filling body bags with your dumb fucking mistakes.",
            "Miss! These tit-sucking children could not guard a Turkish whorehouse; much less do anything worthwhile inside of it!",
            "Miss! Come on Marine, you can do better than that",
            "Hit! Every war is different, every war is the same",
            "Hit! To survive war you gotta become war",
            "Hit!  I eat Green Berets for breakfast. And right now, I'm very hungry!",
            "Hit! A strange game, the only winning move is to not play"
        ];
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    flip(message, input) {
        if (Math.random() > 0.5) {
            discordBot_1.MsgHelper.reply(message, "Heads");
        }
        else {
            discordBot_1.MsgHelper.reply(message, "Tails");
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    faction(message, input) {
        if (Math.random() > 0.5) {
            discordBot_1.MsgHelper.reply(message, "Axis");
        }
        else {
            discordBot_1.MsgHelper.reply(message, "Allied");
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    help(message, input) {
        const embed = new discord_js_1.MessageEmbed()
            .setTitle("Help")
            .setDescription("prefix commands with " + common_1.CommonUtil.config('prefix'))
            .addFields([
            { name: "Maps", value: "rdiv (axis|allies): get a random division from unbanned pool", inline: true },
            {
                name: "Divisions", value: "rmap (axis|allies): get a random division from unbanned pool. Can be filtered by allied/axis \n" +
                    "divisions", inline: true
            },
            { name: "Misc", value: '', inline: true }
        ]);
        message.channel.send(embed);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    piat(message, input) {
        const name = message.author.username;
        const k = Math.random();
        const i = Math.random();
        if (i > 0.80) {
            discordBot_1.MsgHelper.reply(message, this.sodbotReplies[Math.floor(Math.random() * this.sodbotReplies.length)], true);
        }
        else if (i > 0.005) {
            discordBot_1.MsgHelper.reply(message, "Miss!");
            return;
        }
        else {
            k < 0.7
                ? (discordBot_1.MsgHelper.reply(message, `You hit!`, true),
                    setTimeout(() => {
                        discordBot_1.MsgHelper.reply(message, `Just kidding, you didn't.`, true);
                    }, 5000))
                : (discordBot_1.MsgHelper.say(message, `Private ${name} has dishonored himself and dishonored the discord. I have tried to help him. But I have failed.`, true),
                    setTimeout(() => {
                        discordBot_1.MsgHelper.say(message, `I have failed because YOU have not helped me. YOU people have not given Private ${name} the proper motivation! `, true);
                        setTimeout(() => {
                            discordBot_1.MsgHelper.say(message, `So, from now on, whenever Private ${name} fucks up, I will not punish him! I will punish all of YOU!`, true);
                            setTimeout(() => {
                                discordBot_1.MsgHelper.say(message, `And the way I see it ladies, you owe me for ONE JELLY DOUGHNUT! NOW GET ON YOUR FACES!`, true);
                            }, 10000);
                        }, 10000);
                    }, 10000));
        }
    }
    ptrd(message, input) {
        const name = message.author.username;
        const k = Math.random();
        const i = Math.random();
        if (i > 0.80) {
            discordBot_1.MsgHelper.reply(message, this.sodbotReplies2[Math.floor(Math.random() * this.sodbotReplies2.length)], true);
        }
        else {
            discordBot_1.MsgHelper.reply(message, "Miss!");
            return;
        }
    }
    laws(message, input) {
        const name = message.author.username;
        const k = Math.random();
        const i = Math.random();
        if (i > 0.70) {
            discordBot_1.MsgHelper.reply(message, this.sodbotReplies3[Math.floor(Math.random() * this.sodbotReplies3.length)], true);
        }
        else {
            discordBot_1.MsgHelper.reply(message, "Miss!");
            return;
        }
    }
    deck(message, input) {
        let embed = new discord_js_1.MessageEmbed();
        if (String.length > 0) {
            const deck = deckParser_1.DeckParser.parse(input[0]);
            embed = embed.setTitle(deck.division);
            embed = embed.setDescription(deck.income);
            const a = [];
            const b = [];
            const c = [];
            for (const unit of deck.units) {
                let u = "";
                if (unit.count > 1) {
                    u += unit.count + "x ";
                }
                u += unit.name;
                if (unit.raw.transportid != -1) {
                    u += " in " + unit.transport;
                }
                if (unit.xp == 1)
                    u += " ☆";
                if (unit.xp == 2)
                    u += " ☆☆";
                if (unit.phase == 0) {
                    a.push(u);
                }
                else if (unit.phase == 1) {
                    b.push(u);
                }
                else if (unit.phase == 2) {
                    c.push(u);
                }
            }
            let astr = "";
            for (const i of a) {
                astr += i + "\n";
            }
            let bstr = '';
            for (const i of b) {
                bstr += i + "\n";
            }
            let cstr = "";
            for (const i of c) {
                cstr += i + "\n";
            }
            embed = embed.addField("A Phase", astr, true);
            embed = embed.addField("B Phase", bstr, true);
            embed = embed.addField("C Phase", cstr, true);
            embed = embed.setFooter("counts are in # of cards, not # of units");
            message.channel.send(embed);
        }
    }
    info(message, input) {
        const embed = new discord_js_1.MessageEmbed()
            .setTitle("SODBOT III Info")
            .setDescription("SODBOT III is is the latest version of the Steel Division 2 bot")
            .addFields([
            { name: "History", value: "SODBOT and SODBOT II were originally created by Mbetts to be used in the SDleague as a tool to support the SD2 community in playing matches.\n\nThe latest version, SODBOT III, has built upon this early work of Mbetts to enhanced the existing bot and include several new functions to further improve enjoyment of the game.  The bot is now hosted on several Discord servers, all contributing to a Global ELO score for players of Steel Division 2.", inline: false },
            {
                name: "Created By", value: "SD Nerd HQ Team", inline: false
            }
        ]);
        message.author.send(embed);
    }
    addCommands(bot) {
        bot.registerCommand("flip", this.flip);
        bot.registerCommand("faction", this.faction);
        bot.registerCommand("help", this.help);
        bot.registerCommand("piat", this.piat);
        bot.registerCommand("ptrd", this.ptrd);
        bot.registerCommand("laws", this.laws);
        bot.registerCommand("deck", this.deck);
        bot.registerCommand("info", this.info);
    }
}
exports.MiscCommand = MiscCommand;
//# sourceMappingURL=misc.js.map