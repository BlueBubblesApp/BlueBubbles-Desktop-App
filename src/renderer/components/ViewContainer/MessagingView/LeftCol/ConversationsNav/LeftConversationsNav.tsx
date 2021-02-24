/* eslint-disable import/order */
/* eslint-disable no-lonely-if */
/* eslint-disable react/sort-comp */
/* eslint-disable no-prototype-builtins */
/* eslint-disable max-len */
/* eslint-disable no-empty */
import * as React from "react";
import { ipcRenderer } from "electron";

import { Chat as DBChat, Message as DBMessage } from "@server/databases/chat/entity";
import dndIconActive from "./dnd-icon-active.png";
import dndIconInactive from "./dnd-icon-inactive.png";

import "./LeftConversationsNav.css";
import Conversation from "./Conversation/Conversation";
import IndividualAvatar from "./Conversation/Avatar/IndividualAvatar";
import GroupAvatar from "./Conversation/Avatar/GroupAvatar";
import { generateChatTitle } from "@renderer/helpers/utils";
import PinnedGroupAvatar from "./Conversation/Avatar/PinnedGroupAvatar";

type Chat = DBChat & {
    lastMessage: DBMessage | null;
    isTyping?: boolean;
};

interface State {
    activeChat: Chat;
    chats: Chat[];
    chatGuids: string[];
    isLoading: boolean;
    chatSearchString: string;
    config: any;
    isScrolling: boolean;
    clientX: number;
    scrollLeft: number;
    allPinnedChats: string[];
}

class LeftConversationsNav extends React.Component<unknown, State> {
    constructor(props: unknown) {
        super(props);

        this.state = {
            activeChat: null,
            chats: [],
            chatGuids: [],
            isLoading: false,
            chatSearchString: "",
            config: null,
            isScrolling: false,
            clientX: 0,
            scrollLeft: 0,
            allPinnedChats: []
        };
    }

    async componentDidMount() {
        const config = await ipcRenderer.invoke("get-config");

        this.setState({ config, allPinnedChats: config.allPinnedChats.split(",") });
        // First, let's register a handler for new chats
        ipcRenderer.on("chat", (_, args) => this.addChatsToState([args]));

        // Second, let's register a handler for new messages
        ipcRenderer.on("message", (_, payload) => this.updateLastMessage(payload.message));

        // Third, let's fetch the current chats and add them to the state
        ipcRenderer.invoke("get-chats", null).then(async chats => {
            this.setState({ isLoading: true });
            await this.addChatsToState(chats);
            this.setState({ isLoading: false });
            if (config.allPinnedChats.split(",").length > 1) {
                Array.from(
                    document.getElementsByClassName("Conversation") as HTMLCollectionOf<HTMLElement>
                )[0].style.borderTop = "1px solid gray";
            }
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

        ipcRenderer.on("typing-indicator", (_, res) => {
            // console.log(res);
            const { chats } = this.state;
            for (const chat of chats) {
                console.log(chat.guid);
                console.log(res.guid.includes(chat.guid));

                if (res.guid.includes(chat.guid)) {
                    chat.isTyping = res.display;
                }
            }

            this.setState({ chats });
        });

        // document.documentElement.addEventListener("mouseup", e2 => {
        //     console.log("WINDOW MOUSE UP");
        //     this.setState({ isScrolling: false, scrollLeft: 0, clientX: 0 });
        // });
    }

    setCurrentChat(chat: Chat) {
        const now = new Date();
        ipcRenderer.invoke("send-to-ui", { event: "set-current-chat", contents: chat });
        ipcRenderer.invoke("send-to-ui", { event: "toggle-giphy-selector", contents: false });
        ipcRenderer.invoke("set-chat-last-viewed", { chat, lastViewed: now });

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

        this.setState({ activeChat: chat });
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

    onMouseDown = (e, chat) => {
        console.log("MOUSE DOWN");
        const { scrollLeft, scrollTop } = document.getElementById(chat.guid).parentElement;

        this.setState({ isScrolling: true, scrollLeft, clientX: e.clientX });
    };

    onMouseUp = e => {
        console.log("MOUSE UP");
        this.setState({ isScrolling: false, scrollLeft: 0, clientX: 0 });
    };

    onMouseMove = (e, chat) => {
        const { clientX, scrollLeft } = this.state;

        if (this.state.isScrolling) {
            // console.log(e.target.parentNode)
            document.getElementById(chat.guid).parentElement.scrollLeft = -1 * (scrollLeft - clientX + e.clientX);
            //   this.setState({scrollX: scrollX + e.clientX - clientX, clientX: e.clientX})
        }
    };

    handleChangeMute = async (e, chat) => {
        const config = await ipcRenderer.invoke("get-config");
        let finalMuteString = "";
        const x = config.allMutedChats.split(",");

        console.log(x);

        // If the chat is already in the mute string, remove it
        if (x.includes(chat.guid)) {
            x.splice(x.indexOf(chat.guid), 1);
        } else {
            x.push(chat.guid);
        }

        finalMuteString = x.join();

        console.log(finalMuteString);

        const newConfig = { allMutedChats: finalMuteString };
        await ipcRenderer.invoke("set-config", newConfig);
        config.allMutedChats = finalMuteString;
        this.setState({ config });

        console.log("change mute");
        document.getElementById(chat.guid).parentElement.scrollLeft = 0;
    };

    handleChangePin = async chat => {
        const config = await ipcRenderer.invoke("get-config");
        let finalPinnedString = "";
        const x = config.allPinnedChats.split(",");

        console.log(x);

        // If the chat is already in the mute string, remove it
        if (x.includes(chat.guid)) {
            x.splice(x.indexOf(chat.guid), 1);
        } else {
            x.push(chat.guid);
        }

        if (x.length > 1) {
            Array.from(
                document.getElementsByClassName("Conversation") as HTMLCollectionOf<HTMLElement>
            )[0].style.borderTop = "1px solid gray";
        } else {
            Array.from(
                document.getElementsByClassName("Conversation") as HTMLCollectionOf<HTMLElement>
            )[0].style.borderTop = "none";
        }

        finalPinnedString = x.join();

        console.log(finalPinnedString);

        const newConfig = { allPinnedChats: finalPinnedString };
        await ipcRenderer.invoke("set-config", newConfig);

        this.setState({ allPinnedChats: finalPinnedString.split(",") });

        console.log("change pin");
        document.getElementById(chat.guid).parentElement.scrollLeft = 0;
    };

    render() {
        const { chats, isLoading, activeChat, chatSearchString } = this.state;
        chats.sort((a, b) => (a.lastMessage?.dateCreated > b.lastMessage?.dateCreated ? -1 : 1));

        return (
            <div className="LeftConversationsNav">
                {isLoading ? <div id="loader" /> : null}
                {this.state.allPinnedChats.length > 1 && this.state.chatSearchString.length === 0 ? (
                    <div id="pinnedChatsContainer">
                        {this.state.allPinnedChats
                            .filter(arrItem => arrItem.length > 0)
                            .map(chatGuid => {
                                console.log(chats);
                                if (chats.length === 0) return null;
                                const chat = chats.filter(aChat => aChat.guid === chatGuid)[0];

                                let hasNotification =
                                    chat.lastMessage &&
                                    !chat.lastMessage.isFromMe &&
                                    chat.lastViewed < chat.lastMessage.dateCreated;
                                if (
                                    !chat.lastViewed ||
                                    (hasNotification && activeChat && activeChat.guid === chat.guid)
                                )
                                    hasNotification = false;

                                return (
                                    // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
                                    <div
                                        className={`aPinnedChatContainer ${
                                            activeChat?.guid === chat.guid ? "activeChat" : ""
                                        }`}
                                        key={chatGuid}
                                        id={chat.guid}
                                        onClick={() => this.setCurrentChat(chat)}
                                        onMouseEnter={() => {
                                            (document.getElementById(chat.guid)
                                                .firstChild as HTMLElement).style.visibility = "initial";
                                        }}
                                        onMouseLeave={() => {
                                            (document.getElementById(chat.guid)
                                                .firstChild as HTMLElement).style.visibility = "hidden";
                                        }}
                                    >
                                        <svg
                                            className="removePinnedChatIcon"
                                            onClick={() => this.handleChangePin(chat)}
                                            x="0px"
                                            y="0px"
                                            viewBox="0 0 193.826 193.826"
                                        >
                                            <path
                                                d="M191.495,55.511L137.449,1.465c-1.951-1.953-5.119-1.953-7.07,0l-0.229,0.229c-3.314,3.313-5.14,7.72-5.14,12.406
                                            c0,3.019,0.767,5.916,2.192,8.485l-56.55,48.533c-4.328-3.868-9.852-5.985-15.703-5.985c-6.305,0-12.232,2.455-16.689,6.913
                                            l-0.339,0.339c-1.953,1.952-1.953,5.118,0,7.07l32.378,32.378l-31.534,31.533c-0.631,0.649-15.557,16.03-25.37,28.27
                                            c-9.345,11.653-11.193,13.788-11.289,13.898c-1.735,1.976-1.639,4.956,0.218,6.822c0.973,0.977,2.256,1.471,3.543,1.471
                                            c1.173,0,2.349-0.41,3.295-1.237c0.083-0.072,2.169-1.885,13.898-11.289c12.238-9.813,27.619-24.74,28.318-25.421l31.483-31.483
                                            l30.644,30.644c0.976,0.977,2.256,1.465,3.535,1.465s2.56-0.488,3.535-1.465l0.339-0.339c4.458-4.457,6.913-10.385,6.913-16.689
                                            c0-5.851-2.118-11.375-5.985-15.703l48.533-56.55c2.569,1.425,5.466,2.192,8.485,2.192c4.687,0,9.093-1.825,12.406-5.14l0.229-0.229
                                            C193.448,60.629,193.448,57.463,191.495,55.511z"
                                            />
                                        </svg>
                                        {chat.participants.length > 1 ? (
                                            <PinnedGroupAvatar isPinned={true} chat={chat} />
                                        ) : (
                                            <IndividualAvatar isPinned={true} chat={chat} />
                                        )}
                                        <div className="pinnedBottomDiv">
                                            {hasNotification ? <div className="pinnedNotification" /> : null}
                                            <p>{generateChatTitle(chat)}</p>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                ) : null}
                {chatSearchString.length > 0
                    ? chats
                          .filter(
                              Chat =>
                                  Chat.hasOwnProperty("lastMessage") &&
                                  (Chat.displayName?.toLowerCase().includes(chatSearchString.toLowerCase()) ||
                                      Chat.participants.some(handle => {
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
                                      className={activeChat?.guid === filteredChat.guid ? "activeChat" : ""}
                                  >
                                      {hasNotification ? (
                                          <div className="notification" />
                                      ) : (
                                          <div style={{ width: "20px", minWidth: "20px" }} />
                                      )}
                                      <Conversation
                                          onChatSelect={() => this.setCurrentChat(filteredChat)}
                                          config={this.state.config}
                                          chat={filteredChat}
                                      />
                                  </div>
                              );
                          })
                    : chats
                          .filter(aChat => !this.state.allPinnedChats.includes(aChat.guid))
                          .map(chat => {
                              let hasNotification =
                                  chat.lastMessage &&
                                  !chat.lastMessage.isFromMe &&
                                  chat.lastViewed < chat.lastMessage.dateCreated;
                              if (!chat.lastViewed || (hasNotification && activeChat && activeChat.guid === chat.guid))
                                  hasNotification = false;
                              //   if (!chat.hasOwnProperty("lastMessage")) return null;
                              return (
                                  <div
                                      key={chat.guid}
                                      className={`conversationSlide ${
                                          activeChat?.guid === chat.guid ? "activeChat" : ""
                                      }`}
                                      //   onMouseDown={e => this.onMouseDown(e, chat)}
                                      //   onMouseUp={e => this.onMouseUp(e)}
                                      //   onMouseMove={e => this.onMouseMove(e, chat)}
                                  >
                                      {hasNotification ? (
                                          <div className="notification" />
                                      ) : (
                                          <div style={{ width: "20px", minWidth: "20px" }} />
                                      )}
                                      <Conversation
                                          onChatSelect={() => this.setCurrentChat(chat)}
                                          config={this.state.config}
                                          chat={chat}
                                      />
                                      <div
                                          className="afterSlide muteSlide"
                                          onClick={e => this.handleChangeMute(e, chat)}
                                      >
                                          {this.state.config.allMutedChats.includes(chat.guid) ? (
                                              <img alt="dnd" src={dndIconActive} />
                                          ) : (
                                              <img alt="dnd" src={dndIconInactive} />
                                          )}
                                      </div>
                                      <div className="afterSlide pinSlide" onClick={() => this.handleChangePin(chat)}>
                                          <svg x="0px" y="0px" viewBox="0 0 193.826 193.826">
                                              <path
                                                  d="M191.495,55.511L137.449,1.465c-1.951-1.953-5.119-1.953-7.07,0l-0.229,0.229c-3.314,3.313-5.14,7.72-5.14,12.406
                                            c0,3.019,0.767,5.916,2.192,8.485l-56.55,48.533c-4.328-3.868-9.852-5.985-15.703-5.985c-6.305,0-12.232,2.455-16.689,6.913
                                            l-0.339,0.339c-1.953,1.952-1.953,5.118,0,7.07l32.378,32.378l-31.534,31.533c-0.631,0.649-15.557,16.03-25.37,28.27
                                            c-9.345,11.653-11.193,13.788-11.289,13.898c-1.735,1.976-1.639,4.956,0.218,6.822c0.973,0.977,2.256,1.471,3.543,1.471
                                            c1.173,0,2.349-0.41,3.295-1.237c0.083-0.072,2.169-1.885,13.898-11.289c12.238-9.813,27.619-24.74,28.318-25.421l31.483-31.483
                                            l30.644,30.644c0.976,0.977,2.256,1.465,3.535,1.465s2.56-0.488,3.535-1.465l0.339-0.339c4.458-4.457,6.913-10.385,6.913-16.689
                                            c0-5.851-2.118-11.375-5.985-15.703l48.533-56.55c2.569,1.425,5.466,2.192,8.485,2.192c4.687,0,9.093-1.825,12.406-5.14l0.229-0.229
                                            C193.448,60.629,193.448,57.463,191.495,55.511z"
                                              />
                                          </svg>
                                      </div>
                                  </div>
                              );
                          })}
            </div>
        );
    }
}

export default LeftConversationsNav;
