import * as winston  from "winston";
import { CommonUtil } from "./common";


export class Logs {
    static logger: winston.Logger;
    static init(){
        this.logger = winston.createLogger({
            level:CommonUtil.config("logLevel","verbose"),
            transports: [
                new winston.transports.Console()
            ]
        })
    }
    static log(message:any){
        this.logger.log("info",message);
    }
    static error(message:any){
        this.logger.log("error",message);
    }
}