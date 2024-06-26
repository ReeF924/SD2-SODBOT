import {divisions, DivisionStruct} from "sd2-data"
import {Franchise} from "../db/admins/adminsModels";
//Hopefully just temporary, before I'll convert .ndf files from mod files

require('dotenv').config();

const divisionsSD = [...divisions.divisionsAllies, ...divisions.divisionsAxis];
const divisionsWarno = [...divisions.divisionsNato, ...divisions.divisionsPact];


const allDivs = [
    ...divisionsSD.map((d: DivisionStruct):DivisionDto =>  { return {id: d.id, name: d.name, franchise: Franchise.sd2, alias: d.alias} satisfies DivisionDto}),
    ...divisionsWarno.map((d: DivisionStruct):DivisionDto => { return {id: d.id, name: d.name, franchise: Franchise.warno, alias: d.alias} satisfies DivisionDto})
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

interface DivisionDto {
    id: number;
    name: string;
    franchise: Franchise;
    alias: string[];
}

