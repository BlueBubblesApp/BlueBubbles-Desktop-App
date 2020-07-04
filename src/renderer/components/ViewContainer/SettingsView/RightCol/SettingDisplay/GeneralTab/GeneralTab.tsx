import * as React from "react";
import "./GeneralTab.css";
import ServerInputTitle from "./ServerInputTitle/ServerInputTitle";
import PasswordInputTitle from "./PasswordInputTitle/PasswordInputTitle";

function GeneralTab() {
    return (
        <div id="GeneralTab">
            <div id="GeneralTitle">
                <h1>General</h1>
            </div>
            <ServerInputTitle title="Remote Server URL" />
            <PasswordInputTitle title="Remote Server Password" />
        </div>
    );
}

export default GeneralTab;
