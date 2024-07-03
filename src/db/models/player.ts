
export interface player{
    id: number;
    discordId: string;
    sdElo: number;
    SdTeamGameElo: number;
    warnoElo: number;
    warnoTeamGameElo: number;
    nickname: string;
    alsoKnownAs: string[];
}

export interface playerPutDto{
    discordId: string;
    nickname: string;
}