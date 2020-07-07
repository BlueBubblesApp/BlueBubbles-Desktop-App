import * as React from "react";
import { getDateText, getTimeText } from "@renderer/utils";
import "./ChatLabel.css";

type ConversationProps = {
    text: string;
    date?: Date;
};

function ChatLabel({ text, date }: ConversationProps) {
    return (
        <div className="ChatLabel">
            <p>{text}</p>
            {date ? <p>{`${getDateText(new Date(date))}, ${getTimeText(new Date(date))}`}</p> : null}
        </div>
    );
}

export default ChatLabel;
