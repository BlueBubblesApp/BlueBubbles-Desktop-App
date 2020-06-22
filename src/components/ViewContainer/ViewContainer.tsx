import React from 'react';
import './ViewContainer.css';
import MessagingView from './MessagingView/MessagingView';
import SettingsView from './SettingsView/SettingsView';

//First show TutorialView, then once done show MessagingView

//SettingsView can be accessed from MessagingView 


function ViewContainer() {
  return (
    <div className="ViewContainer">
        <MessagingView></MessagingView>
    </div>
  );
}

export default ViewContainer;
