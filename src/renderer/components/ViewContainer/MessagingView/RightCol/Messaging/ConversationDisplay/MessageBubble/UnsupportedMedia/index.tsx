import * as React from "react";
import { AttachmentDownload } from "../@types";

import "./UnsupportedMedia.css";

type Props = {
    attachment: AttachmentDownload;
};

export default function UnsupportedMedia({ attachment }: Props) {
    return (
        <div className="UnsupportedMedia">
            <p>Unsupported Media</p>
            <p>{attachment.transferName}</p>
            <p>{attachment.mimeType}</p>
        </div>
    );
}
