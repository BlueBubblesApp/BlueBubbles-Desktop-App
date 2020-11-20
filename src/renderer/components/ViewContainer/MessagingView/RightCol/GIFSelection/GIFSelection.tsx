/* eslint-disable class-methods-use-this */
/* eslint-disable max-len */
import * as React from "react";
import { GiphyFetch, GifsResult } from "@giphy/js-fetch-api";
import { Grid, SearchContextManager, SuggestionBar } from "@giphy/react-components";
import "./GIFSelection.css";
import { ipcRenderer } from "electron";

require("dotenv").config();

interface State {
    containerWidth: number;
    reloadGrid: boolean;
    fetchGifs: (offset: number) => Promise<GifsResult>;
}

const gf = new GiphyFetch(process.env.GIPHY_API_KEY);

class GIFSelection extends React.Component<unknown, State> {
    constructor(props) {
        super(props);

        this.state = {
            containerWidth: window.innerWidth - 302,
            reloadGrid: true,
            fetchGifs: (offset: number) => gf.trending({ offset, limit: 12 })
        };
    }

    async componentDidMount() {
        const rootDiv = document.getElementsByClassName("root")[0] as HTMLElement;

        // Handle window resize
        window.addEventListener("resize", e => {
            this.setState({ containerWidth: window.innerWidth - 302 });
        });

        ipcRenderer.on("giphy-search-term", (_, term: string) => {
            this.setState(
                { reloadGrid: false, fetchGifs: (offset: number) => gf.search(term, { offset, limit: 12 }) },
                () => this.setState({ reloadGrid: true })
            );
        });

        // Handle clicking suggestion
        const buttonsContainer = await Promise.resolve(
            document.getElementsByClassName("RightCol-Mes")[0].childNodes[3] as HTMLElement
        );

        const themeStyles = getComputedStyle(document.getElementById("TitleBarRight"));

        buttonsContainer.style.paddingTop = "5px";
        buttonsContainer.style.paddingLeft = "6px";
        buttonsContainer.style.minHeight = "42px";
        buttonsContainer.style.backgroundColor = themeStyles.getPropertyValue("--background-color");
        buttonsContainer.style.color = themeStyles.getPropertyValue("--main-title-color");

        // eslint-disable-next-line no-constant-condition
        while (true) {
            if (buttonsContainer) {
                if (buttonsContainer.childNodes.length > 0) break;
            }
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        for (let i = 0; i < buttonsContainer.childNodes.length; i += 1) {
            (buttonsContainer.childNodes[i] as HTMLElement).style.setProperty(
                "background-color",
                themeStyles.getPropertyValue("--secondary-color"),
                "important"
            );
            (buttonsContainer.childNodes[i] as HTMLElement).style.setProperty(
                "box-shadow",
                "3px 3px 10px 0px rgba(0,0,0,0.61)",
                "important"
            );

            (buttonsContainer.childNodes[i] as HTMLElement).addEventListener("click", (e: any) => {
                if (e.target.innerText) {
                    this.setState(
                        {
                            reloadGrid: false,
                            fetchGifs: (offset: number) => gf.search(e.target.innerText, { offset, limit: 12 })
                        },
                        () => this.setState({ reloadGrid: true })
                    );
                }
            });
        }
    }

    handleGIFClicked(info) {
        ipcRenderer.invoke("download-gif-from-giphy", info.images.original.url);
    }

    render() {
        return (
            <SearchContextManager apiKey={process.env.GIPHY_API_KEY}>
                <SuggestionBar />
                {this.state.reloadGrid ? (
                    <Grid
                        width={this.state.containerWidth}
                        columns={3}
                        fetchGifs={this.state.fetchGifs}
                        onGifClick={info => this.handleGIFClicked(info)}
                    />
                ) : null}
            </SearchContextManager>
        );
    }
}

export default GIFSelection;
