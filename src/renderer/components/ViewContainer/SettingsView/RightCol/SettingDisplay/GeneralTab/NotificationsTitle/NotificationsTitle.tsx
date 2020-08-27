/* eslint-disable max-len */
/* eslint-disable react/no-unused-state */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/prefer-stateless-function */
import * as React from "react";
import "./NotificationsTitle.css";
import { ipcRenderer } from "electron";

type Props = {
    title: string;
};

type State = {
    globalNotificationsMuted: boolean;
    globalNotificationsDisabled: boolean;
};

class NotificationsTitle extends React.Component<Props, State> {
    constructor(props) {
        super(props);

        this.state = {
            globalNotificationsMuted: null,
            globalNotificationsDisabled: null
        };
    }

    async componentDidMount() {
        const config = await ipcRenderer.invoke("get-config");
        this.setState({
            globalNotificationsMuted: config.globalNotificationsMuted,
            globalNotificationsDisabled: config.globalNotificationsDisabled
        });

        console.log(config);

        const checkBoxMuted: HTMLInputElement = document.getElementById("globalMuteCheckbox") as HTMLInputElement;
        const checkBoxDisabled: HTMLInputElement = document.getElementById("globalDisableCheckbox") as HTMLInputElement;

        if (this.state.globalNotificationsMuted) {
            checkBoxMuted.checked = true;
        } else {
            checkBoxMuted.checked = false;
        }

        if (this.state.globalNotificationsDisabled) {
            checkBoxDisabled.checked = true;
        } else {
            checkBoxDisabled.checked = false;
        }
    }

    async handleChangeMute() {
        const newConfig = { globalNotificationsMuted: !this.state.globalNotificationsMuted };
        await ipcRenderer.invoke("set-config", newConfig);
        this.setState({ globalNotificationsMuted: !this.state.globalNotificationsMuted });
    }

    async handleChangeDisabled() {
        const newConfig = { globalNotificationsDisabled: !this.state.globalNotificationsDisabled };
        await ipcRenderer.invoke("set-config", newConfig);
        this.setState({ globalNotificationsDisabled: !this.state.globalNotificationsDisabled });
    }

    render() {
        return (
            <div className="NotificationsTitle">
                <h2>{this.props.title}</h2>
                <div>
                    <p>Muted</p>
                    <label className="form-switch">
                        <input id="globalMuteCheckbox" type="checkbox" onClick={() => this.handleChangeMute()} />
                        <i />
                    </label>
                </div>
                <div>
                    <p>Disabled</p>
                    <label className="form-switch">
                        <input id="globalDisableCheckbox" type="checkbox" onClick={() => this.handleChangeDisabled()} />
                        <i />
                    </label>
                </div>
            </div>
        );
    }
}

export default NotificationsTitle;
