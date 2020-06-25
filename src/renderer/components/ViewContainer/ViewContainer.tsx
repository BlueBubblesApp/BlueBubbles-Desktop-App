import * as React from 'react';
import { BrowserRouter as Router, Route, HashRouter } from 'react-router-dom';
import './ViewContainer.css';
import MessagingView from './MessagingView/MessagingView';
import SettingsView from './SettingsView/SettingsView';

const { AnimatedSwitch } = require('react-router-transition');

function ViewContainer() {
    return (
        <div className="ViewContainer">
            <HashRouter>
                <AnimatedSwitch
                    atEnter={{ opacity: 0.1 }}
                    atLeave={{ opacity: 0 }}
                    atActive={{ opacity: 1 }}
                    className="switch-wrapper"
                >
                    <Route exact path="/" component={MessagingView}>
                        <MessagingView />
                    </Route>
                    <Route path="/settings" component={SettingsView}>
                        <SettingsView />
                    </Route>
                </AnimatedSwitch>
            </HashRouter>
        </div>
    );
}

export default ViewContainer;
