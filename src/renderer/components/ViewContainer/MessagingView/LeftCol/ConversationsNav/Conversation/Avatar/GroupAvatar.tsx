/* eslint-disable max-len */
import * as React from "react";
import { Chat, Handle } from "@server/databases/chat/entity";
import { generateChatIconText } from "@renderer/helpers/utils";

import "./styles.css";
import { ipcRenderer } from "electron";

interface Props {
    chat: Chat;
}

interface State {
    firstGradientNumber: number;
    secondGradientNumber: number;
}

class GroupAvatar extends React.Component<Props, State> {
    constructor(props) {
        super(props);

        this.state = {
            firstGradientNumber: 8,
            secondGradientNumber: 8
        };
    }

    async componentDidMount() {
        const seedrandom = require("seedrandom");
        const rng1 = seedrandom(this.props.chat.participants[0].address);
        const rng2 = seedrandom(this.props.chat.participants[1].address);

        const rand1 = rng1();
        const rand2 = rng2();

        if (rand1 <= 1 / 7) {
            this.setState({ firstGradientNumber: 1 });
        } else if (rand1 > 1 / 7 && rand1 <= 2 / 7) {
            this.setState({ firstGradientNumber: 2 });
        } else if (rand1 > 2 / 7 && rand1 <= 3 / 7) {
            this.setState({ firstGradientNumber: 3 });
        } else if (rand1 > 3 / 7 && rand1 <= 4 / 7) {
            this.setState({ firstGradientNumber: 4 });
        } else if (rand1 > 4 / 7 && rand1 <= 5 / 7) {
            this.setState({ firstGradientNumber: 5 });
        } else if (rand1 > 5 / 7 && rand1 <= 6 / 7) {
            this.setState({ firstGradientNumber: 6 });
        } else if (rand1 > 6 / 7 && rand1 <= 7 / 7) {
            this.setState({ firstGradientNumber: 7 });
        }

        if (rand2 <= 1 / 7) {
            this.setState({ secondGradientNumber: 1 });
        } else if (rand2 > 1 / 7 && rand2 <= 2 / 7) {
            this.setState({ secondGradientNumber: 2 });
        } else if (rand2 > 2 / 7 && rand2 <= 3 / 7) {
            this.setState({ secondGradientNumber: 3 });
        } else if (rand2 > 3 / 7 && rand2 <= 4 / 7) {
            this.setState({ secondGradientNumber: 4 });
        } else if (rand2 > 4 / 7 && rand2 <= 5 / 7) {
            this.setState({ secondGradientNumber: 5 });
        } else if (rand2 > 5 / 7 && rand2 <= 6 / 7) {
            this.setState({ secondGradientNumber: 6 });
        } else if (rand2 > 6 / 7 && rand2 <= 7 / 7) {
            this.setState({ secondGradientNumber: 7 });
        }

        const config = await ipcRenderer.invoke("get-config");

        if (!config.colorfulContacts) {
            this.setState({ firstGradientNumber: 8, secondGradientNumber: 8 });
        }
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
                    <circle cx="68%" cy="60%" r="16px" fill="white" />
                </mask>
                <circle
                    className="cls-1"
                    mask="url(#rmvCir)"
                    fill={`url(#ColoredGradient${this.state.firstGradientNumber})`}
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
                            >
                                {chatIconText[0]}
                            </text>
                        )}
                    </>
                )}

                <circle
                    className="cls-1"
                    fill={`url(#ColoredGradient${this.state.secondGradientNumber})`}
                    cx="68%"
                    cy="60%"
                    r="16px"
                />
                {secondParticipant.avatar ? (
                    <image
                        mask="url(#rmv2ndProfile)"
                        height="35px"
                        width="35px"
                        y="14px"
                        x="17px"
                        href={secondParticipant.avatar}
                        radius="52px"
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
                            <text id="groupContactInitials-2" className="cls-2" x="68%" y="36px" textAnchor="middle">
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
