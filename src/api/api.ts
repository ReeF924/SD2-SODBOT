import {Application} from 'express'
import * as express from 'express'
import { Logs } from '../general/logs'
import { SqlHelper } from '../general/sqlHelper'

export class API {
    
    express:Application = express()
    public port = 8080


    start():void{
        this.express.get('/leaderboard', async (req,res)=>{
            const results = await SqlHelper.getGlobalLadder()
            res.send(results);
        })
        this.express.get('/', (req,res)=>{res.send(200)})
        this.express.listen(this.port, ()=>{
            Logs.log("HTTP server started on " + this.port);
        })

    }
}