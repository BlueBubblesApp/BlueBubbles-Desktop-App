import { ipcRenderer } from "electron";
import { EventEmitter } from "events";

let currentConfig: ServerConfig = null;

export type Configuration = {
    [key: string]: any;
};

class ServerConfig extends EventEmitter {
    config: Configuration | null = null;

    fetchRequest: Promise<any> = null;

    constructor() {
        super();

        if (!this.config) {
            this.refresh();
        }
    }

    async refresh() {
        // If there is a current request, return it
        if (this.fetchRequest !== null) {
            return this.fetchRequest;
        }

        // Make the request to get the config
        this.fetchRequest = ipcRenderer.invoke("get-config").then(cfg => {
            this.config = cfg;

            // Tell everyone we are done fetching
            this.fetchRequest = null;
        });

        // Return the unfinished promise
        return this.fetchRequest;
    }

    getAll() {
        return this.config;
    }

    async get(name: string) {
        if (!this.config) await this.refresh();
        if (!this.config) return null;

        if (!Object.keys(this.config).includes(name)) return null;
        return this.config[name];
    }

    async set(name: string, value: any) {
        if (!this.config) await this.refresh();
        if (!this.config) return;

        if (!Object.keys(this.config).includes(name)) throw Error(`Configuration item, "${name}" does not exist!`);

        const prevConfig = { ...this.config };
        this.config[name] = value;

        // Update the full config
        const newCfg = ipcRenderer.invoke("set-config", { name: value });
        this.config = newCfg;

        // Emit a change event
        this.emit("config-change", { prevConfig, nextConfig: this.config });
    }

    async setAll(config) {
        const prevConfig = { ...this.config };
        const nextConfig = await ipcRenderer.invoke("set-config", config);

        // Emit a change event
        this.emit("config-change", { prevConfig, nextConfig });
    }
}

export const Config = (): ServerConfig => {
    if (!currentConfig) {
        currentConfig = new ServerConfig();
    }

    return currentConfig;
};
