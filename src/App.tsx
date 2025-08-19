import React from 'react';
import { WordSearchGame } from './components/WordSearchGame';

function App() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Word Search Game</h1>
          <p className="text-muted-foreground text-lg">Create custom word puzzles and find hidden words!</p>
        </div>
        <WordSearchGame />
      </div>
    </div>
  );
}

export default App;