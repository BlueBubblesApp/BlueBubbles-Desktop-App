import * as React from "react";
import { ipcRenderer } from "electron";
import { Chat } from "@server/databases/chat/entity";
import { getiMessageNumberFormat } from "@renderer/utils";

import "./NewMessageTopNav.css";

type State = {
    chat: Chat;
};

class NewMessageTopNav extends React.Component<unknown, State> {
    state = {
        chat: null
    };

    componentDidMount() {
        document.getElementById("newMessageRecipInput").focus();
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
                {/* <div id="closeNewChatDiv">
                    <p onClick={this.handleNewMessageClose}>Close</p>
                </div> */}
            </div>
        );
    }
}

export default NewMessageTopNav;
