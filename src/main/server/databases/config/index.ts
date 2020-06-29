import { app } from "electron";
import { createConnection, Connection } from "typeorm";

import { Config } from "./entity";

export class ConfigRepository {
    db: Connection = null;

    constructor() {
        this.db = null;
    }

    async initialize() {
        if (this.db) {
            if (!this.db.isConnected) await this.db.connect();
            return this.db;
        }

        let dbPath = `${app.getPath("userData")}/config.db`;
        if (process.env.NODE_ENV !== "production") {
            dbPath = `${app.getPath("userData")}/BlueBubbles-Desktop-App/config.db`;
        }

        this.db = await createConnection({
            name: "config",
            type: "sqlite",
            database: dbPath,
            entities: [Config],
            synchronize: true,
            logging: false
        });

        return this.db;
    }

    // async getChatPrevs() {
    //     // Get convo participants, most recent message, and message timestamp from all conversations
    // }
}
