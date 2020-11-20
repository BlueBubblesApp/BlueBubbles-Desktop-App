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

interface State {
    firstGradientNumber: number;
}

class DetailContact extends React.Component<Props, State> {
    constructor(props) {
        super(props);

        this.state = {
            firstGradientNumber: 8
        };
    }

    async componentDidMount() {
        const seedrandom = require("seedrandom");
        const rng = seedrandom(this.props.address);
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

        const config = await ipcRenderer.invoke("get-config");
        if (!config.colorfulContacts) {
            this.setState({ firstGradientNumber: 8 });
        }
    }

    async jumpToContactChat() {
        const payload = { newChatAddresses: this.props.address, matchingAddress: this.props.address };
        await ipcRenderer.invoke("start-new-chat", payload);
    }

    render() {
        const detailsIconText = generateDetailsIconText(this.props.chat);
        const participants = this.props.chat.participants.map(handle => getSender(handle));

        return (
            <div className="DetailContact">
                <div className="ContactWrap">
                    <div className="ContactLeft">
                        {/* If there is an avatar photo */}
                        {this.props.chat.participants[this.props.index].avatar ? (
                            <img
                                className="contactDetailsPhoto"
                                src={this.props.chat.participants[this.props.index].avatar}
                                alt={this.props.chat.participants[this.props.index].address}
                            />
                        ) : (
                            <>
                                {/* If no handle name */}
                                {detailsIconText[this.props.index] === "?" ? (
                                    <svg height="34px" width="34px" viewBox="0 0 1000 1000">
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
                                    // If the handle has a name
                                    <DetailContactAvatar
                                        contactInitials={detailsIconText[this.props.index]}
                                        chat={this.props.chat}
                                        gradientNumber={this.state.firstGradientNumber}
                                    />
                                )}
                            </>
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
                            <path d="m74.414 480.548h-36.214l25.607-25.607c13.807-13.807 22.429-31.765 24.747-51.246-59.127-38.802-88.554-95.014-88.554-153.944 0-108.719 99.923-219.203 256.414-219.203 165.785 0 254.682 101.666 254.682 209.678 0 108.724-89.836 210.322-254.682 210.322-28.877 0-59.01-3.855-85.913-10.928-25.467 26.121-59.973 40.928-96.087 40.928z" />
                        </svg>
                    </div>
                </div>
            </div>
        );
    }
}

export default DetailContact;
