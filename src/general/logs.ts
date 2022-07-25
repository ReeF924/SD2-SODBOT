import * as winston  from "winston";
import { CommonUtil } from "./common";


export class Logs {
    static logger: winston.Logger;
    static init():void{
        Logs.logger = winston.createLogger({
            level:CommonUtil.config("logLevel","verbose"),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({filename:"app.log",maxsize:20000000,maxFiles:3})
            ]
        })
    }
    static log(message:unknown):void{
        if(message)
            Logs.logger.log("info",message);
    }
    static error(message:unknown):void{
        if(message)
            Logs.logger.log("error",message);
    }
}