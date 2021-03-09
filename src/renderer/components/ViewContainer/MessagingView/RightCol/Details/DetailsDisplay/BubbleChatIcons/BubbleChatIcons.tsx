import * as React from "react";
import { getGradientIndex } from "@renderer/helpers/utils";
import "./BubbleChatIcons.css";

interface Props {
    participants: {
        initials: string[];
        avatars: string[];
        addresses: string[];
    };
    bubbleIconInitials: any;
}

const BubbleChatIcons = (props: Props) => {
    const { participants } = props;
    if (participants.initials.length === 0) return null;
    if (participants.initials.length === 1) {
        return (
            <>
                {participants.avatars[0] ? (
                    <img
                        className="detailsSingleAvatar"
                        style={{ height: "150px", width: "150px", borderRadius: "50%" }}
                        src={participants.avatars[0]}
                        alt="avatar"
                    />
                ) : (
                    <svg id="aChatHandleBubble" style={{ width: "150px", height: "150px" }}>
                        <circle
                            fill={`url(#ColoredGradient${getGradientIndex(participants[0])})`}
                            cy="50%"
                            cx="50%"
                            r="50%"
                        />
                        {props.bubbleIconInitials[0] === "?" ? (
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
                                {props.bubbleIconInitials[0]}
                            </text>
                        )}
                    </svg>
                )}
            </>
        );
    }

    if (props.participants.initials.length === 2) {
        return (
            <svg id="aChatHandleBubble" style={{ width: "300px", height: "170px" }}>
                <circle fill={`url(#ColoredGradient${getGradientIndex(participants[0])})`} cy="40%" cx="30%" r="26%" />
                <circle fill={`url(#ColoredGradient${getGradientIndex(participants[1])})`} cy="65%" cx="70%" r="20%" />
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

                {props.participants.avatars[0] ? (
                    <image
                        href={props.participants.avatars[0]}
                        mask="url(#rmvMainCircleAvatar)"
                        width="135px"
                        height="135px"
                        x="25px"
                        y="0px"
                    />
                ) : (
                    <>
                        {props.bubbleIconInitials[0] === "?" ? (
                            <>
                                <ellipse fill="white" cx="30%" cy="25%" rx="26px" ry="30px" />
                                <circle mask="url(#rmvMainCircle)" fill="white" cx="30%" cy="87%" r="65px" />
                            </>
                        ) : (
                            <text x="30%" y="55%" textAnchor="middle" fontSize="70px">
                                {props.bubbleIconInitials[0]}
                            </text>
                        )}
                    </>
                )}

                {props.participants.avatars[1] ? (
                    <image
                        href={props.participants.avatars[1]}
                        mask="url(#rmvMainCircle2Avatar)"
                        width="105px"
                        height="105px"
                        x="155px"
                        y="60px"
                    />
                ) : (
                    <>
                        {props.bubbleIconInitials[1] === "?" ? (
                            <>
                                <ellipse fill="white" cx="70%" cy="55%" rx="22px" ry="26px" />
                                <circle mask="url(#rmvMainCircle2)" fill="white" cx="70%" cy="110%" r="60px" />
                            </>
                        ) : (
                            <text x="70%" y="77%" textAnchor="middle" fontSize="55px">
                                {props.bubbleIconInitials[1]}
                            </text>
                        )}
                    </>
                )}
            </svg>
        );
    }

    if (props.participants.initials.length >= 3) {
        return (
            <svg id="aChatHandleBubble" style={{ width: "450px", height: "170px" }}>
                <defs>
                    <linearGradient id="Gradient1" x1="0" x2="0" y1="1" y2="0">
                        <stop className="stop1" offset="0%" stopColor="#686868" />
                        <stop className="stop2" offset="100%" stopColor="#928E8E" />
                    </linearGradient>
                </defs>
                <circle fill={`url(#ColoredGradient${getGradientIndex(participants[0])})`} cy="40%" cx="50%" r="18%" />
                <circle fill={`url(#ColoredGradient${getGradientIndex(participants[1])})`} cy="70%" cx="74%" r="14%" />
                <circle fill={`url(#ColoredGradient${getGradientIndex(participants[2])})`} cy="70%" cx="26%" r="14%" />
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

                {props.participants.avatars[0] ? (
                    <image
                        href={props.participants.avatars[0]}
                        mask="url(#rmvMainCircleAvatar)"
                        width="130px"
                        height="130px"
                        x="160px"
                        y="0px"
                    />
                ) : (
                    <>
                        {props.bubbleIconInitials[0] === "?" ? (
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
                                {props.bubbleIconInitials[0]}
                            </text>
                        )}
                    </>
                )}

                {props.participants.avatars[1] ? (
                    <image
                        href={props.participants.avatars[1]}
                        mask="url(#rmvMainCircle2Avatar)"
                        width="100px"
                        height="100px"
                        x="283px"
                        y="69px"
                    />
                ) : (
                    <>
                        {props.bubbleIconInitials[1] === "?" ? (
                            <>
                                <ellipse fill="white" cx="74%" cy="59%" rx="19px" ry="22px" />
                                <circle mask="url(#rmvMainCircle2)" fill="white" cx="74%" cy="112%" r="60px" />
                            </>
                        ) : (
                            <text x="74.2%" y="80%" textAnchor="middle" fontSize="45px">
                                {props.bubbleIconInitials[1]}
                            </text>
                        )}
                    </>
                )}

                {props.participants.avatars[2] ? (
                    <image
                        href={props.participants.avatars[2]}
                        mask="url(#rmvMainCircle3Avatar)"
                        width="100px"
                        height="100px"
                        x="66px"
                        y="69px"
                    />
                ) : (
                    <>
                        {props.bubbleIconInitials[2] === "?" ? (
                            <>
                                <ellipse fill="white" cx="26%" cy="59%" rx="19px" ry="22px" />
                                <circle mask="url(#rmvMainCircle3)" fill="white" cx="26%" cy="112%" r="60px" />
                            </>
                        ) : (
                            <text x="26%" y="80%" textAnchor="middle" fontSize="45px">
                                {props.bubbleIconInitials[2]}
                            </text>
                        )}
                    </>
                )}
            </svg>
        );
    }

    return <div />;
};

export default BubbleChatIcons;
