import * as React from "react";
import { Message } from "@server/databases/chat/entity";

import "./TextMessage.css";

type MessageProps = {
    message: Message;
};

function TextMessage({ message }: MessageProps) {
    return !message.isFromMe ? (
        <div className="IncomingMessage">
            <p>{message.hasAttachments ? `1 Attachment\n${message.text.trim()}` : message.text.trim()}</p>
        </div>
    ) : (
        <div className="OutgoingMessage">
            <p>{message.hasAttachments ? `1 Attachment\n${message.text.trim()}` : message.text.trim()}</p>
        </div>
    );
}

export default TextMessage;
