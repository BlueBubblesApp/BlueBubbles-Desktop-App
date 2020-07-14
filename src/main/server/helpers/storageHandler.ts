/* eslint-disable func-names */
/* eslint-disable max-len */
/* eslint-disable no-restricted-properties */
/* eslint-disable no-param-reassign */
import { type } from "os";
import * as fs from "fs";
import * as path from "path";

export const getStorageInformation = async () => {
    // eslint-disable-next-line prefer-const
    let storageInfo: StorageData = {
        totalAppSizeMB: 0,
        baseAppSizeMB: 0,
        baseAppSizePercent: "",
        textDataSizeMB: 0,
        textDataSizePercent: "",
        attachmentFolderSizeMB: 0,
        attachmentFolderSizePercent: ""
    };

    const getAllFiles = function(dirPath, arrayOfFiles) {
        const files = fs.readdirSync(dirPath);

        arrayOfFiles = arrayOfFiles || [];

        files.forEach(function(file) {
            if (fs.statSync(`${dirPath}/${file}`).isDirectory()) {
                arrayOfFiles = getAllFiles(`${dirPath}/${file}`, arrayOfFiles);
            } else {
                arrayOfFiles.push(path.join(__dirname, dirPath, file));
            }
        });

        return arrayOfFiles;
    };

    const convertBytes = bytes => {
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

        if (bytes === 0) {
            return "n/a";
        }

        const i = Math.floor(Math.log(bytes) / Math.log(1024));

        if (i === 0) {
            return `${bytes} ${sizes[i]}`;
        }

        return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
    };

    const getTotalSize = directoryPath => {
        const arrayOfFiles = getAllFiles(directoryPath, []);

        let totalSize = 0;

        // eslint-disable-next-line func-names
        arrayOfFiles.forEach(function(filePath) {
            // console.log(filePath);
            try {
                totalSize += fs.statSync(filePath).size;
            } catch (err) {
                console.log(err);
            }
        });

        return convertBytes(totalSize);
    };

    const userHome = process.env.HOME;
    const attachmentsPath = `${userHome}\\Appdata\\Roaming\\Electron\\Attachments`;
    console.log(attachmentsPath);

    const result = getTotalSize(attachmentsPath);
    console.log(result);

    console.log(storageInfo);

    storageInfo.totalAppSizeMB =
        storageInfo.attachmentFolderSizeMB + storageInfo.textDataSizeMB + storageInfo.baseAppSizeMB;

    storageInfo.baseAppSizePercent = (storageInfo.baseAppSizeMB / storageInfo.totalAppSizeMB).toString();
    console.log(storageInfo.baseAppSizeMB / storageInfo.totalAppSizeMB);
    storageInfo.textDataSizePercent = (storageInfo.textDataSizeMB / storageInfo.totalAppSizeMB).toString();
    storageInfo.attachmentFolderSizePercent = (
        storageInfo.attachmentFolderSizeMB / storageInfo.totalAppSizeMB
    ).toString();

    return storageInfo;
};

export type StorageData = {
    totalAppSizeMB: number;
    baseAppSizeMB: number;
    baseAppSizePercent: string;
    textDataSizeMB: number;
    textDataSizePercent: string;
    attachmentFolderSizeMB: number;
    attachmentFolderSizePercent: string;
};
