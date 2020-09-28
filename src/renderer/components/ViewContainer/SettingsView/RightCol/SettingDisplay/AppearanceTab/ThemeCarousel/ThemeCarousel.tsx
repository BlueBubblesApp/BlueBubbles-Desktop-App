/* eslint-disable class-methods-use-this */
/* eslint-disable react/no-unused-state */
/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable max-len */
/* eslint-disable react/prefer-stateless-function */
import * as React from "react";
import "./ThemeCarousel.css";
import { ipcRenderer } from "electron";
import { Theme } from "@server/databases/config/entity/Theme";

interface Props {
    isEditingBlurred: boolean;
}

interface State {
    configTheme: string;
    currentTheme: Theme;
    allThemes: Array<string>;
}

class ThemeCarousel extends React.Component<Props, State> {
    constructor(props) {
        super(props);

        this.state = {
            allThemes: [],
            configTheme: "",
            currentTheme: {
                name: "",
                titleBarCloseColor: "",
                titleBarMinimizeColor: "",
                titleBarMaximizeColor: "",
                searchBackgroundColor: "",
                searchPlaceholderColor: "",
                sidebarColor: "",
                blueColor: "",
                mainTitleColor: "",
                subTitleColor: "",
                secondaryColor: "",
                backgroundColor: "",
                rightSidePrimaryColor: "",
                rightSideSecondaryColor: "",
                rightSideDetailsTitleColor: "",
                chatLabelColor: "",
                incomingMessageColor: "",
                incomingMessageTextColor: "",
                outgoingMessageColor: "",
                outgoingMessageTextColor: "",
                attachmentButtonColor: "",
                attachmentClipColor: "",
                sendButtonColor: "",
                sendArrowColor: "",
                newChatButtonColor: "",
                sidebarBlurredColor: "",
                secondaryBlurredColor: ""
            }
        };
    }

    async componentDidMount() {
        const config = await ipcRenderer.invoke("get-config");
        this.setState({ configTheme: config.currentTheme, allThemes: config.allThemes.split(",") });

        let currentTheme: Theme = await ipcRenderer.invoke("get-theme", config.currentTheme);
        this.setState({ currentTheme });

        ipcRenderer.on("config-update", async (_, args) => {
            this.setState({ configTheme: args.currentTheme, allThemes: args.allThemes.split(",") });

            currentTheme = await ipcRenderer.invoke("get-theme", args.currentTheme);
            this.setState({ currentTheme });
            // console.log(currentTheme);
        });

        const input = document.getElementById("currentThemeTitle");
        input.addEventListener("keyup", event => {
            // Number 13 is the "Enter" key on the keyboard
            if (event.keyCode === 13) {
                event.preventDefault();
                this.handleThemeTitleSubmit(event);
            }
        });
    }

    handleThemeChange(e) {
        const newTheme = e.target.getAttribute("data-set-theme");
        this.setState({ configTheme: newTheme });

        // Set new theme and save to database
        const config = { currentTheme: newTheme };
        ipcRenderer.invoke("set-config", config);
    }

    handleBackArrowTheme(): string {
        if (this.state.allThemes.indexOf(this.state.configTheme) === 0) {
            return this.state.allThemes[this.state.allThemes.length - 1];
        }
        return this.state.allThemes[this.state.allThemes.indexOf(this.state.configTheme) - 1];
    }

    handleNextArrowTheme(): string {
        if (this.state.allThemes.indexOf(this.state.configTheme) === this.state.allThemes.length - 1) {
            return this.state.allThemes[0];
        }
        return this.state.allThemes[this.state.allThemes.indexOf(this.state.configTheme) + 1];
    }

    handleThemeTitleChange(e) {
        console.log(this.state.configTheme);
        this.setState({ configTheme: e.target.value });
    }

    handleThemeTitleSubmit(e) {
        const themeChange = { oldTitle: this.state.currentTheme.name, newTitle: this.state.configTheme };
        ipcRenderer.invoke("set-theme-title", themeChange);
    }

    handleDeleteTheme(e) {
        ipcRenderer.invoke("delete-theme", this.state.currentTheme);
        console.log("deleting theme");
        const x = document.getElementById("LeftArrow");
        x.click();
        console.log(this.state.allThemes);
    }

    handleNewTheme() {
        if (
            this.state.currentTheme.name === "dark" ||
            this.state.currentTheme.name === "light" ||
            this.state.currentTheme.name === "nord"
        ) {
            console.log("is default theme");

            // get the full theme and change the only value we want
            const currentThemeFull: Theme = this.state.currentTheme;
            currentThemeFull.name = `${this.state.currentTheme.name.substr(0, 1).toUpperCase() +
                this.state.currentTheme.name.substr(1, this.state.currentTheme.name.length)} - Copy`;

            // save new theme
            ipcRenderer.invoke("set-theme", currentThemeFull);

            // push the new theme name to the config
            let allThemesNew = "";
            for (const themeName of this.state.allThemes) {
                if (this.state.allThemes.indexOf(themeName) === this.state.allThemes.length - 1) {
                    allThemesNew += themeName;
                } else {
                    allThemesNew += `${themeName},`;
                }
            }

            allThemesNew = `${allThemesNew},${currentThemeFull.name}`;
            const config = { allThemes: allThemesNew, currentTheme: currentThemeFull.name };
            ipcRenderer.invoke("set-config", config);

            console.log(currentThemeFull);
        } else {
            console.log("custom theme");
            // get the full theme and change the only value we want
            const currentThemeFull: Theme = this.state.currentTheme;
            currentThemeFull.name += " - Copy";

            // save new theme
            ipcRenderer.invoke("set-theme", currentThemeFull);

            // push the new theme name to the config
            let allThemesNew = "";
            for (const themeName of this.state.allThemes) {
                if (this.state.allThemes.indexOf(themeName) === this.state.allThemes.length - 1) {
                    allThemesNew += themeName;
                } else {
                    allThemesNew += `${themeName},`;
                }
            }

            allThemesNew = `${allThemesNew},${currentThemeFull.name}`;
            const config = { allThemes: allThemesNew, currentTheme: currentThemeFull.name };
            ipcRenderer.invoke("set-config", config);
        }
    }

    render() {
        if (["dark", "light", "nord"].includes(this.state.currentTheme.name)) {
            const hideButton = "hidden";
        }
        return (
            <div id="ThemeCarousel">
                <div id="prevThemeArrowDiv">
                    <i
                        id="LeftArrow"
                        className="arrow left"
                        data-set-theme={this.handleBackArrowTheme()}
                        onClick={e => this.handleThemeChange(e)}
                    />
                </div>
                <div id="currentThemeDiv">
                    {/* <h1 className="currentThemeTitle">
                        {this.state.configTheme.charAt(0).toUpperCase() + this.state.configTheme.slice(1)}
                    </h1> */}
                    <div id="currentThemeTitleContainer">
                        {["dark", "light", "nord"].includes(this.state.currentTheme.name) ? (
                            <button id="deleteThemeButton" style={{ visibility: "hidden", pointerEvents: "none" }}>
                                Delete
                            </button>
                        ) : (
                            <button onClick={e => this.handleDeleteTheme(e)} id="deleteThemeButton">
                                Delete
                            </button>
                        )}
                        {["dark", "light", "nord"].includes(this.state.currentTheme.name) ? (
                            <input id="currentThemeTitle" value={this.state.configTheme} readOnly={true} />
                        ) : (
                            <input
                                id="currentThemeTitle"
                                value={this.state.configTheme}
                                onChange={e => this.handleThemeTitleChange(e)}
                                onSubmit={e => this.handleThemeTitleChange(e)}
                                onBlur={e => this.handleThemeTitleSubmit(e)}
                            />
                        )}
                        <button id="newThemeButton" onClick={() => this.handleNewTheme()}>
                            + New
                        </button>
                    </div>
                    <svg viewBox="0 0 1600 1000">
                        {/* Left Nav */}
                        <rect
                            x="0"
                            y="0"
                            height="100%"
                            width="400"
                            fill={
                                this.props.isEditingBlurred
                                    ? this.state.currentTheme.sidebarBlurredColor
                                    : this.state.currentTheme.sidebarColor
                            }
                        />
                        {/* Title Bar Buttons */}
                        <circle r="20" cx="30" cy="30" fill={this.state.currentTheme.titleBarCloseColor} />
                        <circle r="20" cx="80" cy="30" fill={this.state.currentTheme.titleBarMinimizeColor} />
                        <circle r="20" cx="130" cy="30" fill={this.state.currentTheme.titleBarMaximizeColor} />
                        {/* Search Bar */}
                        <rect
                            x="25"
                            y="60"
                            rx="15"
                            height="60"
                            width="275"
                            fill={this.state.currentTheme.searchBackgroundColor}
                        />
                        {/* Search Placeholder */}
                        <text
                            x="35"
                            y="105"
                            fontFamily="SF UI Display Bold"
                            fontSize="40"
                            fill={this.state.currentTheme.searchPlaceholderColor}
                        >
                            Search
                        </text>
                        {/* Active Chat */}
                        <rect x="0" y="284" height="140" width="400" fill={this.state.currentTheme.blueColor} />
                        {/* New Chat Button */}
                        <rect
                            x="320"
                            y="60"
                            rx="15"
                            height="60"
                            width="65"
                            fill={this.state.currentTheme.newChatButtonColor}
                        />
                        {/* Secondary Items */}
                        <rect
                            x="0"
                            y="140"
                            rx="15"
                            height="7"
                            width="400"
                            fill={this.state.currentTheme.subTitleColor}
                        />
                        <rect
                            x="50"
                            y="280"
                            rx="15"
                            height="7"
                            width="350"
                            fill={this.state.currentTheme.subTitleColor}
                        />
                        <rect
                            x="50"
                            y="420"
                            rx="15"
                            height="7"
                            width="350"
                            fill={this.state.currentTheme.subTitleColor}
                        />
                        <rect
                            x="50"
                            y="560"
                            rx="15"
                            height="7"
                            width="350"
                            fill={this.state.currentTheme.subTitleColor}
                        />
                        <rect
                            x="50"
                            y="700"
                            rx="15"
                            height="7"
                            width="350"
                            fill={this.state.currentTheme.subTitleColor}
                        />
                        <rect
                            x="50"
                            y="840"
                            rx="15"
                            height="7"
                            width="350"
                            fill={this.state.currentTheme.subTitleColor}
                        />
                        <rect
                            x="385"
                            y="200"
                            rx="15"
                            height="275"
                            width="15"
                            fill={this.state.currentTheme.subTitleColor}
                        />
                        {/* Chat Title */}
                        <text
                            x="65"
                            y="330"
                            fontFamily="SF UI Display Bold"
                            fontSize="40"
                            fill={this.state.currentTheme.mainTitleColor}
                        >
                            A Chat Title
                        </text>
                        {/* Right Background */}
                        <rect x="400" y="0" height="100%" width="1200" fill={this.state.currentTheme.backgroundColor} />
                        {/* Top Right Nav */}
                        <rect
                            x="400"
                            y="0"
                            height="140"
                            width="1200"
                            fill={
                                this.props.isEditingBlurred
                                    ? this.state.currentTheme.secondaryBlurredColor
                                    : this.state.currentTheme.secondaryColor
                            }
                        />
                        {/* Top Right Text */}
                        <text
                            x="425"
                            y="100"
                            fontFamily="SF UI Display Bold"
                            fontSize="40"
                            fill={this.state.currentTheme.rightSideSecondaryColor}
                        >
                            To:
                        </text>
                        <text
                            x="490"
                            y="100"
                            fontFamily="SF UI Display Bold"
                            fontSize="40"
                            fill={this.state.currentTheme.rightSidePrimaryColor}
                        >
                            Chat Participants
                        </text>
                        <text
                            x="1435"
                            y="100"
                            fontFamily="SF UI Display Bold"
                            fontSize="40"
                            fill={this.state.currentTheme.rightSideDetailsTitleColor}
                        >
                            Details
                        </text>
                        {/* Outgoing Message */}
                        <rect
                            x="1175"
                            y="200"
                            rx="40"
                            height="75"
                            width="400"
                            fill={this.state.currentTheme.outgoingMessageColor}
                        />
                        <text
                            x="1200"
                            y="250"
                            fontFamily="SF UI Display Bold"
                            fontSize="40"
                            fill={this.state.currentTheme.outgoingMessageTextColor}
                        >
                            Outgoing message
                        </text>
                        <rect
                            x="1025"
                            y="300"
                            rx="40"
                            height="75"
                            width="550"
                            fill={this.state.currentTheme.outgoingMessageColor}
                        />
                        {/* Chat Label */}
                        <text
                            x="1350"
                            y="420"
                            fontFamily="SF UI Display Bold"
                            fontSize="35"
                            fill={this.state.currentTheme.chatLabelColor}
                        >
                            Read 1:13 PM
                        </text>
                        {/* Incoming Message */}
                        <rect
                            x="425"
                            y="400"
                            rx="40"
                            height="75"
                            width="400"
                            fill={this.state.currentTheme.incomingMessageColor}
                        />
                        <text
                            x="450"
                            y="450"
                            fontFamily="SF UI Display Bold"
                            fontSize="40"
                            fill={this.state.currentTheme.incomingMessageTextColor}
                        >
                            Incoming message
                        </text>
                        <rect
                            x="425"
                            y="500"
                            rx="40"
                            height="75"
                            width="550"
                            fill={this.state.currentTheme.incomingMessageColor}
                        />
                        {/* Bottom Right Nav */}
                        <rect
                            x="400"
                            y="860"
                            height="140"
                            width="1200"
                            fill={
                                this.props.isEditingBlurred
                                    ? this.state.currentTheme.secondaryBlurredColor
                                    : this.state.currentTheme.secondaryColor
                            }
                        />
                        {/* Attachment Button */}
                        <rect
                            x="425"
                            y="905"
                            rx="13"
                            height="60"
                            width="65"
                            fill={this.state.currentTheme.attachmentButtonColor}
                        />
                        {/* New Message Input */}
                        <rect
                            x="525"
                            y="905"
                            rx="20"
                            height="60"
                            width="900"
                            fill={this.state.currentTheme.rightSideSecondaryColor}
                        />
                        <rect
                            x="530"
                            y="910"
                            rx="20"
                            height="50"
                            width="890"
                            fill={this.state.currentTheme.secondaryColor}
                        />
                        {/* Send Message */}
                        <circle r="33" cx="1500" cy="930" fill={this.state.currentTheme.sendButtonColor} />
                        <rect
                            x="1494"
                            y="910"
                            rx="5"
                            height="40"
                            width="10"
                            fill={this.state.currentTheme.sendArrowColor}
                        />
                        <rect
                            x="1700"
                            y="-416"
                            rx="5"
                            height="25"
                            width="10"
                            fill={this.state.currentTheme.sendArrowColor}
                            transform="rotate(45)"
                        />
                        <rect
                            x="409"
                            y="1702"
                            rx="5"
                            height="25"
                            width="10"
                            fill={this.state.currentTheme.sendArrowColor}
                            transform="rotate(-45)"
                        />
                    </svg>
                </div>
                <div id="nextThemeArrowDiv">
                    <i
                        className="arrow right"
                        data-set-theme={this.handleNextArrowTheme()}
                        onClick={e => this.handleThemeChange(e)}
                    />
                </div>
            </div>
        );
    }
}

export default ThemeCarousel;
