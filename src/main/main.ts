import "reflect-metadata";
import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import * as url from "url";

import { BackendServer } from "@server/index";

let win: BrowserWindow | null;
const BlueBubbles = new BackendServer(win);
BlueBubbles.start();

const createWindow = async () => {
    win = new BrowserWindow({
        width: 1200,
        height: 750,
        minWidth: 550,
        minHeight: 300,
        transparent: true,
        frame: false,
        webPreferences: { nodeIntegration: true }
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
            win!.webContents.openDevTools();
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

ipcMain.handle("close-event", () => {
    app.quit();
    app.exit(0);
});

app.on("browser-window-focus", () => {
    if (win && win.webContents) win.webContents.send("focused");
});

app.on("browser-window-blur", () => {
    if (win && win.webContents) win.webContents.send("blurred");
});

app.on("ready", createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (win === null) {
        createWindow();
    }
});
