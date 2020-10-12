/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable max-len */
import * as React from "react";
import "./DetailContact.css";
import { Chat } from "@server/databases/chat/entity";
import { getSender, generateDetailsIconText } from "@renderer/helpers/utils";
import { ipcRenderer } from "electron";
import DetailContactAvatar from "./DetailContactAvatar/DetailContactAvatar";

interface Props {
    chat: Chat;
    index: number;
    name: string;
    address: string;
}

interface State {}

class DetailContact extends React.Component<Props, State> {
    async jumpToContactChat() {
        const payload = { newChatAddresses: this.props.address, matchingAddress: this.props.address };
        await ipcRenderer.invoke("start-new-chat", payload);
    }

    render() {
        console.log(this.props.chat);
        const detailsIconText = generateDetailsIconText(this.props.chat);
        const participants = this.props.chat.participants.map(handle => getSender(handle));

        // If contact has an avatar
        if (this.props.chat.participants[this.props.index].avatar) {
            return (
                <img
                    className="avatar"
                    src={this.props.chat.participants[this.props.index].avatar}
                    alt={this.props.chat.participants[this.props.index].address}
                />
            );
        }

        return (
            <div className="DetailContact">
                <div className="ContactWrap">
                    <div className="ContactLeft">
                        {detailsIconText[this.props.index] === "?" ? (
                            <svg height="34px" width="34px" viewBox="0 0 1000 1000">
                                <defs>
                                    <linearGradient id="Gradient1" x1="0" x2="0" y1="1" y2="0">
                                        <stop className="stop1" offset="0%" stopColor="#686868" />
                                        <stop className="stop2" offset="100%" stopColor="#928E8E" />
                                    </linearGradient>
                                </defs>
                                <circle className="cls-1" cx="50%" cy="50%" r="500" fill="url(#Gradient1)" />
                                <mask id="rmvProfile">
                                    <circle cx="50%" cy="50%" r="435" fill="white" />
                                </mask>
                                <ellipse className="cls-2" fill="white" cx="50%" cy="34%" rx="218" ry="234" />
                                <circle
                                    className="cls-2"
                                    mask="url(#rmvProfile)"
                                    fill="white"
                                    cx="50%"
                                    cy="106%"
                                    r="400"
                                />
                            </svg>
                        ) : (
                            <DetailContactAvatar
                                contactInitials={detailsIconText[this.props.index]}
                                chat={this.props.chat}
                            />
                        )}
                        <p className="ContactName">{this.props.name}</p>
                    </div>
                    <div className="ContactRight">
                        <svg
                            id="JumpToContact"
                            enableBackground="new 0 0 511.096 511.096"
                            viewBox="0 0 511.096 511.096"
                            onClick={() => this.jumpToContactChat()}
                        >
                            <g id="Speech_Bubble_48_">
                                <g>
                                    <path d="m74.414 480.548h-36.214l25.607-25.607c13.807-13.807 22.429-31.765 24.747-51.246-59.127-38.802-88.554-95.014-88.554-153.944 0-108.719 99.923-219.203 256.414-219.203 165.785 0 254.682 101.666 254.682 209.678 0 108.724-89.836 210.322-254.682 210.322-28.877 0-59.01-3.855-85.913-10.928-25.467 26.121-59.973 40.928-96.087 40.928z" />
                                </g>
                            </g>
                        </svg>
                    </div>
                </div>
            </div>
        );
    }
}

export default DetailContact;
