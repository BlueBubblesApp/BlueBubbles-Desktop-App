/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable max-len */
import * as React from "react";
import "./AudioDisplay.css";
import { Attachment, Chat } from "@server/databases/chat/entity";
import { getSender, generateDetailsIconText } from "@renderer/helpers/utils";
import { ipcRenderer } from "electron";
import { supportedAudioTypes } from "@renderer/helpers/constants";
import { AttachmentDownload } from "../../../Messaging/ConversationDisplay/MessageBubble/@types";

interface Props {
    attachment: AttachmentDownload;
}

interface State {
    isAudioPlaying: boolean;
    audio: HTMLAudioElement;
    audioLength: string;
}

class AudioDisplay extends React.Component<Props, State> {
    constructor(props) {
        super(props);

        this.state = {
            isAudioPlaying: false,
            audio: null,
            audioLength: null
        };
    }

    componentDidMount() {
        const audio = document.getElementById(this.props.attachment.guid) as HTMLAudioElement;
        console.log(audio);

        audio.addEventListener("loadedmetadata", () => {
            this.setState({ audioLength: (audio.duration as unknown) as string });
        });

        this.setState({ audio });

        const audioEnded = () => {
            this.setState({ isAudioPlaying: false });
        };

        if (audio) {
            console.log(audio);
            document.getElementById(`audioVisProgress${this.props.attachment.guid}`).style.width = `${(
                (audio.currentTime / audio.duration) *
                100
            ).toString()}%`;
            audio.addEventListener("ended", () => this.setState({ isAudioPlaying: false }), false);
        }
    }

    updateAudioVisProgress = () => {
        const audio = document.getElementById(this.props.attachment.guid) as HTMLAudioElement;
        document.getElementById(`audioVisProgress${this.props.attachment.guid}`).style.width = `${(
            (audio.currentTime / audio.duration) *
            100
        ).toString()}%`;
    };

    togglePause = () => {
        const audio = document.getElementById(this.props.attachment.guid) as HTMLAudioElement;
        this.setState({ isAudioPlaying: false });
        audio.pause();
    };

    togglePlay = () => {
        const audio = document.getElementById(this.props.attachment.guid) as HTMLAudioElement;
        this.setState({ isAudioPlaying: true });
        audio.play();
    };

    toggleAudio = () => {
        const audio = document.getElementById(this.props.attachment.guid) as HTMLAudioElement;

        if (audio.paused) {
            this.setState({ isAudioPlaying: true });
            audio.play();
            return;
        }
        this.setState({ isAudioPlaying: false });
        audio.pause();
    };

    calculateTotalValue = length => {
        const minutes = Math.floor(length / 60);
        const secondsInt = length - minutes * 60;
        const secondsStr = secondsInt.toString();
        let seconds;
        if (secondsStr[1] === ".") {
            seconds = `0${secondsStr.substr(0, 1)}`;
            if (seconds === "00") {
                seconds = "01";
            }
        } else {
            seconds = secondsStr.substr(0, 2);
        }
        const time = `${minutes}:${seconds}`;
        return time;
    };

    render() {
        let mime = this.props.attachment.mimeType;
        if (!supportedAudioTypes.includes(mime)) mime = "audio/mp3";

        return (
            <div className="aChatAttachment" key={this.props.attachment.guid}>
                <div className="aAudio">
                    <div
                        className="toggleAudioPlayPause"
                        onClick={() => {
                            this.toggleAudio();
                        }}
                    >
                        {this.state.isAudioPlaying ? (
                            <svg height="100%" width="100%" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="transparent" stroke="white" strokeWidth="5" />
                                <rect x="30" y="26" width="15" height="46" rx="5" fill="white" />
                                <rect x="55" y="26" width="15" height="46" rx="5" fill="white" />
                            </svg>
                        ) : (
                            <svg height="100%" width="100%" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="transparent" stroke="white" strokeWidth="5" />
                                <polygon points="35,25 35,75 75,50" fill="white" />
                            </svg>
                        )}
                    </div>
                    <div className="audioVisPrev">
                        <div className="audioVisProgress" id={`audioVisProgress${this.props.attachment.guid}`} />
                    </div>
                    <div className="audioLengthDisplay">
                        {this.state.audio ? <p>{this.calculateTotalValue(this.state.audioLength)}</p> : <p>.:..</p>}
                    </div>
                    <audio
                        key={`audioVisProgress${this.props.attachment.guid}`}
                        id={this.props.attachment.guid}
                        onTimeUpdate={() => this.updateAudioVisProgress()}
                    >
                        <source src={`data:${mime};base64,${this.props.attachment.data}`} type={mime} />
                    </audio>
                </div>
                <div>
                    <p>{this.props.attachment.transferName}</p>
                </div>
            </div>
        );
    }
}

export default AudioDisplay;
