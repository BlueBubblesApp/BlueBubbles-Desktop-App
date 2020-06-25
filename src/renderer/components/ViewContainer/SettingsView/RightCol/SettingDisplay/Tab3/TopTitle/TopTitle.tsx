import * as React from 'react';
import './TopTitle.css';

type TopTitleProps = {
    title: string;
};

const TopTitle = ({ title }: TopTitleProps) => (
    <div className="TopTitle">
        <h1>{title}</h1>
    </div>
);

export default TopTitle;
