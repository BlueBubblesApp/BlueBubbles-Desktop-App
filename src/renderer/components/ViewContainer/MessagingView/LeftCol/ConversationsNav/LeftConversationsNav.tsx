import * as React from "react";
import { ipcRenderer } from "electron";

import { Chat as DBChat, Message as DBMessage } from "@server/databases/chat/entity";

import "./LeftConversationsNav.css";
import Conversation from "./Conversation/Conversation";

type Chat = DBChat & {
    lastMessage: DBMessage | null;
};

interface State {
    chatPrevs: Chat[];
    chatGuids: string[];
}

class LeftConversationsNav extends React.Component<unknown, State> {
    static getDateText(message: DBMessage) {
        const now = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const msgDate = new Date(message.dateCreated);

        console.log(now.toLocaleDateString());
        if (now.toLocaleDateString() === msgDate.toLocaleDateString()) return msgDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        if (yesterday.toLocaleDateString() === msgDate.toLocaleDateString()) return "Yesterday";

        const yearStr = String(msgDate.getFullYear());
        return `${msgDate.getDay()}/${msgDate.getMonth()}/${yearStr.substring(2)}`;
    }

    constructor(props: unknown) {
        super(props);

        this.state = {
            chatPrevs: [],
            chatGuids: []
        };
    }

    componentDidMount() {
        // First, let's register a handler for new chats
        ipcRenderer.on("chat", (_, args) => this.addChatToState(args));

        // Second, let's register a handler for new messages
        ipcRenderer.on("message", (_, args) => this.updateLastMessage(args));

        // Third, let's fetch the current chats and add them to the state
        ipcRenderer.invoke("get-chats", null).then(async chats => {
            for (const i of chats) {
                await this.addChatToState(i);
            }
        });
    }

    /**
     * When a new message comes in, we want to update the lastMessage key for a chat.
     * First, check if the chat exists, and if it doesn't, add it to the state.
     * Second, if the chat already existed, find that chat in the current state,
     * and then update the lastMessage
     *
     * @param message The new message
     */
    async updateLastMessage(message: DBMessage) {
        if (!message.chats || message.chats.length === 0) return;

        // Add the chat to the state, if needed
        const chat = message.chats[0] as Chat;
        chat.lastMessage = message;
        const isNew = await this.addChatToState(chat);

        // If the chat didn't exist already, we don't need to update
        if (isNew) return;

        const updatedChats = [...this.state.chatPrevs];
        for (let i = 0; i < updatedChats.length; i += 1) {
            if (updatedChats[i].guid === chat.guid && updatedChats[i].lastMessage.dateCreated < message.dateCreated) {
                updatedChats[i].lastMessage = message;
                break;
            }
        }

        this.setState({ chatPrevs: updatedChats });
    }

    /**
     * Adds a chat to the state if it doesn't already exist.
     * First, check if the GUID exists.
     * Second, if the GUID didn't exist, insert it into the state
     * based on the last message
     *
     * @param chat The new chat
     * @returns Whether or not we added a new chat to the state
     */
    async addChatToState(chat: Chat): Promise<boolean> {
        const exists = this.state.chatGuids.includes(chat.guid);

        // Only return if we've already added it
        if (exists) return false;

        // If there is no last message attached, get the last message
        const newChat = chat;
        if (!chat.lastMessage) {
            const lastMessage = await ipcRenderer.invoke("get-chat-messages", {
                chatGuid: chat.guid,
                withHandle: false,
                withAttachments: false,
                withChats: false,
                offset: 0,
                limit: 1
            });

            if (lastMessage && lastMessage.length > 0) {
                [newChat.lastMessage] = lastMessage; // Destructure
            }
        }

        // Insert the new chat into the list
        const updatedChats = [...this.state.chatPrevs];
        let insertIdx = -1;
        for (let i = 0; i < updatedChats.length; i += 1) {
            if (newChat.lastMessage.dateCreated > updatedChats[i].lastMessage.dateCreated) {
                insertIdx = i;
                break;
            }
        }

        if (insertIdx === -1) {
            updatedChats.push(newChat);
        } else {
            updatedChats.splice(insertIdx, 0, newChat);
        }

        this.setState({
            chatPrevs: updatedChats,
            chatGuids: [...this.state.chatGuids, chat.guid]
        });

        return true;
    }

    render() {
        const { chatPrevs } = this.state;
        chatPrevs.sort((a, b) => (a.lastMessage.dateCreated > b.lastMessage.dateCreated ? -1 : 1));

        return (
            <div className="LeftConversationsNav">
                {chatPrevs.map(chat => {
                    // Calculate the chat name
                    let chatTitle = chat.displayName;
                    if (!chatTitle) {
                        chatTitle = chat.participants.map(i => i.address).join(", ");
                    }

                    let lastText = chat.lastMessage.text;
                    if (!lastText || chat.lastMessage.hasAttachments) {
                        lastText = "1 Attachment";
                    }

                    return (
                        <Conversation
                            aGuid={chat.guid}
                            chatParticipants={chatTitle}
                            lastMessage={lastText}
                            lastMessageTime={LeftConversationsNav.getDateText(chat.lastMessage)}
                        />
                    );
                })}

                {/* {chatPrevs.map(chatPrev => 
                <Conversation
                  chatParticipants={chatPrev.address}
                  lastMessage={chatPrev.country}
                  lastMessageTime={chatPrev.uncanonicalizedId}
                />
                )} */}
            </div>
        );
    }
}

export interface ChatPrev {
    ROWID: number;
    address: string;
    country: string;
    uncanonicalizedId: string;
}

export default LeftConversationsNav;
