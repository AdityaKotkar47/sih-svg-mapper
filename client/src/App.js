import React from 'react';
import { Toaster } from "./components/ui/toaster";
import SVGVertexMapper from './components/SVGMapper/SVGVertexMapper';
import './App.css';

function App() {
  return (
    <div className="App">
      <Toaster />
      <SVGVertexMapper />
    </div>
  );
}

export default App;