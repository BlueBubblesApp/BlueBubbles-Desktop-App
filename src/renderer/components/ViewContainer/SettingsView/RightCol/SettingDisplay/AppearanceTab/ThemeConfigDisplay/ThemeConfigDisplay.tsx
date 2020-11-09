/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable react/no-unused-state */
/* eslint-disable max-len */
/* eslint-disable react/prefer-stateless-function */
import * as React from "react";
import "./ThemeConfigDisplay.css";
import { SketchPicker } from "react-color";
import { ipcRenderer } from "electron";
import { Theme } from "@server/databases/config/entity/Theme";
import ColorDisplayRow from "./ColorDisplayRow/ColorDisplayRow";

interface Props {
    isEditingBlurred: boolean;
    allThemes: string;
    currentTheme: string;
}

interface State {
    configTheme: string;
    currentTheme: Theme;
}

class ThemeConfigDisplay extends React.Component<Props, State> {
    constructor(props) {
        super(props);

        this.state = {
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
        this.setState({ configTheme: config.theme });

        let currentTheme: Theme = await ipcRenderer.invoke("get-theme", config.currentTheme);
        this.setState({ currentTheme });

        ipcRenderer.on("config-update", async (_, args) => {
            this.setState({ configTheme: args.currentTheme });

            currentTheme = await ipcRenderer.invoke("get-theme", args.currentTheme);
            this.setState({ currentTheme });
        });
    }

    render() {
        return (
            <div id="ThemeConfigDisplay">
                <h1 className="aAreaLocationTitle">Left Column</h1>
                {this.props.isEditingBlurred ? (
                    <>
                        <ColorDisplayRow
                            title1="Sidebar"
                            hex1={this.state.currentTheme.sidebarBlurredColor}
                            currentTheme={this.props.currentTheme}
                            allThemes={this.props.allThemes}
                        />
                    </>
                ) : (
                    <>
                        <ColorDisplayRow
                            title1="Title Bar"
                            title2="Search Bar"
                            hex1={this.state.currentTheme.titleBarCloseColor}
                            varTitle1="titleBarCloseColor"
                            hex2={this.state.currentTheme.titleBarMinimizeColor}
                            varTitle2="titleBarMinimizeColor"
                            hex3={this.state.currentTheme.titleBarMaximizeColor}
                            varTitle3="titleBarMaximizeColor"
                            hex4={this.state.currentTheme.searchBackgroundColor}
                            varTitle4="searchBackgroundColor"
                            hex5={this.state.currentTheme.searchPlaceholderColor}
                            varTitle5="searchPlaceholderColor"
                            currentTheme={this.props.currentTheme}
                            allThemes={this.props.allThemes}
                        />
                        <ColorDisplayRow
                            title1="New Chat Button"
                            title2="Background"
                            hex1={this.state.currentTheme.newChatButtonColor}
                            varTitle1="newChatButtonColor"
                            hex5={this.state.currentTheme.sidebarColor}
                            varTitle5="sidebarColor"
                            currentTheme={this.props.currentTheme}
                            allThemes={this.props.allThemes}
                        />
                        <ColorDisplayRow
                            title1="Active Chat"
                            title2="Chat Title"
                            hex1={this.state.currentTheme.blueColor}
                            varTitle1="blueColor"
                            hex4={this.state.currentTheme.mainTitleColor}
                            varTitle4="mainTitleColor"
                            currentTheme={this.props.currentTheme}
                            allThemes={this.props.allThemes}
                        />
                        <ColorDisplayRow
                            title1="Secondary"
                            hex1={this.state.currentTheme.subTitleColor}
                            varTitle1="subTitleColor"
                            currentTheme={this.props.currentTheme}
                            allThemes={this.props.allThemes}
                        />
                    </>
                )}
                <h1 className="aAreaLocationTitle">Right Column</h1>
                {this.props.isEditingBlurred ? (
                    <ColorDisplayRow
                        title1="Background"
                        hex1={this.state.currentTheme.secondaryBlurredColor}
                        varTitle1="secondaryBlurredColor"
                        currentTheme={this.props.currentTheme}
                        allThemes={this.props.allThemes}
                    />
                ) : (
                    <>
                        <ColorDisplayRow
                            title1="Top and Bottom"
                            title2="Middle"
                            hex1={this.state.currentTheme.secondaryColor}
                            varTitle1="secondaryColor"
                            hex4={this.state.currentTheme.backgroundColor}
                            varTitle4="backgroundColor"
                            currentTheme={this.props.currentTheme}
                            allThemes={this.props.allThemes}
                        />
                        <ColorDisplayRow
                            title1="Primary Text"
                            title2="Secondary"
                            hex1={this.state.currentTheme.rightSidePrimaryColor}
                            varTitle1="rightSidePrimaryColor"
                            hex4={this.state.currentTheme.rightSideSecondaryColor}
                            varTitle4="rightSideSecondaryColor"
                            currentTheme={this.props.currentTheme}
                            allThemes={this.props.allThemes}
                        />
                        <ColorDisplayRow
                            title1="Incoming Message"
                            title2="Outgoing Message"
                            hex1={this.state.currentTheme.incomingMessageColor}
                            varTitle1="incomingMessageColor"
                            hex2={this.state.currentTheme.incomingMessageTextColor}
                            varTitle2="incomingMessageTextColor"
                            hex4={this.state.currentTheme.outgoingMessageColor}
                            varTitle4="outgoingMessageColor"
                            hex5={this.state.currentTheme.outgoingMessageTextColor}
                            varTitle5="outgoingMessageTextColor"
                            currentTheme={this.props.currentTheme}
                            allThemes={this.props.allThemes}
                        />
                        <ColorDisplayRow
                            title1="Attachment Button"
                            title2="Send Button"
                            hex1={this.state.currentTheme.attachmentButtonColor}
                            varTitle1="attachmentButtonColor"
                            hex2={this.state.currentTheme.attachmentClipColor}
                            varTitle2="attachmentClipColor"
                            hex4={this.state.currentTheme.sendButtonColor}
                            varTitle4="sendButtonColor"
                            hex5={this.state.currentTheme.sendArrowColor}
                            varTitle5="sendArrowColor"
                            currentTheme={this.props.currentTheme}
                            allThemes={this.props.allThemes}
                        />
                        <ColorDisplayRow
                            title1="In Chat Labels"
                            title2="Accent Title"
                            hex1={this.state.currentTheme.chatLabelColor}
                            varTitle1="chatLabelColor"
                            hex4={this.state.currentTheme.rightSideDetailsTitleColor}
                            varTitle4="rightSideDetailsTitleColor"
                            currentTheme={this.props.currentTheme}
                            allThemes={this.props.allThemes}
                        />
                    </>
                )}
            </div>
        );
    }
}

export default ThemeConfigDisplay;
