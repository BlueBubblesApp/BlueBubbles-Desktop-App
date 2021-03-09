/* eslint-disable max-len */
import * as React from "react";
import { Chat } from "@server/databases/chat/entity";
import { generateChatIconText, getAvatarGradientIndex } from "@renderer/helpers/utils";

import "./styles.css";

interface Props {
    chat: Chat;
    isPinned?: boolean;
}

const IndividualAvatar = (props: Props) => {
    const { chat, isPinned } = props;
    const chatIconText = generateChatIconText(chat);

    if (chat.participants.length === 1 && chat.participants[0].avatar)
        return (
            <img
                style={{
                    width: isPinned ? "90px" : "50px",
                    height: isPinned ? "90px" : "50px",
                    marginTop: isPinned ? "5px" : "0px",
                    marginBottom: isPinned ? "5px" : "0px"
                }}
                className="avatar"
                src={chat.participants[0].avatar}
                alt={chat.participants[0].address}
            />
        );

    if (chatIconText === "?")
        return (
            <svg
                style={{
                    width: isPinned ? "90" : "50px",
                    height: isPinned ? "90" : "50px",
                    marginTop: isPinned ? "5px" : "0px",
                    marginBottom: isPinned ? "5px" : "0px"
                }}
                viewBox="0 0 1000 1000"
            >
                <defs>
                    <linearGradient id="ColoredGradient1" x1="0" x2="0" y1="1" y2="0">
                        <stop className="stop1" offset="0%" stopColor="#fd678d" />
                        <stop className="stop2" offset="100%" stopColor="#ff8aa8" />
                    </linearGradient>
                    <linearGradient id="ColoredGradient2" x1="0" x2="0" y1="1" y2="0">
                        <stop className="stop1" offset="0%" stopColor="#ff534d" />
                        <stop className="stop2" offset="100%" stopColor="#fd726a" />
                    </linearGradient>
                    <linearGradient id="ColoredGradient3" x1="0" x2="0" y1="1" y2="0">
                        <stop className="stop1" offset="0%" stopColor="#fea21c" />
                        <stop className="stop2" offset="100%" stopColor="#feb854" />
                    </linearGradient>
                    <linearGradient id="ColoredGradient4" x1="0" x2="0" y1="1" y2="0">
                        <stop className="stop1" offset="0%" stopColor="#ffca1c" />
                        <stop className="stop2" offset="100%" stopColor="#fcd752" />
                    </linearGradient>
                    <linearGradient id="ColoredGradient5" x1="0" x2="0" y1="1" y2="0">
                        <stop className="stop1" offset="0%" stopColor="#5ede79" />
                        <stop className="stop2" offset="100%" stopColor="#8de798" />
                    </linearGradient>
                    <linearGradient id="ColoredGradient6" x1="0" x2="0" y1="1" y2="0">
                        <stop className="stop1" offset="0%" stopColor="#6bcff6" />
                        <stop className="stop2" offset="100%" stopColor="#94ddfd" />
                    </linearGradient>
                    <linearGradient id="ColoredGradient7" x1="0" x2="0" y1="1" y2="0">
                        <stop className="stop1" offset="0%" stopColor="#a78df3" />
                        <stop className="stop2" offset="100%" stopColor="#bcabfc" />
                    </linearGradient>
                    <linearGradient id="ColoredGradient8" x1="0" x2="0" y1="1" y2="0">
                        <stop className="stop1" offset="0%" stopColor="#686868" />
                        <stop className="stop2" offset="100%" stopColor="#928E8E" />
                    </linearGradient>
                </defs>
                <circle
                    className="cls-1"
                    cx="50%"
                    cy="50%"
                    r="500"
                    fill={`url(#ColoredGradient${getAvatarGradientIndex(props.chat.participants[0])})`}
                />
                <mask id="rmvProfile">
                    <circle cx="50%" cy="50%" r="435" fill="white" />
                </mask>
                <ellipse className="cls-2" fill="white" cx="50%" cy="34%" rx="218" ry="234" />
                <circle className="cls-2" mask="url(#rmvProfile)" fill="white" cx="50%" cy="106%" r="400" />
            </svg>
        );

    return (
        <svg
            style={{
                width: isPinned ? "90" : "50px",
                height: isPinned ? "90" : "50px",
                marginTop: isPinned ? "5px" : "0px",
                marginBottom: isPinned ? "5px" : "0px"
            }}
        >
            <defs>
                <linearGradient id="ColoredGradient1" x1="0" x2="0" y1="1" y2="0">
                    <stop className="stop1" offset="0%" stopColor="#fd678d" />
                    <stop className="stop2" offset="100%" stopColor="#ff8aa8" />
                </linearGradient>
                <linearGradient id="ColoredGradient2" x1="0" x2="0" y1="1" y2="0">
                    <stop className="stop1" offset="0%" stopColor="#ff534d" />
                    <stop className="stop2" offset="100%" stopColor="#fd726a" />
                </linearGradient>
                <linearGradient id="ColoredGradient3" x1="0" x2="0" y1="1" y2="0">
                    <stop className="stop1" offset="0%" stopColor="#fea21c" />
                    <stop className="stop2" offset="100%" stopColor="#feb854" />
                </linearGradient>
                <linearGradient id="ColoredGradient4" x1="0" x2="0" y1="1" y2="0">
                    <stop className="stop1" offset="0%" stopColor="#ffca1c" />
                    <stop className="stop2" offset="100%" stopColor="#fcd752" />
                </linearGradient>
                <linearGradient id="ColoredGradient5" x1="0" x2="0" y1="1" y2="0">
                    <stop className="stop1" offset="0%" stopColor="#5ede79" />
                    <stop className="stop2" offset="100%" stopColor="#8de798" />
                </linearGradient>
                <linearGradient id="ColoredGradient6" x1="0" x2="0" y1="1" y2="0">
                    <stop className="stop1" offset="0%" stopColor="#6bcff6" />
                    <stop className="stop2" offset="100%" stopColor="#94ddfd" />
                </linearGradient>
                <linearGradient id="ColoredGradient7" x1="0" x2="0" y1="1" y2="0">
                    <stop className="stop1" offset="0%" stopColor="#a78df3" />
                    <stop className="stop2" offset="100%" stopColor="#bcabfc" />
                </linearGradient>
                <linearGradient id="ColoredGradient8" x1="0" x2="0" y1="1" y2="0">
                    <stop className="stop1" offset="0%" stopColor="#686868" />
                    <stop className="stop2" offset="100%" stopColor="#928E8E" />
                </linearGradient>
            </defs>
            <circle
                className="cls-1"
                fill={`url(#ColoredGradient${getAvatarGradientIndex(props.chat.participants[0])})`}
                cx="50%"
                cy="50%"
                r="50%"
            />
            <text
                className="cls-2"
                x="50%"
                y="67%"
                textAnchor="middle"
                fill="white"
                style={{ fontSize: isPinned ? "46px" : "23px" }}
            >
                {generateChatIconText(chat)}
            </text>
        </svg>
    );
};

export default IndividualAvatar;
