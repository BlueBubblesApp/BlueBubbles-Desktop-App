import * as fs from "fs";
import * as ffmpeg from "fluent-ffmpeg";
import * as ffmpegPath from "ffmpeg-static";
import * as vCard from "vcf";
import * as path from "path";
import { Attachment } from "@server/databases/chat/entity";
import { FileSystem } from "@server/fileSystem";

import { supportedVideoTypes, supportedAudioTypes } from "@renderer/helpers/constants";

// Set the ffmpeg path for dev & production
ffmpeg.setFfmpegPath(ffmpegPath.replace("app.asar", "app.asar.unpacked"));

export const mergeUint8Arrays = (first: Uint8Array, second: Uint8Array) => {
    const temp = new Uint8Array(first.byteLength + second.byteLength);
    temp.set(first, 0);
    temp.set(second, first.byteLength);
    return temp;
};

type Contact = { firstName: string; lastName: string; address: string; avatar: string };
export const parseVCards = (vcf: string): Contact[] => {
    const parsed: any[] = vCard.parse(vcf);

    const contacts: Contact[] = [];
    for (const contact of parsed) {
        const nameData = contact.get("n").toJSON();
        const lastName = nameData[3][0].replace(/\?\?/, "");
        const firstName = nameData[3][1].replace(/\?\?/, "");
        const photo = contact.get("photo");
        let numbers = contact.get("tel") ?? [];
        let emails = contact.get("email") ?? [];

        // Force it into an array
        if (!Array.isArray(numbers)) numbers = [numbers];
        if (!Array.isArray(emails)) emails = [emails];

        // Parse out photo
        let avatar = null;
        if (photo) {
            const photoData = photo.toJSON();
            if (photoData[2] === "text" && photoData[1].encoding.toLowerCase() === "b") {
                avatar = `data:image/${photoData[1].type};base64,${photoData[3]}`;
            }
        }

        // Create entries for phone numbers
        for (const addressData of numbers) {
            const addressList = addressData.toJSON();
            contacts.push({
                firstName,
                lastName,
                address: addressList[3],
                avatar
            });
        }

        // Create entries for emails
        for (const emailData of emails) {
            const emailList = emailData.toJSON();
            contacts.push({
                firstName,
                lastName,
                address: emailList[3],
                avatar
            });
        }
    }

    return contacts;
};

export const sanitizeAddress = (text: string) => {
    if (text.includes("@")) return text;
    let output = text;
    output = output.replace(/\+1/g, ""); // Replace +1
    output = output.replace(/-/g, ""); // Replace dashes
    output = output.replace(/\(/g, ""); // Replace open parenthesis
    output = output.replace(/(\()|(\))/g, ""); // Replace open/close parenthesis
    output = output.replace(/ /g, ""); // Replace spaces
    return output.trim();
};

export const convertToSupportedType = async (attachment: Attachment) => {
    if (!attachment.mimeType) return null;
    const mimePrefix = attachment.mimeType.split("/")[0];

    // If we already support the mimetype, then return
    if (
        !["audio", "video"].includes(mimePrefix) ||
        supportedVideoTypes.includes(attachment.mimeType) ||
        supportedAudioTypes.includes(attachment.mimeType)
    )
        return null;

    let outputFormat = null;
    if (mimePrefix === "video") outputFormat = "mp4";
    if (mimePrefix === "audio") outputFormat = "mp3";
    if (!outputFormat) throw new Error("Attachment does not need to be converted!");

    // Set the original and new path
    const originalPath = path.join(FileSystem.attachmentsDir, attachment.guid, attachment.transferName);
    const newPath = path.join(
        FileSystem.attachmentsDir,
        attachment.guid,
        attachment.transferName.replace(path.extname(attachment.transferName), `.${outputFormat}`)
    );

    let inputFormat = attachment.mimeType.split("/")[1];
    if (inputFormat === "quicktime") inputFormat = "mov";

    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(originalPath)
            .inputFormat(inputFormat)
            .output(newPath)
            .outputFormat(outputFormat)
            .on("error", (err, _, stderr) => reject(err ?? stderr))
            .on("end", (stdout, _) => resolve(stdout))
            .run();
    });
};

export const getAllFilesInDirectory = (dirPath, arrayOfFiles = null) => {
    const files = fs.readdirSync(dirPath);

    let fileList = arrayOfFiles || [];

    files.forEach(file => {
        const next = path.join(dirPath, file);

        if (fs.statSync(next).isDirectory()) {
            fileList = getAllFilesInDirectory(next, arrayOfFiles);
        } else {
            fileList.push(next);
        }
    });

    return fileList;
};

export const getDirectorySize = directoryPath => {
    const arrayOfFiles = getAllFilesInDirectory(directoryPath, []);

    let totalSize = 0;

    arrayOfFiles.forEach(filePath => {
        // console.log(filePath);
        try {
            totalSize += fs.statSync(filePath).size;
        } catch (err) {
            console.log(err);
        }
    });

    return totalSize;
};

export const getAllAttachmentsInfo = directoryPath => {
    const arrayOfFiles = getAllFilesInDirectory(directoryPath, []);

    console.log(arrayOfFiles);
    return arrayOfFiles;
};
