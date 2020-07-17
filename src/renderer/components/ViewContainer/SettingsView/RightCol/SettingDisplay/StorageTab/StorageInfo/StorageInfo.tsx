import * as React from "react";
import "./StorageInfo.css";
import { bytesToSize } from "@renderer/helpers/utils";

type StorageInfoProps = {
    appSize: number;
    storageSize: number;
    chatDataSize: number;
    attachmentFolderSize: number;
};

const StorageInfo = ({ appSize, storageSize, chatDataSize, attachmentFolderSize }: StorageInfoProps) => {
    const totalSize = appSize + storageSize;
    const appPercentage = Math.ceil((appSize / totalSize) * 100);
    const textPercentage = Math.ceil((chatDataSize / totalSize) * 100);
    const attachmentsPercentage = Math.ceil((attachmentFolderSize / totalSize) * 100);

    return (
        <div className="StorageInfo">
            <h1 id="storageMainTitle">Total App Size: {bytesToSize(totalSize)}</h1>
            <div id="barWrapper">
                <div id="totalBaseApp" style={{ minWidth: "10%", width: `${appPercentage}%` }}>
                    <p className="storage-percent">{appPercentage}%</p>
                </div>
                <div id="totalTexts" style={{ minWidth: "10%", width: `${textPercentage}%` }}>
                    <p className="storage-percent">{textPercentage}%</p>
                </div>
                <div id="totalAttachments" style={{ minWidth: "10%", width: `${attachmentsPercentage}%` }}>
                    <p className="storage-percent">{attachmentsPercentage}%</p>
                </div>
            </div>
            <div id="keyWrapper">
                <div className="key-child" />
                <p id="key-label-1">= Base App</p>
                <div className="key-child" />
                <p id="key-label-2">= Texts</p>
                <div className="key-child" />
                <p id="key-label-3">= Attachments</p>
            </div>
        </div>
    );
};

export default StorageInfo;
