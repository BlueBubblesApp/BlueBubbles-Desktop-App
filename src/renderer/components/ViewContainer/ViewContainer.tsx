/* eslint-disable react/prefer-stateless-function */
import * as React from "react";
import { BrowserRouter as Router, Route, HashRouter } from "react-router-dom";
import "./ViewContainer.css";
import { AnimatedSwitch } from "react-router-transition";
import MessagingView from "./MessagingView/MessagingView";
import SettingsView from "./SettingsView/SettingsView";
import LoginView from "./LoginView/LoginView";

class ViewContainer extends React.Component {
    render() {
        return (
            <div className="ViewContainer">
                <HashRouter>
                    <AnimatedSwitch
                        atEnter={{ opacity: 0.1 }}
                        atLeave={{ opacity: 0 }}
                        atActive={{ opacity: 1 }}
                        className="switch-wrapper"
                    >
                        <Route exact path="/" component={LoginView} />
                        <Route exact path="/messaging" component={MessagingView} />
                        <Route path="/settings" component={SettingsView} />
                    </AnimatedSwitch>
                </HashRouter>
            </div>
        );
    }
}

export default ViewContainer;
