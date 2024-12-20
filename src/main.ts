/**
 * main.ts - Main entry point for the Electron app.
 * 
 * This file creates the main window and sets up the application.
 */

import { app, BrowserWindow, Menu, dialog } from 'electron';
import logger from './logging';
import * as path from 'path';

const backend = require('../backend');

// Application main window
let mainWindow: BrowserWindow | null = null;

/**
 * Create the main window for the application.
 */
function createWindow(): void {

    logger.info('Creating main window');

    //
    // Create the main window. The main window is rendering the UI,
    // The renderer process runs in a sandboxed environment and has no
    // access to native APIs. It can only communicate with the main process
    // via IPC. The preload.js script is used to expose a limited set of
    // native APIs to the renderer process.
    //
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile('ui/index.html');

    //
    // Set up the application menu
    //
    const menu = Menu.buildFromTemplate([
        {
            label: 'File',
            submenu: [
                {
                    label: 'Open STL File',
                    click: async () => onOpenFile()
                },
                { role: 'quit' }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About',
                    click: () => onAbout()
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

/**
 * Handle the 'open-file' event from the renderer process.
 */
async function onOpenFile() {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow!, {
        filters: [{ name: 'STL Files', extensions: ['stl'] }],
        properties: ['openFile']
    });
    if (!canceled && filePaths.length > 0) {
        logger.info(`Selected file: ${filePaths[0]}`);

        // Load STL file into memory
        mainWindow!.webContents.send('load-stl', filePaths[0]);
    }
}

/**
 * Show about dialog
 */
async function onAbout(): Promise<void> {

    const cpus = backend.get_num_cpus();

    dialog.showMessageBox(mainWindow!, {
        title: 'About',
        message: `This is a simple Electron app to display 3D models in STL format running of a system with ${cpus} CPUs.`,
        buttons: ['OK']
    });
}



/**
 * Main entry point for the Electron app.
 */
app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

/**
 * Quit when all windows are closed
 */
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});
