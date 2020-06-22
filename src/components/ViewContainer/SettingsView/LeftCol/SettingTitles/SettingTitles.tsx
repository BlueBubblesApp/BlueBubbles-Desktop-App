import React from 'react';
import './SettingTitles.css';
import Setting from './Setting/Setting';
import {
  BrowserRouter as Router,
  NavLink
} from "react-router-dom";

//These need to be expanded

function SettingTitles() {
  return (
    <div className="SettingTitles">
        <NavLink exact to="/settings/tab1" activeClassName="active"><Setting title="General" subTitle="Connection, Notifications, Features "></Setting></NavLink>
        <NavLink exact to="/settings/tab2" activeClassName="active"> <Setting title="Storage" subTitle="Manage local data"></Setting></NavLink>
        <NavLink exact to="/settings/tab3" activeClassName="active"> <Setting title="Themes" subTitle="Change the way the app looks"></Setting></NavLink>
        <NavLink exact to="/settings/tab4" activeClassName="active"> <Setting title="About" subTitle="Version, Developers"></Setting></NavLink>
    </div>
  );
}

export default SettingTitles;
