const config = require("../config");
const levenshtein = require("js-levenshtein");
const sqlite3 = require("sqlite3").verbose();

module.exports.reply = reply = (message, content, tts) => {
  config.tts_enabled_global
    ? message.reply(content, { tts: tts })
    : message.reply(content);
};

module.exports.say = say = (message, content, tts) => {
  config.tts_enabled_global
    ? message.channel.send(content, { tts: tts })
    : message.channel.send(content);
};

module.exports.dmUser = (message, content) => {
  message.author.send(content);
};

module.exports.moduleDisabledMsg = (message, moduleName) => {
  reply(message, `module '${moduleName}' is disabled.`);
};

module.exports.alterUserInput = input => {
  return input
    .trim()
    .toLowerCase()
    .split(/[_|\s]+/)
    .map(s => s.charAt(0).toUpperCase() + s.substring(1))
    .join(" ");
};

/**
 * makes a "guess" as to what the user should've entered
 * array is the list of true possible outcomes
 * note: this method doesn't get it right if you miss out a word completely
 * ie "orsha" is closer to "tsel" than "orsha north" to this method
 * */
module.exports.lexicalGuesser = (input, obj) => {
  let closestWord = "";
  let closestNumber = 9999999;

  Object.keys(obj).forEach(i => {
    if (levenshtein(input, i) < closestNumber) {
      closestNumber = levenshtein(input, i);
      closestWord = i;
    }
  });
  closestNumber = 99999999;
  return closestWord;
};

//Returns true or false based off of if the users id is registered
module.exports.userIsRegistered = (message, user) => {
  const db = connect();
  const sql = `SELECT * FROM players WHERE uid = ${user}`;
  let test = "";

  db.serialize(() => {
    db.each(
      sql,
      (err, row) => {
        test = row.UID;
      },
      () => {
        return test;
      }
    );
  });
  db.close();
};

module.exports.sql = (sql, params = []) => {
  const db = connect();
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

module.exports.connect = connect = () => {
  return new sqlite3.Database("./resultsDB.db", err => {
    if (err) {
      console.error(err.message);
    }
  });
};

module.exports.allies = {
  "2nd Guards": true,
  "3rd Guards Tank": true,
  "29th Tank Corps": true,
  "3rd Guards Mech": true,
  "Group Tyurin": true,
  "Group Bezugly": true,
  "9th Guards": true,
  "26th Guards": true,
  "44th Guards": true,
  "184th Guards": true,
  "84th Guards": true,
  "3rd Us Armored": true,
  "3rd Canadian Infantry": true,
  "15th Infantry": true,
  "2e Blindee": true,
  "Armia Krajowa": true,
  "1st Polish Infantry": true,
  "358 Strelkovy": true,
  "126th Strelki": true,
  "Gruppa Vyborg": true
};

module.exports.axis = {
  "5th Panzer": true,
  "20th Panzer": true,
  "78th Sturm": true,
  "28th Jager": true,
  "14th Infanterie": true,
  "Gruppe Harteneck": true,
  "Koruck 559": true,
  "1st Lovas": true,
  "12th Tartalekos": true,
  "21st Panzer": true,
  "Pz Lehr": true,
  "116th Panzer": true,
  "352 Infantry": true,
  "1st Skijager": true,
  "5 Panzer Wiking": true,
  "Fallschrim Panzer H G": true,
  "25th Panzergrenadier": true,
  "112. Infantry": true,
  Panssaridivisioona: true,
  "Ryhma Raapppana": true
};

module.exports.maps1v1 = {
  Bobr: true,
  Haroshaje: true,
  Krupa: true,
  Lenina: true,
  Orsha_East: true,
  Orsha_North: true,
  Ostrowno: true,
  Shchedrin: true,
  Sianno: true,
  Slutsk_East: true,
  Slutsk_West: true,
  Slutsk: true,
  Tsel: true,
  Siedlce: true,
  Brest_West: true,
  Gora_Kalwaria: true,
  Zbuczyn: true,
  Tali_Ihantala: true,
  Ilomantsi: true
};

module.exports.maps2v2 = {
  Autobahn_Zur_Holle: true,
  Beshankovichy: true,
  Bobrujsk_West: true,
  Lenina2: true,
  Losnica: true,
  Novka: true,
  Ostrowno2: true,
  Shchedrin2: true,
  Slutsk2: true,
  Veselovo: true,
  Vitebsk_East: true,
  Siedlce2: true,
  Brest_West2: true,
  Zbuczyn2: true,
  Tali_Ihantala2: true,
  Ilomantsi2: true
};

module.exports.maps3v3 = {
  Krupki: true,
  Lenina3: true,
  Lipen: true,
  Lyakhavichy: true,
  Mogilev: true,
  Naratch_Lake: true,
  Ostrowno3: true,
  Pleshchenitsy_South: true,
  Shchedrin3: true,
  Slutsk3: true,
  Brest_West3: true,
  Smolyany: true
};

module.exports.maps4v4 = {
  Lenina4: true,
  Ostrowno4: true,
  Shchedrin4: true,
  Slutsk4: true,
  Gora_Kalwaria4: true
};
