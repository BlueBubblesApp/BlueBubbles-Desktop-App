/* eslint-disable react/prefer-stateless-function */
import * as React from "react";
import "./ColorDisplayRow.css";
import ColorDisplay from "../ColorDisplay/ColorDisplay";

interface Props {
    title1: string;
    title2?: string;
    hex1: string;
    hex2?: string;
    hex3?: string;
    hex4?: string;
    hex5?: string;
    hex6?: string;
}

class ColorDisplayRow extends React.Component<Props, unknown> {
    render() {
        return (
            <div className="aColorDisplayRow">
                <div className="halfWidthCol">
                    <div className="aColorPreview">
                        <h2>{this.props.title1}</h2>
                        <div>
                            <ColorDisplay hexValue={this.props.hex1} />
                            {this.props.hex2 ? <ColorDisplay hexValue={this.props.hex2} /> : null}
                            {this.props.hex3 ? <ColorDisplay hexValue={this.props.hex3} /> : null}
                        </div>
                    </div>
                </div>
                <div className="halfWidthCol">
                    <div className="aColorPreview">
                        <h2>{this.props.title1 ? this.props.title2 : ""}</h2>
                        <div>
                            {this.props.hex4 ? <ColorDisplay hexValue={this.props.hex4} /> : null}
                            {this.props.hex5 ? <ColorDisplay hexValue={this.props.hex5} /> : null}
                            {this.props.hex6 ? <ColorDisplay hexValue={this.props.hex6} /> : null}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ColorDisplayRow;
