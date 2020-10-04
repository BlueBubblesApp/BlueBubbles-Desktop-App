/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
import * as React from "react";
import { ipcRenderer } from "electron";
import { Redirect } from "react-router-dom";
import "./LoginView.css";

const { dialog } = require("electron").remote;

interface LoginViewState {
    loading: boolean;
    enteredServerAddress: string;
    enteredPassword: string;
    loginIsValid: boolean;
    syncProgress: number;
    redirect: string;
    loadingMessage: string;
    theme: string;
    scanQRTooltipOpen: boolean;
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
            theme: "",
            scanQRTooltipOpen: false
        };
    }

    async componentDidMount() {
        this._isMounted = true;
        if (!this.state.redirect) {
            document.getElementById("TitleBarRight").classList.add("loginTitleBarRight");
        }

        // Add listener for updating the state
        ipcRenderer.on("setup-update", (_, args) => {
            if (args.redirect) document.getElementById("TitleBarRight").classList.remove("loginTitleBarRight");

            console.log(args);
            if (this._isMounted) {
                this.setState(args);
            }
        });

        // Get the config, if we have a serverAddress and password, automatically
        // invoke the "submit" method
        const config = await ipcRenderer.invoke("get-config");

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

    handleSubmit = async () => {
        try {
            if (this._isMounted) {
                this.setState({ loading: true });
            }

            // The server will handle setting the redirect and updating
            const x = await ipcRenderer.invoke("start-socket-setup", this.state);
            console.log(x);
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

    readFromClipboard = async () => {
        const clipboardReturn = await ipcRenderer.invoke("read-data-from-clipboard");
        console.log(clipboardReturn);

        this.setState({
            enteredServerAddress: clipboardReturn.serverAddress,
            enteredPassword: clipboardReturn.passphrase,
            loading: true
        });
        const x = await ipcRenderer.invoke("start-socket-setup", this.state);
        console.log(x);
    };

    readFromLocalImage = async () => {
        const dialogReturn = await dialog.showOpenDialog({
            properties: ["openFile"],
            filters: [{ name: "Images", extensions: ["jpg", "jpeg", "png", "svg", "tiff"] }]
        });

        if (dialogReturn.filePaths.length === 1) {
            this.setState({ loading: true });
            const localImageReturn = await ipcRenderer.invoke("read-data-from-local-image", dialogReturn.filePaths[0]);
            console.log(localImageReturn);

            if (localImageReturn === "No QR Code Found") {
                this.setState({ loading: false });
                return;
            }

            this.setState({
                enteredServerAddress: localImageReturn.serverAddress,
                enteredPassword: localImageReturn.passphrase
            });
            const x = await ipcRenderer.invoke("start-socket-setup", this.state);
            console.log(x);
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
            <div className="LoginView">
                {this.state.loading ? (
                    <div id="loadingContainer">
                        <h1>{this.state.loadingMessage}</h1>
                        <div id="loader" />
                        {this.state.loginIsValid || this.state.loadingMessage === "Verifying server login..." ? (
                            <div id="progressBar">
                                <span style={setProgressPercent} id="progressBarSpan" />
                            </div>
                        ) : (
                            <>
                                <button id="returnToLoginButton" onClick={() => this.reset()}>
                                    Return to login
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <div id="loginContainer">
                        <h1>Connect to MacOS server</h1>
                        <div id="loginForm">
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
                            <div>
                                <button onClick={this.handleSubmit}>Connect</button>
                                <svg
                                    id="scanQrImage"
                                    viewBox="0 0 512 512"
                                    onMouseEnter={() => this.setState({ scanQRTooltipOpen: true })}
                                    onMouseLeave={() => this.setState({ scanQRTooltipOpen: false })}
                                >
                                    <g>
                                        <path d="m496 144c-8.837 0-16-7.164-16-16v-82c0-7.72-6.28-14-14-14h-82c-8.837 0-16-7.164-16-16s7.163-16 16-16h82c25.364 0 46 20.636 46 46v82c0 8.836-7.163 16-16 16z" />
                                        <path d="m16 144c-8.837 0-16-7.164-16-16v-82c0-25.364 20.636-46 46-46h82c8.837 0 16 7.164 16 16s-7.163 16-16 16h-82c-7.72 0-14 6.28-14 14v82c0 8.836-7.163 16-16 16z" />
                                        <path d="m128 512h-82c-25.364 0-46-20.636-46-46v-82c0-8.836 7.163-16 16-16s16 7.164 16 16v82c0 7.72 6.28 14 14 14h82c8.837 0 16 7.164 16 16s-7.163 16-16 16z" />
                                        <path d="m466 512h-82c-8.837 0-16-7.164-16-16s7.163-16 16-16h82c7.72 0 14-6.28 14-14v-82c0-8.836 7.163-16 16-16s16 7.164 16 16v82c0 25.364-20.636 46-46 46z" />
                                        <path d="m194 240h-84c-25.364 0-46-20.636-46-46v-84c0-25.364 20.636-46 46-46h84c25.364 0 46 20.636 46 46v84c0 25.364-20.636 46-46 46zm-84-144c-7.72 0-14 6.28-14 14v84c0 7.72 6.28 14 14 14h84c7.72 0 14-6.28 14-14v-84c0-7.72-6.28-14-14-14z" />
                                        <path d="m194 448h-84c-25.364 0-46-20.636-46-46v-84c0-25.364 20.636-46 46-46h84c25.364 0 46 20.636 46 46v84c0 25.364-20.636 46-46 46zm-84-144c-7.72 0-14 6.28-14 14v84c0 7.72 6.28 14 14 14h84c7.72 0 14-6.28 14-14v-84c0-7.72-6.28-14-14-14z" />
                                        <path d="m402 240h-84c-25.364 0-46-20.636-46-46v-84c0-25.364 20.636-46 46-46h84c25.364 0 46 20.636 46 46v84c0 25.364-20.636 46-46 46zm-84-144c-7.72 0-14 6.28-14 14v84c0 7.72 6.28 14 14 14h84c7.72 0 14-6.28 14-14v-84c0-7.72-6.28-14-14-14z" />
                                        <path d="m422 352h-38v-54c0-14.336-11.663-26-26-26h-60c-14.337 0-26 11.664-26 26v60c0 14.336 11.663 26 26 26h54v38c0 14.336 11.663 26 26 26h44c14.337 0 26-11.664 26-26v-44c0-14.336-11.663-26-26-26zm-118-48h48v48h-48zm112 112h-32v-32h32z" />
                                        <path d="m160 176h-16c-8.837 0-16-7.164-16-16v-16c0-8.836 7.163-16 16-16h16c8.837 0 16 7.164 16 16v16c0 8.836-7.163 16-16 16z" />
                                        <path d="m368 176h-16c-8.837 0-16-7.164-16-16v-16c0-8.836 7.163-16 16-16h16c8.837 0 16 7.164 16 16v16c0 8.836-7.163 16-16 16z" />
                                        <path d="m160 384h-16c-8.837 0-16-7.164-16-16v-16c0-8.836 7.163-16 16-16h16c8.837 0 16 7.164 16 16v16c0 8.836-7.163 16-16 16z" />
                                    </g>
                                </svg>
                                {this.state.scanQRTooltipOpen ? (
                                    <div
                                        id="scanQRTooltip"
                                        onMouseEnter={() => this.setState({ scanQRTooltipOpen: true })}
                                        onMouseLeave={() => this.setState({ scanQRTooltipOpen: false })}
                                    >
                                        <div>
                                            <p onClick={() => this.readFromLocalImage()}>From Local File</p>
                                            <svg id="localFileIcon" viewBox="0 0 508.231 508.231">
                                                <g>
                                                    <path d="m112.544 508.231c-26.426.002-52.763-10.646-71.967-31.631-17.583-19.212-26.631-44.121-25.479-70.14 1.152-26.018 12.367-50.029 31.58-67.611l260.04-237.981c11.822-10.82 27.157-16.394 43.162-15.679 16.012.709 30.788 7.611 41.607 19.434 10.82 11.823 16.389 27.151 15.68 43.162s-7.61 30.788-19.434 41.607l-232.376 212.664-20.254-22.131 232.377-212.663c5.911-5.41 9.362-12.798 9.717-20.804s-2.43-15.67-7.84-21.582-12.798-9.362-20.804-9.717c-8.016-.357-15.67 2.43-21.581 7.839l-260.039 237.982c-13.302 12.173-21.065 28.796-21.863 46.809-.798 18.012 5.466 35.257 17.639 48.558 12.172 13.301 28.796 21.065 46.808 21.863 18.01.799 35.258-5.467 48.558-17.639l271.105-248.109c20.69-18.935 32.768-44.794 34.009-72.813s-8.503-54.844-27.438-75.534-44.794-32.769-72.813-34.01c-28.023-1.239-54.845 8.503-75.534 27.438l-243.442 222.792-20.254-22.131 243.442-222.791c26.603-24.345 61.097-36.87 97.115-35.278 36.024 1.596 69.272 17.125 93.616 43.726 50.256 54.915 46.466 140.477-8.448 190.732l-271.106 248.108c-18.676 17.091-42.265 25.528-65.783 25.53z" />
                                                </g>
                                            </svg>
                                        </div>
                                        <div>
                                            <p onClick={this.readFromClipboard}>From Clipboard</p>
                                            <svg id="clipboardIcon" viewBox="0 0 24 24">
                                                <path d="m15.5 24h-13c-1.379 0-2.5-1.122-2.5-2.5v-16c0-1.378 1.121-2.5 2.5-2.5h2c.276 0 .5.224.5.5s-.224.5-.5.5h-2c-.827 0-1.5.673-1.5 1.5v16c0 .827.673 1.5 1.5 1.5h13c.827 0 1.5-.673 1.5-1.5v-16c0-.827-.673-1.5-1.5-1.5h-2c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h2c1.379 0 2.5 1.122 2.5 2.5v16c0 1.378-1.121 2.5-2.5 2.5z" />
                                                <path d="m12.5 6h-7c-.827 0-1.5-.673-1.5-1.5v-2c0-.276.224-.5.5-.5h2.05c.232-1.14 1.243-2 2.45-2s2.218.86 2.45 2h2.05c.276 0 .5.224.5.5v2c0 .827-.673 1.5-1.5 1.5zm-7.5-3v1.5c0 .276.225.5.5.5h7c.275 0 .5-.224.5-.5v-1.5h-2c-.276 0-.5-.224-.5-.5 0-.827-.673-1.5-1.5-1.5s-1.5.673-1.5 1.5c0 .276-.224.5-.5.5z" />
                                                <path d="m22 21c-.189 0-.362-.107-.447-.276l-1.289-2.578c-.173-.346-.264-.732-.264-1.118v-9.028c0-1.103.897-2 2-2s2 .897 2 2v9.028c0 .386-.091.772-.264 1.118l-1.289 2.578c-.085.169-.258.276-.447.276zm0-14c-.552 0-1 .449-1 1v9.028c0 .231.055.464.158.671l.842 1.683.842-1.683c.103-.207.158-.44.158-.671v-9.028c0-.551-.448-1-1-1zm1.289 10.922h.01z" />
                                                <path d="m14.5 10h-11c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h11c.276 0 .5.224.5.5s-.224.5-.5.5z" />
                                                <path d="m14.5 13h-11c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h11c.276 0 .5.224.5.5s-.224.5-.5.5z" />
                                                <path d="m14.5 16h-11c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h11c.276 0 .5.224.5.5s-.224.5-.5.5z" />
                                                <path d="m14.5 19h-11c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h11c.276 0 .5.224.5.5s-.224.5-.5.5z" />
                                            </svg>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                        <p id="versionNumber">{window.require("electron").remote.app.getVersion()}</p>
                    </div>
                )}
            </div>
        );
    }
}

export default LoginView;
