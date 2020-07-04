import * as React from 'react';
import './SettingTitle.css';

type SettingTitleProps = {
    title: string;
    subTitle: string;
};

const SettingTitle = ({ title, subTitle }: SettingTitleProps) => (
    <div className="SettingTitle">
        <h2>{title}</h2>
        <h3>{subTitle}</h3>
    </div>
);

export default SettingTitle;
