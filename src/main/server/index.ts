import { ipcMain, BrowserWindow, shell, app } from "electron";
import { Connection, DeepPartial } from "typeorm";
import * as base64 from "byte-base64";
import * as path from "path";
import * as os from "os";
import * as Notifier from "node-notifier";

// Config and FileSystem Imports
import { FileSystem } from "@server/fileSystem";
import { DEFAULT_CONFIG_ITEMS, DEFAULT_DARK_THEME, DEFAULT_LIGHT_THEME, DEFAULT_NORD_THEME } from "@server/constants";
import { mergeUint8Arrays, parseVCards, sanitizeAddress, convertToSupportedType } from "@server/helpers/utils";

// Database Imports
import { ConfigRepository } from "@server/databases/config";
import { ChatRepository } from "@server/databases/chat";

// Service Imports
import { SocketService, QueueService } from "@server/services";

// Renderer imports
import { generateChatTitle, generateUuid } from "@renderer/helpers/utils";

import { ChatResponse, MessageResponse, ResponseFormat, HandleResponse, StatusData, SyncStatus } from "./types";
import { GetChatMessagesParams } from "./services/socket/types";
import { Attachment, Handle } from "./databases/chat/entity";
import { Theme } from "./databases/config/entity";

export class BackendServer {
    window: BrowserWindow;

    db: Connection;

    chatRepo: ChatRepository;

    configRepo: ConfigRepository;

    socketService: SocketService;

    queueService: QueueService;

    setupComplete: boolean;

    servicesStarted: boolean;

    syncStatus: SyncStatus;

    constructor(window: BrowserWindow) {
        this.window = window;

        // Databases
        this.chatRepo = null;
        this.configRepo = null;

        // Services
        this.socketService = null;
        this.queueService = null;

        this.setupComplete = false;
        this.servicesStarted = false;

        // Set a default sync status (defaults to being in progress)
        this.syncStatus = {
            completed: false,
            message: "Syncing...",
            error: false
        };
    }

    /**
     * Starts the back-end "server"
     */
    async start(): Promise<void> {
        console.log("Starting BlueBubbles Backend...");
        await this.setup();

        this.startConfigListeners();

        try {
            console.log("Launching Services..");
            await this.setupServices();
        } catch (ex) {
            console.log("Failed to launch server services.", "error");
        }

        console.log("Starting Configuration IPC Listeners...");
        this.startActionListeners();

        // Fetch the chats upon start
        console.log("Syncing initial chats...");
        await this.fetchChats();
    }

    /**
     * Sets up the server by initializing a "filesystem" and other
     * tasks such as setting up the databases and internal services
     */
    private async setup(): Promise<void> {
        console.log("Initializing database...");
        await this.initializeDatabases();

        try {
            console.log("Initializing filesystem...");
            FileSystem.setupDirectories();
        } catch (ex) {
            console.log(`!Failed to setup filesystem! ${ex.message}`);
        }

        this.setupComplete = true;
    }

    private async initializeDatabases() {
        try {
            console.log("Connecting to messaging database...");
            this.chatRepo = new ChatRepository();
            await this.chatRepo.initialize();
        } catch (ex) {
            console.log(`Failed to connect to messaging database! ${ex.message}`);
            console.log(ex);
        }

        try {
            console.log("Connecting to settings database...");
            this.configRepo = new ConfigRepository();
            await this.configRepo.initialize();
        } catch (ex) {
            console.log(`Failed to connect to settings database! ${ex.message}`);
        }

        await this.setupDefaults();
    }

    /**
     * Sets up default database values for configuration items
     */
    private async setupDefaults(): Promise<void> {
        try {
            for (const key of Object.keys(DEFAULT_CONFIG_ITEMS)) {
                if (!this.configRepo.contains(key)) {
                    await this.configRepo.set(key, DEFAULT_CONFIG_ITEMS[key]());
                }
            }
        } catch (ex) {
            console.log(`Failed to setup default configurations! ${ex.message}`);
        }

        // Sets up dark theme
        try {
            const theme = new Theme();
            for (const key of Object.keys(DEFAULT_DARK_THEME)) {
                theme[key] = DEFAULT_DARK_THEME[key]();
            }
            console.log(theme);
            await this.configRepo.setTheme(theme);
        } catch (ex) {
            console.log(`Failed to setup dark theme! ${ex.message}`);
        }

        // Sets up light theme
        try {
            const theme = new Theme();
            for (const key of Object.keys(DEFAULT_LIGHT_THEME)) {
                theme[key] = DEFAULT_LIGHT_THEME[key]();
            }
            console.log(theme);
            await this.configRepo.setTheme(theme);
        } catch (ex) {
            console.log(`Failed to setup light theme! ${ex.message}`);
        }

        // Sets up nord theme
        try {
            const theme = new Theme();
            for (const key of Object.keys(DEFAULT_NORD_THEME)) {
                theme[key] = DEFAULT_NORD_THEME[key]();
            }
            console.log(theme);
            await this.configRepo.setTheme(theme);
        } catch (ex) {
            console.log(`Failed to setup nord theme! ${ex.message}`);
        }
    }

    /**
     * Sets up any internal services that need to be instantiated and configured
     */
    private async setupServices(override = false) {
        if (this.servicesStarted && !override) return;

        try {
            console.log("Initializing queue service...");
            this.queueService = new QueueService(this.chatRepo, (event: string, data: any) =>
                this.emitToUI(event, data)
            );
            this.queueService.start();
        } catch (ex) {
            console.log(`Failed to setup queue service! ${ex.message}`);
        }

        try {
            console.log("Initializing socket connection...");
            this.socketService = new SocketService(this.db, this.chatRepo, this.configRepo);

            // Start the socket service
            await this.socketService.start(true);

            // Wait 1 second, then start the handlers if we are connected
            setTimeout(() => {
                if (this.socketService.server && this.socketService.server.connected) this.startSocketHandlers();
            }, 1000);
        } catch (ex) {
            console.log(`Failed to setup socket service! ${ex.message}`);
        }

        this.servicesStarted = true;
    }

    async fetchContactsFromServerDb(): Promise<void> {
        console.log("Fetching contacts from server's Contacts Database...");
        this.setSyncStatus({ message: "Fetching Contacts...", completed: false, error: false });

        // First, let's get all the handle addresses
        const handles = await this.chatRepo.getHandles();

        // Second, fetch the corresponding contacts from the server
        const results: ResponseFormat = await new Promise((resolve, _) =>
            this.socketService.server.emit("get-contacts-from-db", handles, resolve)
        );

        if (results.status !== 200) throw new Error(results.error.message);

        const data = results.data as (HandleResponse & { firstName: string; lastName: string })[];
        this.setSyncStatus({ message: "Updating Contacts...", completed: false, error: false });
        console.log(`Found ${data.length} contacts from server's Contacts Database. Saving.`);

        for (const result of data) {
            for (let i = 0; i < handles.length; i += 1) {
                if (result.address === handles[i].address) {
                    const updateData: DeepPartial<Handle> = {};
                    if (result.firstName || result.lastName) {
                        updateData.firstName = result.firstName ?? "";
                        updateData.lastName = result.lastName ?? "";
                    }

                    // Update the user only if there a non-null name
                    if (Object.keys(updateData).length > 0) {
                        console.log(`Updating handle ${handles[i].address}`);
                        await this.chatRepo.updateHandle(handles[i], updateData);
                    }
                    break;
                }
            }
        }

        this.setSyncStatus({ message: "Sync Finished", completed: true, error: false });
        console.log("Finished importing contacts from server. Reloading window.");
        this.window.reload();
    }

    async fetchContactsFromServerVcf(): Promise<void> {
        console.log("Fetching contacts from server's Contacts App...");
        this.setSyncStatus({ message: "Fetching Contacts...", completed: false, error: false });

        let now = new Date().getTime();

        // First, fetch the corresponding contacts from the server
        const results: ResponseFormat = await new Promise((resolve, _) =>
            this.socketService.server.emit("get-contacts-from-vcf", null, resolve)
        );

        this.setSyncStatus({ message: "Updating Contacts...", completed: false, error: false });

        if (results.status !== 200) throw new Error(results.error.message);
        console.log("Parsing VCF file from server");

        // Parse the contacts
        const contacts = parseVCards(results.data as string);
        console.log(`Found ${contacts.length} contacts in VCF file. Saving.`);

        // Get handles and compare
        const handles = await this.chatRepo.getHandles();

        // Check if there is a contact for each handle's address
        now = new Date().getTime();
        for (const handle of handles) {
            for (const contact of contacts) {
                if (sanitizeAddress(handle.address) === sanitizeAddress(contact.address)) {
                    const updateData: DeepPartial<Handle> = {};
                    if (contact.firstName || contact.lastName) {
                        updateData.firstName = contact.firstName ?? "";
                        updateData.lastName = contact.lastName ?? "";
                    }

                    if (contact.avatar) updateData.avatar = contact.avatar;

                    // Update the user only if there a non-null name
                    if (Object.keys(updateData).length > 0) await this.chatRepo.updateHandle(handle, updateData);
                }
            }
        }

        console.log("Finished importing contacts from server. Reloading window.");
        this.setSyncStatus({ message: "Sync Finished", completed: true, error: false });
        this.window.reload();
    }

    /**
     * Fetches chats from the server based on the last time we fetched data.
     * This is what the server itself calls when it is refreshed or reloaded.
     * The front-end _should not_ call this function.
     */
    async fetchChats(): Promise<void> {
        if (!this.socketService?.server?.connected) {
            console.warn("Cannot fetch chats when no socket is connected!");
            return;
        }

        const emitData = {
            loading: true,
            syncProgress: 0,
            loginIsValid: true,
            loadingMessage: "Connected to the server! Fetching chats...",
            redirect: null
        };

        const now = new Date();
        const lastFetch = this.configRepo.get("lastFetch") as number;
        const chats: ChatResponse[] = await this.socketService.getChats({});

        emitData.syncProgress = 1;
        emitData.loadingMessage = `Got ${chats.length} chats from the server since last fetch at ${new Date(
            lastFetch
        ).toLocaleString("en-US", { hour: "numeric", minute: "numeric", hour12: true })}`;
        console.log(emitData.loadingMessage);
        this.emitToUI("setup-update", emitData);

        // Iterate over each chat and fetch their messages
        let count = 1;
        for (const chat of chats) {
            // First, emit the chat to the front-end
            this.emitToUI("chat", chat);

            // Second, save the chat to the database
            const chatObj = ChatRepository.createChatFromResponse(chat);
            const savedChat = await this.chatRepo.saveChat(chatObj);

            // Third, save the participants for the chat
            for (const participant of chat.participants ?? []) {
                const handle = ChatRepository.createHandleFromResponse(participant);
                await this.chatRepo.saveHandle(savedChat, handle);
            }

            // Build message request params
            const payload: GetChatMessagesParams = {
                withChats: false,
                limit: 25,
                offset: 0,
                withBlurhash: true,
                where: [
                    {
                        statement: "message.service = 'iMessage'",
                        args: null
                    }
                ]
            };
            if (lastFetch) {
                payload.after = lastFetch;
                // Since we are fetching after a date, we want to get as much as we can
                payload.limit = 1000;
            }

            // Third, let's fetch the messages from the DB
            const messages: MessageResponse[] = await this.socketService.getChatMessages(chat.guid, payload);
            emitData.loadingMessage = `Syncing ${messages.length} messages for ${count} of ${chats.length} chats`;
            console.log(emitData.loadingMessage);

            // Fourth, let's save the messages to the DB
            for (const message of messages) {
                try {
                    const msg = ChatRepository.createMessageFromResponse(message);
                    await this.chatRepo.saveMessage(savedChat, msg);
                } catch (ex) {
                    console.error(`Failed to save message, [${message.guid}]`);
                    console.log(ex);
                }
            }

            emitData.syncProgress = Math.ceil((count / chats.length) * 100);
            if (emitData.syncProgress > 100) emitData.syncProgress = 100;
            this.emitToUI("setup-update", emitData);
            count += 1;
        }

        // Tell the UI we are finished
        const later = new Date();
        emitData.redirect = "/messaging";
        emitData.syncProgress = 100;
        emitData.loadingMessage = `Finished fetching messages from socket server in [${later.getTime() -
            now.getTime()} ms].`;
        console.log(emitData.loadingMessage);
        this.emitToUI("setup-update", emitData);

        // Save the last fetch date
        this.configRepo.set("lastFetch", now);

        try {
            // Fetch contacts
            this.fetchContactsFromServerVcf();
            // this.fetchContactsFromServerDb();
        } catch (ex) {
            this.setSyncStatus({ message: ex.message, error: true, completed: true });
        }
    }

    private startConfigListeners() {
        // eslint-disable-next-line no-return-await
        ipcMain.handle("get-config", async (_, __) => await this.configRepo.config);

        ipcMain.handle("set-config", async (event, args) => {
            if (args.constructor !== Object) return this.configRepo.config;
            for (const key of Object.keys(args)) {
                await this.configRepo.set(key, args[key]);
            }

            this.emitToUI("config-update", this.configRepo.config);
            return this.configRepo.config;
        });

        ipcMain.handle("get-theme", async (_, themeName) => this.configRepo.getThemeByName(themeName));

        ipcMain.handle("set-theme", async (_, newTheme: Theme) => this.configRepo.setTheme(newTheme));

        ipcMain.handle("set-theme-value", async (event, args) => {
            console.log(args);
            await this.configRepo.setThemeValue(args.themeName, args.key, args.newValue);
        });

        ipcMain.handle("delete-theme", async (_, themeName) => {
            await this.configRepo.deleteTheme(themeName);
            console.log(this.configRepo.config);
            this.emitToUI("config-update", this.configRepo.config);
        });

        ipcMain.handle("set-theme-title", async (_, themeChange) => {
            await this.configRepo.setThemeValue(themeChange.oldTitle, "name", themeChange.newTitle);
            await this.configRepo.set("currentTheme", themeChange.newTitle);
            const allThemes = this.configRepo.get("allThemes") as string;
            const newAllThemes = allThemes.replace(themeChange.oldTitle, themeChange.newTitle);
            console.log(newAllThemes);
            await this.configRepo.set("allThemes", newAllThemes);
            this.emitToUI("config-update", this.configRepo.config);
        });

        // eslint-disable-next-line no-return-await
        ipcMain.handle(
            "get-socket-status",
            (_, args) => this.socketService.server && this.socketService.server.connected
        );

        ipcMain.handle("get-sync-status", (_, __) => this.syncStatus);

        ipcMain.handle("send-to-ui", (_, args) => this.window.webContents.send(args.event, args.contents));
    }

    private startActionListeners() {
        ipcMain.handle("start-socket-setup", async (_, args) => {
            const errData = {
                loading: true,
                syncProgress: 0,
                loginIsValid: false,
                loadingMessage: "Setup is starting..."
            };

            // Make sure the config DB is setup
            if (!this.configRepo || !this.configRepo.db.isConnected) {
                errData.loadingMessage = "Configuration DB is not yet setup!";
                return this.emitToUI("setup-update", errData);
            }

            // Save the config items
            await this.configRepo.set("serverAddress", args.enteredServerAddress);
            await this.configRepo.set("passphrase", args.enteredPassword);

            try {
                // If we can't even connect, GTFO
                await this.socketService.start(true);
            } catch {
                errData.loadingMessage = "Could not connect to the server!";
                return this.emitToUI("setup-update", errData);
            }

            // Wait 1 second to see if we got disconnected
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Now check if we are disconnected. If creds are wrong, we will get disconnected here
            if (!this.socketService.server.connected) {
                errData.loadingMessage = "Disconnected from socket server! Credentials may be incorrect!";
                return this.emitToUI("setup-update", errData);
            }

            // Start fetching the data
            this.startSocketHandlers();
            this.fetchChats();
            return null; // Consistent return
        });

        // eslint-disable-next-line no-return-await
        ipcMain.handle("get-chats", async (_, __) => await this.chatRepo.getChats());

        // eslint-disable-next-line no-return-await
        ipcMain.handle("get-chat-messages", async (_, args) => {
            const messages = await this.chatRepo.getMessages(args);

            // If there are no messages, let's check the server
            if (messages.length === 0) {
                const chats = await this.chatRepo.getChats(args.chatGuid);
                if (chats.length > 0) {
                    const newMessages = await this.socketService.getChatMessages(args.chatGuid, args);

                    // Add the new messages to the list
                    for (const message of newMessages) {
                        const msg = ChatRepository.createMessageFromResponse(message);
                        const newMsg = await this.chatRepo.saveMessage(chats[0], msg);
                        messages.push(newMsg);
                    }
                }
            }

            return messages;
        });

        // eslint-disable-next-line no-return-await
        ipcMain.handle("fetch-attachment", async (_, attachment: Attachment) => {
            const chunkSize = (this.configRepo.get("chunkSize") as number) * 1000;
            let start = 0;

            let output = new Uint8Array();
            const event = `attachment-${attachment.guid}-progress`;
            const emitData = {
                attachment,
                progress: 1
            };

            // Show a tiny bit of progress
            this.emitToUI(event, emitData);

            let currentChunk = new Uint8Array();
            do {
                // Get the attachment chunk
                const response = await this.socketService.getAttachmentChunk(attachment.guid, {
                    start: start * chunkSize,
                    chunkSize
                });

                // Convert the data to a typed array, then merge
                currentChunk = base64.base64ToBytes(response);
                output = mergeUint8Arrays(output, currentChunk);

                // Calculate percentage complete
                emitData.progress = Math.ceil((((start - 1) * chunkSize) / attachment.totalBytes) * 100);

                // If the attachment progress is 100, set it to 99
                // We only want to set it to 99 once it's been saved
                if (emitData.progress >= 100) emitData.progress = 99;
                this.emitToUI(event, emitData);

                // Increment starting chunk index
                start += 1;
            } while (currentChunk.byteLength === chunkSize);

            // Save the attachment to disk
            FileSystem.saveAttachment(attachment, output);

            try {
                // Convert the attachment to a supported format
                await convertToSupportedType(attachment);
            } catch (ex) {
                console.error(`Failed to convert attachment ${attachment.guid}`);
                console.error(ex.message);
            }

            // Finally, tell the UI we are done
            emitData.progress = 100;
            this.emitToUI(event, emitData);
        });

        ipcMain.handle("get-reactions", async (_, message) => this.chatRepo.getMessageReactions(message));
        ipcMain.handle("create-message", async (_, payload) => ChatRepository.createMessage(payload));
        ipcMain.handle("save-message", async (_, payload) => this.chatRepo.saveMessage(payload.chat, payload.message));
        ipcMain.handle("send-message", async (_, payload) => {
            const { chat, message } = payload;
            this.socketService.server.emit("send-message", {
                tempGuid: message.guid,
                guid: chat.guid,
                message: message.text
            });
        });

        // Handle Opening Attachment
        ipcMain.handle("open-attachment", async (_, attachmentPath) => {
            shell.openPath(attachmentPath);
        });

        // Handle Opening Link
        ipcMain.handle("open-link", async (_, link) => {
            require("electron").shell.openExternal(link);
        });

        // Handle Emoji Picker
        ipcMain.handle("open-emoji-picker", async _ => {
            if (app.isEmojiPanelSupported) {
                app.showEmojiPanel();
            } else {
                console.log("Doesnt support emojis");
            }
        });

        // Handle setting last viewed date for a chat
        ipcMain.handle("set-chat-last-viewed", async (_, payload) => {
            const updateData = { lastViewed: payload.lastViewed.getTime() };
            await this.chatRepo.updateChat(payload.chat, updateData);
        });

        // Get VCF from server
        ipcMain.handle("send-tapback", async (_, payload) => {
            this.socketService.server.emit("send-reaction", {
                chatGuid: payload.chat.guid,
                message: payload.message,
                actionMessage: payload.actionMessage,
                tapback: payload.tapback
            });
        });

        ipcMain.handle("get-storage-info", async (_, payload) => FileSystem.getAppSizeData());
    }

    private startSocketHandlers() {
        if (!this.socketService.server || !this.socketService.server.connected) return;

        const handleNewMessage = async (event: string, message: MessageResponse) => {
            // First, add the message to the queue
            this.queueService.add(event, message);

            // Next, we want to create a notification for the new message
            // If the window is focused, don't show a notification
            if (this.window && this.window.isFocused()) return;

            // Save the associated chat so we can get the participants to build the title
            const chatData = message.chats[0];
            const chat = ChatRepository.createChatFromResponse(chatData);
            const savedChat = await this.chatRepo.saveChat(chat);
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
            if (this.configRepo.get("globalNotificationsDisabled")) return;

            // Build the notification parameters
            if (message.error) {
                notificationData.subtitle = "Error";
                notificationData.message = "Message failed to send";
            } else {
                notificationData.subtitle = "New Message";
                notificationData.reply = true;
                notificationData.timeout = 30000;
                notificationData.message = text;
                notificationData.sound = !this.configRepo.get("globalNotificationsMuted");
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
                await this.chatRepo.saveMessage(chat, newMessage);

                // Send the message
                this.socketService.server.emit("send-message", {
                    tempGuid: newMessage.guid,
                    guid: chat.guid,
                    message: newMessage.text
                });
            });
        };

        this.socketService.server.on("new-message", (message: MessageResponse) =>
            handleNewMessage("save-message", message)
        );
        this.socketService.server.on("updated-message", (message: MessageResponse) =>
            this.queueService.add("save-message", message)
        );
        this.socketService.server.on("group-name-change", (message: MessageResponse) =>
            this.queueService.add("save-message", message)
        );
        this.socketService.server.on("participant-removed", (message: MessageResponse) =>
            this.queueService.add("save-message", message)
        );
        this.socketService.server.on("participant-added", (message: MessageResponse) =>
            this.queueService.add("save-message", message)
        );
        this.socketService.server.on("participant-left", (message: MessageResponse) =>
            this.queueService.add("save-message", message)
        );

        this.socketService.server.on("disconnect", () => {
            this.setSyncStatus({ completed: true, error: true, message: "Disconnected!" });
        });

        this.socketService.server.on("connect", () => {
            this.setSyncStatus({ completed: true, error: false, message: "Connected!" });
        });

        this.socketService.server.on("reconnect_attempt", attempt => {
            this.setSyncStatus({ completed: false, error: false, message: `Reconnecting (${attempt})` });
        });
    }

    private setSyncStatus({ completed, message, error }: SyncStatus) {
        const currentStatus = this.syncStatus;
        if (completed !== undefined) currentStatus.completed = completed;
        if (message !== undefined) currentStatus.message = message;
        if (error !== undefined) currentStatus.error = error;

        this.syncStatus = currentStatus;
        this.emitToUI("set-sync-status", this.syncStatus);
    }

    private emitToUI(event: string, data: any) {
        if (this.window) this.window.webContents.send(event, data);
    }
}
