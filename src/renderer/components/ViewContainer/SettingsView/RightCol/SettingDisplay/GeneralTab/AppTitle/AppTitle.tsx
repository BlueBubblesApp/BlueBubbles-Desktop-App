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
};

class AppTitle extends React.Component<Props, State> {
    constructor(props) {
        super(props);

        this.state = {
            closeToTray: null,
            startWithOS: null,
            sendAudio: null
        };
    }

    async componentDidMount() {
        const config = await ipcRenderer.invoke("get-config");
        this.setState({
            closeToTray: config.closeToTray,
            startWithOS: config.startWithOS,
            sendAudio: config.sendAudio
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

    render() {
        return (
            <div className="AppTitle">
                <h2>{this.props.title}</h2>
                <div>
                    <p>Close To Tray</p>
                    <label className="form-switch">
                        <input
                            id="closeToTrayCheckbox"
                            type="checkbox"
                            checked={this.state.closeToTray}
                            onClick={() => this.handleChangeCloseToTray()}
                        />
                        <i />
                    </label>
                </div>
                <div>
                    <p>Start With OS</p>
                    <label className="form-switch">
                        <input
                            id="startWithOSCheckbox"
                            type="checkbox"
                            checked={this.state.startWithOS}
                            onClick={() => this.handleChangeStartWithOS()}
                        />
                        <i />
                    </label>
                </div>
                <div>
                    <p>Message Send Audio</p>
                    <label className="form-switch">
                        <input
                            id="sendAudioCheckbox"
                            type="checkbox"
                            checked={this.state.sendAudio}
                            onClick={() => this.handleChangeSendAudio()}
                        />
                        <i />
                    </label>
                </div>
            </div>
        );
    }
}

export default AppTitle;
