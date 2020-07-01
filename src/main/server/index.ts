import { ipcMain, BrowserWindow } from "electron";
import { Connection } from "typeorm";

// Config and FileSystem Imports
import { Config } from "@server/databases/config/entity/Config";
import { FileSystem } from "@server/fileSystem";
import { DEFAULT_GENERAL_ITEMS } from "@server/constants";

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

    hasSetup: boolean;

    hasStarted: boolean;

    constructor(window: BrowserWindow) {
        this.window = window;

        // Databases
        this.chatRepo = null;
        this.configRepo = null;

        // Other helpers
        this.fs = null;

        // Services
        this.socketService = null;

        this.hasSetup = false;
        this.hasStarted = false;
    }

    /**
     * Starts the back-end "server"
     */
    async start(): Promise<void> {
        //ADD AWAIT VERIFY USER ENTERED CONFIG
        
        console.log("Starting BlueBubbles Backend...");
        await this.setup();
        await this.startServices();

        console.log("Starting Configuration IPC Listeners...");
        this.startConfigIpcListeners();

        // Fetch the chats upon start
        console.log("Syncing initial chats...");
        await this.fetchChats();
    }

    /**
     * Sets up the server by initializing a "filesystem" and other
     * tasks such as setting up the databases and internal services
     */
    private async setup(): Promise<void> {
        console.log("Performing Setup...");
        await this.initializeDatabases();
        await this.setupDefaults();

        try {
            console.log("Initializing filesystem...");
            this.fs = new FileSystem();
            this.fs.setup();
        } catch (ex) {
            console.log(`!Failed to setup filesystem! ${ex.message}`);
        }

        try {
            console.log("Launching Services..");
            await this.setupServices();
        } catch (ex) {
            console.log("Failed to launch server services.", "error");
        }
    }

    private async initializeDatabases() {
        try {
            console.log("Connecting to messaging database...");
            this.chatRepo = new ChatRepository();
            await this.chatRepo.initialize();
        } catch (ex) {
            console.log(`Failed to connect to messaging database! ${ex.message}`);
        }

        try {
            console.log("Connecting to settings database...");
            this.configRepo = new ConfigRepository();
            await this.configRepo.initialize();
        } catch (ex) {
            console.log(`Failed to connect to settings database! ${ex.message}`);
        }
    }

    /**
     * Sets up default database values for configuration items
     */
    private async setupDefaults(): Promise<void> {
        try {
            const repo = this.configRepo.db.getRepository(Config);
            for (const key of Object.keys(DEFAULT_GENERAL_ITEMS)) {
                const item = await repo.findOne({ name: key });
                if (!item) await this.configRepo.setConfigItem(key, DEFAULT_GENERAL_ITEMS[key]());
            }
        } catch (ex) {
            console.log(`Failed to setup default configurations! ${ex.message}`);
        }
    }

    /**
     * Sets up any internal services that need to be instantiated and configured
     */
    private async setupServices() {
        if (this.hasSetup) return;

        try {
            console.log("Initializing up sockets...");
            this.socketService = new SocketService(
                this.db,
                this.chatRepo,
                this.configRepo,
                this.fs,
                "http://127.0.0.1:1234", // this.config.server_address,
                "162514cc-d030-4eca-aa4b-119015703645" // this.config.passphrase
            );
        } catch (ex) {
            console.log(`Failed to setup socket service! ${ex.message}`);
        }

        this.hasSetup = true;
    }

    private async startServices() {
        if (this.hasStarted === false) {
            console.log("Starting socket service...");
            await this.socketService.start();

            // this.log("Starting chat listener...");
            // this.startChatListener();
            // this.startIpcListener();
        }

        this.hasStarted = true;
    }

    /**
     * Fetches chats from the server based on the last time we fetched data.
     * This is what the server itself calls when it is refreshed or reloaded.
     * The front-end _should not_ call this function.
     */
    async fetchChats(): Promise<void> {
        const now = new Date();
        const lastFetch = this.configRepo.getConfigItem("lastFetch") as number;
        const chats: ChatResponse[] = await this.socketService.getChats({});
        console.log(`Got ${chats.length} chats from the server. Fetching messages since ${new Date(lastFetch)}`);

        // Iterate over each chat and fetch their messages
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
            const payload: GetChatMessagesParams = { withChats: false };
            if (lastFetch) {
                payload.after = lastFetch;
                // Since we are fetching after a date, we want to get as much as we can
                payload.limit = 1000;
            }

            // Third, let's fetch the messages from the DB
            const messages: MessageResponse[] = await this.socketService.getChatMessages(chat.guid, payload);
            console.log(
                `Got ${messages.length} messages for chat, [${chat.displayName || chat.chatIdentifier}] the server.`
            );

            // Fourth, let's save the messages to the DB
            for (const message of messages) {
                const msg = ChatRepository.createMessageFromResponse(message);
                await this.chatRepo.saveMessage(savedChat, msg);
            }

            // Lastly, save the attachments (if any)
            // TODO
        }

        // Save the last fetch date
        const later = new Date();
        console.log(`Finished fetching messages from socket server in [${later.getTime() - now.getTime()} ms].`);
        this.configRepo.setConfigItem("lastFetch", now);
    }

    private startIpcListener() {
        ipcMain.handle("getChatPrevs", async (event, args) => {
            if (!this.chatRepo.db) return 0;
            // TODO: Fill this out
            const count = 0; // await this.chatRepo.getChatPrevs();
            return count;
        });
    }

    private startConfigIpcListeners() {
        ipcMain.handle("set-config", async (event, args) => {
            for (const item of Object.keys(args)) {
                const hasConfig = this.configRepo.hasConfigItem(item);
                if (hasConfig && this.configRepo.getConfigItem(item) !== args[item]) {
                    await this.configRepo.setConfigItem(item, args[item]);
                }
            }

            this.emitToUI("config-update", this.configRepo.config);
            return this.configRepo.config;
        });
    }

    private emitToUI(event: string, data: any) {
        if (this.window) this.window.webContents.send(event, data);
    }
}
