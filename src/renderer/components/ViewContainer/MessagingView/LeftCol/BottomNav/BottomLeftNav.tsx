import * as React from "react";
import "./BottomLeftNav.css";
import { BrowserRouter, Route, Link } from "react-router-dom";
import SettingsIcon from "../../../../../assets/icons/settings-icon.png";

function BottomLeftNav() {
    return (
        <div className="BottomLeftNav-Mes">
            <Link id="settingsIconLink" to="/settings/tab1">
                <img id="settingsIcon" src={SettingsIcon} alt="settings" />
            </Link>
        </div>
    );
}

export default BottomLeftNav;
