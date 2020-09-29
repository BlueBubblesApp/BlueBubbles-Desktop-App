/* eslint-disable class-methods-use-this */
/* eslint-disable react/no-unused-state */
/* eslint-disable max-len */
import * as React from "react";
import { Chat, Handle } from "@server/databases/chat/entity";
import { getiMessageNumberFormat } from "@renderer/helpers/utils";
import CloseIcon from "@renderer/components/TitleBar/close.png";

import "./NewMessageTopNav.css";
import { ipcRenderer } from "electron";

type State = {
    chat: Chat;
    newRecipInput: string;
    newChatRecips: Array<string>;
    contacts: Array<Handle>;
    activeContactHoverNumber: number;
};

class NewMessageTopNav extends React.Component<unknown, State> {
    state = {
        chat: null,
        newRecipInput: "",
        newChatRecips: [],
        contacts: [],
        activeContactHoverNumber: 0
    };

    async componentDidMount() {
        document.getElementById("newMessageRecipInput").focus();

        this.setState({ contacts: await ipcRenderer.invoke("get-handles") });
        this.state.contacts.forEach(element => {
            console.log(element.address);
        });

        // Prevent from moving cursor in input
        document.getElementById("newMessageRecipInput").addEventListener(
            "keydown",
            e => {
                if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
            },
            false
        );
    }

    inputChangeHandler(e) {
        this.setState({ newRecipInput: e.target.value, activeContactHoverNumber: 0 });
    }

    removeRecipFromNewChat(recipToRemove) {
        this.setState({ newChatRecips: this.state.newChatRecips.filter(recip => recip !== recipToRemove) });
    }

    handleKeydown(e) {
        // Back Arrow
        if (this.state.newRecipInput.length === 0 && e.keyCode === 8) {
            const { newChatRecips } = this.state;
            newChatRecips.splice(-1, 1);
            this.setState({ newChatRecips });
            document.getElementById("newMessageRecipInput").focus();
        }

        // Down Arrow
        if (e.keyCode === 40) {
            const matchingRows = document.getElementsByClassName("aMatchingContactRow");

            if (this.state.activeContactHoverNumber === 0) {
                matchingRows.item(this.state.activeContactHoverNumber).classList.add("activeContactRow");
                this.setState({ activeContactHoverNumber: 1 });
                return;
            }

            if (this.state.activeContactHoverNumber > 0 && this.state.activeContactHoverNumber < matchingRows.length) {
                matchingRows.item(this.state.activeContactHoverNumber - 1).classList.remove("activeContactRow");
                matchingRows.item(this.state.activeContactHoverNumber).classList.add("activeContactRow");
                this.setState({ activeContactHoverNumber: this.state.activeContactHoverNumber + 1 });
            }
        }

        // Up Arrow
        if (e.keyCode === 38) {
            const matchingRows = document.getElementsByClassName("aMatchingContactRow");
            if (this.state.activeContactHoverNumber === 0) {
                return;
            }
            if (this.state.activeContactHoverNumber === 1) {
                matchingRows.item(0).classList.remove("activeContactRow");
                this.setState({ activeContactHoverNumber: 0 });
                return;
            }
            if (this.state.activeContactHoverNumber > 1 && this.state.activeContactHoverNumber <= matchingRows.length) {
                this.setState({ activeContactHoverNumber: this.state.activeContactHoverNumber - 1 });
                try {
                    matchingRows.item(this.state.activeContactHoverNumber - 2).classList.add("activeContactRow");
                } catch (err) {
                    // Do Nothing
                }
                matchingRows.item(this.state.activeContactHoverNumber - 1).classList.remove("activeContactRow");
                matchingRows.item(this.state.activeContactHoverNumber).classList.remove("activeContactRow");
                return;
            }
        }

        // Enter Key
        if (e.keyCode === 13) {
            const newMatch = this.state.contacts.filter(
                name =>
                    name.firstName?.toLowerCase().includes(this.state.newRecipInput.toLowerCase()) ||
                    name.lastName?.toLowerCase().includes(this.state.newRecipInput.toLowerCase()) ||
                    name.address?.toLowerCase().includes(this.state.newRecipInput.toLowerCase())
            );
            this.handleAddRecipToNewChat(newMatch[this.state.activeContactHoverNumber - 1]);
        }
    }

    formatAddress(address: string) {
        if (address.includes("@")) {
            return address;
        }
        if (address.substr(0, 1) === "+") {
            return `${address.substr(0, 2)}(${address.substr(2, 3)})-${address.substr(5, 3)}-${address.substr(8, 4)}`;
        }
        return `(${address.substr(0, 3)})-${address.substr(3, 3)}-${address.substr(6, 4)}`;
    }

    handleAddRecipToNewChat(handle: Handle) {
        let nameToAdd = "";
        if (handle.firstName != null && handle.lastName != null) {
            nameToAdd = `${handle.firstName} ${handle.lastName}`;
        } else if (handle.firstName != null && handle.lastName === null) {
            nameToAdd = handle.firstName;
        } else if (handle.firstName === null && handle.lastName != null) {
            nameToAdd = handle.lastName;
        } else if (handle.firstName === null && handle.lastName === null) {
            nameToAdd = this.formatAddress(handle.address);
        }

        const { newChatRecips } = this.state;
        if (newChatRecips.indexOf(nameToAdd) === -1) {
            newChatRecips.push(nameToAdd);
            this.setState({ newChatRecips, newRecipInput: "" });
            document.getElementById("newMessageRecipInput").focus();
        } else {
            this.setState({ newRecipInput: "" });
            document.getElementById("newMessageRecipInput").focus();
        }
    }

    render() {
        const { chat, contacts, newRecipInput } = this.state;

        let x = "No recipients";
        if (this.state.newRecipInput.length > 0 || this.state.newChatRecips.length > 0) {
            x = "";
        }

        const participants = (chat?.participants ?? []).map(handle => {
            const hasContact = false;
            if (hasContact) {
                // TODO: get the contact
                return handle.address;
            }

            return getiMessageNumberFormat(handle.address);
        });

        return (
            <div className="RightTopNav">
                <div id="toDiv-NewMessage">
                    <p>To:</p>
                </div>
                <div id="recipDiv-NewMessage">
                    {this.state.newChatRecips.length > 0 ? (
                        <>
                            {this.state.newChatRecips.map(recip => {
                                return (
                                    <div key={recip}>
                                        <p>{recip}</p>
                                        <img
                                            onClick={() => this.removeRecipFromNewChat(recip)}
                                            src={CloseIcon}
                                            className="removeChatRecip"
                                            alt="remove"
                                        />
                                    </div>
                                );
                            })}
                        </>
                    ) : null}
                    <input
                        value={newRecipInput}
                        onKeyDown={e => this.handleKeydown(e)}
                        onChange={e => this.inputChangeHandler(e)}
                        placeholder={x}
                        id="newMessageRecipInput"
                    />
                </div>
                {newRecipInput.length > 0 ? (
                    <div id="NewMessageContactRecommendation">
                        {this.state.contacts.length > 0 ? (
                            <>
                                {this.state.contacts
                                    .filter(
                                        name =>
                                            name.firstName
                                                ?.toLowerCase()
                                                .includes(this.state.newRecipInput.toLowerCase()) ||
                                            name.lastName
                                                ?.toLowerCase()
                                                .includes(this.state.newRecipInput.toLowerCase()) ||
                                            name.address?.toLowerCase().includes(this.state.newRecipInput.toLowerCase())
                                    )
                                    .map(filteredHandle => (
                                        <div
                                            className="aMatchingContactRow"
                                            onClick={() => this.handleAddRecipToNewChat(filteredHandle)}
                                            key={filteredHandle.address}
                                        >
                                            <p>{filteredHandle.firstName || ""}</p>
                                            <p>{filteredHandle.lastName || ""}</p>
                                            <p>{this.formatAddress(filteredHandle.address) || ""}</p>
                                        </div>
                                    ))}
                            </>
                        ) : null}
                    </div>
                ) : null}
            </div>
        );
    }
}

export default NewMessageTopNav;
