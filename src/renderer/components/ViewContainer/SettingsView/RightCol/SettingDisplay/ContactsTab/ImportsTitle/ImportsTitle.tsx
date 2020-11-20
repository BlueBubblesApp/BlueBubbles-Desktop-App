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

    async handleChangeImportLocation(checkbox) {
        if (checkbox === "fromServerDB") {
            const newConfig = { importContactsFrom: "serverDB" };
            this.setState({ importContactsFrom: "serverDB" });
            await ipcRenderer.invoke("set-config", newConfig);
            await ipcRenderer.invoke("import-contacts", "serverDB");
        } else if (checkbox === "fromServerVCF") {
            const newConfig = { importContactsFrom: "serverVCF" };
            this.setState({ importContactsFrom: "serverVCF" });
            await ipcRenderer.invoke("set-config", newConfig);
            await ipcRenderer.invoke("import-contacts", "serverVCF");
        } else if (checkbox === "fromAndroid") {
            const newConfig = { importContactsFrom: "androidClient" };
            this.setState({ importContactsFrom: "androidClient" });
            await ipcRenderer.invoke("set-config", newConfig);
            await ipcRenderer.invoke("import-contacts", "androidClient");
        } else if (checkbox === "fromLocalVCF") {
            const newConfig = { importContactsFrom: "localVCF" };
            this.setState({ importContactsFrom: "localVCF" });
            await ipcRenderer.invoke("set-config", newConfig);
            await ipcRenderer.invoke("import-contacts", "localVCF");
        }
    }

    render() {
        return (
            <div className="ImportsTitle">
                <h2>{this.props.title}</h2>
                <div className="importsSubTitle">
                    <h3>Server DB</h3>
                    <label className="form-switch" onClick={e => this.handleChangeImportLocation("fromServerDB")}>
                        <input
                            id="fromServerDBCheckbox"
                            type="checkbox"
                            checked={this.state.importContactsFrom === "serverDB"}
                            onChange={e => this.handleChangeImportLocation("fromServerDB")}
                        />
                        <i />
                    </label>
                </div>
                <div className="importsSubTitle">
                    <h3>Server VCF</h3>
                    <label className="form-switch" onClick={e => this.handleChangeImportLocation("fromServerVCF")}>
                        <input
                            id="fromServerVCFCheckbox"
                            type="checkbox"
                            checked={this.state.importContactsFrom === "serverVCF"}
                            onChange={e => this.handleChangeImportLocation("fromServerVCF")}
                        />
                        <i />
                    </label>
                </div>
                <div className="importsSubTitle">
                    <h3>Android Client (Not yet working)</h3>
                    <label className="form-switch" onClick={e => this.handleChangeImportLocation("fromAndroid")}>
                        <input
                            id="fromAndroidCheckbox"
                            type="checkbox"
                            checked={this.state.importContactsFrom === "androidClient"}
                            onChange={e => this.handleChangeImportLocation("fromAndroid")}
                        />
                        <i />
                    </label>
                </div>
                <div className="importsSubTitle">
                    <h3>Local VCF (Not yet working)</h3>
                    <label className="form-switch" onClick={e => this.handleChangeImportLocation("fromLocalVCF")}>
                        <input
                            id="fromLocalVCFCheckbox"
                            type="checkbox"
                            checked={this.state.importContactsFrom === "localVCF"}
                            onChange={e => this.handleChangeImportLocation("fromLocalVCF")}
                        />
                        <i />
                    </label>
                </div>
            </div>
        );
    }
}

export default ImportsTitle;
