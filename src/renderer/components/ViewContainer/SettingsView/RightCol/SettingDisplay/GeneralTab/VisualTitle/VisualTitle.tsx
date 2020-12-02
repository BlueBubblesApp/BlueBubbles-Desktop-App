/* eslint-disable max-len */
/* eslint-disable react/no-unused-state */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/prefer-stateless-function */
import * as React from "react";
import { ipcRenderer } from "electron";

type Props = {
    title: string;
};

type State = {
    gradientMessages: boolean;
    colorfulContacts: boolean;
    colorfulChatBubbles: boolean;
    useNativeEmojis: boolean;
};

class VisualTitle extends React.Component<Props, State> {
    constructor(props) {
        super(props);

        this.state = {
            gradientMessages: false,
            colorfulContacts: false,
            colorfulChatBubbles: false,
            useNativeEmojis: false
        };
    }

    async componentDidMount() {
        const config = await ipcRenderer.invoke("get-config");
        this.setState({
            gradientMessages: config.gradientMessages,
            colorfulContacts: config.colorfulContacts,
            colorfulChatBubbles: config.colorfulChatBubbles,
            useNativeEmojis: config.useNativeEmojis
        });

        console.log(config);
    }

    async handleGradientMessages() {
        const newConfig = { gradientMessages: !this.state.gradientMessages };
        await ipcRenderer.invoke("set-config", newConfig);
        this.setState({ gradientMessages: !this.state.gradientMessages });
    }

    async handleColorfulContacts() {
        const newConfig = { colorfulContacts: !this.state.colorfulContacts };
        await ipcRenderer.invoke("set-config", newConfig);
        this.setState({ colorfulContacts: !this.state.colorfulContacts });
    }

    async handleColorfulChatBubbles() {
        const newConfig = { colorfulChatBubbles: !this.state.colorfulChatBubbles };
        await ipcRenderer.invoke("set-config", newConfig);
        this.setState({ colorfulChatBubbles: !this.state.colorfulChatBubbles });
    }

    async handleUseNativeEmojis() {
        const newConfig = { useNativeEmojis: !this.state.useNativeEmojis };
        await ipcRenderer.invoke("set-config", newConfig);
        this.setState({ useNativeEmojis: !this.state.useNativeEmojis });
    }

    render() {
        return (
            <div className="AppTitle">
                <h2>{this.props.title}</h2>
                <div>
                    <p>Scrolling Gradient On Messages</p>
                    <label className="form-switch" onClick={() => this.handleGradientMessages()}>
                        <input
                            type="checkbox"
                            checked={this.state.gradientMessages}
                            onChange={() => this.handleGradientMessages()}
                        />
                        <i />
                    </label>
                </div>
                <div>
                    <p>Colorful Contacts</p>
                    <label className="form-switch" onClick={() => this.handleColorfulContacts()}>
                        <input
                            type="checkbox"
                            checked={this.state.colorfulContacts}
                            onChange={() => this.handleColorfulContacts()}
                        />
                        <i />
                    </label>
                </div>
                <div>
                    <p>Colorful Chat Bubbles</p>
                    <label className="form-switch" onClick={() => this.handleColorfulChatBubbles()}>
                        <input
                            type="checkbox"
                            checked={this.state.colorfulChatBubbles}
                            onChange={() => this.handleColorfulChatBubbles()}
                        />
                        <i />
                    </label>
                </div>
                <div>
                    <p>Use Native Emojis</p>
                    <label className="form-switch" onClick={() => this.handleUseNativeEmojis()}>
                        <input
                            type="checkbox"
                            checked={this.state.useNativeEmojis}
                            onChange={() => this.handleUseNativeEmojis()}
                        />
                        <i />
                    </label>
                </div>
            </div>
        );
    }
}

export default VisualTitle;
