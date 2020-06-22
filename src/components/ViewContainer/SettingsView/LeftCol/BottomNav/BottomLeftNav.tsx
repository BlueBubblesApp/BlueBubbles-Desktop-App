import React from 'react';
import './BottomLeftNav.css';
import SettingsIcon from '../../../../../assets/return-icon.png';
import { BrowserRouter, Route, Link } from "react-router-dom";


function BottomLeftNav() {
  return (
    <div className="BottomLeftNav">
        <Link id="returnIconLink" to="/"><img id="returnIcon"
                            src={SettingsIcon}></img></Link>
    </div>
  );
}

export default BottomLeftNav;
