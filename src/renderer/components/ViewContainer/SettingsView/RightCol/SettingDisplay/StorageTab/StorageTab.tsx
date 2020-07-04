import * as React from "react";
import "./StorageTab.css";
import SettingTitle from "./SettingTitle/SettingTitle";
import StorageInfo from "./StorageInfo/StorageInfo";

function StorageTab() {
    function QueryAppSize() {
        // Loop through all files, get each file size
        // and according to file type and location add the total size counts up
        // for the BaseApp, all Texts, and all Attachments and pass to <StorageInfo>
    }

    return (
        <div id="StorageTab">
            <div id="StorageTitle">
                <h1>Storage</h1>
            </div>
            <StorageInfo totalAppSize="243.6" totalBaseApp="35.6" totalTexts="42.6" totalAttachments="28.2" />
        </div>
    );
}

export default StorageTab;
