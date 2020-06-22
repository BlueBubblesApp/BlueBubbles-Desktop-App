import React from 'react';
import './Setting.css';

type SettingProps = {
  title: string,
  subTitle: string
}

const Setting = ({title,subTitle}: SettingProps) =>
    <div className="Setting">
      <div id="SettingDiv">
        <h1>{title}</h1>
        <h2>{subTitle}</h2>
      </div>
    </div>;

export default Setting;
