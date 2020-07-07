import * as React from "react";
import { remote, ipcRenderer, IpcRendererEvent } from "electron";
import * as fs from "fs";
import EmojiRegex from "emoji-regex";

import { Message } from "@server/databases/chat/entity";
import { getiMessageNumberFormat, sanitizeStr, parseUrls } from "@renderer/utils";
import { AttachmentDownload } from "./@types";
import DownloadProgress from "./DownloadProgress";
import UnsupportedMedia from "./UnsupportedMedia";
import "./MessageBubble.css";

const { shell } = require("electron");
const path = require("path");

type Props = {
    olderMessage: Message;
    message: Message;
    newerMessage: Message;
};

type State = {
    contact: any;
    attachments: AttachmentDownload[];
};

const supportedVideoTypes = ["video/mp4", "video/m4v", "video/ogg", "video/webm", "video/x-m4v"];

const isSameSender = (message1: Message, message2: Message) => {
    if (!message1 || !message2) return false;
    if (message1.isFromMe === message2.isFromMe) return true;
    if (message1.handleId === message2.handleId) return true;
    return false;
};

const allEmojis = (text: string) => {
    if (!text) return false;

    const parser = EmojiRegex();
    const matches = text.match(parser);
    return matches && matches.length * 2 === text.length;
};

function openAttachment(e) {
    ipcRenderer.invoke("open-attachment", e.target.getAttribute("data-path"));
}

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
                    data-path={attachmentPath}
                    onClick={attachment.mimeType ? openAttachment : null}
                />
            );
        }

        if (attachment.mimeType.startsWith("video") && supportedVideoTypes.includes(attachment.mimeType)) {
            const b64File = fs.readFileSync(attachmentPath).toString("base64");
            return (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video key={attachment.guid} className="imageAttachment" controls>
                    <source src={`data:${attachment.mimeType};base64,${b64File}`} type={attachment.mimeType} />
                </video>
            );
        }

        if (attachment.mimeType.startsWith("audio")) {
            const b64File = fs.readFileSync(attachmentPath).toString("base64");
            return (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <audio key={attachment.guid} className="imageAttachment" controls>
                    <source src={`data:${attachment.mimeType};base64,${b64File}`} type={attachment.mimeType} />
                </audio>
            );
        }

        return <UnsupportedMedia key={attachment.guid} attachment={attachment} data-path={attachmentPath} />;
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
        let links = [];

        // Pull out the sender name or number
        const sender = contact ?? getiMessageNumberFormat(message.handle?.address ?? "");

        // Figure out which side of the chat it should be on
        const className = !message.isFromMe ? "IncomingMessage" : "OutgoingMessage";
        const attachmentClassName = !message.isFromMe ? "IncomingAttachment" : "OutgoingAttachment";
        const linkClassName = !message.isFromMe ? "IncomingLink" : "OutgoingLink";

        // Figure out if we should have a tail for the message
        const useTail = this.shouldHaveTail();
        let messageClass = useTail ? "message tail" : "message"; // Fix this to reflect having a tail

        // Figure out the "real string" and then figure out if we need to make it big emojis
        const text = sanitizeStr(message.text);
        if (text.length <= 6 && allEmojis(text)) {
            messageClass = "bigEmojis";
        }

        // Parse out any links. We can minimize parsing if we do a simple "contains" first
        let hasLink = false;
        if (text.includes("http")) {
            hasLink = true;
            links = parseUrls(text);
        }

        return (
            <>
                {/* If the message has an attachment */}
                {message.attachments.length > 0 ? (
                    <>
                        {/* If the attachment is a link */}
                        {hasLink ? (
                            <div className={linkClassName}>
                                {attachments.map((attachment: AttachmentDownload) => renderAttachment(attachment))}
                                <div className="linkBottomDiv">
                                    {/* Change first one Zach */}
                                    <p>{new URL(links[0]).hostname}</p>
                                    <p>{new URL(links[0]).hostname}</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className={attachmentClassName}>
                                    {message.handle && (!olderMessage || olderMessage.handleId !== message.handleId) ? (
                                        <p className="MessageSender">{sender}</p>
                                    ) : null}
                                    {attachments.map((attachment: AttachmentDownload) => renderAttachment(attachment))}
                                </div>
                                {text ? (
                                    <div className={className}>
                                        <div className={messageClass} style={{ marginBottom: useTail ? "8px" : "0" }}>
                                            <p>{text}</p>
                                        </div>
                                    </div>
                                ) : null}
                            </>
                        )}
                    </>
                ) : (
                    <div className={className}>
                        {message.handle && (!olderMessage || olderMessage.handleId !== message.handleId) ? (
                            <p className="MessageSender">{sender}</p>
                        ) : null}
                        <div className={messageClass} style={{ marginBottom: useTail ? "8px" : "0" }}>
                            {text ? <p>{text}</p> : null}
                        </div>
                    </div>
                )}
            </>
        );
    }
}

export default MessageBubble;
