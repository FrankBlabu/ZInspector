import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import { TreeViewBaseItem, TreeViewItemId } from '@mui/x-tree-view/models';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';

import './App.css';

function App() {

  const [count, setCount] = useState(0);
  const [callbackRegistered, setCallbackRegistered] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [treeData, setTreeData] = useState(() => {
    const items: TreeViewBaseItem[] = [{
      id: '',
      label: 'Projects',
      children: []
    }];

    return items;
  });

  useEffect(() => {

    const onUpdateFunc = (elements: string) => {
      const parsed_elements = JSON.parse(elements);
      console.log('Update: ', parsed_elements);
      setTreeData(parsed_elements);
    };

    const onExpandFunc = (ids: string[]) => {
      console.log('Expand: ', ids);
      setExpandedItems(ids);
    }

    const onSelectFunc = (ids: string[]) => {
      console.log('Select: ', ids);
      setSelectedItems(ids);
    }

    if (!callbackRegistered) {
      window.explorer.onUpdate(onUpdateFunc);
      window.explorer.onExpandItems(onExpandFunc);
      window.explorer.onSelectItems(onSelectFunc);
      setCallbackRegistered(true);
    }

    return () => {
      window.explorer.offUpdate(onUpdateFunc);
      window.explorer.offExpandItems(onExpandFunc);
      window.explorer.offSelectItems(onSelectFunc);
    };

  }, [callbackRegistered]);

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