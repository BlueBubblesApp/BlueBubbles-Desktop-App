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
    showAllContacts: boolean;
}

class DetailsDisplay extends React.Component<Props, State> {
    constructor(props) {
        super(props);

        this.state = {
            showAllContacts: false
        };
    }

    componentDidMount() {
        if (this.props.chat.participants.length > 5) {
            this.setState({ showAllContacts: false });
        }
    }

    toggleShowAllContacts() {
        this.setState({ showAllContacts: !this.state.showAllContacts });
    }

    render() {
        const participants = this.props.chat.participants.map(handle => getSender(handle));

        return (
            // eslint-disable-next-line react/self-closing-comp
            <div id="messageView-DetailsDisplay">
                <>
                    {participants ? (
                        <>
                            {this.state.showAllContacts
                                ? participants.map((name, i) => (
                                      <DetailContact
                                          key={this.props.chat.participants[i].address}
                                          name={name}
                                          chat={this.props.chat}
                                          index={i}
                                          address={this.props.chat.participants[i].address}
                                      />
                                  ))
                                : participants
                                      .slice(0, 5)
                                      .map((name, i) => (
                                          <DetailContact
                                              key={this.props.chat.participants[i].address}
                                              name={name}
                                              chat={this.props.chat}
                                              index={i}
                                              address={this.props.chat.participants[i].address}
                                          />
                                      ))}
                        </>
                    ) : null}
                </>
                {participants.length > 5 ? (
                    <div id="showMore">
                        <div id="showMoreWrap">
                            {this.state.showAllContacts ? (
                                <p onClick={() => this.toggleShowAllContacts()}>Hide</p>
                            ) : (
                                <p onClick={() => this.toggleShowAllContacts()}>
                                    Show More ({participants.length - 5})
                                </p>
                            )}
                        </div>
                    </div>
                ) : null}
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
