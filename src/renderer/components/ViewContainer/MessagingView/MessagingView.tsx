import * as React from "react";

import { Config } from "@renderer/helpers/configSingleton";

import LeftCol from "./LeftCol/LeftCol";
import RightCol from "./RightCol/RightCol";
import "./MessagingView.css";

class MessagingView extends React.Component {
    constructor(props) {
        super(props);
        Config().refresh();
    }

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
