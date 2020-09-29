/* eslint-disable react/prefer-stateless-function */
import * as React from "react";
import "./ContactsTab.css";
import ImportsTitle from "./ImportsTitle/ImportsTitle";
import ManageContacts from "./ManageContacts/ManageContacts";

class ContactsTab extends React.Component<unknown, unknown> {
    render() {
        return (
            <div className="ContactsTab">
                <div id="ContactsTitle">
                    <h1>Contacts</h1>
                </div>
                <ImportsTitle title="Contacts Import Location" />
                <ManageContacts />
            </div>
        );
    }
}

export default ContactsTab;
