import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('app', {

  //
  // ZInspector API functions
  //
  openProject: () => ipcRenderer.send('app::open-project'),

  //
  // ZInspector callback functions
  //
  onTriggerRenderer: (callback: (message: string) => void) => ipcRenderer.on('app::trigger', (_event, message) => callback(message)),
  onUpdate: (callback: (elements: string) => void) => ipcRenderer.on('app::update', (_event, elements) => callback(elements))

});

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron
});

