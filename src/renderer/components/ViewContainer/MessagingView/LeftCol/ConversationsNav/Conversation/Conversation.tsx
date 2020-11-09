/* eslint-disable no-loop-func */
/* eslint-disable react/prefer-stateless-function */
/* eslint-disable jsx-a11y/mouse-events-have-key-events */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable max-len */
import * as React from "react";
import { Chat, Message } from "@server/databases/chat/entity";
import { getDateText, generateChatTitle } from "@renderer/helpers/utils";

import { GroupAvatar } from "./Avatar/GroupAvatar";
import { IndividualAvatar } from "./Avatar/IndividualAvatar";

import "./Conversation.css";
import ConversationCloseIcon from "../../../../../../assets/icons/conversation-close-icon.png";

// LOAD IN FROM BACKEND
type ConversationProps = {
    chat: Chat & {
        lastMessage: Message;
    };
};

type State = {
    showContextMenu: boolean;
};

let xPos;
let yPos;

function showDelMessage(e) {
    let id = e.target.getAttribute("id");
    id = document.getElementById(id);
    id.getElementsByClassName("message-del-conversation")[0].classList.remove("hideDelMessage");
    console.log();
    // console.log(document.querySelector(id));
}

function hideDelMessage(e) {
    let id = e.target.getAttribute("id");
    id = document.getElementById(id);
    id.getElementsByClassName("message-del-conversation")[0].classList.add("hideDelMessage");
    console.log();
    // console.log(document.querySelector(id));
}

class Conversation extends React.Component<ConversationProps, State> {
    constructor(props) {
        super(props);

        this.state = {
            showContextMenu: false
        };
    }

    componentDidMount() {
        // const y = document.getElementsByClassName("Conversation");
        // for(const x of y) {
        //     x.addEventListener("contextmenu", (e:MouseEvent) => {
        //         e.preventDefault();
        //         xPos = `${e.pageX  }px`;
        //         yPos = `${e.pageY - 25 }px`;
        //         console.log(xPos + yPos);
        //         if(e.pageX < 283) {
        //             this.setState({showContextMenu: true});
        //         } else {
        //             this.setState({showContextMenu: false});
        //         }
        //         console.log(this.state.showContextMenu);
        //         console.log(e.target)
        //     });
        // }
        // document.addEventListener("click", (e) => {
        //     e.preventDefault();
        //     this.setState({showContextMenu: false});
        //     console.log(this.state.showContextMenu);
        // });
    }

    render() {
        const chatDate = this.props.chat.lastMessage?.dateCreated
            ? getDateText(new Date(this.props.chat.lastMessage.dateCreated))
            : "";
        let lastText = this.props.chat.lastMessage?.text ?? "";
        if (this.props.chat.lastMessage?.hasAttachments) lastText = "1 Attachment";

        return (
            <>
                {this.state.showContextMenu ? (
                    <div
                        id="ConversationContextMenu"
                        onClick={() => console.log("Clicked")}
                        style={{ position: "absolute", top: yPos, left: xPos }}
                    >
                        <div>
                            <p>Mute Chat</p>
                        </div>
                    </div>
                ) : null}
                <div
                    className="Conversation"
                    id={this.props.chat.guid}
                    onMouseOver={showDelMessage}
                    onMouseOut={hideDelMessage}
                >
                    <div className="convo-wrap">
                        <div className="contact-card">
                            {this.props.chat.participants.length > 1 ? (
                                <GroupAvatar chat={this.props.chat} />
                            ) : (
                                <IndividualAvatar chat={this.props.chat} />
                            )}
                        </div>
                        <div className="message-prev">
                            <div className="prev-top">
                                <div className="message-recip">
                                    <p className="message-recip-example">{generateChatTitle(this.props.chat)}</p>
                                </div>
                                <div className="message-time">
                                    <div>
                                        <p className="message-time-example">{chatDate}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="prev-bottom">
                                <div className="message-snip">
                                    <div>
                                        <p className="message-snip-example">{lastText}</p>
                                    </div>
                                </div>
                                <div className="message-del">
                                    <img
                                        className="message-del-conversation hideDelMessage"
                                        src={ConversationCloseIcon}
                                        alt="delete"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

export default Conversation;
