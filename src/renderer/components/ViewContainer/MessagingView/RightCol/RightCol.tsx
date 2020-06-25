import * as React from 'react';
import './RightCol.css';
import RightTopNav from './TopNav/RightTopNav';
import RightConversationDisplay from './ConversationDisplay/RightConversationDisplay';
import RightBottomNav from './BottomNav/RightBottomNav';

function RightCol() {
    return (
        <div className="RightCol-Mes">
            <RightTopNav></RightTopNav>
            <RightConversationDisplay></RightConversationDisplay>
            <RightBottomNav></RightBottomNav>
        </div>
    );
}

export default RightCol;
