import * as React from "react";
import "./RightCol.css";
import { ipcRenderer } from "electron";
import SettingDisplay from "./SettingDisplay/SettingDisplay";

interface RightColProps {
    theme: string;
}

class RightCol extends React.Component<object, RightColProps> {
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
            <div className="RightCol-Set" data-theme={this.state.theme}>
                <SettingDisplay />
            </div>
        );
    }
}

export default RightCol;
