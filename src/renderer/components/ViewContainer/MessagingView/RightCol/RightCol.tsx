import * as React from "react";
import { ipcRenderer } from "electron";
import "./RightCol.css";
import RightTopNav from "./TopNav/RightTopNav";
import RightConversationDisplay from "./ConversationDisplay/RightConversationDisplay";
import RightBottomNav from "./BottomNav/RightBottomNav";
import NewMessageTopNav from "./NewMessageTop/NewMessageTopNav";
import NewMessageConversationDisplay from "./NewMessageConversation/NewMessageConversationDisplay";
import NewMessageBottomNav from "./NewMessageBottom/NewMessageBottomNav";

type ServerInputTitleState = {
    isMakingNewChat: boolean;
};

class RightCol extends React.Component<object, ServerInputTitleState> {
    constructor(props) {
        super(props);

        this.state = {
            isMakingNewChat: false
        };
    }

    async componentDidMount() {
        const config = await ipcRenderer.invoke("get-config");
        this.setState({ isMakingNewChat: config.isMakingNewChat });

        ipcRenderer.on("config-update", (_, args) => {
            console.log(args.isMakingNewChat);
            this.setState({ isMakingNewChat: args.isMakingNewChat });
        });
    }

    render() {
        return (
            <div className="RightCol-Mes">
                {this.state.isMakingNewChat ? (
                    <>
                        <NewMessageTopNav />
                        <NewMessageConversationDisplay />
                        <NewMessageBottomNav />
                    </>
                ) : (
                    <>
                        <RightTopNav />
                        <RightConversationDisplay />
                        <RightBottomNav />
                    </>
                )}
            </div>
        );
    }
}

export default RightCol;
