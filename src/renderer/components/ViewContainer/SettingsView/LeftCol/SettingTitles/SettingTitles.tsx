import * as React from "react";
import "./SettingTitles.css";
import { BrowserRouter as Router, NavLink } from "react-router-dom";
import Setting from "./Setting/Setting";

// These need to be expanded

function SettingTitles() {
    return (
        <div className="SettingTitles">
            <NavLink exact to="/settings/generaltab" activeClassName="active">
                <Setting title="General" subTitle="Connection, Notifications, Features " />
            </NavLink>
            <NavLink exact to="/settings/storagetab" activeClassName="active">
                {" "}
                <Setting title="Storage" subTitle="Manage local data" />
            </NavLink>
            <NavLink exact to="/settings/appearancetab" activeClassName="active">
                {" "}
                <Setting title="Appearance" subTitle="Change the way the app looks" />
            </NavLink>
            <NavLink exact to="/settings/abouttab" activeClassName="active">
                {" "}
                <Setting title="About" subTitle="Version, Developers" />
            </NavLink>
        </div>
    );
}

export default SettingTitles;
