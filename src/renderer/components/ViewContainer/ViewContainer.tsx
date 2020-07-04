import * as React from "react";
import { BrowserRouter as Router, Route, HashRouter } from "react-router-dom";
import "./ViewContainer.css";
import { ipcRenderer } from "electron";
import MessagingView from "./MessagingView/MessagingView";
import SettingsView from "./SettingsView/SettingsView";
import LoginView from "./LoginView/LoginView";

const { AnimatedSwitch } = require("react-router-transition");

interface ViewContainerProps {
    theme: string;
}

class ViewContainer extends React.Component<object, ViewContainerProps> {
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
    }

    render() {
        return (
            <div className="ViewContainer" data-theme={this.state.theme}>
                <HashRouter>
                    <AnimatedSwitch
                        atEnter={{ opacity: 0.1 }}
                        atLeave={{ opacity: 0 }}
                        atActive={{ opacity: 1 }}
                        className="switch-wrapper"
                    >
                        <Route exact path="/" component={LoginView}>
                            <LoginView />
                        </Route>
                        <Route exact path="/messaging" component={MessagingView}>
                            <MessagingView />
                        </Route>
                        <Route path="/settings" component={SettingsView}>
                            <SettingsView />
                        </Route>
                    </AnimatedSwitch>
                </HashRouter>
            </div>
        );
    }
}

export default ViewContainer;
