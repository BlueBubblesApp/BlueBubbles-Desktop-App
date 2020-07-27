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

    async componentDidMount() {
        ipcRenderer.on("open-details", () => {
            this.setState({ isDetailsOpen: true });
        });

        ipcRenderer.on("close-details", () => {
            this.setState({ isDetailsOpen: false });
        });

        ipcRenderer.on("set-current-chat", this.onChatChange);
    }

    componentWillUnmount() {
        ipcRenderer.removeListener("set-current-chat", this.onChatChange);
    }

    onChatChange = async (_: IpcRendererEvent, chat: Chat) => {
        this.setState({ currentChat: chat });
    };

    render() {
        return (
            <div className="RightCol-Mes">
                {!this.state.currentChat ? (
                    <>
                        <NewMessageTopNav />
                        <NewMessageConversationDisplay />
                        <NewMessageBottomNav />
                    </>
                ) : (
                    <>
                        {this.state.isDetailsOpen === true ? (
                            <>
                                <RightTopNav chat={this.state.currentChat} isDetailsOpen={true} />
                                <DetailsDisplay chat={this.state.currentChat} />
                            </>
                        ) : (
                            <>
                                <RightTopNav chat={this.state.currentChat} isDetailsOpen={false} />
                                <RightConversationDisplay chat={this.state.currentChat} />
                                <RightBottomNav chat={this.state.currentChat} />
                            </>
                        )}
                    </>
                )}
            </div>
        );
    }
}

export default RightCol;
