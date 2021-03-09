/* eslint-disable max-len */
import * as React from "react";
import { Chat, Handle } from "@server/databases/chat/entity";
import { generateChatIconText, getAvatarGradientIndex } from "@renderer/helpers/utils";
import { blankAvatarSrc } from "@renderer/helpers/constants";

import "./styles.css";

interface Props {
    chat: Chat;
    isPinned?: boolean;
}

class GroupAvatar extends React.Component<Props, unknown> {
    setEmptyAvatar(index: number) {
        this.props.chat.participants[index].avatar = blankAvatarSrc;
        this.setState({});
    }

    render() {
        const { chat } = this.props;
        const chatIconText = generateChatIconText(chat);

        const firstParticipant: Handle = chat.participants[0];
        const secondParticipant: Handle = chat.participants[1];

        return (
            <svg height="50px" width="50px">
                <mask id="rmvCir">
                    <circle cx="32%" cy="40%" r="16px" fill="white" />
                    <circle cx="68%" cy="60%" r="18px" fill="black" />
                </mask>
                <mask id="rmv2ndProfile">
                    <circle cx="68%" cy="60%" r="13px" fill="white" />
                </mask>
                <mask id="rmv2ndProfileAvatar">
                    <circle cx="68%" cy="60%" r="16px" fill="white" />
                </mask>
                <circle
                    className="cls-1"
                    mask="url(#rmvCir)"
                    fill={`url(#ColoredGradient${getAvatarGradientIndex(firstParticipant)}`}
                    cx="32%"
                    cy="40%"
                    r="16px"
                />
                {firstParticipant.avatar ? (
                    <image
                        mask="url(#rmvCir)"
                        height="35px"
                        width="35px"
                        y="4px"
                        x="-2px"
                        href={firstParticipant.avatar}
                        radius="52px"
                        onError={() => this.setEmptyAvatar(0)}
                    />
                ) : (
                    <>
                        {chatIconText[0] === "?" ? (
                            <>
                                <mask id="rmv1stProfile">
                                    <circle cx="32%" cy="40%" r="13px" fill="white" />
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
                            >
                                {chatIconText[0]}
                            </text>
                        )}
                    </>
                )}

                <circle
                    className="cls-1"
                    fill={`url(#ColoredGradient${getAvatarGradientIndex(secondParticipant)})`}
                    cx="68%"
                    cy="60%"
                    r="16px"
                />
                {secondParticipant.avatar ? (
                    <image
                        mask="url(#rmv2ndProfileAvatar)"
                        height="35px"
                        width="35px"
                        y="14px"
                        x="17px"
                        href={secondParticipant.avatar}
                        radius="52px"
                        onError={() => this.setEmptyAvatar(1)}
                    />
                ) : (
                    <>
                        {chatIconText[1] === "?" ? (
                            <>
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
                            <text id="groupContactInitials-2" className="cls-2" x="68%" y="35px" textAnchor="middle">
                                {chatIconText[1]}
                            </text>
                        )}
                    </>
                )}
            </svg>
        );
    }
}

export default GroupAvatar;
