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
exports.PermissionsSet = exports.Permissions = void 0;
class Permissions {
    constructor(database) {
        this.database = database;
    }
    getPermissions(channel, server) {
        return __awaiter(this, void 0, void 0, function* () {
            const perms = new PermissionsSet();
            let serverPerms;
            console.log(server);
            if (server)
                serverPerms = this.database.getServerPermissions(server);
            let channelPerms;
            console.log(channel);
            if (channel)
                channelPerms = this.database.getChannelPermissions(channel);
            if (yield serverPerms)
                perms.apply(yield serverPerms);
            if (yield channelPerms)
                perms.apply(yield channelPerms);
            console.log(perms);
            return perms;
        });
    }
}
exports.Permissions = Permissions;
class PermissionsSet {
    constructor() {
        this.areReplaysBlocked = false;
        this.areCommandsBlocked = false;
        this.isEloComputed = true;
        this.isGlobalEloComputed = true;
        this.isGlobalEloShown = true;
        this.isServerEloShown = true;
        this.isChannelEloShown = false;
    }
    apply(perms) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
}
exports.PermissionsSet = PermissionsSet;
//# sourceMappingURL=permissions.js.map