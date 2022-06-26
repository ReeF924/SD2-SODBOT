"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logs = void 0;
var winston = require("winston");
var common_1 = require("./common");
var Logs = /** @class */ (function () {
    function Logs() {
    }
    Logs.init = function () {
        Logs.logger = winston.createLogger({
            level: common_1.CommonUtil.config("logLevel", "verbose"),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: "app.log", maxsize: 20000000, maxFiles: 3 })
            ]
        });
    };
    Logs.log = function (message) {
        if (message)
            Logs.logger.log("info", message);
    };
    Logs.error = function (message) {
        if (message)
            Logs.logger.log("error", message);
    };
    return Logs;
}());
exports.Logs = Logs;
//# sourceMappingURL=logs.js.map