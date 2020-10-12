/* eslint-disable react/sort-comp */
/* eslint-disable no-loop-func */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-expressions */
/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-len */
import * as React from "react";
import { remote, ipcRenderer, IpcRendererEvent, dialog } from "electron";
import * as fs from "fs";
import * as path from "path";
import { Map, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";
import EmojiRegex from "emoji-regex";
import ClickNHold from "react-click-n-hold";
import { getLinkPreview } from "link-preview-js";

// Server imports
import { Message as DBMessage, Chat } from "@server/databases/chat/entity";

// Renderer imports
import {
    sanitizeStr,
    parseUrls,
    getDateText,
    getSender,
    parseAppleLocation,
    generateReactionsDisplayIconText
} from "@renderer/helpers/utils";
import { supportedVideoTypes, supportedAudioTypes } from "@renderer/helpers/constants";
import UnknownImage from "@renderer/assets/img/unknown_img.png";

// Relative imports
import { AttachmentDownload } from "./@types";
import DownloadProgress from "./DownloadProgress/DownloadProgress";
import UnsupportedMedia from "./UnsupportedMedia";
import ReactionParticipant from "./ReactionsDisplay/ReactionParticipant/ReactionParticipant";
import ReactionsDisplay from "./ReactionsDisplay/ReactionsDisplay";

import "./MessageBubble.scss";
import "leaflet/dist/leaflet.css";
import NewReaction from "./NewReaction/NewReaction";
import InChatReaction from "./InChatReaction/InChatReaction";
import InChatAudio from "./InChatAudio/InChatAudio";

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
    showContextMenu: boolean;
    currentContextMenuElement: Element;
    linkTitle: string;
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
    const fPath = `${attachmentsDir}\\${attachment.guid}\\${attachment.transferName}`;
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
            console.log(attachment);
            const ext = attachment.mimeType.startsWith("video") ? "mp4" : "mp3";
            const newPath = `${attachmentsDir}\\${attachment.guid}\\${attachment.transferName.replace(
                path.extname(attachment.transferName),
                `.${ext}`
            )}`;
            output = fs.readFileSync(newPath).toString(encoding);
        } catch (ex) {
            console.log("ERRR HERER");
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
let xPos;
let yPos;

class MessageBubble extends React.Component<Props, State> {
    constructor(props) {
        super(props);

        this.state = {
            attachments: [],
            isReactionsOpen: false,
            showContextMenu: false,
            currentContextMenuElement: null,
            linkTitle: null
        };
    }

    handleImageRightClick(e) {
        xPos = `${e.pageX}px`;
        yPos = `${e.pageY - 25}px`;
        console.log(xPos + yPos);
        this.setState({ showContextMenu: true });
        this.setState({ currentContextMenuElement: e.target });
    }

    // eslint-disable-next-line react/sort-comp
    renderAttachment(attachment: AttachmentDownload) {
        if (attachment.progress === 100) {
            const attachmentPath = `${attachmentsDir}/${attachment.guid}/${attachment.transferName}`;

            // Render based on mime type
            if (!attachment.mimeType || attachment.mimeType.startsWith("image")) {
                const mime = attachment.mimeType ?? "image/pluginPayloadAttachment";

                return (
                    <img
                        key={attachment.guid}
                        id={attachmentPath}
                        className="Attachment"
                        src={`data:${mime};base64,${attachment.data}`}
                        alt={attachment.transferName}
                        onClick={attachment.mimeType ? () => openAttachment(attachmentPath) : null}
                        onContextMenu={e => this.handleImageRightClick(e)}
                        onError={setFallbackImage}
                    />
                );
            }

            if (attachment.mimeType.startsWith("video") && attachment.data) {
                let mime = attachment.mimeType;
                if (!supportedVideoTypes.includes(mime)) mime = "video/mp4";
                return (
                    <video
                        key={attachment.guid}
                        id={attachment.guid}
                        className="Attachment"
                        autoPlay
                        muted
                        loop
                        controls
                    >
                        <source src={`data:${mime};base64,${attachment.data}`} type={mime} />
                    </video>
                );
            }

            if (attachment.mimeType.startsWith("audio") && attachment.data) {
                return <InChatAudio attachment={attachment} />;
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
    }

    async componentDidMount() {
        document.addEventListener("click", e => {
            e.preventDefault();
            this.setState({ showContextMenu: false });
        });
        const { message } = this.props;

        if (message.text.includes("http") || message.text.includes("Https")) {
            const linkPrev: any = await getLinkPreview(message.text);
            if (linkPrev.title) {
                this.setState({ linkTitle: linkPrev.title });
            } else {
                this.setState({ linkTitle: linkPrev.description });
            }
        }

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

        const incomingReactions = document.getElementsByClassName("reactionOnIncoming") as HTMLCollectionOf<
            HTMLElement
        >;
        const outgoingReactions = document.getElementsByClassName("reactionOnOutgoing") as HTMLCollectionOf<
            HTMLElement
        >;

        // Hide all reactions
        for (let i = 0; i < incomingReactions.length; i += 1) {
            incomingReactions[i].style.display = "none";
        }
        for (let i = 0; i < outgoingReactions.length; i += 1) {
            outgoingReactions[i].style.display = "none";
        }

        this.setState({ isReactionsOpen: true });
    }

    closeReactionView(message) {
        const parent = document.getElementById(message.guid);
        parent.style.setProperty("--hide-pseudo", "1");

        document.getElementsByClassName("activeReactionMessage")[0].classList.toggle("activeReactionMessage");

        const incomingReactions = document.getElementsByClassName("reactionOnIncoming") as HTMLCollectionOf<
            HTMLElement
        >;
        const outgoingReactions = document.getElementsByClassName("reactionOnOutgoing") as HTMLCollectionOf<
            HTMLElement
        >;

        // Show all reactions
        for (let i = 0; i < incomingReactions.length; i += 1) {
            incomingReactions[i].style.display = "initial";
        }
        for (let i = 0; i < outgoingReactions.length; i += 1) {
            outgoingReactions[i].style.display = "initial";
        }

        this.setState({ isReactionsOpen: false });
    }

    async downloadImageToNewPath() {
        const saveDialogReturn = await ipcRenderer.invoke("show-save-file", this.state.currentContextMenuElement.id);
        if (saveDialogReturn.canceled === false) {
            const oldFileData = fs.readFileSync(this.state.currentContextMenuElement.id);
            fs.writeFileSync(saveDialogReturn.filePath, oldFileData);
            console.log(`Saved file to: ${saveDialogReturn.filePath}`);
        }
    }

    async openFileBrowserToPath() {
        await ipcRenderer.invoke("show-file-in-folder", this.state.currentContextMenuElement.id);
    }

    async copyImageToClipboard() {
        await ipcRenderer.invoke("copy-image-to-clipboard", this.state.currentContextMenuElement.id);
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

        // Is it sent?
        if (!message.guid || message.guid.length === 0 || message.guid.startsWith("temp")) {
            messageClass += " unsent";
        }

        // Figure out the "real string" and then figure out if we need to make it big emojis
        const text = sanitizeStr(message.text);

        if (text.length <= 2 * 3 && !/[a-z? _."'/,$0-9\\]/.test(text.toLowerCase()) && allEmojis(text)) {
            messageClass = "bigEmojis";
        }

        // Parse out any links. We can minimize parsing if we do a simple "contains" first
        if (text.includes("http") || text.includes("Https")) {
            links = parseUrls(text);
        }

        return (
            <>
                {this.state.showContextMenu ? (
                    <div
                        id="ImageContextMenu"
                        onClick={() => console.log("Clicked")}
                        style={{ position: "absolute", top: yPos, left: xPos }}
                    >
                        <div onClick={() => this.copyImageToClipboard()}>
                            <p>Copy Image</p>
                        </div>
                        <div onClick={() => this.downloadImageToNewPath()}>
                            <p>Download Image</p>
                        </div>
                        <div onClick={() => this.openFileBrowserToPath()}>
                            <p>Open In File Explorer</p>
                        </div>
                    </div>
                ) : null}
                {this.state.isReactionsOpen ? (
                    <div id="reactionOverlay" onClick={() => this.closeReactionView(message)}>
                        <div id="reactionParticipantsDiv">
                            <ReactionsDisplay message={message} />
                        </div>
                    </div>
                ) : null}
                {/* If the message has an attachment */}
                {message.attachments?.length > 0 ? (
                    <>
                        {/* If the attachment is a link */}
                        {links.length > 0 ? (
                            <div className={linkClassName} onClick={() => openLink(links[0])}>
                                {attachments.map((attachment: AttachmentDownload) => this.renderAttachment(attachment))}
                                <div className="linkBottomDiv">
                                    {/* Change first one Zach */}
                                    <p>{this.state.linkTitle || "Loading ..."}</p>
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
                                    {attachments.map((attachment: AttachmentDownload) => {
                                        return this.renderAttachment(attachment);
                                    })}
                                </div>
                                {text ? (
                                    <>
                                        <div className="emptyDiv" />
                                        <div className={className} style={{ marginLeft: useTail ? "5px" : "40px" }}>
                                            <div style={{ display: "flex", alignItems: "center" }}>
                                                {useTail && !message.isFromMe ? (
                                                    <>
                                                        {generateReactionsDisplayIconText(message.handle) === "?" ? (
                                                            <svg
                                                                style={{ marginRight: "10px", minWidth: "25px" }}
                                                                height="25px"
                                                                width="25px"
                                                                viewBox="0 0 1000 1000"
                                                            >
                                                                <defs>
                                                                    <linearGradient
                                                                        id="Gradient1"
                                                                        x1="0"
                                                                        x2="0"
                                                                        y1="1"
                                                                        y2="0"
                                                                    >
                                                                        <stop
                                                                            className="stop1"
                                                                            offset="0%"
                                                                            stopColor="#686868"
                                                                        />
                                                                        <stop
                                                                            className="stop2"
                                                                            offset="100%"
                                                                            stopColor="#928E8E"
                                                                        />
                                                                    </linearGradient>
                                                                </defs>
                                                                <circle
                                                                    className="cls-1"
                                                                    cx="50%"
                                                                    cy="50%"
                                                                    r="500"
                                                                    fill="url(#Gradient1)"
                                                                />
                                                                <mask id="rmvProfile">
                                                                    <circle cx="50%" cy="50%" r="435" fill="white" />
                                                                </mask>
                                                                <ellipse
                                                                    className="cls-2"
                                                                    fill="white"
                                                                    cx="50%"
                                                                    cy="34%"
                                                                    rx="218"
                                                                    ry="234"
                                                                />
                                                                <circle
                                                                    className="cls-2"
                                                                    mask="url(#rmvProfile)"
                                                                    fill="white"
                                                                    cx="50%"
                                                                    cy="106%"
                                                                    r="400"
                                                                />
                                                            </svg>
                                                        ) : (
                                                            <svg
                                                                style={{ marginRight: "10px", minWidth: "25px" }}
                                                                id="testContact"
                                                                className="dynamicIcon"
                                                                height="25px"
                                                                width="25px"
                                                                viewBox="0 0 1000 1000"
                                                            >
                                                                <defs>
                                                                    <linearGradient
                                                                        id="Gradient1"
                                                                        x1="0"
                                                                        x2="0"
                                                                        y1="1"
                                                                        y2="0"
                                                                    >
                                                                        <stop
                                                                            className="stop1"
                                                                            offset="0%"
                                                                            stopColor="#686868"
                                                                        />
                                                                        <stop
                                                                            className="stop2"
                                                                            offset="100%"
                                                                            stopColor="#928E8E"
                                                                        />
                                                                    </linearGradient>
                                                                </defs>
                                                                <circle
                                                                    className="cls-1"
                                                                    fill="url(#Gradient1)"
                                                                    cx="50%"
                                                                    cy="50%"
                                                                    r="50%"
                                                                />
                                                                <text
                                                                    style={{
                                                                        fontFamily: "quicksand",
                                                                        fontWeight: 700,
                                                                        fontStyle: "normal",
                                                                        fontSize:
                                                                            generateReactionsDisplayIconText(
                                                                                message.handle
                                                                            ).length >= 2
                                                                                ? "530px"
                                                                                : "650px"
                                                                    }}
                                                                    className="cls-2"
                                                                    x="50%"
                                                                    y="70%"
                                                                    textAnchor="middle"
                                                                    fill="white"
                                                                    stroke="white"
                                                                >
                                                                    {generateReactionsDisplayIconText(message.handle)}
                                                                </text>
                                                            </svg>
                                                        )}
                                                    </>
                                                ) : null}
                                                <ClickNHold time={0.8} onClickNHold={() => this.clickNHold(message)}>
                                                    <div
                                                        className={messageClass}
                                                        id={message.guid}
                                                        style={{ marginBottom: useTail ? "3px" : "0" }}
                                                    >
                                                        {message.hasReactions === true ? (
                                                            <>
                                                                {message.reactions.map((reaction, i) => (
                                                                    <InChatReaction
                                                                        key={reaction.guid}
                                                                        isMessageFromMe={message.isFromMe}
                                                                        isReactionFromMe={reaction.isFromMe}
                                                                        reactionType={reaction.associatedMessageType}
                                                                        offset={i}
                                                                    />
                                                                ))}
                                                            </>
                                                        ) : null}
                                                        <p>{text}</p>
                                                    </div>
                                                </ClickNHold>
                                            </div>
                                            {showStatus ? getStatusText(message) : null}
                                        </div>
                                    </>
                                ) : null}
                            </>
                        )}
                    </>
                ) : (
                    <>
                        <div className={className} style={{ marginLeft: useTail ? "5px" : "40px" }}>
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
                                <p className="MessageSender" style={{ marginLeft: useTail ? "38px" : "5px" }}>
                                    {sender}
                                </p>
                            ) : null}
                            <div style={{ display: "flex", alignItems: "center" }}>
                                {useTail && !message.isFromMe ? (
                                    <>
                                        {generateReactionsDisplayIconText(message.handle) === "?" ? (
                                            <svg
                                                style={{ marginRight: "10px", minWidth: "25px" }}
                                                height="25px"
                                                width="25px"
                                                viewBox="0 0 1000 1000"
                                            >
                                                <defs>
                                                    <linearGradient id="Gradient1" x1="0" x2="0" y1="1" y2="0">
                                                        <stop className="stop1" offset="0%" stopColor="#686868" />
                                                        <stop className="stop2" offset="100%" stopColor="#928E8E" />
                                                    </linearGradient>
                                                </defs>
                                                <circle
                                                    className="cls-1"
                                                    cx="50%"
                                                    cy="50%"
                                                    r="500"
                                                    fill="url(#Gradient1)"
                                                />
                                                <mask id="rmvProfile">
                                                    <circle cx="50%" cy="50%" r="435" fill="white" />
                                                </mask>
                                                <ellipse
                                                    className="cls-2"
                                                    fill="white"
                                                    cx="50%"
                                                    cy="34%"
                                                    rx="218"
                                                    ry="234"
                                                />
                                                <circle
                                                    className="cls-2"
                                                    mask="url(#rmvProfile)"
                                                    fill="white"
                                                    cx="50%"
                                                    cy="106%"
                                                    r="400"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                style={{ marginRight: "10px", minWidth: "25px" }}
                                                id="testContact"
                                                className="dynamicIcon"
                                                height="25px"
                                                width="25px"
                                                viewBox="0 0 1000 1000"
                                            >
                                                <defs>
                                                    <linearGradient id="Gradient1" x1="0" x2="0" y1="1" y2="0">
                                                        <stop className="stop1" offset="0%" stopColor="#686868" />
                                                        <stop className="stop2" offset="100%" stopColor="#928E8E" />
                                                    </linearGradient>
                                                </defs>
                                                <circle
                                                    className="cls-1"
                                                    fill="url(#Gradient1)"
                                                    cx="50%"
                                                    cy="50%"
                                                    r="50%"
                                                />
                                                <text
                                                    style={{
                                                        fontFamily: "quicksand",
                                                        fontWeight: 700,
                                                        fontStyle: "normal",
                                                        fontSize:
                                                            generateReactionsDisplayIconText(message.handle).length >= 2
                                                                ? "530px"
                                                                : "650px"
                                                    }}
                                                    className="cls-2"
                                                    x="50%"
                                                    y="70%"
                                                    textAnchor="middle"
                                                    fill="white"
                                                    stroke="white"
                                                >
                                                    {generateReactionsDisplayIconText(message.handle)}
                                                </text>
                                            </svg>
                                        )}
                                    </>
                                ) : null}
                                <ClickNHold time={0.8} onClickNHold={() => this.clickNHold(message)}>
                                    <div
                                        className={messageClass}
                                        id={message.guid}
                                        style={{ marginBottom: useTail ? "3px" : "0" }}
                                    >
                                        {message.hasReactions === true ? (
                                            <>
                                                {message.reactions.map((reaction, i) => (
                                                    <InChatReaction
                                                        key={reaction.guid}
                                                        isMessageFromMe={message.isFromMe}
                                                        isReactionFromMe={reaction.isFromMe}
                                                        reactionType={reaction.associatedMessageType}
                                                        offset={i}
                                                    />
                                                ))}
                                            </>
                                        ) : null}
                                        {text ? <p>{text}</p> : null}
                                    </div>
                                </ClickNHold>
                            </div>
                            {showStatus ? getStatusText(message) : null}
                        </div>
                    </>
                )}
            </>
        );
    }
}

export default MessageBubble;
