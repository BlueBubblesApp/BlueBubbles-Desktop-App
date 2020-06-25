import * as React from "react";
import "./Tab1.css";
import TopTitle from "./TopTitle/TopTitle";
import SettingTitle from "./SettingTitle/SettingTitle";

function Tab1() {
    return (
        <div className="Tab1">
            <TopTitle title="General" />
            <SettingTitle title="Remote Server URL" subTitle="https://181g2a3442.ngrock.io" />
        </div>
    );
}

export default Tab1;
