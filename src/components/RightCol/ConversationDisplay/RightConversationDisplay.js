import React from 'react';
import '../ConversationDisplay/RightConversationDisplay.css';
import Timestamp from './Timestamp/Timestamp';
import IncomingMessage from './IncomingMessage/IncomingMessage';
import OutgoingMessage from './OutgoingMessage/OutgoingMessage';

function RightConversationDisplay() {
  return (
    <div className="RightConversationDisplay">
      <Timestamp></Timestamp>
      <OutgoingMessage></OutgoingMessage>
      <IncomingMessage></IncomingMessage>
    </div>
  );
}

export default RightConversationDisplay;
