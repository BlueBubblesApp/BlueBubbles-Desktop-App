/* eslint-disable no-underscore-dangle */
import * as React from "react";
import { Chat } from "@server/databases/chat/entity";
import { getSender } from "@renderer/helpers/utils";

import "./RightTopNav.css";

type Props = {
    chat: Chat;
};

export default function RightTopNav({ chat }: Props) {
    const participants = (chat?.participants ?? []).map(handle =>
        getSender(handle, (chat?.participants ?? []).length === 1)
    );
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
                <p>Details</p>
            </div>
        </div>
    );
}
