/**
 * main.ts - Main entry point for the Electron app.
 * 
 * This file creates the main window and sets up the application.
 */

import { app, BrowserWindow, Menu, dialog } from 'electron';
import logger from './logging';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

/*
 * Global application state
 */
namespace AppState {
    export let mainWindow: BrowserWindow | null = null;
    export let process: ChildProcess | null = null;
    export let server: any = null;
};

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
    AppState.mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    AppState.mainWindow.loadFile('ui/index.html');

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
    const { canceled, filePaths } = await dialog.showOpenDialog(AppState.mainWindow!, {
        filters: [{ name: 'STL Files', extensions: ['stl'] }],
        properties: ['openFile']
    });
    if (!canceled && filePaths.length > 0) {
        AppState.server.LoadModel({ path: filePaths[0] }, (error: any, response: any) => {
            if (error) {
                logger.error(`Error: ${error}`);
            } else {
                logger.info(`Model loaded`);
            }
        });
    }
}

/*
 * Show about dialog
 */
async function onAbout(): Promise<void> {

    dialog.showMessageBox(AppState.mainWindow!, {
        title: 'About',
        message: `This is a simple Electron app to display 3D models in STL format.`,
        buttons: ['OK']
    });
}

/**
 * Main entry point for the Electron app.
 */
app.whenReady().then(() => {

    const port = 55010;

    //
    // Start the Python backend
    //    
    logger.info('Starting Python server');
    AppState.process = spawn('python', ['dist/server/zinspector.py', '--port', port.toString()]);

    AppState.process.stdout!.on('data', (data) => {
        logger.debug(`Python stdout: ${data}`);
    });

    AppState.process.stderr!.on('data', (data) => {
        logger.error(`Python stderr: ${data}`);
    });

    AppState.process.on('close', (code) => {
        logger.info(`Python process exited with code ${code}`);
        AppState.process = null;
    });

    // Execute when process has been started
    AppState.process.on('spawn', () => {

        logger.debug(`Process spawned`);

        //
        // Connect to the gRPC server
        //
        const packageDefinition = protoLoader.loadSync('dist/server/zinspector.proto', {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
        });

        const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
        const ZInspector = protoDescriptor.ZInspector;

        // Connect to the gRPC server
        AppState.server = new ZInspector(`localhost:${port}`, grpc.credentials.createInsecure());

        // Call the gRPC method
        AppState.server.GetGreeting({ name: 'Electron' }, (error: any, response: any) => {

            logger.debug(`GetGreeting response: ${response}`);

            if (error) {
                logger.error(`Error: ${error}`);
            } else {
                logger.info(`Greeting: ${response.message}`);
            }
        });
    });


    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

    AppState.mainWindow!.on('closed', () => {
        AppState.mainWindow = null;
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
