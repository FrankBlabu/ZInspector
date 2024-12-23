import { contextBridge, ipcRenderer } from 'electron';

const updateCallbacks = new Map<(tree: string) => void, (event: Electron.IpcRendererEvent, tree: string) => void>();
const expandCallbacks = new Map<(ids: string[]) => void, (event: Electron.IpcRendererEvent, ids: string[]) => void>();
const selectCallbacks = new Map<(ids: string[]) => void, (event: Electron.IpcRendererEvent, ids: string[]) => void>();

contextBridge.exposeInMainWorld('app', {
  openProject: () => ipcRenderer.send('app::open-project'),
  closeProject: () => ipcRenderer.send('app::close-project'),
});

contextBridge.exposeInMainWorld('explorer', {
  onUpdate: (callback: (tree: string) => void) => {
    const wrappedCallback = (_event: Electron.IpcRendererEvent, tree: string) => callback(tree);
    updateCallbacks.set(callback, wrappedCallback);
    ipcRenderer.on('explorer::update', wrappedCallback);
  },
  offUpdate: (callback: (tree: string) => void) => {
    const wrappedCallback = updateCallbacks.get(callback);
    if (wrappedCallback) {
      ipcRenderer.off('explorer::update', wrappedCallback);
      updateCallbacks.delete(callback);
    }
  },
  onExpandItems: (callback: (ids: string[]) => void) => {
    const wrappedCallback = (_event: Electron.IpcRendererEvent, ids: string[]) => callback(ids);
    expandCallbacks.set(callback, wrappedCallback);
    ipcRenderer.on('explorer::expand', wrappedCallback);
  },
  offExpandItems: (callback: (ids: string[]) => void) => {
    const wrappedCallback = expandCallbacks.get(callback);
    if (wrappedCallback) {
      ipcRenderer.off('explorer::expand', wrappedCallback);
      expandCallbacks.delete(callback);
    }
  },
  onSelectItems: (callback: (ids: string[]) => void) => {
    const wrappedCallback = (_event: Electron.IpcRendererEvent, ids: string[]) => callback(ids);
    selectCallbacks.set(callback, wrappedCallback);
    ipcRenderer.on('explorer::select', wrappedCallback);
  },
  offSelectItems: (callback: (ids: string[]) => void) => {
    const wrappedCallback = selectCallbacks.get(callback);
    if (wrappedCallback) {
      ipcRenderer.off('explorer::select', wrappedCallback);
      selectCallbacks.delete(callback);
    }
  },
});

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
});