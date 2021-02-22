/* eslint-disable prefer-const */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable prefer-template */
/* eslint-disable no-unused-expressions */
/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable react/prefer-stateless-function */
/* eslint-disable max-len */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/self-closing-comp */
import * as React from "react";
import * as path from "path";
import * as fs from "fs";
import { Attachment, Chat, Message } from "@server/databases/chat/entity";
import { getSender, generateDetailsIconText, parseAppleLocation } from "@renderer/helpers/utils";
import "./BubbleChatIcons.css";
import { ipcRenderer } from "electron";

interface Props {
    participants: {
        initials: string[];
        avatars: string[];
        addresses: string[];
    };
    bubbleIconInitials: any;
}

interface State {
    firstGradientNumber: number;
    secondGradientNumber: number;
    thirdGradientNumber: number;
}

class BubbleChatIcons extends React.Component<Props, State> {
    constructor(props) {
        super(props);

        this.state = {
            firstGradientNumber: 8,
            secondGradientNumber: 8,
            thirdGradientNumber: 8
        };
    }

    async componentDidMount() {
        const seedrandom = require("seedrandom");
        let rng1;
        let rng2;
        let rng3;

        let rand1;
        let rand2;
        let rand3;

        let firstGradientNumber;
        let secondGradientNumber;
        let thirdGradientNumber;

        rng1 = seedrandom(this.props.participants.addresses[0]);
        rand1 = rng1();

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

        if (this.props.participants.addresses.length === 2) {
            rng2 = seedrandom(this.props.participants.addresses[1]);
            rand2 = rng2();

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
        } else if (this.props.participants.addresses.length > 2) {
            rng2 = seedrandom(this.props.participants.addresses[1]);
            rng3 = seedrandom(this.props.participants.addresses[2]);
            rand2 = rng2();
            rand3 = rng3();

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

            if (rand3 <= 1 / 7) {
                this.setState({ thirdGradientNumber: 1 });
            } else if (rand3 > 1 / 7 && rand3 <= 2 / 7) {
                this.setState({ thirdGradientNumber: 2 });
            } else if (rand3 > 2 / 7 && rand3 <= 3 / 7) {
                this.setState({ thirdGradientNumber: 3 });
            } else if (rand3 > 3 / 7 && rand3 <= 4 / 7) {
                this.setState({ thirdGradientNumber: 4 });
            } else if (rand3 > 4 / 7 && rand3 <= 5 / 7) {
                this.setState({ thirdGradientNumber: 5 });
            } else if (rand3 > 5 / 7 && rand3 <= 6 / 7) {
                this.setState({ thirdGradientNumber: 6 });
            } else if (rand3 > 6 / 7 && rand3 <= 7 / 7) {
                this.setState({ thirdGradientNumber: 7 });
            }
        }

        const config = await ipcRenderer.invoke("get-config");
        if (!config.colorfulContacts) {
            this.setState({ firstGradientNumber: 8, secondGradientNumber: 8, thirdGradientNumber: 8 });
        }
    }

    render() {
        if (this.props.participants.initials.length === 0) return null;

        if (this.props.participants.initials.length === 1) {
            return (
                <>
                    {this.props.participants.avatars[0] ? (
                        <img
                            className="detailsSingleAvatar"
                            style={{ height: "150px", width: "150px", borderRadius: "50%" }}
                            src={this.props.participants.avatars[0]}
                        />
                    ) : (
                        <svg id="aChatHandleBubble" style={{ width: "150px", height: "150px" }}>
                            <circle
                                fill={`url(#ColoredGradient${this.state.firstGradientNumber})`}
                                cy="50%"
                                cx="50%"
                                r="50%"
                            />
                            {this.props.bubbleIconInitials[0] === "?" ? (
                                <>
                                    <mask id="rmvMainCircle">
                                        <circle cy="50%" cx="50%" r="70%" fill="black" />
                                        <circle cy="50%" cx="50%" r="45%" fill="white" />
                                    </mask>
                                    <ellipse fill="white" cx="50%" cy="35%" rx="32px" ry="36px" />
                                    <circle mask="url(#rmvMainCircle)" fill="white" cx="50%" cy="115%" r="75px" />
                                </>
                            ) : (
                                <text x="50%" y="67%" textAnchor="middle" fontSize="75px">
                                    {this.props.bubbleIconInitials[0]}
                                </text>
                            )}
                        </svg>
                    )}
                </>
            );
        }

        if (this.props.participants.initials.length === 2) {
            return (
                <svg id="aChatHandleBubble" style={{ width: "300px", height: "170px" }}>
                    <circle fill={`url(#ColoredGradient${this.state.firstGradientNumber})`} cy="40%" cx="30%" r="26%" />
                    <circle
                        fill={`url(#ColoredGradient${this.state.secondGradientNumber})`}
                        cy="65%"
                        cx="70%"
                        r="20%"
                    />
                    <mask id="rmvMainCircle">
                        <circle cy="40%" cx="30%" r="50%" fill="black" />
                        <circle cy="40%" cx="30%" r="23%" fill="white" />
                    </mask>
                    <mask id="rmvMainCircleAvatar">
                        <circle cy="40%" cx="30%" r="50%" fill="black" />
                        <circle cy="40%" cx="30%" r="26%" fill="white" />
                    </mask>
                    <mask id="rmvMainCircle2">
                        <circle cy="65%" cx="70%" r="50%" fill="black" />
                        <circle cy="65%" cx="70%" r="18%" fill="white" />
                    </mask>
                    <mask id="rmvMainCircle2Avatar">
                        <circle cy="65%" cx="70%" r="50%" fill="black" />
                        <circle cy="65%" cx="70%" r="20%" fill="white" />
                    </mask>

                    {this.props.participants.avatars[0] ? (
                        <image
                            href={this.props.participants.avatars[0]}
                            mask="url(#rmvMainCircleAvatar)"
                            width="135px"
                            height="135px"
                            x="25px"
                            y="0px"
                        />
                    ) : (
                        <>
                            {this.props.bubbleIconInitials[0] === "?" ? (
                                <>
                                    <ellipse fill="white" cx="30%" cy="25%" rx="26px" ry="30px" />
                                    <circle mask="url(#rmvMainCircle)" fill="white" cx="30%" cy="87%" r="65px" />
                                </>
                            ) : (
                                <text x="30%" y="55%" textAnchor="middle" fontSize="70px">
                                    {this.props.bubbleIconInitials[0]}
                                </text>
                            )}
                        </>
                    )}

                    {this.props.participants.avatars[1] ? (
                        <image
                            href={this.props.participants.avatars[1]}
                            mask="url(#rmvMainCircle2Avatar)"
                            width="105px"
                            height="105px"
                            x="155px"
                            y="60px"
                        />
                    ) : (
                        <>
                            {this.props.bubbleIconInitials[1] === "?" ? (
                                <>
                                    <ellipse fill="white" cx="70%" cy="55%" rx="22px" ry="26px" />
                                    <circle mask="url(#rmvMainCircle2)" fill="white" cx="70%" cy="110%" r="60px" />
                                </>
                            ) : (
                                <text x="70%" y="77%" textAnchor="middle" fontSize="55px">
                                    {this.props.bubbleIconInitials[1]}
                                </text>
                            )}
                        </>
                    )}
                </svg>
            );
        }

        if (this.props.participants.initials.length >= 3) {
            return (
                <svg id="aChatHandleBubble" style={{ width: "450px", height: "170px" }}>
                    <defs>
                        <linearGradient id="Gradient1" x1="0" x2="0" y1="1" y2="0">
                            <stop className="stop1" offset="0%" stopColor="#686868" />
                            <stop className="stop2" offset="100%" stopColor="#928E8E" />
                        </linearGradient>
                    </defs>
                    <circle fill={`url(#ColoredGradient${this.state.firstGradientNumber})`} cy="40%" cx="50%" r="18%" />
                    <circle
                        fill={`url(#ColoredGradient${this.state.secondGradientNumber})`}
                        cy="70%"
                        cx="74%"
                        r="14%"
                    />
                    <circle fill={`url(#ColoredGradient${this.state.thirdGradientNumber})`} cy="70%" cx="26%" r="14%" />
                    <mask id="rmvMainCircle">
                        <circle cy="40%" cx="50%" r="50%" fill="black" />
                        <circle cy="40%" cx="50%" r="16%" fill="white" />
                    </mask>
                    <mask id="rmvMainCircleAvatar">
                        <circle cy="40%" cx="50%" r="50%" fill="black" />
                        <circle cy="40%" cx="50%" r="18%" fill="white" />
                    </mask>
                    <mask id="rmvMainCircle2">
                        <circle cy="70%" cx="74%" r="50%" fill="black" />
                        <circle cy="70%" cx="74%" r="12%" fill="white" />
                    </mask>
                    <mask id="rmvMainCircle2Avatar">
                        <circle cy="70%" cx="74%" r="50%" fill="black" />
                        <circle cy="70%" cx="74%" r="14%" fill="white" />
                    </mask>
                    <mask id="rmvMainCircle3">
                        <circle cy="70%" cx="26%" r="50%" fill="black" />
                        <circle cy="70%" cx="26%" r="12%" fill="white" />
                    </mask>
                    <mask id="rmvMainCircle3Avatar">
                        <circle cy="70%" cx="26%" r="50%" fill="black" />
                        <circle cy="70%" cx="26%" r="14%" fill="white" />
                    </mask>

                    {this.props.participants.avatars[0] ? (
                        <image
                            href={this.props.participants.avatars[0]}
                            mask="url(#rmvMainCircleAvatar)"
                            width="130px"
                            height="130px"
                            x="160px"
                            y="0px"
                        />
                    ) : (
                        <>
                            {this.props.bubbleIconInitials[0] === "?" ? (
                                <>
                                    <mask id="rmvMainCircle">
                                        <circle cy="40%" cx="50%" r="50%" fill="black" />
                                        <circle cy="40%" cx="50%" r="16%" fill="white" />
                                    </mask>
                                    <ellipse fill="white" cx="50%" cy="25%" rx="28px" ry="32px" />
                                    <circle mask="url(#rmvMainCircle)" fill="white" cx="50%" cy="89%" r="69px" />
                                </>
                            ) : (
                                <text x="49.5%" y="54%" textAnchor="middle" fontSize="65px">
                                    {this.props.bubbleIconInitials[0]}
                                </text>
                            )}
                        </>
                    )}

                    {this.props.participants.avatars[1] ? (
                        <image
                            href={this.props.participants.avatars[1]}
                            mask="url(#rmvMainCircle2Avatar)"
                            width="100px"
                            height="100px"
                            x="283px"
                            y="69px"
                        />
                    ) : (
                        <>
                            {this.props.bubbleIconInitials[1] === "?" ? (
                                <>
                                    <ellipse fill="white" cx="74%" cy="59%" rx="19px" ry="22px" />
                                    <circle mask="url(#rmvMainCircle2)" fill="white" cx="74%" cy="112%" r="60px" />
                                </>
                            ) : (
                                <text x="74.2%" y="80%" textAnchor="middle" fontSize="45px">
                                    {this.props.bubbleIconInitials[1]}
                                </text>
                            )}
                        </>
                    )}

                    {this.props.participants.avatars[2] ? (
                        <image
                            href={this.props.participants.avatars[2]}
                            mask="url(#rmvMainCircle3Avatar)"
                            width="100px"
                            height="100px"
                            x="66px"
                            y="69px"
                        />
                    ) : (
                        <>
                            {this.props.bubbleIconInitials[2] === "?" ? (
                                <>
                                    <ellipse fill="white" cx="26%" cy="59%" rx="19px" ry="22px" />
                                    <circle mask="url(#rmvMainCircle3)" fill="white" cx="26%" cy="112%" r="60px" />
                                </>
                            ) : (
                                <text x="26%" y="80%" textAnchor="middle" fontSize="45px">
                                    {this.props.bubbleIconInitials[2]}
                                </text>
                            )}
                        </>
                    )}
                </svg>
            );
        }

        return <div></div>;
    }
}

export default BubbleChatIcons;
