/* eslint-disable no-underscore-dangle */
import * as React from "react";
import { ipcRenderer } from "electron";
import { Chat } from "@server/databases/chat/entity";
import { getiMessageNumberFormat } from "@renderer/utils";

import "./RightTopNav.css";

type Props = {
    chat: Chat;
};

export default function RightTopNav({ chat }: Props) {
    const participants = (chat?.participants ?? []).map(handle => {
        const hasContact = false;
        if (hasContact) {
            // TODO: get the contact
            return handle.address;
        }

        return getiMessageNumberFormat(handle.address);
    });

    return (
        <div className="RightTopNav">
            <div id="toDiv">
                <p>To:</p>
            </div>
            <div id="recipDiv">
                {chat
                    ? participants.map(item => (
                          <div key={item}>
                              <p>{`${item},`}</p>
                          </div>
                      ))
                    : null}
            </div>
            <div id="convoDetailsDiv">
                <p>Details</p>
            </div>
        </div>
    );
}
