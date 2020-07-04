import * as React from "react";
import { ipcRenderer, App } from "electron";

import "./AppearanceTab.css";
import DarkExample from "./dark-example.png";
import LightExample from "./light-example.png";

interface AppearanceTabState {
    theme: string;
}

class AppearanceTab extends React.Component<object, AppearanceTabState> {
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

    handleThemeChange(e) {
        const newTheme = e.target.getAttribute("data-set-theme");
        this.setState({ theme: newTheme });
    
        // Find every element with data-theme attribute and set to new theme
        const themeElements = [document.querySelectorAll("*[data-theme]")];
        for (let i = 0; i < themeElements[0].length; i += 1) {
            themeElements[0][i].setAttribute("data-theme", newTheme);
        }
    
        // Set new theme and save to databse
        const config = { theme: newTheme };
        ipcRenderer.invoke("set-config", config);
    };

    render() {
        return (
            <div className="AppearanceTab">
                <div id="AppearanceTitle">
                    <h1>Appearance</h1>
                </div>
                <div id="AppearanceContainer">
                    <div id="half1" onClick={(e) => this.handleThemeChange(e)} data-set-theme="dark">
                        <p className="themeTitle">Dark</p>
                        <img
                            id="darkExample"
                            className={this.state.theme === "dark" ? "active-theme" : ""}
                            src={DarkExample}
                            alt="dark-example"
                        />
                    </div>
                    <div id="half2" onClick={(e) => this.handleThemeChange(e)} data-set-theme="light">
                        <p className="themeTitle">Light</p>
                        <img
                            id="lightExample"
                            className={this.state.theme === "light" ? "active-theme" : ""}
                            src={LightExample}
                            alt="light-example"
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default AppearanceTab;
