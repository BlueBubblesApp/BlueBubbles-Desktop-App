/* eslint-disable max-len */
import { ipcRenderer } from "electron";
import * as React from "react";
import "./AboutTab.css";
import ClientTitle from "./ClientTitle/ClientTitle";
import ServerTitle from "./ServerTitle/ServerTitle";
import Updates from "./Updates/Updates";

function AboutTab() {
    return (
        <div className="AboutTab">
            <div id="AboutTitle" className="RightTitle-Set">
                <h1>About</h1>
            </div>
            <ClientTitle title="Client Version" subTitle={window.require("electron").remote.app.getVersion()} />
            <ServerTitle title="Server Information" />
            {process.platform !== "linux" ? <Updates title="Updates" /> : null}
            <div className="SettingTitle">
                <h2 id="supportLink" onClick={() => ipcRenderer.invoke("open-link", "https://discord.gg/6nrGRHT")}>
                    Join our discord
                </h2>
            </div>
            <div className="SettingTitle">
                <h2 id="supportLink" onClick={() => ipcRenderer.invoke("open-link", "https://bluebubbles.app/donate/")}>
                    Support the Developers
                </h2>
            </div>
        </div>
    );
}

export default AboutTab;
