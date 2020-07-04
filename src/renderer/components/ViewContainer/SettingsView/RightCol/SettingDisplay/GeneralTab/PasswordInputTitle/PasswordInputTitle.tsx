import * as React from "react";
import "./PasswordInputTitle.css";
import { ipcRenderer } from "electron";

type PasswordInputTitleState = {
    // title: string;
    // subTitle: string;
    enteredPassword: string;
};

type PasswordInputTitleProps = {
    title: string;
    subTitle?: string;
};

class PasswordInputTitle extends React.Component<PasswordInputTitleProps, PasswordInputTitleState> {
    constructor(props) {
        super(props);

        this.state = {
            // title: "",
            // subTitle: "",
            enteredPassword: ""
        };
    }

    async componentDidMount() {
        const config = await ipcRenderer.invoke("get-config");
        this.setState({ enteredPassword: config.passphrase }); // change to password

        const input = document.getElementById("passwordInput");

        input.addEventListener("keyup", event => {
            // Number 13 is the "Enter" key on the keyboard
            if (event.keyCode === 13) {
                event.preventDefault();
                input.blur();
            }
        });
    }

    handlePasswordChange = event => {
        this.setState({
            enteredPassword: event.target.value
        });
    };

    handleSubmit = () => {
        const config = { enteredPassword: this.state.enteredPassword };
        console.log(`Saved password: ${this.state.enteredPassword}`);
        ipcRenderer.invoke("set-config", config);
    };

    render() {
        return (
            <div className="PasswordInputTitle">
                <h2>{this.props.title}</h2>
                <input
                    id="passwordInput"
                    value={this.state.enteredPassword}
                    onChange={this.handlePasswordChange}
                    onBlur={this.handleSubmit}
                    placeholder={this.state.enteredPassword}
                />
            </div>
        );
    }
}

export default PasswordInputTitle;
