import * as React from "react";
import { Message } from "@server/databases/chat/entity";
import { getiMessageNumberFormat } from "@renderer/utils";

import "./TextMessage.css";

type Props = {
    olderMessage: Message;
    message: Message;
    newerMessage: Message;
};

type State = {
    contact: any;
};

class TextMessage extends React.Component<Props, State> {
    state = {
        contact: null
    };

    componentDidMount() {
        // TODO: Get the contact
        // this.setState({ contact: "John Doe" });
    }

    render() {
        const { message, olderMessage, newerMessage } = this.props;
        const { contact } = this.state;

        const sender = contact ?? getiMessageNumberFormat(message.handle.address);
        const className = !message.isFromMe ? "IncomingMessage" : "OutgoingMessage";
        const messageClass = className ? "message tail" : "message"; // Fix this to reflect having a tail

        return (
            <div>
                {message.handle && (!olderMessage || olderMessage.handleId !== message.handleId) ? (
                    <p className="MessageSender">{sender}</p>
                ) : null}
                <div className={className}>
                    <p className={messageClass}>
                        {message.hasAttachments
                            ? `1
                    Attachment\n\n${message.text.trim()}`
                            : message.text.trim()}
                    </p>
                </div>
            </div>
        );
    }
}

export default TextMessage;
