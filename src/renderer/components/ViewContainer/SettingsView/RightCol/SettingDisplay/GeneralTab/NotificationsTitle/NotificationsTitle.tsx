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
            globalNotificationsMuted: false,
            globalNotificationsDisabled: false
        };
    }

    async componentDidMount() {
        const config = await ipcRenderer.invoke("get-config");
        this.setState({
            globalNotificationsMuted: config.globalNotificationsMuted,
            globalNotificationsDisabled: config.globalNotificationsDisabled
        });

        console.log(config);
    }

    async handleChangeMute() {
        const newConfig = { globalNotificationsMuted: !this.state.globalNotificationsMuted };
        await ipcRenderer.invoke("set-config", newConfig);
        this.setState({ globalNotificationsMuted: !this.state.globalNotificationsMuted });
        console.log(newConfig);
        console.log("Mute Changed");
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
                    <label className="form-switch" onClick={() => this.handleChangeMute()}>
                        <input
                            checked={this.state.globalNotificationsMuted}
                            id="globalMuteCheckbox"
                            type="checkbox"
                            onChange={() => this.handleChangeMute()}
                        />
                        <i />
                    </label>
                </div>
                <div>
                    <p>Disabled</p>
                    <label className="form-switch" onClick={() => this.handleChangeDisabled()}>
                        <input
                            checked={this.state.globalNotificationsDisabled}
                            id="globalDisableCheckbox"
                            type="checkbox"
                            onChange={() => this.handleChangeDisabled()}
                        />
                        <i />
                    </label>
                </div>
            </div>
        );
    }
}

export default NotificationsTitle;
