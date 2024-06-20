import {Franchise} from "../admins/adminsModels";

export interface ReplayDto {
    sessionId: string;
    uploadedIn: number;
    uploadedBy: number;
    uploadedAt: Date;
    franchise: Franchise;
    version: number;
    isTeamGame: boolean;
    map: string;
    mapType: MapType | null;
    victoryCondition: VictoryCondition;
    durationSec: number;
    replayType?: SkillLevel | null;
    replayPlayers: ReplayPlayerDto[];
}

export interface ReplayPlayerDto {
    playerId: number;
    nickname: string;
    elo: number;
    mapSide?: boolean | null;
    victory: boolean;
    division: number;
    faction: boolean; //false - axis, pact
    income: Income | null;
    deckCode: string;
}

export enum MapType {
    _1v1,
    _2v2,
    _3v3,
    _4v4,
    _10v10
}

export enum VictoryCondition {
    draw,
    minor,
    major,
    total
}

export enum SkillLevel {
    others,
    div1,
    div2,
    div3,
    div4,
    div5
}

export enum Income {
    balanced,
    vanguard,
    maverick,
    juggernaut,
    flatline,
    vForVictory
}
