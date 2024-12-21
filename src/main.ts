/**
 * main.ts - Main entry point for the Electron app.
 * 
 * This file creates the main window and sets up the application.
 */

import { app, BrowserWindow, Menu, dialog } from 'electron';
import logger from './logging';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';
import prompt from 'electron-prompt';

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
                    label: 'New project',
                    click: async () => onNewProject()
                },
                {
                    label: 'Import mesh',
                    click: async () => onImportMesh()
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
                    label: 'Print object tree',
                    click: () => onPrintObjectTree()
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
 * Handle the 'new project' event
 */
async function onNewProject() {

    try {
        const name = await prompt({
            title: 'Create new project',
            label: 'Project name:',
            inputAttrs: {
                type: 'text'
            },
            type: 'input'
        });

        if (name !== null) {

            AppState.server.CreateProject({ name: name }, (error: any, response: any) => {

                if (error)
                    throw error;

                logger.info(`Project created, ids=${response.ids}`);
            });
        }
    } catch (error) {
        logger.error(error);
    }
}

/**
 * Handle the 'import mesh' event
 */
async function onImportMesh() {
    const { canceled, filePaths } = await dialog.showOpenDialog(AppState.mainWindow!, {
        filters: [{ name: 'STL Files', extensions: ['stl'] }],
        properties: ['openFile']
    });

    if (!canceled && filePaths.length > 0) {
        const path: string = filePaths[0];
        logger.info(`Importing mesh: ${path}`);

        AppState.server.ImportMesh({ path: path }, (error: any, response: any) => {

            logger.info(`ImportMesh response: ${response}`);

            if (error) {
                logger.error(error);
                dialog.showErrorBox('Error', error);
            } else {
                logger.info(`Mesh created, id=${response.ids}`);
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
 * Print object tree to console
 */
function onPrintObjectTree() {

    function printTree(parent_id: string, indent: number) {

        const prefix = ' '.repeat(indent);

        AppState.server.GetItems({ parent: parent_id }, (error: any, response: any) => {

            if (error) {
                logger.error(error);
            } else {
                for (const id of response.ids) {
                    logger.info(`${prefix}${id}`);
                    printTree(id, indent + 4);
                }
            }
        });
    }

    printTree('', 0);
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

    // Ensure the child process is terminated if the application crashes
    const terminateChildProcess = () => {
        if (AppState.process) {
            AppState.process.kill();
            AppState.process = null;
        }
    };

    process.on('exit', terminateChildProcess);
    process.on('SIGINT', terminateChildProcess);
    process.on('SIGTERM', terminateChildProcess);
    process.on('uncaughtException', terminateChildProcess);
});

/**
 * Quit when all windows are closed
 */
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});
