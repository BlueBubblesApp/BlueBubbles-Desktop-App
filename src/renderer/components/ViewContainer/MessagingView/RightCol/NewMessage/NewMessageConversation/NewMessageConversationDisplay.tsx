import * as React from "react";
import "./NewMessageConversationDisplay.css";

type State = {};

class NewMessageConversationDisplay extends React.Component<unknown, State> {
    state = {};

    render() {
        return (
            // eslint-disable-next-line react/self-closing-comp
            <div id="messageView-NewMessage" className="RightConversationDisplay"></div>
        );
    }
}

export default NewMessageConversationDisplay;
