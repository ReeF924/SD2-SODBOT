import { Logs } from "./logs";
import * as fs from 'fs';
import * as levenshtein from 'js-levenshtein';

export class CommonUtil {

    static configData:any;

    static init(){
        //load config file;
        this.configData = JSON.parse(fs.readFileSync("config.json",{encoding:"utf8"}));
        Logs.init();
    }

    static configBoolean(key:string,defaultSetting:boolean = false):boolean {
        if(this.configData[key]) 
            return Boolean(this.configData[key]);
        return defaultSetting;
    }

    static config(key:string, defaultSetting:string = ''):string {
        if(this.configData[key]) 
            return String(this.configData[key]);
        return defaultSetting;
    }

    static lexicalGuesser = (input, obj) => {
        let closestWord = "";
        let closestNumber = 9999999;
      
        Object.keys(obj).forEach(i => {
          if (levenshtein(input, i) < closestNumber) {
            closestNumber = levenshtein(input, i);
            closestWord = i;
          }
        });
        closestNumber = 99999999;
        return closestWord;
      };


}