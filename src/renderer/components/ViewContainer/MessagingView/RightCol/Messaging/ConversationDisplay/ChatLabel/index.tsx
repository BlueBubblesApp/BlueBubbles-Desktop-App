import * as React from "react";
import "./ChatLabel.css";

type ConversationProps = {
    text: string;
    date?: any;
};

function ChatLabel({ text, date }: ConversationProps) {
    return (
        <div className="ChatLabel">
            <p>{text}</p>
            {date ? <p>{date}</p> : null}
        </div>
    );
}

export default ChatLabel;
