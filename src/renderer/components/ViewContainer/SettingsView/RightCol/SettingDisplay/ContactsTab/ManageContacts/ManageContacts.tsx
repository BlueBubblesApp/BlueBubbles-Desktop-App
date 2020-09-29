import { Handle } from "@server/databases/chat/entity";
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/no-unused-state */
/* eslint-disable class-methods-use-this */
import { ipcRenderer } from "electron";
/* eslint-disable max-len */
/* eslint-disable jsx-a11y/label-has-associated-control */
import * as React from "react";
import { render } from "react-dom";
import "./ManageContacts.css";

interface Contact {
    avatar?: string;
    address: string;
    firstName: string;
    lastName: string;
}

type State = {
    importContactsFrom: string;
    contacts: Array<Handle>;
};

class ManageContacts extends React.Component<unknown, State> {
    constructor(props) {
        super(props);

        this.state = {
            importContactsFrom: "",
            contacts: []
        };
    }

    async componentDidMount() {
        const config = await ipcRenderer.invoke("get-config");
        this.setState({ contacts: await ipcRenderer.invoke("get-handles") });

        // this.setState({
        //     importContactsFrom: config.importContactsFrom
        // });
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

    render() {
        return (
            <div id="ManageContacts">
                <h1>Manage Contacts</h1>
                <div id="ManageContactsHeader">
                    <div>
                        <h2>Avatar</h2>
                        <h2>Number</h2>
                        <h2>First Name</h2>
                        <h2>Last Name</h2>
                    </div>
                    {/* <div>
                        <h2>Avatar</h2>
                    </div> */}
                </div>
                <div id="ManageContactsContainer">
                    {this.state.contacts.length === 0 ? (
                        <div className="aContactRow">
                            <p className="aContactField">No Contacts Synced</p>
                        </div>
                    ) : (
                        <>
                            {this.state.contacts.map(contact => {
                                return (
                                    <div className="aContactRow" key={contact.address}>
                                        <div className="avatarCol">
                                            {contact.avatar ? (
                                                <img src={contact.avatar} />
                                            ) : (
                                                <p className="aContactField">None</p>
                                            )}
                                        </div>
                                        <div className="numberCol">
                                            <input
                                                className="aContactField"
                                                value={this.formatAddress(contact.address)}
                                            />
                                        </div>
                                        <div className="firstNameCol">
                                            <input className="aContactField" value={contact.firstName} />
                                        </div>
                                        <div className="lastNameCol">
                                            <input className="aContactField" value={contact.lastName} />
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>
            </div>
        );
    }
}

export default ManageContacts;
