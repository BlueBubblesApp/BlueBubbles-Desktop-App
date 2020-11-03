/* eslint-disable no-unused-expressions */
/* eslint-disable lines-between-class-members */
/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable react/sort-comp */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable max-len */
/* eslint-disable class-methods-use-this */
import * as React from "react";
import * as fs from "fs";
import "./NewMessageBottomNav.css";
import { desktopCapturer, ipcRenderer, StringProtocolResponse } from "electron";
import CloseIcon from "@renderer/components/TitleBar/close.png";
import { FileSystem } from "@server/fileSystem";
import { Attachment } from "@server/databases/chat/entity";
import { generateUuid } from "@renderer/helpers/utils";
import AudioAnalyser from "./AudioVisualizer/AudioVisualizer";
import SendIcon from "../../../../../../assets/icons/send-icon.png";

const { dialog } = require("electron").remote;

interface NewMessageBottomNavState {
    enteredMessage: string;
    isRecording: boolean;
    attachmentPaths: string[];
    audioHasData: boolean;
    audioData: any;
    isAudioPlaying: boolean;
    audioLength: string;
    tempAudioFilePath: string;
    capitalizeFirstLetter: boolean;
    showSpellingContextMenu: boolean;
    contextX: number;
    selectedWord: string;
    sug1: string;
    sug2: string;
    sug3: string;
    showGIFSelector: boolean;
}

declare const MediaRecorder: any;

class NewMessageBottomNav extends React.Component<object, NewMessageBottomNavState> {
    audioContext: any;
    analyser: any;
    dataArray: Uint8Array;
    source: any;
    rafId: number;

    constructor(props) {
        super(props);

        this.state = {
            enteredMessage: "",
            isRecording: false,
            attachmentPaths: [],
            audioHasData: false,
            audioData: new Uint8Array(0),
            isAudioPlaying: false,
            audioLength: null,
            tempAudioFilePath: null,
            capitalizeFirstLetter: null,
            showSpellingContextMenu: false,
            contextX: null,
            selectedWord: null,
            sug1: null,
            sug2: null,
            sug3: null,
            showGIFSelector: false
        };

        this.tick = this.tick.bind(this);
    }

    async componentDidMount() {
        const config = await ipcRenderer.invoke("get-config");
        this.setState({ capitalizeFirstLetter: config.capitalizeFirstLetter });

        const input = document.getElementById("messageFieldInput-NewMessage") as HTMLInputElement;

        ipcRenderer.on("word-matches", (_, matches) => {
            console.log(matches);
            this.setState({
                showSpellingContextMenu: true,
                sug1: matches.ratings[0] ? matches.ratings[0].target : null,
                sug2: matches.ratings[1] ? matches.ratings[1].target : null,
                sug3: matches.ratings[2] ? matches.ratings[2].target : null
            });
        });

        input.addEventListener("contextmenu", async event => {
            this.setState({ showSpellingContextMenu: false, sug1: null, sug2: null, sug3: null });
            console.log(input.value.substring(input.selectionStart, input.selectionEnd));

            const selectedWord = input.value.substring(input.selectionStart, input.selectionEnd);
            this.setState({ selectedWord });

            ipcRenderer.invoke("get-spelling-suggestions", selectedWord);
            this.setState({ contextX: event.clientX });
        });

        input.addEventListener("keydown", (event: any) => {
            if (this.state.showSpellingContextMenu) {
                this.setState({ showSpellingContextMenu: false, sug1: null, sug2: null, sug3: null });
            }

            if (event.key === "Enter") {
                event.preventDefault();
                this.sendMessage();
            }

            if (event.key === "Backspace" && input.selectionStart === 1) {
                this.setState({ capitalizeFirstLetter: false });
            }

            if (
                event.key === "Backspace" &&
                this.state.attachmentPaths.length > 0 &&
                this.state.enteredMessage.length === 0
            ) {
                this.setState({ attachmentPaths: this.state.attachmentPaths.slice(0, -1) });
            }
        });

        input.addEventListener("paste", async event => {
            const myClipboard = await ipcRenderer.invoke("read-clipboard");
            console.log(myClipboard);
            event.preventDefault();

            if (myClipboard.filePath) {
                const attachmentPathsCopy = this.state.attachmentPaths;
                attachmentPathsCopy.push(myClipboard.filePath);
                this.setState({ attachmentPaths: attachmentPathsCopy });
            }
        });

        input.addEventListener("click", async event => {
            this.setState({ showSpellingContextMenu: false, sug1: null, sug2: null, sug3: null });
        });

        document.getElementById("messageView-NewMessage").addEventListener("click", async event => {
            this.setState({ showSpellingContextMenu: false, sug1: null, sug2: null, sug3: null });
        });

        ipcRenderer.on("focused", (_, args) => {
            try {
                document.getElementsByClassName("RightBottomNav")[0].classList.remove("RightBottomNavBlurred");
            } catch {
                /* Nothing */
            }
        });

        ipcRenderer.on("blurred", (_, args) => {
            try {
                document.getElementsByClassName("RightBottomNav")[0].classList.add("RightBottomNavBlurred");
            } catch {
                /* Nothing */
            }
        });

        ipcRenderer.on("chat-drop-event", (_, args) => {
            console.log(args);
            console.log("here");
            if (args.attachment) {
                const { attachmentPaths } = this.state;
                attachmentPaths.push(args.attachment);
                this.setState({ attachmentPaths });
                return;
            }
            if (args.text) {
                let { enteredMessage } = this.state;
                enteredMessage += args.text;
                this.setState({ enteredMessage });
            }
        });
    }

    componentWillUnmount() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
        if (this.analyser) {
            this.analyser.disconnect();
        }
        if (this.source) {
            this.source.disconnect();
        }
    }

    handleMessageChange = event => {
        if (this.state.showGIFSelector) {
            ipcRenderer.invoke("send-to-ui", { event: "giphy-search-term", contents: event.target.value });
        }

        // Capitalize the first letter of input
        if (this.state.capitalizeFirstLetter) {
            this.setState({
                enteredMessage: event.target.value.charAt(0).toUpperCase() + event.target.value.slice(1)
            });
            return;
        }

        this.setState({
            enteredMessage: event.target.value
        });
    };

    async sendMessage() {
        const config = await ipcRenderer.invoke("get-config");

        if (config.capitalizeFirstLetter) {
            this.setState({ capitalizeFirstLetter: true });
        }

        if (this.state.enteredMessage.length === 0 && this.state.attachmentPaths.length === 0) return;

        if (this.state.attachmentPaths.length > 0 || this.state.enteredMessage.length > 0) {
            const payload = { message: this.state.enteredMessage.trim(), attachmentPaths: this.state.attachmentPaths };
            ipcRenderer.invoke("send-to-ui", {
                event: "send-message-to-new-chat",
                contents: payload
            });
        }
    }

    async handleAddAttachment() {
        const dialogReturn = await dialog.showOpenDialog({
            properties: ["openFile"]
        });

        const chosenFiles = dialogReturn.filePaths;
        const attachmentPathsCopy = this.state.attachmentPaths;

        chosenFiles.forEach(filePath => {
            attachmentPathsCopy.push(filePath);
        });
        this.setState({ attachmentPaths: attachmentPathsCopy });
        document.getElementById("messageFieldInput-NewMessage").focus();
    }

    handleRecordEnter() {
        const bar1 = document.getElementById("bar1");
        const bar2 = document.getElementById("bar2");
        const bar3 = document.getElementById("bar3");
        const bar4 = document.getElementById("bar4");
        const bar5 = document.getElementById("bar5");
        const bar6 = document.getElementById("bar6");

        bar1.classList.add("bar1Hover");
        bar2.classList.add("bar2Hover");
        bar3.classList.add("bar3Hover");
        bar4.classList.add("bar4Hover");
        bar5.classList.add("bar5Hover");
        bar6.classList.add("bar6Hover");
    }

    handleRecordLeave() {
        const bar1 = document.getElementById("bar1");
        const bar2 = document.getElementById("bar2");
        const bar3 = document.getElementById("bar3");
        const bar4 = document.getElementById("bar4");
        const bar5 = document.getElementById("bar5");
        const bar6 = document.getElementById("bar6");

        bar1.classList.remove("bar1Hover");
        bar2.classList.remove("bar2Hover");
        bar3.classList.remove("bar3Hover");
        bar4.classList.remove("bar4Hover");
        bar5.classList.remove("bar5Hover");
        bar6.classList.remove("bar6Hover");
    }

    openAttachment(attachmentPath) {
        ipcRenderer.invoke("open-attachment", attachmentPath);
    }

    removeAttachment(attachmentPath) {
        const x = this.state.attachmentPaths;
        x.splice(x.indexOf(attachmentPath, 0), 1);
        this.setState({ attachmentPaths: x });
    }

    async openEmojiPicker() {
        await document.getElementById("messageFieldInput-NewMessage").focus();
        ipcRenderer.invoke("open-emoji-picker");
    }

    async startRecording() {
        this.setState({
            isRecording: true
        });

        // Have to wait for el to be in dom
        const delay = ms => new Promise(res => setTimeout(res, ms));
        await delay(50);

        const el = document.getElementById("secondsCounter");
        let timer = 0;
        let interval;

        const convertSecondstoTime = givenSeconds => {
            if (this.state.isRecording === false && this.state.audioHasData) {
                clearInterval(interval);
            }

            const dateObj = new Date(givenSeconds * 1000);
            const minutes = dateObj.getUTCMinutes();
            const seconds = dateObj.getSeconds();

            const timeString = `${minutes.toString().padStart(1, "0")}:${seconds.toString().padStart(2, "0")}`;
            el.innerText = timeString;
            this.setState({ audioLength: timeString });
        };

        function incrementSeconds() {
            timer += 1;
            convertSecondstoTime(timer);
        }
        interval = setInterval(incrementSeconds, 1000);

        this.startMic();
    }

    stopRecording() {
        this.setState({ isRecording: false });
    }

    startMic() {
        desktopCapturer.getSources({ types: ["screen"] }).then(async sources => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: false
                });
                console.log(stream);
                this.handleStream(stream);
            } catch (e) {
                this.handleError(e);
            }
        });
    }

    tick() {
        this.analyser.getByteTimeDomainData(this.dataArray);
        this.setState({ audioData: this.dataArray });
        this.rafId = requestAnimationFrame(this.tick);
    }

    handleStream(stream: MediaStream) {
        this.audioContext = new window.AudioContext();
        this.analyser = this.audioContext.createAnalyser();
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.source = this.audioContext.createMediaStreamSource(stream);
        this.source.connect(this.analyser);
        this.rafId = requestAnimationFrame(this.tick);

        let chunks = [];

        const stopButton = document.getElementById("stopVoiceMessage");
        // const startButton = document.getElementById("recordVoiceMessage");

        const audioRec = new MediaRecorder(stream);

        audioRec.start();

        stopButton.onclick = e => {
            audioRec.stop();
        };

        // startButton.onclick = (e) => {
        //     audioRec.start();
        //     console.log(audioRec.state);
        //     console.log("recorder started");
        // }

        audioRec.onstop = async e => {
            const audio = document.getElementById("myAudioDiv") as HTMLAudioElement;

            const audioEnded = () => {
                this.setState({ isAudioPlaying: false });
            };

            let audioLength;
            if (audio) {
                const audioCurrentLength = audio.currentTime;
                audioLength = audio.duration;
                document.getElementById(`audioVisProgress-Message`).style.width = `${(
                    (audioCurrentLength / audioLength) *
                    100
                ).toString()}%`;
                audio.addEventListener(
                    "ended",
                    function() {
                        audioEnded();
                    },
                    false
                );
            }

            const blob = new Blob(chunks, { type: "audio/m4a;" });
            console.log("Saving Blob");
            const data = new Uint8Array(await blob.arrayBuffer());
            const newFilePath = await ipcRenderer.invoke("save-blob", data);
            this.setState({ tempAudioFilePath: newFilePath });
            console.log(newFilePath);
            chunks = [];
            const audioURL = URL.createObjectURL(blob);
            audio.src = audioURL;
        };

        audioRec.ondataavailable = e2 => {
            if (e2.data) {
                this.setState({ audioHasData: true });
                chunks.push(e2.data);
            }
        };
    }

    deleteAudio() {
        try {
            fs.unlinkSync(this.state.tempAudioFilePath);
        } catch (err) {
            console.error(err);
        }
        this.setState({
            isRecording: false,
            audioData: null,
            audioHasData: false,
            isAudioPlaying: false,
            audioLength: null,
            tempAudioFilePath: null
        });
    }

    handleError(e) {
        console.log(e);
    }

    togglePlay() {
        const audio = document.getElementById("myAudioDiv") as HTMLAudioElement;

        this.setState({ isAudioPlaying: true });
        audio.play();
    }

    togglePause() {
        const audio = document.getElementById("myAudioDiv") as HTMLAudioElement;

        this.setState({ isAudioPlaying: false });
        audio.pause();
    }

    async addAudioToChat() {
        const { tempAudioFilePath, attachmentPaths } = this.state;

        const attachmentPathsCopy = new Array<string>();
        attachmentPaths.forEach(path => {
            attachmentPathsCopy.push(path);
        });

        attachmentPathsCopy.push(tempAudioFilePath);

        this.setState({
            attachmentPaths: attachmentPathsCopy,
            isRecording: false,
            audioHasData: null,
            audioData: null
        });
    }

    render() {
        let audio = document.getElementById("myAudioDiv") as HTMLAudioElement;

        const updateAudioVisProgress = () => {
            audio = document.getElementById("myAudioDiv") as HTMLAudioElement;
            document.getElementById(`audioVisProgress-Message`).style.width = `${(
                (audio.currentTime / audio.duration) *
                100
            ).toString()}%`;
        };

        return (
            <div className="RightBottomNav-NewMessage">
                {this.state.isRecording || this.state.audioHasData ? (
                    <>
                        {this.state.audioHasData ? (
                            <div id="recordMessageDiv">
                                <div id="recordingVisWrap">
                                    <div id="recordingVis">
                                        <audio
                                            id="myAudioDiv"
                                            style={{ display: "none" }}
                                            onTimeUpdate={() => updateAudioVisProgress()}
                                        />
                                        <div
                                            className="toggleAudioPlayPause"
                                            onClick={() => {
                                                !this.state.isAudioPlaying ? this.togglePlay() : this.togglePause();
                                            }}
                                            style={{ marginLeft: "0" }}
                                        >
                                            {this.state.isAudioPlaying ? (
                                                <svg height="100%" width="100%" viewBox="0 0 100 100">
                                                    <circle cx="50" cy="50" r="45" fill="transparent" strokeWidth="5" />
                                                    <rect x="30" y="26" width="15" height="46" rx="5" />
                                                    <rect x="55" y="26" width="15" height="46" rx="5" />
                                                </svg>
                                            ) : (
                                                <svg height="100%" width="100%" viewBox="0 0 100 100">
                                                    <circle cx="50" cy="50" r="45" fill="transparent" strokeWidth="5" />
                                                    <polygon points="35,25 35,75 75,50" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="audioVisPrev-Message">
                                            <div className="audioVisProgress" id="audioVisProgress-Message" />
                                        </div>
                                    </div>
                                    <div id="recordingLengthDiv">
                                        <p id="secondsCounter">{this.state.audioLength}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div id="recordMessageDiv">
                                <div id="recordingVisWrap">
                                    <div id="recordingVis">
                                        <AudioAnalyser audioData={this.state.audioData} />
                                    </div>
                                    <div id="recordingLengthDiv">
                                        <p id="secondsCounter">0:00</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {this.state.showSpellingContextMenu ? (
                            <div id="spellingContextMenu" style={{ left: `${this.state.contextX - 15}px` }}>
                                <div>
                                    {this.state.sug1 ? (
                                        <p
                                            onClick={() => {
                                                this.setState({
                                                    enteredMessage: this.state.enteredMessage.replace(
                                                        this.state.selectedWord,
                                                        this.state.sug1
                                                    ),
                                                    showSpellingContextMenu: false,
                                                    sug1: null,
                                                    sug2: null,
                                                    sug3: null
                                                });
                                                document.getElementById("messageFieldInput-NewMessage").focus();
                                            }}
                                        >
                                            {this.state.sug1}
                                        </p>
                                    ) : null}
                                    {this.state.sug2 ? (
                                        <p
                                            onClick={() => {
                                                this.setState({
                                                    enteredMessage: this.state.enteredMessage.replace(
                                                        this.state.selectedWord,
                                                        this.state.sug2
                                                    ),
                                                    showSpellingContextMenu: false,
                                                    sug1: null,
                                                    sug2: null,
                                                    sug3: null
                                                });
                                                document.getElementById("messageFieldInput-NewMessage").focus();
                                            }}
                                        >
                                            {this.state.sug2}
                                        </p>
                                    ) : null}
                                    {this.state.sug3 ? (
                                        <p
                                            onClick={() => {
                                                this.setState({
                                                    enteredMessage: this.state.enteredMessage.replace(
                                                        this.state.selectedWord,
                                                        this.state.sug3
                                                    ),
                                                    showSpellingContextMenu: false,
                                                    sug1: null,
                                                    sug2: null,
                                                    sug3: null
                                                });
                                                document.getElementById("messageFieldInput-NewMessage").focus();
                                            }}
                                        >
                                            {this.state.sug3}
                                        </p>
                                    ) : null}
                                </div>
                                <img
                                    src={CloseIcon}
                                    onClick={() =>
                                        this.setState({
                                            showSpellingContextMenu: false,
                                            sug1: null,
                                            sug2: null,
                                            sug3: null
                                        })
                                    }
                                />
                            </div>
                        ) : null}
                        {this.state.showGIFSelector ? (
                            <img id="giphyFullLogo" src={require("@renderer/assets/giphy-logo.png")} />
                        ) : (
                            <>
                                <div id="leftAttachmentButton" onClick={() => this.handleAddAttachment()}>
                                    <svg id="attachIcon" viewBox="0 0 25 25">
                                        <path d="M7.46,25a7.57,7.57,0,0,1-5.19-2l-.09-.08a6.72,6.72,0,0,1,0-9.9L15,1.42a5.46,5.46,0,0,1,7.35,0A4.88,4.88,0,0,1,24,5a4.83,4.83,0,0,1-1.56,3.54L10.38,19.41A3.23,3.23,0,0,1,6,19.4a2.91,2.91,0,0,1,0-4.3L17.27,5l1.33,1.49L7.35,16.57a.91.91,0,0,0-.29.66.93.93,0,0,0,.31.68,1.23,1.23,0,0,0,1.66,0L21.09,7.11a2.81,2.81,0,0,0,0-4.16,3.45,3.45,0,0,0-4.69-.06L3.53,14.46a4.72,4.72,0,0,0,0,7l.09.08a5.65,5.65,0,0,0,7.63,0L23.33,10.69l1.34,1.49L12.62,23A7.53,7.53,0,0,1,7.46,25Z" />
                                    </svg>
                                </div>
                                <img
                                    id="openGIFSelector"
                                    onClick={() => {
                                        this.setState({ enteredMessage: "", showGIFSelector: true });
                                        ipcRenderer.invoke("send-to-ui", {
                                            event: "toggle-giphy-selector",
                                            contents: true
                                        });
                                    }}
                                    src={require("@renderer/assets/giphy-logo-circle.png")}
                                    style={{ height: "26px", marginLeft: "7px" }}
                                />
                            </>
                        )}
                        <div id="messageField-NewMessage">
                            {this.state.attachmentPaths.length > 0
                                ? this.state.attachmentPaths.map(filePath => (
                                      <div className="aNewAttachmentDiv" key={filePath}>
                                          <div>
                                              {filePath.split(".").pop() === "jpg" ||
                                              filePath.split(".").pop() === "jpeg" ||
                                              filePath.split(".").pop() === "png" ||
                                              filePath.split(".").pop() === "svg" ||
                                              filePath.split(".").pop() === "gif" ||
                                              filePath.split(".").pop() === "tiff" ? (
                                                  <img
                                                      className="aNewAttachment"
                                                      src={`data:image;base64,${fs
                                                          .readFileSync(filePath)
                                                          .toString("base64")}`}
                                                      onClick={() => this.openAttachment(filePath)}
                                                  />
                                              ) : null}
                                              {filePath.split(".").pop() === "mp4" ||
                                              filePath.split(".").pop() === "m4a" ||
                                              filePath.split(".").pop() === "mpg" ||
                                              filePath.split(".").pop() === "avi" ||
                                              filePath.split(".").pop() === "mov" ? (
                                                  <div
                                                      className="cantSupportPreview"
                                                      onClick={() => this.openAttachment(filePath)}
                                                  >
                                                      <p>Video</p>
                                                      <p>(Click to open)</p>
                                                  </div>
                                              ) : null}
                                              {filePath.split(".").pop() === "pfd" ||
                                              filePath.split(".").pop() === "docx" ? (
                                                  <div
                                                      className="cantSupportPreview"
                                                      onClick={() => this.openAttachment(filePath)}
                                                  >
                                                      <p>Document</p>
                                                      <p>(Click to open)</p>
                                                  </div>
                                              ) : null}
                                              <p>{filePath.replace(/^.*[\\/]/, "")}</p>
                                          </div>
                                          <img
                                              className="aNewAttachmentRemoveButton"
                                              src={CloseIcon}
                                              onClick={() => this.removeAttachment(filePath)}
                                          />
                                      </div>
                                  ))
                                : null}
                            <input
                                id="messageFieldInput-NewMessage"
                                type="text"
                                autoCapitalize="on"
                                spellCheck="true"
                                placeholder={this.state.showGIFSelector ? "Search for GIF" : "BlueBubbles"}
                                value={this.state.enteredMessage}
                                onChange={this.handleMessageChange}
                            />
                        </div>
                        <svg
                            id="emojiPickerButton"
                            onClick={this.openEmojiPicker}
                            height="21"
                            width="21"
                            viewBox="0 0 24 24"
                        >
                            <path d="m12 24c6.617 0 12-5.383 12-12s-5.383-12-12-12-12 5.383-12 12 5.383 12 12 12zm5-16.935c1.103 0 2 .897 2 2s-.897 2-2 2-2-.897-2-2 .897-2 2-2zm-10 0c1.103 0 2 .897 2 2s-.897 2-2 2-2-.897-2-2 .897-2 2-2zm-3.354 7.24c.142-.192.366-.305.604-.305h15.5c.238 0 .462.113.604.305.141.192.183.439.112.667-1.16 3.737-4.562 6.248-8.466 6.248s-7.307-2.511-8.466-6.248c-.071-.227-.029-.475.112-.667z" />
                        </svg>
                    </>
                )}
                <div id="rightBottomButton" style={{ width: this.state.audioHasData ? "85px" : "45px" }}>
                    {this.state.enteredMessage === "" ? (
                        <>
                            {this.state.isRecording ? (
                                <svg
                                    id="stopVoiceMessage"
                                    onClick={() => this.stopRecording()}
                                    viewBox="0 0 1300 1300"
                                    width="45"
                                    height="45"
                                >
                                    <defs>
                                        <radialGradient id="blueRadialGradient">
                                            <stop offset="0" stopColor="white" stopOpacity="1" />
                                            <stop offset="1" stopColor="white" stopOpacity="0" />
                                        </radialGradient>
                                    </defs>
                                    <mask id="blueMask">
                                        <circle cx="50%" cy="50%" r="800" fill="url(#blueRadialGradient)">
                                            <animate
                                                attributeName="r"
                                                values="300;800;300"
                                                dur="1.5s"
                                                repeatCount="indefinite"
                                            />
                                        </circle>
                                    </mask>
                                    <mask id="whiteCircleMask">
                                        <circle cx="50%" cy="50%" r="450" fill="white" />
                                        <circle cx="50%" cy="50%" r="380" fill="black" />
                                    </mask>

                                    <circle mask="url(#blueMask)" fill="#00a1fd" cx="50%" cy="50%" r="800">
                                        <animate
                                            attributeName="r"
                                            values="300;800;300"
                                            dur="1.5s"
                                            repeatCount="indefinite"
                                        />
                                        {/* <animate attributeName="opacity" values=".4;1;.4" dur="2s" repeatCount="indefinite" /> */}
                                    </circle>
                                    <circle
                                        id="stopVoiceCircle"
                                        mask="url(#whiteCircleMask)"
                                        cx="50%"
                                        cy="50%"
                                        r="450"
                                    />
                                    <rect x="462.5" y="462.5" height="375" width="375" rx="70" fill="red" />
                                </svg>
                            ) : (
                                <>
                                    {this.state.audioHasData ? (
                                        <>
                                            <div id="deleteAudioIcon" onClick={() => this.deleteAudio()}>
                                                <img src={CloseIcon} />
                                            </div>
                                            <svg
                                                id="sendIcon"
                                                viewBox="0 0 512 512"
                                                onClick={() => this.addAudioToChat()}
                                            >
                                                <circle r="256" cx="256" cy="256" id="sendIconBackground" />
                                                <line
                                                    x1="100"
                                                    y1="256"
                                                    x2="412"
                                                    y2="256"
                                                    stroke="white"
                                                    strokeLinecap="round"
                                                    style={{ fill: "white", strokeWidth: "50" }}
                                                />
                                                <line
                                                    x1="256"
                                                    y1="100"
                                                    x2="256"
                                                    y2="412"
                                                    stroke="white"
                                                    strokeLinecap="round"
                                                    style={{ fill: "white", strokeWidth: "50" }}
                                                />
                                            </svg>
                                        </>
                                    ) : (
                                        <>
                                            {this.state.attachmentPaths.length > 0 ? (
                                                <svg
                                                    id="sendIcon"
                                                    viewBox="0 0 1000 1000"
                                                    onClick={() => this.sendMessage()}
                                                >
                                                    <circle r="500" cx="500" cy="500" id="sendIconBackground" />
                                                    <polyline
                                                        id="arrow"
                                                        points="240 422 500 218 500 775 500 218 760 422"
                                                    />
                                                </svg>
                                            ) : (
                                                <>
                                                    {this.state.showGIFSelector ? (
                                                        <div
                                                            id="closeGIFSelector"
                                                            onClick={() => {
                                                                this.setState({
                                                                    enteredMessage: "",
                                                                    showGIFSelector: false
                                                                });
                                                                ipcRenderer.invoke("send-to-ui", {
                                                                    event: "toggle-giphy-selector",
                                                                    contents: false
                                                                });
                                                            }}
                                                        >
                                                            <img src={CloseIcon} />
                                                        </div>
                                                    ) : (
                                                        <svg
                                                            id="recordVoiceMessage"
                                                            onMouseEnter={this.handleRecordEnter}
                                                            onMouseLeave={this.handleRecordLeave}
                                                            onClick={() => this.startRecording()}
                                                            viewBox="0 0 1000 1000"
                                                            width="25"
                                                            height="25"
                                                        >
                                                            <path
                                                                id="bar1"
                                                                className="shp0"
                                                                d="M54 374.7L114 374.7C125.06 374.7 134 383.64 134 394.7L134 606.9C134 617.96 125.06 626.9 114 626.9L54 626.9C42.94 626.9 34 617.96 34 606.9L34 394.7C34 383.64 42.94 374.7 54 374.7Z"
                                                            />
                                                            <path
                                                                id="bar2"
                                                                className="shp0"
                                                                d="M206.5 253.1L266.5 253.1C277.56 253.1 286.5 262.04 286.5 273.1L286.5 728.4C286.5 739.46 277.56 748.4 266.5 748.4L206.5 748.4C195.44 748.4 186.5 739.46 186.5 728.4L186.5 273.1C186.5 262.04 195.44 253.1 206.5 253.1Z"
                                                            />
                                                            <path
                                                                id="bar3"
                                                                className="shp0"
                                                                d="M368 118L428 118C439.06 118 448 126.94 448 138L448 863.5C448 874.56 439.06 883.5 428 883.5L368 883.5C356.94 883.5 348 874.56 348 863.5L348 138C348 126.94 356.94 118 368 118Z"
                                                            />
                                                            <path
                                                                id="bar4"
                                                                className="shp0"
                                                                d="M529.5 271.1L589.5 271.1C600.56 271.1 609.5 280.04 609.5 291.1L609.5 710.4C609.5 721.46 600.56 730.4 589.5 730.4L529.5 730.4C518.44 730.4 509.5 721.46 509.5 710.4L509.5 291.1C509.5 280.04 518.44 271.1 529.5 271.1Z"
                                                            />
                                                            <path
                                                                id="bar5"
                                                                className="shp0"
                                                                d="M699.9 208.1L759.9 208.1C770.96 208.1 779.9 217.04 779.9 228.1L779.9 773.5C779.9 784.56 770.96 793.5 759.9 793.5L699.9 793.5C688.84 793.5 679.9 784.56 679.9 773.5L679.9 228.1C679.9 217.04 688.84 208.1 699.9 208.1Z"
                                                            />
                                                            <path
                                                                id="bar6"
                                                                className="shp0"
                                                                d="M882 388L942 388C953.06 388 962 396.94 962 408L962 593C962 604.06 953.06 613 942 613L882 613C870.94 613 862 604.06 862 593L862 408C862 396.94 870.94 388 882 388Z"
                                                            />
                                                        </svg>
                                                    )}
                                                </>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            {!this.state.showGIFSelector || this.state.attachmentPaths.length > 0 ? (
                                <svg id="sendIcon" viewBox="0 0 1000 1000" onClick={() => this.sendMessage()}>
                                    <circle r="500" cx="500" cy="500" id="sendIconBackground" />
                                    <polyline id="arrow" points="240 422 500 218 500 775 500 218 760 422" />
                                </svg>
                            ) : (
                                <div
                                    id="closeGIFSelector"
                                    onClick={() => {
                                        this.setState({ enteredMessage: "", showGIFSelector: false });
                                        ipcRenderer.invoke("send-to-ui", {
                                            event: "toggle-giphy-selector",
                                            contents: false
                                        });
                                    }}
                                >
                                    <img src={CloseIcon} />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        );
    }
}

export default NewMessageBottomNav;
