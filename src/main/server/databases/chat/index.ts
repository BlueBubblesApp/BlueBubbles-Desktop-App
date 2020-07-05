import { app } from "electron";
import { createConnection, Connection, FindManyOptions } from "typeorm";
import { ChatResponse, HandleResponse, MessageResponse } from "@server/types";

import { Attachment, Chat, Handle, Message } from "./entity";
import { GetMessagesParams } from "./types";

export class ChatRepository {
    db: Connection = null;

    constructor() {
        this.db = null;
    }

    async initialize(): Promise<Connection> {
        const isDev = process.env.NODE_ENV !== "production";
        if (this.db) {
            if (!this.db.isConnected) await this.db.connect();
            return this.db;
        }

        let dbPath = `${app.getPath("userData")}/chat.db`;
        if (isDev) {
            dbPath = `${app.getPath("userData")}/BlueBubbles-Desktop-App/chat.db`;
        }

        this.db = await createConnection({
            name: "chat",
            type: "sqlite",
            database: dbPath,
            entities: [Attachment, Chat, Handle, Message],
            synchronize: isDev,
            logging: false
        });

        // Create the tables
        if (!isDev) await this.db.synchronize();

        return this.db;
    }

    async getChats(guid = null) {
        const repo = this.db.getRepository(Chat);
        const params: FindManyOptions<Chat> = { relations: ["participants"] };
        if (guid) params.where = { guid };
        return repo.find(params);
    }

    async getMessages({
        chatGuid = null,
        offset = 0,
        limit = 100,
        after = null,
        before = null,
        withChats = false,
        withAttachments = true,
        withHandle = true,
        sort = "DESC",
        where = [
            {
                statement: "message.text IS NOT NULL",
                args: null
            }
        ]
    }: GetMessagesParams) {
        // Sanitize some params
        // eslint-disable-next-line no-param-reassign
        if (after && typeof after === "number") after = new Date(after);
        // eslint-disable-next-line no-param-reassign
        if (before && typeof before === "number") before = new Date(before);

        // Get messages with sender and the chat it's from
        const query = this.db.getRepository(Message).createQueryBuilder("message");

        if (withHandle) query.leftJoinAndSelect("message.handle", "handle");

        if (withAttachments)
            query.leftJoinAndSelect(
                "message.attachments",
                "attachment",
                "message.ROWID = message_attachment.messageId AND " +
                    "attachment.ROWID = message_attachment.attachmentId"
            );

        // Inner-join because all messages will have a chat
        if (chatGuid) {
            query
                .innerJoinAndSelect(
                    "message.chats",
                    "chat",
                    "message.ROWID = message_chat.messageId AND chat.ROWID = message_chat.chatId"
                )
                .andWhere("chat.guid = :guid", { guid: chatGuid });
        } else if (withChats) {
            query.innerJoinAndSelect(
                "message.chats",
                "chat",
                "message.ROWID = message_chat.messageId AND chat.ROWID = message_chat.chatId"
            );
        }

        // Add date restraints
        if (after)
            query.andWhere("message.dateCreated >= :after", {
                after: after as Date
            });
        if (before)
            query.andWhere("message.dateCreated < :before", {
                before: before as Date
            });

        if (where && where.length > 0) for (const item of where) query.andWhere(item.statement, item.args);

        // Add pagination params
        query.orderBy("message.dateCreated", sort);
        query.offset(offset);
        query.limit(limit);

        return query.getMany();
    }

    static createChatFromResponse(res: ChatResponse): Chat {
        const chat = new Chat();
        chat.guid = res.guid;
        chat.chatIdentifier = res.chatIdentifier;
        chat.displayName = res.displayName;
        chat.isArchived = res.isArchived ? 1 : 0;
        chat.style = res.style;
        chat.messages = (res.messages ?? []).map(msg => ChatRepository.createMessageFromResponse(msg));
        chat.participants = (res.participants ?? []).map(handle => ChatRepository.createHandleFromResponse(handle));
        return chat;
    }

    static createHandleFromResponse(res: HandleResponse): Handle {
        const handle = new Handle();
        handle.address = res.address;
        handle.country = res.country;
        handle.uncanonicalizedId = res.uncanonicalizedId;
        handle.chats = (res.chats ?? []).map(chat => ChatRepository.createChatFromResponse(chat));
        handle.messages = (res.messages ?? []).map(msg => ChatRepository.createMessageFromResponse(msg));
        return handle;
    }

    static createMessageFromResponse(res: MessageResponse): Message {
        const message = new Message();
        message.handleId = res.handleId || res.handleId === 0 ? null : res.handleId;
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
        message.chats = (res.chats ?? []).map(chat => ChatRepository.createChatFromResponse(chat));
        message.handle = res.handle ? ChatRepository.createHandleFromResponse(res.handle) : null;
        return message;
    }

    async saveChat(chat: Chat): Promise<Chat> {
        const repo = this.db.getRepository(Chat);
        const existing = chat.ROWID
            ? chat
            : await repo.findOne({ relations: ["participants"], where: { guid: chat.guid } });
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
        const repo = this.db.getRepository(Handle);
        let theHandle: Handle = null;

        // If the handle doesn't have a ROWID, try to find it
        if (!handle.ROWID) {
            theHandle = await repo.findOne({ relations: ["chats"], where: { address: handle.address } });
        }

        // If the handle wasn't found, set it to the input handle
        if (!theHandle && !handle.ROWID) {
            theHandle = await repo.save(handle);
        }

        // Add the handle to the chat if it doesn't already exist
        if (!theHandle.chats.find(i => i.ROWID === savedChat.ROWID)) {
            await repo
                .createQueryBuilder()
                .relation(Handle, "chats")
                .of(theHandle)
                .add(savedChat);
        }

        return theHandle;
    }

    async saveMessage(chat: Chat, message: Message): Promise<Message> {
        // Always save the chat first
        const savedChat = await this.saveChat(chat);
        const repo = this.db.getRepository(Message);
        let theMessage = null;

        // If the message doesn't have a ROWID, try to find it
        if (!message.ROWID) {
            theMessage = await repo.findOne({ relations: ["handle"], where: { guid: message.guid } });
        }

        // If it exists, check if anything has really changed before updating
        if (theMessage) {
            if (
                theMessage.dateDelivered !== message.dateDelivered ||
                theMessage.dateRead !== message.dateRead ||
                theMessage.error !== message.error ||
                theMessage.isArchived !== message.isArchived ||
                theMessage.datePlayed !== message.datePlayed
            ) {
                await repo.update(theMessage, {
                    dateDelivered: message.datePlayed,
                    dateRead: message.dateRead,
                    error: message.error,
                    isArchived: message.isArchived,
                    datePlayed: message.datePlayed
                });
            }

            return theMessage;
        }

        // Add handle to the message
        if (message.handle) {
            // eslint-disable-next-line no-param-reassign
            message.handle = await this.saveHandle(chat, message.handle);
        }

        // If the message wasn't found, set it to the input message
        theMessage = await repo.save(message);

        // Add the message to the chat if it doesn't already exist
        if (!theMessage.chats.find(i => i.ROWID === savedChat.ROWID)) {
            await repo
                .createQueryBuilder()
                .relation(Message, "chats")
                .of(theMessage)
                .add(savedChat);
        }

        return theMessage;
    }

    async saveAttachment(chat: Chat, message: Message, attachment: Attachment): Promise<Attachment> {
        // Always save the chat first
        const savedChat = await this.saveChat(chat);
        const savedMessage = await this.saveMessage(savedChat, message);
        const repo = this.db.getRepository(Attachment);
        let theAttachment = null;

        // If the attachment doesn't have a ROWID, try to find it
        if (!attachment.ROWID) {
            theAttachment = await repo.findOne({ relations: ["messages"], where: { guid: attachment.guid } });
        }

        // If the message wasn't found, set it to the input message
        if (!theAttachment) theAttachment = await repo.save(attachment);

        // Add the message to the chat if it doesn't already exist
        if (!theAttachment.messages.find(i => i.ROWID === savedMessage.ROWID)) {
            await repo
                .createQueryBuilder()
                .relation(Attachment, "messages")
                .of(theAttachment)
                .add(savedMessage);
        }

        return theAttachment;
    }
}
