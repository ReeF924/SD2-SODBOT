
export interface Player {
    id: number;
    discordId: string;
    sdElo: number;
    SdTeamGameElo: number;
    warnoElo: number;
    warnoTeamGameElo: number;
    nickname: string;
    alsoKnownAs: string[];
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