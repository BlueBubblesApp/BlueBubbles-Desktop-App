import * as io from "socket.io-client";

// Internal Libraries
import { FileSystem } from "@server/fileSystem";
import { ResponseFormat, ChatResponse, MessageResponse, AttachmentResponse } from "@server/types";

// Database Dependency Imports
import { ConfigRepository } from "@server/databases/config";
import { ChatRepository } from "@server/databases/chat";
import { Connection } from "typeorm";

import { GetChatsParams, GetChatMessagesParams, GetAttachmentChunkParams } from "./types";

export class SocketService {
    db: Connection;

    server: SocketIOClient.Socket;

    chatRepo: ChatRepository;

    configRepo: ConfigRepository;

    serverAddress: string;

    passphrase: string;

    /**
     * Starts up the initial Socket.IO connection and initializes other
     * required classes and variables
     *
     * @param chatRepo The iMessage database repository
     * @param configRepo The app's settings repository
     * @param fs The filesystem class handler
     */
    constructor(db: Connection, chatRepo: ChatRepository, configRepo: ConfigRepository) {
        this.db = db;

        this.server = null;
        this.chatRepo = chatRepo;
        this.configRepo = configRepo;
    }

    /**
     * Sets up the socket listeners
     */
    async start(firstConnect = false): Promise<boolean> {
        let retry = !firstConnect;

        if (!this.configRepo || !this.configRepo.get("serverAddress") || !this.configRepo.get("passphrase")) {
            console.error("Setup has not been completed!");
            return false;
        }

        return new Promise((resolve, reject) => {
            this.server = io(this.configRepo.get("serverAddress") as string, {
                query: {
                    guid: this.configRepo.get("passphrase")
                }
            });

            this.server.on("connect", () => {
                console.log("Connected to server via socket.");

                // If we've connected, and stayed connected (authenticated),
                // Then we want to tell ourselves to retry when disconnected
                setTimeout(() => {
                    if (this.server && this.server.connected) retry = true;
                }, 1000);

                resolve(true);
            });

            this.server.on("disconnect", () => {
                console.log("Disconnected from socket server.");
                reject(new Error("Disconnected from socket."));
            });

            this.server.on("connect_error", () => {
                console.log("Unable to connect to server.");

                // If this is the first/initial connect, disconnect if there is an error
                if (!retry) this.server.disconnect();
                reject(new Error("Unable to connect to server."));
            });
        });
    }

    async getChats({ withParticipants = true }: GetChatsParams): Promise<ChatResponse[]> {
        return new Promise<ChatResponse[]>((resolve, reject) => {
            this.server.emit("get-chats", { withParticipants }, (res: ResponseFormat) => {
                if ([200, 201].includes(res.status)) {
                    resolve(res.data as ChatResponse[]);
                } else {
                    reject(res.message);
                }
            });
        });
    }

    async getChatMessages(
        identifier: string,
        {
            offset = 0,
            limit = 25,
            after = null,
            before = null,
            withChats = false,
            withHandle = true,
            withAttachments = true,
            withBlurhash = true,
            sort = "DESC",
            where = []
        }: GetChatMessagesParams
    ): Promise<MessageResponse[]> {
        return new Promise<MessageResponse[]>((resolve, reject) => {
            this.server.emit(
                "get-chat-messages",
                {
                    identifier,
                    offset,
                    limit,
                    after,
                    before,
                    withChats,
                    withHandle,
                    withAttachments,
                    withBlurhash,
                    where,
                    sort
                },
                res => {
                    if ([200, 201].includes(res.status)) {
                        resolve(res.data as MessageResponse[]);
                    } else {
                        reject(res.message);
                    }
                }
            );
        });
    }

    async getAttachmentChunk(
        attachmentGuid,
        { start = 0, chunkSize = 1024, compress = false }: GetAttachmentChunkParams
    ): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.server.emit(
                "get-attachment-chunk",
                {
                    identifier: attachmentGuid,
                    start,
                    chunkSize,
                    compress
                },
                res => {
                    if ([200, 201].includes(res.status)) {
                        resolve(res.data as string);
                    } else {
                        reject(res.message);
                    }
                }
            );
        });
    }
}
