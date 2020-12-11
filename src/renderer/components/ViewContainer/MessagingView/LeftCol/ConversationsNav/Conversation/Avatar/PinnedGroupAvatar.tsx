/* eslint-disable max-len */
import * as React from "react";
import { Chat, Handle } from "@server/databases/chat/entity";
import { generateChatIconText } from "@renderer/helpers/utils";

import "./styles.css";
import { ipcRenderer } from "electron";

interface Props {
    chat: Chat;
    isPinned?: boolean;
}

interface State {
    firstGradientNumber: number;
    secondGradientNumber: number;
}

class PinnedGroupAvatar extends React.Component<Props, State> {
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
        const { chat, isPinned } = this.props;
        const chatIconText = generateChatIconText(chat);

        const firstParticipant: Handle = chat.participants[0];
        const secondParticipant: Handle = chat.participants[1];

        return (
            <svg height="100px" width="100px">
                <mask id="rmvCir-Pinned">
                    <circle cx="32%" cy="40%" r="32px" fill="white" />
                    <circle cx="68%" cy="60%" r="36px" fill="black" />
                </mask>
                <mask id="rmv2ndProfile-Pinned">
                    <circle cx="68%" cy="60%" r="26px" fill="white" />
                </mask>
                <mask id="rmv2ndProfileAvatar-Pinned">
                    <circle cx="68%" cy="60%" r="32px" fill="white" />
                </mask>
                <circle
                    className="cls-1"
                    mask="url(#rmvCir-Pinned)"
                    fill={`url(#ColoredGradient${this.state.firstGradientNumber})`}
                    cx="32%"
                    cy="40%"
                    r="32px"
                />
                {firstParticipant.avatar ? (
                    <image
                        mask="url(#rmvCir-Pinned)"
                        height="70px"
                        width="70px"
                        y="4px"
                        x="-2px"
                        href={firstParticipant.avatar}
                        radius="102px"
                    />
                ) : (
                    <>
                        {chatIconText[0] === "?" ? (
                            <>
                                <mask id="rmv1stProfile-Pinned">
                                    <circle cx="32%" cy="40%" r="26px" fill="white" />
                                    <circle cx="68%" cy="60%" r="36px" fill="black" />
                                </mask>
                                <ellipse
                                    className="cls-2"
                                    mask="url(#rmvCir-Pinned)"
                                    fill="white"
                                    cx="32%"
                                    cy="28%"
                                    rx="12px"
                                    ry="14px"
                                />
                                <circle
                                    className="cls-2"
                                    mask="url(#rmv1stProfile-Pinned)"
                                    fill="white"
                                    cx="32%"
                                    cy="80%"
                                    r="30px"
                                />
                            </>
                        ) : (
                            <text
                                id="groupContactInitials-1"
                                className="cls-2"
                                style={{ fontSize: "28px" }}
                                mask="url(#rmvCir-Pinned)"
                                x="32%"
                                y="50px"
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
                    r="32px"
                />
                {secondParticipant.avatar ? (
                    <image
                        mask="url(#rmv2ndProfileAvatar-Pinned)"
                        height="35px"
                        width="35px"
                        y="28px"
                        x="34px"
                        href={secondParticipant.avatar}
                        radius="102px"
                    />
                ) : (
                    <>
                        {chatIconText[1] === "?" ? (
                            <>
                                <ellipse className="cls-2" fill="white" cx="68%" cy="49%" rx="12px" ry="14px" />
                                <circle
                                    className="cls-2"
                                    mask="url(#rmv2ndProfile-Pinned)"
                                    fill="white"
                                    cx="68%"
                                    cy="100%"
                                    r="30px"
                                />
                            </>
                        ) : (
                            <text
                                id="groupContactInitials-2"
                                style={{ fontSize: "28px" }}
                                className="cls-2"
                                x="68%"
                                y="70px"
                                textAnchor="middle"
                            >
                                {chatIconText[1]}
                            </text>
                        )}
                    </>
                )}
            </svg>
        );
    }
}

export default PinnedGroupAvatar;
