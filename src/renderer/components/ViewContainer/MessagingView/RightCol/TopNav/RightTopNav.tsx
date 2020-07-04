import * as React from "react";
import { ipcRenderer } from "electron";
import { Chat } from "@server/databases/chat/entity";
import { getiMessageNumberFormat } from "@renderer/utils";

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
                <div id="toDiv">
                    <p>To:</p>
                </div>
                <div id="recipDiv">
                    {chat
                        ? participants.map(item => (
                              <div key={item}>
                                  <p>{`${item},`}</p>
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
