/* eslint-disable no-shadow */
/* eslint-disable max-len */
import * as fs from "fs";
import * as path from "path";
import { app } from "electron";
import { sync } from "read-chunk";

import { Attachment } from "@server/databases/chat/entity";
import { getDirectorySize } from "@server/helpers/utils";
import { generateUuid } from "@renderer/helpers/utils";
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
        if (!fs.existsSync(FileSystem.fcmDir)) fs.mkdirSync(FileSystem.fcmDir);
        if (!fs.existsSync(`${FileSystem.attachmentsDir}/temp`)) fs.mkdirSync(`${FileSystem.attachmentsDir}/temp`);
    }

    static saveAttachment(attachment: Attachment, data: Uint8Array) {
        const dirPath = `${FileSystem.attachmentsDir}/${attachment.guid}`;
        fs.mkdirSync(dirPath, { recursive: true });
        fs.writeFileSync(`${dirPath}/${attachment.transferName}`, data);
    }

    static async rewriteFilePath(oldPath: string, newPath: string) {
        const ffmpeg = require("fluent-ffmpeg");
        await new Promise((resolve1, reject) => {
            ffmpeg()
                .input(oldPath)
                .output(newPath)
                .on("error", (err, _, stderr) => reject(err ?? stderr))
                .on("end", (stdout, _) => resolve1(stdout))
                .run();
        });

        fs.unlinkSync(oldPath);
    }

    static async saveNewAudioFile(data: Uint8Array) {
        const dirPath = `${FileSystem.attachmentsDir}/temp`;
        fs.mkdirSync(dirPath, { recursive: true });
        const filePath = `${dirPath}/temp-${generateUuid()}.m4a`;
        fs.writeFileSync(filePath, Buffer.from(data));

        const ffmpeg = require("fluent-ffmpeg");

        await new Promise((resolve1, reject) => {
            ffmpeg()
                .input(filePath)
                .output(`${filePath.substr(0, filePath.length - 3)}mp3`)
                .outputFormat("mp3")
                .on("error", (err, _, stderr) => reject(err ?? stderr))
                .on("end", (stdout, _) => resolve1(stdout))
                .run();
        });

        fs.unlinkSync(filePath);

        return `${filePath.substr(0, filePath.length - 3)}mp3`;
    }

    static async saveImageFromClipboard(data: Uint8Array) {
        const dirPath = `${FileSystem.attachmentsDir}/temp`;
        fs.mkdirSync(dirPath, { recursive: true });
        const filePath = `${dirPath}/fromClipboard-${generateUuid()}.jpeg`;
        fs.writeFileSync(filePath, data);

        return filePath;
    }

    static async deleteTempFiles() {
        let tempPath;
        if (process.platform === "darwin") {
            tempPath = `${FileSystem.attachmentsDir}/temp`;
        } else {
            tempPath = `${FileSystem.attachmentsDir}\\temp`;
        }

        fs.readdir(tempPath, async (err, files) => {
            if (err) throw err;

            for (const file of files) {
                fs.unlinkSync(path.join(tempPath, file));
            }
        });
    }

    static saveFCMClient(data: any) {
        fs.writeFileSync(`${FileSystem.fcmDir}/client.json`, JSON.stringify(data));
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

    static readFileChunk(filePath: string, start: number, chunkSize = 1024): Uint8Array {
        // Get the file size
        const stats = fs.statSync(filePath);
        let fStart = start;

        // Make sure the start are not bigger than the size
        if (fStart > stats.size) fStart = stats.size;
        return Uint8Array.from(sync(filePath, fStart, chunkSize));
    }
}
