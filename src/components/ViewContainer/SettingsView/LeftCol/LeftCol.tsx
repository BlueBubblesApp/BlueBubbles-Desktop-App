import React from 'react';
import './LeftCol.css';
import SettingTitles from './SettingTitles/SettingTitles';
import LeftTopNav from './TopNav/LeftTopNav';
import BottomLeftNav from './BottomNav/BottomLeftNav';


function LeftCol() {
  return (
    <div className="LeftCol">
        <LeftTopNav></LeftTopNav>
        <SettingTitles></SettingTitles>
        <BottomLeftNav></BottomLeftNav>
    </div>
  );
}

export default LeftCol;
