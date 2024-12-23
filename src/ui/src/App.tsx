import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
//import 'react-treeview/react-treeview.css';

//import Box from '@mui/material/Box';
import { TreeViewBaseItem } from '@mui/x-tree-view/models';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';

window.app.onTriggerRenderer((message: string) => {
  console.log(`*** Received message from main: ${message}`);
});

function App() {
  const [count, setCount] = useState(0);
  const [treeData, setTreeData] = useState(() => {
    const items: TreeViewBaseItem[] = [{
      id: '',
      label: 'Projects',
      children: []
    }];

    return items;
  });

  useEffect(() => {
    //const { ipcRenderer } = window.require('electron');

    window.app.onUpdate((elements: string) => {
      const parsed_elements = JSON.parse(elements);

      console.log(`*** Received elements from main: `, parsed_elements);
      console.log('Before: ', treeData);

      const items: TreeViewBaseItem[] = parsed_elements;

      setTreeData(items);
    });

    /*
    return () => {
      ipcRenderer.removeAllListeners('app::update');
    }
      */
  }, [treeData]);

  return (
    <div className="app-container">
      <div className="explorer">
        <RichTreeView items={treeData} />
      </div>
      <div className="start-page">
        <div>
          <a href="https://vite.dev" target="_blank">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        <h1>Vite + React</h1>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
          <button onClick={() => window.app.openProject()}>Trigger</button>
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>
        <p className="read-the-docs">
          Click on the Vite and React logos to learn more
        </p>
        <p>
          Node.js version: {window.versions.node()}
          <br />
          Chrome version: {window.versions.chrome()}
        </p>
      </div>
    </div>
  );
}

export default App;