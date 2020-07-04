import * as React from "react";
import { Message } from "@server/databases/chat/entity";

import "./TextMessage.css";
import { getiMessageNumberFormat } from "@renderer/utils";
import { render } from "react-dom";

interface MessageProps {
    message: Message;
    olderMessage: Message | null;
    newerMessage: Message | null;
}

interface MessageState {
    isLast: boolean;
    sender: string;
    className: string;
}

class TextMessage extends React.Component<MessageProps, MessageState> {
    constructor(props) {
        super(props);

        this.state = {
            isLast: false,
            sender: "",
            className: ""
        };
    }

    componentDidMount() {
        this.setState({ className: !this.props.message.isFromMe ? "IncomingMessage" : "OutgoingMessage" });
        this.setState({ sender: this.props.message?.handle?.address });
        const hasContact = false;
        if (this.props.message.handle && hasContact) {
            // TODO: get the contact
            this.setState({ sender: this.props.message.handle.address });
        } else if (this.props.message.handle) {
            this.setState({ sender: getiMessageNumberFormat(this.props.message.handle.address) });
        }

        // If Last Message, set isLast to true
    }

    render() {
        return (
            <div>
                {this.props.message.handle &&
                (!this.props.olderMessage || this.props.olderMessage.handleId !== this.props.message.handleId) ? (
                    <p className="MessageSender">{this.state.sender}</p>
                ) : null}
                <div className={this.state.className}>
                    {this.state.isLast ? (
                        <p className="message last">
                            {this.props.message.hasAttachments
                                ? `1
                        Attachment\n\n${this.props.message.text.trim()}`
                                : this.props.message.text.trim()}
                        </p>
                    ) : (
                        <p className="message">
                            {this.props.message.hasAttachments
                                ? `1
                        Attachment\n\n${this.props.message.text.trim()}`
                                : this.props.message.text.trim()}
                        </p>
                    )}
                </div>
            </div>
        );
    }
}

export default TextMessage;
