import * as fs from "fs";
import * as path from "path";
import { app } from "electron";

import { Attachment } from "@server/databases/chat/entity";
import { getDirectorySize } from "@server/helpers/utils";
import { StorageData } from "./types";

let subdir = "";
if (process.env.NODE_ENV !== "production") subdir = "BlueBubbles-Desktop-App";

export class FileSystem {
    public static baseDir = path.join(app.getPath("userData"), subdir);

    public static attachmentsDir = path.join(FileSystem.baseDir, "Attachments");

    public static fcmDir = path.join(FileSystem.baseDir, "FCM");

    public static modules = path.join(__dirname.replace("app.asar/dist", "app.asar.unpacked"), "node_modules");

    public static resources = __dirname.replace("app.asar/dist", "resources");

    // Creates required directories
    static setupDirectories(): void {
        if (!fs.existsSync(FileSystem.attachmentsDir)) fs.mkdirSync(FileSystem.attachmentsDir);
    }

    static saveAttachment(attachment: Attachment, data: Uint8Array) {
        const dirPath = `${FileSystem.attachmentsDir}/${attachment.guid}`;
        fs.mkdirSync(dirPath, { recursive: true });
        fs.writeFileSync(`${dirPath}/${attachment.transferName}`, data);
    }

    static getAppSizeData(): StorageData {
        const output: Partial<StorageData> = {};

        // Get all the data
        output.appSize = fs.statSync(process.execPath).size;
        output.storageSize = getDirectorySize(FileSystem.baseDir);
        output.attachmentFolderSize = getDirectorySize(FileSystem.attachmentsDir);
        output.chatDataSize = fs.statSync(path.join(this.baseDir, "chat.db")).size;

        return output as StorageData;
    }
}
