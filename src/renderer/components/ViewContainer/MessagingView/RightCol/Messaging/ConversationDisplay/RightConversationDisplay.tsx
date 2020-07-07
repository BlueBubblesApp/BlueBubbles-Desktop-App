/* eslint-disable no-underscore-dangle */
import * as React from "react";
import { ipcRenderer } from "electron";
import { Chat, Message as DBMessage } from "@server/databases/chat/entity";
import { getDateText, getTimeText } from "@renderer/utils";

import "./RightConversationDisplay.css";
import ChatLabel from "./ChatLabel";
import MessageBubble from "./MessageBubble";

type Props = {
    chat: Chat;
};

type State = {
    isLoading: boolean;
    messages: Message[];
    messageGuids: string[];
};

type Message = DBMessage & {
    tempGuid: string;
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
        ipcRenderer.on("message", async (_, payload: { message: Message; tempGuid?: string }) => {
            const { message } = payload;

            // If the message isn't for this chat, ignore it
            if (!message.chats || message.chats[0].guid !== this.props.chat.guid) return;

            // Convert the message to a message with a tempGuid
            const msg = message as Message;
            msg.tempGuid = payload.tempGuid ?? null;

            // Otherwise, add the message to the state
            await this.addMessagesToState([msg]);

            // Scroll to new message
            const view = document.getElementById("messageView");
            view.scrollTop = view.scrollHeight;
        });

        ipcRenderer.on("add-message", async (_, message) => {
            // Otherwise, add the message to the state
            await this.addMessagesToState([message]);

            // Scroll to new message
            const view = document.getElementById("messageView");
            view.scrollTop = view.scrollHeight;
        });

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
        const messages: DBMessage[] = await ipcRenderer.invoke("get-chat-messages", {
            chatGuid: this.props.chat.guid,
            withHandle: true,
            withAttachments: true,
            withChat: false,
            limit: 25,
            before: messageTimestamp ?? new Date().getTime()
        });

        // Add each message to the state
        await this.addMessagesToState(messages as Message[]); // These won't have a tempGuid

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
        // Make copies of state
        const updatedMessages = [...this.state.messages];
        const updatedGuids = [...this.state.messageGuids];

        // // Insert/update the message into the state
        for (const message of messages) {
            // Check if the message already exists (via real GUID or temp GUID)
            let exists = updatedGuids.includes(message.guid);
            if (message.tempGuid) exists = updatedGuids.includes(message.tempGuid);

            let insertIdx = -1;
            for (let i = 0; i < updatedMessages.length; i += 1) {
                // If the GUID doesn't exist, just insert normally (by date)
                if (!exists && message.dateCreated > updatedMessages[i].dateCreated) {
                    insertIdx = i;
                    break;

                    // If the GUID exists, we want to replace the original message with the new message
                    // We have to try to match on both the tempGuid and real GUID
                } else if (
                    (exists && message.guid === updatedMessages[i].guid) ||
                    (message.tempGuid && message.tempGuid === updatedMessages[i].guid)
                ) {
                    updatedMessages[i] = message;
                }
            }

            // Insert the message at the correct index (if it didn't exist already)
            if (!exists && insertIdx === -1) {
                updatedMessages.push(message);
            } else if (!exists) {
                updatedMessages.splice(insertIdx, 0, message);
            }

            // Add the message GUID to the master list
            // Or update the temp GUID to real GUID
            if (!updatedGuids.includes(message.guid)) {
                updatedGuids.push(message.guid);
            } else if (message.tempGuid && updatedGuids.includes(message.tempGuid)) {
                const idx = updatedGuids.indexOf(message.tempGuid);
                updatedGuids[idx] = message.guid;
            }
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

                {/* Reverse the list because we want to display it bottom to top */}
                {messages.reverse().map((message: Message, index: number) => {
                    let newerMessage = null;
                    let olderMessage = null;

                    // Get the surrounding messages (if available)
                    if (index - 1 >= 0 && index - 1 < messages.length) olderMessage = messages[index - 1];
                    if (index + 1 < messages.length && index + 1 >= 0) newerMessage = messages[index + 1];

                    return (
                        <div key={message.guid}>
                            {/* If the last previous message is older than 30 minutes, display the time */}
                            {olderMessage && message.dateCreated - olderMessage.dateCreated > 1000 * 60 * 30 ? (
                                <ChatLabel
                                    text={`${getDateText(new Date(message.dateCreated))}, ${getTimeText(
                                        new Date(message.dateCreated)
                                    )}`}
                                />
                            ) : null}

                            {/* If the message text is null, it's a group event */}
                            {message.text ? (
                                <MessageBubble
                                    message={message}
                                    olderMessage={olderMessage}
                                    newerMessage={newerMessage}
                                />
                            ) : (
                                <ChatLabel text="TODO: Some Event" />
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }
}

export default RightConversationDisplay;
