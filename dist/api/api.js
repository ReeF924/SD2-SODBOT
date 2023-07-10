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
exports.API = void 0;
const express = require("express");
const logs_1 = require("../general/logs");
class API {
    constructor(database) {
        this.express = express();
        this.port = 8080;
        this.database = database;
    }
    start() {
        this.express.get('/replay', (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (req.query.user) {
                const results = yield this.database.getServerLadder(req.query.server);
                res.send(results);
            }
            else {
                const results = yield this.database.getGlobalLadder();
                res.send(results);
            }
        }));
        this.express.get('/leaderboard', (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (req.query.server) {
                const results = yield this.database.getServerLadder(req.query.server);
                res.send(results);
            }
            else {
                const results = yield this.database.getGlobalLadder();
                res.send(results);
            }
        }));
        this.express.get('/divElo', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const results = yield this.database.getAllDivisionElo();
            res.send(results);
        }));
        this.express.get('/', (req, res) => { res.send(200); });
        this.express.listen(this.port, () => {
            logs_1.Logs.log("HTTP server started on " + this.port);
        });
    }
}
exports.API = API;
//# sourceMappingURL=api.js.map