/* eslint-disable max-len */
/* eslint-disable react/prefer-stateless-function */
import * as React from "react";
import "./ColorDisplay.css";
import { SketchPicker } from "react-color";
import { ipcRenderer } from "electron";

interface Props {
    hexValue: string;
}

interface State {
    isColorPickerOpen: boolean;
    hexValue: string;
}

class ColorDisplay extends React.Component<Props, State> {
    constructor(props) {
        super(props);

        this.state = {
            isColorPickerOpen: false,
            hexValue: ""
        };
    }

    componentDidMount() {
        this.setState({ hexValue: this.props.hexValue });
    }

    handleColorPickerClose = () => {
        this.setState({ isColorPickerOpen: false });
    };

    handleColorPickerClick = () => {
        this.setState({ isColorPickerOpen: !this.state.isColorPickerOpen });
    };

    handleChangeComplete = color => {
        console.log(color);
        this.setState({ hexValue: color.hex });

        // ipcRenderer.invoke("set-theme-value", {test:color.hex})
    };

    render() {
        return (
            <>
                {this.state.isColorPickerOpen ? (
                    <div className="popover">
                        <div className="cover" onClick={this.handleColorPickerClose} />
                        <SketchPicker
                            color={this.state.hexValue}
                            onChangeComplete={this.handleChangeComplete}
                            disableAlpha={true}
                        />
                    </div>
                ) : null}

                <div className="aColorDisplay" onClick={this.handleColorPickerClick}>
                    <div className="aColor" style={{ backgroundColor: this.props.hexValue }} />
                    <input className="aColorHex" value={this.props.hexValue.toUpperCase()} type="text" />
                </div>
            </>
        );
    }
}

export default ColorDisplay;
