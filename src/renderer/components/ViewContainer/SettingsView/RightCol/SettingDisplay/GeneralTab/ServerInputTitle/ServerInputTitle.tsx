import * as React from "react";
import { ipcRenderer } from "electron";
import "./ServerInputTitle.css";

type ServerInputTitleState = {
    enteredServer: string;
};

type InputTitleProps = {
    title: string;
    subTitle?: string;
};

class ServerInputTitle extends React.Component<InputTitleProps, ServerInputTitleState> {
    constructor(props) {
        super(props);

        this.state = {
            enteredServer: ""
        };
    }

    async componentDidMount() {
        const config = await ipcRenderer.invoke("get-config");
        this.setState({ enteredServer: config.serverAddress });

        const input = document.getElementById("serverInput");

        input.addEventListener("keyup", event => {
            // Number 13 is the "Enter" key on the keyboard
            if (event.keyCode === 13) {
                event.preventDefault();
                input.blur();
            }
        });
    }

    handleServerChange = event => {
        this.setState({
            enteredServer: event.target.value
        });
    };

    handleSubmit = () => {
        const config = { enteredServer: this.state.enteredServer };
        console.log(`Saved server: ${this.state.enteredServer}`);
        ipcRenderer.invoke("set-config", config);
    };

    render() {
        return (
            <div className="ServerInputTitle">
                <h2>{this.props.title}</h2>
                <input
                    id="serverInput"
                    value={this.state.enteredServer}
                    onChange={this.handleServerChange}
                    onBlur={this.handleSubmit}
                    placeholder={this.state.enteredServer}
                />
            </div>
        );
    }
}

export default ServerInputTitle;
