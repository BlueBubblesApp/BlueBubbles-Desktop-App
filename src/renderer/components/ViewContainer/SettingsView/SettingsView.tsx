import * as React from "react";
import "./SettingsView.css";
import LeftCol from "./LeftCol/LeftCol";
import RightCol from "./RightCol/RightCol";

function SettingsView() {
    return (
        <div className="SettingsView">
            <LeftCol />
            <RightCol />
        </div>
    );
}

export default SettingsView;
