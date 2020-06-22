import React from 'react';
import './Tab4.css';
import SettingTitle from './SettingTitle/SettingTitle';
import TopTitle from './TopTitle/TopTitle';

function Tab4() {
  return (
    <div className="Tab4">
        <TopTitle title="About"></TopTitle>
        <SettingTitle title="Version" subTitle="alpha"></SettingTitle>
        <SettingTitle title="Developers" subTitle="open source"></SettingTitle>
    </div>
  );
}

export default Tab4;
