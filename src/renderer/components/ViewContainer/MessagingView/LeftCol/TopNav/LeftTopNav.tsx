import * as React from "react";
import "./LeftTopNav.css";
import { BrowserRouter, Route, Link } from "react-router-dom";
import ComposeIcon from "../../../../../assets/icons/compose-icon.png";
import SettingsIcon from "../../../../../assets/icons/settings-icon.png";

function LeftTopNav() {
    return (
        <div className="LeftTopNav-Mes">
            <div id="leftTopSearch">
                <input id="messageSearch" type="text" name="search" placeholder="Search" />
            </div>
            <div className="leftTopButton">
                <Link id="newMessage" to="/newMessage">
                    <img id="composeIcon" src={ComposeIcon} alt="compose" />
                </Link>
            </div>
        </div>
    );
}

export default LeftTopNav;
