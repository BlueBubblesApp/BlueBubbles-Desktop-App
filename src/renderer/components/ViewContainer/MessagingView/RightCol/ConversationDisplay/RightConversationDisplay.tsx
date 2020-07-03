import * as React from "react";
import { ipcRenderer } from "electron";
import { Chat, Message } from "@server/databases/chat/entity";

import "./RightConversationDisplay.css";
import ChatLabel from "./ChatLabel/ChatLabel";
import TextMessage from "./TextMessage/TextMessage";

type State = {
    chat: Chat;
    isLoading: boolean;
    isFinished: boolean;
    messages: Message[];
};

class RightConversationDisplay extends React.Component<unknown, State> {
    state = {
        chat: null,
        isLoading: false,
        isFinished: false,
        messages: []
    };

    componentDidMount() {
        // First, let's register a handler for new chats
        ipcRenderer.on("set-current-chat", async (_, args) => {
            // Set the loading state
            this.setState({
                messages: [],
                chat: args,
                isLoading: true,
                isFinished: false
            });

            // Fetch the chat messages
            const messages = await ipcRenderer.invoke("get-chat-messages", {
                chatGuid: args.guid,
                withHandle: true,
                withAttachments: false,
                withChat: false,
                limit: 25,
                offset: 0
            });

            this.setState(
                {
                    messages,
                    isLoading: false,
                    isFinished: true
                },
                () => {
                    // When the state has been set, scroll to the bottom
                    const view = document.getElementById("messageView");
                    view.scrollTop = view.scrollHeight;
                }
            );
        });
    }

    render() {
        const { chat, messages, isLoading, isFinished } = this.state;

        if (!isLoading && !isFinished)
            return (
                <div className="RightConversationDisplay">
                    <h3>Please select a conversation on the left</h3>
                </div>
            );

        let chatTitle = chat.displayName;
        if (!chatTitle) {
            const list = chat.participants.map(i => i.address);
            if (list.length === 1) {
                chatTitle = list.join(", ");
            } else {
                chatTitle = "Group Chat";
            }
        }

        if (isLoading && !isFinished)
            return (
                <div className="RightConversationDisplay">
                    <ChatLabel text={`iMessage with ${chatTitle}`} />
                    <div id="loader" />
                </div>
            );

        return (
            <div id="messageView" className="RightConversationDisplay">
                <ChatLabel text={`iMessage with ${chatTitle}`} />
                {messages.reverse().map((message: Message) => (
                    <TextMessage key={message.guid} message={message} />
                ))}
            </div>
        );
    }
}

export default RightConversationDisplay;
