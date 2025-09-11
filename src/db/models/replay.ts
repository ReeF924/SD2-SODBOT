import {Franchise} from "./admin";

export interface Replay extends ReplayDto{
    id: number;
}

export interface ReplayDto {
    sessionId: string;
    uploadedIn: string;
    uploadedBy: string;
    uploadedAt: Date;
    franchise: Franchise;
    version: number;
    isTeamGame: boolean;
    map: string;
    mapType: MapType | null;
    victoryCondition: VictoryCondition;
    durationSec: number;
    skillLevel?: SkillLevel | null;
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

export interface UploadReplayResponse{
    id: number;
    sessionId: string;
    uploadedIn: string;
    uploadedBy: string;
    uploadedAt: Date;
    franchise: Franchise;
    version: number;
    isTeamGame: boolean;
    map: string;
    mapType: MapType | null;
    victoryCondition: VictoryCondition;
    durationSec: number;
    skillLevel?: SkillLevel | null;
    replayPlayers: UploadReplayPlayerResponse[];
}

export interface UploadReplayPlayerResponse extends ReplayPlayerDto {
    mostUsedNickname: string;
    discordId: string | null;
    sodbotElo: number;
    oldSodbotElo: number | null;
}

export class ReplayReport {
    host:ReplayReportPlayer;
    guest:ReplayReportPlayer;
    channelId:string;
    persistentSearch: boolean
}

export class ReplayReportPlayer{
    constructor(discordId: string) {
        this.discordId = discordId;
    }

    discordId:string;
    divBans:string[] = [];
    mapBans:string[] = [];
    divPicks:DivPickWithOrder[] = [];
    mapPicks:MapPickWithOrder[] = [];
}

export interface PickOrder{
    order:number
}

export interface DivPickWithOrder extends PickOrder{
    pick:number;
}

export interface MapPickWithOrder extends PickOrder{
    pick:string;
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
