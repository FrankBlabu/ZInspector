import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import TreeView from 'react-treeview';
import 'react-treeview/react-treeview.css';

window.app.onTriggerRenderer((message: string) => {
  console.log(`*** Received message from main: ${message}`);
});

function App() {
  const [count, setCount] = useState(0);
  const [treeData, setTreeData] = useState([
    {
      label: 'Projects',
      children: []
    },
  ]);

  useEffect(() => {
    //const { ipcRenderer } = window.require('electron');

    window.app.onUpdate((elements: string) => {
      const parsed_elements = JSON.parse(elements);

      console.log(`*** Received elements from main: `, parsed_elements);
      console.log('Before: ', treeData);

      setTreeData([parsed_elements]);
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
        {treeData.map((node, i) => (
          <TreeView key={i} nodeLabel={node.label} defaultCollapsed={false}>
            {node.children && node.children.map((child, j) => (
              <TreeView key={j} nodeLabel={child.label} defaultCollapsed={false}>
                {child.children && child.children.map((grandchild, k) => (
                  <TreeView key={k} nodeLabel={grandchild.label} defaultCollapsed={false} />
                ))}
              </TreeView>
            ))}
          </TreeView>
        ))}
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