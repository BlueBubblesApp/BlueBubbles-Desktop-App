import * as React from "react";
import { ipcRenderer, IpcRendererEvent } from "electron";
import { Chat } from "@server/databases/chat/entity";
import "./RightCol.css";

import RightTopNav from "./Messaging/TopNav/RightTopNav";
import RightConversationDisplay from "./Messaging/ConversationDisplay/RightConversationDisplay";
import RightBottomNav from "./Messaging/BottomNav/RightBottomNav";

import NewMessageTopNav from "./NewMessage/NewMessageTop/NewMessageTopNav";
import NewMessageConversationDisplay from "./NewMessage/NewMessageConversation/NewMessageConversationDisplay";
import NewMessageBottomNav from "./NewMessage/NewMessageBottom/NewMessageBottomNav";

import DetailsTopNav from "./Details/DetailsTop/DetailsTopNav";
import DetailsDisplay from "./Details/DetailsDisplay/DetailsDisplay";

type ServerInputTitleState = {
    currentChat: Chat;
    isDetailsOpen: boolean;
};

class RightCol extends React.Component<object, ServerInputTitleState> {
    constructor(props) {
        super(props);

        this.state = {
            currentChat: null,
            isDetailsOpen: false
            // Set this true to see detail view
        };
    }

    componentDidMount() {
        ipcRenderer.on("set-current-chat", this.onChatChange);
    }

    componentWillUnmount() {
        ipcRenderer.removeListener("set-current-chat", this.onChatChange);
    }

    onChatChange = async (_: IpcRendererEvent, chat: Chat) => {
        this.setState({ currentChat: chat });
    };

    render() {
        const { currentChat } = this.state;

        return (
            <div className="RightCol-Mes">
                {!currentChat ? (
                    <>
                        <NewMessageTopNav />
                        <NewMessageConversationDisplay />
                        <NewMessageBottomNav />
                    </>
                ) : (
                    <>
                        {this.state.isDetailsOpen ? (
                            <>
                                <DetailsTopNav />
                                <DetailsDisplay />
                            </>
                        ) : (
                            <>
                                <RightTopNav chat={currentChat} />
                                <RightConversationDisplay chat={currentChat} />
                                <RightBottomNav chat={currentChat} />
                            </>
                        )}
                    </>
                )}
            </div>
        );
    }
}

export default RightCol;
