import * as React from "react";
import { ipcRenderer } from "electron";
import { Chat } from "@server/databases/chat/entity";

import "./RightTopNav.css";

type State = {
    chat: Chat;
};

class RightTopNav extends React.Component<unknown, State> {
    state = {
        chat: null
    };

    componentDidMount() {
        ipcRenderer.on("set-current-chat", async (_, args) => {
            this.setState({ chat: args });
        });
    }

    render() {
        const { chat } = this.state;

        return (
            <div className="RightTopNav">
                <div id="toDiv">
                    <p>To:</p>
                </div>
                <div id="recipDiv">
                    {chat
                        ? chat.participants.map(handle => (
                              <div key={handle.address}>
                                  <p>{handle.address}</p>
                              </div>
                          ))
                        : null}
                </div>
                <div id="convoDetailsDiv">
                    <p>Details</p>
                </div>
            </div>
        );
    }
}

export default RightTopNav;
