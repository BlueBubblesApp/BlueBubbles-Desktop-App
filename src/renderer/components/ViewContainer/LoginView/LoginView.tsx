import * as React from "react";
import { ipcRenderer } from "electron";
import { Redirect, NavLink } from "react-router-dom";

import "./LoginView.css";
import { matchPath } from "react-router";
import MessagingView from "../MessagingView/MessagingView";

interface LoginViewState {
    loading: boolean;
    enteredServerAddress: string;
    enteredPassword: string;
    loginIsValid: boolean;
    syncProgress: number;
    redirect: string;
    loadingMessage: string;
}

class LoginView extends React.Component<object, LoginViewState> {
    constructor(props) {
        super(props);

        this.state = {
            loading: false, // Used to show circle loader
            enteredServerAddress: "",
            enteredPassword: "",
            loginIsValid: false, // Used to show progress bar
            syncProgress: 0,
            redirect: null,
            loadingMessage: "Verifying server login..."
        };
    }

    async componentDidMount() {
        document.getElementById("TitleBarRight").classList.add("loginTitleBarRight");

        // Add listener for updating the state
        ipcRenderer.on("setup-update", (_, args) => {
            if (args?.redirect) document.getElementById("TitleBarRight").classList.remove("messagingTitleBarRight");

            this.setState(args);
        });

        // Get the config, if we have a serverAddress and password, automatically
        // invoke the "submit" method
        const config = await ipcRenderer.invoke("get-config");
        if (config.serverAddress && config.passphrase) {
            this.setState({
                enteredServerAddress: config.serverAddress,
                enteredPassword: config.passphrase
            });
        }
    }

    handleServerChange = event => {
        this.setState({
            enteredServerAddress: event.target.value
        });
    };

    handlePasswordChange = event => {
        this.setState({
            enteredPassword: event.target.value
        });
    };

    handleSubmit = () => {
        try {
            this.setState({ loading: true });

            // The server will handle setting the redirect and updating
            ipcRenderer.invoke("start-socket-setup", this.state);
        } catch (err) {
            this.setState({ loading: false });
        }
    };

    reset = () => {
        this.setState({
            loading: false,
            loginIsValid: false,
            syncProgress: 0,
            redirect: null,
            loadingMessage: "Verifying server login..."
        });
    };

    handleInputChange = event => {
        this.setState({
            enteredServerAddress: event.target.value
        });
    };

    render() {
        if (this.state.redirect) {
            return <Redirect to={this.state.redirect} />;
        }

        const setProgressPercent = {
            // Set progress % by setting width % of progressBarSpan
            width: `${this.state.syncProgress}%`
        };

        return (
            <div className="LoginView">
                {this.state.loading ? (
                    <div id="loadingContainer">
                        <h1>{this.state.loadingMessage}</h1>
                        <div id="loader" />
                        {this.state.loginIsValid ? (
                            <div id="progressBar">
                                <span style={setProgressPercent} id="progressBarSpan" />
                            </div>
                        ) : (
                            <></>
                        )}
                        <NavLink id="skipToMessaging" to="/messaging">
                            Skip to Downloading
                        </NavLink>
                    </div>
                ) : (
                    <div id="loginContainer">
                        <h1>Connect to iMessage server</h1>
                        <form id="loginForm" onSubmit={this.handleSubmit}>
                            <input
                                type="url"
                                name="enteredServerAddress"
                                value={this.state.enteredServerAddress}
                                onChange={this.handleServerChange}
                                placeholder="Server URL"
                            />
                            <input
                                type="password"
                                name="enteredPassword"
                                value={this.state.enteredPassword}
                                onChange={this.handlePasswordChange}
                                placeholder="Password"
                            />
                            <button>Connect</button>
                        </form>
                        <p id="versionNumber">v0.0.1</p>
                    </div>
                )}
            </div>
        );
    }
}

export default LoginView;
