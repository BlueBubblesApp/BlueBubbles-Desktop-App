import * as React from "react";
import "./AppearanceTab.css";
import SettingTitle from "./SettingTitle/SettingTitle";
import DarkExample from './dark-example.png';
import LightExample from './light-example.png';
import {ipcRenderer, App} from 'electron';

interface AppearanceTabState{
    theme: string
}

class AppearanceTab extends React.Component<object, AppearanceTabState> {
    constructor(props){
        super(props)

        this.state = {
            theme: ""
        }
    }

    handleThemeChange(e){
        let newTheme = e.target.getAttribute('data-set-theme');
        if(newTheme === "dark"){
            try{document.getElementsByClassName("active-theme")[0].classList.remove("active-theme")}
            catch{}
            document.getElementById("darkExample").classList.add("active-theme")
        }
        if(newTheme === "light"){
            try{document.getElementsByClassName("active-theme")[0].classList.remove("active-theme")}
            catch{}
            document.getElementById("lightExample").classList.add("active-theme")
        }
        
        //Find every element with data-theme attribute and set to new theme
        let themeElements = [document.querySelectorAll("*[data-theme]")]
        for (var i = 0; i < themeElements[0].length; i++) {
            themeElements[0][i].setAttribute("data-theme", newTheme)
        }
        //Set new theme and save to databse
        const config = {theme: newTheme};
        ipcRenderer.invoke("set-config", config)
    }

    async componentDidMount(){
        const config = await ipcRenderer.invoke("get-config")
        this.setState({theme: config.theme})

        ipcRenderer.on("config-update", (_, args) => {

            this.setState({theme: args.theme});
        });

        //Handle active class of theme examples 
        if(config.theme === "dark"){
            document.getElementById("darkExample").classList.add("active-theme")
        }
        if(config.theme === "light"){
            document.getElementById("lightExample").classList.add("active-theme")
        }

    }

    render() {
        return (
            <div className="AppearanceTab">
                <div id="AppearanceTitle">
                    <h1>Appearance</h1>
                </div>
                <div id="AppearanceContainer">
                    <div id="half1" onClick={this.handleThemeChange} data-set-theme="dark"><p className="themeTitle">Dark</p><img id="darkExample"src={DarkExample}></img></div>
                    <div id="half2" onClick={this.handleThemeChange} data-set-theme="light"><p className="themeTitle">Light</p><img id="lightExample" src={LightExample}></img></div>
                </div>
            </div>
        );
    }
}

export default AppearanceTab;
