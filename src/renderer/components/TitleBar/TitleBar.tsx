/* eslint-disable no-unused-expressions */
import * as React from "react";
import "./TitleBar.css";
import CloseIcon from './close.png';
import MinimizeIcon from './minimize.png';
import MaximizeIcon from './maximize.png';
import UnmaximizeIcon from './unmaximize.png';

const { ipcRenderer } = require("electron");

const TitleBar = () => {
    // function closeIconHandler(e) {
    //     const closeIcon = document.getElementById("close-button-icon");
    //     closeIcon.classList.toggle("show");
    // };

    const minimizeHandler = () => {
        ipcRenderer.invoke("minimize-event");
    };

    const maximizeHandler = () => {
        ipcRenderer.invoke("maximize-event");

        const maximizeButton = document.getElementById("maximize-button");
        maximizeButton.classList.toggle("hide");

        const unmaximizeButton = document.getElementById("unmaximize-button");
        unmaximizeButton.classList.toggle("hide");
    };

    const unmaximizeHandler = () => {
        ipcRenderer.invoke("unmaximize-event");
        const unmaximizeButton = document.getElementById("unmaximize-button");
        unmaximizeButton.classList.toggle("hide");

        const maximizeButton = document.getElementById("maximize-button");
        maximizeButton.classList.toggle("hide");
    };

    const closeHandler = () => {
        console.log("trying to click close button");
        ipcRenderer.invoke("close-event");
    };

    return (
        <div className="TitleBar">
            <div id="TitleBarLeft">
                <div id="TitleButtonsDiv">
                    <div onClick={closeHandler} id="close-button" className="title-button"><img id="close-button-icon" className="hideIcon" src={CloseIcon}></img></div>
                    <div onClick={minimizeHandler} id="minimize-button" className="title-button"><img id="minimize-button-icon" className="hideIcon" src={MinimizeIcon}></img></div>
                    <div onClick={unmaximizeHandler} id="unmaximize-button" className="title-button hide"><img id="unmaximize-button-icon" className="hideIcon" src={UnmaximizeIcon}></img></div>
                    <div onClick={maximizeHandler} id="maximize-button" className="title-button"><img id="maximize-button-icon" className="hideIcon" src={MaximizeIcon}></img></div>
                </div>
                <div id="TitleScrollableLeft" />
            </div>
            <div id="TitleBarRight" />
        </div>
    );
};

export default TitleBar;
