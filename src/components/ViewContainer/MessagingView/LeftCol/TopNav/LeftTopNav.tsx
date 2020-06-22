import React from 'react';
import '../TopNav/LeftTopNav.css';
import ComposeIcon from '../../../../../assets/compose-icon.png';
import SettingsIcon from '../../../../../assets/settings-icon.png';
import { BrowserRouter, Route, Link } from "react-router-dom";


function LeftTopNav() {
  return (
    <div className="LeftTopNav">
        <div id="leftTopSearch"><input id="messageSearch" type="text" name="search" placeholder="Search"></input></div>
        <div className="leftTopButton"><Link id="newMessage" to="/newMessage"><img id="composeIcon"
                            src={ComposeIcon}></img></Link></div>
    </div>
  );
}

export default LeftTopNav;
