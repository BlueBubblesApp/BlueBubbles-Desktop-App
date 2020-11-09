/* eslint-disable no-prototype-builtins */
/* eslint-disable max-len */
/* eslint-disable no-empty */
import * as React from "react";
import { ipcRenderer } from "electron";

import { Chat as DBChat, Message as DBMessage } from "@server/databases/chat/entity";

import "./LeftConversationsNav.css";
import Conversation from "./Conversation/Conversation";

type Chat = DBChat & {
    lastMessage: DBMessage | null;
};

interface State {
    activeChat: Chat;
    chats: Chat[];
    chatGuids: string[];
    isLoading: boolean;
    chatSearchString: string;
}

class LeftConversationsNav extends React.Component<unknown, State> {
    constructor(props: unknown) {
        super(props);

        this.state = {
            activeChat: null,
            chats: [],
            chatGuids: [],
            isLoading: false,
            chatSearchString: ""
        };
    }

    componentDidMount() {
        // First, let's register a handler for new chats
        ipcRenderer.on("chat", (_, args) => this.addChatsToState([args]));

        // Second, let's register a handler for new messages
        ipcRenderer.on("message", (_, payload) => this.updateLastMessage(payload.message));

        // Third, let's fetch the current chats and add them to the state
        ipcRenderer.invoke("get-chats", null).then(async chats => {
            this.setState({ isLoading: true });
            await this.addChatsToState(chats);
            this.setState({ isLoading: false });
        });

        ipcRenderer.on("notification-clicked", (_, chat) => this.setCurrentChat(chat));

        ipcRenderer.on("set-current-new-chat", (_, chat) => this.setCurrentChat(chat));

        ipcRenderer.on("send-chat-search-string", (_, payload) => this.setState({ chatSearchString: payload }));

        ipcRenderer.on("remove-active-chat", (_, __) => {
            this.setCurrentChat(null);
        });

        ipcRenderer.on("chat-last-viewed-update", (_, data) => {
            this.removeNotification(data.chat.guid, data.lastViewed);
        });
    }

    setCurrentChat(chat: Chat) {
        if (chat === null) {
            this.setState({ activeChat: null });
            // Remove old attibutes
            try {
                const p = document.querySelectorAll(".cls-2-active");
                p.forEach(x => x.classList.remove("cls-2-active"));
            } catch {}
            try {
                const p = document.querySelectorAll(".cls-1-active");
                p.forEach(x => x.classList.remove("cls-1-active"));
            } catch {}
            try {
                document.getElementsByClassName("activeColor")[0].classList.remove("activeColor");
                document.getElementsByClassName("activeColor2")[0].classList.remove("activeColor2");
                document.getElementsByClassName("activeColor3")[0].classList.remove("activeColor3");
            } catch {}
            return;
        }

        const now = new Date();
        this.setState({ activeChat: chat });
        ipcRenderer.invoke("send-to-ui", { event: "set-current-chat", contents: chat });
        ipcRenderer.invoke("send-to-ui", { event: "toggle-giphy-selector", contents: false });
        ipcRenderer.invoke("set-chat-last-viewed", { chat, lastViewed: now });
        this.removeNotification(chat.guid, now);

        const config = { isDetailsOpen: false };

        const chatParent = document.getElementById(chat.guid);

        // Remove old attibutes
        // Forground
        try {
            const p = document.querySelectorAll(".cls-2-active");
            p.forEach(x => x.classList.remove("cls-2-active"));
        } catch {}

        // Background
        try {
            const p = document.querySelectorAll(".cls-1-active");
            p.forEach(x => x.classList.remove("cls-1-active"));
        } catch {}

        // Last Message, Time, and Title
        try {
            document.getElementsByClassName("activeColor")[0].classList.remove("activeColor");
            document.getElementsByClassName("activeColor2")[0].classList.remove("activeColor2");
            document.getElementsByClassName("activeColor3")[0].classList.remove("activeColor3");
        } catch {}

        // Add new attributes
        try {
            const x = chatParent.querySelectorAll(".cls-2");
            x.forEach(y => y.classList.add("cls-2-active"));
        } catch {}

        try {
            const x = chatParent.querySelectorAll(".cls-1");
            x.forEach(y => y.classList.add("cls-1-active"));
        } catch {}

        if (document.getElementsByClassName("TitleBar")[0].getAttribute("data-theme") === "light") {
            chatParent.querySelector(".message-recip-example").classList.add("activeColor");
            chatParent.querySelector(".message-snip-example").classList.add("activeColor2");
            chatParent.querySelector(".message-time-example").classList.add("activeColor3");
        }

        ipcRenderer.invoke("set-config", config);
    }

    removeNotification(guid: string, lastViewed: Date) {
        const updatedChats = [...this.state.chats];
        for (let i = 0; i < updatedChats.length; i += 1) {
            if (updatedChats[i].guid === guid) {
                updatedChats[i].lastViewed = lastViewed.getTime();
            }
        }

        this.setState({ chats: updatedChats });
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
        // Skip adding any reactions
        if (message.associatedMessageGuid) return;

        // Add the chat to the state, if needed
        const chats = message.chats as Chat[];
        for (let i = 0; i < chats.length; i += 1) {
            chats[i].lastMessage = message;

            // If the chat has never been viewed, let's make it seem
            // like it has been viewed so we can show the notification
            if (!chats[i].lastViewed) chats[i].lastViewed = 1;
        }

        await this.addChatsToState(chats);
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
    async addChatsToState(chats: Chat[]) {
        const updatedChats = [...this.state.chats];
        const updatedGuids = [...this.state.chatGuids];
        for (const chat of chats) {
            const exists = this.state.chatGuids.includes(chat.guid);

            // If there is no last message attached, get the last message
            const newChat = chat;
            if (!chat.lastMessage) {
                const lastMessage = await ipcRenderer.invoke("get-messages", {
                    chatGuid: chat.guid,
                    withHandle: false,
                    withAttachments: false,
                    withChats: false,
                    offset: 0,
                    limit: 1,
                    after: 1,
                    where: [
                        {
                            statement: "message.text IS NOT NULL",
                            args: null
                        },
                        {
                            statement: "message.associatedMessageType IS NULL",
                            args: null
                        }
                    ]
                });

                if (!exists && lastMessage && lastMessage.length > 0) {
                    [newChat.lastMessage] = lastMessage; // Destructure
                }
            }

            // Find where we need to insert the chat
            let insertIdx = -1;
            for (let i = 0; i < updatedChats.length; i += 1) {
                if (
                    !exists &&
                    newChat.lastMessage &&
                    updatedChats[i].lastMessage &&
                    newChat.lastMessage.dateCreated > updatedChats[i].lastMessage.dateCreated
                ) {
                    insertIdx = i;
                    break;
                } else if (exists && updatedChats[i].guid === newChat.guid) {
                    updatedChats[i] = newChat;
                }
            }

            // Insert the updated chat at the specified index
            if (!exists && insertIdx === -1) {
                updatedChats.push(newChat);
            } else if (!exists) {
                updatedChats.splice(insertIdx, 0, newChat);
            }

            // Add the chat GUID to the master list
            if (!exists) {
                updatedGuids.push(newChat.guid);
            }
        }

        this.setState({
            chats: updatedChats,
            chatGuids: updatedGuids
        });
    }

    render() {
        const { chats, isLoading, activeChat, chatSearchString } = this.state;
        chats.sort((a, b) => (a.lastMessage?.dateCreated > b.lastMessage?.dateCreated ? -1 : 1));

        return (
            <div className="LeftConversationsNav">
                {isLoading ? <div id="loader" /> : null}
                {chatSearchString.length > 0
                    ? chats
                          .filter(
                              chat =>
                                  chat.hasOwnProperty("lastMessage") &&
                                  (chat.displayName.toLowerCase().includes(chatSearchString.toLowerCase()) ||
                                      chat.participants.some(handle => {
                                          return (
                                              handle.firstName
                                                  ?.toLowerCase()
                                                  .includes(chatSearchString.toLowerCase()) ||
                                              handle.lastName?.toLowerCase().includes(chatSearchString.toLowerCase()) ||
                                              handle.address.includes(chatSearchString)
                                          );
                                      }))
                          )
                          .map(filteredChat => {
                              let hasNotification =
                                  filteredChat.lastMessage &&
                                  !filteredChat.lastMessage.isFromMe &&
                                  filteredChat.lastViewed < filteredChat.lastMessage.dateCreated;
                              if (
                                  !filteredChat.lastViewed ||
                                  (hasNotification && activeChat && activeChat.guid === filteredChat.guid)
                              )
                                  hasNotification = false;
                              return (
                                  <div
                                      key={filteredChat.guid}
                                      onClick={() => this.setCurrentChat(filteredChat)}
                                      className={activeChat?.guid === filteredChat.guid ? "activeChat" : ""}
                                  >
                                      {hasNotification ? <div className="notification" /> : null}
                                      <Conversation chat={filteredChat} />
                                  </div>
                              );
                          })
                    : chats.map(chat => {
                          let hasNotification =
                              chat.lastMessage &&
                              !chat.lastMessage.isFromMe &&
                              chat.lastViewed < chat.lastMessage.dateCreated;
                          if (!chat.lastViewed || (hasNotification && activeChat && activeChat.guid === chat.guid))
                              hasNotification = false;
                          if (!chat.hasOwnProperty("lastMessage")) return null;
                          return (
                              <div
                                  key={chat.guid}
                                  onClick={() => this.setCurrentChat(chat)}
                                  className={activeChat?.guid === chat.guid ? "activeChat" : ""}
                              >
                                  {hasNotification ? <div className="notification" /> : null}
                                  <Conversation chat={chat} />
                              </div>
                          );
                      })}
            </div>
        );
    }
}

export default LeftConversationsNav;
