/* eslint-disable react/prefer-stateless-function */
/* eslint-disable max-len */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/self-closing-comp */
import * as React from "react";
import { Chat } from "@server/databases/chat/entity";
import { getSender, generateDetailsIconText } from "@renderer/helpers/utils";
import DetailContact from "./Contact/DetailContact";
import "./DetailsDisplay.css";

interface Props {
    chat: Chat;
}

interface State {
    participants: Array<String>;
}

class DetailsDisplay extends React.Component<Props, unknown> {
    render() {
        const participants = this.props.chat.participants.map(handle => getSender(handle));

        return (
            // eslint-disable-next-line react/self-closing-comp
            <div id="messageView-DetailsDisplay">
                <>
                    {participants
                        ? participants.map((name, i) => (
                              <DetailContact
                                  key={this.props.chat.participants[i].address}
                                  name={name}
                                  chat={this.props.chat}
                                  index={i}
                              />
                          ))
                        : null}
                </>
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
                <div id="recentImages">
                    <p>Show Chat Images Here</p>
                </div>
            </div>
        );
    }
}

export default DetailsDisplay;
