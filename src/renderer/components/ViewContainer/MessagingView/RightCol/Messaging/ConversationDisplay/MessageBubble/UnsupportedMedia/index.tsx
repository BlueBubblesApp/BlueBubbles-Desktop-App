import * as React from "react";
import ComputerCheckImage from "@renderer/assets/img/computer_check.png";
import { AttachmentDownload } from "../@types";

import "./UnsupportedMedia.css";

type Props = {
    attachment: AttachmentDownload;
    onClick?: Function;
};

export default function UnsupportedMedia({ attachment, onClick }: Props) {
    return (
        <div className="UnsupportedMedia" onClick={() => onClick()} draggable="false">
            {/* <p>Unsupported Media</p> */}
            <p>Unsupported Media</p>
            <img key={attachment.guid} src={ComputerCheckImage} alt="open-externally" color="white" />
            <p>Open File</p>
            <p>{attachment.mimeType}</p>
        </div>
    );
}
