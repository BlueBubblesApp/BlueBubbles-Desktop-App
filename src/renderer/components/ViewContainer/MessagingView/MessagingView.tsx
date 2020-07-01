import * as React from "react";
import "./MessagingView.css";
import LeftCol from "./LeftCol/LeftCol";
import RightCol from "./RightCol/RightCol";

class MessagingView extends React.Component {
    componentDidMount(){
        document.getElementById("TitleBarRight").classList.remove("loginTitleBarRight")
        document.getElementById("TitleBarRight").classList.add("messagingTitleBarRight")
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
