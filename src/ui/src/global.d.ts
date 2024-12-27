interface Window {
    explorer: {
        onUpdate: (callback: (elements: string) => void) => void;
        offUpdate: (callback: (elements: string) => void) => void;

        onExpandItems: (callback: (ids: string[]) => void) => void;
        offExpandItems: (callback: (ids: string[]) => void) => void;

        onSelectItems: (callback: (ids: string[]) => void) => void;
        offSelectItems: (callback: (ids: string[]) => void) => void;
    };
    app: {
        openProject: () => void;
        closeProject: () => void;
    };
    renderer: {
        onMeshChanged(callback: (mesh: Buffer) => void): void;
    };
    versions: {
        node: () => string;
        chrome: () => string;
        electron: () => string;
    };
}