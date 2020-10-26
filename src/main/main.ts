/* eslint-disable no-use-before-define */
import "reflect-metadata";
import { app, BrowserWindow, ipcMain, Menu, Tray } from "electron";
import * as path from "path";
import * as url from "url";

import { Server } from "@server/index";
import { FileSystem } from "@server/fileSystem";
import trayIcon from "@renderer/assets/logo64.png";

// To allow CORS
app.commandLine.appendSwitch("disable-features", "OutOfBlinkCors");

let win: BrowserWindow | null;
let tray;
const BlueBubbles = Server(win);

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on("second-instance", (event, commandLine, workingDirectory) => {
        if (win) {
            if (win.isMinimized()) win.restore();
            win.focus();
        }
    });

    app.whenReady().then(async () => {
        await BlueBubbles.start();
    });
}

const createWindow = async () => {
    win = new BrowserWindow({
        width: 1200,
        height: 750,
        minWidth: 550,
        minHeight: 350,
        transparent: true,
        frame: false,
        webPreferences: { nodeIntegration: true, webSecurity: false }
    });

    if (process.env.NODE_ENV !== "production") {
        process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "1"; // eslint-disable-line require-atomic-updates
        win.loadURL(`http://localhost:2004`);
    } else {
        win.loadURL(
            url.format({
                pathname: path.join(__dirname, "index.html"),
                protocol: "file:",
                slashes: true
            })
        );
    }

    if (process.env.NODE_ENV !== "production") {
        // Open DevTools, see https://github.com/electron/electron/issues/12438 for why we wait for dom-ready
        win.webContents.once("dom-ready", () => {
            // win!.webContents.openDevTools();
        });
    }

    win.on("closed", () => {
        win = null;
    });

    win.on("maximize", () => {
        if (win && win.webContents) win.webContents.send("maximized");
    });

    win.on("unmaximize", () => {
        if (win && win.webContents) win.webContents.send("unmaximized");
    });

    win.on("blur", () => {
        win.webContents.send("blurred");
    });

    win.on("focus", () => {
        win.webContents.send("focused");
    });

    BlueBubbles.window = win;
};

ipcMain.handle("minimize-event", () => {
    if (win && win.webContents) win.minimize();
});

ipcMain.handle("maximize-event", () => {
    if (win && win.webContents) win.maximize();
});

ipcMain.handle("unmaximize-event", () => {
    if (win && win.webContents) win.unmaximize();
});

ipcMain.on("force-focus", () => {
    if (win && win.webContents) win.show();
    win.focus();
});

ipcMain.handle("close-event", async () => {
    if (BlueBubbles.configRepo.get("closeToTray")) {
        tray = new Tray(path.join(FileSystem.resources, trayIcon));

        const contextMenu = Menu.buildFromTemplate([
            {
                label: "BlueBubbles",
                enabled: false
            },
            {
                type: "separator"
            },
            {
                label: "Open",
                type: "normal",
                click: async () => {
                    if (win) {
                        win.show();
                        tray.destroy();
                    } else {
                        app.emit("active");
                    }
                }
            },
            {
                label: "Close",
                type: "normal",
                click: async () => {
                    await FileSystem.deleteTempFiles();
                    win = null;
                    app.quit();
                    app.exit(0);
                }
            }
        ]);

        tray.setToolTip("BlueBubbles");
        tray.setContextMenu(contextMenu);
        tray.on("click", async () => {
            if (win) {
                win.show();
                tray.destroy();
            } else {
                app.emit("active");
            }
        });

        win.hide();
    } else {
        await FileSystem.deleteTempFiles();
        app.quit();
        app.exit(0);
    }
});

app.on("browser-window-focus", () => {
    if (win && win.webContents) win.webContents.send("focused");
});

app.on("browser-window-blur", () => {
    if (win && win.webContents) win.webContents.send("blurred");
});

app.on("ready", createWindow);

app.on("window-all-closed", async () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (win === null) {
        createWindow();
    }
});

ipcMain.handle("destroy-tray", () => {
    if (tray) {
        tray.destroy();
    }
});
