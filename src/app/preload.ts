import { contextBridge, ipcRenderer } from 'electron';

const explorerUpdateCallbacks = new Map<(tree: string) => void, (event: Electron.IpcRendererEvent, tree: string) => void>();
const explorerExpandCallbacks = new Map<(ids: string[]) => void, (event: Electron.IpcRendererEvent, ids: string[]) => void>();
const explorerSelectCallbacks = new Map<(ids: string[]) => void, (event: Electron.IpcRendererEvent, ids: string[]) => void>();
const meshChangedCallbacks = new Map<(mesh: Buffer) => void, (event: Electron.IpcRendererEvent, mesh: Buffer) => void>();

//
// 'app': Global application API (e.g. open/close project)
//
contextBridge.exposeInMainWorld('app', {
  openProject: () => ipcRenderer.send('app::open-project'),
  closeProject: () => ipcRenderer.send('app::close-project'),
});

//
// 'explorer': Everything related to the explorer
//
contextBridge.exposeInMainWorld('explorer', {

  //
  // 'onUpdate': Register callback to be called when the object tree is updated and the
  //             explorer must reflect that
  //
  onUpdate: (callback: (tree: string) => void) => {

    // Check if the callback is already registered
    if (explorerUpdateCallbacks.has(callback)) {
      console.warn('Callback already registered');
    }

    const wrappedCallback = (_event: Electron.IpcRendererEvent, tree: string) => callback(tree);
    explorerUpdateCallbacks.set(callback, wrappedCallback);
    ipcRenderer.on('explorer::update', wrappedCallback);
  },

  offUpdate: (callback: (tree: string) => void) => {
    const wrappedCallback = explorerUpdateCallbacks.get(callback);
    if (wrappedCallback) {
      ipcRenderer.off('explorer::update', wrappedCallback);
      explorerUpdateCallbacks.delete(callback);
    }
  },

  //
  // 'onExpandItems': Register callback to be called when items should be expanded
  //
  onExpandItems: (callback: (ids: string[]) => void) => {

    // Check if the callback is already registered
    if (explorerExpandCallbacks.has(callback)) {
      console.warn('Callback already registered');
    }

    const wrappedCallback = (_event: Electron.IpcRendererEvent, ids: string[]) => callback(ids);
    explorerExpandCallbacks.set(callback, wrappedCallback);
    ipcRenderer.on('explorer::expand', wrappedCallback);
  },

  offExpandItems: (callback: (ids: string[]) => void) => {
    const wrappedCallback = explorerExpandCallbacks.get(callback);
    if (wrappedCallback) {
      ipcRenderer.off('explorer::expand', wrappedCallback);
      explorerExpandCallbacks.delete(callback);
    }
  },

  //
  // 'onSelectItems': Register callback to be called when items should be selected
  //
  onSelectItems: (callback: (ids: string[]) => void) => {

    // Check if the callback is already registered
    if (explorerSelectCallbacks.has(callback)) {
      console.warn('Callback already registered');
    }

    const wrappedCallback = (_event: Electron.IpcRendererEvent, ids: string[]) => callback(ids);
    explorerSelectCallbacks.set(callback, wrappedCallback);
    ipcRenderer.on('explorer::select', wrappedCallback);
  },
  offSelectItems: (callback: (ids: string[]) => void) => {
    const wrappedCallback = explorerSelectCallbacks.get(callback);
    if (wrappedCallback) {
      ipcRenderer.off('explorer::select', wrappedCallback);
      explorerSelectCallbacks.delete(callback);
    }
  },
});

//
// 'renderer': Everything related to the renderer
//
contextBridge.exposeInMainWorld('renderer', {

  //
  // 'onMeshChanged': Register callback to be called when the mesh is changed
  //
  onMeshChanged: (callback: (mesh: Buffer) => void) => {
    // Check if the callback is already registered
    if (meshChangedCallbacks.has(callback)) {
      console.warn('Callback already registered');
    }

    const wrappedCallback = (_event: Electron.IpcRendererEvent, mesh: Buffer) => callback(mesh);
    meshChangedCallbacks.set(callback, wrappedCallback);
    ipcRenderer.on('renderer::mesh-changed', (_event: Electron.IpcRendererEvent, mesh: Buffer) => callback(mesh));
  },

  offMeshChanged: (callback: (mesh: Buffer) => void) => {
    const wrappedCallback = meshChangedCallbacks.get(callback);
    if (wrappedCallback) {
      ipcRenderer.off('renderer::mesh-changed', wrappedCallback);
      meshChangedCallbacks.delete(callback);
    }
  },
});

//
// 'versions': Expose versions of the components
//
contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
});