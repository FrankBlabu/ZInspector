interface Window {
    explorer: {
        onUpdate: (callback: (event: Electron.IpcRendererEvent, elements: string) => void) => void;
        offUpdate: (callback: (event: Electron.IpcRendererEvent, elements: string) => void) => void;

        onExpandItems: (callback: (event: Electron.IpcRendererEvent, ids: string[]) => void) => void;
        offExpandItems: (callback: (event: Electron.IpcRendererEvent, ids: string[]) => void) => void;

        onSelectItems: (callback: (event: Electron.IpcRendererEvent, ids: string[]) => void) => void;
        offSelectItems: (callback: (event: Electron.IpcRendererEvent, ids: string[]) => void) => void;
    };
    app: {
        openProject: () => void;
        closeProject: () => void;
    };
    renderer: {
        onMeshChanged(callback: (mesh: Buffer) => void): void;
        offMeshChanged(callback: (mesh: Buffer) => void): void;
        onAdaptView(callback: () => void): void;
        offAdaptView(callback: () => void): void;
    };
    versions: {
        node: () => string;
        chrome: () => string;
        electron: () => string;
    };
}