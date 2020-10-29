/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable no-underscore-dangle */
/* eslint-disable import/order */
/* eslint-disable react/no-unused-state */
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
import Confetti from "react-confetti";

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
import * as FireworksCanvas from "fireworks-canvas";

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
    messages: Message[];
};

type State = {
    attachments: AttachmentDownload[];
    isReactionsOpen: boolean;
    showContextMenu: boolean;
    currentContextMenuElement: Element;
    linkTitle: string;
    playMessageAnimation: boolean;
    stickers: AttachmentDownload[];
    linkPrev: any;
};

let subdir = "";
if (process.env.NODE_ENV !== "production") subdir = "BlueBubbles-Desktop-App";

const baseDir = path.join(remote.app.getPath("userData"), subdir);
const attachmentsDir = path.join(baseDir, "Attachments");

const isSameSender = (message1: Message, message2: Message) => {
    if (!message1 || !message2) return false;
    if (message1.isFromMe === true && message2.isFromMe === false) return false;
    if (message1.isFromMe === false && message2.isFromMe === true) return false;
    if (message1.handle?.address === message2.handle?.address) return true;
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
            console.log(attachment);
            const ext = attachment.mimeType.startsWith("video") ? "mp4" : "mp3";
            const newPath = `${attachmentsDir}/${attachment.guid}/${attachment.transferName.replace(
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
    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            attachments: [],
            isReactionsOpen: false,
            showContextMenu: false,
            currentContextMenuElement: null,
            linkTitle: null,
            playMessageAnimation: false,
            stickers: [],
            linkPrev: null
        };
    }

    handleImageRightClick(e) {
        xPos = `${e.pageX}px`;
        yPos = `${e.pageY - 25}px`;
        this.setState({ showContextMenu: true });
        this.setState({ currentContextMenuElement: e.target });
    }

    async wait() {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // eslint-disable-next-line react/sort-comp
    renderAttachment(attachment: AttachmentDownload) {
        if (attachment.progress === 100) {
            const attachmentPath = `${attachmentsDir}/${attachment.guid}/${attachment.transferName}`;

            // Render based on mime type
            if (!attachment.mimeType || attachment.mimeType.startsWith("image")) {
                console.log(attachment.width);
                const mime = attachment.mimeType ?? "image/pluginPayloadAttachment";

                if (attachment.isSticker) {
                    const messageDiv = document.getElementById(this.props.message.guid);

                    const x = this.wait().then();

                    if (messageDiv) {
                        const messageCords = messageDiv.getBoundingClientRect();
                        return (
                            <>
                                {this.props.message.isFromMe ? (
                                    <img
                                        key={attachment.guid}
                                        id={attachmentPath}
                                        className="Sticker"
                                        src={`data:${mime};base64,${attachment.data}`}
                                        alt={attachment.transferName}
                                        onClick={attachment.mimeType ? () => openAttachment(attachmentPath) : null}
                                        onContextMenu={e => this.handleImageRightClick(e)}
                                        onError={setFallbackImage}
                                        style={{ left: `${messageCords.left - 295 + messageCords.width / 2}px` }}
                                    />
                                ) : (
                                    <img
                                        key={attachment.guid}
                                        id={attachmentPath}
                                        className="Sticker"
                                        src={`data:${mime};base64,${attachment.data}`}
                                        alt={attachment.transferName}
                                        onClick={attachment.mimeType ? () => openAttachment(attachmentPath) : null}
                                        onContextMenu={e => this.handleImageRightClick(e)}
                                        onError={setFallbackImage}
                                        // style={{left: `${messageCords.left - 295 + messageCords.width/2}px`}}
                                    />
                                )}
                            </>
                        );
                    }
                }

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
                console.log(attachment.mimeType);
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

            if (attachment.mimeType.includes("vcard")) {
                const vCard = require("vcard");
                // eslint-disable-next-line new-cap
                const card = new vCard();

                let vcfData;
                card.readFile(attachmentPath, function(err, json) {
                    vcfData = json;
                });

                const generateVCFIconText = json => {
                    if (!json) {
                        return "?";
                    }
                    if (json.FN) {
                        if (json.FN.includes(" ")) {
                            return json.FN.substr(0, 1) + json.FN.substr(json.FN.indexOf(" ") + 1, 1);
                        }
                        return json.FN.substr(0, 1);
                    }
                    return "?";
                };

                return (
                    <div
                        className="inChatContactCard"
                        style={{
                            backgroundColor: this.props.message.isFromMe
                                ? "var(--outgoing-message-color)"
                                : "var(--incoming-message-color)"
                        }}
                        onClick={() => openAttachment(attachmentPath)}
                    >
                        {vcfData && vcfData.FN ? <p>{vcfData.FN}</p> : <p>Contact</p>}
                        <div>
                            {generateVCFIconText(vcfData) === "?" ? (
                                <svg height="35px" width="35px" viewBox="0 0 1000 1000">
                                    <defs>
                                        <linearGradient id="Gradient1" x1="0" x2="0" y1="1" y2="0">
                                            <stop className="stop1" offset="0%" stopColor="#686868" />
                                            <stop className="stop2" offset="100%" stopColor="#928E8E" />
                                        </linearGradient>
                                    </defs>
                                    <circle cx="50%" cy="50%" r="500" fill="url(#Gradient1)" />
                                    <mask id="rmvProfile">
                                        <circle cx="50%" cy="50%" r="435" fill="white" />
                                    </mask>
                                    <ellipse fill="white" cx="50%" cy="34%" rx="218" ry="234" />
                                    <circle mask="url(#rmvProfile)" fill="white" cx="50%" cy="106%" r="400" />
                                </svg>
                            ) : (
                                <svg height="35px" width="35px">
                                    <defs>
                                        <linearGradient id="Gradient1" x1="0" x2="0" y1="1" y2="0">
                                            <stop className="stop1" offset="0%" stopColor="#686868" />
                                            <stop className="stop2" offset="100%" stopColor="#928E8E" />
                                        </linearGradient>
                                    </defs>
                                    <circle fill="url(#Gradient1)" cx="50%" cy="50%" r="50%" />
                                    <text x="50%" y="67%" textAnchor="middle" fill="white" stroke="white">
                                        {generateVCFIconText(vcfData)}
                                    </text>
                                </svg>
                            )}
                            <svg viewBox="0 0 574 1024">
                                <path d="M10 9Q0 19 0 32t10 23l482 457L10 969Q0 979 0 992t10 23q10 9 24 9t24-9l506-480q10-10 10-23t-10-23L58 9Q48 0 34 0T10 9z" />
                            </svg>
                        </div>
                    </div>
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

    isValidUrl = string => {
        const regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
        if (regexp.test(string)) {
            return true;
        }
        return false;
    };

    async componentDidMount() {
        this._isMounted = true;

        if (this._isMounted) {
            document.addEventListener("click", e => {
                e.preventDefault();
                this.setState({ showContextMenu: false });
            });

            const { message } = this.props;

            if (this.isValidUrl(message.text) || message.text.includes("http") || message.text.includes("Https")) {
                const linkPrev: any = await getLinkPreview(message.text);
                console.log(linkPrev);
                this.setState({ linkPrev });
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

            // If we have stickers
            const stickers: AttachmentDownload[] = [];
            if (message.reactions) {
                for (const reaction of message.reactions) {
                    if (reaction.associatedMessageType === "sticker") {
                        for (const attachment of reaction.attachments) {
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
                            stickers.push(item as AttachmentDownload);
                        }
                    }
                }
            }

            await new Promise((resolve, _) => this.setState({ stickers }, resolve));

            if (this.state.stickers) {
                const stickersCopy = this.state.stickers;
                for (let i = 0; i < stickersCopy.length; i += 1) {
                    if (stickersCopy[i].progress === 0) {
                        // Register listener for each attachment that we need to download
                        ipcRenderer.on(`attachment-${stickersCopy[i].guid}-progress`, (event, args) =>
                            this.onAttachmentUpdate(event, args)
                        );
                        ipcRenderer.invoke("fetch-attachment", stickersCopy[i]);
                    }
                }

                this.setState({ stickers: stickersCopy });
            }

            // If we have a message send style
            if (message.expressiveSendStyleId) {
                const messageDiv = document.getElementById(this.props.message.guid);
                if (this.isRecentMessage()) {
                    this.setState({ playMessageAnimation: true });
                    if (this.props.message.expressiveSendStyleId.includes("CKFireworksEffect")) {
                        const container = document.getElementById(`fireworksContainer-${message.guid}`);
                        const fireworks = new FireworksCanvas(container);
                        fireworks.start();
                    }
                    if (this.props.message.expressiveSendStyleId.includes("CKHappyBirthdayEffect")) {
                        this.createBalloons(100);
                    }
                    if (this.props.message.expressiveSendStyleId.includes("CKSpotlightEffect")) {
                        this.handleSpotlight();
                    }
                    if (this.props.message.expressiveSendStyleId.includes("CKHeartEffect")) {
                        this.handleHearts();
                    }
                    if (this.props.message.expressiveSendStyleId.includes("CKEchoEffect")) {
                        this.handleEcho();
                    }

                    // Play the animation for 3 seconds
                    const delay = ms => new Promise(res => setTimeout(res, ms));
                    await delay(3000);
                    this.setState({ playMessageAnimation: false });
                }
            }
        }
    }

    async componentWillUnmount() {
        this._isMounted = false;
        document.removeEventListener("click", e => {
            // Nothing
        });
    }

    async createBalloons(numOfBallons) {
        const random = num => {
            return Math.floor(Math.random() * num);
        };

        const getRandomStyles = () => {
            const r = random(255);
            const g = random(255);
            const b = random(255);
            const mt = random(200);
            const ml = random(50);
            const dur = random(2) + 3;

            return `
            background-color: rgba(${r},${g},${b},0.95);
            color: rgba(${r},${g},${b},0.95); 
            box-shadow: inset -7px -3px 10px rgba(${r - 10},${g - 10},${b - 10},0.95);
            margin: ${mt}px 0 0 ${ml}px;
            animation: float ${dur}s ease-in infinite
            `;
        };

        const createBalloons = num => {
            const balloonContainer = document.getElementById(`balloonsContainer-${this.props.message.guid}`);
            for (let i = num; i > 0; i -= 1) {
                const balloon = document.createElement("div");
                balloon.className = "balloon";
                balloon.style.cssText = getRandomStyles();
                balloonContainer.append(balloon);
            }
        };

        createBalloons(numOfBallons);
    }

    async handleSpotlight() {
        const bg = document.getElementById(`spotlightContainer-${this.props.message.guid}`);
        const messageDiv = document.getElementById(this.props.message.guid);

        const delay = ms => new Promise(res => setTimeout(res, ms));
        await delay(50);
        const messageCords = messageDiv.getBoundingClientRect();

        console.log(messageCords);
        bg.style.background = "black";
        await delay(200);
        bg.style.background = `radial-gradient(circle at ${messageCords.left -
            290 +
            messageCords.width / 2}px ${messageCords.top - 35}px ,
            rgba(0,0,0,0) 0px,
            rgba(0,0,0,.5) ${messageCords.width / 1.3}px,
            rgba(0,0,0,.95) ${messageCords.width + 30}px
            )`;
        await delay(100);
        bg.style.background = "black";
        await delay(100);
        bg.style.background = `radial-gradient(circle at ${messageCords.left -
            290 +
            messageCords.width / 2}px ${messageCords.top - 35}px ,
            rgba(0,0,0,0) 0px,
            rgba(0,0,0,.5) ${messageCords.width / 1.3}px,
            rgba(0,0,0,.95) ${messageCords.width + 30}px
            )`;
    }

    async handleHearts() {
        const container = document.getElementById(`heartContainer-${this.props.message.guid}`);

        const love = setInterval(() => {
            if (!this.state.playMessageAnimation) {
                clearInterval(love);
            }
            const rNum = Math.floor(Math.random() * 40) + 1;
            const rSize = Math.floor(Math.random() * 65) + 30;
            const rLeft = Math.floor(Math.random() * 100) + 1;
            const rBg = Math.floor(Math.random() * 25) + 100;
            const rTime = Math.floor(Math.random()) + 2;

            const heart = document.createElement("div");
            heart.className = "heart";
            heart.style.cssText = `width: ${rSize}px; height: ${rSize}px; left: ${rLeft}%; background: rgba(255, ${rBg -
                25}, ${rBg}, 1); animation: love ${rTime}s ease`;
            container.append(heart);

            const heart2 = document.createElement("div");
            heart.className = "heart";
            heart.style.cssText = `width: ${rSize - 10}px; height: ${rSize - 10}px; left: ${rLeft +
                rNum}%; background: rgba(255, ${rBg - 25}, ${rBg}, 1); animation: love ${rTime + 2}s ease`;
            container.append(heart2);

            const hearts = document.getElementsByClassName("heart");
            for (let i = 0; i < hearts.length; i += 1) {
                const x = hearts.item(i) as HTMLDivElement;
                x.style.top = x.style.top.replace(/[^-\d.]/g, "");
                x.style.width = x.style.width.replace(/[^-\d.]/g, "");

                if (((x.style.top as unknown) as number) <= -100 || ((x.style.width as unknown) as number) >= 150) {
                    x.parentElement.removeChild(x);
                }
            }
        }, 75);
    }

    async handleEcho() {
        const container = document.getElementById(`echoContainer-${this.props.message.guid}`);

        const allEchos = setInterval(() => {
            if (!this.state.playMessageAnimation) {
                clearInterval(allEchos);
            }
            const rNum = Math.floor(Math.random() * 40) + 1;
            const rSize = Math.floor(Math.random() * 65) + 30;
            const rLeft = Math.floor(Math.random() * 100) + 1;
            const rBg = Math.floor(Math.random() * 25) + 100;
            const rTime = Math.floor(Math.random()) + 2;
            const rFontSize = Math.floor(Math.random() * 12) + 8;
            const rScale = Math.floor(Math.random() * 1.5) + 0.7;

            const mesCopy = document.getElementById(this.props.message.guid).cloneNode(true) as HTMLDivElement;
            const mesCopy2 = document.getElementById(this.props.message.guid).cloneNode(true) as HTMLDivElement;

            console.log(mesCopy);
            mesCopy.classList.add("echo");
            mesCopy.style.cssText = `font-size: ${rFontSize}; left: ${rLeft}%; animation: echo ${rTime}s ease forwards; transform: scale(${rScale})`;

            container.append(mesCopy);

            const echos = document.getElementsByClassName("echo");
            for (let i = 0; i < echos.length; i += 1) {
                const x = echos.item(i) as HTMLDivElement;
                x.style.top = x.style.top.replace(/[^-\d.]/g, "");
                // x.style.width = x.style.width.replace(/[^-\d.]/g, '');

                if (((x.style.top as unknown) as number) <= -100 || ((x.style.width as unknown) as number) >= 150) {
                    x.parentElement.removeChild(x);
                }
            }
        }, 50);
    }

    isRecentMessage() {
        if (this.props.messages.indexOf(this.props.message) <= this.props.messages.length - 5) {
            return false;
        }
        return true;
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

    shouldHaveAvatar(): boolean {
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
        const { attachments, linkPrev } = this.state;
        const { stickers } = this.state;
        const animationHeight = document.getElementById("messageView").offsetHeight;
        const animationWidth = document.getElementById("messageView").offsetWidth;

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

        // Figure out if the message should show the handle avatar
        const useAvatar = this.shouldHaveAvatar();

        // Is it sent?
        if (!message.guid || message.guid.length === 0 || message.guid.startsWith("temp")) {
            messageClass += " unsent";
        }

        // Check if we have a special imessage send style
        let expressiveSendStyle = "";
        if (message.expressiveSendStyleId) {
            if (message.expressiveSendStyleId.includes("invisibleink")) {
                expressiveSendStyle = "invisibleink";
            }
            if (message.expressiveSendStyleId.includes("impact")) {
                expressiveSendStyle = "impact";
            }
            if (message.expressiveSendStyleId.includes("gentle")) {
                expressiveSendStyle = "gentle";
            }
            if (message.expressiveSendStyleId.includes("loud")) {
                expressiveSendStyle = "loud";
            }
            if (message.expressiveSendStyleId.includes("CKHeartEffect")) {
                expressiveSendStyle = "CKHeartEffect";
            }
            if (message.expressiveSendStyleId.includes("CKConfettiEffect")) {
                expressiveSendStyle = "CKConfettiEffect";
            }
            if (message.expressiveSendStyleId.includes("CKHappyBirthdayEffect")) {
                expressiveSendStyle = "CKHappyBirthdayEffect";
            }
            if (message.expressiveSendStyleId.includes("CKSpotlightEffect")) {
                expressiveSendStyle = "CKSpotlightEffect";
            }
            if (message.expressiveSendStyleId.includes("CKEchoEffect")) {
                expressiveSendStyle = "CKEchoEffect";
            }
            if (message.expressiveSendStyleId.includes("CKFireworksEffect")) {
                expressiveSendStyle = "CKFireworksEffect";
            }
            // if(message.expressiveSendStyleId.includes("CKLasersEffect")) {
            //     expressiveSendStyle = "CKLasersEffect";
            // }
            // if(message.expressiveSendStyleId.includes("CKCelebrationEffect")) {
            //     expressiveSendStyle = "CKLasersEffect";
            // }

            // Commented out for now becasue they are not implemented in the UI
        }

        // Figure out the "real string" and then figure out if we need to make it big emojis
        const text = sanitizeStr(message.text);

        if (text.length <= 2 * 3 && !/[a-z? _."'/,$0-9\\]/.test(text.toLowerCase()) && allEmojis(text)) {
            messageClass = "bigEmojis";
        }

        // Parse out any links. We can minimize parsing if we do a simple "contains" first
        if (this.isValidUrl(text) || text.includes("http") || text.includes("Https")) {
            links = parseUrls(text);
        }

        const handleReplayAnimation = async e => {
            if (expressiveSendStyle.includes("CKConfettiEffect" || "CKEchoEffect" || "CKLasersEffect")) {
                this.setState({ playMessageAnimation: true });
                const delay = ms => new Promise(res => setTimeout(res, ms));
                await delay(3000);
                this.setState({ playMessageAnimation: false });
                return;
            }

            if (expressiveSendStyle.includes("CKHeartEffect")) {
                const delay = ms => new Promise(res => setTimeout(res, ms));
                this.setState({ playMessageAnimation: true });
                await delay(50);
                this.handleHearts();
                await delay(3000);
                this.setState({ playMessageAnimation: false });
                return;
            }

            if (expressiveSendStyle.includes("CKEchoEffect")) {
                const delay = ms => new Promise(res => setTimeout(res, ms));
                this.setState({ playMessageAnimation: true });
                await delay(50);
                this.handleEcho();
                await delay(3000);
                this.setState({ playMessageAnimation: false });
                return;
            }

            if (expressiveSendStyle.includes("CKFireworksEffect")) {
                const delay = ms => new Promise(res => setTimeout(res, ms));
                this.setState({ playMessageAnimation: true });
                await delay(50);
                const container = document.getElementById(`fireworksContainer-${message.guid}`);
                const fireworks = new FireworksCanvas(container);
                fireworks.start();
                await delay(3000);
                this.setState({ playMessageAnimation: false });
                return;
            }

            if (expressiveSendStyle.includes("CKHappyBirthdayEffect")) {
                const delay = ms => new Promise(res => setTimeout(res, ms));
                this.setState({ playMessageAnimation: true });
                await delay(50);
                this.createBalloons(100);
                await delay(3000);
                this.setState({ playMessageAnimation: false });
                return;
            }

            if (expressiveSendStyle.includes("CKSpotlightEffect")) {
                const delay = ms => new Promise(res => setTimeout(res, ms));
                this.setState({ playMessageAnimation: true });
                await delay(50);
                this.handleSpotlight();
                await delay(3000);
                this.setState({ playMessageAnimation: false });
                return;
            }

            const messageDiv = document.getElementById(this.props.message.guid);
            messageDiv.classList.remove(expressiveSendStyle);
            const delay = ms => new Promise(res => setTimeout(res, ms));
            await delay(50);
            messageDiv.classList.add(expressiveSendStyle);
        };

        // If a url hostname is in this array, the preview will be forced to only show the favicon instead of the image
        const forceFaviconURLS = ["bluebubbles.app"];

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
                {message.attachments?.length > 0 || links.length > 0 ? (
                    <>
                        {/* If the attachment is a link */}
                        {links.length > 0 ? (
                            <div className={linkClassName}>
                                <div className="linkContainer" onClick={() => openLink(links[0])}>
                                    {linkPrev &&
                                    linkPrev.images.length > 0 &&
                                    !forceFaviconURLS.includes(new URL(links[0]).hostname) ? (
                                        <img src={linkPrev.images[0]} className="Attachment" />
                                    ) : null}
                                    {/* {attachments.map((attachment: AttachmentDownload) =>
                                        this.renderAttachment(attachment)
                                    )} */}
                                    <div
                                        className={`linkBottomDiv ${useTail ? "tail" : ""}`}
                                        style={{
                                            borderRadius:
                                                (linkPrev &&
                                                    linkPrev.images.length === 0 &&
                                                    linkPrev.favicons.length > 0) ||
                                                (linkPrev && forceFaviconURLS.includes(new URL(links[0]).hostname))
                                                    ? "15px"
                                                    : "0 0 15px 15px",
                                            marginTop:
                                                (linkPrev &&
                                                    linkPrev.images.length === 0 &&
                                                    linkPrev.favicons.length > 0) ||
                                                (linkPrev && forceFaviconURLS.includes(new URL(links[0]).hostname))
                                                    ? "3px"
                                                    : "0px"
                                        }}
                                    >
                                        <div
                                            style={{
                                                width:
                                                    linkPrev &&
                                                    linkPrev.images.length > 0 &&
                                                    !forceFaviconURLS.includes(new URL(links[0]).hostname)
                                                        ? "93%"
                                                        : "75%"
                                            }}
                                        >
                                            <p
                                                style={{
                                                    marginTop:
                                                        (linkPrev &&
                                                            linkPrev.images.length === 0 &&
                                                            linkPrev.favicons.length > 0) ||
                                                        (linkPrev &&
                                                            forceFaviconURLS.includes(new URL(links[0]).hostname))
                                                            ? "2px"
                                                            : "0px"
                                                }}
                                            >
                                                {this.state.linkTitle || "Loading ..."}
                                            </p>
                                            <p>{new URL(links[0]).hostname}</p>
                                        </div>
                                        {(linkPrev && linkPrev.images.length === 0 && linkPrev.favicons.length > 0) ||
                                        (linkPrev && forceFaviconURLS.includes(new URL(links[0]).hostname)) ? (
                                            <img src={linkPrev.favicons[0]} className="linkFavicon" />
                                        ) : null}
                                    </div>
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
                                        <div className={className} style={{ marginLeft: useAvatar ? "5px" : "40px" }}>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: message.isFromMe ? "flex-end" : "flex-start"
                                                }}
                                            >
                                                {useAvatar && !message.isFromMe ? (
                                                    <>
                                                        {message.handle.avatar ? (
                                                            <img
                                                                key={message.guid}
                                                                src={message.handle.avatar}
                                                                style={{
                                                                    borderRadius: "50%",
                                                                    marginRight: "10px",
                                                                    minWidth: "25px"
                                                                }}
                                                                height="25px"
                                                                width="25px"
                                                            />
                                                        ) : (
                                                            <>
                                                                {generateReactionsDisplayIconText(message.handle) ===
                                                                "?" ? (
                                                                    <svg
                                                                        style={{
                                                                            marginRight: "10px",
                                                                            minWidth: "25px"
                                                                        }}
                                                                        height="25px"
                                                                        width="25px"
                                                                        viewBox="0 0 1000 1000"
                                                                        key={message.guid}
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
                                                                            <circle
                                                                                cx="50%"
                                                                                cy="50%"
                                                                                r="435"
                                                                                fill="white"
                                                                            />
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
                                                                        style={{
                                                                            marginRight: "10px",
                                                                            minWidth: "25px"
                                                                        }}
                                                                        id="testContact"
                                                                        className="dynamicIcon"
                                                                        height="25px"
                                                                        width="25px"
                                                                        viewBox="0 0 1000 1000"
                                                                        key={message.guid}
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
                                                                            {generateReactionsDisplayIconText(
                                                                                message.handle
                                                                            )}
                                                                        </text>
                                                                    </svg>
                                                                )}
                                                            </>
                                                        )}
                                                    </>
                                                ) : null}
                                                <ClickNHold time={0.8} onClickNHold={() => this.clickNHold(message)}>
                                                    <div
                                                        className={`${expressiveSendStyle} ${messageClass}`}
                                                        id={message.guid}
                                                        style={{ marginBottom: useAvatar ? "3px" : "0" }}
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
                                            {expressiveSendStyle && !expressiveSendStyle.includes("invisibleink") ? (
                                                <>
                                                    {expressiveSendStyle === "CKConfettiEffect" ? (
                                                        <Confetti height="100px" width="100px" />
                                                    ) : null}
                                                    <div
                                                        className="replayMessageEffect"
                                                        onClick={e => handleReplayAnimation(e)}
                                                        style={{
                                                            marginLeft:
                                                                useAvatar && className === "IncomingMessage"
                                                                    ? "35px"
                                                                    : "0px"
                                                        }}
                                                    >
                                                        {expressiveSendStyle === "CKConfettiEffect" &&
                                                        this.state.playMessageAnimation ? (
                                                            <Confetti height={animationHeight} width={animationWidth} />
                                                        ) : null}
                                                        {expressiveSendStyle === "CKFireworksEffect" &&
                                                        this.state.playMessageAnimation ? (
                                                            <div
                                                                id={`fireworksContainer-${message.guid}`}
                                                                style={{
                                                                    top: "35px",
                                                                    left: "290px",
                                                                    position: "absolute",
                                                                    height: animationHeight,
                                                                    width: animationWidth
                                                                }}
                                                            />
                                                        ) : null}
                                                        {expressiveSendStyle === "CKHappyBirthdayEffect" &&
                                                        this.state.playMessageAnimation ? (
                                                            <div
                                                                id={`balloonsContainer-${message.guid}`}
                                                                className="balloon-container"
                                                                style={{
                                                                    top: "35px",
                                                                    left: "290px",
                                                                    position: "absolute",
                                                                    height: animationHeight,
                                                                    width: animationWidth
                                                                }}
                                                            />
                                                        ) : null}
                                                        {expressiveSendStyle === "CKSpotlightEffect" &&
                                                        this.state.playMessageAnimation ? (
                                                            <div
                                                                id={`spotlightContainer-${message.guid}`}
                                                                style={{
                                                                    top: "35px",
                                                                    left: "290px",
                                                                    position: "absolute",
                                                                    zIndex: 999,
                                                                    height: animationHeight,
                                                                    width: animationWidth
                                                                }}
                                                            />
                                                        ) : null}
                                                        {expressiveSendStyle === "CKHeartEffect" &&
                                                        this.state.playMessageAnimation ? (
                                                            <div
                                                                id={`heartContainer-${message.guid}`}
                                                                style={{
                                                                    top: "35px",
                                                                    left: "290px",
                                                                    position: "absolute",
                                                                    zIndex: 999,
                                                                    height: animationHeight,
                                                                    width: animationWidth,
                                                                    overflow: "hidden"
                                                                }}
                                                            />
                                                        ) : null}
                                                        {expressiveSendStyle === "CKEchoEffect" &&
                                                        this.state.playMessageAnimation ? (
                                                            <div
                                                                id={`echoContainer-${message.guid}`}
                                                                style={{
                                                                    top: "35px",
                                                                    left: "290px",
                                                                    position: "absolute",
                                                                    zIndex: 999,
                                                                    height: animationHeight,
                                                                    width: animationWidth,
                                                                    overflow: "hidden"
                                                                }}
                                                            />
                                                        ) : null}
                                                        <svg viewBox="0 0 74.999 74.999" height="10px" width="10px">
                                                            <path
                                                                d="M33.511,71.013c15.487,0,28.551-10.563,32.375-24.859h9.113L61.055,22L47.111,46.151h8.006
                                                            c-3.44,8.563-11.826,14.628-21.605,14.628c-12.837,0-23.28-10.443-23.28-23.28c0-12.836,10.443-23.28,23.28-23.28
                                                            c6.604,0,12.566,2.768,16.809,7.196l5.258-9.108c-5.898-5.176-13.619-8.32-22.065-8.32C15.034,3.987,0,19.019,0,37.5
                                                            C-0.002,55.981,15.03,71.013,33.511,71.013z"
                                                            />
                                                        </svg>
                                                        <p>Replay</p>
                                                    </div>
                                                </>
                                            ) : null}
                                            {showStatus ? getStatusText(message) : null}
                                        </div>
                                    </>
                                ) : null}
                            </>
                        )}
                    </>
                ) : (
                    <>
                        <div className={className} style={{ marginLeft: useAvatar ? "5px" : "40px" }}>
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
                                <p className="MessageSender" style={{ marginLeft: useAvatar ? "38px" : "5px" }}>
                                    {sender}
                                </p>
                            ) : null}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: message.isFromMe ? "flex-end" : "flex-start"
                                }}
                            >
                                {useAvatar && !message.isFromMe ? (
                                    <>
                                        {message.handle.avatar ? (
                                            <img
                                                src={message.handle.avatar}
                                                style={{ borderRadius: "50%", marginRight: "10px", minWidth: "25px" }}
                                                height="25px"
                                                width="25px"
                                            />
                                        ) : (
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
                                                            <linearGradient id="Gradient1" x1="0" x2="0" y1="1" y2="0">
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
                                                                    generateReactionsDisplayIconText(message.handle)
                                                                        .length >= 2
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
                                        )}
                                    </>
                                ) : null}
                                {stickers && message.isFromMe
                                    ? stickers.map(sticker => {
                                          return this.renderAttachment(sticker);
                                      })
                                    : null}
                                <ClickNHold time={0.8} onClickNHold={() => this.clickNHold(message)}>
                                    <div
                                        className={`${expressiveSendStyle} ${messageClass}`}
                                        id={message.guid}
                                        style={{ marginBottom: useAvatar ? "3px" : "0" }}
                                    >
                                        {message.hasReactions === true ? (
                                            <>
                                                {message.reactions.map((reaction, i) => (
                                                    <>
                                                        {reaction.associatedMessageType === "sticker" ? null : null}
                                                        <InChatReaction
                                                            key={reaction.guid}
                                                            isMessageFromMe={message.isFromMe}
                                                            isReactionFromMe={reaction.isFromMe}
                                                            reactionType={reaction.associatedMessageType}
                                                            offset={i}
                                                        />
                                                    </>
                                                ))}
                                            </>
                                        ) : null}
                                        {text ? <p>{text}</p> : null}
                                    </div>
                                </ClickNHold>
                                {stickers && !message.isFromMe
                                    ? stickers.map(sticker => {
                                          return this.renderAttachment(sticker);
                                      })
                                    : null}
                            </div>
                            {expressiveSendStyle && !expressiveSendStyle.includes("invisibleink") ? (
                                <>
                                    <div
                                        className="replayMessageEffect"
                                        onClick={e => handleReplayAnimation(e)}
                                        style={{
                                            marginLeft: useAvatar && className === "IncomingMessage" ? "35px" : "0px"
                                        }}
                                    >
                                        {expressiveSendStyle === "CKConfettiEffect" &&
                                        this.state.playMessageAnimation ? (
                                            <Confetti height={animationHeight} width={animationWidth} />
                                        ) : null}
                                        {expressiveSendStyle === "CKFireworksEffect" &&
                                        this.state.playMessageAnimation ? (
                                            <div
                                                id={`fireworksContainer-${message.guid}`}
                                                style={{
                                                    top: "35px",
                                                    left: "290px",
                                                    position: "absolute",
                                                    height: animationHeight,
                                                    width: animationWidth
                                                }}
                                            />
                                        ) : null}
                                        {expressiveSendStyle === "CKHappyBirthdayEffect" &&
                                        this.state.playMessageAnimation ? (
                                            <div
                                                id={`balloonsContainer-${message.guid}`}
                                                className="balloon-container"
                                                style={{
                                                    top: "35px",
                                                    left: "290px",
                                                    position: "absolute",
                                                    height: animationHeight,
                                                    width: animationWidth
                                                }}
                                            />
                                        ) : null}
                                        {expressiveSendStyle === "CKSpotlightEffect" &&
                                        this.state.playMessageAnimation ? (
                                            <div
                                                id={`spotlightContainer-${message.guid}`}
                                                style={{
                                                    top: "35px",
                                                    left: "290px",
                                                    position: "absolute",
                                                    zIndex: 999,
                                                    height: animationHeight,
                                                    width: animationWidth
                                                }}
                                            />
                                        ) : null}
                                        {expressiveSendStyle === "CKHeartEffect" && this.state.playMessageAnimation ? (
                                            <div
                                                id={`heartContainer-${message.guid}`}
                                                style={{
                                                    top: "35px",
                                                    left: "290px",
                                                    position: "absolute",
                                                    zIndex: 999,
                                                    height: animationHeight,
                                                    width: animationWidth,
                                                    overflow: "hidden"
                                                }}
                                            />
                                        ) : null}
                                        {expressiveSendStyle === "CKEchoEffect" && this.state.playMessageAnimation ? (
                                            <div
                                                id={`echoContainer-${message.guid}`}
                                                style={{
                                                    top: "35px",
                                                    left: "290px",
                                                    position: "absolute",
                                                    zIndex: 999,
                                                    height: animationHeight,
                                                    width: animationWidth,
                                                    overflow: "hidden"
                                                }}
                                            />
                                        ) : null}
                                        <svg viewBox="0 0 74.999 74.999" height="10px" width="10px">
                                            <path
                                                d="M33.511,71.013c15.487,0,28.551-10.563,32.375-24.859h9.113L61.055,22L47.111,46.151h8.006
                                            c-3.44,8.563-11.826,14.628-21.605,14.628c-12.837,0-23.28-10.443-23.28-23.28c0-12.836,10.443-23.28,23.28-23.28
                                            c6.604,0,12.566,2.768,16.809,7.196l5.258-9.108c-5.898-5.176-13.619-8.32-22.065-8.32C15.034,3.987,0,19.019,0,37.5
                                            C-0.002,55.981,15.03,71.013,33.511,71.013z"
                                            />
                                        </svg>
                                        <p>Replay</p>
                                    </div>
                                </>
                            ) : null}
                        </div>
                    </>
                )}
            </>
        );
    }
}

export default MessageBubble;
