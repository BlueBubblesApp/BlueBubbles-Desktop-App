/* eslint-disable no-underscore-dangle */
import * as React from "react";
import { ipcRenderer } from "electron";
import { Chat, Message } from "@server/databases/chat/entity";
import { getDateText, getTimeText } from "@renderer/utils";

import "./RightConversationDisplay.css";
import ChatLabel from "./ChatLabel/ChatLabel";
import TextMessage from "./TextMessage/TextMessage";

type State = {
    chat: Chat;
    isLoading: boolean;
    messages: Message[];
    messageGuids: string[];
};

class RightConversationDisplay extends React.Component<unknown, State> {
    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            chat: null,
            isLoading: false,
            messages: [],
            messageGuids: []
        };
    }

    componentDidMount() {
        this._isMounted = true;
        // First, let's register a handler for new chats
        ipcRenderer.on("set-current-chat", async (_, args) => {
            // Set the loading state
            if (this._isMounted) {
                this.setState({ chat: args, messages: [], messageGuids: [] }, () => {
                    // Fetch the chat messages once the state has been set
                    this.getNextMessagePage();
                });
            }
        });
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    async getNextMessagePage() {
        let messageTimestamp = null;
        if (this.state.messages.length > 0) {
            messageTimestamp = this.state.messages[this.state.messages.length - 1].dateCreated;
        }

        // Set the loading state
        if (this._isMounted) {
            this.setState({ isLoading: true });
        }

        // Get the next page of messages
        const messages = await ipcRenderer.invoke("get-chat-messages", {
            chatGuid: this.state.chat.guid,
            withHandle: true,
            withAttachments: false,
            withChat: false,
            limit: 25,
            before: messageTimestamp ?? new Date().getTime()
        });

        // Add each message to the state
        await this.addMessagesToState(messages);

        // Tell the state we are done loading
        if (this._isMounted) {
            this.setState({ isLoading: false }, () => {
                // If this is a fresh chat, scroll to the bottom
                if (!messageTimestamp) {
                    const view = document.getElementById("messageView");
                    view.scrollTop = view.scrollHeight;
                }
            });
        }
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
        const { chat, messages, isLoading } = this.state;

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
                            <TextMessage message={message} olderMessage={olderMessage} newerMessage={newerMessage} />
                        </div>
                    );
                })}
            </div>
        );
    }
}

export default RightConversationDisplay;
