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

interface Props {
    participants: string[];
    bubbleIconInitials: any;
}

// interface State {
// }

class BubbleChatIcons extends React.Component<Props, unknown> {
    constructor(props) {
        super(props);

        this.state = {};
    }

    // async componentDidMount() {
    // }

    render() {
        console.log(this.props.participants.length);

        if (this.props.participants.length === 0) return null;

        if (this.props.participants.length === 1) {
            return (
                <svg id="aChatHandleBubble" style={{ width: "150px", height: "150px" }}>
                    <defs>
                        <linearGradient id="Gradient1" x1="0" x2="0" y1="1" y2="0">
                            <stop className="stop1" offset="0%" stopColor="#686868" />
                            <stop className="stop2" offset="100%" stopColor="#928E8E" />
                        </linearGradient>
                    </defs>
                    <circle fill="url(#Gradient1)" cy="50%" cx="50%" r="50%" />
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
                        <text x="50%" y="67%" textAnchor="middle" stroke="white" fontSize="75px">
                            {this.props.bubbleIconInitials[0]}
                        </text>
                    )}
                </svg>
            );
        }

        if (this.props.participants.length === 2) {
            return (
                <svg id="aChatHandleBubble" style={{ width: "300px", height: "170px" }}>
                    <defs>
                        <linearGradient id="Gradient1" x1="0" x2="0" y1="1" y2="0">
                            <stop className="stop1" offset="0%" stopColor="#686868" />
                            <stop className="stop2" offset="100%" stopColor="#928E8E" />
                        </linearGradient>
                    </defs>
                    <circle fill="url(#Gradient1)" cy="40%" cx="30%" r="26%" />
                    <circle fill="url(#Gradient1)" cy="65%" cx="70%" r="20%" />

                    {this.props.bubbleIconInitials[0] === "?" ? (
                        <>
                            <mask id="rmvMainCircle">
                                <circle cy="40%" cx="30%" r="50%" fill="black" />
                                <circle cy="40%" cx="30%" r="23%" fill="white" />
                            </mask>
                            <ellipse fill="white" cx="30%" cy="25%" rx="26px" ry="30px" />
                            <circle mask="url(#rmvMainCircle)" fill="white" cx="30%" cy="87%" r="65px" />
                        </>
                    ) : (
                        <text x="30%" y="55%" textAnchor="middle" stroke="white" fontSize="70px">
                            {this.props.bubbleIconInitials[0]}
                        </text>
                    )}

                    {this.props.bubbleIconInitials[1] === "?" ? (
                        <>
                            <mask id="rmvMainCircle2">
                                <circle cy="65%" cx="70%" r="50%" fill="black" />
                                <circle cy="65%" cx="70%" r="18%" fill="white" />
                            </mask>
                            <ellipse fill="white" cx="70%" cy="55%" rx="22px" ry="26px" />
                            <circle mask="url(#rmvMainCircle2)" fill="white" cx="70%" cy="110%" r="60px" />
                        </>
                    ) : (
                        <text x="70%" y="77%" textAnchor="middle" stroke="white" fontSize="55px">
                            {this.props.bubbleIconInitials[1]}
                        </text>
                    )}
                </svg>
            );
        }

        if (this.props.participants.length >= 3) {
            return (
                <svg id="aChatHandleBubble" style={{ width: "450px", height: "170px" }}>
                    <defs>
                        <linearGradient id="Gradient1" x1="0" x2="0" y1="1" y2="0">
                            <stop className="stop1" offset="0%" stopColor="#686868" />
                            <stop className="stop2" offset="100%" stopColor="#928E8E" />
                        </linearGradient>
                    </defs>
                    <circle fill="url(#Gradient1)" cy="40%" cx="50%" r="18%" />
                    <circle fill="url(#Gradient1)" cy="70%" cx="74%" r="14%" />
                    <circle fill="url(#Gradient1)" cy="70%" cx="26%" r="14%" />

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
                        <text x="50%" y="55%" textAnchor="middle" stroke="white" fontSize="70px">
                            {this.props.bubbleIconInitials[0]}
                        </text>
                    )}

                    {this.props.bubbleIconInitials[1] === "?" ? (
                        <>
                            <mask id="rmvMainCircle2">
                                <circle cy="70%" cx="74%" r="50%" fill="black" />
                                <circle cy="70%" cx="74%" r="12%" fill="white" />
                            </mask>
                            <ellipse fill="white" cx="74%" cy="59%" rx="19px" ry="22px" />
                            <circle mask="url(#rmvMainCircle2)" fill="white" cx="74%" cy="112%" r="60px" />
                        </>
                    ) : (
                        <text x="74%" y="81%" textAnchor="middle" stroke="white" fontSize="55px">
                            {this.props.bubbleIconInitials[1]}
                        </text>
                    )}

                    {this.props.bubbleIconInitials[2] === "?" ? (
                        <>
                            <mask id="rmvMainCircle3">
                                <circle cy="70%" cx="26%" r="50%" fill="black" />
                                <circle cy="70%" cx="26%" r="12%" fill="white" />
                            </mask>
                            <ellipse fill="white" cx="26%" cy="59%" rx="19px" ry="22px" />
                            <circle mask="url(#rmvMainCircle3)" fill="white" cx="26%" cy="112%" r="60px" />
                        </>
                    ) : (
                        <text x="26%" y="81%" textAnchor="middle" stroke="white" fontSize="55px">
                            {this.props.bubbleIconInitials[2]}
                        </text>
                    )}
                </svg>
            );
        }

        // if(this.props.participants.length >= 5) {
        //     return(

        //     );
        // }

        return <div></div>;
    }
}

export default BubbleChatIcons;
