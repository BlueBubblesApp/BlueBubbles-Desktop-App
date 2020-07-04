import * as React from "react";
import LeftCol from "./LeftCol/LeftCol";
import RightCol from "./RightCol/RightCol";
import "./MessagingView.css";
import { ipcRenderer } from "electron";

interface MessagingViewProps{
    theme: string;
}


class MessagingView extends React.Component<object, MessagingViewProps> {
    constructor(props){
        super(props)

        this.state = {
            theme: ""
        }
    }

    async componentDidMount() {
        document.getElementById("TitleBarRight").classList.remove("loginTitleBarRight");
        // document.getElementById("TitleBarRight").classList.add("messagingTitleBarRight");\
        const config = await ipcRenderer.invoke("get-config")
        this.setState({theme: config.theme})

        ipcRenderer.on("config-update", (_, args) => {
            this.setState({theme: args.theme});
        });
    }

    render() {
        return (
            <div className="MessagingView" data-theme={this.state.theme}>
                <LeftCol />
                <RightCol />
            </div>
        );
    }
}

export default MessagingView;