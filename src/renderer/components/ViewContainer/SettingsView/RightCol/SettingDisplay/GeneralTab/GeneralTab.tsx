/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable react/prefer-stateless-function */
import * as React from "react";
import "./GeneralTab.css";
import ServerInputTitle from "./ServerInputTitle/ServerInputTitle";
import PasswordInputTitle from "./PasswordInputTitle/PasswordInputTitle";
import NotificationsTitle from "./NotificationsTitle/NotificationsTitle";
import AppTitle from "./AppTitle/AppTitle";

interface State {}

class GeneralTab extends React.Component {
    render() {
        return (
            <div id="GeneralTab">
                <div id="GeneralTitle">
                    <h1>General</h1>
                </div>
                <ServerInputTitle title="Remote Server URL" />
                <PasswordInputTitle title="Remote Server Password" />
                <NotificationsTitle title="Notifications" />
                <AppTitle title="App" />
            </div>
        );
    }
}

export default GeneralTab;
