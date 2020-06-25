import React, { useState } from 'react';
import './TitleBar.css'

const ipcRenderer = window.require('electron').ipcRenderer

const TitleBar = () => {
    const minimizeHandler = () => {
        ipcRenderer.invoke('minimize-event')
    }

    const maximizeHandler = () => {
        ipcRenderer.invoke('maximize-event')
        const maximizeButton = document.getElementById('maximize-button')
        maximizeButton?.classList.toggle("hide")

        const unmaximizeButton = document.getElementById('unmaximize-button')
        unmaximizeButton?.classList.toggle("hide")
    }

    const unmaximizeHandler =() => {
        ipcRenderer.invoke('unmaximize-event')
        const unmaximizeButton = document.getElementById('unmaximize-button')
        unmaximizeButton?.classList.toggle("hide")

        const maximizeButton = document.getElementById('maximize-button')
        maximizeButton?.classList.toggle("hide")
    }

    const closeHandler = () => {
        ipcRenderer.invoke('close-event')
    }

    return (
        <div className="TitleBar">
            <div id="TitleBarLeft">
                <div id="TitleButtonsDiv">
                    <div onClick={closeHandler} id="close-button" className="title-button"></div>
                    <div onClick={minimizeHandler} id="minimize-button" className="title-button"></div>
                    <div onClick={unmaximizeHandler} id="unmaximize-button" className="title-button hide"></div>
                    <div onClick={maximizeHandler} id="maximize-button" className="title-button"></div>
                </div>
                <div id="TitleScrollableLeft"></div>
            </div>
            <div id="TitleBarRight"></div>
        </div>
    )
}

export default TitleBar