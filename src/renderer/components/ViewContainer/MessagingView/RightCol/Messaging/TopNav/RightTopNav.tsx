/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
import * as React from "react";
import { Chat } from "@server/databases/chat/entity";
import { getSender } from "@renderer/helpers/utils";

import "./RightTopNav.css";
import { ipcRenderer } from "electron";

interface Props {
    chat: Chat;
    isDetailsOpen: boolean;
}

interface State {
    enteredDisplayName: string;
    isDisplayNameChanged: boolean;
}

class RightTopNav extends React.Component<Props, State> {
    constructor(props) {
        super(props);

        this.state = {
            isDisplayNameChanged: false,
            enteredDisplayName: this.props.chat.displayName
        };
    }

    handleOpenDetails = () => {
        ipcRenderer.invoke("send-to-ui", { event: "open-details" });
    };

    handleCloseDetails = () => {
        ipcRenderer.invoke("send-to-ui", { event: "close-details" });
    };

    handleDisplayNameChange = event => {
        this.setState({
            isDisplayNameChanged: true,
            enteredDisplayName: event.target.value
        });

        console.log(event.target.value);
    };

    async saveAndCloseDetails() {
        const newDisplayName = this.state.enteredDisplayName;
        console.log(`Changing chat display name to :${newDisplayName}`);

        await this.setState({ isDisplayNameChanged: false });
        this.handleCloseDetails();
    }

    render() {
        const participants = (this.props.chat?.participants ?? []).map(handle =>
            getSender(handle, (this.props.chat?.participants ?? []).length === 1)
        );

        return (
            <div className="RightTopNav">
                <div id="toDiv">
                    <p>To:</p>
                </div>
                <div id="recipDiv">
                    {this.props.isDetailsOpen && this.props.chat.displayName ? (
                        <input
                            id="newChatNameInput"
                            value={this.state.enteredDisplayName}
                            onChange={this.handleDisplayNameChange}
                        />
                    ) : (
                        <>
                            {this.props.chat
                                ? participants.map((item, i) => (
                                      <>
                                          <div key={this.props.chat.participants[i].address}>
                                              <p>{item}</p>{" "}
                                          </div>
                                          {participants.length === i + 1 ? null : <p>,</p>}
                                      </>
                                  ))
                                : null}
                        </>
                    )}
                </div>
                <div id="convoDetailsDiv">
                    {this.state.isDisplayNameChanged ? (
                        <p onClick={() => this.saveAndCloseDetails()}>Save</p>
                    ) : (
                        <p onClick={this.props.isDetailsOpen ? this.handleCloseDetails : this.handleOpenDetails}>
                            {this.props.isDetailsOpen ? "Close" : "Details"}
                        </p>
                    )}
                </div>
            </div>
        );
    }
}

export default RightTopNav;
