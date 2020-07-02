import * as React from "react";
import { ipcRenderer } from "electron";

import "./MessagingView.css";
import LeftCol from "./LeftCol/LeftCol";
import RightCol from "./RightCol/RightCol";

interface MesagingViewState {
    doneLoading: boolean;
    loginIsValid: boolean;
    syncProgress: number;
    loadingMessage: string;
}

class MessagingView extends React.Component<object, MesagingViewState> {
    constructor(props) {
        super(props);

        this.state = {
            doneLoading: false, // Used to show loading screen
            loginIsValid: true, // Used to show progress bar
            syncProgress: 0,
            loadingMessage: "Fetching chats from iMessage Server..."
        };
    }

    componentDidMount() {
        if (!this.state.loginIsValid || !this.state.doneLoading) {
            document.getElementById("TitleBarRight").classList.remove("loginTitleBarRight");
            document.getElementById("TitleBarRight").classList.add("messagingTitleBarRight");
        }

        // Add listener for updating the state
        ipcRenderer.on("setup-update", (_, args) => {
            if (!args) return;
            if (args?.redirect) document.getElementById("TitleBarRight").classList.remove("messagingTitleBarRight");

            this.setState(args);
        });

        ipcRenderer.on("chat", (_, args) => {
            console.log(args);
        });
    }

    render() {
        const setProgressPercent = {
            // Set progress % by setting width % of progressBarSpan
            width: `${this.state.syncProgress}%`
        };

        return (
            <div className="MessagingView">
                {this.state.doneLoading ? (
                    <>
                        <LeftCol />
                        <RightCol />
                    </>
                ) : (
                    <div className="progressView">
                        <h1>{this.state.loadingMessage}</h1>
                        <div id="loader" />
                        <div id="progressBar">
                            <span style={setProgressPercent} id="progressBarSpan" />
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default MessagingView;
