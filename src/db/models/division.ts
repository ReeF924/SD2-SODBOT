import {Franchise} from "./admin";


export interface DivisionDto {
    id: number;
    name: string;
    franchise: Franchise;
    faction: boolean;
    nation: Nation;
    alias: string[];
}

export enum Nation {
    germany,
    hungary,
    romania_ax,
    finland,
    italy_ax,
    italy_al,
    bulgaria,
    ussr,
    usa,
    uk,
    france,
    poland,
    canada,
    south_africa,
    romania_al,
    new_zealand,
    yugoslavia,
    czechoslovakia,
    germany_west,
    germany_east,
    netherlands,
    belgium,
    spain,
    sweden
}