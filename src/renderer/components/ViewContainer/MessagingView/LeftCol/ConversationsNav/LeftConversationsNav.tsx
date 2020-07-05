import * as React from "react";
import { ipcRenderer } from "electron";

import { Chat as DBChat, Message as DBMessage } from "@server/databases/chat/entity";
import { getDateText } from "@renderer/utils";

import "./LeftConversationsNav.css";
import Conversation from "./Conversation/Conversation";

type Chat = DBChat & {
    lastMessage: DBMessage | null;
};

interface State {
    chats: Chat[];
    chatGuids: string[];
    isLoading: boolean;
}

const setCurrentChat = (guid: Chat) => {
    // const config = { isMakingNewChat: false };
    // console.log(config)
    // ipcRenderer.invoke("set-config", config);

    ipcRenderer.invoke("send-to-ui", { event: "set-current-chat", contents: guid });
};

class LeftConversationsNav extends React.Component<unknown, State> {
    constructor(props: unknown) {
        super(props);

        this.state = {
            chats: [],
            chatGuids: [],
            isLoading: false
        };
    }

    componentDidMount() {
        // First, let's register a handler for new chats
        ipcRenderer.on("chat", (_, args) => this.addChatsToState([args]));

        // Second, let's register a handler for new messages
        ipcRenderer.on("message", (_, args) => this.updateLastMessage(args));

        // Third, let's fetch the current chats and add them to the state
        ipcRenderer.invoke("get-chats", null).then(async chats => {
            this.setState({ isLoading: true });
            await this.addChatsToState(chats);
            this.setState({ isLoading: false });
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
        const chats = message.chats as Chat[];
        for (let i = 0; i < chats.length; i += 1) chats[i].lastMessage = message;
        const isNew = await this.addChatsToState(chats);

        // If the chat didn't exist already, we don't need to update
        if (isNew) return;

        const chatGuids = chats.map(i => i.guid);
        const updatedChats = [...this.state.chats];
        for (let i = 0; i < updatedChats.length; i += 1) {
            if (
                chatGuids.includes(updatedChats[i].guid) &&
                updatedChats[i].lastMessage.dateCreated < message.dateCreated
            ) {
                updatedChats[i].lastMessage = message;
                break;
            }
        }

        this.setState({ chats: updatedChats });
    }

    /**
     * Adds a chat to the state if it doesn't already exist.
     * First, check if the GUID exists.
     * Second, if the GUID didn't exist, insert it into the state
     * based on the last message
     *
     * @param chats The new chats
     * @returns Whether or not we added a new chat to the state
     */
    async addChatsToState(chats: Chat[]): Promise<boolean> {
        const updatedChats = [...this.state.chats];
        const updatedGuids = [...this.state.chatGuids];
        for (const chat of chats) {
            const exists = this.state.chatGuids.includes(chat.guid);
            if (exists) continue;

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

            // Find where we need to insert the chat
            let insertIdx = -1;
            for (let i = 0; i < updatedChats.length; i += 1) {
                if (newChat.lastMessage.dateCreated > updatedChats[i].lastMessage.dateCreated) {
                    insertIdx = i;
                    break;
                }
            }

            // Insert the updated chat at the specified index
            if (insertIdx === -1) {
                updatedChats.push(newChat);
            } else {
                updatedChats.splice(insertIdx, 0, newChat);
            }

            // Add the GUID to the updated list
            updatedGuids.push(newChat.guid);
        }

        this.setState({
            chats: updatedChats,
            chatGuids: updatedGuids
        });

        return true;
    }

    render() {
        const { chats, isLoading } = this.state;

        return (
            <div className="LeftConversationsNav">
                {isLoading ? <div id="loader" /> : null}
                {chats.map(chat => {
                    return <Conversation onClick={() => setCurrentChat(chat)} key={chat.guid} chat={chat} />;
                })}
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
