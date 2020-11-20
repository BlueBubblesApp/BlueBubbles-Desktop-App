/* eslint-disable class-methods-use-this */
/* eslint-disable react/no-unused-state */
/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable max-len */
/* eslint-disable react/prefer-stateless-function */
import * as React from "react";
import "./FontSizeSlider.css";
import { ipcRenderer } from "electron";

interface State {
    messageFontSize: string;
}

class FontSizeSlider extends React.Component<unknown, State> {
    constructor(props) {
        super(props);

        this.state = {
            messageFontSize: "12px"
        };
    }

    async componentDidMount() {
        const config = await ipcRenderer.invoke("get-config");
        this.setState({ messageFontSize: config.messageFontSize });

        this.setCSSProperty();
    }

    setCSSProperty = () => {
        const inputElement = document.getElementById("fontSliderInput") as HTMLInputElement;
        let percent =
            ((((inputElement.value as unknown) as number) - ((inputElement.min as unknown) as number)) /
                (((inputElement.max as unknown) as number) - ((inputElement.min as unknown) as number))) *
            100;
        if (percent > 99.5) percent = 100;
        inputElement.style.setProperty("--fontSliderProgressPercent", `${percent}%`);
    };

    async handleSliderChange(e) {
        const size = e.target.value;

        this.setState({ messageFontSize: `${size}px` });
        const newConfig = { messageFontSize: `${size}px` };

        await ipcRenderer.invoke("set-config", newConfig);

        this.setCSSProperty();
    }

    render() {
        const { messageFontSize } = this.state;

        console.log(messageFontSize.substr(0, 2));

        return (
            <div id="FontSizeSlider">
                <p id="currentSize">
                    {this.state.messageFontSize === "14px" ? "14px (Default)" : this.state.messageFontSize}
                </p>
                <input
                    id="fontSliderInput"
                    onChange={e => this.handleSliderChange(e)}
                    value={messageFontSize.substr(0, 2)}
                    step="1"
                    max="18"
                    min="12"
                    type="range"
                />
                <div style={{ display: "flex", justifyContent: "space-between", width: "80%", alignItems: "center" }}>
                    <p className="exampleFont" style={{ fontSize: "12px", fontFamily: "SF UI Display Light" }}>
                        Aa <span>(12px)</span>
                    </p>
                    <p className="exampleFont" style={{ fontSize: "18px", fontFamily: "SF UI Display Light" }}>
                        Aa <span>(18px)</span>
                    </p>
                </div>
            </div>
        );
    }
}

export default FontSizeSlider;
