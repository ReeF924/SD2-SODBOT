import {SkillLevel} from "../replays/replaysModels";

export interface dbGuild{
    id: number;
    name: string;
    channels: dbChannel[];
}

export interface dbChannel{
    id: number;
    name: string;
    skillLevel: SkillLevel;
    primaryMode: Franchise;
}

export interface dbGuildPostDto {
    Id: number;
    Name: string;
    Channel: dbChannelPostDto;
}

export interface dbChannelPostDto{
    Id: number;
    Name: string;
    SkillLevel: SkillLevel;
    PrimaryMode: Franchise;
}

export enum Franchise{
    sd2,
    warno
}