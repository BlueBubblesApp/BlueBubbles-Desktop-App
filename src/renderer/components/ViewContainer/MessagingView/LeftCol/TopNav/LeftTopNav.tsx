/* eslint-disable class-methods-use-this */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable max-len */
import * as React from "react";
import { ipcRenderer } from "electron";
import "./LeftTopNav.css";
import { Link } from "react-router-dom";
import CloseIcon from "@renderer/components/TitleBar/close.png";
import ComposeIcon from "../../../../../assets/icons/compose-icon.png";

interface LeftTopNavState {
    enteredSearch: string;
}

class LeftTopNav extends React.Component<object, LeftTopNavState> {
    constructor(props) {
        super(props);

        this.state = {
            // eslint-disable-next-line react/no-unused-state
            enteredSearch: ""
        };
    }

    componentDidMount() {
        ipcRenderer.on("focused", (_, args) => {
            try {
                document.getElementsByClassName("LeftTopNav-Mes")[0].classList.remove("LeftTopNav-Mes-Blurred");
            } catch {
                /* Nothing */
            }
        });

        ipcRenderer.on("blurred", (_, args) => {
            try {
                document.getElementsByClassName("LeftTopNav-Mes")[0].classList.add("LeftTopNav-Mes-Blurred");
            } catch {
                /* Nothing */
            }
        });
    }

    handleSearchInput(e) {
        this.setState({ enteredSearch: e.target.value });
        ipcRenderer.invoke("send-to-ui", { event: "send-chat-search-string", contents: e.target.value });
    }

    handleNewMessage() {
        ipcRenderer.invoke("send-to-ui", { event: "remove-active-chat" });
        ipcRenderer.invoke("send-to-ui", { event: "set-current-chat", contents: null });
    }

    resetSearchString() {
        this.setState({ enteredSearch: "" });
        ipcRenderer.invoke("send-to-ui", { event: "send-chat-search-string", contents: "" });
    }

    render() {
        return (
            <div className="LeftTopNav-Mes">
                <div id="leftTopSearch">
                    <input
                        id="messageSearch"
                        type="text"
                        name="search"
                        placeholder="Search"
                        value={this.state.enteredSearch}
                        onChange={e => this.handleSearchInput(e)}
                    />
                    {this.state.enteredSearch.length > 0 ? (
                        <img id="resetSearchString" src={CloseIcon} onClick={() => this.resetSearchString()} />
                    ) : null}
                </div>
                <div className="leftTopButton">
                    <div id="newMessage" onClick={this.handleNewMessage}>
                        <img id="composeIcon" src={ComposeIcon} alt="compose" />
                    </div>
                </div>
            </div>
        );
    }
}

export default LeftTopNav;
