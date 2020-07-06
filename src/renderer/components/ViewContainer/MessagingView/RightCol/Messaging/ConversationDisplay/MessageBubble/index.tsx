import * as React from "react";
import { remote, ipcRenderer, IpcRendererEvent } from "electron";
import * as fs from "fs";
import { Message } from "@server/databases/chat/entity";
import { getiMessageNumberFormat, sanitizeStr } from "@renderer/utils";
import { AttachmentDownload } from "./@types";
import DownloadProgress from "./DownloadProgress";
import UnsupportedMedia from "./UnsupportedMedia";

import "./MessageBubble.css";

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

const renderAttachment = (attachment: AttachmentDownload) => {
    if (attachment.progress === 100) {
        const attachmentPath = `${remote.app.getPath("userData")}/Attachments/${attachment.guid}/${
            attachment.transferName
        }`;

        // Render based on mime type
        if (!attachment.mimeType || attachment.mimeType.startsWith("image")) {
            const mime = attachment.mimeType ?? "image/pluginPayloadAttachment";
            const b64File = fs.readFileSync(attachmentPath).toString("base64");
            return (
                <img
                    key={attachment.guid}
                    className="imageAttachment"
                    src={`data:${mime};base64,${b64File}`}
                    alt={attachment.transferName}
                    loading="lazy"
                />
            );
        }
        // if (attachment.mimeType.startsWith("video")) return "VIDEO";
        // if (attachment.mimeType.startsWith("v-location")) return "LOC";

        return <UnsupportedMedia key={attachment.guid} attachment={attachment} />;
    }

    return <DownloadProgress key={`${attachment.guid}-in-progress`} attachment={attachment} />;
};

class MessageBubble extends React.Component<Props, State> {
    state: State = {
        contact: null,
        attachments: []
    };

    async componentDidMount() {
        const { message } = this.props;

        // TODO: Get the contact
        // this.setState({ contact: "John Doe" });

        // Get the attachments
        const attachments: AttachmentDownload[] = [];
        let idx = 0;
        for (const attachment of message.attachments ?? []) {
            // If the attachment's mimeType if null and the next attachment's mimeType is null, skip
            // This means the current attachment is just a logo
            if (
                idx + 1 < message.attachments.length &&
                !attachment.mimeType &&
                !message.attachments[idx + 1].mimeType
            ) {
                idx += 1;
                continue;
            }

            // Get the attachment path
            const attachmentPath = `${remote.app.getPath("userData")}/Attachments/${attachment.guid}/${
                attachment.transferName
            }`;

            // Check if the item exists
            const attachmentExists = fs.existsSync(attachmentPath);

            // Check if the attachment exists
            const item: Partial<AttachmentDownload> = attachment;

            // Add the attachment to the list
            item.progress = attachmentExists ? 100 : 0;
            attachments.push(item as AttachmentDownload);
            idx += 1;
        }

        // Add the attachments to the state
        await new Promise((resolve, _) => this.setState({ attachments }, resolve));

        // Second, determine if we need to fetch the attachments based on it's progress
        // We do this later because we want to make sure all the attachments are in the state first
        for (const attachment of this.state.attachments) {
            if (attachment.progress === 0) {
                // Register listener for each attachment that we need to download
                ipcRenderer.on(`attachment-${attachment.guid}-progress`, (event, args) =>
                    this.onAttachmentUpdate(event, args)
                );
                ipcRenderer.invoke("fetch-attachment", attachment);
            }
        }
    }

    onAttachmentUpdate(_: IpcRendererEvent, args: any) {
        const { attachment, progress } = args;

        // Search for the attachment and update the progress
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
        const text = sanitizeStr(message.text);

        return (
            <div>
                {message.handle && (!olderMessage || olderMessage.handleId !== message.handleId) ? (
                    <p className="MessageSender">{sender}</p>
                ) : null}
                <div className={className}>
                    <div className={messageClass}>
                        {attachments.map((attachment: AttachmentDownload) => renderAttachment(attachment))}
                        {text ? <p>{text}</p> : null}
                    </div>
                </div>
            </div>
        );
    }
}

export default MessageBubble;
