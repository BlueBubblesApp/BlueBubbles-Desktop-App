import React from 'react';
import './BottomLeftNav.css';
import SettingsIcon from '../../../../../assets/settings-icon.png';
import { BrowserRouter, Route, Link } from "react-router-dom";


function BottomLeftNav() {
  return (
    <div className="BottomLeftNav">
        <Link id="settingsIconLink" to="/settings/tab1"><img id="settingsIcon"
                            src={SettingsIcon}></img></Link>
    </div>
  );
}

export default BottomLeftNav;
