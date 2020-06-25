import * as React from 'react';
import './BottomLeftNav.css';
import SettingsIcon from '../../../../../assets/icons/return-icon.png';
import { BrowserRouter, Route, Link } from 'react-router-dom';

function BottomLeftNav() {
    return (
        <div className="BottomLeftNav-Set">
            <Link id="returnIconLink" to="/">
                <img id="returnIcon" src={SettingsIcon}></img>
            </Link>
        </div>
    );
}

export default BottomLeftNav;
