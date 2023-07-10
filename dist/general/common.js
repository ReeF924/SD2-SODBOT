"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonUtil = void 0;
const logs_1 = require("./logs");
const fs = require("fs");
const Levenshtein = require("levenshtein");
class CommonUtil {
    static getPrimaryGame(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const serverId = message.guild.id;
            let server = yield CommonUtil.database.getFromRedis(serverId);
            if (server.oppositeChannelIds.some(channelId => channelId === message.channel.id)) {
                if (server.primaryMode === "sd2")
                    return "warno";
                return "sd2";
            }
            return server.primaryMode;
        });
    }
    static init(database) {
        CommonUtil.database = database;
        //load config file;
        const load = JSON.parse(fs.readFileSync("config.json", { encoding: "utf8" }));
        for (const key of Object.keys(load)) {
            this.configData[key.toLocaleLowerCase()] = load[key];
        }
        //this.configData = JSON.parse(fs.readFileSync("config.json",{encoding:"utf8"}));
        logs_1.Logs.init();
    }
    static configBoolean(key, defaultSetting = false) {
        key = key.toLocaleLowerCase();
        if (this.configData[key])
            return Boolean(this.configData[key]);
        return defaultSetting;
    }
    static config(key, defaultSetting = '') {
        key = key.toLocaleLowerCase();
        if (this.configData[key])
            return String(this.configData[key]);
        return defaultSetting;
    }
    static formatDate(date) {
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let month = '' + months[date.getMonth()];
        let day = '' + date.getDate();
        let year = date.getFullYear();
        if (day.length < 2)
            day = '0' + day;
        return [day, month, year].join('-');
    }
}
exports.CommonUtil = CommonUtil;
CommonUtil.configData = new Map();
CommonUtil.lexicalGuesser = (input, obj) => {
    let closestWord = "";
    let closestNumber = 9999999;
    obj.forEach(i => {
        const x = new Levenshtein(input, i);
        if (x.distance < closestNumber) {
            closestNumber = x.distance;
            closestWord = i;
        }
    });
    return closestWord;
};
//# sourceMappingURL=common.js.map