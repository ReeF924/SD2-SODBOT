import { DB } from "../general/db";

export abstract class CommandDB{
    protected database:DB;
    public constructor(database:DB){
        this.database = database;
    }
}
