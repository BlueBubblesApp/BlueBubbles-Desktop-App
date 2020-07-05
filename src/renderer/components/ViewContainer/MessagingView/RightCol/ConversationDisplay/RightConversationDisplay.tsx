/* eslint-disable no-underscore-dangle */
import * as React from "react";
import { ipcRenderer } from "electron";
import { Chat, Message } from "@server/databases/chat/entity";
import { getDateText, getTimeText } from "@renderer/utils";

import "./RightConversationDisplay.css";
import ChatLabel from "./ChatLabel";
import TextMessage from "./TextMessage";
import MultimediaMessage from "./MultimediaMessage";

type Props = {
    chat: Chat;
};

type State = {
    isLoading: boolean;
    messages: Message[];
    messageGuids: string[];
};

class RightConversationDisplay extends React.Component<Props, State> {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,
            messages: [],
            messageGuids: []
        };
    }

    componentDidMount() {
        this.chatChange();
    }

    componentDidUpdate(prevProps) {
        if (this.props.chat?.guid !== prevProps.chat?.guid) {
            this.chatChange();
        }
    }

    async getNextMessagePage() {
        let messageTimestamp = null;
        if (this.state.messages.length > 0) {
            messageTimestamp = this.state.messages[this.state.messages.length - 1].dateCreated;
        }

        // Set the loading state
        this.setState({ isLoading: true });

        // Get the next page of messages
        const messages = await ipcRenderer.invoke("get-chat-messages", {
            chatGuid: this.props.chat.guid,
            withHandle: true,
            withAttachments: false,
            withChat: false,
            limit: 25,
            before: messageTimestamp ?? new Date().getTime()
        });

        // Add each message to the state
        await this.addMessagesToState(messages);

        // Tell the state we are done loading
        this.setState({ isLoading: false }, () => {
            // If this is a fresh chat, scroll to the bottom
            if (!messageTimestamp) {
                const view = document.getElementById("messageView");
                view.scrollTop = view.scrollHeight;
            }
        });
    }

    chatChange() {
        // Reset the messages
        this.setState({ messages: [], messageGuids: [] }, () => {
            // Set the text field to active
            const msgField = document.getElementById("messageFieldInput");
            if (msgField) msgField.focus();

            // Get new messages
            this.getNextMessagePage();
        });
    }

    async detectTop(e: React.UIEvent<HTMLDivElement, UIEvent>) {
        // First check if we are at the top
        if (e.currentTarget.scrollTop === 0) {
            // Save the current size
            const currentSize = e.currentTarget.scrollHeight;

            // Get the next page
            await this.getNextMessagePage();

            // Get the current view & its' size
            const view = document.getElementById("messageView");
            const newSize = view.scrollHeight;

            // Set the scroll position
            view.scrollTo(0, newSize - currentSize);
        }
    }

    async addMessagesToState(messages: Message[]) {
        // Insert the new message into the list
        const updatedMessages = [...this.state.messages];
        const updatedGuids = [...this.state.messageGuids];
        for (const message of messages) {
            // Check if the message already exists
            const exists = updatedGuids.includes(message.guid);
            if (exists) continue;

            let insertIdx = -1;
            for (let i = 0; i < updatedMessages.length; i += 1) {
                if (message.dateCreated > updatedMessages[i].dateCreated) {
                    insertIdx = i;
                    break;
                }
            }

            // Insert the message at the correct index
            if (insertIdx === -1) {
                updatedMessages.push(message);
            } else {
                updatedMessages.splice(insertIdx, 0, message);
            }

            // Add the message GUID to the master list
            updatedGuids.push(message.guid);
        }

        // Update the state (and wait for it to finish)
        await new Promise((resolve, _) =>
            this.setState(
                {
                    messages: updatedMessages,
                    messageGuids: updatedGuids
                },
                resolve
            )
        );

        return true;
    }

    render() {
        const { messages, isLoading } = this.state;
        const { chat } = this.props;

        if (!chat) return <div className="RightConversationDisplay" />;

        let chatTitle = chat.displayName;
        if (!chatTitle) {
            const list = chat.participants.map(i => i.address);
            if (list.length === 1) {
                chatTitle = list.join(", ");
            } else {
                chatTitle = "Group Chat";
            }
        }

        const date = messages.length > 0 ? new Date(messages[0].dateCreated) : null;

        return (
            <div id="messageView" onScroll={e => this.detectTop(e)} className="RightConversationDisplay">
                {isLoading ? <div id="loader" /> : null}
                <ChatLabel text={`iMessage with ${chatTitle}`} date={date} />
                {messages.reverse().map((message: Message, index: number) => {
                    let newerMessage = null;
                    let olderMessage = null;

                    if (index - 1 >= 0 && index - 1 < messages.length) olderMessage = messages[index - 1];
                    if (index + 1 < messages.length && index + 1 >= 0) newerMessage = messages[index + 1];

                    return (
                        <div key={message.guid}>
                            {olderMessage && message.dateCreated - olderMessage.dateCreated > 1000 * 60 * 30 ? (
                                <ChatLabel
                                    text={`${getDateText(new Date(message.dateCreated))}, ${getTimeText(
                                        new Date(message.dateCreated)
                                    )}`}
                                />
                            ) : null}
                            {!message.hasAttachments ? (
                                <MultimediaMessage
                                    message={message}
                                    olderMessage={olderMessage}
                                    newerMessage={newerMessage}
                                />
                            ) : (
                                <MultimediaMessage
                                    message={message}
                                    olderMessage={olderMessage}
                                    newerMessage={newerMessage}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }
}

export default RightConversationDisplay;
