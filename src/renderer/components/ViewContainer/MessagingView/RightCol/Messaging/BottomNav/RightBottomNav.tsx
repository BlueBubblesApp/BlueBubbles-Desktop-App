/* eslint-disable max-len */
/* eslint-disable class-methods-use-this */
import * as React from "react";
import { ipcRenderer } from "electron";
import { Chat, Message } from "@server/databases/chat/entity";
import { generateUuid } from "@renderer/utils";

import "./RightBottomNav.css";
import SendIcon from "../../../../../../assets/icons/send-icon.png";

const { dialog } = require("electron").remote;

type Props = {
    chat: Chat;
};

type State = {
    enteredMessage: string;
};

class RightBottomNav extends React.Component<Props, State> {
    constructor(props) {
        super(props);

        this.state = {
            enteredMessage: ""
        };
    }

    async componentDidMount() {
        const input = document.getElementById("messageFieldInput");
        input.addEventListener("keyup", event => {
            // Number 13 is the "Enter" key on the keyboard
            if (event.keyCode === 13) {
                event.preventDefault();
                this.sendMessage();
            }
        });

        ipcRenderer.on("focused", (_, args) => {
            document.getElementsByClassName("RightBottomNav")[0].classList.remove("RightBottomNavBlurred");
        });

        ipcRenderer.on("blurred", (_, args) => {
            document.getElementsByClassName("RightBottomNav")[0].classList.add("RightBottomNavBlurred");
        });
    }

    handleMessageChange = event => {
        // Capitalize the first letter of input
        this.setState({
            enteredMessage: event.target.value.charAt(0).toUpperCase() + event.target.value.slice(1)
        });
    };

    async sendMessage() {
        if (this.state.enteredMessage.length === 0) return;

        const message: Message = await ipcRenderer.invoke("create-message", {
            chat: this.props.chat,
            guid: `temp-${generateUuid()}`,
            text: this.state.enteredMessage,
            dateCreated: new Date()
        });

        ipcRenderer.invoke("send-to-ui", { event: "add-message", contents: message });
        ipcRenderer.invoke("save-message", { chat: this.props.chat, message });
        ipcRenderer.invoke("send-message", { chat: this.props.chat, message });

        this.setState({ enteredMessage: "" });
    }

    handleAddAttachment() {
        dialog.showOpenDialog({
            properties: ["openFile"],
            filters: [{ name: "Images", extensions: ["jpg", "jpeg", "png"] }]
        });
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

    async openEmojiPicker() {
        await document.getElementById("messageFieldInput").focus();
        ipcRenderer.invoke("open-emoji-picker");
    }

    render() {
        return (
            <div className="RightBottomNav">
                <div id="leftAttachmentButton" onClick={this.handleAddAttachment}>
                    <svg id="attachIcon" viewBox="0 0 25 25">
                        <title>Attachment</title>
                        <path d="M7.46,25a7.57,7.57,0,0,1-5.19-2l-.09-.08a6.72,6.72,0,0,1,0-9.9L15,1.42a5.46,5.46,0,0,1,7.35,0A4.88,4.88,0,0,1,24,5a4.83,4.83,0,0,1-1.56,3.54L10.38,19.41A3.23,3.23,0,0,1,6,19.4a2.91,2.91,0,0,1,0-4.3L17.27,5l1.33,1.49L7.35,16.57a.91.91,0,0,0-.29.66.93.93,0,0,0,.31.68,1.23,1.23,0,0,0,1.66,0L21.09,7.11a2.81,2.81,0,0,0,0-4.16,3.45,3.45,0,0,0-4.69-.06L3.53,14.46a4.72,4.72,0,0,0,0,7l.09.08a5.65,5.65,0,0,0,7.63,0L23.33,10.69l1.34,1.49L12.62,23A7.53,7.53,0,0,1,7.46,25Z" />
                    </svg>
                </div>
                <div id="messageField">
                    <input
                        id="messageFieldInput"
                        type="text"
                        autoCapitalize="on"
                        spellCheck="true"
                        placeholder="BlueBubbles"
                        value={this.state.enteredMessage}
                        onChange={this.handleMessageChange}
                    />
                </div>
                <svg id="emojiPickerButton" onClick={this.openEmojiPicker} height="21" width="21" viewBox="0 0 24 24">
                    <path d="m12 24c6.617 0 12-5.383 12-12s-5.383-12-12-12-12 5.383-12 12 5.383 12 12 12zm5-16.935c1.103 0 2 .897 2 2s-.897 2-2 2-2-.897-2-2 .897-2 2-2zm-10 0c1.103 0 2 .897 2 2s-.897 2-2 2-2-.897-2-2 .897-2 2-2zm-3.354 7.24c.142-.192.366-.305.604-.305h15.5c.238 0 .462.113.604.305.141.192.183.439.112.667-1.16 3.737-4.562 6.248-8.466 6.248s-7.307-2.511-8.466-6.248c-.071-.227-.029-.475.112-.667z" />
                </svg>
                <div id="rightBottomButton">
                    {this.state.enteredMessage === "" ? (
                        <svg
                            id="recordVoiceMessage"
                            onMouseEnter={this.handleRecordEnter}
                            onMouseLeave={this.handleRecordLeave}
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
                    ) : (
                        <img id="sendIcon" onClick={() => this.sendMessage()} src={SendIcon} alt="send" />
                    )}
                </div>
            </div>
        );
    }
}

export default RightBottomNav;
