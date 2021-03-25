export class SqlHelper{


    static getBlacklist(): Map<string, boolean> {
        throw new Error("Method not implemented.");
    }

    constructor() {
      throw new Error("Method not implemented.");
        try {
            await SqlHelper.(`SELECT * FROM players`);
          } catch (err) {
            admin.createTables();
          }
    }
    
    static exec(string){
      throw new Error("Method not implemented.");
    }
}