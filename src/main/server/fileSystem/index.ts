import * as fs from "fs";
import * as path from "path";
import { app } from "electron";

export class FileSystem {
    public attachmentsDir = `Attachments`;

    async setup(): Promise<void> {
        this.setupDirectories();
    }

    // Creates required directories
    setupDirectories(): void {
        if (!fs.existsSync(this.attachmentsDir)) fs.mkdirSync(this.attachmentsDir);
    }
}
