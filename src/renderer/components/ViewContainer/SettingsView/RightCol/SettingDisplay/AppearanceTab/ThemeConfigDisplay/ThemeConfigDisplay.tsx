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
                        <ColorDisplayRow title1="Sidebar" hex1={this.state.currentTheme.sidebarBlurredColor} />
                    </>
                ) : (
                    <>
                        <ColorDisplayRow
                            title1="Title Bar"
                            title2="Search Bar"
                            hex1={this.state.currentTheme.titleBarCloseColor}
                            hex2={this.state.currentTheme.titleBarMinimizeColor}
                            hex3={this.state.currentTheme.titleBarMaximizeColor}
                            hex4={this.state.currentTheme.searchBackgroundColor}
                            hex5={this.state.currentTheme.searchPlaceholderColor}
                        />
                        <ColorDisplayRow
                            title1="New Chat Button"
                            title2="Background"
                            hex1={this.state.currentTheme.newChatButtonColor}
                            hex5={this.state.currentTheme.sidebarColor}
                        />
                        <ColorDisplayRow
                            title1="Active Chat"
                            title2="Chat Title"
                            hex1={this.state.currentTheme.blueColor}
                            hex4={this.state.currentTheme.mainTitleColor}
                        />
                        <ColorDisplayRow title1="Secondary" hex1={this.state.currentTheme.subTitleColor} />
                    </>
                )}
                <h1 className="aAreaLocationTitle">Right Column</h1>
                {this.props.isEditingBlurred ? (
                    <ColorDisplayRow title1="Background" hex1={this.state.currentTheme.secondaryBlurredColor} />
                ) : (
                    <>
                        <ColorDisplayRow
                            title1="Top and Bottom"
                            title2="Middle"
                            hex1={this.state.currentTheme.secondaryColor}
                            hex4={this.state.currentTheme.backgroundColor}
                        />
                        <ColorDisplayRow
                            title1="Primary Text"
                            title2="Secondary"
                            hex1={this.state.currentTheme.rightSidePrimaryColor}
                            hex4={this.state.currentTheme.rightSideSecondaryColor}
                        />
                        <ColorDisplayRow
                            title1="Incoming Message"
                            title2="Outgoing Message"
                            hex1={this.state.currentTheme.incomingMessageColor}
                            hex2={this.state.currentTheme.incomingMessageTextColor}
                            hex4={this.state.currentTheme.outgoingMessageColor}
                            hex5={this.state.currentTheme.outgoingMessageTextColor}
                        />
                        <ColorDisplayRow
                            title1="Attachment Button"
                            title2="Send Button"
                            hex1={this.state.currentTheme.attachmentButtonColor}
                            hex2={this.state.currentTheme.attachmentClipColor}
                            hex4={this.state.currentTheme.sendButtonColor}
                            hex5={this.state.currentTheme.sendArrowColor}
                        />
                        <ColorDisplayRow title1="In Chat Labels" hex1={this.state.currentTheme.chatLabelColor} />
                    </>
                )}
            </div>
        );
    }
}

export default ThemeConfigDisplay;
