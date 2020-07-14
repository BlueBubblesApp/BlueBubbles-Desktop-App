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

const Conversation = ({ chat }: ConversationProps) => {
    const chatDate = chat.lastMessage?.dateCreated ? getDateText(new Date(chat.lastMessage.dateCreated)) : "";
    let lastText = chat.lastMessage?.text ?? "";
    if (chat.lastMessage?.hasAttachments) lastText = "1 Attachment";

    return (
        // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
        <div className="Conversation" id={chat.guid} onMouseOver={showDelMessage} onMouseOut={hideDelMessage}>
            <div className="convo-wrap">
                <div className="contact-card">
                    {chat.participants.length > 1 ? <GroupAvatar chat={chat} /> : <IndividualAvatar chat={chat} />}
                </div>
                <div className="message-prev">
                    <div className="prev-top">
                        <div className="message-recip">
                            <p className="message-recip-example">{generateChatTitle(chat)}</p>
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
    );
};

export default Conversation;
