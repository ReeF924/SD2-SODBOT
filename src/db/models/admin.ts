import {SkillLevel} from "./replay";

export interface dbGuild{
    id: string;
    name: string;
    channels: dbChannel[];
}

export interface dbChannel{
    id: string;
    name: string;
    skillLevel: SkillLevel;
    primaryMode: Franchise;
}

export interface dbGuildPostDto {
    Id: string;
    Name: string;
    Channel: dbChannelPostDto;
}

export interface dbChannelPostDto{
    Id: string;
    Name: string;
    SkillLevel: SkillLevel;
    PrimaryMode: Franchise;
}

export enum Franchise{
    sd2,
    warno
}