import * as React from "react";
import { Chat } from "@server/databases/chat/entity";
import { generateChatIconText } from "@renderer/helpers/utils";

import "./styles.css";

type Props = {
    chat: Chat;
};

export const IndividualAvatar = ({ chat }: Props) => {
    const chatIconText = generateChatIconText(chat);

    if (chat.participants.length === 1 && chat.participants[0].avatar)
        return <img className="avatar" src={chat.participants[0].avatar} alt={chat.participants[0].address} />;

    if (chatIconText === "?")
        return (
            <svg height="50px" width="50px" viewBox="0 0 1000 1000">
                <defs>
                    <linearGradient id="Gradient1" x1="0" x2="0" y1="1" y2="0">
                        <stop className="stop1" offset="0%" stopColor="#686868" />
                        <stop className="stop2" offset="100%" stopColor="#928E8E" />
                    </linearGradient>
                </defs>
                <circle className="cls-1" cx="50%" cy="50%" r="500" fill="url(#Gradient1)" />
                <mask id="rmvProfile">
                    <circle cx="50%" cy="50%" r="435" fill="white" />
                </mask>
                <ellipse className="cls-2" fill="white" cx="50%" cy="34%" rx="218" ry="234" />
                <circle className="cls-2" mask="url(#rmvProfile)" fill="white" cx="50%" cy="106%" r="400" />
            </svg>
        );

    return (
        <svg id="testContact" className="dynamicIcon" height="50px" width="50px">
            <defs>
                <linearGradient id="Gradient1" x1="0" x2="0" y1="1" y2="0">
                    <stop className="stop1" offset="0%" stopColor="#686868" />
                    <stop className="stop2" offset="100%" stopColor="#928E8E" />
                </linearGradient>
            </defs>
            <circle className="cls-1" fill="url(#Gradient1)" cx="50%" cy="50%" r="25px" />
            <text className="cls-2" x="50%" y="33px" textAnchor="middle" fill="white" stroke="white">
                {generateChatIconText(chat)}
            </text>
        </svg>
    );
};
