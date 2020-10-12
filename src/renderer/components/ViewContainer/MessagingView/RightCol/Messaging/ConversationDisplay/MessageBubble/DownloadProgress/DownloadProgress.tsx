import * as React from "react";
import { Attachment } from "@server/databases/chat/entity";
import { AttachmentDownload } from "../@types";

interface Props {
    attachment: AttachmentDownload;
}

class DownloadProgress extends React.Component<Props, unknown> {
    componentDidMount() {
        console.log(this.props.attachment);
    }

    render() {
        return null;
    }
}

export default DownloadProgress;
