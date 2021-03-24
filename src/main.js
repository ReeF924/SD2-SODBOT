const Discord = require("discord.js");
const config = require("./config.json");
const admin = require("./admin/admin-commands.js");
const common = require("./general/common");
const misc = require("./general/misc-functions");
const map = require("./general/map-functions");
const div = require("./general/division-functions");
const results = require("./results/results-main");
const extract = require("./results/replayParser");
const register = require("./results/registerUser");
const init = require("./init.js");

const token = config.token;
const bot = new Discord.Client();

//Command function to identify all $commands
function findCommand(message, command) {
  let input = message.content.substr(message.content.indexOf(" ") + 1);
  input = input.split(/,/);
  for (index in input) {
    input[index] = input[index]
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .trim();
  }
  switch (command) {
    // Admin Commands
    case "blacklist":
      config.adminCommands
        ? admin.blackList(message, bot)
        : common.moduleDisabledMsg(message, "admin");
      break;
    case "unblacklist":
      config.adminCommands
        ? admin.unBlackList(message)
        : common.moduleDisabledMsg(message, "admin");
      break;
    case "purge":
      config.adminCommands
        ? admin.purge(message, input[0])
        : common.moduleDisabledMsg(message, "admin");
      break;
    case "addadmin":
      config.adminCommands
        ? admin.addAdmin(message)
        : common.moduleDisabledMsg(message, "admin");
      break;
    case "removeadmin":
      config.adminCommands
        ? admin.removeAdmin(message)
        : common.moduleDisabledMsg(message, "admin");
      break;
    case "listadmins":
      config.adminCommands
        ? admin.listAdmins(message)
        : common.moduleDisabledMsg(message, "admin");
      break;
    // case "register-user":
    //   config.adminCommands
    //     ? results.registerUser(message, input[0])
    //     : common.moduleDisabledMsg(message, "results");
    //   break;
    // case "register-override":
    //   config.adminCommands
    //     ? results.overrideUser(message, input[0])
    //     : common.moduleDisabledMsg(message, "results");
    //   break;

    // Misc Commands
    case "help":
      config.help
        ? misc.help(message, input[0])
        : common.moduleDisabledMsg(message, "help");
      break;
    case "info":
      config.info
        ? misc.info(message)
        : common.moduleDisabledMsg(message, "info");
      break;
    case "faction":
      config.faction
        ? misc.faction(message)
        : common.moduleDisabledMsg(message, "faction");
      break;
    case "flip":
      config.flip
        ? misc.flip(message)
        : common.moduleDisabledMsg(message, "flip");
      break;
    case "guide":
      config.guide
        ? misc.guide(message)
        : common.moduleDisabledMsg(message, "guide");
      break;
    case "piat":
    case "bazooka":
    case "ptrd":
    case "ptrs":
    case "tnt":
    case "panzerfaust":
    case "rpg-43":
    case "panzershreck":
    case "faustpatrone":
    case "nebelhandgranate":
    case "hhl3":
    case "fud":
    case "potato":
      config.piat_all
        ? misc.piat(message)
        : common.moduleDisabledMsg(message, "piat");
      break;
    case "prediction":
      config.prediction
        ? results.prediction(message)
        : common.moduleDisabledMsg(message, "results");
      break;
    case "register":
      config.register
        ? register.registerUser(message, input[0])
        : common.moduleDisabledMsg(message, "results");
      break;

    // Map Commands
    case "rmap":
      config.rmap
        ? map.rmap(message, input[0])
        : common.moduleDisabledMsg(message, "random map");
      break;
    case "allmaps":
    case "maps":
      config.allMaps
        ? map.allMaps(message)
        : common.moduleDisabledMsg(message, "all maps");
      break;
    case "unbanmap":
      config.mapBans
        ? map.banning_unbanningMaps(message, input, true)
        : common.moduleDisabledMsg(message, "map bans");
      break;
    case "banmap":
      config.mapBans
        ? map.banning_unbanningMaps(message, input, false)
        : common.moduleDisabledMsg(message, "map bans");
      break;
    case "bannedmaps":
      config.mapBans
        ? map.bannedMaps(message)
        : common.moduleDisabledMsg(message, "map bans");
      break;
    case "resetmaps":
      config.mapBans
        ? map.resetMaps(message)
        : common.moduleDisabledMsg(message, "map bans");
      break;
    case "random":
      config.random
        ? div.random(message, input)
        : common.moduleDisabledMsg(message, "random");
      break;

    // Division Commands
    case "rdiv":
      config.rdiv
        ? div.rdiv(message, input[0])
        : common.moduleDisabledMsg(message, "random division");
      break;
    case "divs":
    case "alldivs":
      config.allDivs
        ? div.allDivs(message)
        : common.moduleDisabledMsg(message, "all divisions");
      break;
    case "unbandiv":
      config.divBans
        ? div.banning_unbanningDivs(message, input, true)
        : common.moduleDisabledMsg(message, "div bans");
      break;
    case "bandiv":
      config.divBans
        ? div.banning_unbanningDivs(message, input, false)
        : common.moduleDisabledMsg(message, "div bans");
      break;
    case "resetdivs":
      config.divBans
        ? div.resetDivs(message, input, false)
        : common.moduleDisabledMsg(message, "div bans");
      break;
    case "banneddivs":
      config.divBans
        ? div.bannedDivs(message)
        : common.moduleDisabledMsg(message, "div bans");
      break;
  }
}

//Parsing the Bot Message
bot.on("message", async message => {
  const userIsBlackListed = await admin.isBlackListed(message.author.id);
  if (!userIsBlackListed) {
    if (message.content.startsWith(config.prefix)) {
      console.log("Command Entered");
      const inputList = message.content
        .substr(1, message.content.length)
        .toLowerCase()
        .replace(/\n/g, " ")
        .split(" ");
      const command = inputList[0];

      if (command === "help") {
        misc.help(message, inputList[1]);
        return;
      }

      if (message.channel.type === "dm") {
        return;
      }
      findCommand(message, command);
    }

    if (message.attachments.first()) {
      if (message.attachments.first().url.endsWith(".rpl3")) {
        if (message.channel.type !== "dm") {
          extract.replayInfo(message);
        }
      }
    }
  }
});


bot.on("ready", async () => {
  console.log("Bot Online!");
  bot.user.setActivity("Use " + config.prefix + "help to see commands!", {
    type: "Listening"
  });
  try {
    await common.sql(`SELECT * FROM players`);
  } catch (err) {
    init.createTables();
  }
});

// Bot logon by passing token from config
bot.on("error", console.error);
bot.login(token);
