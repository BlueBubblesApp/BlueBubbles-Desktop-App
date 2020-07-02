import * as React from "react";

import "./BottomLeftNav.css";
import { Link } from "react-router-dom";
import SettingsIcon from "../../../../../assets/icons/settings-icon.png";

function BottomLeftNav() {
    return (
        <div className="BottomLeftNav-Mes">
            <Link id="settingsIconLink" to="/settings/tab1">
                <img id="settingsIcon" src={SettingsIcon} alt="settings" />
            </Link>
            <Link id="logoutButton" to="/">
                Skip to Login
            </Link>
        </div>
    );
}

export default BottomLeftNav;
