import {divisions, DivisionStruct} from "sd2-data"
import {Franchise} from "../db/models/admin";
import {DivisionDto, Nation} from "../db/models/division";
import {MapType} from "../db/models/replay";

//Hopefully just temporary, before I'll convert .ndf files from mod files

require('dotenv').config();


const allDivs = [
    ...divisions.divisionsAxis.map((d: DivisionStruct):DivisionDto =>
    { return {id: d.id, name: d.name, franchise: Franchise.sd2, faction: false, nation: Nation[d.nation as keyof typeof Nation], alias: d.alias} satisfies DivisionDto}),
    ...divisions.divisionsAllies.map((d: DivisionStruct):DivisionDto =>
    { return {id: d.id, name: d.name, franchise: Franchise.sd2, faction: true, nation: Nation[d.nation as keyof typeof Nation], alias: d.alias} satisfies DivisionDto}),
    ...divisions.divisionsPact.map((d: DivisionStruct):DivisionDto =>
    { return {id: d.id, name: d.name, franchise: Franchise.warno, faction: false, nation: Nation[d.nation as keyof typeof Nation], alias: d.alias} satisfies DivisionDto}),
    ...divisions.divisionsNato.map((d: DivisionStruct):DivisionDto =>
    { return {id: d.id, name: d.name, franchise: Franchise.warno, faction: true, nation: Nation[d.nation as keyof typeof Nation], alias: d.alias} satisfies DivisionDto}),
        ];


const url = process.env.API_URL + '/divisions';


(async () => {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(allDivs)
    });

    const newDivs = await response.json();

    console.log('divisions added:', newDivs);
})();