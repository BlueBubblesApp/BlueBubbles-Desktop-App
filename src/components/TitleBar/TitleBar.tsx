import React, { useState } from 'react';
import './TitleBar.css'

const ipcRenderer = window.require('electron').ipcRenderer

const Titlebar = () => {

    const [isActive, setIsActive] = useState()
    const [isMaximized, setIsMaximized] = useState()

    ipcRenderer.on('focused', () => {
        const setIsActive = true
    })

    ipcRenderer.on('blurred', () => {
        const setIsActive = false
    })

    ipcRenderer.on('maximized', () => {
        const setIsMaximized = true
    })

    ipcRenderer.on('unmaximized', () => {
        const setIsMaximized = false
    })

    const minimizeHandler = () => {
        ipcRenderer.invoke('minimize-event')
    }

    const maximizeHandler = () => {
        ipcRenderer.invoke('maximize-event')
    }

    const unmaximizeHandler = () => {
        ipcRenderer.invoke('unmaximize-event')
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
                    {isMaximized ? <div onClick={maximizeHandler} id="maximize-button" className="title-button"></div>
                    :<div onClick={maximizeHandler} id="maximize-button" className="title-button"></div>}
                </div>
                <div id="TitleScrollableLeft"></div>
            </div>
            <div id="TitleBarRight"></div>
        </div>
    )
}

export default Titlebar