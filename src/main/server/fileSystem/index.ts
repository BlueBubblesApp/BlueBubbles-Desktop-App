import * as fs from "fs";
import { app } from "electron";
import { Attachment } from "@server/databases/chat/entity";

export class FileSystem {
    public attachmentsDir = `${app.getPath("userData")}/Attachments`;

    async setup(): Promise<void> {
        this.setupDirectories();
    }

    // Creates required directories
    setupDirectories(): void {
        if (!fs.existsSync(this.attachmentsDir)) fs.mkdirSync(this.attachmentsDir);
    }

    saveAttachment(attachment: Attachment, data: Uint8Array) {
        const dirPath = `${this.attachmentsDir}/${attachment.guid}`;
        fs.mkdirSync(dirPath, { recursive: true });
        fs.writeFileSync(`${dirPath}/${attachment.transferName}`, data);
    }
}
