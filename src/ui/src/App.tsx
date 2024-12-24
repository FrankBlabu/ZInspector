import Explorer from './Explorer.tsx'
//import StartPage from './StartPage.tsx'
import Workbench from './Workbench.tsx'
import './App.css';

function App() {


  return (
    <div className="app-container">
      <div className="explorer">
        <Explorer />
      </div>
      <div className="start-page">
        <Workbench />
      </div>
    </div>
  );
}

export default App;