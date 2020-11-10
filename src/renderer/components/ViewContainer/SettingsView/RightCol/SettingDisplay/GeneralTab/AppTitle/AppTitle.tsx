/* eslint-disable max-len */
/* eslint-disable react/no-unused-state */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/prefer-stateless-function */
import * as React from "react";
import "./AppTitle.css";
import { ipcRenderer } from "electron";

type Props = {
    title: string;
};

type State = {
    closeToTray: boolean;
    startWithOS: boolean;
    sendAudio: boolean;
    capitalizeFirstLetter: boolean;
    gradientMessages: boolean;
    colorfulContacts: boolean;
};

class AppTitle extends React.Component<Props, State> {
    constructor(props) {
        super(props);

        this.state = {
            closeToTray: false,
            startWithOS: false,
            sendAudio: false,
            capitalizeFirstLetter: false,
            gradientMessages: false,
            colorfulContacts: false
        };
    }

    async componentDidMount() {
        const config = await ipcRenderer.invoke("get-config");
        this.setState({
            closeToTray: config.closeToTray,
            startWithOS: config.startWithOS,
            sendAudio: config.sendAudio,
            capitalizeFirstLetter: config.capitalizeFirstLetter,
            gradientMessages: config.gradientMessages,
            colorfulContacts: config.colorfulContacts
        });

        console.log(config);
    }

    async handleChangeCloseToTray() {
        if (this.state.closeToTray) {
            await ipcRenderer.invoke("destroy-tray");
        }

        const newConfig = { closeToTray: !this.state.closeToTray };
        await ipcRenderer.invoke("set-config", newConfig);
        this.setState({ closeToTray: !this.state.closeToTray });
    }

    async handleChangeStartWithOS() {
        const newConfig = { startWithOS: !this.state.startWithOS };
        await ipcRenderer.invoke("set-config", newConfig);
        this.setState({ startWithOS: !this.state.startWithOS });
        await ipcRenderer.invoke("set-start-with-os", this.state.startWithOS);
    }

    async handleChangeSendAudio() {
        const newConfig = { sendAudio: !this.state.sendAudio };
        await ipcRenderer.invoke("set-config", newConfig);
        this.setState({ sendAudio: !this.state.sendAudio });
    }

    async handleChangeCapitalizeFirstLetter() {
        const newConfig = { capitalizeFirstLetter: !this.state.capitalizeFirstLetter };
        await ipcRenderer.invoke("set-config", newConfig);
        this.setState({ capitalizeFirstLetter: !this.state.capitalizeFirstLetter });
    }

    async handleGradientMessages() {
        const newConfig = { gradientMessages: !this.state.gradientMessages };
        await ipcRenderer.invoke("set-config", newConfig);
        this.setState({ gradientMessages: !this.state.gradientMessages });
    }

    async handleColorfulContacts() {
        const newConfig = { colorfulContacts: !this.state.colorfulContacts };
        await ipcRenderer.invoke("set-config", newConfig);
        this.setState({ colorfulContacts: !this.state.colorfulContacts });
    }

    render() {
        return (
            <div className="AppTitle">
                <h2>{this.props.title}</h2>
                <div>
                    <p>Close To Tray</p>
                    <label className="form-switch" onClick={() => this.handleChangeCloseToTray()}>
                        <input
                            id="closeToTrayCheckbox"
                            type="checkbox"
                            checked={this.state.closeToTray}
                            onChange={() => this.handleChangeCloseToTray()}
                        />
                        <i />
                    </label>
                </div>
                <div>
                    <p>Start With OS</p>
                    <label className="form-switch" onClick={() => this.handleChangeStartWithOS()}>
                        <input
                            id="startWithOSCheckbox"
                            type="checkbox"
                            checked={this.state.startWithOS}
                            onChange={() => this.handleChangeStartWithOS()}
                        />
                        <i />
                    </label>
                </div>
                <div>
                    <p>Message Send Audio</p>
                    <label className="form-switch" onClick={() => this.handleChangeSendAudio()}>
                        <input
                            id="sendAudioCheckbox"
                            type="checkbox"
                            checked={this.state.sendAudio}
                            onChange={() => this.handleChangeSendAudio()}
                        />
                        <i />
                    </label>
                </div>
                <div>
                    <p>Auto Capitalize First Letter</p>
                    <label className="form-switch" onClick={() => this.handleChangeCapitalizeFirstLetter()}>
                        <input
                            type="checkbox"
                            checked={this.state.capitalizeFirstLetter}
                            onChange={() => this.handleChangeCapitalizeFirstLetter()}
                        />
                        <i />
                    </label>
                </div>
                <div>
                    <p>Scrolling Gradient On Messages</p>
                    <label className="form-switch" onClick={() => this.handleGradientMessages()}>
                        <input
                            type="checkbox"
                            checked={this.state.gradientMessages}
                            onChange={() => this.handleGradientMessages()}
                        />
                        <i />
                    </label>
                </div>
                <div>
                    <p>Colorful Contacts</p>
                    <label className="form-switch" onClick={() => this.handleColorfulContacts()}>
                        <input
                            type="checkbox"
                            checked={this.state.colorfulContacts}
                            onChange={() => this.handleColorfulContacts()}
                        />
                        <i />
                    </label>
                </div>
            </div>
        );
    }
}

export default AppTitle;
