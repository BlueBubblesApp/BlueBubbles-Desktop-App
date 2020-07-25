/* eslint-disable react/prefer-stateless-function */
import * as React from "react";
import "./SettingsView.css";
import LeftCol from "./LeftCol/LeftCol";
import RightCol from "./RightCol/RightCol";

class SettingsView extends React.Component {
    render() {
        return (
            <div className="SettingsView">
                <LeftCol />
                <RightCol />
            </div>
        );
    }
}

export default SettingsView;
