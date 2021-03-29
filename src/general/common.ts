import { Logs } from "./logs";
import * as fs from 'fs';
import * as Levenshtein from  'levenshtein';


export class CommonUtil {

    static configData:Map<string,unknown>;

    static init():void{
        //load config file;
        this.configData = JSON.parse(fs.readFileSync("config.json",{encoding:"utf8"}));
        Logs.init();
    }

    static configBoolean(key:string,defaultSetting = false):boolean {
        if(this.configData[key]) 
            return Boolean(this.configData[key]);
        return defaultSetting;
    }

    static config(key:string, defaultSetting = ''):string {
        if(this.configData[key]) 
            return String(this.configData[key]);
        return defaultSetting;
    }

    static lexicalGuesser = (input:string, obj:string[]):string => {
        let closestWord = "";
        let closestNumber = 9999999;
      
        obj.forEach(i => {
          const x = new Levenshtein(input,i);
          if (x.distance < closestNumber) {
            closestNumber = x.distance;
            closestWord = i;
          }
        });
        return closestWord;
      };


}