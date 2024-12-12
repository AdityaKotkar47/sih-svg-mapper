import React, { useState } from 'react';
import { Toaster } from "./components/ui/toaster";
import SVGVertexMapper from './components/SVGMapper/SVGVertexMapper';
import SVGModifier from './components/SVGMapper/SVGModifier';
import { Home } from './components/Home/index';
import './App.css';

function App() {
  const [currentMode, setCurrentMode] = useState('home');

  const renderContent = () => {
    switch (currentMode) {
      case 'new':
        return <SVGVertexMapper />;
      case 'modify':
        return <SVGModifier />;
      default:
        return <Home onModeSelect={setCurrentMode} />;
    }
  };

  return (
    <div className="App">
      <Toaster />
      {currentMode !== 'home' && (
        <button
          onClick={() => setCurrentMode('home')}
          className="fixed top-4 left-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          Back to Home
        </button>
      )}
      {renderContent()}
    </div>
  );
}

export default App;