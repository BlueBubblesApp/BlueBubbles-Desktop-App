/* eslint-disable max-len */
import * as React from "react";
import { Chat } from "@server/databases/chat/entity";
import { generateChatIconText } from "@renderer/helpers/utils";

import "./styles.css";
import { ipcRenderer } from "electron";

interface Props {
    chat: Chat;
}

interface State {
    firstGradientNumber: number;
}

class IndividualAvatar extends React.Component<Props, State> {
    constructor(props) {
        super(props);

        this.state = {
            firstGradientNumber: 8
        };
    }

    async componentDidMount() {
        const config = await ipcRenderer.invoke("get-config");

        const seedrandom = require("seedrandom");
        const rng = seedrandom(this.props.chat.participants[0].address);
        const rand1 = rng();

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

        if (!config.colorfulContacts) {
            this.setState({ firstGradientNumber: 8 });
        }
    }

    render() {
        const { chat } = this.props;
        const chatIconText = generateChatIconText(chat);

        if (chat.participants.length === 1 && chat.participants[0].avatar)
            return <img className="avatar" src={chat.participants[0].avatar} alt={chat.participants[0].address} />;

        if (chatIconText === "?")
            return (
                <svg height="50px" width="50px" viewBox="0 0 1000 1000">
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
                        fill={`url(#ColoredGradient${this.state.firstGradientNumber})`}
                    />
                    <mask id="rmvProfile">
                        <circle cx="50%" cy="50%" r="435" fill="white" />
                    </mask>
                    <ellipse className="cls-2" fill="white" cx="50%" cy="34%" rx="218" ry="234" />
                    <circle className="cls-2" mask="url(#rmvProfile)" fill="white" cx="50%" cy="106%" r="400" />
                </svg>
            );

        return (
            <svg height="50px" width="50px">
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
                    fill={`url(#ColoredGradient${this.state.firstGradientNumber})`}
                    cx="50%"
                    cy="50%"
                    r="25px"
                />
                <text className="cls-2" x="50%" y="33px" textAnchor="middle" fill="white">
                    {generateChatIconText(chat)}
                </text>
            </svg>
        );
    }
}

export default IndividualAvatar;
