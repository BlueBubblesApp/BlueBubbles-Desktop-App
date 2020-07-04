import * as React from "react";
import "./LeftCol.css";
import { ipcRenderer } from "electron";
import SettingTitles from "./SettingTitles/SettingTitles";
import LeftTopNav from "./TopNav/LeftTopNav";
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
    }

    render() {
        return (
            <div className="LeftCol-Set" data-theme={this.state.theme}>
                <LeftTopNav />
                <SettingTitles />
                <BottomLeftNav />
            </div>
        );
    }
}

export default LeftCol;
