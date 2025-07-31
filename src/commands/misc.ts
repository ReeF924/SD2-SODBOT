import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { DiscordBot, MsgHelper } from "../general/discordBot";
import { DeckParser } from "sd2-utilities/lib/parser/deckParser"

export class MiscCommand {

    private piatReplies:string[] = [
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
        "Hit! Finally it is the piat meta",
        "Hit! I am the piat god, bow before me",
        "Hit! Allies OP please nerf",
        "Hit! Lets dance I will show you how to tango you hobo",
        "Hit! Jerry's in trouble now",
        "Miss! Come on bruh, just boogaloo it",
        "Miss! Your shot couldn't hit the broad side of a barn!",
        "Miss! This piat is rubbish, just use your Sherman",
        "Miss! You cabbage, aim straight next time",
        "Miss!, keep practicing, one day you might be able to last 10mins with Nilla",
        "Miss! You know every time you salute the Captain, you make him a target for the Germans. So do us a favor, don't do it. Especially when I'm standing next to him, capisce?",
        "Miss. You didn't expect me to hit halfway stressed, did you?",
        "Miss. It's not my fault, the tank stopped out of nowhere!",
        "You miss 100% of the shots you don't take. Or in your case, 100% of those that you do as well...",
        "Another miss! Your aim is like Gonzo's analysis....lacking",
        "Bounce! Next time side shot it bro",
        "Bounce! You do know that is a King Tiger right?",
        "Ping! Your shot bounced!",


    ];

    private krugReplies: string[] = [
        "Miss, the start of the East German space program",
        "Miss, likely gonna strike London like a V2",
        "Miss, that was your own MIG, you idiot.",
        "Hit, be careful or this might create a black hole.",
        "Hit, this could have killed the death star.",
        "Miss, you blew up your own morphine depot...",
        "Hit, you should go to Vegas today!",
        "Miss, you like suffering don't you?",
        "Miss, that was the ISS you moron.",
        "Miss, please stop, you are bankrupting the whole pact with the ammo consumption.",
        "Hit, Genosse sie sind ein Genie!",
        "Miss, you should drink some Schnapps to help the aim.",
        "Miss, another 200 supplies gone!",
        "Miss, ECM is a strong enemy.",
        "Hit, Krug OP.",
        "Hit, Krug OP.",
        "Hit, another F15 down!",
        "Hit, nothing compares to Krug.",
        "Hit, elite vet Krug never misses!",
        "Hit. Can't hit, won't miss!",
        "Hit, every Kub's vet dream!",
        "Hit, every Kub wants to be like you!",
        "Miss, the missile will reach the Moon in approximately 3 minutes.",
        "Hit, truly a rare phenomenon.",
        "Hit, every airspammer's worst nightmare.",
        "Hit, no SEAD plane can stop me now!",
        "Hit, no plane is safe when I'm in town!",
        "Hit, even Billy the Kid envies that accuracy.",
        "Miss, what did you expect?",
        "Miss, happens to the best of us.",
        "Miss, happens to the best of us.",
        "Miss, Hans is doing his best, don't get mad."
    ];



    private flip(input: ChatInputCommandInteraction): void {
        if (Math.random() > 0.5) {
            MsgHelper.reply(input, "Heads");
            return;
        }
        MsgHelper.reply(input, "Tails");
    }

    private faction(input: ChatInputCommandInteraction): void {
        const game = input.options.getString("game", false) ?? "sd2";

        if (Math.random() > 0.5) {
            MsgHelper.reply(input, game == "sd2" ? "Axis" : "Pact");
            return;
        }
        MsgHelper.reply(input, game == "sd2" ? "Allies" : "Nato");
    }

    private piat(input: ChatInputCommandInteraction): void {
        const i = Math.random();

        if (input.user.id === '607962880154927113') { //I had to...
            const replies = this.piatReplies.filter((reply) => reply.toLowerCase().startsWith('hit'));
            MsgHelper.reply(
                input,
                replies[Math.floor(Math.random() * replies.length)],
            );
            return;
        }


        if (i > 0.85) {
            MsgHelper.reply(
                input,
                this.piatReplies[Math.floor(Math.random() * this.piatReplies.length)],
            );
        } else if (i > 0.1) {
            MsgHelper.reply(input, "Miss!");
            return;
        }
        else if (i > 0.05) {
            MsgHelper.reply(input, "Miss!");
            input.followUp({ content: "You actually hit, but noone will ever believe you...", ephemeral: true });
            return;
        }
        else {
            MsgHelper.reply(input, `You hit!`),
                setTimeout(() => {
                    input.followUp("Just kidding, you didn't.");
                }, 5000);
        }
    }

    public async krug(input: ChatInputCommandInteraction): Promise<void> {
            const i = Math.random();

            /*
            if (input.user.id === '607962880154927113') { //I had to...
            const replies = this.krugReplies.filter((reply) => reply.toLowerCase().startsWith('hit'));
            await MsgHelper.reply(
                input,
                replies[Math.floor(Math.random() * replies.length)],
            );
            return;
            }
        */

        if (i > 0.75) {
            await MsgHelper.reply(
                input,
                this.krugReplies[Math.floor(Math.random() * this.krugReplies.length)],
            );
        } else if (i > 0.1) {
            await MsgHelper.reply(input, "Miss!");
            return;
        }
        else if (i > 0.05) {
            await MsgHelper.reply(input, "Miss!");
            await input.followUp({ content: "You actually hit, but no-one will ever believe you...", ephemeral: true });
            return;
        }
        else {
            await MsgHelper.reply(input, `You hit!`)
                setTimeout(() => {
                    input.followUp("Just kidding, you didn't.");
                }, 5000);
        }
    }


    private deck(message: ChatInputCommandInteraction, input: string[]): void {
        let embed = new EmbedBuilder();
        if (String.length > 0) {
            const deck = DeckParser.deckParse(input[0])
            embed = embed.setTitle(deck.division);
            embed = embed.setDescription(deck.income);
            const a = [];
            const b = [];
            const c = [];
            for (const unit of deck.units) {
                let u = "";
                if (unit.count > 1) {
                    u += unit.count + "x "
                }
                u += unit.name;
                if (unit.raw.transportId != -1) {
                    u += " in " + unit.transport
                }
                if (unit.xp == 1) u += " ☆"
                if (unit.xp == 2) u += " ☆☆"
                if (unit.phase == 0) {
                    a.push(u)
                } else if (unit.phase == 1) {
                    b.push(u)
                } else if (unit.phase == 2) {
                    c.push(u)
                }
            }
            let astr = "";
            for (const i of a) {
                astr += i + "\n"
            }
            let bstr = ''
            for (const i of b) {
                bstr += i + "\n"
            }
            let cstr = ""
            for (const i of c) {
                cstr += i + "\n"
            }
            embed = embed.addFields([
                { name: "A Phase", value: astr, inline: true },
                { name: "B Phase", value: bstr, inline: true },
                { name: "C Phase", value: cstr, inline: true }
            ]);
            embed = embed.setFooter({ text: "counts are in # of cards, not # of units" })
            MsgHelper.sendEmbeds(message, [embed])
        }
    }

    private info(input: ChatInputCommandInteraction): void {
        const embed = new EmbedBuilder()
            .setTitle("SODBOT III Info")
            .setDescription("SODBOT III is is the latest version of the Steel Division 2 bot")
            .addFields([
                {
                    name: "History",
                    value: "SODBOT and SODBOT II were originally created by Mbetts to be used in the SDleague as a tool to support the SD2 community in playing matches.\n\nThe latest version, SODBOT III, has built upon this early work of Mbetts to enhanced the existing bot and include several new functions to further improve enjoyment of the game. The main developers were RoguishTiger and P.URI.Tanner. The bot is currently hosted on several Discord servers.",
                    inline: false
                },
                {
                    name: "Created By", value:
                        "SD Nerd HQ Team", inline: false
                }
            ])
        MsgHelper.sendEmbeds(input, [embed]);
    }

    public addCommands(bot: DiscordBot): void {
        const flip = new SlashCommandBuilder().setName("flip").setDescription("Flip a coin");
        bot.registerCommand(flip, this.flip.bind(this));

        const faction = new SlashCommandBuilder().setName("faction").setDescription("Randomly select a faction");
        faction.addStringOption(option => option.setName("game").setDescription("Filter by game. Default: sd2")
            .setChoices({ name: "sd2", value: "sd2" }, { name: "warno", value: "warno" }).setRequired(false));
        bot.registerCommand(faction, this.faction.bind(this));

        const piat = new SlashCommandBuilder().setName("piat").setDescription("Fire the piat");
        bot.registerCommand(piat, this.piat.bind(this));

        const krug = new SlashCommandBuilder().setName("krug").setDescription("Fire the krug");
        bot.registerCommand(krug, this.krug.bind(this));

        // bot.registerCommand("deck", this.deck.bind(this));

        const info = new SlashCommandBuilder().setName("info").setDescription("Get lore about the bot.");
        bot.registerCommand(info, this.info.bind(this));
    }
}