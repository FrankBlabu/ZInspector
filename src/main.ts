/**
 * main.ts - Main entry point for the Electron app.
 * 
 * This file creates the main window and sets up the application.
 */

import { app, BrowserWindow, Menu, dialog } from 'electron';
import logger from './logging';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';
import * as net from 'net';
import prompt from 'electron-prompt';

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

/**********************************************************************
 * Global data
 */

/*
 * Global application state
 */
namespace AppState {
    export let mainWindow: BrowserWindow | null = null;
    export let process: ChildProcess | null = null;
    export let server: any = null;
};

/**********************************************************************
 * Main window creation
 */


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

/**********************************************************************
 * Menu handler functions
 */

/**
 * Handle the 'new project' event
 */
async function onNewProject() {

    const name = await prompt({
        title: 'Create new project',
        label: 'Project name:',
        inputAttrs: {
            type: 'text'
        },
        type: 'input'
    });

    if (name !== null) {

        logger.info(`Creating new project: ${name}`);

        AppState.server.CreateProject({ name: name }, (error: any, response: any) => {
            if (error)
                handleError(error);
            else {
                const ids = response.ids;
                logger.info(`Project created, ids=${ids}`);
            }
        });
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

        AppState.server.GetObjects({ parent: '' }, (error: any, response: any) => {
            const { ids } = response;

            if (error)
                handleError(error);
            else if (ids.length === 0)
                handleError('No projects found');
            else {
                logger.debug(`Projects: ${ids}, path: ${path}`);

                AppState.server.ImportMesh({ project: ids[0], path: path }, (error: any, response: any) => {
                    const { ids } = response;

                    if (error)
                        handleError(error);
                    else {
                        logger.info(`Mesh created, id=${ids}`);
                    }
                });
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
async function onPrintObjectTree() {

    async function collectTree(parent_id: string, indent: number): Promise<string[]> {
        const lines: string[] = [];
        const prefix = ' '.repeat(indent);

        try {
            const response = await new Promise<any>((resolve, reject) => {
                AppState.server.GetObjects({ id: parent_id }, (error: any, response: any) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(response);
                    }
                });
            });


            for (const id of response.ids) {
                const name = await getObjectName(id);
                lines.push(`${prefix}${name} (${id})`);
                const childLines = await collectTree(id, indent + 4);
                lines.push(...childLines);
            }
        } catch (error) {
            logger.error(error);
        }

        return lines;
    }

    const lines: string[] = await collectTree('', 0);

    logger.debug('Object tree:\n' + lines.join('\n'));
}

/**********************************************************************
 * Auxiliary functions
 */

/**
 * Check if a port is free.
 * 
 * @param port The port to check
 * @returns True if the port is free, false otherwise
 */
async function isPortFree(port: number): Promise<boolean> {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.once('error', (err: Error) => {
            resolve(false);
        });
        server.once('listening', () => {
            server.close(() => {
                resolve(true);
            });
        });
        server.listen(port);
    });
}

/**
 * Find a free port.
 * 
 * @param start The start port
 * @param end The end port
 * @returns The free port
 */
async function findFreePort(start: number, end: number): Promise<number> {
    for (let port = start; port <= end; port++) {
        if (await isPortFree(port)) {
            return port;
        }
    }
    throw new Error('No free port found');
}

/**
 * Query the name of an object
 */
async function getObjectName(id: string): Promise<string> {
    return new Promise((resolve, reject) => {
        AppState.server.GetName({ id: id }, (error: any, response: any) => {
            if (error)
                reject(error);
            else
                resolve(response.name);
        });
    });
}


/**
 * Handle an error.
 * 
 * @param error The error to handle
 */
function handleError(error: any): void {
    if (error instanceof Error) {
        logger.error(error.message);
        dialog.showErrorBox('Error', error.message);
    }
    else {
        logger.error(error);
        dialog.showErrorBox('Error', error);
    }
}

/**
 * Log line from server according to its level
 */
function logServerLine(text: string) {

    const lines = text.split('\n').filter((line: string) => line.length > 0);
    for (let line of lines) {
        line = line.trim();

        if (line.startsWith('INFO: '))
            logger.info(`[SERVER] ${line.substring(6)}`);
        else if (line.startsWith('WARNING: '))
            logger.warn(`[SERVER] ${line.substring(9)}`);
        else if (line.startsWith('ERROR: '))
            logger.error(`[SERVER] ${line.substring(7)}`);
        else if (line.startsWith('DEBUG: '))
            logger.debug(`[SERVER] ${line.substring(7)}`);
        else
            logger.debug(`[SERVER] ${line}`);
    }
}

/**********************************************************************
 * Event handlers
 */

/**
 * Main entry point for the Electron app.
 */
app.whenReady().then(async () => {

    const port = await findFreePort(55000, 55050);

    //
    // Start the Python backend
    //    
    logger.info(`Starting Python server at port ${port}`);

    AppState.process = spawn('python', ['dist/server/zinspector.py', '--port', port.toString()]);

    AppState.process.stdout!.on('data', (data: any) => {
        logServerLine(data.toString());
    });

    AppState.process.stderr!.on('data', (data: any) => {
        logServerLine(data.toString());
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
