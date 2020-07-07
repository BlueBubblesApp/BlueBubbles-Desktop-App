import * as React from "react";
import { ipcRenderer, remote } from "electron";
import { AttachmentDownload } from "../@types";

import "./UnsupportedMedia.css";

type Props = {
    attachment: AttachmentDownload;
};

function openAttachment(e) {
    ipcRenderer.invoke("open-attachment", e.target.getAttribute("data-path"));
    console.log("open");
}

export default function UnsupportedMedia({ attachment }: Props) {
    const attachmentPath = `${remote.app.getPath("userData")}/Attachments/${attachment.guid}/${
        attachment.transferName
    }`;

    return (
        <div className="UnsupportedMedia" onClick={openAttachment} data-path={attachmentPath}>
            {/* <p>Unsupported Media</p> */}
            <p>{attachment.transferName}</p>
            {/* <p>{attachment.mimeType}</p> */}
            <p>Click to open externally</p>
        </div>
    );
}
