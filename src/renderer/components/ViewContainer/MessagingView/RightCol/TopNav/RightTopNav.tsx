import * as React from 'react';
import './RightTopNav.css';

function RightTopNav() {
    return (
        <div className="RightTopNav">
            <div id="toDiv">
                <p>To:</p>
            </div>
            <div id="recipDiv">
                <div>
                    <p>+1(703) 201-7026</p>
                </div>
            </div>
            <div id="convoDetailsDiv">
                <p>Details</p>
            </div>
        </div>
    );
}

export default RightTopNav;
