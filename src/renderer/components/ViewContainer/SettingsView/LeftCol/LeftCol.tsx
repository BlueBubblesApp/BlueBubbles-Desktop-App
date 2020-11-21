/* eslint-disable react/prefer-stateless-function */
import * as React from "react";
import "./LeftCol.css";
import { ipcRenderer } from "electron";
import SettingTitles from "./SettingTitles/SettingTitles";
import LeftTopNav from "./TopNav/LeftTopNav";
import BottomLeftNav from "./BottomNav/BottomLeftNav";

class LeftCol extends React.Component {
    componentDidMount() {
        ipcRenderer.on("focused", (_, args) => {
            try {
                document.getElementById("LeftTopNav-Set").classList.remove("LeftCol-Blurred");
            } catch {
                /* Nothing */
            }
            try {
                document.getElementsByClassName("BottomLeftNav-Set")[0].classList.remove("LeftCol-Blurred");
            } catch {
                /* Nothing */
            }
            try {
                document.getElementsByClassName("SettingTitles")[0].classList.remove("LeftCol-Blurred");
            } catch {
                /* Nothing */
            }
            try {
                document.getElementsByClassName("RightTitle-Set")[0].classList.remove("RightTopNavBlurred");
            } catch {
                /* Nothing */
            }
        });

        ipcRenderer.on("blurred", (_, args) => {
            try {
                document.getElementById("LeftTopNav-Set").classList.add("LeftCol-Blurred");
            } catch {
                /* Nothing */
            }
            try {
                document.getElementsByClassName("BottomLeftNav-Set")[0].classList.add("LeftCol-Blurred");
            } catch {
                /* Nothing */
            }
            try {
                document.getElementsByClassName("SettingTitles")[0].classList.add("LeftCol-Blurred");
            } catch {
                /* Nothing */
            }
            try {
                document.getElementsByClassName("RightTitle-Set")[0].classList.add("RightTopNavBlurred");
            } catch {
                /* Nothing */
            }
        });
    }

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
