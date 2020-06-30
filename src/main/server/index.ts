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

import { Handle } from "./databases/chat/entity/Handle";

export class BackendServer {
    window: BrowserWindow;

    db: Connection;

    chatRepo: ChatRepository;

    configRepo: ConfigRepository;

    socketService: SocketService;

    config: { [key: string]: any };

    fs: FileSystem;

    hasSetup: boolean;

    hasStarted: boolean;

    constructor(window: BrowserWindow) {
        this.window = window;

        // Databases
        this.chatRepo = null;
        this.configRepo = null;

        // Other helpers
        this.config = {};
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
        console.log("Starting BlueBubbles Backend...");
        await this.setup();
        await this.startServices();

        console.log("Starting Configuration IPC Listeners...");
        this.startConfigIpcListeners();
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

        console.log("Initializing configuration database...");
        const cfg = await this.configRepo.db.getRepository(Config).find();
        cfg.forEach(item => {
            this.config[item.name] = item.value;
        });

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
                if (!item) await this.addConfigItem(key, DEFAULT_GENERAL_ITEMS[key]());
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
                this.config.server_address,
                this.config.passphrase
            );
        } catch (ex) {
            console.log(`Failed to setup socket service! ${ex.message}`);
        }

        this.hasSetup = true;
    }

    private async startServices() {
        if (this.hasStarted === false) {
            console.log("Starting socket service...");
            this.socketService.start();

            // this.log("Starting chat listener...");
            // this.startChatListener();
            // this.startIpcListener();
        }

        this.hasStarted = true;
    }

    private async addConfigItem(name: string, value: string | number): Promise<Config> {
        const item = new Config();
        item.name = name;
        item.value = String(value);
        await this.configRepo.db.getRepository(Config).save(item);
        return item;
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
                if (this.config[item] && this.config[item] !== args[item]) {
                    this.config[item] = args[item];
                }
                // Update in class
                if (this.config[item]) {
                    await this.setConfig(item, args[item]);
                }
            }

            this.emitToUI("config-update", this.config);
            return this.config;
        });
    }

    private async setConfig(name: string, value: string): Promise<void> {
        this.db = await this.configRepo.initialize();
        await this.configRepo.db.getRepository(Config).update({ name }, { value });
        this.config[name] = value;
        this.emitToUI("config-update", this.config);
    }

    private emitToUI(event: string, data: any) {
        if (this.window) this.window.webContents.send(event, data);
    }
}
