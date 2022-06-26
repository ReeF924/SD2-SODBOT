"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonUtil = void 0;
var logs_1 = require("./logs");
var fs = require("fs");
var Levenshtein = require("levenshtein");
var CommonUtil = /** @class */ (function () {
    function CommonUtil() {
    }
    CommonUtil.init = function () {
        //load config file;
        var load = JSON.parse(fs.readFileSync("config.json", { encoding: "utf8" }));
        for (var _i = 0, _a = Object.keys(load); _i < _a.length; _i++) {
            var key = _a[_i];
            this.configData[key.toLocaleLowerCase()] = load[key];
        }
        //this.configData = JSON.parse(fs.readFileSync("config.json",{encoding:"utf8"}));
        logs_1.Logs.init();
    };
    CommonUtil.configBoolean = function (key, defaultSetting) {
        if (defaultSetting === void 0) { defaultSetting = false; }
        key = key.toLocaleLowerCase();
        if (this.configData[key])
            return Boolean(this.configData[key]);
        return defaultSetting;
    };
    CommonUtil.config = function (key, defaultSetting) {
        if (defaultSetting === void 0) { defaultSetting = ''; }
        key = key.toLocaleLowerCase();
        if (this.configData[key])
            return String(this.configData[key]);
        return defaultSetting;
    };
    CommonUtil.formatDate = function (date) {
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var month = '' + months[date.getMonth()];
        var day = '' + date.getDate();
        var year = date.getFullYear();
        if (day.length < 2)
            day = '0' + day;
        return [day, month, year].join('-');
    };
    CommonUtil.configData = new Map();
    CommonUtil.lexicalGuesser = function (input, obj) {
        var closestWord = "";
        var closestNumber = 9999999;
        obj.forEach(function (i) {
            var x = new Levenshtein(input, i);
            if (x.distance < closestNumber) {
                closestNumber = x.distance;
                closestWord = i;
            }
        });
        return closestWord;
    };
    return CommonUtil;
}());
exports.CommonUtil = CommonUtil;
//# sourceMappingURL=common.js.map