import React from 'react';
import { WordSearchGame } from './components/WordSearchGame';

function App() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">单词搜索游戏</h1>
          <p className="text-muted-foreground text-lg">创建自定义单词拼图并找到隐藏的单词！</p>
        </div>
        <WordSearchGame />
      </div>
    </div>
  );
}

export default App;