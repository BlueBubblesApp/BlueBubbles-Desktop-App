import * as React from "react";
import "./StorageTab.css";
import SettingTitle from "./SettingTitle/SettingTitle";
import StorageInfo from "./StorageInfo/StorageInfo";



import {getStorageInformation, StorageData} from "@server/helpers/storageHandler";

interface State {
    storageInfo: StorageData;
    isLoading: boolean;
}

class StorageTab extends React.Component<object,State> {
    constructor(props){
        super(props)

        this.state = {
            storageInfo: null,
            isLoading: true
            }
        }

    async componentDidMount(){
        await getStorageInformation()
            .then(res => this.setState({storageInfo : res}))
            .then(res => this.setState({isLoading : false}))
            .then(res => console.log("just set state"))

        
    }
    

    render(){
        const { storageInfo } = this.state;
        return (
            <div id="StorageTab">
                <div id="StorageTitle">
                    <h1>Storage</h1>
                </div>
                {this.state.isLoading ? (
                    <div className="a">Loader</div>
                ) : (
                <StorageInfo
                    totalAppSize={storageInfo.totalAppSizeMB}
                    totalBaseApp={storageInfo.baseAppSizePercent}
                    totalTexts={storageInfo.textDataSizePercent}
                    totalAttachments={storageInfo.attachmentFolderSizePercent}
                />
                )}
            </div>
        );
    }
}



export default StorageTab;

