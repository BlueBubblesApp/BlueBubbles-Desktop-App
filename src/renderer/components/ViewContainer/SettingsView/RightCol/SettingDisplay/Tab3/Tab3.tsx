import * as React from 'react';
import './Tab3.css';
import TopTitle from './TopTitle/TopTitle';
import SettingTitle from './SettingTitle/SettingTitle';

//Not working
//import settings from "electron-settings";

const obj = {
    color: {
        name: 'test',
        code: '#FFFFFF'
    }
};

function Tab3() {
    function changeSetting() {
        //Not Working
        // console.log(settings.get('color.name'));
    }

    return (
        <div className="Tab3">
            <TopTitle title="Themes"></TopTitle>
            <button id="testButton" style={{ backgroundColor: 'red' }} onClick={changeSetting}>
                Change Setting
            </button>
        </div>
    );
}

export default Tab3;
