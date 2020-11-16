import * as React from "react";
import "./SettingTitles.css";
import { BrowserRouter as Router, NavLink } from "react-router-dom";
import Setting from "./Setting/Setting";

// These need to be expanded

function SettingTitles() {
    return (
        <div className="SettingTitles">
            <NavLink to="/settings/generaltab" className="noDrag" activeClassName="active">
                <Setting title="General" subTitle="Connection, Notifications, Features " />
            </NavLink>
            <NavLink to="/settings/contactstab" className="noDrag" activeClassName="active">
                <Setting title="Contacts" subTitle="Manage contacts" />
            </NavLink>
            <NavLink to="/settings/storagetab" className="noDrag" activeClassName="active">
                {" "}
                <Setting title="Storage" subTitle="Manage local data" />
            </NavLink>
            <NavLink to="/settings/appearancetab" className="noDrag" activeClassName="active">
                {" "}
                <Setting title="Appearance" subTitle="Change the way the app looks" />
            </NavLink>
            <NavLink to="/settings/abouttab" className="noDrag" activeClassName="active">
                {" "}
                <Setting title="About" subTitle="Version, Developers" />
            </NavLink>
        </div>
    );
}

export default SettingTitles;
