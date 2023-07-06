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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatingEngine = void 0;
var RatingEngine = /** @class */ (function () {
    function RatingEngine(database) {
        this.k_value = 32;
        this.database = database;
    }
    RatingEngine.prototype.rateMatch = function (p1, p2, victor) {
        console.log("Have arrived in rateMatch");
        var global = this.generateElo(p1.globalElo, p2.globalElo, victor);
        var server = this.generateElo(p1.serverElo, p2.serverElo, victor);
        var channel = this.generateElo(p1.channelElo, p2.channelElo, victor);
        var p1x = p1;
        var p2x = p2;
        p1x.globalElo = global.p1Elo;
        p1x.globalDelta = global.p1EloDelta;
        p2x.globalElo = global.p2Elo;
        p2x.globalDelta = global.p2EloDelta;
        p1x.serverElo = server.p1Elo;
        p1x.serverDelta = server.p1EloDelta;
        p2x.serverElo = server.p2Elo;
        p2x.serverDelta = server.p2EloDelta;
        p1x.channelElo = channel.p1Elo;
        p1x.channelDelta = channel.p1EloDelta;
        p2x.channelElo = channel.p2Elo;
        p2x.channelDelta = channel.p2EloDelta;
        return { p1: p1x, p2: p2x };
    };
    /**
    /@param gameState: 0 for p1 loss, 1 for p1 win, .5 for draw...
    **/
    RatingEngine.prototype.generateElo = function (p1Elo, p2Elo, gameState) {
        var newP1Elo = this.k_value * (gameState - this.getChanceToWin(p1Elo, p2Elo));
        var newP2Elo = this.k_value * ((1 - gameState) - this.getChanceToWin(p2Elo, p1Elo));
        return { p1Elo: (p1Elo + newP1Elo), p1EloDelta: newP1Elo, p2Elo: (p2Elo + newP2Elo), p2EloDelta: newP2Elo };
    };
    RatingEngine.prototype.doDivisionElo = function (deck1, deck2, victoryState) {
        return __awaiter(this, void 0, void 0, function () {
            var div1, div2, elo, e1, e2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        div1 = this.database.getDivisionElo(Number(deck1.raw.division));
                        div2 = this.database.getDivisionElo(Number(deck2.raw.division));
                        return [4 /*yield*/, div1];
                    case 1:
                        if (!!(_a.sent())) return [3 /*break*/, 2];
                        e1 = 1500;
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, div1];
                    case 3:
                        e1 = (_a.sent()).elo;
                        _a.label = 4;
                    case 4: return [4 /*yield*/, div2];
                    case 5:
                        if (!!(_a.sent())) return [3 /*break*/, 6];
                        e2 = 1500;
                        return [3 /*break*/, 8];
                    case 6: return [4 /*yield*/, div1];
                    case 7:
                        e2 = (_a.sent()).elo;
                        _a.label = 8;
                    case 8:
                        if (victoryState > 3) {
                            elo = this.generateElo(e1, e2, 1);
                        }
                        else if (victoryState == 3) {
                            elo = this.generateElo(e1, e2, .5);
                        }
                        else if (victoryState < 3) {
                            elo = this.generateElo(e2, e1, 1);
                        }
                        console.log("div 1: ".concat(deck1.division, " div2: ").concat(deck2.division));
                        console.log(elo);
                        return [4 /*yield*/, this.database.setDivisionElo({ id: Number(deck1.raw.division), divName: deck1.division, elo: elo.p1Elo })];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, this.database.setDivisionElo({ id: Number(deck2.raw.division), divName: deck2.division, elo: elo.p2Elo })];
                    case 10:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RatingEngine.prototype.getChanceToWin = function (a, b) {
        var c = (1 / (1 + Math.pow(10, (b - a) / 400)));
        return c;
    };
    RatingEngine.prototype.getPlayerElo = function (discordId, message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.database.getDiscordElos(discordId, message.channel.id, message.guild.id)];
            });
        });
    };
    RatingEngine.prototype.createLadder = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.database.getGlobalLadder()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return RatingEngine;
}());
exports.RatingEngine = RatingEngine;
//# sourceMappingURL=rating.js.map