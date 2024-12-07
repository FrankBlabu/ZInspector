const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');
const console = require('console');

function createWindow() {

    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    console.log('--- MAIN ---');

    mainWindow.loadFile('src/index.html');

    mainWindow.webContents.openDevTools();

    const menu = Menu.buildFromTemplate([
        {
            label: 'File',
            submenu: [
                {
                    label: 'Open STL File',
                    click: async () => {
                        const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
                            filters: [{ name: 'STL Files', extensions: ['stl'] }],
                            properties: ['openFile']
                        });
                        if (!canceled && filePaths.length > 0) {
                            console.log(`Selected file: ${filePaths[0]}`);
                            // Handle the selected STL file here
                        }
                    }
                },
                { role: 'quit' }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            title: 'About',
                            message: 'This is a simple Electron app to display 3D models in STL format.',
                            buttons: ['OK']
                        });
                    }
                },
                { type: 'separator' },
                {
                    label: 'Reload',
                    role: 'reload'
                },
                {
                    label: 'Toggle Developer Tools',
                    role: 'toggleDevTools'
                }
            ]
        }
    ]);

    Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});
