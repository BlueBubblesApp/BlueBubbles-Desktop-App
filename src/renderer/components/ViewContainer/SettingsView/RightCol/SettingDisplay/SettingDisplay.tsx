import * as React from "react";
import "./SettingDisplay.css";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import Tab1 from "./Tab1/Tab1";
import Tab2 from "./Tab2/Tab2";
import Tab3 from "./Tab3/Tab3";
import Tab4 from "./Tab4/Tab4";

function SettingDisplay() {
    return (
        <div className="SettingDisplay">
            <Switch>
                <Route path="/settings/tab1" component={Tab1}>
                    <Tab1 />
                </Route>
                <Route path="/settings/tab2" component={Tab2}>
                    <Tab2 />
                </Route>
                <Route path="/settings/tab3" component={Tab3}>
                    <Tab3 />
                </Route>
                <Route path="/settings/tab4" component={Tab4}>
                    <Tab4 />
                </Route>
                <Tab1 />
            </Switch>
        </div>
    );
}

export default SettingDisplay;
