import * as React from "react";
import { ipcRenderer } from "electron";

import LeftCol from "./LeftCol/LeftCol";
import RightCol from "./RightCol/RightCol";
import "./MessagingView.css";

class MessagingView extends React.Component {
    componentDidMount() {
        document.getElementById("TitleBarRight").classList.remove("loginTitleBarRight");
    }

    render() {
        return (
            <div className="MessagingView">
                <LeftCol />
                <RightCol />
            </div>
        );
    }
}

export default MessagingView;
