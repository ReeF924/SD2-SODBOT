import {Application} from 'express'
import * as express from 'express'
import { Logs } from '../general/logs'

class API {
    
    express:Application = express()
    public port = 8080


    start():void{

        this.express.get('/', (req,res)=>{res.send(200)})
        this.express.get('/leaderboard', (req,res)=>{
            
        });


        this.express.listen(this.port, ()=>{
            Logs.log("HTTP server started on " + this.port);
        })

    }
}