import * as React from "react";
import "./SettingDisplay.css";
import { BrowserRouter as Router, Switch, Route, Redirect, Link } from "react-router-dom";
import GeneralTab from "./GeneralTab/GeneralTab";
import StorageTab from "./StorageTab/StorageTab";
import AppearanceTab from "./AppearanceTab/AppearanceTab";
import AboutTab from "./AboutTab/AboutTab";
import ContactsTab from "./ContactsTab/ContactsTab";

function SettingDisplay() {
    return (
        <div className="SettingDisplay">
            <Switch>
                <Route path="/settings/generaltab" component={GeneralTab} />
                <Route path="/settings/contactstab" component={ContactsTab} />
                <Route path="/settings/storagetab" component={StorageTab} />
                <Route path="/settings/appearancetab" component={AppearanceTab} />
                <Route path="/settings/abouttab" component={AboutTab} />
                <Redirect to="/settings/generaltab" />
            </Switch>
        </div>
    );
}

export default SettingDisplay;
