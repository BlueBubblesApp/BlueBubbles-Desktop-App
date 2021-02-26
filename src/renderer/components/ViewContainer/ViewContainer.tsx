/* eslint-disable react/prefer-stateless-function */
import * as React from "react";
import { ipcRenderer } from "electron";
import { Route, HashRouter } from "react-router-dom";

import { AnimatedSwitch } from "react-router-transition";
import MessagingView from "./MessagingView/MessagingView";
import SettingsView from "./SettingsView/SettingsView";
import LoginView from "./LoginView/LoginView";

import "./ViewContainer.css";

const handleHotKeys = (e: KeyboardEvent) => {
    if (!e.metaKey && !e.ctrlKey) return;
    let index: any = e.key;

    try {
        index = Number.parseInt(index, 10);
    } catch (ex) {
        // Pass
    }

    if (!Number.isNaN(index) && typeof index === "number") {
        // If 0 is used, convert it to 10
        if (index === 0) index = 10;

        // Subtract 1 to account for the index
        index = (index as number) - 1;
        if (index < 0 || index > 9) return;

        ipcRenderer.invoke("send-to-ui", { event: "set-current-chat-index", contents: index });
    } else if (e.shiftKey && e.key === "Tab") {
        ipcRenderer.invoke("send-to-ui", { event: "decrement-current-chat-index" });
    } else {
        ipcRenderer.invoke("send-to-ui", { event: "increment-current-chat-index" });
    }
};

class ViewContainer extends React.Component {
    constructor(props) {
        super(props);
        document.addEventListener("keyup", handleHotKeys, false);
    }

    render() {
        return (
            <div className="ViewContainer">
                <HashRouter>
                    <AnimatedSwitch
                        atEnter={{ opacity: 0.1 }}
                        atLeave={{ opacity: 0 }}
                        atActive={{ opacity: 1 }}
                        className="switch-wrapper"
                    >
                        <Route exact path="/" component={LoginView} />
                        <Route exact path="/messaging" component={MessagingView} />
                        <Route path="/settings" component={SettingsView} />
                    </AnimatedSwitch>
                </HashRouter>
            </div>
        );
    }
}

export default ViewContainer;
