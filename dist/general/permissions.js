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
exports.PermissionsSet = exports.Permissions = void 0;
var db_1 = require("./db");
var Permissions = /** @class */ (function () {
    function Permissions() {
    }
    Permissions.getPermissions = function (channel, server) {
        return __awaiter(this, void 0, void 0, function () {
            var perms, serverPerms, channelPerms, _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        perms = new PermissionsSet();
                        console.log(server);
                        if (server)
                            serverPerms = db_1.DB.getServerPermissions(server);
                        console.log(channel);
                        if (channel)
                            channelPerms = db_1.DB.getChannelPermissions(channel);
                        return [4 /*yield*/, serverPerms];
                    case 1:
                        if (!_e.sent()) return [3 /*break*/, 3];
                        _b = (_a = perms).apply;
                        return [4 /*yield*/, serverPerms];
                    case 2:
                        _b.apply(_a, [_e.sent()]);
                        _e.label = 3;
                    case 3: return [4 /*yield*/, channelPerms];
                    case 4:
                        if (!_e.sent()) return [3 /*break*/, 6];
                        _d = (_c = perms).apply;
                        return [4 /*yield*/, channelPerms];
                    case 5:
                        _d.apply(_c, [_e.sent()]);
                        _e.label = 6;
                    case 6:
                        console.log(perms);
                        return [2 /*return*/, perms];
                }
            });
        });
    };
    return Permissions;
}());
exports.Permissions = Permissions;
var PermissionsSet = /** @class */ (function () {
    function PermissionsSet() {
        this.areReplaysBlocked = false;
        this.areCommandsBlocked = false;
        this.isEloComputed = true;
        this.isGlobalEloComputed = true;
        this.isGlobalEloShown = true;
        this.isServerEloShown = true;
        this.isChannelEloShown = false;
    }
    PermissionsSet.prototype.apply = function (perms) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log(" apply " + perms);
                if (perms.blockReplay > 0)
                    this.areReplaysBlocked = true;
                if (perms.blockReplay < 0)
                    this.areReplaysBlocked = false;
                if (perms.blockCommands > 0)
                    this.areCommandsBlocked = true;
                if (perms.blockCommands < 0)
                    this.areCommandsBlocked = false;
                if (perms.blockElo < 0)
                    this.isEloComputed = true;
                if (perms.blockElo > 0)
                    this.isEloComputed = false;
                if (perms.blockGlobalElo > 0)
                    this.isGlobalEloShown = false;
                if (perms.blockGlobalElo < 0)
                    this.isChannelEloShown = true;
                if (perms.blockServerElo < 0)
                    this.isServerEloShown = true;
                if (perms.blockServerElo > 0)
                    this.isServerEloShown = false;
                if (perms.blockChannelElo > 0)
                    this.isChannelEloShown = false;
                if (perms.blockChannelElo < 0)
                    this.isChannelEloShown = true;
                return [2 /*return*/];
            });
        });
    };
    return PermissionsSet;
}());
exports.PermissionsSet = PermissionsSet;
//# sourceMappingURL=permissions.js.map