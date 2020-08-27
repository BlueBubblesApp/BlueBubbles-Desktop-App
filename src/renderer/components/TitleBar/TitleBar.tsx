/* eslint-disable max-len */
/* eslint-disable no-unused-expressions */
import * as React from "react";
import "./TitleBar.css";
import { Theme } from "@server/databases/config/entity";
import { ipcRenderer } from "electron";
import CloseIcon from "./close.png";
import MinimizeIcon from "./minimize.png";
import MaximizeIcon from "./maximize.png";
import UnmaximizeIcon from "./unmaximize.png";

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

class TitleBar extends React.Component {
    async componentDidMount() {
        const config = await ipcRenderer.invoke("get-config");

        const theme: Theme = await ipcRenderer.invoke("get-theme", config.currentTheme);

        // Set all theme colors as css variables
        document.documentElement.style.setProperty("--title-bar-close", theme.titleBarCloseColor);
        document.documentElement.style.setProperty("--title-bar-minimize", theme.titleBarMinimizeColor);
        document.documentElement.style.setProperty("--title-bar-maximize", theme.titleBarMaximizeColor);
        document.documentElement.style.setProperty("--search-background-color", theme.searchBackgroundColor);
        document.documentElement.style.setProperty("--search-placeholder-color", theme.searchPlaceholderColor);
        document.documentElement.style.setProperty("--sidebar-color", theme.sidebarColor);
        document.documentElement.style.setProperty("--blue-color", theme.blueColor);
        document.documentElement.style.setProperty("--main-title-color", theme.mainTitleColor);
        document.documentElement.style.setProperty("--sub-title-color", theme.subTitleColor);
        document.documentElement.style.setProperty("--secondary-color", theme.secondaryColor);
        document.documentElement.style.setProperty("--background-color", theme.backgroundColor);
        document.documentElement.style.setProperty("--right-primary-color", theme.rightSidePrimaryColor);
        document.documentElement.style.setProperty("--right-secondary-color", theme.rightSideSecondaryColor);
        document.documentElement.style.setProperty("--right-accent-title-color", theme.rightSideDetailsTitleColor);
        document.documentElement.style.setProperty("--chat-label-color", theme.chatLabelColor);
        document.documentElement.style.setProperty("--incoming-message-color", theme.incomingMessageColor);
        document.documentElement.style.setProperty("--incoming-message-text-color", theme.incomingMessageTextColor);
        document.documentElement.style.setProperty("--outgoing-message-color", theme.outgoingMessageColor);
        document.documentElement.style.setProperty("--outgoing-message-text-color", theme.outgoingMessageTextColor);
        document.documentElement.style.setProperty("--attachment-button-color", theme.attachmentButtonColor);
        document.documentElement.style.setProperty("--attachment-clip-color", theme.attachmentClipColor);
        document.documentElement.style.setProperty("--send-button-color", theme.sendButtonColor);
        document.documentElement.style.setProperty("--send-button-arrow-color", theme.sendArrowColor);
        document.documentElement.style.setProperty("--new-chat-button-color", theme.newChatButtonColor);
        document.documentElement.style.setProperty("--sidebar-blurred-color", theme.sidebarBlurredColor);
        document.documentElement.style.setProperty("--secondary-blurred-color", theme.secondaryBlurredColor);

        ipcRenderer.on("config-update", async (_, args) => {
            const newTheme = await ipcRenderer.invoke("get-theme", args.currentTheme);

            // Set all theme colors as css variables
            document.documentElement.style.setProperty("--title-bar-close", newTheme.titleBarCloseColor);
            document.documentElement.style.setProperty("--title-bar-minimize", newTheme.titleBarMinimizeColor);
            document.documentElement.style.setProperty("--title-bar-maximize", newTheme.titleBarMaximizeColor);
            document.documentElement.style.setProperty("--search-background-color", newTheme.searchBackgroundColor);
            document.documentElement.style.setProperty("--search-placeholder-color", newTheme.searchPlaceholderColor);
            document.documentElement.style.setProperty("--sidebar-color", newTheme.sidebarColor);
            document.documentElement.style.setProperty("--blue-color", newTheme.blueColor);
            document.documentElement.style.setProperty("--main-title-color", newTheme.mainTitleColor);
            document.documentElement.style.setProperty("--sub-title-color", newTheme.subTitleColor);
            document.documentElement.style.setProperty("--secondary-color", newTheme.secondaryColor);
            document.documentElement.style.setProperty("--background-color", newTheme.backgroundColor);
            document.documentElement.style.setProperty("--right-primary-color", newTheme.rightSidePrimaryColor);
            document.documentElement.style.setProperty("--right-secondary-color", newTheme.rightSideSecondaryColor);
            document.documentElement.style.setProperty("--right-accent-title-color", theme.rightSideDetailsTitleColor);
            document.documentElement.style.setProperty("--chat-label-color", newTheme.chatLabelColor);
            document.documentElement.style.setProperty("--incoming-message-color", newTheme.incomingMessageColor);
            document.documentElement.style.setProperty(
                "--incoming-message-text-color",
                newTheme.incomingMessageTextColor
            );
            document.documentElement.style.setProperty("--outgoing-message-color", newTheme.outgoingMessageColor);
            document.documentElement.style.setProperty(
                "--outgoing-message-text-color",
                newTheme.outgoingMessageTextColor
            );
            document.documentElement.style.setProperty("--attachment-button-color", newTheme.attachmentButtonColor);
            document.documentElement.style.setProperty("--attachment-clip-color", newTheme.attachmentClipColor);
            document.documentElement.style.setProperty("--send-button-color", newTheme.sendButtonColor);
            document.documentElement.style.setProperty("--send-button-arrow-color", newTheme.sendArrowColor);
            document.documentElement.style.setProperty("--new-chat-button-color", newTheme.newChatButtonColor);
            document.documentElement.style.setProperty("--sidebar-blurred-color", newTheme.sidebarBlurredColor);
            document.documentElement.style.setProperty("--secondary-blurred-color", newTheme.secondaryBlurredColor);
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
            <div className="TitleBar">
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
