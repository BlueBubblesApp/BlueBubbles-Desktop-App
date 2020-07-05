import * as React from "react";
import "./RightBottomNav.css";
import SendIcon from "../../../../../assets/icons/send-icon.png";
import { ipcRenderer } from "electron";

interface RightBottomNavState {
    enteredMessage: string;
}

class RightBottomNav extends React.Component<object, RightBottomNavState> {
    constructor(props) {
        super(props);

        this.state = {
            enteredMessage: ""
        };
    }

    async componentDidMount() {

        const input = document.getElementById("messageFieldInput");
        input.addEventListener("keyup", (event) => {
            // Number 13 is the "Enter" key on the keyboard
            if (event.keyCode === 13) {
                event.preventDefault();
                this.sendMessage()
            }
        });
    }

    handleMessageChange = event => {
        this.setState({
            enteredMessage: event.target.value
        });
    };

    sendMessage() {
        const input: HTMLInputElement = document.getElementById("messageFieldInput") as HTMLInputElement;
        // Ping server to send message here
        console.log("Sent Message: " + input.value);
        ipcRenderer.invoke("set-config", input.value);
        input.value = ""
    }

    render(){
        return (
            <div className="RightBottomNav">
                <div id="messageField">
                    <input id="messageFieldInput" type="text" placeholder="iMessage" value={this.state.enteredMessage} onChange={this.handleMessageChange}/>
                </div>
                <div id="rightBottomButton">
                    <img id="sendIcon" onClick={this.sendMessage} src={SendIcon} alt="send" />
                </div>
            </div>
        );
    }
}

export default RightBottomNav;
