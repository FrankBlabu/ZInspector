const { app, BrowserWindow } = require('electron');
const path = require('path');
const console = require('console');

// print current path to console
console.log(`Current path: ${__dirname}`);

const backend = require('../backend');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    console.log(`--- Loading ---`);
    console.log(`Addon: ${backend.hello()}`)

    mainWindow.loadFile('src/index.html');
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

