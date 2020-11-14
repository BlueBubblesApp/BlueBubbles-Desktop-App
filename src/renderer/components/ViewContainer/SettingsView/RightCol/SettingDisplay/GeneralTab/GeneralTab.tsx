/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable react/prefer-stateless-function */
import * as React from "react";
import "./GeneralTab.css";
import ServerInputTitle from "./ServerInputTitle/ServerInputTitle";
import PasswordInputTitle from "./PasswordInputTitle/PasswordInputTitle";
import NotificationsTitle from "./NotificationsTitle/NotificationsTitle";
import AppTitle from "./AppTitle/AppTitle";
import TitlebarTitle from "./TitlebarTitle/TitlebarTitle";
import VisualTitle from "./VisualTitle/VisualTitle";

interface State {}

class GeneralTab extends React.Component {
    render() {
        return (
            <div id="GeneralTab">
                <div id="GeneralTitle" className="RightTitle-Set">
                    <h1>General</h1>
                </div>
                <ServerInputTitle title="Remote Server URL" />
                <PasswordInputTitle title="Remote Server Password" />
                <NotificationsTitle title="Notifications" />
                <AppTitle title="App" />
                <VisualTitle title="Visual" />
                <TitlebarTitle title="Titlebar" />
            </div>
        );
    }
}

export default GeneralTab;
