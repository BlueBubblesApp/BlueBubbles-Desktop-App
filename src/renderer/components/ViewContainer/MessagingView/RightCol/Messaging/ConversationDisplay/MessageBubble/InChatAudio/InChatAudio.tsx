import { supportedAudioTypes } from "@renderer/helpers/constants";
/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable class-methods-use-this */
/* eslint-disable react/prefer-stateless-function */
/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
import * as React from "react";
import { AttachmentDownload } from "../@types";
import "./InChatAudio.css";

interface Props {
    attachment: AttachmentDownload;
    gradientMessages: boolean;
}

interface State {
    audioLength: any;
    isAudioPlaying: boolean;
    audio: HTMLAudioElement;
}

class InChatAudio extends React.Component<Props, State> {
    constructor(props) {
        super(props);

        this.state = {
            audioLength: null,
            isAudioPlaying: false,
            audio: null
        };
    }

    componentDidMount() {
        const audio = document.getElementById(this.props.attachment.guid) as HTMLAudioElement;

        if (audio) {
            audio.addEventListener("loadedmetadata", () => {
                this.setState({ audioLength: (audio.duration as unknown) as string });
                (document.getElementById(`audioVisProgress${this.props.attachment.guid}`) as HTMLInputElement).value =
                    "0";
                (document.getElementById(
                    `audioVisProgress${this.props.attachment.guid}`
                ) as HTMLInputElement).max = (audio.duration as unknown) as string;
            });

            this.setState({ audio });
            // document.getElementById(`audioVisProgress${this.props.attachment.guid}`).style.width = `${(
            //     (audio.currentTime / audio.duration) *
            //     100
            // ).toString()}%`;
            audio.addEventListener("ended", () => this.setState({ isAudioPlaying: false }), false);
        }
    }

    updateAudioVisProgress = () => {
        const audio = document.getElementById(this.props.attachment.guid) as HTMLAudioElement;
        const inputElement = document.getElementById(
            `audioVisProgress${this.props.attachment.guid}`
        ) as HTMLInputElement;

        const setCSSProperty = () => {
            let percent =
                ((((inputElement.value as unknown) as number) - ((inputElement.min as unknown) as number)) /
                    (((inputElement.max as unknown) as number) - ((inputElement.min as unknown) as number))) *
                100;
            if (percent > 99.5) percent = 100;
            inputElement.style.setProperty("--webkitProgressPercent", `${percent}%`);
        };

        inputElement.value = (audio.currentTime as unknown) as string;
        setCSSProperty();
    };

    calculateTotalValue = length => {
        const minutes = Math.floor(length / 60);
        const secondsInt = length - minutes * 60;
        const secondsStr = secondsInt.toString();
        let seconds;
        if (secondsStr[1] === ".") {
            seconds = `0${secondsStr.substr(0, 1)}`;
            if (seconds === "00" || seconds === "0") {
                seconds = "01";
            }
        } else {
            seconds = secondsStr.substr(0, 2);
        }

        if (seconds < 10 && !seconds.includes("0")) {
            seconds = `0${seconds}`;
        }

        const time = `${minutes}:${seconds}`;

        if (time === "Infinity:Na") {
            return "00:0";
        }
        return time;
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

    audioEnded = () => {
        this.setState({ isAudioPlaying: false });
    };

    render() {
        const { attachment } = this.props;
        let mime = attachment.mimeType;
        if (!supportedAudioTypes.includes(mime)) mime = "audio/mp3";

        return (
            <>
                <audio
                    key={`audioVisProgress${attachment.guid}`}
                    id={attachment.guid}
                    className="Attachment"
                    onTimeUpdate={() => this.updateAudioVisProgress()}
                >
                    <source src={`data:${mime};base64,${attachment.data}`} type={mime} />
                </audio>
                <div
                    key={attachment.guid}
                    className={`${
                        attachment.isOutgoing ? "OutgoingAudioAttachmentControls" : "IncomingAudioAttachmentControls"
                    } ${this.props.gradientMessages ? "gradientMessages" : ""}`}
                    style={{ opacity: attachment.guid.includes("temp") ? 0.6 : 1 }}
                >
                    <div className="toggleAudioPlayPause" onClick={() => this.toggleAudio()}>
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
                    <input
                        onChange={e => {
                            (document.getElementById(attachment.guid) as HTMLAudioElement).currentTime = (e.target
                                .value as unknown) as number;
                        }}
                        className="audioVisPrev"
                        id={`audioVisProgress${attachment.guid}`}
                        type="range"
                        step=".1"
                        min="0"
                        max=""
                    />
                    <div className="audioLengthDisplay">
                        {this.state.audio ? (
                            <p>{this.calculateTotalValue(Math.round(this.state.audioLength))}</p>
                        ) : (
                            <p>.:..</p>
                        )}
                    </div>
                </div>
            </>
        );
    }
}

export default InChatAudio;
