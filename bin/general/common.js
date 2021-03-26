"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonUtil = void 0;
var logs_1 = require("./logs");
var fs = require("fs");
var levenshtein = require("js-levenshtein");
var CommonUtil = /** @class */ (function () {
    function CommonUtil() {
    }
    CommonUtil.init = function () {
        //load config file;
        this.configData = JSON.parse(fs.readFileSync("config.json", { encoding: "utf8" }));
        logs_1.Logs.init();
    };
    CommonUtil.configBoolean = function (key, defaultSetting) {
        if (defaultSetting === void 0) { defaultSetting = false; }
        if (this.configData[key])
            return Boolean(this.configData[key]);
        return defaultSetting;
    };
    CommonUtil.config = function (key, defaultSetting) {
        if (defaultSetting === void 0) { defaultSetting = ''; }
        if (this.configData[key])
            return String(this.configData[key]);
        return defaultSetting;
    };
    CommonUtil.lexicalGuesser = function (input, obj) {
        var closestWord = "";
        var closestNumber = 9999999;
        Object.keys(obj).forEach(function (i) {
            if (levenshtein(input, i) < closestNumber) {
                closestNumber = levenshtein(input, i);
                closestWord = i;
            }
        });
        closestNumber = 99999999;
        return closestWord;
    };
    return CommonUtil;
}());
exports.CommonUtil = CommonUtil;
