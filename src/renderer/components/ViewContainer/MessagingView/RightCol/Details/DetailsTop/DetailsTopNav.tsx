/* eslint-disable class-methods-use-this */
import * as React from "react";
import { ipcRenderer } from "electron";
import { Chat } from "@server/databases/chat/entity";

import "./DetailsTopNav.css";

type State = {
    chat: Chat;
};

class DetailsTopNav extends React.Component<unknown, State> {
    state = {
        chat: null
    };

    componentDidMount() {
        document.getElementById("newChatNameInput").focus();
    }

    handleDetailsClose() {
        const config = { isDetailsOpen: false };
        console.log(config);
        ipcRenderer.invoke("set-config", config);
    }

    render() {
        const { chat } = this.state;

        return (
            <div className="RightTopNav">
                <div id="nameDiv-Details">
                    <p>Name: </p>
                </div>
                <div id="recipDiv-Details">
                    <input placeholder="chat name here" id="newChatNameInput" />
                </div>
                <div id="closeDetailsDiv">
                    <p onClick={this.handleDetailsClose}>Close</p>
                </div>
            </div>
        );
    }
}

export default DetailsTopNav;
