import { DB } from "../general/db";
import {Message, SlashCommandBuilder} from "discord.js";

export abstract class CommandDB{
    protected database:DB;
    public constructor(database:DB){
        this.database = database;
    }
}
