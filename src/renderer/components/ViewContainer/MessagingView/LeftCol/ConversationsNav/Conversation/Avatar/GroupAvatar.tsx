import * as React from "react";
import { Chat, Handle } from "@server/databases/chat/entity";
import { generateChatIconText } from "@renderer/utils";
import { IndividualAvatar } from "./IndividualAvatar";

import "./styles.css";

type Props = {
    chat: Chat;
};

export const GroupAvatar = ({ chat }: Props) => {
    const chatIconText = generateChatIconText(chat);

    const firstParticipant: Handle = chat.participants[0];
    const secondParticipant: Handle = chat.participants[1];

    return (
        <svg className="dynamicIcon" height="50px" width="50px">
            <defs>
                <linearGradient id="Gradient1" x1="0" x2="0" y1="1" y2="0">
                    <stop className="stop1" offset="0%" stopColor="#686868" />
                    <stop className="stop2" offset="100%" stopColor="#928E8E" />
                </linearGradient>
            </defs>
            <mask id="rmvCir">
                <circle cx="32%" cy="40%" r="16px" fill="white" />
                <circle cx="68%" cy="60%" r="18px" fill="black" />
            </mask>
            <circle className="cls-1" mask="url(#rmvCir)" fill="url(#Gradient1)" cx="32%" cy="40%" r="16px" />
            {firstParticipant.avatar ? (
                <image
                    mask="url(#rmvCir)"
                    height="26px"
                    width="26px"
                    y="6px"
                    x="4px"
                    href={firstParticipant.avatar}
                    radius="52px"
                />
            ) : (
                <>
                    {chatIconText[0] === "?" ? (
                        <>
                            <mask id="rmv1stProfile">
                                <circle cx="32%" cy="40%" r="14px" fill="white" />
                                <circle cx="68%" cy="60%" r="18px" fill="black" />
                            </mask>
                            <ellipse
                                className="cls-2"
                                mask="url(#rmvCir)"
                                fill="white"
                                cx="32%"
                                cy="28%"
                                rx="6px"
                                ry="7px"
                            />
                            <circle
                                className="cls-2"
                                mask="url(#rmv1stProfile)"
                                fill="white"
                                cx="32%"
                                cy="80%"
                                r="15px"
                            />
                        </>
                    ) : (
                        <text
                            id="groupContactInitials-1"
                            className="cls-2"
                            mask="url(#rmvCir)"
                            x="32%"
                            y="25px"
                            textAnchor="middle"
                            stroke="white"
                        >
                            {chatIconText[0]}
                        </text>
                    )}
                </>
            )}

            <circle className="cls-1" fill="url(#Gradient1)" cx="68%" cy="60%" r="16px" />
            {secondParticipant.avatar ? (
                <image height="26px" width="26px" y="15px" x="20px" href={secondParticipant.avatar} radius="52px" />
            ) : (
                <>
                    {chatIconText[1] === "?" ? (
                        <>
                            <mask id="rmv2ndProfile">
                                <circle cx="68%" cy="60%" r="14px" fill="white" />
                            </mask>
                            <ellipse className="cls-2" fill="white" cx="68%" cy="49%" rx="6px" ry="7px" />
                            <circle
                                className="cls-2"
                                mask="url(#rmv2ndProfile)"
                                fill="white"
                                cx="68%"
                                cy="100%"
                                r="15px"
                            />
                        </>
                    ) : (
                        <text
                            id="groupContactInitials-2"
                            className="cls-2"
                            x="68%"
                            y="36px"
                            textAnchor="middle"
                            stroke="white"
                        >
                            {chatIconText[1]}
                        </text>
                    )}
                </>
            )}
        </svg>
    );
};
