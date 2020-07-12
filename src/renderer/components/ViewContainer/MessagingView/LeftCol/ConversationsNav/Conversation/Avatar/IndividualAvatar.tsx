import * as React from "react";
import { Chat } from "@server/databases/chat/entity";
import { generateChatIconText } from "@renderer/utils";

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
            <svg id="icon" viewBox="0 0 1016 1017">
                <g id="background">
                    <path
                        className="cls-1"
                        // eslint-disable-next-line max-len
                        d="M1016,510A506.11,506.11,0,0,1,881.62,854.19C788.8,954.91,655.77,1018,508,1018S227.2,954.91,134.38,854.19A506.11,506.11,0,0,1,0,510C0,229.43,227.43,2,508,2S1016,229.43,1016,510Z"
                        transform="translate(0 -2)"
                    />
                </g>
                <g id="shoulders">
                    <path
                        className="cls-2"
                        // eslint-disable-next-line max-len
                        d="M847.49,789.35C763.15,880.87,642.27,938.19,508,938.19S252.85,880.87,168.51,789.35c52.27-114.61,184.56-196,339.49-196S795.22,674.74,847.49,789.35Z"
                        transform="translate(0 -2)"
                    />
                </g>
                <g id="head">
                    <ellipse className="cls-2" cx="508" cy="325.71" rx="205.71" ry="214.16" />
                </g>
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
            <circle id="contactBackground0" fill="url(#Gradient1)" cx="50%" cy="50%" r="25px" />
            <text id="aContactInitials" className="" x="50%" y="33px" textAnchor="middle" stroke="white">
                {generateChatIconText(chat)}
            </text>
        </svg>
    );
};
