import React from 'react';
import './LeftCol.css';
import LeftTopNav from './TopNav/LeftTopNav';
import LeftConversationNav from './ConversationsNav/LeftConversationsNav';

function LeftCol() {
  return (
    <div className="LeftCol">
        <LeftTopNav></LeftTopNav>
        <LeftConversationNav></LeftConversationNav>
    </div>
  );
}

export default LeftCol;
