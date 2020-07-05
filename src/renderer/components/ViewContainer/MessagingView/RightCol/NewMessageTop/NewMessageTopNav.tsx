import * as React from "react";
import { ipcRenderer } from "electron";
import { Chat } from "@server/databases/chat/entity";
import { getiMessageNumberFormat } from "@renderer/utils";

import "./NewMessageTopNav.css";

type NewMessageTopNavState = {
    chat: Chat;
};

class NewMessageTopNav extends React.Component<unknown, NewMessageTopNavState> {
    constructor(props) {
        super(props);

        this.state = {
            chat: null
        };
    }

    componentDidMount() {
        ipcRenderer.on("set-current-chat", async (_, args) => {
            this.setState({ chat: args });
        });

        document.getElementById("newMessageRecipInput").focus();
    }

    // eslint-disable-next-line class-methods-use-this
    handleNewMessageClose() {
        const config = { isMakingNewChat: false };
        console.log(config);
        ipcRenderer.invoke("set-config", config);
    }

    render() {
        const { chat } = this.state;

        const participants = (chat?.participants ?? []).map(handle => {
            const hasContact = false;
            if (hasContact) {
                // TODO: get the contact
                return handle.address;
            }

            return getiMessageNumberFormat(handle.address);
        });

        return (
            <div className="RightTopNav">
                <div id="toDiv-NewMessage">
                    <p>To:</p>
                </div>
                <div id="recipDiv-NewMessage">
                    <input placeholder="No recipients" id="newMessageRecipInput" />
                </div>
                <div id="closeNewChatDiv">
                    <p onClick={this.handleNewMessageClose}>Close</p>
                </div>
            </div>
        );
    }
}

export default NewMessageTopNav;
