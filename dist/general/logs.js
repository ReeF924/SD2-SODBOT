"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logs = void 0;
const winston = require("winston");
const common_1 = require("./common");
class Logs {
    static init() {
        Logs.logger = winston.createLogger({
            level: common_1.CommonUtil.config("logLevel", "verbose"),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: "app.log", maxsize: 20000000, maxFiles: 3 })
            ]
        });
    }
    static log(message) {
        if (message)
            Logs.logger.log("info", message);
    }
    static error(message) {
        if (message)
            Logs.logger.log("error", message);
    }
}
exports.Logs = Logs;
//# sourceMappingURL=logs.js.map