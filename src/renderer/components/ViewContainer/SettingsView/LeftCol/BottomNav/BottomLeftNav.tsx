import * as React from "react";
import "./BottomLeftNav.css";
import { BrowserRouter, Route, Link } from "react-router-dom";
import SettingsIcon from "../../../../../assets/icons/return-icon.png";

function BottomLeftNav() {
    return (
        <div className="BottomLeftNav-Set">
            <Link id="returnIconLink" to="/messaging">
                <img id="returnIcon" src={SettingsIcon} alt="return" />
            </Link>
        </div>
    );
}

export default BottomLeftNav;
