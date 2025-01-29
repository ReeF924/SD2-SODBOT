
export interface Player {
    id: number;
    discordId?: string;
    nickname: string;
    sdElo?: number;
    SdTeamGameElo?: number;
    warnoElo?: number;
    warnoTeamGameElo?: number;
}

export interface PlayerPutDto {
    discordId: string;
    nickname: string;
}

export interface PlayerRank{
    id: number;
    discordId?: string;
    name: string;
    elo: number;
    rank: number;
}

export interface PlayerAliases{
    id: number;
    aliases: string[];
}