import { app } from "electron";
import { createConnection, Connection } from "typeorm";

import { Attachment, AttachmentMessageJoin, Chat, Handle, ChatHandleJoin, Message, ChatMessageJoin } from "./entity";

export class ChatRepository {
    db: Connection = null;

    constructor() {
        this.db = null;
    }

    async initialize() {
        if (this.db) {
            if (!this.db.isConnected) await this.db.connect();
            return this.db;
        }

        let dbPath = `${app.getPath("userData")}/chat.db`;
        if (process.env.NODE_ENV !== "production") {
            dbPath = `${app.getPath("userData")}/BlueBubbles-Desktop-App/chat.db`;
        }

        this.db = await createConnection({
            name: "chat",
            type: "sqlite",
            database: dbPath,
            entities: [Attachment, AttachmentMessageJoin, Chat, Handle, ChatHandleJoin, Message, ChatMessageJoin],
            synchronize: true,
            logging: false
        });

        return this.db;
    }

    // async getChatPrevs() {
    //     // Get convo participants, most recent message, and message timestamp from all conversations
    // }
}
