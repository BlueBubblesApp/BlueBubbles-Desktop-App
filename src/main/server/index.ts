import { ipcMain, BrowserWindow } from "electron";
import { createConnection, Connection } from "typeorm";

//Config and FileSystem Imports
import { Config } from "@server/entities/settings/Config";
import { FileSystem } from "@server/fileSystem";
import { DEFAULT_GENERAL_ITEMS } from "@server/constants";

//Database Imports
import { MessagingRepository } from '@server/db/messaging';
import { SettingsRepository } from '@server/db/settings';

//Service Imports
import { SocketService } from '@server/services';

// import {Attachment} from "./entities/messaging/Attachment";
// import {Chat} from "./entities/messaging/Chat";
import {Handle} from "./entities/messaging/Handle";
// import {Message} from "./entities/messaging/Message";

export class BackendServer {
    window: BrowserWindow;
    db: Connection;
    messagingRepo: MessagingRepository;
    settingsRepo: SettingsRepository;
    ngrokServer: string;
    socketService: SocketService;
    config: { [key: string]: any };
    fs: FileSystem;
    hasSetup: boolean;
    hasStarted: boolean;

    constructor(window: BrowserWindow) {
        this.window = window;

        // Databases
        this.db = null;
        this.messagingRepo = null;
        this.settingsRepo = null;

        // Other helpers
        this.ngrokServer = null;
        this.config = {};
        this.fs = null;

        // Services
        this.socketService = null;

        this.hasSetup = false;
        this.hasStarted = false;
    }

    async start(this: any): Promise<void> {
        console.log("Starting BlueBubbles Backend...");
        await this.setup();  
        await this.startServices();
    
        console.log("Starting Configuration IPC Listeners...");
        this.startConfigIpcListeners();
    
        if (this.hasStarted === false) {
            console.log("Connecting to Ngrok...");
            await this.connectToNgrok();
        }
    }
    
    //Initial App Setup
    private async setup(): Promise<void> {
        console.log("Performing Setup...");
        // this.db = await this.settingsRepo.initialize();
        await this.initializeDatabase();
        await this.setupDefaults();
        // this.db = await this.messagingRepo.initialize();

        try {
            console.log("Initializing filesystem...");
            this.fs = new FileSystem();
            this.fs.setup();
        } catch (ex) {
            console.log("Failed to setup filesystem! " + ex.message);
        }

        console.log("Initializing configuration database...");
        const cfg = await this.db.getRepository(Config).find();
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

    //Initialize Database
    private async initializeDatabase(): Promise<void> {
        try {
            this.db = await createConnection({
                name: "settings",
                type: "sqlite",
                database: `@server/db/settings/settings.db`,
                entities: [Config],
                synchronize: false,
                logging: false
            });
        } catch (ex) {
            console.log("Failed to connect to configuration database!" + ex.message);
        }
    }

    //Setup Default Values
    private async setupDefaults(): Promise<void> {
        try {
            const repo = this.db.getRepository(Config);
            for (const key of Object.keys(DEFAULT_GENERAL_ITEMS)) {
                const item = await repo.findOne({ name: key });
                if (!item) await this.addConfigItem(key, DEFAULT_GENERAL_ITEMS[key]());
            }
        } catch (ex) {
            console.log("Failed to setup default configurations!" + ex.message);
        }
    }

    private async setupServices() {
        if (this.hasSetup) return;

        try {
            console.log("Connecting to messaging database...");
            this.messagingRepo = new MessagingRepository();
            await this.messagingRepo.initialize();
        } catch (ex) {
            console.log("Failed to connect to messaging database! " + ex.message);
        }

        try {
            console.log("Connecting to settings database...");
            this.settingsRepo = new SettingsRepository();
            await this.settingsRepo.initialize();
        } catch (ex) {
            console.log("Failed to connect to settings database! " + ex.message);
        }

        try {
            console.log("Initializing up sockets...");
            this.socketService = new SocketService(
                this.db,
                this.messagingRepo,
                this.settingsRepo,
                this.fs,
                this.config.ngrokServer
            );
        } catch (ex) {
            console.log("Failed to setup socket service! " + ex.message);
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
        await this.db.getRepository(Config).save(item);
        return item;
    }

    private startIpcListener() {
        ipcMain.handle("getChatPrevs", async (event, args) => {
            if (!this.messagingRepo.db) return 0;
            const count = await this.messagingRepo.getChatPrevs();
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
                if (this.config[item]){
                     await this.setConfig(item, args[item]);
                }
            }

            this.emitToUI("config-update", this.config);
            return this.config;
        });
    }

    private async setConfig(name: string, value: string): Promise<void> {
        this.db = await this.settingsRepo.initialize();
        await this.db.getRepository(Config).update({ name }, { value });
        this.config[name] = value;
        this.emitToUI("config-update", this.config);
    }

    private emitToUI(event: string, data: any) {
        if (this.window) this.window.webContents.send(event, data);
    }
    







}