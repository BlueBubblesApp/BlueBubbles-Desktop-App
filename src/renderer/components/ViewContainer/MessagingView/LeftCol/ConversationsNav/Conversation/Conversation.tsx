/* eslint-disable no-loop-func */
/* eslint-disable react/prefer-stateless-function */
/* eslint-disable jsx-a11y/mouse-events-have-key-events */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable max-len */
import * as React from "react";
import { Chat, Message } from "@server/databases/chat/entity";
import { getDateText, generateChatTitle } from "@renderer/helpers/utils";

import "./Conversation.css";
import EmojiRegex from "emoji-regex";
import data from "emoji-mart/data/apple.json";
import { getEmojiDataFromNative, Emoji } from "emoji-mart";
import ConversationCloseIcon from "../../../../../../assets/icons/conversation-close-icon.png";
import IndividualAvatar from "./Avatar/IndividualAvatar";
import GroupAvatar from "./Avatar/GroupAvatar";

const reactStringReplace = require("react-string-replace");

// LOAD IN FROM BACKEND
type ConversationProps = {
    chat: Chat & {
        lastMessage: Message;
        isTyping?: boolean;
    };
    config: any;
    onChatSelect: any;
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

    renderText = message => {
        // Pull out the message
        const msg = message?.text ?? "";
        const template = text => (
            <p className="message-snip-example" style={{ fontWeight: process.platform === "linux" ? 400 : 300 }}>
                {text}
            </p>
        );

        if (message?.hasAttachments && (message?.text ?? "").startsWith("http")) return template("1 Link");
        if (message?.hasAttachments) return template("1 Attachment");

        if (this.props.config.useNativeEmojis) {
            return template(msg);
        }

        const parser = EmojiRegex();
        const matches = msg.match(parser);
        let final = [];

        if (matches?.length >= 1) {
            for (let i = 0; i < matches.length; i += 1) {
                final = reactStringReplace(i === 0 ? msg : final, matches[i], () => {
                    const emojiData = getEmojiDataFromNative(matches[i], "apple", data);
                    if (emojiData) {
                        return (
                            <Emoji
                                key={`emoji-${message.guid}-${Math.floor(Math.random() * Math.floor(100))}`}
                                emoji={emojiData}
                                set="apple"
                                skin={emojiData.skin || 1}
                                size={18}
                            />
                        );
                    }
                    return matches[i];
                });
            }
        } else {
            final.push(msg);
        }

        return template(final.map(item => item));
    };

    render() {
        const chatDate = this.props.chat.lastMessage?.dateCreated
            ? getDateText(new Date(this.props.chat.lastMessage.dateCreated))
            : "";
        const title = generateChatTitle(this.props.chat);
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
                    // onMouseOver={showDelMessage}
                    // onMouseOut={hideDelMessage}
                    onClick={() => this.props.onChatSelect()}
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
                                    <p className="message-recip-example">{title}</p>
                                </div>
                                <div className="message-time">
                                    <div>
                                        <p className="message-time-example">{chatDate}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="prev-bottom">
                                {this.props.chat.isTyping ? (
                                    <svg height="35px" width="100px">
                                        <circle
                                            cx="10px"
                                            cy="29px"
                                            r="2px"
                                            className="backgroundTypingIndicator smallerCircle"
                                        />
                                        <circle
                                            cx="17px"
                                            cy="24px"
                                            r="4px"
                                            className="backgroundTypingIndicator smallerCircler"
                                        />
                                        <rect
                                            x="14px"
                                            y="2px"
                                            width="45px"
                                            height="27px"
                                            rx="15"
                                            className="mainTypingCircle backgroundTypingIndicator"
                                        />

                                        <circle cx="28px" cy="16px" r="3px" className="foregroundTypingIndicator">
                                            <animate
                                                attributeName="opacity"
                                                values="0;1;0"
                                                dur="1.4s"
                                                repeatCount="indefinite"
                                            />
                                        </circle>
                                        <circle
                                            cx="36px"
                                            cy="16px"
                                            r="3px"
                                            opacity="0.3"
                                            className="foregroundTypingIndicator"
                                        >
                                            <animate
                                                begin=".3s"
                                                attributeName="opacity"
                                                values="0;1;0"
                                                dur="1.4s"
                                                repeatCount="indefinite"
                                            />
                                        </circle>
                                        <circle
                                            cx="44px"
                                            cy="16px"
                                            r="3px"
                                            opacity="0.6"
                                            className="foregroundTypingIndicator"
                                        >
                                            <animate
                                                begin=".6s"
                                                attributeName="opacity"
                                                values="0;1;0"
                                                dur="1.4s"
                                                repeatCount="indefinite"
                                            />
                                        </circle>
                                    </svg>
                                ) : (
                                    <>
                                        <div className="message-snip">
                                            <div>{this.renderText(this.props.chat.lastMessage)}</div>
                                        </div>
                                        <div className="message-del">
                                            <img
                                                className="message-del-conversation hideDelMessage"
                                                src={ConversationCloseIcon}
                                                alt="delete"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

export default Conversation;
