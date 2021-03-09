/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable max-len */
import * as React from "react";
import { useState } from "react";
import { ipcRenderer } from "electron";
import { Chat } from "@server/databases/chat/entity";
import { generateDetailsIconText, getAvatarGradientIndex } from "@renderer/helpers/utils";
import { blankAvatarSrc } from "@renderer/helpers/constants";
import DetailContactAvatar from "./DetailContactAvatar/DetailContactAvatar";

import "./DetailContact.css";

interface Props {
    chat: Chat;
    index: number;
    name: string;
    address: string;
}

const DetailContact = (props: Props) => {
    const useForceUpdate = () => {
        const [value, setValue] = useState(0); // integer state
        return () => setValue(v => value + 1); // update the state to force render
    };

    const onImageError = (index: number) => {
        // eslint-disable-next-line no-param-reassign
        props.chat.participants[index].avatar = blankAvatarSrc;
        useForceUpdate();
    };

    const jumpToContactChat = async () => {
        const payload = { newChatAddresses: props.address, matchingAddress: props.address };
        await ipcRenderer.invoke("start-new-chat", payload);
    };

    const { participants } = props.chat;
    const detailsIconText = generateDetailsIconText(props.chat);

    return (
        <div className="DetailContact">
            <div className="ContactWrap">
                <div className="ContactLeft">
                    {/* If there is an avatar photo */}
                    {participants[props.index].avatar ? (
                        <img
                            className="contactDetailsPhoto"
                            src={participants[props.index].avatar}
                            alt={participants[props.index].address}
                            onError={() => onImageError(props.index)}
                        />
                    ) : (
                        <>
                            {/* If no handle name */}
                            {detailsIconText[props.index] === "?" ? (
                                <svg height="34px" width="34px" viewBox="0 0 1000 1000">
                                    <circle
                                        className="cls-1"
                                        cx="50%"
                                        cy="50%"
                                        r="500"
                                        fill={`url(#ColoredGradient${getAvatarGradientIndex(participants[0])})`}
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
                                    contactInitials={detailsIconText[props.index]}
                                    chat={props.chat}
                                    gradientNumber={getAvatarGradientIndex(participants[0])}
                                />
                            )}
                        </>
                    )}

                    <p className="ContactName">{props.name}</p>
                </div>
                <div className="ContactRight">
                    <svg
                        id="JumpToContact"
                        enableBackground="new 0 0 511.096 511.096"
                        viewBox="0 0 511.096 511.096"
                        onClick={() => jumpToContactChat()}
                    >
                        <path d="m74.414 480.548h-36.214l25.607-25.607c13.807-13.807 22.429-31.765 24.747-51.246-59.127-38.802-88.554-95.014-88.554-153.944 0-108.719 99.923-219.203 256.414-219.203 165.785 0 254.682 101.666 254.682 209.678 0 108.724-89.836 210.322-254.682 210.322-28.877 0-59.01-3.855-85.913-10.928-25.467 26.121-59.973 40.928-96.087 40.928z" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default DetailContact;
