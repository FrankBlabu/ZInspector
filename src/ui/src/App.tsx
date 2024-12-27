import Explorer from './Explorer.tsx'

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
//import Button from '@mui/material/Button';

import Workbench from './Workbench.tsx'
import './assets/App.scss';

function App() {

  const theme = createTheme({
    palette: {
      mode: 'light', // Change to 'dark' for the dark theme
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app-container">
        <Explorer />
        <Workbench />
      </div>
    </ThemeProvider>
  );
}

export default App;