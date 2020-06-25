import * as React from 'react';
import './StorageInfo.css';

type StorageInfoProps = {
    totalAppSize: string;
    totalBaseApp: string;
    totalTexts: string;
    totalAttachments: string;
};

const StorageInfo = ({
    totalAppSize,
    totalBaseApp,
    totalTexts,
    totalAttachments
}: StorageInfoProps) => (
    <div className="StorageInfo">
        <h1 id="storageMainTitle">Total App Size: {totalAppSize} Mb</h1>
        <div id="barWrapper">
            <div id="totalBaseApp" style={{ width: totalBaseApp + '%' }}>
                <p className="storage-percent">{totalBaseApp}%</p>
            </div>
            <div id="totalTexts" style={{ width: totalTexts + '%' }}>
                <p className="storage-percent">{totalTexts}%</p>
            </div>
            <div id="totalAttachments" style={{ width: totalAttachments + '%' }}>
                <p className="storage-percent">{totalAttachments}%</p>
            </div>
        </div>
        <div id="keyWrapper">
            <div className="key-child"></div>
            <p id="key-label-1">= Base App</p>
            <div className="key-child"></div>
            <p id="key-label-2">= Texts</p>
            <div className="key-child"></div>
            <p id="key-label-3">= Attachments</p>
        </div>
    </div>
);

export default StorageInfo;
