import * as React from "react";
import "./SettingDisplay.css";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import GeneralTab from "./GeneralTab/GeneralTab";
import StorageTab from "./StorageTab/StorageTab";
import AppearanceTab from "./AppearanceTab/AppearanceTab";
import AboutTab from "./AboutTab/AboutTab";

function SettingDisplay() {
    return (
        <div className="SettingDisplay">
            <Switch>
                <Route path="/settings/generaltab" component={GeneralTab}>
                    <GeneralTab />
                </Route>
                <Route path="/settings/storagetab" component={StorageTab}>
                    <StorageTab />
                </Route>
                <Route path="/settings/appearancetab" component={AppearanceTab}>
                    <AppearanceTab />
                </Route>
                <Route path="/settings/abouttab" component={AboutTab}>
                    <AboutTab />
                </Route>
                <GeneralTab />
            </Switch>
        </div>
    );
}

export default SettingDisplay;
