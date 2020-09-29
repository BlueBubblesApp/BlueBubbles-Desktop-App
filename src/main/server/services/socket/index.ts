import { ipcMain } from "electron";
import * as io from "socket.io-client";
import * as os from "os";
import * as path from "path";
import * as Notifier from "node-notifier";
import { Connection } from "typeorm";

// Internal Libraries
import { FileSystem } from "@server/fileSystem";
import { ResponseFormat, ChatResponse, MessageResponse } from "@server/types";

// Database Dependency Imports
import { Server } from "@server/index";
import { FCMService } from "@server/services";
import { ConfigRepository } from "@server/databases/config";
import { ChatRepository } from "@server/databases/chat";
import { generateChatTitle, generateUuid } from "@renderer/helpers/utils";

import { GetChatsParams, GetChatMessagesParams, GetAttachmentChunkParams } from "./types";

export class SocketService {
    db: Connection;

    server: SocketIOClient.Socket;

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
    constructor(db: Connection) {
        this.db = db;

        this.server = null;
    }

    dispose() {
        try {
            this.server.removeAllListeners();
            this.server.disconnect(); // This and .close might do the same thing
            this.server.close(); // This and .disconnect might do the same thing
        } catch {
            // TBH we don't care :)
        }
    }

    /**
     * Sets up the socket listeners
     */
    async start(firstConnect = false): Promise<boolean> {
        let retry = !firstConnect;

        if (
            !Server().configRepo ||
            !Server().configRepo.get("serverAddress") ||
            !Server().configRepo.get("passphrase")
        ) {
            console.error("Setup has not been completed!");
            return false;
        }

        return new Promise((resolve, reject) => {
            const address = Server().configRepo.get("serverAddress") as string;
            this.server = io(address, {
                query: {
                    guid: Server().configRepo.get("passphrase")
                }
            });

            this.startSocketHandlers();

            this.server.on("connect", () => {
                console.log("Connected to server via socket.");
                Server().setSyncStatus({ completed: true, error: false, message: "Connected!" });

                // If we've connected, and stayed connected (authenticated),
                // Then we want to tell ourselves to retry when disconnected
                setTimeout(() => {
                    if (this.server && this.server.connected) retry = true;
                    this.fetchFcmConfigs();

                    console.log("Syncing with server...");
                    Server().syncWithServer();
                }, 1000);

                resolve(true);
            });

            this.server.on("disconnect", () => {
                console.log("Disconnected from socket server.");
                Server().setSyncStatus({ completed: true, error: true, message: "Disconnected!" });
                reject(new Error("Disconnected from socket."));
            });

            this.server.on("connect_error", () => {
                const msg = `Unable to connect to server: ${address}`;
                console.log(msg);

                // If this is the first/initial connect, disconnect if there is an error
                if (!retry) this.server.disconnect();
                reject(new Error(msg));
            });
        });
    }

    startSocketHandlers() {
        if (!this.server) return;

        const handleNewMessage = async (event: string, message: MessageResponse) => {
            // First, add the message to the queue
            Server().queueService.add(event, message);

            // Next, we want to create a notification for the new message
            // If the window is focused, don't show a notification
            if (Server().window && Server().window.isFocused()) return;

            // Save the associated chat so we can get the participants to build the title
            const chatData = message.chats[0];
            const chat = ChatRepository.createChatFromResponse(chatData);
            const savedChat = await Server().chatRepo.saveChat(chat);
            const chatTitle = generateChatTitle(savedChat);
            const text = message.attachments.length === 0 ? message.text : "1 Attachment";

            // Build the base notification parameters
            let customPath = null;
            if (os.platform() === "darwin")
                customPath = path.join(
                    FileSystem.modules,
                    "node-notifier",
                    "/vendor/mac.noindex/terminal-notifier.app/Contents/MacOS/terminal-notifier"
                );

            const notificationData: any = {
                appId: "com.BlueBubbles.BlueBubbles-Desktop",
                id: message.guid,
                title: chatTitle,
                icon: path.join(FileSystem.resources, "logo64.png"),
                customPath
            };

            // Don't show a notificaiton if they have been disabled
            if (Server().configRepo.get("globalNotificationsDisabled")) return;

            // Build the notification parameters
            if (message.error) {
                notificationData.subtitle = "Error";
                notificationData.message = "Message failed to send";
            } else {
                notificationData.subtitle = "New Message";
                notificationData.message = text;
                notificationData.sound = !Server().configRepo.get("globalNotificationsMuted");
                notificationData.wait = true;
                notificationData.reply = true;
                notificationData.actions = "Reply";
                notificationData.closeLabel = "Close";
            }

            // Don't show a notification if there is no error or it's from me
            if (!message.error && message.isFromMe) return;

            Notifier.notify(notificationData, async (error, response, metadata) => {
                if (error || response !== "replied") return;
                const reply = metadata.activationValue;

                // Create the message
                const newMessage = ChatRepository.createMessage({
                    chat,
                    guid: `temp-${generateUuid()}`,
                    text: reply,
                    dateCreated: new Date()
                });

                // Save the message
                await Server().chatRepo.saveMessage(chat, newMessage);

                // Send the message
                this.server.emit("send-message", {
                    tempGuid: newMessage.guid,
                    guid: chat.guid,
                    message: newMessage.text
                });
            });

            Notifier.on("click", async (notifierObject, options, clickEvent) => {
                // Focus the window, and set the current chat to the clicked chat
                ipcMain.emit("force-focus");
                Server().emitToUI("notification-clicked", savedChat);
            });
        };

        this.server.on("new-message", (message: MessageResponse) => handleNewMessage("save-message", message));
        this.server.on("updated-message", (message: MessageResponse) =>
            Server().queueService.add("save-message", message)
        );
        this.server.on("group-name-change", (message: MessageResponse) =>
            Server().queueService.add("save-message", message)
        );
        this.server.on("participant-removed", (message: MessageResponse) =>
            Server().queueService.add("save-message", message)
        );
        this.server.on("participant-added", (message: MessageResponse) =>
            Server().queueService.add("save-message", message)
        );
        this.server.on("participant-left", (message: MessageResponse) =>
            Server().queueService.add("save-message", message)
        );

        this.server.on("reconnect_attempt", attempt => {
            Server().setSyncStatus({ completed: false, error: false, message: `Reconnecting (${attempt})` });
        });
    }

    async fetchFcmConfigs(): Promise<void> {
        if (!this.server || !this.server.connected) return;

        // Get and save the FCM client
        const payload = await this.getFcmClient();
        FileSystem.saveFCMClient(payload);

        // Start the FCM service
        FCMService.start();
    }

    async getFcmClient(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.server.emit("get-fcm-client", null, res => {
                if ([200, 201].includes(res.status)) {
                    resolve(res.data);
                } else {
                    reject(res.message);
                }
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

    async getMessages({
        chatGuid = null,
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
    }: GetChatMessagesParams): Promise<MessageResponse[]> {
        return new Promise<MessageResponse[]>((resolve, reject) => {
            this.server.emit(
                "get-messages",
                {
                    chatGuid,
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
