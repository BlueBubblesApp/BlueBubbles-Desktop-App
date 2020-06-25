import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';

let win: BrowserWindow | null;

const installExtensions = async () => {
    const installer = require('electron-devtools-installer');
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

    return Promise.all(
        extensions.map(name => installer.default(installer[name], forceDownload))
    ).catch(console.log); // eslint-disable-line no-console
};

const createWindow = async () => {
    if (process.env.NODE_ENV !== 'production') {
        await installExtensions();
    }

    win = new BrowserWindow({
        width: 1200,
        height: 750,
        minWidth: 550,
        minHeight: 300,
        transparent: true,
        frame: false,
        webPreferences: { nodeIntegration: true }
    });

    if (process.env.NODE_ENV !== 'production') {
        process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1'; // eslint-disable-line require-atomic-updates
        win.loadURL(`http://localhost:2003`);
    } else {
        win.loadURL(
            url.format({
                pathname: path.join(__dirname, 'index.html'),
                protocol: 'file:',
                slashes: true
            })
        );
    }

    if (process.env.NODE_ENV !== 'production') {
        // Open DevTools, see https://github.com/electron/electron/issues/12438 for why we wait for dom-ready
        win.webContents.once('dom-ready', () => {
            win!.webContents.openDevTools();
        });
    }

    win.on('closed', () => {
        win = null;
    });

    win.on('maximize', () => {
        win.webContents.send('maximized');
    });

    win.on('unmaximize', () => {
        win.webContents.send('unmaximized');
    });
};

ipcMain.handle('minimize-event', () => {
    win.minimize();
});

ipcMain.handle('maximize-event', () => {
    win.maximize();
});

ipcMain.handle('unmaximize-event', () => {
    win.unmaximize();
    console.log('unmaximize');
});

ipcMain.handle('close-event', () => {
    app.quit();
});

app.on('browser-window-focus', () => {
    win.webContents.send('focused');
});

app.on('browser-window-blur', () => {
    win.webContents.send('blurred');
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});
