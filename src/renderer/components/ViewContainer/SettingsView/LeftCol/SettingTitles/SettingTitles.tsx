import * as React from "react";
import "./SettingTitles.css";
import { BrowserRouter as Router, NavLink } from "react-router-dom";
import Setting from "./Setting/Setting";

// These need to be expanded

function SettingTitles() {
    return (
        <div className="SettingTitles">
            <NavLink exact to="/settings/tab1" activeClassName="active">
                <Setting title="General" subTitle="Connection, Notifications, Features " />
            </NavLink>
            <NavLink exact to="/settings/tab2" activeClassName="active">
                {" "}
                <Setting title="Storage" subTitle="Manage local data" />
            </NavLink>
            <NavLink exact to="/settings/tab3" activeClassName="active">
                {" "}
                <Setting title="Themes" subTitle="Change the way the app looks" />
            </NavLink>
            <NavLink exact to="/settings/tab4" activeClassName="active">
                {" "}
                <Setting title="About" subTitle="Version, Developers" />
            </NavLink>
        </div>
    );
}

export default SettingTitles;
