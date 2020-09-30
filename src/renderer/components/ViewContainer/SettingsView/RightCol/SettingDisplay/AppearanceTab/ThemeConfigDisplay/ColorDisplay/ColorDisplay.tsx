/* eslint-disable max-len */
/* eslint-disable react/prefer-stateless-function */
import * as React from "react";
import "./ColorDisplay.css";
import { SketchPicker } from "react-color";
import { ipcRenderer } from "electron";
import { Theme } from "@server/databases/config/entity";

interface Props {
    hexValue: string;
    currentTheme: string;
    allThemes: string;
    themeVariableTitle: string;
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

    handleChangeComplete = async color => {
        this.setState({ hexValue: color.hex });

        if (
            this.props.currentTheme === "dark" ||
            this.props.currentTheme === "light" ||
            this.props.currentTheme === "nord"
        ) {
            console.log("is default theme");

            // get the full theme and change the only value we want
            const currentThemeFull: Theme = await ipcRenderer.invoke("get-theme", this.props.currentTheme);
            currentThemeFull.name = `${this.props.currentTheme.substr(0, 1).toUpperCase() +
                this.props.currentTheme.substr(1, this.props.currentTheme.length)} - Custom 1`;
            currentThemeFull[this.props.themeVariableTitle] = color.hex;

            // save new theme
            ipcRenderer.invoke("set-theme", currentThemeFull);

            // push the new theme name to the config
            let allThemesNew = this.props.allThemes;
            allThemesNew = `${allThemesNew},${currentThemeFull.name}`;
            const config = { allThemes: allThemesNew, currentTheme: currentThemeFull.name };
            ipcRenderer.invoke("set-config", config);

            console.log(currentThemeFull);
        } else {
            console.log("custom theme");
            const newThemeValue = {
                themeName: this.props.currentTheme,
                key: this.props.themeVariableTitle,
                newValue: color.hex
            };
            ipcRenderer.invoke("set-theme-value", newThemeValue);

            const config = { allThemes: this.props.allThemes, currentTheme: this.props.currentTheme };
            ipcRenderer.invoke("set-config", config);
        }
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
