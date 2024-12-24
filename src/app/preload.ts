import { contextBridge, ipcRenderer } from 'electron';

const updateCallbacks = new Map<(tree: string) => void, (event: Electron.IpcRendererEvent, tree: string) => void>();
const expandCallbacks = new Map<(ids: string[]) => void, (event: Electron.IpcRendererEvent, ids: string[]) => void>();
const selectCallbacks = new Map<(ids: string[]) => void, (event: Electron.IpcRendererEvent, ids: string[]) => void>();

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
    if (updateCallbacks.has(callback)) {
      console.warn('Callback already registered');
    }

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

  //
  // 'onExpandItems': Register callback to be called when items should be expanded
  //
  onExpandItems: (callback: (ids: string[]) => void) => {

    // Check if the callback is already registered
    if (expandCallbacks.has(callback)) {
      console.warn('Callback already registered');
    }

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

  //
  // 'onSelectItems': Register callback to be called when items should be selected
  //
  onSelectItems: (callback: (ids: string[]) => void) => {

    // Check if the callback is already registered
    if (selectCallbacks.has(callback)) {
      console.warn('Callback already registered');
    }

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

//
// 'versions': Expose versions of the components
//
contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
});