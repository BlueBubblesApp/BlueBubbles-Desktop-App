/* eslint-disable no-underscore-dangle */
import * as React from "react";
import { ipcRenderer } from "electron";
import { Redirect } from "react-router-dom";
import "./LoginView.css";

interface LoginViewState {
    loading: boolean;
    enteredServerAddress: string;
    enteredPassword: string;
    loginIsValid: boolean;
    syncProgress: number;
    redirect: string;
    loadingMessage: string;
    theme: string;
}

class LoginView extends React.Component<object, LoginViewState> {
    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            loading: false, // Used to show circle loader
            enteredServerAddress: "",
            enteredPassword: "",
            loginIsValid: false, // Used to show progress bar
            syncProgress: 0,
            redirect: null,
            loadingMessage: "Verifying server login...",
            theme: ""
        };
    }

    async componentDidMount() {
        this._isMounted = true;
        if (!this.state.redirect) {
            document.getElementById("TitleBarRight").classList.add("loginTitleBarRight");
        }

        // Add listener for updating the state
        ipcRenderer.on("setup-update", (_, args) => {
            if (args?.redirect) document.getElementById("TitleBarRight").classList.remove("loginTitleBarRight");

            if (this._isMounted) {
                this.setState(args);
            }
        });

        // Get the config, if we have a serverAddress and password, automatically
        // invoke the "submit" method
        const config = await ipcRenderer.invoke("get-config");
        if (this._isMounted) {
            this.setState({ theme: config.theme });
        }

        ipcRenderer.on("config-update", (_, args) => {
            if (this._isMounted) {
                this.setState({ theme: args.theme });
            }
        });

        if (config.serverAddress && config.passphrase) {
            const isConnected = await ipcRenderer.invoke("get-socket-status");
            if (this._isMounted) {
                this.setState({
                    enteredServerAddress: config.serverAddress,
                    enteredPassword: config.passphrase,
                    redirect: isConnected ? "/messaging" : null
                });
            }
        }

        ipcRenderer.on("focused", (_, args) => {
            try {
                // document.getElementById("TitleBarRight").classList.add("loginTitleBarRight");
                document.getElementsByClassName("LoginView")[0].classList.remove("LoginViewBlurred");
                document.getElementById("TitleBarRight").classList.remove("LoginViewBlurred");
            } catch {
                /* Nothing */
            }
            try {
                document.getElementById("loadingContainer").classList.remove("loadingContainerBlurred");
            } catch {
                /* Nothing */
            }
        });

        ipcRenderer.on("blurred", (_, args) => {
            try {
                // document.getElementById("TitleBarRight").classList.remove("loginTitleBarRight");
                document.getElementsByClassName("LoginView")[0].classList.add("LoginViewBlurred");
                document.getElementById("TitleBarRight").classList.add("LoginViewBlurred");
            } catch {
                /* Nothing */
            }
            try {
                document.getElementById("loadingContainer").classList.add("loadingContainerBlurred");
            } catch {
                /* Nothing */
            }
        });
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    handleServerChange = event => {
        if (this._isMounted) {
            this.setState({
                enteredServerAddress: event.target.value
            });
        }
    };

    handlePasswordChange = event => {
        if (this._isMounted) {
            this.setState({
                enteredPassword: event.target.value
            });
        }
    };

    handleSubmit = () => {
        try {
            if (this._isMounted) {
                this.setState({ loading: true });
            }

            // The server will handle setting the redirect and updating
            ipcRenderer.invoke("start-socket-setup", this.state);
        } catch (err) {
            if (this._isMounted) {
                this.setState({ loading: false });
            }
        }
    };

    reset = () => {
        if (this._isMounted) {
            this.setState({
                loading: false,
                loginIsValid: false,
                syncProgress: 0,
                redirect: null,
                loadingMessage: "Verifying server login..."
            });
        }
    };

    render() {
        if (this.state.redirect) {
            document.getElementById("TitleBarRight").classList.remove("loginTitleBarRight");
            return <Redirect to={this.state.redirect} />;
        }

        const setProgressPercent = {
            // Set progress % by setting width % of progressBarSpan
            width: `${this.state.syncProgress}%`
        };

        return (
            <div className="LoginView" data-theme={this.state.theme}>
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
                    </div>
                ) : (
                    <div id="loginContainer">
                        <h1>Connect to MacOS server</h1>
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
                        <p id="versionNumber">{window.require("electron").remote.app.getVersion()}</p>
                    </div>
                )}
            </div>
        );
    }
}

export default LoginView;
