import * as React from "react";
import "./AboutTab.css";
import SettingTitle from "./SettingTitle/SettingTitle";

function AboutTab() {
    return (
        <div className="AboutTab">
            <div id="AboutTitle" className="RightTitle-Set">
                <h1>About</h1>
            </div>
            <SettingTitle title="Client Version" subTitle={window.require("electron").remote.app.getVersion()} />
        </div>
    );
}

export default AboutTab;
