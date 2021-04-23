import {Application} from 'express'
import * as express from 'express'
import { Logs } from '../general/logs'
import { SqlHelper } from '../general/sqlHelper'

class API {
    
    express:Application = express()
    public port = 8080


    start():void{

        this.express.get('/', (req,res)=>{res.send(200)})
        this.express.get('/leaderboard', async (req,res)=>{res.send(await JSON.stringify(SqlHelper.getGlobalLadder()))})
        this.express.listen(this.port, ()=>{
            Logs.log("HTTP server started on " + this.port);
        })

    }
}