import * as React from "react";
import "./LeftCol.css";
import LeftTopNav from "./TopNav/LeftTopNav";
import LeftConversationNav from "./ConversationsNav/LeftConversationsNav";
import BottomLeftNav from "./BottomNav/BottomLeftNav";

function LeftCol() {
    return (
        <div className="LeftCol-Mes">
            <LeftTopNav />
            <LeftConversationNav />
            <BottomLeftNav />
        </div>
    );
}

export default LeftCol;
