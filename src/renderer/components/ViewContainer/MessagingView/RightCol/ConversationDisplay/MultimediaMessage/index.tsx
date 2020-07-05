import * as React from "react";
import { app, ipcRenderer, IpcRendererEvent } from "electron";
import * as fs from "fs";
import { Message } from "@server/databases/chat/entity";
import { getiMessageNumberFormat } from "@renderer/utils";
import { AttachmentDownload } from "./@types";
import DownloadProgress from "./DownloadProgress";
import UnsupportedMedia from "./UnsupportedMedia";

import "./MultimediaMessage.css";

type Props = {
    olderMessage: Message;
    message: Message;
    newerMessage: Message;
};

type State = {
    contact: any;
    attachments: AttachmentDownload[];
};

const isSameSender = (message1: Message, message2: Message) => {
    if (!message1 || !message2) return false;
    if (message1.isFromMe === message2.isFromMe) return true;
    if (message1.handleId === message2.handleId) return true;
    return false;
};

class MultimediaMessage extends React.Component<Props, State> {
    state = {
        contact: null,
        attachments: []
    };

    componentDidMount() {
        const { message } = this.props;

        // Register listener to check for image download progress
        ipcRenderer.on("attachment-progress-update", this.onAttachmentUpdate);

        // TODO: Get the contact
        // this.setState({ contact: "John Doe" });

        // Get the attachments
        const attachments: AttachmentDownload[] = [];
        for (const attachment of message.attachments ?? []) {
            const attachmentPath = `${app.getPath("userData")}/Attachments/${attachment.guid}/${
                attachment.transferName
            }`;

            const item: Partial<AttachmentDownload> = attachment;
            item.progress = 0;

            // If the file exists in the FS already,
            if (fs.existsSync(attachmentPath)) {
                item.progress = 100;

                // Convert to attachmentProgress
                attachments.push(item as AttachmentDownload);
            } else {
                // TODO: Get from socket
            }
        }

        this.setState({ attachments });
    }

    componentWillUnmount() {
        ipcRenderer.removeListener("attachment-progress-update", this.onAttachmentUpdate);
    }

    onAttachmentUpdate(_: IpcRendererEvent, args: any) {
        const { attachment, progress } = args;

        // Search for the attachment and update the process
        const updatedAttachments = [...this.state.attachments];
        for (let i = 0; i < updatedAttachments.length; i += 1) {
            if (updatedAttachments[i].guid === attachment.guid) {
                updatedAttachments[i].progress = progress;
                break;
            }
        }

        this.setState({ attachments: updatedAttachments });
    }

    shouldHaveTail(): boolean {
        const { message, newerMessage } = this.props;
        if (newerMessage === null) return true;
        if (newerMessage.dateCreated - message.dateCreated > 1000 * 60) return true;
        if (!isSameSender(message, newerMessage)) return true;
        return false;
    }

    render() {
        const { message, olderMessage } = this.props;
        const { contact, attachments } = this.state;

        const sender = contact ?? getiMessageNumberFormat(message.handle?.address ?? "");
        const className = !message.isFromMe ? "IncomingMessage" : "OutgoingMessage";
        const messageClass = this.shouldHaveTail() ? "message tail" : "message"; // Fix this to reflect having a tail

        return (
            <div>
                {message.handle && (!olderMessage || olderMessage.handleId !== message.handleId) ? (
                    <p className="MessageSender">{sender}</p>
                ) : null}
                <div className={className}>
                    <p className={messageClass}>
                        {attachments.map((attachment: AttachmentDownload) => {
                            if (attachment.progress === 100) {
                                if (attachment.mimeType.startsWith("image"))
                                    return (
                                        <img
                                            src={`${app.getPath("userData")}/Attachments/${attachment.guid}/${
                                                attachment.transferName
                                            }`}
                                            alt={attachment.transferName}
                                        />
                                    );
                                if (attachment.mimeType.startsWith("video")) return "VIDEO";
                                if (attachment.mimeType.startsWith("v-location")) return "LOC";

                                return <UnsupportedMedia key={attachment.guid} attachment={attachment} />;
                            }

                            return <DownloadProgress key={attachment.guid} attachment={attachment} />;
                        })}
                        {message.hasAttachments
                            ? `1
                    Attachment\n\n${message.text.trim()}`
                            : message.text.trim()}
                    </p>
                </div>
            </div>
        );
    }
}

export default MultimediaMessage;
