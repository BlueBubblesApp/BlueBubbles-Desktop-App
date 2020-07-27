/* eslint-disable max-len */
/* eslint-disable react/no-unused-state */
import * as React from "react";
import { ipcRenderer, App } from "electron";

import "./AppearanceTab.css";
import ThemeCarousel from "./ThemeCarousel/ThemeCarousel";
import ThemeConfigDisplay from "./ThemeConfigDisplay/ThemeConfigDisplay";

interface AppearanceTabState {
    currentTheme: string;
    isEditingBlurred: boolean;
    allThemes: Array<string>;
}

class AppearanceTab extends React.Component<object, AppearanceTabState> {
    constructor(props) {
        super(props);

        this.state = {
            currentTheme: "",
            isEditingBlurred: false,
            allThemes: null
        };
    }

    async componentDidMount() {
        const config = await ipcRenderer.invoke("get-config");
        this.setState({ currentTheme: config.currentTheme, allThemes: config.allThemes });

        ipcRenderer.on("config-update", (_, args) => {
            this.setState({ currentTheme: args.currentTheme, allThemes: args.allThemes });
        });
    }

    handleThemeChange(e) {
        const newTheme = e.target.getAttribute("data-set-theme");
        this.setState({ currentTheme: newTheme });

        // Find every element with data-theme attribute and set to new theme
        const themeElements = [document.querySelectorAll("*[data-theme]")];
        for (let i = 0; i < themeElements[0].length; i += 1) {
            themeElements[0][i].setAttribute("data-theme", newTheme);
        }

        // Set new theme and save to databse
        const config = { currentTheme: newTheme };
        ipcRenderer.invoke("set-config", config);
    }

    render() {
        return (
            <>
                <div id="AppearanceTitle">
                    <h1>Appearance</h1>
                </div>
                <div className="AppearanceTab">
                    <div id="AppearanceContainer">
                        <ThemeCarousel isEditingBlurred={this.state.isEditingBlurred} />
                        <div id="windowFocusedDiv">
                            <div>
                                <h1 id="windowFocusedSetting">
                                    {this.state.isEditingBlurred ? "Unfocused" : "Focused"}
                                </h1>
                                <p>
                                    <i
                                        className="arrow down"
                                        onClick={() =>
                                            this.setState({ isEditingBlurred: !this.state.isEditingBlurred })
                                        }
                                    />
                                </p>
                            </div>
                        </div>
                        <ThemeConfigDisplay isEditingBlurred={this.state.isEditingBlurred} />
                    </div>
                </div>
            </>
        );
    }
}

export default AppearanceTab;
