import * as React from "react";
import "./LeftCol.css";
import SettingTitles from "./SettingTitles/SettingTitles";
import LeftTopNav from "./TopNav/LeftTopNav";
import BottomLeftNav from "./BottomNav/BottomLeftNav";

function LeftCol() {
    return (
        <div className="LeftCol-Set">
            <LeftTopNav />
            <SettingTitles />
            <BottomLeftNav />
        </div>
    );
}

export default LeftCol;
