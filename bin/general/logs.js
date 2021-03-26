"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logs = void 0;
var winston_1 = require("winston");
var common_1 = require("./common");
var Logs = /** @class */ (function () {
    function Logs() {
    }
    Logs.init = function () {
        this.logger.configure({
            level: common_1.CommonUtil.config("logLevel", "verbose"),
            transports: [
                new winston_1.default.transports.Console()
            ]
        });
    };
    Logs.log = function (message) {
        this.logger.log("info", message);
    };
    Logs.error = function (message) {
        this.logger.log("error", message);
    };
    return Logs;
}());
exports.Logs = Logs;
