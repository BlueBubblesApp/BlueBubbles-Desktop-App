import * as React from "react";
import "./ClientTitle.css";

type SettingTitleProps = {
    title: string;
    subTitle: string;
};

const ClientTitle = ({ title, subTitle }: SettingTitleProps) => (
    <div className="SettingTitle">
        <h2>{title}</h2>
        <h3>{subTitle}</h3>
    </div>
);

export default ClientTitle;
