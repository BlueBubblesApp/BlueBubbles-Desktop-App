import * as React from 'react';
import './LeftTopNav.css';
import { BrowserRouter, Route, Link } from 'react-router-dom';
import ComposeIcon from '../../../../../assets/icons/compose-icon.png';

function LeftTopNav() {
    return (
        <div className="LeftTopNav-Set">
            <div id="leftTopSearch">
                <input id="messageSearch" type="text" name="search" placeholder="Search" />
            </div>
        </div>
    );
}

export default LeftTopNav;
