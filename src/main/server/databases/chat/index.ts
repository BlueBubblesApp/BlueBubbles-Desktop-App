import { app } from "electron";
import { createConnection, Connection } from "typeorm";
import { ChatResponse, HandleResponse, MessageResponse } from "@server/types";

import { Attachment, AttachmentMessageJoin, Chat, Handle, ChatHandleJoin, Message, ChatMessageJoin } from "./entity";

export class ChatRepository {
    db: Connection = null;

    constructor() {
        this.db = null;
    }

    async initialize(): Promise<Connection> {
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

    static createChatFromResponse(res: ChatResponse): Chat {
        const chat = new Chat();
        chat.guid = res.guid;
        chat.chatIdentifier = res.chatIdentifier;
        chat.displayName = res.displayName;
        chat.isArchived = res.isArchived ? 1 : 0;
        chat.style = res.style;
        return chat;
    }

    static createHandleFromResponse(res: HandleResponse): Handle {
        const handle = new Handle();
        handle.address = res.address;
        handle.country = res.country;
        handle.uncanonicalizedId = res.uncanonicalizedId;
        return handle;
    }

    static createMessageFromResponse(res: MessageResponse): Message {
        const message = new Message();
        message.handleId = res.handleId;
        message.guid = res.guid;
        message.text = res.text;
        message.subject = res.subject;
        message.country = res.country;
        message.error = res.error;
        message.dateCreated = res.dateCreated ?? 0;
        message.dateRead = res.dateRead ?? 0;
        message.associatedMessageGuid = res.associatedMessageGuid;
        message.dateDelivered = res.dateDelivered ?? 0;
        message.isFromMe = res.isFromMe;
        message.isDelayed = res.isDelayed;
        message.isAutoReply = res.isAutoReply;
        message.isSystemMessage = res.isSystemMessage;
        message.isServiceMessage = res.isServiceMessage;
        message.isForward = res.isForward;
        message.isArchived = res.isArchived;
        message.cacheRoomnames = res.cacheRoomnames;
        message.isAudioMessage = res.isAudioMessage;
        message.datePlayed = res.datePlayed ?? 0;
        message.itemType = res.itemType;
        message.groupTitle = res.groupTitle;
        message.groupActionType = res.groupActionType;
        message.isExpired = res.isExpired;
        message.associatedMessageGuid = res.associatedMessageGuid;
        message.associatedMessageType = res.associatedMessageType ?? 0;
        message.expressiveSendStyleId = res.expressiveSendStyleId;
        message.timeExpressiveSendStyleId = res.timeExpressiveSendStyleId ?? 0;
        message.hasAttachments = Object.keys(res).includes("attachments") && res.attachments.length > 0;
        return message;
    }

    async saveChat(chat: Chat): Promise<Chat> {
        const repo = this.db.getRepository(Chat);
        const existing = chat.ROWID ? chat : await repo.findOne({ guid: chat.guid });
        if (existing) {
            if (existing.displayName !== chat.displayName) {
                // Right now, I don't think anything but the displayName will change
                await repo.update(existing, { displayName: chat.displayName });
            }

            return existing;
        }

        // If it doesn't exist, create it
        return repo.save(chat);
    }

    async saveHandle(chat: Chat, handle: Handle): Promise<Handle> {
        // Always save the chat first
        const savedChat = await this.saveChat(chat);

        // Save the handle
        const repo = this.db.getRepository(Handle);
        const existing = handle.ROWID ? handle : await repo.findOne({ address: handle.address });
        if (existing) return existing;

        // We don't ever really need to update a handle
        // so only save it when it doesn't exist
        const joinRepo = this.db.getRepository(ChatHandleJoin);
        const saved: Handle = await repo.save(handle);

        // Create the join table data
        console.log(saved.ROWID);
        console.log(savedChat.ROWID);
        const chj: ChatHandleJoin = new ChatHandleJoin();
        chj.chatId = savedChat.ROWID;
        chj.handleId = saved.ROWID;
        await joinRepo.save(chj);

        // Return the results
        return saved;
    }

    async saveMessage(chat: Chat, message: Message): Promise<Message> {
        // Always save the chat first
        const savedChat = await this.saveChat(chat);

        // Save the handle
        const repo = this.db.getRepository(Message);
        const existing = message.ROWID ? message : await repo.findOne({ guid: message.guid });

        // If it exists, check if anything has really changed before updating
        if (existing) {
            if (
                existing.dateDelivered !== message.dateDelivered ||
                existing.dateRead !== message.dateRead ||
                existing.error !== message.error ||
                existing.isArchived !== message.isArchived ||
                existing.datePlayed !== message.datePlayed
            ) {
                await repo.update(existing, {
                    dateDelivered: message.datePlayed,
                    dateRead: message.dateRead,
                    error: message.error,
                    isArchived: message.isArchived,
                    datePlayed: message.datePlayed
                });
            }

            return existing;
        }

        // We don't ever really need to update a handle
        // so only save it when it doesn't exist
        const joinRepo = this.db.getRepository(ChatMessageJoin);
        const saved: Message = await repo.save(message);

        // Create the join table data
        const cmj: ChatMessageJoin = new ChatMessageJoin();
        cmj.chatId = savedChat.ROWID;
        cmj.messageId = saved.ROWID;
        await joinRepo.save(cmj);

        return saved;
    }
}
