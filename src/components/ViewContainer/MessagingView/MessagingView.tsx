import React from 'react';
import './MessagingView.css';
import LeftCol from './LeftCol/LeftCol';
import RightCol from './RightCol/RightCol';

function MessagingView() {
  return (
    <div className="MessagingView">
        <LeftCol></LeftCol>
        <RightCol></RightCol>
    </div>
  );
}

export default MessagingView;
