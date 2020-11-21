/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable max-len */
import * as React from "react";
import "./DetailContactAvatar.css";
import { Chat } from "@server/databases/chat/entity";

interface Props {
    chat: Chat;
    contactInitials: String;
    gradientNumber: number;
}

interface State {}

class DetailContactAvatar extends React.Component<Props, State> {
    state = {};

    render() {
        return (
            // eslint-disable-next-line react/self-closing-comp
            <svg height="34px" width="34px" viewBox="0 0 100 100">
                <circle
                    className="cls-1"
                    fill={`url(#ColoredGradient${this.props.gradientNumber})`}
                    cx="50%"
                    cy="50%"
                    r="50"
                />
                <text id="contactAvatarInitials" x="50" y="66" stroke="none" textAnchor="middle">
                    {this.props.contactInitials}
                </text>
            </svg>
        );
    }
}

export default DetailContactAvatar;
