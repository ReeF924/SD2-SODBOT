import { Application } from 'express'
import * as express from 'express'
import { Logs } from '../general/logs'
import { DB } from '../general/db'

export class API {
    private database: DB;
    express: Application = express()
    public port = 3000
    public constructor(database: DB) {
        this.database = database;
    }


    public start(): void {
        //The same as leaderboard?
        // this.express.get('/replay', async (req,res)=>{
        //     if(req.query.user){
        //         const results = await this.database.getServerLadder(req.query.server as string)
        //         res.send(results);
        //     }else{
        //         const results = await this.database.getGlobalLadder()
        //         res.send(results);
        //     }
        // });
        this.express.get('/leaderboard', async (req, res) => {
            if (req.query.server) {
                const results = await this.database.getServerLadder(req.query.server as string)
                res.send(results);
            } else {
                const results = await this.database.getGlobalLadder()
                res.send(results);
            }
        });
        this.express.get('/divElo', async (req, res) => {
            const results = await this.database.getAllDivisionElo()
            res.send(results);
        });
        this.express.get('/', (req, res) => { res.send(200) });

        this.express.get('/replays', (req, res) => {

        });

        this.express.listen(this.port, () => {
            Logs.log("HTTP server started on " + this.port);
        });

    }
}