import * as React from 'react';
import './Tab2.css';
import TopTitle from './TopTitle/TopTitle';
import SettingTitle from './SettingTitle/SettingTitle';
import StorageInfo from './StorageInfo/StorageInfo';

function Tab2() {
    function QueryAppSize() {
        //Loop through all files, get each file size
        //and according to file type and location add the total size counts up
        //for the BaseApp, all Texts, and all Attachments and pass to <StorageInfo>
    }

    return (
        <div className="Tab2">
            <TopTitle title="Storage"></TopTitle>
            <StorageInfo
                totalAppSize="243.6"
                totalBaseApp="35.6"
                totalTexts="42.6"
                totalAttachments="28.2"
            ></StorageInfo>
        </div>
    );
}

export default Tab2;
