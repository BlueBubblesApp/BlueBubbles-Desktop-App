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
    }

    handleMessageChange = event => {
        this.setState({
            enteredMessage: event.target.value
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
                        placeholder="iMessage"
                        value={this.state.enteredMessage}
                        onChange={this.handleMessageChange}
                    />
                </div>
                <div id="rightBottomButton">
                    <img id="sendIcon" onClick={() => this.sendMessage()} src={SendIcon} alt="send" />
                </div>
            </div>
        );
    }
}

export default RightBottomNav;
