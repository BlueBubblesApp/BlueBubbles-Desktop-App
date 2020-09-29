/* eslint-disable class-methods-use-this */
import { ipcRenderer } from "electron";
/* eslint-disable max-len */
/* eslint-disable jsx-a11y/label-has-associated-control */
import * as React from "react";
import { render } from "react-dom";
import "./ImportsTitle.css";

type Props = {
    title: string;
};

type State = {
    importContactsFrom: string;
};

class ImportsTitle extends React.Component<Props, State> {
    constructor(props) {
        super(props);

        this.state = {
            importContactsFrom: ""
        };
    }

    async componentDidMount() {
        const config = await ipcRenderer.invoke("get-config");
        this.setState({
            importContactsFrom: config.importContactsFrom
        });

        const fromServerDBCheckbox: HTMLInputElement = document.getElementById(
            "fromServerDBCheckbox"
        ) as HTMLInputElement;
        const fromServerVCFCheckbox: HTMLInputElement = document.getElementById(
            "fromServerVCFCheckbox"
        ) as HTMLInputElement;
        const fromAndroidCheckbox: HTMLInputElement = document.getElementById(
            "fromAndroidCheckbox"
        ) as HTMLInputElement;
        const fromLocalVCFCheckbox: HTMLInputElement = document.getElementById(
            "fromLocalVCFCheckbox"
        ) as HTMLInputElement;

        if (this.state.importContactsFrom === "serverDB") {
            fromServerDBCheckbox.checked = true;
            fromServerVCFCheckbox.checked = false;
            fromLocalVCFCheckbox.checked = false;
            fromAndroidCheckbox.checked = false;
        } else if (this.state.importContactsFrom === "serverVCF") {
            fromServerDBCheckbox.checked = false;
            fromServerVCFCheckbox.checked = true;
            fromLocalVCFCheckbox.checked = false;
            fromAndroidCheckbox.checked = false;
        } else if (this.state.importContactsFrom === "androidClient") {
            fromServerDBCheckbox.checked = false;
            fromServerVCFCheckbox.checked = false;
            fromAndroidCheckbox.checked = true;
            fromLocalVCFCheckbox.checked = false;
        } else if (this.state.importContactsFrom === "localVCF") {
            fromServerDBCheckbox.checked = false;
            fromServerVCFCheckbox.checked = false;
            fromAndroidCheckbox.checked = false;
            fromLocalVCFCheckbox.checked = true;
        }
    }

    async handleChangeImportLocation(e) {
        const fromServerDBCheckbox: HTMLInputElement = document.getElementById(
            "fromServerDBCheckbox"
        ) as HTMLInputElement;
        const fromServerVCFCheckbox: HTMLInputElement = document.getElementById(
            "fromServerVCFCheckbox"
        ) as HTMLInputElement;
        const fromAndroidCheckbox: HTMLInputElement = document.getElementById(
            "fromAndroidCheckbox"
        ) as HTMLInputElement;
        const fromLocalVCFCheckbox: HTMLInputElement = document.getElementById(
            "fromLocalVCFCheckbox"
        ) as HTMLInputElement;

        if (e.target.id === "fromServerDBCheckbox") {
            const newConfig = { importContactsFrom: "serverDB" };
            this.setState({ importContactsFrom: "serverDB" });
            await ipcRenderer.invoke("set-config", newConfig);
            await ipcRenderer.invoke("import-contacts", "serverDB");
            fromServerVCFCheckbox.checked = false;
            fromAndroidCheckbox.checked = false;
            fromLocalVCFCheckbox.checked = false;
        } else if (e.target.id === "fromServerVCFCheckbox") {
            const newConfig = { importContactsFrom: "serverVCF" };
            this.setState({ importContactsFrom: "serverVCF" });
            await ipcRenderer.invoke("set-config", newConfig);
            await ipcRenderer.invoke("import-contacts", "serverVCF");
            fromServerDBCheckbox.checked = false;
            fromAndroidCheckbox.checked = false;
            fromLocalVCFCheckbox.checked = false;
        } else if (e.target.id === "fromAndroidCheckbox") {
            const newConfig = { importContactsFrom: "androidClient" };
            this.setState({ importContactsFrom: "androidClient" });
            await ipcRenderer.invoke("set-config", newConfig);
            await ipcRenderer.invoke("import-contacts", "androidClient");
            fromServerDBCheckbox.checked = false;
            fromServerVCFCheckbox.checked = false;
            fromLocalVCFCheckbox.checked = false;
        } else if (e.target.id === "fromLocalVCFCheckbox") {
            const newConfig = { importContactsFrom: "localVCF" };
            this.setState({ importContactsFrom: "localVCF" });
            await ipcRenderer.invoke("set-config", newConfig);
            await ipcRenderer.invoke("import-contacts", "localVCF");
            fromServerDBCheckbox.checked = false;
            fromServerVCFCheckbox.checked = false;
            fromAndroidCheckbox.checked = false;
        }
    }

    render() {
        return (
            <div className="ImportsTitle">
                <h2>{this.props.title}</h2>
                <div className="importsSubTitle">
                    <h3>Server DB</h3>
                    <label className="form-switch">
                        <input
                            id="fromServerDBCheckbox"
                            type="checkbox"
                            onClick={e => this.handleChangeImportLocation(e)}
                        />
                        <i />
                    </label>
                </div>
                <div className="importsSubTitle">
                    <h3>Server VCF</h3>
                    <label className="form-switch">
                        <input
                            id="fromServerVCFCheckbox"
                            type="checkbox"
                            onClick={e => this.handleChangeImportLocation(e)}
                        />
                        <i />
                    </label>
                </div>
                <div className="importsSubTitle">
                    <h3>Android Client (Not yet working)</h3>
                    <label className="form-switch">
                        <input
                            id="fromAndroidCheckbox"
                            type="checkbox"
                            onClick={e => this.handleChangeImportLocation(e)}
                        />
                        <i />
                    </label>
                </div>
                <div className="importsSubTitle">
                    <h3>Local VCF (Not yet working)</h3>
                    <label className="form-switch">
                        <input
                            id="fromLocalVCFCheckbox"
                            type="checkbox"
                            onClick={e => this.handleChangeImportLocation(e)}
                        />
                        <i />
                    </label>
                </div>
            </div>
        );
    }
}

export default ImportsTitle;
