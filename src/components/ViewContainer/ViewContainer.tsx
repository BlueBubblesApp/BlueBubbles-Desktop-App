import React from 'react';
import './ViewContainer.css';
import MessagingView from './MessagingView/MessagingView';
import SettingsView from './SettingsView/SettingsView';
import { BrowserRouter as Router, Route } from "react-router-dom";
const {AnimatedSwitch } = require('react-router-transition');

//First show TutorialView, then once done show MessagingView

//SettingsView can be accessed from MessagingView 


function ViewContainer() {
  return (
    <div className="ViewContainer">
      <Router>
        <AnimatedSwitch 
      atEnter={{ opacity: 0.1 }}
      atLeave={{ opacity: 0 }}
      atActive={{ opacity: 1 }}
      className='switch-wrapper'>
          <Route exact path="/" component={MessagingView}>
            <MessagingView />
          </Route>
          <Route path="/settings" component={SettingsView}>
            <SettingsView />
          </Route>
        </AnimatedSwitch>
        </Router>
    </div>
  );
}

export default ViewContainer;
