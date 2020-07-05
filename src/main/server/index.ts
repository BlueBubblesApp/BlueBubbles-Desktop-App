import { ipcMain, BrowserWindow } from "electron";
import { Connection } from "typeorm";

// Config and FileSystem Imports
import { Config } from "@server/databases/config/entity/Config";
import { FileSystem } from "@server/fileSystem";
import { DEFAULT_CONFIG_ITEMS } from "@server/constants";

// Database Imports
import { ConfigRepository } from "@server/databases/config";
import { ChatRepository } from "@server/databases/chat";

// Service Imports
import { SocketService } from "@server/services";

import { ResponseFormat, ChatResponse, MessageResponse } from "./types";
import { GetChatMessagesParams } from "./services/socket/types";

export class BackendServer {
    window: BrowserWindow;

    db: Connection;

    chatRepo: ChatRepository;

    configRepo: ConfigRepository;

    socketService: SocketService;

    fs: FileSystem;

    setupComplete: boolean;

    servicesStarted: boolean;

    constructor(window: BrowserWindow) {
        this.window = window;

        // Databases
        this.chatRepo = null;
        this.configRepo = null;

        // Other helpers
        this.fs = null;

        // Services
        this.socketService = null;

        this.setupComplete = false;
        this.servicesStarted = false;
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
            this.fs = new FileSystem();
            this.fs.setup();
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
    }

    /**
     * Sets up any internal services that need to be instantiated and configured
     */
    private async setupServices(override = false) {
        if (this.servicesStarted && !override) return;

        try {
            console.log("Initializing up socket connection...");
            this.socketService = new SocketService(this.db, this.chatRepo, this.configRepo, this.fs);

            // Start the socket service
            await this.socketService.start(true);
        } catch (ex) {
            console.log(`Failed to setup socket service! ${ex.message}`);
        }

        this.servicesStarted = true;
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
            const payload: GetChatMessagesParams = { withChats: false, limit: 25, offset: 0, withBlurhash: true };
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
                const msg = ChatRepository.createMessageFromResponse(message);
                await this.chatRepo.saveMessage(savedChat, msg);
            }

            // Lastly, save the attachments (if any)
            // TODO

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

        // eslint-disable-next-line no-return-await
        ipcMain.handle(
            "get-socket-status",
            (_, args) => this.socketService.server && this.socketService.server.connected
        );

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
                const newMessages = await this.socketService.getChatMessages(args.chatGuid, args);

                // Add the new messages to the list
                for (const message of newMessages) {
                    const msg = ChatRepository.createMessageFromResponse(message);
                    const newMsg = await this.chatRepo.saveMessage(chats[0], msg);
                    messages.push(newMsg);
                }
            }

            return messages;
        });
    }

    private emitToUI(event: string, data: any) {
        if (this.window) this.window.webContents.send(event, data);
    }
}
