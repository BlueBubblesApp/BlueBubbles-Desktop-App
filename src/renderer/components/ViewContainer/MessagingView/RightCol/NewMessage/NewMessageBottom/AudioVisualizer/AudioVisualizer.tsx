import { Theme } from "@server/databases/config/entity";
import { ipcRenderer } from "electron";
/* eslint-disable react/prefer-stateless-function */
import * as React from "react";
import "./AudioVisualizer.css";

interface Props {
    audioData: any;
}

interface State {
    theme: Theme;
}

class AudioVisualiser extends React.Component<Props, State> {
    canvas: React.RefObject<any>;

    constructor(props) {
        super(props);
        this.canvas = React.createRef();

        this.state = {
            theme: null
        };
    }

    async componentDidMount() {
        const { audioData } = this.props;
        const config = await ipcRenderer.invoke("get-config");
        const theme: Theme = await ipcRenderer.invoke("get-theme", config.currentTheme);
        this.setState({ theme });
    }

    componentDidUpdate() {
        this.draw();
    }

    async draw() {
        const { audioData } = this.props;
        const canvas = this.canvas.current;
        const { width, height } = canvas;
        const context = canvas.getContext("2d");
        let x = 0;
        const sliceWidth = (width * 1.0) / audioData.length;

        context.lineWidth = 4;
        if (this.state.theme) {
            context.strokeStyle = this.state.theme.mainTitleColor;
        } else {
            console.log("had to get config again");
            const config = await ipcRenderer.invoke("get-config");
            const theme: Theme = await ipcRenderer.invoke("get-theme", config.currentTheme);
            context.strokeStyle = theme.mainTitleColor;
        }
        context.clearRect(0, 0, width, height);

        context.beginPath();
        context.moveTo(0, height / 2);

        for (const item of audioData) {
            const y = (item / 255.0) * height;
            context.lineTo(x, y);
            x += sliceWidth;
        }

        context.lineTo(x, height / 2);
        context.stroke();
    }

    render() {
        return <canvas id="audioVisWave" ref={this.canvas} />;
    }
}

export default AudioVisualiser;
