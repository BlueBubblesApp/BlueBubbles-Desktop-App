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
};

class NotificationsTitle extends React.Component<Props, State> {
    constructor(props) {
        super(props);

        this.state = {
            globalNotificationsMuted: null
        };
    }

    async componentDidMount() {
        const config = await ipcRenderer.invoke("get-config");
        this.setState({ globalNotificationsMuted: config.globalNotificationsMuted });

        const checkBox: HTMLInputElement = document.getElementById("globalMuteCheckbox") as HTMLInputElement;

        if (this.state.globalNotificationsMuted) {
            checkBox.checked = true;
        } else {
            checkBox.checked = false;
        }
    }

    async handleChangeMute() {
        const newConfig = { globalNotificationsMuted: !this.state.globalNotificationsMuted };
        await ipcRenderer.invoke("set-config", newConfig);
        this.setState({ globalNotificationsMuted: !this.state.globalNotificationsMuted });
    }

    render() {
        return (
            <div className="NotificationsTitle">
                <h2>{this.props.title}</h2>
                <div>
                    <p>Globally Muted</p>
                    <label className="form-switch">
                        <input id="globalMuteCheckbox" type="checkbox" onClick={() => this.handleChangeMute()} />
                        <i />
                    </label>
                </div>
            </div>
        );
    }
}

export default NotificationsTitle;
