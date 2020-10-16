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
};

class AppTitle extends React.Component<Props, State> {
    constructor(props) {
        super(props);

        this.state = {
            closeToTray: null,
            startWithOS: null
        };
    }

    async componentDidMount() {
        const config = await ipcRenderer.invoke("get-config");
        this.setState({
            closeToTray: config.closeToTray,
            startWithOS: config.startWithOS
        });

        console.log(config);

        const closeToTrayCheckbox: HTMLInputElement = document.getElementById(
            "closeToTrayCheckbox"
        ) as HTMLInputElement;
        const startWithOSCheckbox: HTMLInputElement = document.getElementById(
            "startWithOSCheckbox"
        ) as HTMLInputElement;

        if (this.state.closeToTray) {
            closeToTrayCheckbox.checked = true;
        } else {
            closeToTrayCheckbox.checked = false;
        }

        if (this.state.startWithOS) {
            startWithOSCheckbox.checked = true;
        } else {
            startWithOSCheckbox.checked = false;
        }
    }

    async handleChangeCloseToTray() {
        if (this.state.closeToTray) {
            await ipcRenderer.invoke("destroy-tray");
        }

        const newConfig = { closeToTray: !this.state.closeToTray };
        await ipcRenderer.invoke("set-config", newConfig);
        this.setState({ closeToTray: !this.state.closeToTray });

        const closeToTrayCheckbox: HTMLInputElement = document.getElementById(
            "closeToTrayCheckbox"
        ) as HTMLInputElement;
        closeToTrayCheckbox.checked = this.state.closeToTray;
    }

    async handleChangeStartWithOS() {
        const newConfig = { startWithOS: !this.state.startWithOS };
        await ipcRenderer.invoke("set-config", newConfig);
        this.setState({ startWithOS: !this.state.startWithOS });
        await ipcRenderer.invoke("set-start-with-os", this.state.startWithOS);

        const startWithOSCheckbox: HTMLInputElement = document.getElementById(
            "startWithOSCheckbox"
        ) as HTMLInputElement;
        console.log(this.state.startWithOS);
        startWithOSCheckbox.checked = this.state.startWithOS;
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
                            onClick={() => this.handleChangeStartWithOS()}
                        />
                        <i />
                    </label>
                </div>
            </div>
        );
    }
}

export default AppTitle;
