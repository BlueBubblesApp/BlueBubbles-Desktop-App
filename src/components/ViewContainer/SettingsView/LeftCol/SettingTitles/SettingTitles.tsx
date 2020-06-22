import React from 'react';
import './SettingTitles.css';
import Setting from './Setting/Setting';
import {
  BrowserRouter as Router,
  Link
} from "react-router-dom";

//These need to be expanded

function SettingTitles() {
  return (
    <div className="SettingTitles">
        <Link to="/settings/tab1"><Setting title="General" subTitle="Connection, Notifications, Features "></Setting></Link>
        <Link to="/settings/tab2"> <Setting title="Storage" subTitle="Manage local data"></Setting></Link>
        <Link to="/settings/tab3"> <Setting title="Themes" subTitle="Change the way the app looks"></Setting></Link>
        <Link to="/settings/tab4"> <Setting title="About" subTitle="Version, Developers"></Setting></Link>
    </div>
  );
}

export default SettingTitles;
