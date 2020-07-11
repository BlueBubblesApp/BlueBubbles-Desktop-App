/* eslint-disable max-len */
import * as React from "react";
import { Chat, Message } from "@server/databases/chat/entity";
import { getDateText, getiMessageNumberFormat, generateChatTitle, generateChatIconText } from "@renderer/utils";
import { ipcRenderer } from "electron";

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
                    {chat.participants.length > 1 ? (
                        <svg className="dynamicIcon" height="50px" width="50px">
                            <defs>
                                <linearGradient id="Gradient1" x1="0" x2="0" y1="1" y2="0">
                                    <stop className="stop1" offset="0%" stopColor="#686868" />
                                    <stop className="stop2" offset="100%" stopColor="#928E8E" />
                                </linearGradient>
                            </defs>
                            <circle id="contactBackground1" fill="url(#Gradient1)" cx="32%" cy="40%" r="16px" />
                            <text id="groupContactInitials-1" x="32%" y="25px" textAnchor="middle" stroke="white">
                                {generateChatIconText(chat)[0]}
                            </text>
                            <circle id="contactBackground2" fill="url(#Gradient1)" cx="68%" cy="60%" r="16px" />
                            <text id="groupContactInitials-2" x="68%" y="36px" textAnchor="middle" stroke="white">
                                {generateChatIconText(chat)[1]}
                            </text>
                        </svg>
                    ) : (
                        <>
                            {generateChatIconText(chat) === "?" ? (
                                <svg id="icon" viewBox="0 0 1016 1017">
                                    <g id="background">
                                        <path
                                            className="cls-1"
                                            d="M1016,510A506.11,506.11,0,0,1,881.62,854.19C788.8,954.91,655.77,1018,508,1018S227.2,954.91,134.38,854.19A506.11,506.11,0,0,1,0,510C0,229.43,227.43,2,508,2S1016,229.43,1016,510Z"
                                            transform="translate(0 -2)"
                                        />
                                    </g>
                                    <g id="shoulders">
                                        <path
                                            className="cls-2"
                                            d="M847.49,789.35C763.15,880.87,642.27,938.19,508,938.19S252.85,880.87,168.51,789.35c52.27-114.61,184.56-196,339.49-196S795.22,674.74,847.49,789.35Z"
                                            transform="translate(0 -2)"
                                        />
                                    </g>
                                    <g id="head">
                                        <ellipse className="cls-2" cx="508" cy="325.71" rx="205.71" ry="214.16" />
                                    </g>
                                </svg>
                            ) : (
                                <svg id="testContact" className="dynamicIcon" height="50px" width="50px">
                                    <defs>
                                        <linearGradient id="Gradient1" x1="0" x2="0" y1="1" y2="0">
                                            <stop className="stop1" offset="0%" stopColor="#686868" />
                                            <stop className="stop2" offset="100%" stopColor="#928E8E" />
                                        </linearGradient>
                                    </defs>
                                    <circle id="contactBackground0" fill="url(#Gradient1)" cx="50%" cy="50%" r="25px" />
                                    <text
                                        id="aContactInitials"
                                        className=""
                                        x="50%"
                                        y="33px"
                                        textAnchor="middle"
                                        stroke="white"
                                    >
                                        {generateChatIconText(chat)}
                                    </text>
                                </svg>
                            )}
                        </>
                    )}
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

/* <svg id="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1016 1017">
    <title>contact-icon-new</title>
    <g id="background">
        <path
            className="cls-1"
            d="M1016,510A506.11,506.11,0,0,1,881.62,854.19C788.8,954.91,655.77,1018,508,1018S227.2,954.91,134.38,854.19A506.11,506.11,0,0,1,0,510C0,229.43,227.43,2,508,2S1016,229.43,1016,510Z"
            transform="translate(0 -2)"
        />
    </g>
    <g id="shoulders">
        <path
            className="cls-2"
            d="M847.49,789.35C763.15,880.87,642.27,938.19,508,938.19S252.85,880.87,168.51,789.35c52.27-114.61,184.56-196,339.49-196S795.22,674.74,847.49,789.35Z"
            transform="translate(0 -2)"
        />
    </g>
    <g id="head">
        <ellipse className="cls-2" cx="508" cy="325.71" rx="205.71" ry="214.16" />
    </g>
</svg> */
