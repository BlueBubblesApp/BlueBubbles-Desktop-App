/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/self-closing-comp */
import * as React from "react";
import { ipcRenderer } from "electron";
import { Chat, Message } from "@server/databases/chat/entity";
import { getDateText, getTimeText } from "@renderer/utils";
import DetailContact from "./Contact/DetailContact";
import "./DetailsDisplay.css";

type State = {};

class DetailsDisplay extends React.Component<unknown, State> {
    state = {};

    render() {
        return (
            // eslint-disable-next-line react/self-closing-comp
            <div id="messageView-DetailsDisplay">
                <DetailContact contactName="Maxwell Fortney" />
                <div id="addContact">
                    <div id="addContactWrap">
                        <p>+ Add Contact</p>
                    </div>
                </div>
                <div id="muteChat">
                    <div id="muteChatWrap">
                        <div id="muteChatLeft">
                            <p>Mute Chat</p>
                        </div>
                        <div id="muteChatRight">
                            <label className="form-switch">
                                <input type="checkbox" />
                                <i></i>
                            </label>
                        </div>
                    </div>
                </div>
                <div id="recentImages"></div>
            </div>
        );
    }
}

export default DetailsDisplay;
