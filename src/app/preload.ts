import { contextBridge, ipcRenderer } from 'electron';

const meshChangedCallbacks = new Map<(mesh: Buffer) => void, (event: Electron.IpcRendererEvent, mesh: Buffer) => void>();
const adaptViewCallbacks = new Map<() => void, (event: Electron.IpcRendererEvent) => void>();

//
// 'app': Global application API (e.g. open/close project)
//
contextBridge.exposeInMainWorld('app', {
  openProject: () => ipcRenderer.send('app::open-project'),
  closeProject: () => ipcRenderer.send('app::close-project'),
});

let cb: any = null;

//
// 'explorer': Everything related to the explorer
//
contextBridge.exposeInMainWorld('explorer', {

  //
  // 'onUpdate': Register callback to be called when the object tree is updated and the
  //             explorer must reflect that
  //
  onUpdate: (callback: (_event: Electron.IpcRendererEvent, tree: string) => void) => {
    console.log('***** 1a:', ipcRenderer.listenerCount('explorer::update'), callback === cb);
    ipcRenderer.on('explorer::update', callback);
    cb = callback;
    console.log('***** 1b:', ipcRenderer.listenerCount('explorer::update'), callback === cb);
  },
  offUpdate: (callback: (_event: Electron.IpcRendererEvent, tree: string) => void) => {
    console.log('***** 2a:', ipcRenderer.listenerCount('explorer::update'), callback === cb);
    ipcRenderer.off('explorer::update', callback);
    console.log('***** 2b:', ipcRenderer.listenerCount('explorer::update'));
  },

  //
  // 'onExpandItems': Register callback to be called when items should be expanded
  //
  onExpandItems: (callback: (_event: Electron.IpcRendererEvent, ids: string[]) => void) => {
    ipcRenderer.on('explorer::expand', callback);
  },
  offExpandItems: (callback: (_event: Electron.IpcRendererEvent, ids: string[]) => void) => {
    ipcRenderer.off('explorer::expand', callback);
  },

  //
  // 'onSelectItems': Register callback to be called when items should be selected
  //
  onSelectItems: (callback: (_event: Electron.IpcRendererEvent, ids: string[]) => void) => {
    ipcRenderer.on('explorer::select', callback);
  },
  offSelectItems: (callback: (_event: Electron.IpcRendererEvent, ids: string[]) => void) => {
    ipcRenderer.off('explorer::select', callback);
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

  onAdaptView: (callback: () => void) => {
    const wrappedCallback = (_event: Electron.IpcRendererEvent) => callback();
    adaptViewCallbacks.set(callback, wrappedCallback);
    ipcRenderer.on('renderer::adapt-view', (_event: Electron.IpcRendererEvent, mesh: Buffer) => callback());
  },

  offAdaptView: (callback: () => void) => {
    const wrappedCallback = adaptViewCallbacks.get(callback);
    if (wrappedCallback) {
      ipcRenderer.off('renderer::adapt-view', wrappedCallback);
      adaptViewCallbacks.delete(callback);
    }
  }
});

//
// 'versions': Expose versions of the components
//
contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
});