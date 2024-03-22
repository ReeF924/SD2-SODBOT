import * as winston from "winston";
import {CommonUtil} from "./common";
import * as fs from 'fs';
import * as readline from "readline";
import  * as path from 'path';
export class Logs {
    static logger: winston.Logger;

    static init(): void {
        Logs.logger = winston.createLogger({
            level: CommonUtil.config("logLevel", "verbose"),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({filename: "app.log", maxsize: 20000000, maxFiles: 3})
            ]
        })
    }

    static log(message: unknown): void {
        if (!message) return;

        Logs.logger.log("info", message);
    }

    static error(message: unknown): void {
        if (message)
            Logs.logger.log("error", message);
    }

    static async addMap(mapName:string): Promise<boolean>{
        const filePath = path.join(__dirname,'..', '..',  'toAddMaps.log');

        const fileStream = fs.createReadStream(filePath);

        const rl = readline.createInterface({input: fileStream, crlfDelay: Infinity});

        for await (const line of rl) {
            if(line === mapName){
                console.log(line);
                return true;
            }
        }

        fs.appendFile(filePath, mapName + "\n", (err) => {
            if (err) {
                Logs.error(err);
                return false;
            }
        });
        return false;
    }
}