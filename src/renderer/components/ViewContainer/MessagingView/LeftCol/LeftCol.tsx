/* eslint-disable max-len */
import * as React from "react";
import "./LeftCol.css";
import { ipcRenderer } from "electron";
import LeftTopNav from "./TopNav/LeftTopNav";
import LeftConversationNav from "./ConversationsNav/LeftConversationsNav";
import BottomLeftNav from "./BottomNav/BottomLeftNav";

interface LeftColProps {
    theme: string;
}

class LeftCol extends React.Component<object, LeftColProps> {
    constructor(props) {
        super(props);

        this.state = {
            theme: ""
        };
    }

    async componentDidMount() {
        const config = await ipcRenderer.invoke("get-config");
        this.setState({ theme: config.theme });

        ipcRenderer.on("config-update", (_, args) => {
            this.setState({ theme: args.theme });
        });

        ipcRenderer.on("focused", (_, args) => {
            try{document.getElementsByClassName("LeftCol-Mes")[0].classList.remove("LeftCol-Mes-Blurred");} catch{/*Nothing*/}
            try{document.getElementsByClassName("RightTopNav")[0].classList.remove("RightTopNavBlurred");} catch{/*Nothing*/}
            try {
                document.getElementById("newMessageRecipInput").classList.remove("newMessageRecipInputBlurred");
                document
                    .getElementById("convoDetailsDiv")
                    .style.setProperty("--faded-div-color", "var(--secondary-color)");
            } catch {
                // Do nothing
            }
        });

        ipcRenderer.on("blurred", (_, args) => {
            try{document.getElementsByClassName("LeftCol-Mes")[0].classList.add("LeftCol-Mes-Blurred");} catch{/*Nothing*/}
            try{document.getElementsByClassName("RightTopNav")[0].classList.add("RightTopNavBlurred");} catch{/*Nothing*/}
            try {
                document.getElementById("newMessageRecipInput").classList.add("newMessageRecipInputBlurred");
                document
                    .getElementById("convoDetailsDiv")
                    .style.setProperty("--faded-div-color", "var(--secondary-blurred-color)");
            } catch {
                // Do nothing
            }
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
