import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
    return <div>Hello World</div>;
}

const root = document!.getElementById('root');
if (root) {
    const app = createRoot(root);
    app.render(<App />);
}