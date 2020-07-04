import * as React from "react";
import "./LeftCol.css";
import LeftTopNav from "./TopNav/LeftTopNav";
import LeftConversationNav from "./ConversationsNav/LeftConversationsNav";
import BottomLeftNav from "./BottomNav/BottomLeftNav";
import { ipcRenderer } from "electron";

interface LeftColProps{
    theme: string;
}

class LeftCol extends React.Component<object, LeftColProps> {
    constructor(props){
        super(props)

        this.state = {
            theme: ""
        }
    }

    async componentDidMount(){
        const config = await ipcRenderer.invoke("get-config")
        this.setState({theme: config.theme})

        ipcRenderer.on("config-update", (_, args) => {
            this.setState({theme: args.theme});
        });
    }
    render() {
        return (
            <div className="LeftCol-Mes" data-theme={this.state.theme}>
                <LeftTopNav />
                <LeftConversationNav />
                <BottomLeftNav />
            </div>
        );
    }
}

export default LeftCol;
