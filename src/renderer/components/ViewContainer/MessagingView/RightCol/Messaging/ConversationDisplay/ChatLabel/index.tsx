import * as React from "react";
import "./ChatLabel.css";

type ConversationProps = {
    text: string;
    date?: Date;
};

function ChatLabel({ text, date }: ConversationProps) {
    return (
        <div className="ChatLabel">
            <p>{text}</p>
            {date ? <p>{date.toLocaleTimeString()}</p> : null}
        </div>
    );
}

export default ChatLabel;
