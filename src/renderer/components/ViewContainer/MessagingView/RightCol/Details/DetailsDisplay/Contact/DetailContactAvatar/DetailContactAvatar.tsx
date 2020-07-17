/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable max-len */
import * as React from "react";
import "./DetailContactAvatar.css";
import { Chat } from "@server/databases/chat/entity";

interface Props {
    chat: Chat;
    contactInitials: String;
}

interface State {}

class DetailContactAvatar extends React.Component<Props, State> {
    state = {};

    render() {
        return (
            // eslint-disable-next-line react/self-closing-comp
            <svg id="testContact" className="dynamicIcon" height="34px" width="34px" viewBox="0 0 100 100">
                <defs>
                    <linearGradient id="Gradient1" x1="0" x2="0" y1="1" y2="0">
                        <stop className="stop1" offset="0%" stopColor="#686868" />
                        <stop className="stop2" offset="100%" stopColor="#928E8E" />
                    </linearGradient>
                </defs>
                <circle className="cls-1" fill="url(#Gradient1)" cx="50%" cy="50%" r="50" />
                <text id="contactAvatarInitials" x="50" y="66" stroke="none" textAnchor="middle">
                    {this.props.contactInitials}
                </text>
            </svg>
        );
    }
}

export default DetailContactAvatar;
