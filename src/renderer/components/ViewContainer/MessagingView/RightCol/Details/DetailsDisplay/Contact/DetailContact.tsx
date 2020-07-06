/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable max-len */
import * as React from "react";
import { ipcRenderer } from "electron";
import { Chat, Message } from "@server/databases/chat/entity";
import { getDateText, getTimeText } from "@renderer/utils";
import "./DetailContact.css";

interface Props {
    contactName: string;
}

interface State {}

class DetailContact extends React.Component<Props, State> {
    state = {};

    render() {
        return (
            // eslint-disable-next-line react/self-closing-comp
            <div className="DetailContact">
                <div className="ContactWrap">
                    <div className="ContactLeft">
                        <svg className="ContactIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1016 1017">
                            <title>contact-icon-new</title>
                            <g id="background">
                                <path
                                    className="cls-1"
                                    d="M1016,510A506.11,506.11,0,0,1,881.62,854.19C788.8,954.91,655.77,1018,508,1018S227.2,954.91,134.38,854.19A506.11,506.11,0,0,1,0,510C0,229.43,227.43,2,508,2S1016,229.43,1016,510Z"
                                    transform="translate(0 -2)"
                                />
                            </g>
                            <g id="shoulders">
                                <path
                                    className="cls-2"
                                    d="M847.49,789.35C763.15,880.87,642.27,938.19,508,938.19S252.85,880.87,168.51,789.35c52.27-114.61,184.56-196,339.49-196S795.22,674.74,847.49,789.35Z"
                                    transform="translate(0 -2)"
                                />
                            </g>
                            <g id="head">
                                <ellipse className="cls-2" cx="508" cy="325.71" rx="205.71" ry="214.16" />
                            </g>
                        </svg>
                        <p className="ContactName">{this.props.contactName}</p>
                    </div>
                    <div className="ContactRight">
                        <svg
                            id="JumpToContact"
                            enableBackground="new 0 0 511.096 511.096"
                            viewBox="0 0 511.096 511.096"
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
