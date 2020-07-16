/* eslint-disable class-methods-use-this */
/* eslint-disable max-len */
import * as React from "react";
import { remote, ipcRenderer, IpcRendererEvent } from "electron";
import * as fs from "fs";
import * as path from "path";
import { Map, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";
import EmojiRegex from "emoji-regex";
import ClickNHold from "react-click-n-hold";

// Server imports
import { Message as DBMessage, Chat } from "@server/databases/chat/entity";

// Renderer imports
import { sanitizeStr, parseUrls, getDateText, getSender, parseAppleLocation } from "@renderer/helpers/utils";
import { supportedVideoTypes, supportedAudioTypes } from "@renderer/helpers/constants";
import UnknownImage from "@renderer/assets/img/unknown_img.png";

// Relative imports
import { AttachmentDownload } from "./@types";
import DownloadProgress from "./DownloadProgress";
import UnsupportedMedia from "./UnsupportedMedia";
import ReactionParticipant from "../ReactionParticipant/ReactionParticipant";

import "./MessageBubble.scss";
import "leaflet/dist/leaflet.css";
import NewReaction from "./NewReaction/NewReaction";

// If we don't do this, the marker won't show
// eslint-disable-next-line no-underscore-dangle
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png")
});

type Message = DBMessage & {
    tempGuid: string;
    reactions: DBMessage[];
    reactionsChecked: boolean;
};

type Props = {
    chat: Chat;
    olderMessage: Message;
    message: Message;
    newerMessage: Message;
    showStatus: boolean;
};

type State = {
    attachments: AttachmentDownload[];
    isReactionsOpen: boolean;
};

let subdir = "";
if (process.env.NODE_ENV !== "production") subdir = "BlueBubbles-Desktop-App";

const baseDir = path.join(remote.app.getPath("userData"), subdir);
const attachmentsDir = path.join(baseDir, "Attachments");

const isSameSender = (message1: Message, message2: Message) => {
    if (!message1 || !message2) return false;
    if (message1.isFromMe === message2.isFromMe) return true;
    if (message1.handleId === message2.handleId) return true;
    return false;
};

const isSupportedMime = (mimeType: string) => {
    if (!mimeType || mimeType.startsWith("image")) return true;
    return mimeType.startsWith("audio") || mimeType.startsWith("video") || ["text/x-vlocation"].includes(mimeType);
};

const loadAttachmentData = (attachment: AttachmentDownload) => {
    if (!isSupportedMime(attachment.mimeType)) return null;
    if (attachment.data) return attachment.data;
    const fPath = `${attachmentsDir}/${attachment.guid}/${attachment.transferName}`;
    let encoding = "base64";

    // If it's a location card, read as utf-8
    if (attachment.mimeType === "text/x-vlocation") encoding = "utf-8";

    // If it's an unsupported type, check for the converted video
    let output = null;
    if (
        attachment.mimeType &&
        (attachment.mimeType.startsWith("audio") || attachment.mimeType.startsWith("video")) &&
        !supportedAudioTypes.includes(attachment.mimeType) &&
        !supportedVideoTypes.includes(attachment.mimeType)
    ) {
        try {
            const ext = attachment.mimeType.startsWith("video") ? "mp4" : "mp3";
            const newPath = `${attachmentsDir}/${attachment.guid}/${attachment.transferName.replace(
                path.extname(attachment.transferName),
                `.${ext}`
            )}`;
            output = fs.readFileSync(newPath).toString(encoding);
        } catch (ex) {
            console.log(ex);
            /* Do nothing */
        }
    } else {
        output = fs.readFileSync(fPath).toString(encoding);
    }

    return output;
};

const allEmojis = (text: string) => {
    if (!text) return false;

    const parser = EmojiRegex();
    const matches = text.match(parser);
    return matches && matches.length <= 3;
};

const openAttachment = attachmentPath => {
    ipcRenderer.invoke("open-attachment", attachmentPath);
};

const getStatusText = (message: Message) => {
    if (message.dateRead) return <p className="MessageStatus">{`Read ${getDateText(new Date(message.dateRead))}`}</p>;
    if (message.dateDelivered) return <p className="MessageStatus">Delivered</p>;
    return null;
};

const openLink = link => {
    ipcRenderer.invoke("open-link", link);
};

const setFallbackImage = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = UnknownImage;
};

const renderAttachment = (attachment: AttachmentDownload) => {
    if (attachment.progress === 100) {
        const attachmentPath = `${attachmentsDir}/${attachment.guid}/${attachment.transferName}`;

        // Render based on mime type
        if (!attachment.mimeType || attachment.mimeType.startsWith("image")) {
            const mime = attachment.mimeType ?? "image/pluginPayloadAttachment";
            return (
                <img
                    key={attachment.guid}
                    className="Attachment"
                    src={`data:${mime};base64,${attachment.data}`}
                    alt={attachment.transferName}
                    onClick={attachment.mimeType ? () => openAttachment(attachmentPath) : null}
                    onError={setFallbackImage}
                />
            );
        }

        if (attachment.mimeType.startsWith("video") && attachment.data) {
            let mime = attachment.mimeType;
            if (!supportedVideoTypes.includes(mime)) mime = "video/mp4";
            return (
                <video key={attachment.guid} id={attachment.guid} className="Attachment" autoPlay muted loop controls>
                    <source src={`data:${mime};base64,${attachment.data}`} type={mime} />
                </video>
            );
        }

        if (attachment.mimeType.startsWith("audio") && attachment.data) {
            let mime = attachment.mimeType;
            if (!supportedAudioTypes.includes(mime)) mime = "audio/mp3";
            return (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <audio key={attachment.guid} className="Attachment" controls>
                    <source src={`data:${mime};base64,${attachment.data}`} type={mime} />
                </audio>
            );
        }

        if (attachment.mimeType === "text/x-vlocation") {
            const longLat = parseAppleLocation(attachment.data);
            const position = [longLat.longitude, longLat.latitude];
            return (
                <Map center={position} zoom={13} className="Attachment MapLeaflet" key={attachment.guid}>
                    <TileLayer url="https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}" />
                    <Marker position={position} />
                </Map>
            );
        }

        return (
            <UnsupportedMedia
                key={attachment.guid}
                attachment={attachment}
                onClick={() => openAttachment(attachmentPath)}
            />
        );
    }

    return <DownloadProgress key={`${attachment.guid}-in-progress`} attachment={attachment} />;
};

class MessageBubble extends React.Component<Props, State> {
    state: State = {
        attachments: [],
        isReactionsOpen: false
    };

    async componentDidMount() {
        const { message } = this.props;

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
            const attachmentPath = `${attachmentsDir}/${attachment.guid}/${attachment.transferName}`;

            // Check if the item exists
            const attachmentExists = fs.existsSync(attachmentPath);

            // Check if the attachment exists
            const item: Partial<AttachmentDownload> = attachment;

            // Add the attachment to the list
            item.progress = attachmentExists ? 100 : 0;

            // If the progress is 100%, load the data
            if (item.progress === 100) item.data = loadAttachmentData(item as AttachmentDownload);

            // Add the attachment to the UI
            attachments.push(item as AttachmentDownload);
            idx += 1;
        }

        // Add the attachments to the state
        await new Promise((resolve, _) => this.setState({ attachments }, resolve));

        // Second, determine if we need to fetch the attachments based on it's progress
        // We do this later because we want to make sure all the attachments are in the state first
        const attachmentsCopy = [...this.state.attachments];
        for (let i = 0; i < attachmentsCopy.length; i += 1) {
            if (attachmentsCopy[i].progress === 0) {
                // Register listener for each attachment that we need to download
                ipcRenderer.on(`attachment-${attachmentsCopy[i].guid}-progress`, (event, args) =>
                    this.onAttachmentUpdate(event, args)
                );
                ipcRenderer.invoke("fetch-attachment", attachmentsCopy[i]);
            }
        }

        this.setState({ attachments: attachmentsCopy });
    }

    onAttachmentUpdate(_: IpcRendererEvent, args: any) {
        const { attachment, progress } = args;

        // Search for the attachment and update the progress
        const updatedAttachments = [...this.state.attachments];
        for (let i = 0; i < updatedAttachments.length; i += 1) {
            if (updatedAttachments[i].guid === attachment.guid) {
                updatedAttachments[i].progress = progress;

                // If the progress is finished, load the attachment
                if (updatedAttachments[i].progress === 100) {
                    updatedAttachments[i].data = loadAttachmentData(updatedAttachments[i]);
                }
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

    clickNHold(message) {
        const parent = document.getElementById(message.guid);
        if (!parent) return;

        parent.classList.toggle("activeReactionMessage");
        parent.style.setProperty("--hide-pseudo", "0");

        this.setState({ isReactionsOpen: true });
    }

    closeReactionView() {
        document.getElementsByClassName("activeReactionMessage")[0].classList.toggle("activeReactionMessage");
        this.setState({ isReactionsOpen: false });
    }

    render() {
        const { message, olderMessage, showStatus, chat } = this.props;
        const { attachments } = this.state;
        let links = [];

        // Pull out the sender name or number
        const sender = getSender(message.handle);

        // Figure out which side of the chat it should be on
        const className = !message.isFromMe ? "IncomingMessage" : "OutgoingMessage";
        const attachmentClassName = !message.isFromMe ? "IncomingAttachment" : "OutgoingAttachment";
        const linkClassName = !message.isFromMe ? "IncomingLink" : "OutgoingLink";

        // Figure out if we should have a tail for the message
        const useTail = this.shouldHaveTail();
        let messageClass = useTail ? "message tail" : "message"; // Fix this to reflect having a tail

        // Figure out the "real string" and then figure out if we need to make it big emojis
        const text = sanitizeStr(message.text);
        if (text.length <= 4 * 3 && allEmojis(text)) {
            messageClass = "bigEmojis";
        }

        // Parse out any links. We can minimize parsing if we do a simple "contains" first
        if (text.includes("http") || text.includes("Https")) {
            links = parseUrls(text);
        }

        return (
            <>
                {this.state.isReactionsOpen ? (
                    <div id="reactionOverlay" onClick={() => this.closeReactionView()}>
                        <div id="reactionParticipantsDiv">
                            <ReactionParticipant reactionSender="Maxwell" reactionType="Like" />
                        </div>
                    </div>
                ) : null}
                {/* If the message has an attachment */}
                {message.attachments?.length > 0 ? (
                    <>
                        {/* If the attachment is a link */}
                        {links.length > 0 ? (
                            <div className={linkClassName} onClick={() => openLink(links[0])}>
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
                                    {chat.participants.length > 1 &&
                                    message.handle &&
                                    (!olderMessage || olderMessage.handleId !== message.handleId) ? (
                                        <p className="MessageSender">{sender}</p>
                                    ) : null}
                                    {attachments.map((attachment: AttachmentDownload) => renderAttachment(attachment))}
                                </div>
                                {text ? (
                                    <>
                                        <div className="emptyDiv" />
                                        <div className={className}>
                                            <ClickNHold time={0.8} onClickNHold={() => this.clickNHold(message)}>
                                                <div
                                                    className={messageClass}
                                                    id={message.guid}
                                                    style={{ marginBottom: useTail ? "3px" : "0" }}
                                                >
                                                    <p>{text}</p>
                                                </div>
                                            </ClickNHold>
                                            {showStatus ? getStatusText(message) : null}
                                        </div>
                                    </>
                                ) : null}
                            </>
                        )}
                    </>
                ) : (
                    <>
                        <div className={className}>
                            {this.state.isReactionsOpen ? (
                                <NewReaction
                                    message={message}
                                    chat={chat}
                                    onClose={() => this.setState({ isReactionsOpen: false })}
                                />
                            ) : (
                                <div className="emptyDiv" />
                            )}
                            {chat.participants.length > 1 &&
                            message.handle &&
                            (!olderMessage || olderMessage.handleId !== message.handleId) ? (
                                <p className="MessageSender">{sender}</p>
                            ) : null}
                            <ClickNHold time={0.8} onClickNHold={() => this.clickNHold(message)}>
                                <div
                                    className={messageClass}
                                    id={message.guid}
                                    style={{ marginBottom: useTail ? "3px" : "0" }}
                                >
                                    {text ? <p>{text}</p> : null}
                                </div>
                            </ClickNHold>
                            {showStatus ? getStatusText(message) : null}
                        </div>
                    </>
                )}
            </>
        );
    }
}

export default MessageBubble;
