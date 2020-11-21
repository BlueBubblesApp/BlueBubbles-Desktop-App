/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable max-len */
import { bytesToSize } from "@renderer/helpers/utils";
import { Attachment } from "@server/databases/chat/entity";
import { ipcRenderer } from "electron";
import * as React from "react";

import "./StorageTable.css";

interface State {
    isLoading: boolean;
    attachments: any;
    currentSort: string;
    selectedFiles: Array<any>;
    showDeleteConfirm: boolean;
}

class StorageTable extends React.Component<object, State> {
    ascending: boolean;

    constructor(props) {
        super(props);

        this.ascending = true;

        this.state = {
            isLoading: true,
            attachments: null,
            currentSort: null,
            selectedFiles: [],
            showDeleteConfirm: false
        };
    }

    async componentDidMount() {
        const attachments = await ipcRenderer.invoke("get-all-attachments-info");
        this.setState({ attachments, isLoading: false });

        console.log(attachments);
    }

    getFormattedDate = date => {
        const year = date.getFullYear();
        const month = (1 + date.getMonth()).toString().padStart(2, "0");
        const day = date
            .getDate()
            .toString()
            .padStart(2, "0");

        const hour = date.getHours() >= 12 ? date.getHours() - 12 : date.getHours();
        const minute = date
            .getMinutes()
            .toString()
            .padStart(2, "0");

        return `${month}/${day}/${year} - ${hour === 0 ? 12 : hour}:${minute} ${date.getHours() > 12 ? "PM" : "AM"}`;
    };

    handleSortTable = key => {
        if (key === this.state.currentSort) {
            this.ascending = !this.ascending;
        } else {
            this.ascending = true;
        }

        this.setState({ currentSort: key });

        if (key === "select") {
            const x = this.state.attachments.sort((a, b) => {
                return (document.getElementById(`${a.filePath}-inputChild`) as HTMLInputElement).checked ===
                    (document.getElementById(`${b.filePath}-inputChild`) as HTMLInputElement).checked
                    ? 0
                    : (document.getElementById(`${a.filePath}-inputChild`) as HTMLInputElement).checked
                    ? -1
                    : 1;
            });

            this.setState({ attachments: this.ascending ? x : x.reverse() });
            return;
        }

        if (key === "fileName") {
            const x = this.state.attachments.sort((a, b) => {
                return a.filePath
                    .substring(a.filePath.lastIndexOf("\\") + 1)
                    .localeCompare(b.filePath.substring(b.filePath.lastIndexOf("\\") + 1));
            });

            this.setState({ attachments: this.ascending ? x : x.reverse() });
            return;
        }

        if (key === "birthtime") {
            const x = this.state.attachments.sort((a, b) => {
                return a.birthtime - b.birthtime;
            });

            this.setState({ attachments: this.ascending ? x : x.reverse() });
            return;
        }

        if (key === "type") {
            const x = this.state.attachments.sort((a, b) => {
                return a.fileType.localeCompare(b.fileType);
            });

            this.setState({ attachments: this.ascending ? x : x.reverse() });
            return;
        }

        if (key === "size") {
            const x = this.state.attachments.sort((a, b) => {
                return a.size - b.size;
            });

            this.setState({ attachments: this.ascending ? x : x.reverse() });
        }
    };

    clearSelected = () => {
        const matches = document.getElementsByClassName("aAttachmentSelector");

        for (let i = 0; i < matches.length; i += 1) {
            (matches.item(i) as HTMLInputElement).checked = false;
        }

        for (let i = 0; i < this.state.attachments.length; i += 1) {
            try {
                document.getElementById(this.state.attachments[i].filePath).classList.remove("selectedRow");
            } catch (e) {
                // Nothing
            }
        }

        this.setState({ selectedFiles: [] });
    };

    deleteSelected = () => {
        const { selectedFiles } = this.state;
        this.setState({ showDeleteConfirm: true });
    };

    calcTotalDelSize = () => {
        const { selectedFiles } = this.state;

        let totalSize = 0;
        for (let i = 0; i < selectedFiles.length; i += 1) {
            totalSize += selectedFiles[i].size;
        }

        return bytesToSize(totalSize);
    };

    deleteConfirmed = async () => {
        await ipcRenderer.invoke("delete-selected-files", this.state.selectedFiles);
        this.setState({ isLoading: true });
        const attachments = await ipcRenderer.invoke("get-all-attachments-info");
        this.setState({ attachments, isLoading: false, showDeleteConfirm: false, selectedFiles: [] });
        ipcRenderer.invoke("send-to-ui", { event: "update-total-size", content: null });
    };

    selectAll = async () => {
        for (let i = 0; i < this.state.attachments.length; i += 1) {
            console.log(`${this.state.attachments[i].filePath}-inputChild`);
            (document.getElementById(
                `${this.state.attachments[i].filePath}-inputChild`
            ) as HTMLInputElement).checked = true;
            document.getElementById(this.state.attachments[i].filePath).classList.toggle("selectedRow");
        }

        this.setState({ selectedFiles: this.state.attachments });
    };

    render() {
        return (
            <>
                {this.state.isLoading && !this.state.attachments ? (
                    <div id="loader" />
                ) : (
                    <>
                        {this.state.showDeleteConfirm ? (
                            <div id="deleteConfirmDiv">
                                <p>Please confirm your selection</p>
                                <div id="confirmListContainer">
                                    {this.state.selectedFiles.map(attachment => {
                                        return (
                                            <div className="aconfirmRow" key={`${attachment.filePath}-confirm`}>
                                                <div>
                                                    <p>
                                                        {attachment.filePath.substring(
                                                            attachment.filePath.lastIndexOf("\\") + 1
                                                        )}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p>{bytesToSize(attachment.size)}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", width: "80%" }}>
                                    <p>{this.state.selectedFiles.length} Files</p>
                                    <p>{this.calcTotalDelSize()}</p>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", width: "45%" }}>
                                    <button
                                        id="cancelButton"
                                        onClick={() => this.setState({ showDeleteConfirm: false })}
                                    >
                                        Cancel
                                    </button>
                                    <button id="confirmButton" onClick={() => this.deleteConfirmed()}>
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        ) : null}
                        <div id="delContainer" style={{ minHeight: "37px" }}>
                            {this.state.selectedFiles.length > 0 ? (
                                <>
                                    <button id="clearSelected" onClick={() => this.clearSelected()}>
                                        Clear Selected
                                    </button>
                                    <button id="deleteSelected" onClick={() => this.deleteSelected()}>
                                        Delete Selected
                                    </button>
                                </>
                            ) : (
                                <button id="selectAllButton" onClick={() => this.selectAll()}>
                                    Select All Files
                                </button>
                            )}
                        </div>
                        <table className="storageTable">
                            <thead>
                                <tr>
                                    <th>
                                        <div className="tHeadTitle" onClick={() => this.handleSortTable("select")}>
                                            <p>Select</p>
                                            {this.state.currentSort === "select" ? (
                                                <>{this.ascending ? <p>&#9650;</p> : <p>&#9660;</p>}</>
                                            ) : null}
                                        </div>
                                    </th>
                                    <th>
                                        <div className="tHeadTitle" onClick={() => this.handleSortTable("fileName")}>
                                            <p>File Name</p>
                                            {this.state.currentSort === "fileName" ? (
                                                <>{this.ascending ? <p>&#9650;</p> : <p>&#9660;</p>}</>
                                            ) : null}
                                        </div>
                                    </th>
                                    <th>
                                        <div className="tHeadTitle" onClick={() => this.handleSortTable("birthtime")}>
                                            <p>Date Created</p>
                                            {this.state.currentSort === "birthtime" ? (
                                                <>{this.ascending ? <p>&#9650;</p> : <p>&#9660;</p>}</>
                                            ) : null}
                                        </div>
                                    </th>
                                    <th>
                                        <div className="tHeadTitle" onClick={() => this.handleSortTable("type")}>
                                            <p>Type</p>
                                            {this.state.currentSort === "type" ? (
                                                <>{this.ascending ? <p>&#9650;</p> : <p>&#9660;</p>}</>
                                            ) : null}
                                        </div>
                                    </th>
                                    <th>
                                        <div className="tHeadTitle" onClick={() => this.handleSortTable("size")}>
                                            <p>Size</p>
                                            {this.state.currentSort === "size" ? (
                                                <>{this.ascending ? <p>&#9650;</p> : <p>&#9660;</p>}</>
                                            ) : null}
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.attachments
                                    ? this.state.attachments.map(attachment => {
                                          return (
                                              <tr key={attachment.filePath} id={attachment.filePath}>
                                                  <td>
                                                      <input
                                                          className="aAttachmentSelector"
                                                          type="checkbox"
                                                          id={`${attachment.filePath}-inputChild`}
                                                          onChange={() => {
                                                              const x = document.getElementById(
                                                                  attachment.filePath
                                                              ) as HTMLInputElement;
                                                              x.classList.toggle("selectedRow");
                                                              // if(x.checked) {
                                                              //     x.checked = false;
                                                              // } else {
                                                              //     x.checked = true;
                                                              // }
                                                              const selectedFiles = [...this.state.selectedFiles];

                                                              if (selectedFiles.includes(attachment)) {
                                                                  selectedFiles.splice(
                                                                      selectedFiles.indexOf(attachment)
                                                                  );
                                                              } else {
                                                                  selectedFiles.push(attachment);
                                                              }

                                                              this.setState({ selectedFiles });
                                                          }}
                                                      />
                                                  </td>
                                                  <td>
                                                      {attachment.filePath.substring(
                                                          attachment.filePath.lastIndexOf("\\") + 1
                                                      )}
                                                  </td>
                                                  <td>{this.getFormattedDate(attachment.birthtime)}</td>
                                                  <td>{attachment.fileType}</td>
                                                  <td>{bytesToSize(attachment.size)}</td>
                                              </tr>
                                          );
                                      })
                                    : null}
                            </tbody>
                        </table>
                    </>
                )}
            </>

            // </div>
        );
    }
}

export default StorageTable;
