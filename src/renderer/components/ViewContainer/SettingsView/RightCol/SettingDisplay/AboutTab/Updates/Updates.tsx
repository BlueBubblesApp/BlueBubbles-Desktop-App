/* eslint-disable max-len */
import { bytesToSize } from "@renderer/helpers/utils";
import { ipcRenderer } from "electron";
import * as React from "react";
import "./Updates.css";

const semver = require("semver");

interface UpdatesProps {
    title: string;
}

interface State {
    hasUpdates: boolean;
    checkingForUpdates: boolean;
    updateData: any;
    isDownloadingUpdate: boolean;
    progressObj: any;
    downloadFinished: boolean;
}

class Updates extends React.Component<UpdatesProps, State> {
    constructor(props) {
        super(props);

        this.state = {
            hasUpdates: false,
            checkingForUpdates: false,
            updateData: null,
            isDownloadingUpdate: false,
            progressObj: null,
            downloadFinished: false
        };
    }

    async componentDidMount() {
        this.setState({ checkingForUpdates: true }, async () => {
            const data = await ipcRenderer.invoke("check-for-updates");

            console.log(data);
            if (data) {
                if (semver.gt(data.updateInfo.version, window.require("electron").remote.app.getVersion())) {
                    this.setState({ checkingForUpdates: false, hasUpdates: true, updateData: data });
                } else {
                    this.setState({ checkingForUpdates: false, hasUpdates: false, updateData: data });
                }
            }
        });

        ipcRenderer.on("update-download-progress", (_, progressObj) => {
            this.setState({ progressObj, isDownloadingUpdate: true });
        });

        ipcRenderer.on("update-err", (_, err) => {
            this.setState({ hasUpdates: false, isDownloadingUpdate: false, checkingForUpdates: false });
        });

        ipcRenderer.on("update-available", (_, info) => {
            this.setState({ hasUpdates: true, isDownloadingUpdate: false, checkingForUpdates: false });
        });

        ipcRenderer.on("update-not-available", (_, info) => {
            this.setState({ hasUpdates: false, isDownloadingUpdate: false, checkingForUpdates: false });
        });

        ipcRenderer.on("update-downloaded", (_, info) => {
            this.setState({ isDownloadingUpdate: false, downloadFinished: true });
        });
    }

    async downloadUpdate() {
        const { updateData } = this.state;
        this.setState({ isDownloadingUpdate: true });

        const path = await ipcRenderer.invoke("download-update", updateData.cancellationToken);
        console.log(path);
    }

    render() {
        return (
            <div className="ServerSettingTitle">
                <h2>{this.props.title}</h2>
                <div id="updateContainer">
                    {this.state.checkingForUpdates ? (
                        <h3>Checking for updates...</h3>
                    ) : (
                        <>
                            {this.state.hasUpdates ? (
                                <>
                                    {this.state.isDownloadingUpdate && this.state.progressObj ? (
                                        <h3>
                                            Downloading update:{" "}
                                            <span>
                                                {this.state.progressObj.percent
                                                    .toString()
                                                    .substr(0, this.state.progressObj.percent.toString().indexOf("."))}
                                                %
                                            </span>{" "}
                                            <span>{bytesToSize(this.state.progressObj.bytesPerSecond)}/s</span>
                                        </h3>
                                    ) : (
                                        <>
                                            {this.state.downloadFinished ? (
                                                <>
                                                    <h3>Update downloaded</h3>
                                                    <button onClick={() => ipcRenderer.invoke("quit-and-install")}>
                                                        Quit and install
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    {this.state.updateData ? (
                                                        <>
                                                            <h3>
                                                                Update available: v
                                                                {this.state.updateData.updateInfo.version}
                                                            </h3>
                                                            <button onClick={() => this.downloadUpdate()}>
                                                                Download
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <h3>Update available: v0.0.0</h3>
                                                            <button onClick={() => this.downloadUpdate()}>
                                                                Download
                                                            </button>
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </>
                                    )}
                                </>
                            ) : (
                                <h3>No updates available</h3>
                            )}
                        </>
                    )}
                </div>
            </div>
        );
    }
}

export default Updates;
