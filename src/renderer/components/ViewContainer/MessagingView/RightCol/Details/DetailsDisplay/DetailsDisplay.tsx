/* eslint-disable react/sort-comp */
/* eslint-disable prefer-template */
/* eslint-disable no-unused-expressions */
/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable react/prefer-stateless-function */
/* eslint-disable max-len */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/self-closing-comp */
import * as React from "react";
import * as path from "path";
import * as fs from "fs";
import { Attachment, Chat, Message } from "@server/databases/chat/entity";
import { getSender, generateDetailsIconText, parseAppleLocation } from "@renderer/helpers/utils";
import "./DetailsDisplay.css";
import { Map, Marker, TileLayer } from "react-leaflet";
import { ipcRenderer, remote } from "electron";
import { supportedVideoTypes, supportedAudioTypes } from "@renderer/helpers/constants";
import CloseIcon from "@renderer/components/TitleBar/close.png";
import UnknownImage from "@renderer/assets/img/unknown_img.png";
import { AttachmentDownload } from "../../Messaging/ConversationDisplay/MessageBubble/@types";
import DetailContact from "./Contact/DetailContact";
import DownloadProgress from "../../Messaging/ConversationDisplay/MessageBubble/DownloadProgress/DownloadProgress";
import UnsupportedMedia from "../../Messaging/ConversationDisplay/MessageBubble/UnsupportedMedia";
import AudioDisplay from "./AudioDisplay/AudioDisplay";
import BubbleChatIcons from "./BubbleChatIcons/BubbleChatIcons";

interface Props {
    chat: Chat;
}

interface State {
    showAllContacts: boolean;
    attachments: AttachmentDownload[];
    isChatMuted: boolean;
}

let subdir = "";
if (process.env.NODE_ENV !== "production") subdir = "BlueBubbles-Desktop-App";
const baseDir = path.join(remote.app.getPath("userData"), subdir);
const attachmentsDir = path.join(baseDir, "Attachments");

class DetailsDisplay extends React.Component<Props, State> {
    constructor(props) {
        super(props);

        this.state = {
            showAllContacts: false,
            attachments: [],
            isChatMuted: false
        };
    }

    async componentDidMount() {
        const config = await ipcRenderer.invoke("get-config");

        if (config.allMutedChats.includes(this.props.chat.guid)) {
            this.setState({ isChatMuted: true });
        }

        if (this.props.chat.participants.length > 5) {
            this.setState({ showAllContacts: false });
        }

        const messages: Message[] = await ipcRenderer.invoke("get-messages", {
            chatGuid: this.props.chat.guid,
            withHandle: true,
            withAttachments: true,
            withChat: false,
            limit: 150,
            after: 1,
            before: new Date().getTime(),
            where: []
        });

        const attachments: AttachmentDownload[] = [];
        for (const message of messages) {
            let idx = 0;
            for (const attachment of message.attachments) {
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
                if (item.progress === 100) item.data = this.loadAttachmentData(item as AttachmentDownload);

                // Add the attachment to the UI
                attachments.push(item as AttachmentDownload);
                idx += 1;
            }
        }

        await new Promise((resolve, _) => this.setState({ attachments }, () => resolve(null)));
    }

    isSupportedMime = (mimeType: string) => {
        if (!mimeType || mimeType.startsWith("image")) return true;
        return mimeType.startsWith("audio") || mimeType.startsWith("video") || ["text/x-vlocation"].includes(mimeType);
    };

    loadAttachmentData = (attachment: AttachmentDownload) => {
        if (!this.isSupportedMime(attachment.mimeType)) return null;
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

    openAttachment = attachmentPath => {
        ipcRenderer.invoke("open-attachment", attachmentPath);
    };

    setFallbackImage = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = UnknownImage;
    };

    toggleShowAllContacts() {
        this.setState({ showAllContacts: !this.state.showAllContacts });
    }

    renderAttachment = (attachment: AttachmentDownload) => {
        if (attachment.progress === 100) {
            const attachmentPath = `${attachmentsDir}/${attachment.guid}/${attachment.transferName}`;

            // Render based on mime type
            if (!attachment.mimeType || attachment.mimeType.startsWith("image")) {
                const mime = attachment.mimeType ?? "image/pluginPayloadAttachment";
                return (
                    <div
                        className="aChatAttachment"
                        key={attachment.guid}
                        onClick={attachment.mimeType ? () => this.openAttachment(attachmentPath) : null}
                    >
                        <div>
                            <img
                                src={`data:${mime};base64,${attachment.data}`}
                                alt={attachment.transferName}
                                onError={this.setFallbackImage}
                            />
                        </div>
                        <div>
                            <p>{attachment.transferName}</p>
                        </div>
                    </div>
                );
            }

            if (attachment.mimeType.startsWith("video") && attachment.data) {
                let mime = attachment.mimeType;
                if (!supportedVideoTypes.includes(mime)) mime = "video/mp4";
                return (
                    <div
                        className="aChatAttachment"
                        key={attachment.guid}
                        onClick={attachment.mimeType ? () => this.openAttachment(attachmentPath) : null}
                    >
                        <div>
                            <video autoPlay muted loop>
                                <source src={`data:${mime};base64,${attachment.data}`} type={mime} />
                            </video>
                        </div>
                        <div>
                            <p>{attachment.transferName}</p>
                        </div>
                    </div>
                );
            }

            if (attachment.mimeType.startsWith("audio") && attachment.data) {
                return <AudioDisplay attachment={attachment} />;
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
                <div
                    className="aChatAttachment"
                    key={attachment.guid}
                    onClick={attachment.mimeType ? () => this.openAttachment(attachmentPath) : null}
                >
                    <div className="aUnsupported">
                        <p>No Preview</p>
                    </div>
                    <div>
                        <p>{attachment.transferName}</p>
                    </div>
                </div>
            );
        }

        return <DownloadProgress key={`${attachment.guid}-in-progress`} attachment={attachment} />;
    };

    toggleChatMuted = async () => {
        this.setState({ isChatMuted: !this.state.isChatMuted });

        const config = await ipcRenderer.invoke("get-config");
        let finalMuteString = "";
        const x = config.allMutedChats.split(",");

        console.log(x);

        // If the chat is already in the mute string, remove it
        if (x.includes(this.props.chat.guid)) {
            x.splice(x.indexOf(this.props.chat.guid), 1);
        } else {
            x.push(this.props.chat.guid);
        }

        finalMuteString = x.join();

        console.log(finalMuteString);

        const newConfig = { allMutedChats: finalMuteString };
        await ipcRenderer.invoke("set-config", newConfig);
    };

    render() {
        const participants = {
            initials: this.props.chat.participants.map(handle => getSender(handle)),
            avatars: this.props.chat.participants.map(handle => handle.avatar),
            addresses: this.props.chat.participants.map(handle => handle.address)
        };
        const bubbleIconInitials = generateDetailsIconText(this.props.chat);

        const generateBubbleTitle = () => {
            if (this.props.chat.displayName) return this.props.chat.displayName;
            console.log(participants);
            let finalString = "";

            if (participants.initials.length === 1) {
                [finalString] = participants.initials;
                return finalString;
            }

            participants.initials.forEach((name, i) => {
                if (!name || name === "undefined") return;
                if (i >= 3) return;
                if (i === participants.initials.length - 1) {
                    finalString += "and " + participants.initials[i];
                    return;
                }
                finalString += participants.initials[i] + ", ";
            });

            if (participants.initials.length > 3) {
                finalString += " ...";
            }

            return finalString;
        };

        return (
            <div id="messageView-DetailsDisplay">
                <div id="participantsBubblesContainer">
                    <BubbleChatIcons participants={participants} bubbleIconInitials={bubbleIconInitials} />
                    <div id="bubbleChatTitle">
                        <p>{generateBubbleTitle()}</p>
                    </div>
                </div>
                <>
                    {participants ? (
                        <div id="detailContactsContainer">
                            {this.state.showAllContacts
                                ? participants.initials.map((name, i) => (
                                      <DetailContact
                                          key={this.props.chat.participants[i].address}
                                          name={name}
                                          chat={this.props.chat}
                                          index={i}
                                          address={this.props.chat.participants[i].address}
                                      />
                                  ))
                                : participants.initials
                                      .slice(0, 5)
                                      .map((name, i) => (
                                          <DetailContact
                                              key={this.props.chat.participants[i].address}
                                              name={name}
                                              chat={this.props.chat}
                                              index={i}
                                              address={this.props.chat.participants[i].address}
                                          />
                                      ))}
                            {participants.initials.length > 5 ? (
                                <div id="showMore" onClick={() => this.toggleShowAllContacts()}>
                                    <div id="showMoreWrap">
                                        {this.state.showAllContacts ? (
                                            <p>Hide</p>
                                        ) : (
                                            <p>Show More ({participants.initials.length - 5})</p>
                                        )}
                                    </div>
                                </div>
                            ) : null}
                            <div id="addContact">
                                <div id="addContactWrap">
                                    <p id="addContactTitle">+ Add Contact</p>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </>
                <div id="muteChat">
                    <div id="muteChatWrap">
                        <div id="muteChatLeft">
                            <p>Mute Chat</p>
                        </div>
                        <div id="muteChatRight" onClick={() => this.toggleChatMuted()}>
                            <label className="form-switch">
                                <input
                                    type="checkbox"
                                    checked={this.state.isChatMuted}
                                    onChange={() => this.toggleChatMuted()}
                                />
                                <i></i>
                            </label>
                        </div>
                    </div>
                </div>
                <div id="recentImagesContainer">
                    {this.state.attachments.length > 0 ? (
                        <div id="recentImages">
                            {this.state.attachments.map((attachment: AttachmentDownload) =>
                                this.renderAttachment(attachment)
                            )}
                        </div>
                    ) : (
                        <p>No Attachments</p>
                    )}
                </div>
            </div>
        );
    }
}

export default DetailsDisplay;
