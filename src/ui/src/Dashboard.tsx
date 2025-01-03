import { useState } from 'react';
import reactLogo from './assets/logos/react.svg';
import viteLogo from '/vite.svg';

import './assets/Dashboard.scss';

function Dashboard() {

  const [count, setCount] = useState(0);

  return (
    <div className="dashboard">
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
  );
}

export default Dashboard;