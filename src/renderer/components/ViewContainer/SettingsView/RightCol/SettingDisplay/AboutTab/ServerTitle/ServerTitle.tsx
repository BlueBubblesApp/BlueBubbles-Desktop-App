/* eslint-disable max-len */
import { ipcRenderer } from "electron";
import * as React from "react";
import "./ServerTitle.css";

interface SettingTitleProps {
    title: string;
}

interface State {
    serverOSVersion: any;
    serverAppVersion: any;
}

class ServerTitle extends React.Component<SettingTitleProps, State> {
    constructor(props) {
        super(props);

        this.state = {
            serverOSVersion: null,
            serverAppVersion: null
        };
    }

    async componentDidMount() {
        const data = await ipcRenderer.invoke("get-server-metadata");

        this.setState({ serverOSVersion: data.os_version, serverAppVersion: data.server_version });
    }

    render() {
        return (
            <div className="ServerSettingTitle">
                <h2>{this.props.title}</h2>
                <h3>
                    <span>Server OS Version: </span>
                    {`v${this.state.serverOSVersion !== null ? this.state.serverOSVersion : "0.0.0"}`}
                </h3>
                <h3>
                    <span>Server App Version: </span>
                    {`v${this.state.serverAppVersion !== null ? this.state.serverAppVersion : "0.0.0"}`}
                </h3>
            </div>
        );
    }
}

export default ServerTitle;
