/* eslint-disable no-unused-expressions */
import * as React from "react";
import "./TitleBar.css";
import CloseIcon from "./close.png";
import MinimizeIcon from "./minimize.png";
import MaximizeIcon from "./maximize.png";
import UnmaximizeIcon from "./unmaximize.png";

const { ipcRenderer } = require("electron");

interface TitleBarProps {
    theme: string;
}

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

class TitleBar extends React.Component<object, TitleBarProps> {
    constructor(props) {
        super(props);

        this.state = {
            theme: ""
        };
    }

    async componentDidMount() {
        const config = await ipcRenderer.invoke("get-config");
        this.setState({ theme: config.theme });

        ipcRenderer.on("config-update", (_, args) => {
            this.setState({ theme: args.theme });
        });

        ipcRenderer.on("focused", (_, args) => {
            document.getElementById("TitleBarLeft").classList.remove("TitleBarLeftBlurred");
            document.getElementById("TitleBarRight").classList.remove("TitleBarRightBlurred");
            document.getElementById("close-button").style.backgroundColor = "#fc4e50";
            document.getElementById("minimize-button").style.backgroundColor = "#febe30";
            try {
                document.getElementById("maximize-button").style.backgroundColor = "#38d744";
            } catch {
                document.getElementById("unmaximize-button").style.backgroundColor = "#38d744";
            }
        });

        ipcRenderer.on("blurred", (_, args) => {
            document.getElementById("TitleBarLeft").classList.add("TitleBarLeftBlurred");
            document.getElementById("TitleBarRight").classList.add("TitleBarRightBlurred");
            document.getElementById("close-button").style.backgroundColor = "grey";
            document.getElementById("minimize-button").style.backgroundColor = "grey";
            try {
                document.getElementById("maximize-button").style.backgroundColor = "grey";
            } catch {
                document.getElementById("unmaximize-button").style.backgroundColor = "grey";
            }
        });
    }

    render() {
        return (
            <div className="TitleBar" data-theme={this.state.theme}>
                <div id="TitleBarLeft">
                    <div id="TitleButtonsDiv">
                        <div onClick={closeHandler} id="close-button" className="title-button">
                            <img id="close-button-icon" className="hideIcon" src={CloseIcon} alt="close" />
                        </div>
                        <div onClick={minimizeHandler} id="minimize-button" className="title-button">
                            <img id="minimize-button-icon" className="hideIcon" src={MinimizeIcon} alt="minimize" />
                        </div>
                        <div onClick={unmaximizeHandler} id="unmaximize-button" className="title-button hide">
                            <img
                                id="unmaximize-button-icon"
                                className="hideIcon"
                                src={UnmaximizeIcon}
                                alt="unmaximize"
                            />
                        </div>
                        <div onClick={maximizeHandler} id="maximize-button" className="title-button">
                            <img id="maximize-button-icon" className="hideIcon" src={MaximizeIcon} alt="maximize" />
                        </div>
                    </div>
                    <div id="TitleScrollableLeft" />
                </div>
                <div id="TitleBarRight" />
            </div>
        );
    }
}

export default TitleBar;
