/* eslint-disable max-len */
import * as React from "react";
import "./Conversation.css";
// import {ReactComponent as ContactImage} from "../../../../../../assets/icons/contact-icon-new.svg";
import ConversationCloseIcon from "../../../../../../assets/icons/conversation-close-icon.png";

// LOAD IN FROM BACKEND
type ConversationProps = {
    aGuid?: string;
    chatParticipants?: string;
    lastMessage?: string;
    lastMessageTime?: string;
};

function setActiveChat(e){
    try{
        document.getElementsByClassName("activeChat")[0].classList.remove("activeChat");
    }
    catch {}
    
    document.getElementById(e.target.getAttribute('id')).classList.add("activeChat");
}

function showDelMessage(e){
    let id = e.target.getAttribute('id');
    id = document.getElementById(id);
    id.getElementsByClassName("message-del-conversation")[0].classList.remove("hideDelMessage");
    console.log()
    // console.log(document.querySelector(id));
}

function hideDelMessage(e){
    let id = e.target.getAttribute('id');
    id = document.getElementById(id);
    id.getElementsByClassName("message-del-conversation")[0].classList.add("hideDelMessage");
    console.log()
    // console.log(document.querySelector(id));
}

const Conversation = ({ aGuid, chatParticipants, lastMessage, lastMessageTime }: ConversationProps) => (
    <div className="Conversation" id={aGuid} onClick={setActiveChat} onMouseOver={showDelMessage} onMouseOut={hideDelMessage}>
        <div className="convo-wrap">
            <div className="contact-card">
                {/* <img className="contact-icon" src={ContactImage} alt="contact" /> */}
                <svg id="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1016 1017">
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
                </svg>
            </div>
            <div className="message-prev">
                <div className="prev-top">
                    <div className="message-recip">
                            <p className="message-recip-example">{chatParticipants}</p>
                    </div>
                    <div className="message-time">
                        <div>
                            <p className="message-time-example">{lastMessageTime}</p>
                        </div>
                    </div>
                </div>
                <div className="prev-bottom">
                    <div className="message-snip">
                        <div>
                            <p className="message-snip-example">{lastMessage}</p>
                        </div>
                    </div>
                    <div className="message-del">
                        <img className="message-del-conversation hideDelMessage" src={ConversationCloseIcon} alt="delete" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default Conversation;
