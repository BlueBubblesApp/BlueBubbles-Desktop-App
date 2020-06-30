import * as React from "react";
import "./LeftConversationsNav.css";
import Conversation from "./Conversation/Conversation";

interface State {
    chatPrevs: Array<any>;
}

class LeftConversationsNav extends React.Component<unknown, State> {
    constructor(props: unknown) {
        super(props);

        this.state = {
            chatPrevs: []
        };
    }

    // Fetch All Conversations
    componentDidMount() {
        console.log(this.state.chatPrevs);
        // fetch('http://localhost:4000/chatPrevs')
        //     .then(res => res.json())
        //     .then(res => this.setState({
        //         chatPrevs: res,
        //     }))
        // ipcRenderer.on('sendChatPrevs', function (event,data) {

        // });
    }

    render() {
        // const chatPrevs = this.state.chatPrevs;
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
