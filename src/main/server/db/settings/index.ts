import { createConnection, Connection } from "typeorm";
import { Config } from "@server/entities/settings/Config";
import { Chat } from "@server/entities/messaging/Chat";

export class SettingsRepository {
    db: Connection = null;

    constructor() {
        this.db = null;
    }

    async initialize() {
        this.db = await createConnection({
            name: "settings",
            type: "sqlite",
            database: `@server/db/settings/settings.db`,
            entities: [Config],
            synchronize: false,
            logging: false
        });

        return this.db;
    }

    // async getNgrokServer(){
    //     const query = this.db.getRepository(Config).createQueryBuilder("")
    // }

    // async getChats(chatGuid?: string, withParticipants = true) {
    //     const query = this.db.getRepository(Chat).createQueryBuilder("chat");

    //     // Inner-join because a chat must have participants
    //     if (withParticipants) query.innerJoinAndSelect("chat.participants", "handle");

    //     // Add default WHERE clauses
    //     query.andWhere("chat.service_name == 'iMessage'");
    //     if (chatGuid) query.andWhere("chat.guid = :guid", { guid: chatGuid });

    //     const chats = await query.getMany();

    //     return chats;
    // }

}