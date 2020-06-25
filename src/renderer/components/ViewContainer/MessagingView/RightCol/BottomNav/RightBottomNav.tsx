import * as React from "react";
import "./RightBottomNav.css";
import SendIcon from "../../../../../assets/icons/send-icon.png";

function RightBottomNav() {
    function SendMessage() {
        // Ping server to send message here
        console.log("Send Message");
    }

    return (
        <div className="RightBottomNav">
            <div id="messageField">
                <input id="messageFieldInput" type="text" name="message field" placeholder="iMessage" />
            </div>
            <div id="rightBottomButton">
                <img id="sendIcon" onClick={SendMessage} src={SendIcon} alt="send" />
            </div>
        </div>
    );
}

export default RightBottomNav;
