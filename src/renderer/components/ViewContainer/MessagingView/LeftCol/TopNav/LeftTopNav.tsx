import * as React from "react";
import { ipcRenderer } from "electron";
import "./LeftTopNav.css";
import { Link } from "react-router-dom";
import ComposeIcon from "../../../../../assets/icons/compose-icon.png";

interface LeftTopNavState {
    enteredSearch: string;
}

class LeftTopNav extends React.Component<object, LeftTopNavState> {
    constructor(props) {
        super(props);

        this.state = {
            // eslint-disable-next-line react/no-unused-state
            enteredSearch: ""
        };
    }

    componentDidMount() {
        ipcRenderer.on("focused", (_, args) => {
            document.getElementsByClassName("LeftTopNav-Mes")[0].classList.remove("LeftTopNav-Mes-Blurred");
        });

        ipcRenderer.on("blurred", (_, args) => {
            document.getElementsByClassName("LeftTopNav-Mes")[0].classList.add("LeftTopNav-Mes-Blurred");
        });
    }

    // eslint-disable-next-line class-methods-use-this
    handleNewMessage() {
        ipcRenderer.invoke("send-to-ui", { event: "set-current-chat", contents: null });
    }

    render() {
        return (
            <div className="LeftTopNav-Mes">
                <div id="leftTopSearch">
                    <input id="messageSearch" type="text" name="search" placeholder="Search" />
                </div>
                <div className="leftTopButton">
                    <div id="newMessage" onClick={this.handleNewMessage}>
                        <img id="composeIcon" src={ComposeIcon} alt="compose" />
                    </div>
                </div>
            </div>
        );
    }
}

export default LeftTopNav;
