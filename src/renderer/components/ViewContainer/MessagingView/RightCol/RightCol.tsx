import * as React from "react";
import { ipcRenderer, IpcRendererEvent } from "electron";
import { Chat } from "@server/databases/chat/entity";

import "./RightCol.css";
import RightTopNav from "./TopNav/RightTopNav";
import RightConversationDisplay from "./ConversationDisplay/RightConversationDisplay";
import RightBottomNav from "./BottomNav/RightBottomNav";
import NewMessageTopNav from "./NewMessageTop/NewMessageTopNav";
import NewMessageConversationDisplay from "./NewMessageConversation/NewMessageConversationDisplay";
import NewMessageBottomNav from "./NewMessageBottom/NewMessageBottomNav";

type ServerInputTitleState = {
    currentChat: Chat;
};

class RightCol extends React.Component<object, ServerInputTitleState> {
    constructor(props) {
        super(props);

        this.state = {
            currentChat: null
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
                        <RightTopNav chat={currentChat} />
                        <RightConversationDisplay chat={currentChat} />
                        <RightBottomNav chat={currentChat} />
                    </>
                )}
            </div>
        );
    }
}

export default RightCol;
