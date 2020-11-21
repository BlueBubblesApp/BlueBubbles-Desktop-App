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
    leftTitlebar: boolean;
    useNativeTitlebar: boolean;
};

class TitlebarTitle extends React.Component<Props, State> {
    constructor(props) {
        super(props);

        this.state = {
            leftTitlebar: false,
            useNativeTitlebar: false
        };
    }

    async componentDidMount() {
        const config = await ipcRenderer.invoke("get-config");
        this.setState({
            leftTitlebar: config.leftTitlebar,
            useNativeTitlebar: config.useNativeTitlebar
        });

        console.log(config);
    }

    async handleLeftTitlebar() {
        const newConfig = { leftTitlebar: !this.state.leftTitlebar };
        await ipcRenderer.invoke("set-config", newConfig);
        this.setState({ leftTitlebar: !this.state.leftTitlebar });
        ipcRenderer.emit("titlebar-update");
    }

    async handleUseNativeTitlebar() {
        const newConfig = { useNativeTitlebar: !this.state.useNativeTitlebar };
        await ipcRenderer.invoke("set-config", newConfig);
        ipcRenderer.invoke("change-window-titlebar", { withFrame: !this.state.useNativeTitlebar });
        this.setState({ useNativeTitlebar: !this.state.useNativeTitlebar });
    }

    render() {
        return (
            <div className="AppTitle">
                <h2>{this.props.title}</h2>
                {this.state.useNativeTitlebar ? (
                    <div>
                        <p>Use Native Titlebar</p>
                        <label className="form-switch" onClick={() => this.handleUseNativeTitlebar()}>
                            <input
                                type="checkbox"
                                checked={this.state.useNativeTitlebar}
                                onChange={() => this.handleUseNativeTitlebar()}
                            />
                            <i />
                        </label>
                    </div>
                ) : (
                    <>
                        <div>
                            <p>Titlebar Buttons On Left Side</p>
                            <label className="form-switch" onClick={() => this.handleLeftTitlebar()}>
                                <input
                                    type="checkbox"
                                    checked={this.state.leftTitlebar}
                                    onChange={() => this.handleLeftTitlebar()}
                                />
                                <i />
                            </label>
                        </div>
                        <div>
                            <p>Use Native Titlebar</p>
                            <label className="form-switch" onClick={() => this.handleUseNativeTitlebar()}>
                                <input
                                    type="checkbox"
                                    checked={this.state.useNativeTitlebar}
                                    onChange={() => this.handleUseNativeTitlebar()}
                                />
                                <i />
                            </label>
                        </div>
                    </>
                )}
            </div>
        );
    }
}

export default TitlebarTitle;
