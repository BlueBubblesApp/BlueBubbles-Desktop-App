import { createConnection, Connection } from "typeorm";

export class MessagingRepository {
    db: Connection = null;

    constructor() {
        this.db = null;
    }

    async initialize() {
        this.db = await createConnection({
            name: "messaging",
            type: "sqlite",
            database: `@server/db/messaging/messaging.db`,
            entities: [],
            synchronize: false,
            logging: false
        });

        return this.db;
    }

    async getChatPrevs() {
        //Get convo participants, most recent message, and message timestamp from all conversations
    }
}