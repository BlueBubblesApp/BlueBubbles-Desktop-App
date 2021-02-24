/* eslint-disable import/first */
/* eslint-disable no-global-assign */
/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
import { ipcMain, BrowserWindow, shell, app, dialog, nativeImage, DownloadItem, ipcRenderer } from "electron";
import { Connection, DeepPartial } from "typeorm";
import * as base64 from "byte-base64";
import * as fs from "fs";
import * as path from "path";

// Config and FileSystem Imports
import { FileSystem } from "@server/fileSystem";
import { DEFAULT_CONFIG_ITEMS, DEFAULT_DARK_THEME, DEFAULT_LIGHT_THEME, DEFAULT_NORD_THEME } from "@server/constants";
import { mergeUint8Arrays, parseVCards, sanitizeAddress, convertToSupportedType } from "@server/helpers/utils";

// Database Imports
import { ConfigRepository } from "@server/databases/config";
import { ChatRepository } from "@server/databases/chat";

// Service Imports
import { SocketService, QueueService, FCMService } from "@server/services";

import { generateUuid } from "@renderer/helpers/utils";
import { ChatResponse, MessageResponse, ResponseFormat, HandleResponse, SyncStatus } from "./types";
import { AttachmentChunkParams, GetChatMessagesParams } from "./services/socket/types";
import { Attachment, Chat, Handle, Message } from "./databases/chat/entity";
import { Theme } from "./databases/config/entity";

const { autoUpdater } = require("electron-updater");

autoUpdater.autoDownload = false;

const AutoLaunch = require("auto-launch");

class BackendServer {
    window: BrowserWindow;

    db: Connection;

    chatRepo: ChatRepository;

    configRepo: ConfigRepository;

    socketService: SocketService;

    queueService: QueueService;

    fcmService: FCMService;

    setupComplete: boolean;

    servicesStarted: boolean;

    syncStatus: SyncStatus;

    bbAutoLauncher: any;

    constructor(window: BrowserWindow) {
        this.window = window;

        // Databases
        this.chatRepo = null;
        this.configRepo = null;

        // Services
        this.socketService = null;
        this.queueService = null;
        this.fcmService = null;

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

        // Handle start with OS
        this.bbAutoLauncher = new AutoLaunch({
            name: "BlueBubbles",
            isHidden: true
        });

        if (this.configRepo.get("startWithOS")) {
            this.bbAutoLauncher
                .isEnabled()
                .then((isEnabled: boolean) => {
                    if (isEnabled) return;
                    this.bbAutoLauncher.enable();
                })
                .catch(err => {
                    throw err;
                });
        } else {
            this.bbAutoLauncher
                .isEnabled()
                .then((isEnabled: boolean) => {
                    if (!isEnabled) return;
                    this.bbAutoLauncher.disable();
                })
                .catch(err => {
                    throw err;
                });
        }
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
            this.queueService = new QueueService((event: string, data: any) => this.emitToUI(event, data));
        } catch (ex) {
            console.log(`Failed to setup queue service! ${ex.message}`);
        }

        try {
            console.log("Initializing socket connection...");
            this.socketService = new SocketService(this.db);

            // Start the socket service
            await this.socketService.start(true);
        } catch (ex) {
            console.log(`Failed to setup socket service! ${ex.message}`);
        }

        try {
            console.log("Initializing FCM service...");
            FCMService.start();
        } catch (ex) {
            console.log(`Failed to setup queue service! ${ex.message}`);
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
                if (
                    sanitizeAddress(handle.address, handle.country) === sanitizeAddress(contact.address, handle.country)
                ) {
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
    async syncWithServer(): Promise<void> {
        if (!this.socketService?.server?.connected) {
            console.warn("Cannot fetch chats when no socket is connected!");
            return;
        }

        const now = new Date();
        const lastFetch = this.configRepo.get("lastFetch");
        if (!lastFetch) {
            await this.performFullSync();
        } else {
            await this.performIncrementalSync(lastFetch as number);
        }

        try {
            // Fetch contacts
            if (this.configRepo.get("importContactsFrom") === "serverDB") {
                this.fetchContactsFromServerDb();
            } else if (this.configRepo.get("importContactsFrom") === "serverVCF") {
                this.fetchContactsFromServerVcf();
            } else if (this.configRepo.get("importContactsFrom") === "androidClient") {
                console.log("Fetching contacts from android client");
            } else if (this.configRepo.get("importContactsFrom") === "localVCF") {
                console.log("Fetching contacts from local VCF");
            }
        } catch (ex) {
            this.setSyncStatus({ message: ex.message, error: true, completed: true });
        }

        // Save the last fetch date
        this.configRepo.set("lastFetch", now);
    }

    async performIncrementalSync(lastFetch: number) {
        const emitData = {
            loading: true,
            syncProgress: 0,
            loginIsValid: true,
            loadingMessage: "Connected to the server! Fetching messages...",
            redirect: null
        };
        console.log(emitData.loadingMessage);
        this.emitToUI("setup-update", emitData);

        const args: GetChatMessagesParams = {
            limit: 5000,
            after: lastFetch,
            withChats: true,
            withHandle: true,
            withAttachments: true,
            withBlurhash: false,
            withSMS: true
        };
        const messages: MessageResponse[] = await this.socketService.getMessages(args);
        emitData.loadingMessage = `Syncing ${messages.length} messages`;
        console.log(emitData.loadingMessage);
        this.emitToUI("setup-update", emitData);

        let count = 1;
        for (const message of messages) {
            // Iterate over the chats that are associated with the message
            for (const chat of message.chats ?? []) {
                try {
                    // Save each chat
                    const chatData = ChatRepository.createChatFromResponse(chat);
                    const savedChat = await this.chatRepo.saveChat(chatData);

                    // Create the message and link it to the chat
                    const msg = ChatRepository.createMessageFromResponse(message);
                    await this.chatRepo.saveMessage(savedChat, msg);
                } catch (ex) {
                    console.error(`Failed to save message, [${message.guid}]`);
                    console.log(ex);
                }
            }

            // Emit status updates to the UI
            emitData.loadingMessage = `Synced ${count} of ${messages.length} messages`;
            emitData.syncProgress = Math.ceil((count / messages.length) * 100);
            if (emitData.syncProgress > 100) emitData.syncProgress = 100;
            console.log(emitData.loadingMessage);
            this.emitToUI("setup-update", emitData);
            this.emitToUI("message", message);
            count += 1;
        }

        emitData.loadingMessage = "Finished syncing messages";
        emitData.redirect = "/messaging";
        emitData.syncProgress = 100;
        console.log(emitData.loadingMessage);
        this.emitToUI("setup-update", emitData);
    }

    async performFullSync() {
        const emitData = {
            loading: true,
            syncProgress: 0,
            loginIsValid: true,
            loadingMessage: "Connected to the server! Fetching chats...",
            redirect: null
        };

        const now = new Date();
        const chats: ChatResponse[] = await this.socketService.getChats({ withSMS: true });

        emitData.syncProgress = 1;
        emitData.loadingMessage = `Got ${chats.length} chats from the server`;
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
                chatGuid: chat.guid,
                withChats: false,
                limit: 25,
                offset: 0,
                withBlurhash: false,
                withSMS: true,
                after: 1
            };

            // Third, let's fetch the messages from the DB
            const messages: MessageResponse[] = await this.socketService.getMessages(payload);
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
    }

    private startConfigListeners() {
        // Set maximum listener count
        require("events").EventEmitter.defaultMaxListeners = 15;

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

        ipcMain.handle("import-contacts", (_, location) => {
            if (location === "serverDB") {
                this.fetchContactsFromServerDb();
            } else if (location === "serverVCF") {
                this.fetchContactsFromServerVcf();
            } else if (location === "androidClient") {
                console.log("Fetching contacts from android client");
            } else if (location === "localVCF") {
                console.log("Fetching contacts from local VCF");
            }
        });

        // Temporary get handlers endpoint
        ipcMain.handle("get-handles", (_, __) => {
            return this.chatRepo.getHandles();
        });
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

            return null; // Consistent return
        });

        // eslint-disable-next-line no-return-await
        ipcMain.handle("get-chats", async (_, guid?) => await this.chatRepo.getChats(guid));

        // eslint-disable-next-line no-return-await
        ipcMain.handle("get-messages", async (_, args) => {
            const messages = await this.chatRepo.getMessages(args);

            const regularMessages = messages.filter(item => !item.associatedMessageGuid);

            // If there are no messages, let's check the server
            if (regularMessages.length === 0) {
                const chats = await this.chatRepo.getChats(args.chatGuid);
                if (chats.length > 0) {
                    const newMessages = await this.socketService.getMessages(args);

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
            const chunkSize = (this.configRepo.get("chunkSize") as number) * 100;
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
        ipcMain.handle("create-attachment", async (_, payload) => ChatRepository.createAttachment(payload));
        ipcMain.handle("save-message", async (_, payload) => this.chatRepo.saveMessage(payload.chat, payload.message));
        ipcMain.handle("send-message", async (_, payload) => {
            const { chat, message }: { chat: Chat; message: Message } = payload;
            if (!message.attachments || message.attachments.length === 0) {
                this.socketService.server.emit("send-message", {
                    tempGuid: message.guid,
                    guid: chat.guid,
                    message: message.text
                });
            } else {
                const CHUNK_SIZE = 512 * 1024;

                // Iterate over each attachment and split it up into chunks
                for (const attachment of message.attachments as (Attachment & { filepath: string })[]) {
                    // Check if the file exists before trying to read it
                    if (!fs.existsSync(attachment.filepath)) continue;

                    console.log(`Sending attachment: ${attachment.filepath}`);
                    const stats = fs.statSync(attachment.filepath);

                    const numOfChunks = Math.ceil(stats.size / CHUNK_SIZE);
                    const attachmentParams: Partial<AttachmentChunkParams> = {
                        guid: chat.guid,
                        tempGuid: message.guid,
                        message: message.text,
                        attachmentGuid: message.guid
                    };

                    for (let i = 0; i < numOfChunks; i += 1) {
                        attachmentParams.attachmentChunkStart = i === 0 ? 0 : i * CHUNK_SIZE;
                        attachmentParams.hasMore = i * CHUNK_SIZE + CHUNK_SIZE < stats.size;
                        attachmentParams.attachmentName = path.basename(attachment.filepath);

                        // Get data as a Uint8Array and convert to base64
                        const data = FileSystem.readFileChunk(
                            attachment.filepath,
                            attachmentParams.attachmentChunkStart,
                            CHUNK_SIZE
                        );
                        attachmentParams.attachmentData = base64.bytesToBase64(data);

                        // Send the attachment
                        this.socketService.sendAttachmentChunk(attachmentParams as AttachmentChunkParams);
                    }

                    console.log(`Finished sending attachment: ${attachment.filepath}`);
                }
            }
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
            if (!payload?.chat) return;

            const updateData = { lastViewed: payload.lastViewed.getTime() };
            await this.chatRepo.updateChat(payload.chat, updateData);

            this.socketService.server.emit("toggle-chat-read-status", {
                chatGuid: payload.chat.guid,
                status: false
            });
        });

        // Send a tapback
        ipcMain.handle("send-tapback", async (_, payload) => {
            try {
                this.socketService.server.emit(
                    "send-reaction",
                    {
                        chatGuid: payload.chatGuid,
                        messageGuid: payload.messageGuid,
                        messageText: payload.messageText,
                        actionMessageGuid: payload.actionMessageGuid,
                        actionMessageText: payload.actionMessageText,
                        tapback: payload.tapback
                    },
                    res => {
                        if (res.error) {
                            const tapbackMes = payload.message as Message;
                            // tapbackMes.error = res.status;
                            // this.chatRepo.saveMessage(payload.chat, tapbackMes);
                            this.emitToUI("add-message", tapbackMes);
                        }
                        this.emitToUI("add-message", payload.message);
                    }
                );
            } catch (e) {
                console.log(e);
                console.log("FAIIIIIl");
                // const tapbackMes = payload.message as Message;
                // tapbackMes.error = 500;
                // this.chatRepo.saveMessage(payload.chat, tapbackMes);
                // this.emitToUI("add-message", tapbackMes);
            }
        });

        ipcMain.handle("get-storage-info", async (_, payload) => FileSystem.getAppSizeData());

        ipcMain.handle("get-all-attachments-info", async (_, payload) => FileSystem.getAllAttachmentsData());

        ipcMain.handle("start-new-chat", async (_, payload) => {
            // if we have a matching address, that means we are jumping from details page to chat matching address
            if (payload.matchingAddress) {
                // Check to see if a chat matching the address already exits and sets to current or makes a new chat
                const chats = await this.chatRepo.getChats();
                const newChats = chats.filter(aChat => {
                    return aChat.participants.length === 1 && aChat.participants[0].address === payload.matchingAddress;
                });

                // If chat doesnt already exist
                if (newChats.length !== 1) {
                    const matchingHandle = await this.chatRepo.getHandles(payload.matchingAddress);
                    this.emitToUI("preload-new-chat", matchingHandle[0]);
                    return;
                }

                // If chat already exists check if the chat has a lastMessage
                const args = {
                    chatGuid: newChats[0].guid,
                    withHandle: false,
                    withAttachments: false,
                    withChats: false,
                    offset: 0,
                    limit: 1,
                    after: 1,
                    where: [
                        {
                            statement: "message.text IS NOT NULL",
                            args: null
                        },
                        {
                            statement: "message.associatedMessageType IS NULL",
                            args: null
                        }
                    ]
                };
                const messages = await this.chatRepo.getMessages(args);

                // If there is no last message, preload new chat
                if (messages.length === 0) {
                    const matchingHandle = await this.chatRepo.getHandles(payload.matchingAddress);
                    this.emitToUI("preload-new-chat", matchingHandle[0]);
                    return;
                }

                // Otherwise set chat to already existing chat
                this.emitToUI("set-current-new-chat", newChats[0]);
                return;
            }

            // If we arent jumping from a chat, but are creating a new chat
            if (payload.newChatAddresses && (payload.message || payload.attachmentPaths)) {
                // Check to see if a chat matching the address already exits and sets to current or makes a new chat
                const chats = await this.chatRepo.getChats();

                console.log(payload);

                const checkIfAllChatAddressesMatch = (aChat: Chat) => {
                    let areAllEqual = true;
                    aChat.participants.forEach((handle: Handle, i) => {
                        console.log(handle.address);
                        console.log(payload.newChatAddresses[i]);
                        if (!payload.newChatAddresses.includes(handle.address)) {
                            areAllEqual = false;
                        }
                    });

                    return areAllEqual;
                };

                const newChats = chats.filter(aChat => {
                    return (
                        aChat.participants.length === payload.newChatAddresses.length &&
                        checkIfAllChatAddressesMatch(aChat)
                    );
                });

                console.log(newChats.length);
                // If chat already exists
                if (newChats.length === 1) {
                    this.emitToUI("set-current-new-chat", newChats[0]);
                    if (payload.message && payload.message !== "") {
                        console.log(`Sending message: ${payload.message}`);
                        this.socketService.server.emit("send-message", {
                            tempGuid: `temp-${generateUuid()}`,
                            guid: newChats[0].guid,
                            message: payload.message
                        });
                    }

                    if (payload.attachmentPaths as Array<string>) {
                        console.log(payload.attachmentPaths);
                        payload.attachmentPaths.forEach(async (aPath: string) => {
                            const attachPayload = {
                                guid: `temp-${generateUuid()}`,
                                attachmentPath: aPath
                            };

                            const attachment = ChatRepository.createAttachment(attachPayload) as Attachment & {
                                filepath: string;
                            };
                            attachment.filepath = aPath;
                            console.log(attachment);

                            const attachMesPayload = {
                                chat: newChats[0],
                                guid: attachment.guid,
                                text: "",
                                dateCreated: new Date()
                            };
                            const message: Message = ChatRepository.createMessage(attachMesPayload);

                            message.attachments.push(attachment);

                            console.log(message);

                            // this.chatRepo.saveAttachment(newChats[0], message, attachment);
                            this.chatRepo.saveMessage(newChats[0], message);
                            this.emitToUI("add-message", message);
                            console.log("Saved the attachment");

                            const CHUNK_SIZE = 512 * 1024;

                            for (const aAttachment of message.attachments as (Attachment & { filepath: string })[]) {
                                // Check if the file exists before trying to read it
                                if (!fs.existsSync(aAttachment.filepath)) continue;

                                console.log(`Sending attachment: ${aAttachment.filepath}`);
                                const stats = fs.statSync(aAttachment.filepath);

                                const numOfChunks = Math.ceil(stats.size / CHUNK_SIZE);
                                const attachmentParams: Partial<AttachmentChunkParams> = {
                                    guid: newChats[0].guid,
                                    tempGuid: message.guid,
                                    message: message.text,
                                    attachmentGuid: message.guid
                                };

                                for (let i = 0; i < numOfChunks; i += 1) {
                                    attachmentParams.attachmentChunkStart = i === 0 ? 0 : i + CHUNK_SIZE;
                                    attachmentParams.hasMore = i + CHUNK_SIZE < stats.size;
                                    attachmentParams.attachmentName = path.basename(aAttachment.filepath);

                                    // Get data as a Uint8Array and convert to base64
                                    const data = FileSystem.readFileChunk(
                                        aAttachment.filepath,
                                        attachmentParams.attachmentChunkStart,
                                        CHUNK_SIZE
                                    );
                                    attachmentParams.attachmentData = base64.bytesToBase64(data);

                                    // Send the attachment
                                    this.socketService.sendAttachmentChunk(attachmentParams as AttachmentChunkParams);
                                }

                                console.log(`Finished sending attachment: ${aAttachment.filepath}`);
                            }
                        });
                    }
                } else {
                    const params = { participants: payload.newChatAddresses };
                    this.socketService.server.emit("start-chat", params, async createdChat => {
                        const newChat = await this.chatRepo.saveChat(createdChat.data);
                        this.emitToUI("set-current-new-chat", newChat);

                        console.log(payload);
                        if (payload.attachmentPath) {
                            console.log(payload.attachmentPath);
                            payload.attachmentPaths.forEach(async (aPath: string) => {
                                const attachPayload = {
                                    guid: `temp-${generateUuid()}`,
                                    attachmentPath: aPath
                                };

                                let attachment = ChatRepository.createAttachment(attachPayload) as Attachment & {
                                    filepath: string;
                                };
                                attachment.filepath = aPath;
                                console.log(attachment);

                                const attachMesPayload = {
                                    chat: newChat,
                                    guid: attachment.guid,
                                    text: "",
                                    dateCreated: new Date()
                                };
                                const message: Message = ChatRepository.createMessage(attachMesPayload);
                                attachment = (await this.chatRepo.saveAttachment(
                                    newChats[0],
                                    message,
                                    attachment
                                )) as Attachment & { filepath: string };
                                message.attachments.push(attachment);

                                console.log(message);

                                this.chatRepo.saveMessage(newChat, message);
                                this.emitToUI("add-message", message);
                                console.log("Saved the attachment");

                                const CHUNK_SIZE = 512 * 1024;

                                for (const aAttachment of message.attachments as (Attachment & {
                                    filepath: string;
                                })[]) {
                                    // Check if the file exists before trying to read it
                                    if (!fs.existsSync(aAttachment.filepath)) continue;

                                    console.log(`Sending attachment: ${aAttachment.filepath}`);
                                    const stats = fs.statSync(aAttachment.filepath);

                                    const numOfChunks = Math.ceil(stats.size / CHUNK_SIZE);
                                    const attachmentParams: Partial<AttachmentChunkParams> = {
                                        guid: newChat.guid,
                                        tempGuid: message.guid,
                                        message: message.text,
                                        attachmentGuid: message.guid
                                    };

                                    for (let i = 0; i < numOfChunks; i += 1) {
                                        attachmentParams.attachmentChunkStart = i === 0 ? 0 : i + CHUNK_SIZE;
                                        attachmentParams.hasMore = i + CHUNK_SIZE < stats.size;
                                        attachmentParams.attachmentName = path.basename(aAttachment.filepath);

                                        // Get data as a Uint8Array and convert to base64
                                        const data = FileSystem.readFileChunk(
                                            aAttachment.filepath,
                                            attachmentParams.attachmentChunkStart,
                                            CHUNK_SIZE
                                        );
                                        attachmentParams.attachmentData = base64.bytesToBase64(data);

                                        // Send the attachment
                                        this.socketService.sendAttachmentChunk(
                                            attachmentParams as AttachmentChunkParams
                                        );
                                    }

                                    console.log(`Finished sending attachment: ${aAttachment.filepath}`);
                                }
                            });
                        }

                        if (payload.message) {
                            this.socketService.server.emit("send-message", {
                                tempGuid: `temp-${generateUuid()}`,
                                guid: newChat.guid,
                                message: payload.message
                            });
                        }
                    });
                }
            }
        });

        ipcMain.handle("save-blob", async (_, payload) => {
            console.log("SAVING BLOB");
            console.log(payload);
            return FileSystem.saveNewAudioFile(payload);
        });

        ipcMain.handle("read-qr-data-from-local-image", async (_, filePath) => {
            const jsQR = require("jsqr");
            const image = nativeImage.createFromPath(filePath);
            const code = jsQR(image.toBitmap(), image.getSize().width, image.getSize().height);

            if (code) {
                const data = code.chunks[0].text
                    .replace(/['"]+/g, "")
                    .substr(1, code.chunks[0].text.replace(/['"]+/g, "").length - 2)
                    .split(",");
                console.log(data);

                this.configRepo.set("serverAddress", data[1]);
                this.configRepo.set("passphrase", data[0]);
                const dataReturn = { serverAddress: data[1], passphrase: data[0] };
                return dataReturn;
            }
            return "No QR Code Found";
        });

        ipcMain.handle("read-qr-data-from-clipboard", async _ => {
            const { clipboard } = require("electron");
            const jsQR = require("jsqr");
            const image = clipboard.readImage();
            const code = jsQR(image.toBitmap(), image.getSize().width, image.getSize().height);

            if (code) {
                const data = code.chunks[0].text
                    .replace(/['"]+/g, "")
                    .substr(1, code.chunks[0].text.replace(/['"]+/g, "").length - 2)
                    .split(",");
                console.log(data);

                this.configRepo.set("serverAddress", data[1]);
                this.configRepo.set("passphrase", data[0]);
                const dataReturn = { serverAddress: data[1], passphrase: data[0] };
                return dataReturn;
            }
            return "No QR Code Found";
        });

        ipcMain.handle("read-clipboard", async _ => {
            const { clipboard } = require("electron");
            const image = clipboard.readImage();
            const text = clipboard.readText();

            let filePath = null;
            let clipText = null;

            if (!image.isEmpty()) {
                const bufImage = new Uint8Array(image.toJPEG(100));
                filePath = await FileSystem.saveImageFromClipboard(bufImage);
            }
            if (text.length > 0) {
                clipText = text;
            }

            const myClipboard = { filePath, clipText };
            console.log(myClipboard);
            return myClipboard;
        });

        ipcMain.handle("copy-image-to-clipboard", async (_, filePath) => {
            const { clipboard } = require("electron");

            const image = nativeImage.createFromPath(filePath);
            clipboard.writeImage(image);
        });

        ipcMain.handle("show-save-file", async (_, oldPath) => {
            const options = {
                title: "Save Attachment",

                defaultPath: oldPath.replace(/^.*[\\/]/, ""),

                filters: [
                    { name: "Images", extensions: ["jpg", "jpeg", "png", "gif"] },
                    { name: "Videos", extensions: ["mkv", "avi", "mp4"] },
                    { name: "Audio", extensions: ["mp3", "m4a", "caf", "wav"] },
                    { name: "All Files", extensions: ["*"] }
                ]
            };

            return dialog.showSaveDialog(this.window, options);
        });

        ipcMain.handle("show-file-in-folder", async (_, aPath) => {
            shell.showItemInFolder(aPath.replace(/\//g, "\\"));
        });

        ipcMain.handle("set-start-with-os", async (_, startWithOS: boolean) => {
            if (startWithOS) {
                this.bbAutoLauncher
                    .isEnabled()
                    .then((isEnabled: boolean) => {
                        if (isEnabled) return;
                        this.bbAutoLauncher.enable();
                    })
                    .catch(err => {
                        throw err;
                    });
            } else {
                this.bbAutoLauncher
                    .isEnabled()
                    .then((isEnabled: boolean) => {
                        if (!isEnabled) return;
                        this.bbAutoLauncher.disable();
                    })
                    .catch(err => {
                        throw err;
                    });
            }
        });

        ipcMain.handle("drop-link-event", async (_, url) => {
            const { download } = require("electron-dl");
            const dlProgress = dl => {
                this.emitToUI("drop-download-progress", (dl.percent * 100) as number);
            };

            const dlStart = (dl: DownloadItem) => {
                console.log("start");
                if (["text/html"].includes(dl.getMimeType())) {
                    dl.cancel();
                    this.emitToUI("chat-drop-event", { text: url });
                    return;
                }
                this.emitToUI("set-drop-download", {
                    fileName: dl.getFilename(),
                    fileSize: `${(dl.getTotalBytes() / (1024 * 1024)).toFixed(2)} MB`
                });

                ipcMain.handle("cancel-download", () => {
                    dl.cancel();
                    this.emitToUI("set-drop-download", null);
                    ipcMain.removeHandler("cancel-download");
                });
            };

            const options = {
                directory: path.join(FileSystem.attachmentsDir, "temp"),
                onProgress: dl => dlProgress(dl),
                onStarted: x => dlStart(x)
            };

            const file: DownloadItem = await download(this.window, url, options);
            this.emitToUI("chat-drop-event", { attachment: file.getSavePath() });
            ipcMain.removeHandler("cancel-download");
        });

        ipcMain.handle("download-gif-from-giphy", async (_, url) => {
            const { download } = require("electron-dl");

            const dlProgress = dl => {
                console.log(dl);
            };

            const dlStart = (dl: DownloadItem) => {
                console.log("start");
            };

            const options = {
                directory: path.join(FileSystem.attachmentsDir, "temp"),
                onProgress: dl => dlProgress(dl),
                onStarted: x => dlStart(x)
            };

            const file: DownloadItem = await download(this.window, url, options);
            this.emitToUI("chat-drop-event", { attachment: file.getSavePath() });
        });

        ipcMain.handle("change-display-name", async (_, params) => {
            await this.socketService.renameGroup({ identifier: params.chat.guid, newName: params.newName });
            await this.chatRepo.updateChat(params.chat, { displayName: params.newName });
            const newChats = await this.chatRepo.getChats(params.chat.guid);
            console.log(newChats[0].displayName);

            this.emitToUI("display-name-update", { chat: newChats[0], newName: params.newName });
        });

        ipcMain.handle("get-server-metadata", async (_, __) => {
            return this.socketService.getServerMetadata();
        });

        ipcMain.handle("delete-selected-files", async (_, selectedFiles) => {
            for (let i = 0; i < selectedFiles.length; i += 1) {
                await FileSystem.deleteFile(selectedFiles[i].filePath);
            }
        });

        ipcMain.handle("reset-user-data", async () => {
            await this.chatRepo.db.close();
            await this.configRepo.db.close();
            await FileSystem.deleteUserData();

            app.quit();
            app.exit(0);
        });

        if (process.platform !== "linux") {
            autoUpdater.on("checking-for-update", info => {
                this.emitToUI("ckecking-for-update", info);
            });

            autoUpdater.on("error", err => {
                this.emitToUI("update-err", err);
            });

            autoUpdater.on("update-available", info => {
                this.emitToUI("update-available", info);
            });

            autoUpdater.on("update-not-available", info => {
                this.emitToUI("update-not-available", info);
            });

            autoUpdater.on("update-downloaded", info => {
                this.emitToUI("update-downloaded", info);
            });

            autoUpdater.on("download-progress", progressObj => {
                this.emitToUI("update-download-progress", progressObj);
            });

            ipcMain.handle("check-for-updates", async () => {
                return autoUpdater.checkForUpdates();
            });

            ipcMain.handle("download-update", async cancellationToken => {
                return autoUpdater.downloadUpdate();
            });

            ipcMain.handle("quit-and-install", async () => {
                autoUpdater.quitAndInstall(false, true);
            });
        }

        ipcMain.handle("send-typing-indicator", (_, params) => {
            const { isTyping, guid } = params;
            if (guid !== null && isTyping !== null) {
                console.log(guid);
                console.log(isTyping);
                this.socketService.sendTypingIndicator(isTyping, guid);
            }
        });
    }

    setSyncStatus({ completed, message, error }: SyncStatus) {
        const currentStatus = this.syncStatus;
        if (completed !== undefined) currentStatus.completed = completed;
        if (message !== undefined) currentStatus.message = message;
        if (error !== undefined) currentStatus.error = error;

        this.syncStatus = currentStatus;
        this.emitToUI("set-sync-status", this.syncStatus);
    }

    emitToUI(event: string, data: any) {
        if (this.window) this.window.webContents.send(event, data);
    }
}

/**
 * Create a singleton for the server so that it can be referenced everywhere.
 * Plus, we only want one instance of it running at all times.
 */
let server: BackendServer = null;
export const Server = (win: BrowserWindow = null) => {
    // If we already have a server, update the window (if not null) and return
    // the same instance
    if (server) {
        if (win) server.window = win;
        return server;
    }

    server = new BackendServer(win);
    return server;
};
