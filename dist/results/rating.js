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
exports.RatingEngine = void 0;
class RatingEngine {
    constructor(database) {
        this.k_value = 32;
        this.database = database;
    }
    rateMatch(p1, p2, victor) {
        console.log("Have arrived in rateMatch");
        const global = this.generateElo(p1.globalElo, p2.globalElo, victor);
        const server = this.generateElo(p1.serverElo, p2.serverElo, victor);
        const channel = this.generateElo(p1.channelElo, p2.channelElo, victor);
        const p1x = p1;
        const p2x = p2;
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
    }
    /**
    /@param gameState: 0 for p1 loss, 1 for p1 win, .5 for draw...
    **/
    generateElo(p1Elo, p2Elo, gameState) {
        const newP1Elo = this.k_value * (gameState - this.getChanceToWin(p1Elo, p2Elo));
        const newP2Elo = this.k_value * ((1 - gameState) - this.getChanceToWin(p2Elo, p1Elo));
        return { p1Elo: (p1Elo + newP1Elo), p1EloDelta: newP1Elo, p2Elo: (p2Elo + newP2Elo), p2EloDelta: newP2Elo };
    }
    doDivisionElo(deck1, deck2, victoryState) {
        return __awaiter(this, void 0, void 0, function* () {
            let div1 = this.database.getDivisionElo(Number(deck1.raw.division));
            let div2 = this.database.getDivisionElo(Number(deck2.raw.division));
            let elo, e1, e2;
            if (!(yield div1))
                e1 = 1500;
            else
                e1 = (yield div1).elo;
            if (!(yield div2))
                e2 = 1500;
            else
                e2 = (yield div1).elo;
            if (victoryState > 3) {
                elo = this.generateElo(e1, e2, 1);
            }
            else if (victoryState == 3) {
                elo = this.generateElo(e1, e2, .5);
            }
            else if (victoryState < 3) {
                elo = this.generateElo(e2, e1, 1);
            }
            console.log(`div 1: ${deck1.division} div2: ${deck2.division}`);
            console.log(elo);
            yield this.database.setDivisionElo({ id: Number(deck1.raw.division), divName: deck1.division, elo: elo.p1Elo });
            yield this.database.setDivisionElo({ id: Number(deck2.raw.division), divName: deck2.division, elo: elo.p2Elo });
        });
    }
    getChanceToWin(a, b) {
        const c = (1 / (1 + Math.pow(10, (b - a) / 400)));
        return c;
    }
    getPlayerElo(discordId, message) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.database.getDiscordElos(discordId, message.channel.id, message.guild.id);
        });
    }
    createLadder() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.database.getGlobalLadder();
        });
    }
}
exports.RatingEngine = RatingEngine;
//# sourceMappingURL=rating.js.map