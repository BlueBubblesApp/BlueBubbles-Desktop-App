/* eslint-disable prefer-destructuring */
/* eslint-disable max-len */
import { app } from "electron";
import * as path from "path";
import * as fs from "fs";
import * as mime from "mime";

import { createConnection, Connection, FindManyOptions, DeepPartial } from "typeorm";
import { ChatResponse, HandleResponse, MessageResponse, AttachmentResponse } from "@server/types";

import { Attachment, Chat, Handle, Message } from "./entity";
import { GetMessagesParams, CreateMessageParams, CreateAttachmentParams } from "./types";

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
            type: "better-sqlite3",
            database: dbPath,
            entities: [Attachment, Chat, Handle, Message],
            synchronize: isDev,
            logging: false
        });

        // Create the tables
        if (!isDev) await this.db.synchronize();

        return this.db;
    }

    static createMessage({
        chat,
        guid,
        text,
        handle = null,
        dateCreated = null,
        error = 0,
        hasAttachments = false,
        associatedMessageGuid = null,
        associatedMessageType = null
    }: CreateMessageParams) {
        const message = new Message();
        message.guid = guid;
        message.text = text;
        message.dateCreated = dateCreated ? dateCreated.getTime() : new Date().getTime();
        message.error = error;
        message.isDelayed = false;
        message.isAutoReply = false;
        message.isSystemMessage = false;
        message.isArchived = false;
        message.isServiceMessage = false;
        message.isForward = false;
        message.isExpired = false;
        message.cacheRoomnames = chat.guid.includes("iMessage;+;chat") ? chat.chatIdentifier : null;
        message.isAudioMessage = false;
        message.datePlayed = 0;
        message.itemType = 0;
        message.groupTitle = null;
        message.groupActionType = 0;
        message.attachments = [];
        message.chats = [chat];
        message.hasAttachments = hasAttachments;
        message.hasReactions = false;
        message.associatedMessageGuid = associatedMessageGuid;
        message.associatedMessageType = associatedMessageType;

        // Handle ID is null for anything that is from ourselves
        message.handleId = null;

        // If there is a handle provided, set fields accordingly
        if (handle) {
            message.handle = handle;
            message.handleId = handle.ROWID;
        } else {
            message.isFromMe = true;
        }

        return message;
    }

    static createAttachment({ attachmentPath, guid }: CreateAttachmentParams) {
        const exists = fs.existsSync(attachmentPath);
        if (!exists) return null;

        const stats = fs.statSync(attachmentPath);
        const attachment = new Attachment();
        attachment.guid = guid;
        attachment.uti = "public.jpeg";
        attachment.mimeType = mime.getType(attachmentPath) ?? "application/octet-stream";
        attachment.transferState = 0;
        attachment.isOutgoing = true;
        attachment.transferName = path.basename(attachmentPath);
        attachment.totalBytes = stats.size;
        attachment.isSticker = false;
        attachment.hideAttachment = false;
        attachment.blurhash = null;
        attachment.height = null;
        attachment.width = null;

        return attachment;
    }

    async getHandles(address = null) {
        const repo = this.db.getRepository(Handle);
        const params: FindManyOptions<Handle> = {};
        if (address) params.where = { address };
        return repo.find(params);
    }

    async updateHandle(handle: Handle, updateData: DeepPartial<Handle>): Promise<void> {
        const repo = this.db.getRepository(Handle);

        // If the handle doesn't have a ROWID, try and find it
        let theHandle = handle;
        if (!theHandle.ROWID) theHandle = await repo.findOne({ where: { address: theHandle.address } });

        // Update the handle
        if (theHandle) await repo.update({ ROWID: theHandle.ROWID }, updateData);
    }

    async updateChat(chat: Chat, updateData: DeepPartial<Chat>): Promise<void> {
        const repo = this.db.getRepository(Chat);

        // If the handle doesn't have a ROWID, try and find it
        let theChat = chat;
        if (!theChat.ROWID) theChat = await repo.findOne({ where: { guid: theChat.guid } });

        // Update the chat
        if (theChat) await repo.update({ ROWID: theChat.ROWID }, updateData);
    }

    async getChats(guid = null) {
        const repo = this.db.getRepository(Chat);
        const params: FindManyOptions<Chat> = { relations: ["participants"] };
        if (guid) params.where = { guid };
        return repo.find(params);
    }

    async getMessageReactions(message: Message): Promise<Message[]> {
        const mesRepo = this.db.getRepository(Message);
        // eslint-disable-next-line max-len
        const reactions = await mesRepo.find({ relations: ["handle"], where: { associatedMessageGuid: message.guid } });
        const attachRepo = this.db.getRepository(Attachment);

        for (const reaction of reactions) {
            if (reaction.associatedMessageType === "sticker") {
                reaction.attachments = [];
                const res = await mesRepo.find({ relations: ["attachments"], where: { guid: reaction.guid } });

                res.forEach(x => {
                    x.attachments.forEach(sticker => {
                        reaction.attachments.push(sticker);
                    });
                });
            }
        }

        return reactions;
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
                after: (after as Date).getTime()
            });
        if (before)
            query.andWhere("message.dateCreated < :before", {
                before: (after as Date).getTime()
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

    static createAttachmentFromResponse(res: AttachmentResponse): Attachment {
        const attachment = new Attachment();
        attachment.guid = res.guid;
        attachment.blurhash = res.blurhash;
        attachment.hideAttachment = res.hideAttachment;
        attachment.isOutgoing = res.isOutgoing;
        attachment.isSticker = res.isSticker;
        attachment.mimeType = res.mimeType;
        attachment.totalBytes = res.totalBytes;
        attachment.transferName = res.transferName;
        attachment.transferState = res.transferState;
        attachment.height = res.height;
        attachment.width = res.width;
        attachment.uti = res.uti;
        return attachment;
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
        if (res.associatedMessageGuid) console.log(res.associatedMessageGuid);
        if (res.associatedMessageGuid) {
            if (res.associatedMessageGuid.includes(":") && res.associatedMessageGuid.includes("/")) {
                message.associatedMessageGuid = res.associatedMessageGuid.split("/")[1];
            } else if (res.associatedMessageGuid.includes("/") && !res.associatedMessageGuid.includes(":")) {
                message.associatedMessageGuid = res.associatedMessageGuid.split("/")[1];
            } else if (res.associatedMessageGuid.includes(":")) {
                message.associatedMessageGuid = res.associatedMessageGuid.split(":")[1];
            }
        }
        message.associatedMessageType = res.associatedMessageType;
        message.expressiveSendStyleId = res.expressiveSendStyleId;
        message.timeExpressiveSendStyleId = res.timeExpressiveSendStyleId ?? 0;
        message.hasAttachments = Object.keys(res).includes("attachments") && res.attachments.length > 0;
        message.hasReactions = false;
        message.chats = (res.chats ?? []).map(chat => ChatRepository.createChatFromResponse(chat));
        message.handle = res.handle ? ChatRepository.createHandleFromResponse(res.handle) : null;
        message.attachments = (res.attachments ?? []).map(attachment =>
            ChatRepository.createAttachmentFromResponse(attachment)
        );
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
                await repo.update({ guid: existing.guid }, { displayName: chat.displayName });
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
        let theHandle: Handle = handle.ROWID ? handle : null;

        // If the handle doesn't have a ROWID, try to find it
        if (!theHandle?.ROWID) {
            theHandle = await repo.findOne({ relations: ["chats"], where: { address: handle.address } });
        }

        // If the handle wasn't found, set it to the input handle
        if (!theHandle && !handle.ROWID) {
            theHandle = await repo.save(handle);
        }

        // Add the handle to the chat if it doesn't already exist
        if (!(theHandle.chats ?? []).find(i => i.ROWID === savedChat.ROWID)) {
            await repo
                .createQueryBuilder()
                .relation(Handle, "chats")
                .of(theHandle)
                .add(savedChat);
        }

        return theHandle;
    }

    async saveMessage(chat: Chat, message: Message, tempGuid = null): Promise<Message> {
        // Always save the chat first
        const savedChat = await this.saveChat(chat);
        const repo = this.db.getRepository(Message);
        let theMessage: Message = null;

        // If the message doesn't have a ROWID, try to find it
        if (!message.ROWID) {
            theMessage = await repo.findOne({ relations: ["handle", "attachments"], where: { guid: message.guid } });
        }

        // If a tempGuid is present, find the associated record
        if (tempGuid) {
            const tempMessage = await repo.findOne({ relations: ["handle", "attachments"], where: { guid: tempGuid } });

            // If the real message exists already, delete the temp record
            if (theMessage) {
                await repo.delete(tempMessage.ROWID);
            } else {
                theMessage = tempMessage;
            }
        }

        // If it exists, check if anything has really changed before updating
        if (theMessage) {
            const updateData: Partial<Message> = {};
            if (theMessage.guid !== message.guid) updateData.guid = message.guid;
            if (message.dateDelivered && theMessage.dateDelivered !== message.dateDelivered)
                updateData.dateDelivered = message.dateDelivered;
            if (message.dateRead && theMessage.dateRead !== message.dateRead) updateData.dateRead = message.dateRead;
            if (message.error && theMessage.error !== message.error) updateData.error = message.error;
            if (theMessage.isArchived !== message.isArchived) updateData.isArchived = message.isArchived;
            if (message.datePlayed && theMessage.datePlayed !== message.datePlayed)
                updateData.datePlayed = message.datePlayed;
            if (message.handleId !== null && message.handleId !== 0 && message.handleId !== theMessage.handleId)
                updateData.handleId = message.handleId;

            // Only send the update request if we have update info
            if (Object.keys(updateData).length > 0) await repo.update({ guid: theMessage.guid }, updateData);

            // Merge the update data with the current object
            for (const updateKey of Object.keys(updateData)) theMessage[updateKey] = updateData[updateKey];

            // Add in the chat for consistency
            theMessage.chats = [savedChat];
            return theMessage;
        }

        // If we've already saved it, don't save it again
        if (message.ROWID) return message;

        // Add handle to the message
        if (message.handle) {
            // eslint-disable-next-line no-param-reassign
            message.handle = await this.saveHandle(chat, message.handle);
        }

        // If the message wasn't found, set it to the input message
        theMessage = await repo.save(message);

        // Add the message to the chat if it doesn't already exist
        const chatIdx = (theMessage.chats ?? []).findIndex(i => i.ROWID === savedChat.ROWID);
        if (chatIdx === -1) {
            theMessage.chats.push(savedChat);
            await repo
                .createQueryBuilder()
                .relation(Message, "chats")
                .of(theMessage)
                .add(savedChat);
        } else {
            theMessage.chats[chatIdx] = savedChat;
        }

        // Save the attachments
        for (let i = 0; i < (theMessage.attachments ?? []).length; i += 1) {
            theMessage.attachments[i] = await this.saveAttachment(savedChat, theMessage, theMessage.attachments[i]);
        }

        // If this is a reaction, we want to update the associated message
        if (theMessage.associatedMessageGuid)
            await repo.update({ guid: theMessage.associatedMessageGuid }, { hasReactions: true });

        // If this isn't a regular message, and not already marked as as having reactions,
        // see if we can find any to be 100% sure hasReactions is correct.
        // This is a bit extra processing up front. But it helps when displaying via the UI
        if (
            theMessage.text &&
            !theMessage.associatedMessageGuid &&
            !theMessage.hasReactions &&
            !theMessage.associatedMessageType
        ) {
            const reactionMessage = await repo.findOne({ where: { associatedMessageGuid: theMessage.guid } });
            if (reactionMessage) {
                theMessage.hasReactions = true;
                await repo.update({ guid: theMessage.guid }, { hasReactions: true });
            }
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
        if (!(theAttachment.messages ?? []).find(i => i.ROWID === savedMessage.ROWID)) {
            await repo
                .createQueryBuilder()
                .relation(Attachment, "messages")
                .of(theAttachment)
                .add(savedMessage);
        }

        return theAttachment;
    }
}
