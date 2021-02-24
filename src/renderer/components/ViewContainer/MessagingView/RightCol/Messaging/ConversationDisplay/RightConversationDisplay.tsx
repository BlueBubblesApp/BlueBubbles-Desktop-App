/* eslint-disable max-len */
/* eslint-disable class-methods-use-this */
import * as React from "react";
import { ipcRenderer } from "electron";
import { Chat as DBChat, Handle, Message as DBMessage } from "@server/databases/chat/entity";
import { getDateText, getSender, getTimeText } from "@renderer/helpers/utils";
import { ValidTapback } from "@server/types";

import "./RightConversationDisplay.css";
import { Theme } from "@server/databases/config/entity";
import ChatLabel from "./ChatLabel";
import MessageBubble from "./MessageBubble";

type Chat = DBChat & {
    isTyping?: boolean;
};

type Props = {
    chat: Chat;
};

type State = {
    isLoading: boolean;
    messages: Message[];
    gradientMessages: boolean;
    colorfulContacts: boolean;
    colorfulChatBubbles: boolean;
    useNativeEmojis: boolean;
    theme: any;
    chat: Chat;
    showScrollToBottom: boolean;
    myLastMessage: Message;
    lastReadMessage: Message;
};

type Message = DBMessage & {
    tempGuid: string;
    reactions: DBMessage[];
    reactionsChecked: boolean;
};

const deduplicateReactions = (reactions: DBMessage[]) => {
    const uniqueReactions: { [key: string]: DBMessage } = {};
    for (const reaction of reactions) {
        // Let's build a unique string representing the person who made the reaction
        // We can't only use handleId because it's inconsistant for groups vs. single conversations
        // We are going to use a combination of handleId and isFromMe
        const key = `${reaction.handleId ?? "none"}:${reaction.isFromMe}`;

        // Next, let's check if the key exists in the tracker object (uniqueReactions)
        // If it doesn't exist, just add it. Otherwise, compare the date before adding/replacing
        if (!Object.keys(uniqueReactions).includes(key)) {
            uniqueReactions[key] = reaction;
        } else if (reaction.dateCreated > uniqueReactions[key].dateCreated) {
            uniqueReactions[key] = reaction;
        }
    }

    return Object.values(uniqueReactions);
};

let shouldAutoScroll = true;

class RightConversationDisplay extends React.Component<Props, State> {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,
            messages: [],
            gradientMessages: false,
            colorfulContacts: false,
            colorfulChatBubbles: false,
            useNativeEmojis: false,
            chat: this.props.chat,
            theme: "",
            showScrollToBottom: false,
            myLastMessage: null,
            lastReadMessage: null
        };
    }

    async componentDidMount() {
        ipcRenderer.on("message", async (_, payload: { message: Message; tempGuid?: string }) => {
            const { message } = payload;

            // If the message isn't for this chat, ignore it
            if (!message.chats || message.chats[0].guid !== this.props.chat.guid) return;

            // Convert the message to a message with a tempGuid
            const msg = message as Message;
            msg.tempGuid = payload.tempGuid ?? null;

            // Otherwise, add the message to the state
            await this.addMessagesToState([msg]);
        });

        ipcRenderer.on("add-message", async (_, message: Message) => {
            // Otherwise, add the message to the state
            await this.addMessagesToState([message]);

            if (message.associatedMessageGuid) return;

            // Scroll to bottom on new message
            this.scrollToBottom();
        });

        ipcRenderer.on("typing-indicator", (_, res) => {
            const { chat } = this.state;

            if (res.guid.includes(chat.guid)) {
                chat.isTyping = res.display;
                this.setState({ chat });

                if (res.display) {
                    const view = document.getElementById("messageView");

                    // If scroll is within 500px from bottom of chat, scroll to bottom
                    if (view.scrollHeight - view.offsetHeight - view.scrollTop <= 500) {
                        this.scrollToBottom();
                    }
                }
            }
        });

        ipcRenderer.on("scroll-to-bottom", async (_, force) => {
            if (!force && !shouldAutoScroll) return;
            this.scrollToBottom();
        });

        const config = await ipcRenderer.invoke("get-config");
        const theme: Theme = await ipcRenderer.invoke("get-theme", config.currentTheme);

        this.setState({
            theme,
            gradientMessages: config.gradientMessages,
            colorfulContacts: config.colorfulContacts,
            colorfulChatBubbles: config.colorfulChatBubbles,
            useNativeEmojis: config.useNativeEmojis
        });

        await this.chatChange();
    }

    componentDidUpdate(prevProps) {
        if (this.props.chat?.guid !== prevProps.chat?.guid) {
            this.chatChange();
        }
    }

    async getNextMessagePage() {
        let messageTimestamp = null;
        if (this.state.messages.length > 0) {
            messageTimestamp = this.state.messages[0].dateCreated;
        }

        // Set the loading state
        this.setState({ isLoading: true });

        // Get the next page of messages
        const messages: DBMessage[] = await ipcRenderer.invoke("get-messages", {
            chatGuid: this.props.chat.guid,
            withHandle: true,
            withAttachments: true,
            withChat: false,
            limit: 35,
            after: 1,
            before: messageTimestamp ?? new Date().getTime(),
            where: []
        });

        // Add each message to the state
        await this.addMessagesToState(messages as Message[]); // These won't have a tempGuid

        // Tell the state we are done loading
        const view = document.getElementById("messageView");

        this.setState({ isLoading: false }, () => {
            // If this is a fresh chat, scroll to the bottom
            if (!messageTimestamp) {
                view.scrollTop = view.scrollHeight;
            }
        });

        // if (!this.isScrollable(view)) {
        //     await this.getNextMessagePage();
        //     view.scrollTop = view.scrollHeight;
        // }
    }

    // eslint-disable-next-line react/sort-comp
    async fetchReactions(messages: Message[]) {
        const updatedMessages = [...messages];
        const stateMessages = [...this.state.messages];
        let hasUpdates = false;
        for (let i = 0; i < updatedMessages.length; i += 1) {
            // Fetch the message reactions
            updatedMessages[i].reactions = await ipcRenderer.invoke("get-reactions", updatedMessages[i]);
            if (updatedMessages[i].reactions.length > 0) hasUpdates = true;

            // Since a person can change their reaction, it creates 1 "message" per change
            // This will cause multiple reactions per-person if not de-duplicated. Let's do that.
            updatedMessages[i].reactions = deduplicateReactions(updatedMessages[i].reactions);

            // Find the corresponding state message and update it
            for (let x = 0; x < stateMessages.length; x += 1) {
                if (stateMessages[x].guid === updatedMessages[i].guid) {
                    stateMessages[x].reactions = updatedMessages[i].reactions;
                    break;
                }
            }
        }

        // Update the state with the new message reactions
        if (hasUpdates) this.setState({ messages: stateMessages });
    }

    async chatChange() {
        const config = await ipcRenderer.invoke("get-config");
        const theme: Theme = await ipcRenderer.invoke("get-theme", config.currentTheme);

        this.setState({
            theme,
            gradientMessages: config.gradientMessages,
            colorfulContacts: config.colorfulContacts,
            colorfulChatBubbles: config.colorfulChatBubbles,
            useNativeEmojis: config.useNativeEmojis
        });

        // Reset the messages and other state vars
        this.setState(
            {
                messages: [],
                myLastMessage: null,
                lastReadMessage: null,
                showScrollToBottom: false
            },
            () => {
                // Set the text field to active
                const msgField = document.getElementById("messageFieldInput");
                if (msgField) msgField.focus();

                // Get new messages
                this.getNextMessagePage();
            }
        );
    }

    tryUpdateMessageMarkers(msg: Message) {
        if (!msg?.isFromMe) return;

        let { myLastMessage, lastReadMessage } = this.state;

        let lastChange = false;
        if (
            myLastMessage == null ||
            (myLastMessage?.dateCreated != null &&
                msg.dateCreated != null &&
                msg.dateCreated > myLastMessage.dateCreated &&
                msg.guid !== myLastMessage.guid)
        ) {
            myLastMessage = msg;
            lastChange = true;
        }

        let lastRead = false;
        if (
            (lastReadMessage == null && msg.dateRead != null) ||
            (lastReadMessage?.dateRead != null &&
                msg.dateRead != null &&
                msg.dateRead > lastReadMessage.dateRead &&
                msg.guid !== lastReadMessage.guid)
        ) {
            lastReadMessage = msg;
            lastRead = true;
        }

        const update: Partial<State> = {};
        if (lastRead) update.myLastMessage = myLastMessage;
        if (lastChange) update.lastReadMessage = lastReadMessage;

        if (Object.keys(update).length > 0) {
            this.setState(update as State);
        }
    }

    async detectTop(e: React.UIEvent<HTMLDivElement, UIEvent>) {
        if (!e.currentTarget) return;
        const offsetFromBottom =
            e.currentTarget.scrollHeight - e.currentTarget.scrollTop - e.currentTarget.offsetHeight;
        if (offsetFromBottom > 200 && !this.state.showScrollToBottom) {
            this.setState({ showScrollToBottom: true });
        } else if (offsetFromBottom < 200 && this.state.showScrollToBottom) {
            this.setState({ showScrollToBottom: false });
        }

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

        // Default to true
        shouldAutoScroll = false;
        if (e.currentTarget.scrollTop === e.currentTarget.scrollHeight - e.currentTarget.offsetHeight) {
            shouldAutoScroll = true;
        }
    }

    async addMessagesToState(messages: Message[]) {
        // Make copies of state
        const updatedMessages = [...this.state.messages];

        // Add to the state if
        for (const message of messages) {
            // Check if the message already exists (via real GUID or temp GUID)
            const opts = message.tempGuid ? [message.guid, message.tempGuid] : [message.guid];
            const exists = updatedMessages.findIndex(i => opts.includes(i.guid));
            if (exists === -1) {
                updatedMessages.push(message);
            } else {
                updatedMessages[exists] = message;
            }
        }

        // De-duplicate the messages (as a fail-safe)
        const outputMessages: Message[] = [];
        for (const i of updatedMessages) {
            let exists = false;
            for (const k of outputMessages) {
                if (i.guid === k.guid) {
                    exists = true;
                    break;
                }
            }

            if (!exists) outputMessages.push(i);
        }

        // For each message, check if there are any reactions for it
        const messageList: Message[] = [];
        const reactionList: Message[] = [];
        for (let i = 0; i < outputMessages.length; i += 1) {
            if (
                outputMessages[i].hasReactions &&
                !outputMessages[i].reactionsChecked &&
                !outputMessages[i].associatedMessageGuid
            ) {
                // Set flags telling the FE to not fetch reactions for them again
                outputMessages[i].reactionsChecked = true;
                outputMessages[i].reactions = [];

                // Add to list
                messageList.push(outputMessages[i]);
            } else if (outputMessages[i].associatedMessageGuid) {
                reactionList.push(outputMessages[i]);
            }
        }

        // For each reaction, find the corresponding message, and merge the reactions
        for (const reaction of reactionList) {
            for (let i = 0; i < outputMessages.length; i += 1) {
                if (reaction.associatedMessageGuid === outputMessages[i].guid) {
                    if (outputMessages[i].reactions) {
                        outputMessages[i].reactions.push(reaction);
                        outputMessages[i].reactions = deduplicateReactions(outputMessages[i].reactions);
                    } else {
                        outputMessages[i].hasReactions = true;
                        outputMessages[i].reactions = [];
                        outputMessages[i].reactions.push(reaction);
                        outputMessages[i].reactions = deduplicateReactions(outputMessages[i].reactions);
                    }

                    break;
                }
            }
        }

        // Update the markers
        for (const i of outputMessages) {
            this.tryUpdateMessageMarkers(i);
        }

        // Update the state (and wait for it to finish)
        await new Promise((resolve, _) =>
            this.setState({ messages: outputMessages.filter(i => !i.associatedMessageGuid) }, () => resolve(null))
        );

        // Asynchronously fetch the reactions
        this.fetchReactions(messageList);

        return true;
    }

    getChatEvent(message: Message) {
        const sender = message.isFromMe || !message.handle ? "You" : getSender(message.handle) ?? "";

        const date = message.dateCreated
            ? `${getDateText(new Date(message.dateCreated), true)}, ${getTimeText(new Date(message.dateCreated))}`
            : "";

        if (message.itemType === 0 && message.groupActionType === 0 && message.attachments.length === 0) {
            return <ChatLabel text={`${sender} sent a handwritten note`} date={date} />;
        }

        if (message.itemType === 1 && message.groupActionType === 1) {
            return <ChatLabel text={`${sender} removed someone from the conversation`} date={date} />;
        }
        if (message.itemType === 1 && message.groupActionType === 0) {
            return <ChatLabel text={`${sender} added someone to the conversation`} date={date} />;
        }
        if (message.itemType === 3) {
            return <ChatLabel text={`${sender} left the conversation`} date={date} />;
        }

        if (message.itemType === 4 && message.groupActionType === 0) {
            return (
                <ChatLabel
                    text={`${sender} started sharing ${
                        message.isFromMe || !message.handle ? "your" : "their"
                    } location`}
                    date={date}
                />
            );
        }

        if (message.itemType === 5 && message.groupActionType === 0) {
            const originalMessage = this.state.messages.find(mes => mes.guid === message.subject);
            let originalSender;
            if (originalMessage) {
                originalSender = originalMessage.isFromMe ? "you" : getSender(originalMessage.handle);
            } else {
                originalSender = "unavailable";
            }

            return <ChatLabel text={`${sender} kept Digital Touch Message from ${originalSender}`} date={date} />;
        }

        if (message.itemType === 2 && message.groupTitle !== null) {
            return <ChatLabel text={`${sender} renamed the conversation to ${message.groupTitle}`} date={date} />;
        }

        return <ChatLabel text={`Unknown chat event from ${sender}`} date={date} />;
    }

    isScrollable(ele) {
        // Compare the height to see if the element has scrollable content
        const hasScrollableContent = ele.scrollHeight > ele.clientHeight;

        // It's not enough because the element's `overflow-y` style can be set as
        // * `hidden`
        // * `hidden !important`
        // In those cases, the scrollbar isn't shown
        const overflowYStyle = window.getComputedStyle(ele).overflowY;
        const isOverflowHidden = overflowYStyle.indexOf("hidden") !== -1;

        return hasScrollableContent && !isOverflowHidden;
    }

    scrollToBottom() {
        const view = document.getElementById("messageView");
        view.scrollTop = view.scrollHeight;
    }

    shouldShow(message: Message) {
        // If we have no delivered date, don't show anything
        if (message.dateDelivered === null) return false;

        // If the passed params are null, try to get it from the current chat
        if (this.state.myLastMessage === null || this.state.lastReadMessage === null) return false;

        if (
            message.guid === this.state.myLastMessage.guid ||
            (message.dateDelivered !== null && this.state.myLastMessage.dateDelivered === null)
        )
            return true;

        // If all else fails, return what our parent wants
        return false;
    }

    render() {
        const { messages, isLoading } = this.state;
        const { chat } = this.state;

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

        const date =
            messages.length > 0
                ? `${getDateText(new Date(messages[0].dateCreated), true)}, ${getTimeText(
                      new Date(messages[0].dateCreated)
                  )}`
                : null;
        messages.sort((a, b) => (a.dateCreated > b.dateCreated ? 1 : -1));

        return (
            <div id="messageView" onScroll={e => this.detectTop(e)} className="RightConversationDisplay">
                {this.state.showScrollToBottom ? (
                    <button id="stb-button" onClick={() => this.scrollToBottom()}>
                        &#8595;
                    </button>
                ) : null}

                {/* <div id="gradientOverlay" /> */}
                {isLoading ? <div id="loader" className="inChatLoader" /> : null}
                <ChatLabel text={`BlueBubbles Messaging with ${chatTitle}`} date={date} />

                {/* Reverse the list because we want to display it bottom to top */}
                {messages.map((message: Message, index: number) => {
                    let newerMessage = null;
                    let olderMessage = null;

                    // Get the surrounding messages (if available)
                    if (index - 1 >= 0 && index - 1 < messages.length) olderMessage = messages[index - 1];
                    if (index + 1 < messages.length && index + 1 >= 0) newerMessage = messages[index + 1];

                    return (
                        <div key={message.guid}>
                            {/* If the last previous message is older than 30 minutes, display the time */}
                            {message.text &&
                            olderMessage &&
                            message.dateCreated - olderMessage.dateCreated > 1000 * 60 * 60 ? (
                                <ChatLabel
                                    text={`${getDateText(new Date(message.dateCreated), true)}, ${getTimeText(
                                        new Date(message.dateCreated)
                                    )}`}
                                />
                            ) : null}
                            {/* If the message text is null, it's a group event */}
                            {message.text || message.attachments.length > 0 ? (
                                <div
                                    style={{ marginTop: message?.isFromMe !== olderMessage?.isFromMe ? "5px" : "2px" }}
                                >
                                    <MessageBubble
                                        chat={chat}
                                        message={message}
                                        olderMessage={olderMessage}
                                        newerMessage={newerMessage}
                                        showStatus={this.shouldShow(message)}
                                        messages={messages}
                                        gradientMessages={this.state.gradientMessages}
                                        colorfulContacts={this.state.colorfulContacts}
                                        colorfulChatBubbles={this.state.colorfulChatBubbles}
                                        theme={this.state.theme}
                                        useNativeEmojis={this.state.useNativeEmojis}
                                    />
                                </div>
                            ) : (
                                this.getChatEvent(message)
                            )}
                        </div>
                    );
                })}
                {chat.isTyping ? (
                    <div id="inChatTypingIndicator" style={{ marginLeft: "27px" }}>
                        <svg height="37px" width="100px">
                            <circle cx="10px" cy="31px" r="2px" className="backgroundTypingIndicator smallerCircle" />
                            <circle cx="17px" cy="25px" r="4px" className="backgroundTypingIndicator smallerCircle" />
                            <rect
                                x="14px"
                                y="2px"
                                width="45px"
                                height="28px"
                                rx="15"
                                className="mainTypingCircle backgroundTypingIndicator"
                            />

                            <circle cx="28px" cy="16px" r="3px" className="foregroundTypingIndicator">
                                <animate attributeName="opacity" values="0;1;0" dur="1.4s" repeatCount="indefinite" />
                            </circle>
                            <circle cx="36px" cy="16px" r="3px" opacity="0.3" className="foregroundTypingIndicator">
                                <animate
                                    begin=".3s"
                                    attributeName="opacity"
                                    values="0;1;0"
                                    dur="1.4s"
                                    repeatCount="indefinite"
                                />
                            </circle>
                            <circle cx="44px" cy="16px" r="3px" opacity="0.6" className="foregroundTypingIndicator">
                                <animate
                                    begin=".6s"
                                    attributeName="opacity"
                                    values="0;1;0"
                                    dur="1.4s"
                                    repeatCount="indefinite"
                                />
                            </circle>
                        </svg>
                    </div>
                ) : null}
            </div>
        );
    }
}

export default RightConversationDisplay;
