import * as React from "react";
import { ipcRenderer, remote } from "electron";
import { AttachmentDownload } from "../@types";

import "./UnsupportedMedia.css";

type Props = {
    attachment: AttachmentDownload;
    onClick?: Function;
};

export default function UnsupportedMedia({ attachment, onClick }: Props) {
    return (
        <div className="UnsupportedMedia" onClick={() => onClick()}>
            {/* <p>Unsupported Media</p> */}
            <p>{attachment.transferName}</p>
            {/* <p>{attachment.mimeType}</p> */}
            <p>Click to open externally</p>
        </div>
    );
}
