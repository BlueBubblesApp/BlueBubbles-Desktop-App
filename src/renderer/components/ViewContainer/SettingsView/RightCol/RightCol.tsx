/* eslint-disable react/prefer-stateless-function */
import * as React from "react";
import "./RightCol.css";
import SettingDisplay from "./SettingDisplay/SettingDisplay";

class RightCol extends React.Component {
    render() {
        return (
            <div className="RightCol-Set">
                <SettingDisplay />
            </div>
        );
    }
}

export default RightCol;
