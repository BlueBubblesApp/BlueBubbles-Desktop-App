import { ipcRenderer } from "electron";
import * as React from "react";

import { StorageData } from "@server/fileSystem/types";

import StorageInfo from "./StorageInfo/StorageInfo";
import "./StorageTab.css";
import StorageTable from "./StorageTable/StorageTable";

interface State {
    storageInfo: StorageData;
    isLoading: boolean;
}

class StorageTab extends React.Component<object, State> {
    state = {
        storageInfo: null,
        isLoading: true
    };

    async componentDidMount() {
        const storageInfo = (await ipcRenderer.invoke("get-storage-info")) as StorageData;
        this.setState({ storageInfo, isLoading: false });

        ipcRenderer.on("update-total-size", async () => {
            this.setState({ isLoading: true });
            const storageInfoUpdate = (await ipcRenderer.invoke("get-storage-info")) as StorageData;
            this.setState({ storageInfo: storageInfoUpdate, isLoading: false });
        });
    }

    render() {
        const { storageInfo } = this.state;
        return (
            <div id="StorageTab">
                <div id="StorageTitle" className="RightTitle-Set">
                    <h1>Storage</h1>
                </div>
                {this.state.isLoading ? (
                    <div className="loader" />
                ) : (
                    <StorageInfo
                        appSize={storageInfo.appSize}
                        storageSize={storageInfo.storageSize}
                        chatDataSize={storageInfo.chatDataSize}
                        attachmentFolderSize={storageInfo.attachmentFolderSize}
                    />
                )}
                <StorageTable />
            </div>
        );
    }
}

export default StorageTab;
