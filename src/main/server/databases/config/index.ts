import { app } from "electron";
import { createConnection, Connection, Long } from "typeorm";

import { Config, Theme } from "./entity";

export class ConfigRepository {
    db: Connection = null;

    config: { [key: string]: any };

    themes: Theme[];

    constructor() {
        this.db = null;
        this.config = {};
        this.themes = [];
    }

    async initialize(): Promise<Connection> {
        const isDev = process.env.NODE_ENV !== "production";
        if (this.db) {
            if (!this.db.isConnected) await this.db.connect();
            return this.db;
        }

        let dbPath = `${app.getPath("userData")}/config.db`;
        if (isDev) {
            dbPath = `${app.getPath("userData")}/BlueBubbles-Desktop-App/config.db`;
        }

        this.db = await createConnection({
            name: "config",
            type: "sqlite",
            database: dbPath,
            entities: [Config, Theme],
            synchronize: isDev,
            logging: false
        });

        // Create the tables
        if (!isDev) await this.db.synchronize();

        // Load default config items
        await this.loadConfig();

        // Load default themes
        await this.loadDefaultThemes();

        return this.db;
    }

    private async loadConfig() {
        const repo = this.db.getRepository(Config);
        const items: Config[] = await repo.find();
        for (const i of items) this.config[i.name] = ConfigRepository.convertFromDbValue(i.value);
    }

    private async loadDefaultThemes() {
        const repo = this.db.getRepository(Theme);
        this.themes = await repo.find();
    }

    /**
     * Checks if the config has an item
     *
     * @param name The name of the item to check for
     */
    contains(name: string): boolean {
        return Object.keys(this.config).includes(name);
    }

    /**
     * Retrieves a config item from the cache
     *
     * @param name The name of the config item
     */
    get(name: string): Date | string | boolean | number {
        if (!Object.keys(this.config).includes(name)) return null;
        return ConfigRepository.convertFromDbValue(this.config[name]);
    }

    /**
     * Sets a config item in the database
     *
     * @param name The name of the config item
     * @param value The value for the config item
     */
    async set(name: string, value: Date | string | boolean | number): Promise<void> {
        const saniVal = ConfigRepository.convertToDbValue(value);
        const repo = this.db.getRepository(Config);
        const item = await repo.findOne({ name });

        // Either change or create the new Config object
        if (item) {
            await repo.update(item, { value: saniVal });
        } else {
            const cfg = repo.create({ name, value: saniVal });
            await repo.save(cfg);
        }

        this.config[name] = ConfigRepository.convertFromDbValue(saniVal);
    }

    /**
     * Retrieves a theme in the database by the theme name
     *
     * @param themeName The theme name
     */
    async getThemeByName(themeName: string): Promise<Theme> {
        const repo = this.db.getRepository(Theme);
        const theme = await repo.findOne({ name: themeName });

        return theme;
    }

    /**
     * Sets a single value within a theme
     *
     * @param themeName The theme whose value should be changed
     * @param key The column name to be changed
     * @param newValue The new column value
     */
    async setThemeValue(themeName: string, key: string, newValue: string): Promise<void> {
        const repo = this.db.getRepository(Theme);
        const theme: Theme = await repo.findOne({ name: themeName });

        if (theme) {
            // const newTheme = theme;
            theme[key] = newValue;
            await repo.update(await this.getThemeByName(themeName), theme);
        } else {
            const newTheme = new Theme();
            newTheme.name = themeName;
            newTheme[key] = newValue;
            await repo.save(newTheme);
        }
    }

    /**
     * Sets a theme in the database
     *
     * @param newTheme The theme to set
     */
    async setTheme(newTheme: Theme): Promise<void> {
        const repo = this.db.getRepository(Theme);
        const theme = await repo.findOne({ name: newTheme.name });

        if (theme) {
            await repo.update(theme, newTheme);
        } else {
            await repo.save(newTheme);
        }
    }

    /**
     * Deletes a theme in the database
     *
     * @param oldTheme The theme to delete
     */
    async deleteTheme(oldTheme: Theme): Promise<void> {
        const repo = this.db.getRepository(Theme);
        const theme = await repo.findOne({ name: oldTheme.name });

        if (theme) {
            const allThemes: string = this.get("allThemes") as string;
            const arr = allThemes.split(",");

            // Set the theme to prev theme
            this.setTheme(await this.getThemeByName(arr[arr.indexOf(oldTheme.name) - 1]));
            this.set("currentTheme", arr[arr.indexOf(oldTheme.name) - 1]);
            // Remove old theme from all themes
            const newArr = arr.filter(themeName => themeName !== oldTheme.name);
            let newAllThemes = "";
            for (const aTheme of newArr) {
                if (newArr.indexOf(aTheme) === newArr.length - 1) {
                    newAllThemes += aTheme;
                } else {
                    newAllThemes += `${aTheme},`;
                }
            }
            await this.set("allThemes", newAllThemes);
            // Remove theme from db
            await repo.remove(theme);
        }
    }

    // /**
    //  * Replaces a theme within allThemes
    //  *
    //  * @param oldTheme The theme to be re
    //  */
    // async deleteTheme(oldTheme: Theme): Promise<void> {
    //     const repo = this.db.getRepository(Theme);
    //     const theme = await repo.findOne({ name: oldTheme.name });

    //     if (theme) {
    //         const allThemes: string = this.get("allThemes") as string;
    //         const arr = allThemes.split(",");

    //         // Set the theme to prev theme
    //         this.setTheme(await this.getThemeByName(arr[arr.indexOf(oldTheme.name) - 1]));
    //         this.set("currentTheme", arr[arr.indexOf(oldTheme.name) - 1]);
    //         // Remove old theme from all themes
    //         const newArr = arr.filter(themeName => themeName !== oldTheme.name);
    //         let newAllThemes = "";
    //         for (const aTheme of newArr) {
    //             if (newArr.indexOf(aTheme) === newArr.length - 1) {
    //                 newAllThemes += aTheme;
    //             } else {
    //                 newAllThemes += `${aTheme},`
    //             }
    //         }
    //         await this.set("allThemes", newAllThemes);
    //         // Remove theme from db
    //         await repo.remove(theme);
    //     }
    // }

    /**
     * Converts a generic string value from the database
     * to its' corresponding correct typed value
     *
     * @param input The value straight from the database
     */
    private static convertFromDbValue(input: string): any {
        if (input === "1" || input === "0") return Boolean(Number(input));
        if (/^-{0,1}\d+$/.test(input)) return Number(input);
        return input;
    }

    /**
     * Converts a typed database value input to a string.
     *
     * @param input The typed database value
     */
    private static convertToDbValue(input: any): string {
        if (typeof input === "boolean") return input ? "1" : "0";
        if (input instanceof Date) return String(input.getTime());
        return String(input);
    }
}
