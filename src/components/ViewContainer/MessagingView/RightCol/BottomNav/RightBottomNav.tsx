import React from 'react';
import '../BottomNav/RightBottomNav.css';
import SendIcon from '../../../../../assets/send-icon.png';

function RightBottomNav() {
  return (
    <div className="RightBottomNav">
      <div id="messageField"><input id="messageFieldInput" type="text" name="message field"
          placeholder="iMessage"></input>
      </div>
      <div id="rightBottomButton"><a id="sendMessage" href=""><img id="sendIcon" src={SendIcon}></img></a>
      </div>
    </div>
  );
}

export default RightBottomNav;
