import * as React from "react";
import { Message } from "@server/databases/chat/entity";

import "./TextMessage.css";
import { getiMessageNumberFormat } from "@renderer/utils";

type MessageProps = {
    message: Message;
    olderMessage: Message | null;
    newerMessage: Message | null;
};

function TextMessage({ message, olderMessage, newerMessage }: MessageProps) {
    const className = !message.isFromMe ? "IncomingMessage" : "OutgoingMessage";
    let sender = message.handle.address;
    const hasContact = false;
    if (hasContact) {
        // TODO: get the contact
        sender = message.handle.address;
    } else {
        sender = getiMessageNumberFormat(message.handle.address);
    }

    return (
        <div>
            {message.handle && (!olderMessage || olderMessage.handleId !== message.handleId) ? (
                <p className="MessageSender">{sender}</p>
            ) : null}
            <div className={className}>
                <p>{message.hasAttachments ? `1 Attachment\n\n${message.text.trim()}` : message.text.trim()}</p>
            </div>
        </div>
    );
}

export default TextMessage;
