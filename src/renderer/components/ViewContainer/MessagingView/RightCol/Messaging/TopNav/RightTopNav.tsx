/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
import * as React from "react";
import { Chat } from "@server/databases/chat/entity";
import { getSender } from "@renderer/helpers/utils";

import "./RightTopNav.css";
import { ipcRenderer } from "electron";

type Props = {
    chat: Chat;
    isDetailsOpen: boolean;
};

export default function RightTopNav({ chat, isDetailsOpen }: Props) {
    const participants = (chat?.participants ?? []).map(handle =>
        getSender(handle, (chat?.participants ?? []).length === 1)
    );

    const handleOpenDetails = () => {
        ipcRenderer.invoke("send-to-ui", { event: "open-details" });
    };

    const handleCloseDetails = () => {
        ipcRenderer.invoke("send-to-ui", { event: "close-details" });
    };

    return (
        <div className="RightTopNav">
            <div id="toDiv">
                <p>To:</p>
            </div>
            <div id="recipDiv">
                {chat
                    ? participants.map((item, i) => (
                          <div key={chat.participants[i].address}>
                              <p>{`${item}${participants.length === i + 1 ? "" : ","}`}</p>{" "}
                          </div>
                      ))
                    : null}
            </div>
            <div id="convoDetailsDiv">
                <p onClick={isDetailsOpen ? handleCloseDetails : handleOpenDetails}>
                    {isDetailsOpen ? "Close" : "Details"}
                </p>
            </div>
        </div>
    );
}
