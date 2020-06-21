import React from 'react';
import '../TopNav/LeftTopNav.css';
import ComposeIcon from '../../../assets/compose-icon.png';

function LeftTopNav() {
  return (
    <div className="LeftTopNav">
        <div id="leftTopSearch"><input id="messageSearch" type="text" name="search" placeholder="Search"></input></div>
        <div id="leftTopButton"><a id="newMessage" href="https://google.com"><img id="composeIcon"
                            src={ComposeIcon}></img></a></div>
    </div>
  );
}

export default LeftTopNav;
