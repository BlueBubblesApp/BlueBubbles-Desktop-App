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
    constructor(props: unknown) {
        super(props);

        this.state = {
            chatPrevs: [],
            chatGuids: []
        };
    }

    componentDidMount() {
        // First, let's register a handler for new chats
        ipcRenderer.on("chat", (_, args) => {
            this.addChatToState(args);
        });
    }

    async addChatToState(chat: Chat) {
        if (!this.state.chatGuids.includes(chat.guid)) {
            this.setState({ chatGuids: [...this.state.chatGuids, chat.guid] });
        }

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

        const updatedChats = [...this.state.chatPrevs];
        for (let i = 0; i < updatedChats.length; i += 1) {
            if (newChat.lastMessage.dateCreated > updatedChats[i].lastMessage.dateCreated) {
                updatedChats.splice(i, 0, newChat);
            }
        }

        this.setState({ chatPrevs: updatedChats });
    }

    render() {
        // const chatPrevs = this.state.chatPrevs;z
        // const chatPrevs = ipcRenderer.sendSync('sendChatPrevs', "chatPrevs");
        // console.log();

        return (
            <div className="LeftConversationsNav">
                <Conversation
                    chatParticipants="+1 (703) 201-7026"
                    lastMessage="Test Message"
                    lastMessageTime="3:13 PM"
                />
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
