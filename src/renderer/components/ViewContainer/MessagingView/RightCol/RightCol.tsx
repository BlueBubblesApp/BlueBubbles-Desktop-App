/* eslint-disable class-methods-use-this */
/* eslint-disable max-len */
import * as React from "react";
import { ipcRenderer, IpcRendererEvent } from "electron";
import { Chat, Handle } from "@server/databases/chat/entity";
import "./RightCol.css";

import RightTopNav from "./Messaging/TopNav/RightTopNav";
import RightConversationDisplay from "./Messaging/ConversationDisplay/RightConversationDisplay";
import RightBottomNav from "./Messaging/BottomNav/RightBottomNav";

import NewMessageTopNav from "./NewMessage/NewMessageTop/NewMessageTopNav";
import NewMessageConversationDisplay from "./NewMessage/NewMessageConversation/NewMessageConversationDisplay";
import NewMessageBottomNav from "./NewMessage/NewMessageBottom/NewMessageBottomNav";

import DetailsDisplay from "./Details/DetailsDisplay/DetailsDisplay";
import GIFSelection from "./GIFSelection/GIFSelection";

type ServerInputTitleState = {
    currentChat: Chat;
    isDetailsOpen: boolean;
    newChatPreloadParticipant: Handle;
    isDraggingOver: boolean;
    downloadingDrop: boolean;
    dropFileName: string;
    dlProgress: number;
    dropFileSize: string;
    isGIFSelectorOpen: boolean;
};

class RightCol extends React.Component<object, ServerInputTitleState> {
    constructor(props) {
        super(props);

        this.state = {
            currentChat: null,
            isDetailsOpen: false,
            newChatPreloadParticipant: null,
            isDraggingOver: false,
            downloadingDrop: false,
            dropFileName: null,
            dlProgress: null,
            dropFileSize: null,
            isGIFSelectorOpen: false
        };
    }

    async componentDidMount() {
        ipcRenderer.on("toggle-giphy-selector", (_, show) => {
            this.setState({ isGIFSelectorOpen: show });
        });

        ipcRenderer.on("open-details", () => {
            this.setState({ isDetailsOpen: true });
        });

        ipcRenderer.on("close-details", () => {
            this.setState({ isDetailsOpen: false });
        });

        ipcRenderer.on("set-current-chat", this.onChatChange);

        // ipcRenderer.on("move-to-new-chat-view", async (_, newChatPreloadParticipant) => {
        //     this.setState({currentChat: null,newChatPreloadParticipant});
        // })

        ipcRenderer.on("preload-new-chat", async (_, participant: Handle) => {
            this.setState({ currentChat: null, isDetailsOpen: false, newChatPreloadParticipant: participant });
        });

        document.documentElement.addEventListener("dragover", e => {
            e.preventDefault();
            e.stopPropagation();

            if (!this.state.isDraggingOver) {
                this.setState({ isDraggingOver: true });

                document.documentElement.style.pointerEvents = "none";
                const chatDropzone = document.getElementById("chatDropzone");

                chatDropzone.addEventListener("dragleave", e2 => {
                    e2.preventDefault();
                    e2.stopPropagation();
                    if (this.state.isDraggingOver) {
                        this.setState({ isDraggingOver: false });
                        document.documentElement.style.pointerEvents = "initial";
                    }
                });

                chatDropzone.addEventListener("dragexit", e3 => {
                    e3.preventDefault();
                    e3.stopPropagation();
                    if (this.state.isDraggingOver) {
                        this.setState({ isDraggingOver: false });
                        document.documentElement.style.pointerEvents = "initial";
                    }
                });

                chatDropzone.addEventListener("drop", e4 => {
                    e4.preventDefault();
                    e4.stopPropagation();
                    this.handleDropEvent(e4);
                    this.setState({ isDraggingOver: false });
                    document.documentElement.style.pointerEvents = "initial";
                });
            }
        });

        ipcRenderer.on("set-drop-download", (_, args) => {
            if (args === null) {
                this.setState({
                    isDraggingOver: false,
                    downloadingDrop: false,
                    dlProgress: null,
                    dropFileName: null,
                    dropFileSize: null
                });
            }
            this.setState({
                isDraggingOver: true,
                downloadingDrop: true,
                dropFileName: args.fileName,
                dropFileSize: args.fileSize
            });
        });

        ipcRenderer.on("drop-download-progress", (_, percent) => {
            const prog = document.getElementById("dropDownloadProgress").getElementsByTagName("span")[0];
            prog.style.width = `${percent}%`;
            this.setState({ dlProgress: percent });
            if (percent === 100) {
                this.setState({ isDraggingOver: false, downloadingDrop: false, dropFileName: null });
            }
        });
    }

    componentWillUnmount() {
        ipcRenderer.removeListener("set-current-chat", this.onChatChange);
    }

    onChatChange = async (_: IpcRendererEvent, chat: Chat) => {
        this.setState({ currentChat: chat, isDetailsOpen: false, newChatPreloadParticipant: null });

        document.documentElement.addEventListener("dragover", e => {
            e.preventDefault();
            e.stopPropagation();

            if (!this.state.isDraggingOver) {
                this.setState({ isDraggingOver: true });

                document.documentElement.style.pointerEvents = "none";
                const chatDropzone = document.getElementById("chatDropzone");

                chatDropzone.addEventListener("dragleave", e2 => {
                    e2.preventDefault();
                    e2.stopPropagation();
                    if (this.state.isDraggingOver) {
                        this.setState({ isDraggingOver: false });
                        document.documentElement.style.pointerEvents = "initial";
                    }
                });

                chatDropzone.addEventListener("dragexit", e3 => {
                    e3.preventDefault();
                    e3.stopPropagation();
                    if (this.state.isDraggingOver) {
                        this.setState({ isDraggingOver: false });
                        document.documentElement.style.pointerEvents = "initial";
                    }
                });

                chatDropzone.addEventListener("drop", e4 => {
                    e4.preventDefault();
                    e4.stopPropagation();
                    this.handleDropEvent(e4);
                    this.setState({ isDraggingOver: false });
                    document.documentElement.style.pointerEvents = "initial";
                });
            }
        });
    };

    handleDropEvent(e) {
        if (e.dataTransfer.files.length > 0) {
            const args = { attachment: e.dataTransfer.files[0].path };
            ipcRenderer.invoke("send-to-ui", { event: "chat-drop-event", contents: args });
            return;
        }
        if (e.dataTransfer.getData("url")) {
            ipcRenderer.invoke("drop-link-event", e.dataTransfer.getData("url"));
            return;
        }
        if (e.dataTransfer.getData("text")) {
            const args = { text: e.dataTransfer.getData("text") };
            ipcRenderer.invoke("send-to-ui", { event: "chat-drop-event", contents: args });
        }
    }

    render() {
        return (
            <div className="RightCol-Mes">
                {!this.state.currentChat ? (
                    <>
                        {this.state.newChatPreloadParticipant ? (
                            <NewMessageTopNav newChatPreloadParticipant={this.state.newChatPreloadParticipant} />
                        ) : (
                            <NewMessageTopNav />
                        )}
                        <NewMessageConversationDisplay />
                        <NewMessageBottomNav />
                        {this.state.isGIFSelectorOpen ? <GIFSelection /> : null}
                        {this.state.isDraggingOver ? (
                            <div id="chatDropzone">
                                {this.state.downloadingDrop ? (
                                    <>
                                        <h1>{`${this.state.dropFileName} (${this.state.dropFileSize})`}</h1>
                                        <div id="dropDownloadProgress">
                                            <span />
                                        </div>
                                        <p>{Math.round(this.state.dlProgress)}%</p>
                                        <button onClick={() => ipcRenderer.invoke("cancel-download")}>Cancel</button>
                                    </>
                                ) : (
                                    <p>Drop to add to chat</p>
                                )}
                            </div>
                        ) : null}
                    </>
                ) : (
                    <>
                        {this.state.isDetailsOpen === true ? (
                            <>
                                <RightTopNav chat={this.state.currentChat} isDetailsOpen={true} />
                                <DetailsDisplay chat={this.state.currentChat} />
                            </>
                        ) : (
                            <>
                                <RightTopNav chat={this.state.currentChat} isDetailsOpen={false} />
                                <RightConversationDisplay chat={this.state.currentChat} />
                                <RightBottomNav chat={this.state.currentChat} />
                                {this.state.isGIFSelectorOpen ? <GIFSelection /> : null}
                                {this.state.isDraggingOver ? (
                                    <div id="chatDropzone">
                                        {this.state.downloadingDrop ? (
                                            <>
                                                <h1>{`${this.state.dropFileName} (${this.state.dropFileSize})`}</h1>
                                                <div id="dropDownloadProgress">
                                                    <span />
                                                </div>
                                                <p>{Math.round(this.state.dlProgress)}%</p>
                                                <button onClick={() => ipcRenderer.invoke("cancel-download")}>
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <p>Drop to add to chat</p>
                                        )}
                                    </div>
                                ) : null}
                            </>
                        )}
                    </>
                )}
            </div>
        );
    }
}

export default RightCol;
