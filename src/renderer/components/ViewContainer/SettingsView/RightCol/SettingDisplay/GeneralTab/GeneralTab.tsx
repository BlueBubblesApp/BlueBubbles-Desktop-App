/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable react/prefer-stateless-function */
import * as React from "react";
import "./GeneralTab.css";
import { ipcRenderer } from "electron";
import ServerInputTitle from "./ServerInputTitle/ServerInputTitle";
import PasswordInputTitle from "./PasswordInputTitle/PasswordInputTitle";
import NotificationsTitle from "./NotificationsTitle/NotificationsTitle";
import AppTitle from "./AppTitle/AppTitle";
import TitlebarTitle from "./TitlebarTitle/TitlebarTitle";
import VisualTitle from "./VisualTitle/VisualTitle";

interface State {
    showConfirmReset: boolean;
}

class GeneralTab extends React.Component<unknown, State> {
    constructor(props) {
        super(props);

        this.state = {
            showConfirmReset: false
        };
    }

    // eslint-disable-next-line class-methods-use-this
    async resetUserData() {
        await ipcRenderer.invoke("reset-user-data");
    }

    render() {
        return (
            <div id="GeneralTab">
                {this.state.showConfirmReset ? (
                    <div id="confirmResetContainer">
                        <p>
                            Are you sure you want to delete your user data? This will close the app and require you to
                            re-enter your server details, as well as re-sync all your chats.
                        </p>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-around",
                                marginBottom: "10px",
                                width: "85%"
                            }}
                        >
                            <button id="cancelResetButton" onClick={() => this.setState({ showConfirmReset: false })}>
                                Cancel
                            </button>
                            <button id="confirmResetButton" onClick={() => this.resetUserData()}>
                                Confirm
                            </button>
                        </div>
                    </div>
                ) : null}
                <div id="GeneralTitle" className="RightTitle-Set">
                    <h1>General</h1>
                </div>
                <ServerInputTitle title="Remote Server URL" />
                <PasswordInputTitle title="Remote Server Password" />
                <NotificationsTitle title="Notifications" />
                <AppTitle title="App" />
                <VisualTitle title="Visual" />
                <TitlebarTitle title="Titlebar" />
                <div
                    style={{
                        display: "flex",
                        margin: "60px 35px 20px 35px",
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                >
                    <button id="hardResetButton" onClick={() => this.setState({ showConfirmReset: true })}>
                        Hard Reset
                    </button>
                </div>
            </div>
        );
    }
}

export default GeneralTab;
