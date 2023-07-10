import { Channel, Guild } from "discord.js";
import { Blacklist, DB} from "./db";

export class Permissions {
    private database:DB;
    public constructor(database:DB){
        this.database = database;
    }

    public async getPermissions(channel:string,server:string):Promise<PermissionsSet>{
        const perms = new PermissionsSet();
        let serverPerms
        if(server) serverPerms = this.database.getServerPermissions(server);
        let channelPerms 
        if(channel) channelPerms = this.database.getChannelPermissions(channel);
        if(await serverPerms)
            await perms.apply(await serverPerms)
        if(await channelPerms)
            await perms.apply(await channelPerms)
        return perms;
    }
    
}

export class PermissionsSet {
    areReplaysBlocked = false;
    areCommandsBlocked = false;
    isEloComputed = true;
    isGlobalEloComputed = true;
    isGlobalEloShown = true;
    isServerEloShown = true;
    isChannelEloShown = false;

    async apply(perms:Blacklist){
        // console.log(" apply " + perms)
        if(perms.blockReplay > 0) this.areReplaysBlocked = true
        if(perms.blockReplay < 0) this.areReplaysBlocked = false
        if(perms.blockCommands > 0) this.areCommandsBlocked = true
        if(perms.blockCommands < 0) this.areCommandsBlocked = false
        if(perms.blockElo < 0) this.isEloComputed = true
        if(perms.blockElo > 0) this.isEloComputed = false
        if(perms.blockGlobalElo > 0) this.isGlobalEloShown = false
        if(perms.blockGlobalElo < 0) this.isChannelEloShown = true
        if(perms.blockServerElo < 0) this.isServerEloShown = true
        if(perms.blockServerElo > 0) this.isServerEloShown = false
        if(perms.blockChannelElo > 0) this.isChannelEloShown = false
        if(perms.blockChannelElo < 0) this.isChannelEloShown = true
    }
}