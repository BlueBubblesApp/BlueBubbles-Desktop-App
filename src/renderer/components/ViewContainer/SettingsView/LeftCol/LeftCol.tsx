/* eslint-disable react/prefer-stateless-function */
import * as React from "react";
import "./LeftCol.css";
import SettingTitles from "./SettingTitles/SettingTitles";
import LeftTopNav from "./TopNav/LeftTopNav";
import BottomLeftNav from "./BottomNav/BottomLeftNav";

class LeftCol extends React.Component {
    render() {
        return (
            <div className="LeftCol-Set">
                <LeftTopNav />
                <SettingTitles />
                <BottomLeftNav />
            </div>
        );
    }
}

export default LeftCol;
