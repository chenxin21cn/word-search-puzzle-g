import { useState, useCallback, useMemo, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, RotateCcw, Sparkles, Palette, Lightbulb } from '@phosphor-icons/react';
import { WordGrid } from './WordGrid';
import { Timer } from './Timer';
import { generateWordSearch, DifficultyLevel, DIFFICULTY_CONFIGS } from '../lib/wordSearchGenerator';
import { motion, AnimatePresence } from 'framer-motion';

export interface WordSearchData {
  grid: string[][];
  words: string[];
  positions: Array<{
    word: string;
    startRow: number;
    startCol: number;
    endRow: number;
    endCol: number;
  }>;
}

export function WordSearchGame() {
  const [inputWords, setInputWords] = useState('');
  const [currentPuzzle, setCurrentPuzzle] = useKV<WordSearchData | null>('current-puzzle', null);
  const [foundWords, setFoundWords] = useKV<string[]>('found-words', []);
  const [showHints, setShowHints] = useKV<boolean>('show-hints', false);
  const [difficulty, setDifficulty] = useKV<DifficultyLevel>('difficulty', 'medium');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerResetKey, setTimerResetKey] = useState(0);
  const [wordThemes] = useKV<Record<string, string[]>>('word-themes', {
    '动物': ['CAT', 'DOG', 'BIRD', 'FISH', 'LION'],
    '颜色': ['RED', 'BLUE', 'GREEN', 'PINK', 'BROWN'],
    '食物': ['PIZZA', 'APPLE', 'BREAD', 'CAKE', 'SOUP'],
    '家庭': ['MOM', 'DAD', 'BABY', 'UNCLE', 'AUNT']
  });

  useEffect(() => {
    if (currentPuzzle && foundWords.length === currentPuzzle.words.length && foundWords.length > 0) {
      setIsTimerRunning(false);
      setTimeout(() => setIsCompleted(true), 500);
    }
  }, [currentPuzzle, foundWords]);

  const processWords = useCallback((input: string): string[] => {
    if (!input.trim()) return [];
    
    const config = DIFFICULTY_CONFIGS[difficulty];
    
    return input
      .split(',')
      .map(word => word.trim().toUpperCase().replace(/[^A-Z]/g, ''))
      .filter(word => word.length > 0 && word.length <= config.maxWordLength)
      .filter((word, index, arr) => arr.indexOf(word) === index)
      .slice(0, config.maxWords);
  }, [difficulty]);

  const generatePuzzle = useCallback(() => {
    const words = processWords(inputWords);
    if (words.length === 0) return;

    const puzzle = generateWordSearch(words, difficulty);
    if (puzzle) {
      setCurrentPuzzle(puzzle);
      setFoundWords([]);
      setIsCompleted(false);
      setInputWords('');
      setIsTimerRunning(true);
      setTimerResetKey(prev => prev + 1);
    }
  }, [inputWords, difficulty, processWords, setCurrentPuzzle, setFoundWords]);

  const loadTheme = useCallback((theme: string) => {
    const themeWords = wordThemes[theme];
    if (themeWords) {
      setInputWords(themeWords.join(', '));
    }
  }, [wordThemes]);

  const handleWordFound = useCallback((word: string) => {
    setFoundWords(current => {
      if (current.includes(word)) return current;
      return [...current, word];
    });
  }, [setFoundWords]);

  const createNewPuzzle = useCallback(() => {
    setIsCompleted(false);
    setCurrentPuzzle(null);
    setFoundWords([]);
    setShowHints(false);
    setIsTimerRunning(false);
    setTimerResetKey(prev => prev + 1);
  }, [setCurrentPuzzle, setFoundWords, setShowHints]);

  const toggleHints = useCallback(() => {
    setShowHints(current => !current);
  }, [setShowHints]);

  const validWords = useMemo(() => processWords(inputWords), [inputWords, processWords]);
  
  const unfoundWords = useMemo(() => {
    return currentPuzzle ? currentPuzzle.words.filter(word => !foundWords.includes(word)) : [];
  }, [currentPuzzle, foundWords]);

  return (
    <div className="space-y-6">
      {!currentPuzzle ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">创建您的拼图</h2>
                <p className="text-muted-foreground text-sm mb-4">
                  输入用逗号分隔的单词。根据难度级别，单词将以不同方向隐藏（最多{DIFFICULTY_CONFIGS[difficulty].maxWords}个单词，每个{DIFFICULTY_CONFIGS[difficulty].maxWordLength}个字母）。
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">难度级别</label>
                  <Select value={difficulty} onValueChange={(value: DifficultyLevel) => setDifficulty(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="选择难度级别" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">简单 - 水平垂直方向，{DIFFICULTY_CONFIGS.easy.maxWords}个单词</SelectItem>
                      <SelectItem value="medium">中等 - 包含斜线方向，{DIFFICULTY_CONFIGS.medium.maxWords}个单词</SelectItem>
                      <SelectItem value="hard">困难 - 所有方向，{DIFFICULTY_CONFIGS.hard.maxWords}个单词</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  placeholder="输入用逗号分隔的单词（例如：CAT、DOG、BIRD、FISH）"
                  value={inputWords}
                  onChange={(e) => setInputWords(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && generatePuzzle()}
                  className="text-base"
                />

                {Object.keys(wordThemes).length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">或选择一个主题：</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(wordThemes).map(([theme, words]) => (
                        <Button
                          key={theme}
                          variant="outline"
                          size="sm"
                          onClick={() => loadTheme(theme)}
                          className="capitalize"
                        >
                          <Palette className="mr-1" size={16} />
                          {theme}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                {validWords.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      要包含的单词 ({validWords.length})：
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {validWords.map((word, index) => (
                        <Badge key={index} variant="secondary">
                          {word}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <Button 
                  onClick={generatePuzzle} 
                  disabled={validWords.length === 0}
                  className="w-full"
                  size="lg"
                >
                  <Plus className="mr-2" />
                  生成拼图
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-2">
            <Card className="p-4">
              <WordGrid
                puzzle={currentPuzzle}
                foundWords={foundWords}
                onWordFound={handleWordFound}
                showHints={showHints}
              />
            </Card>
          </div>
          
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">找到这些单词</h3>
                <div className="text-sm text-muted-foreground">
                  {foundWords.length} / {currentPuzzle.words.length}
                </div>
              </div>
              
              <div className="space-y-2">
                <AnimatePresence>
                  {currentPuzzle.words.map((word) => {
                    const isFound = foundWords.includes(word);
                    return (
                      <motion.div
                        key={word}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`p-2 rounded-md transition-all duration-300 ${
                          isFound 
                            ? 'bg-primary/10 text-primary line-through' 
                            : 'bg-muted/50 text-foreground'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{word}</span>
                          {isFound && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500 }}
                            >
                              <Sparkles className="text-accent" size={16} />
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </Card>
            
            <motion.div
              animate={unfoundWords.length > 0 && !showHints ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Button 
                onClick={toggleHints} 
                variant={showHints ? "default" : "outline"}
                className="w-full"
                size="lg"
              >
                <Lightbulb className="mr-2" />
                {showHints ? `隐藏提示 (${unfoundWords.length} 已显示)` : `显示提示 (${unfoundWords.length} 可用)`}
              </Button>
            </motion.div>
            
            <Button 
              onClick={createNewPuzzle} 
              variant="outline" 
              className="w-full"
              size="lg"
            >
              <RotateCcw className="mr-2" />
              新拼图
            </Button>
          </div>
        </motion.div>
      )}

      {/* Timer at the bottom of the page */}
      {currentPuzzle && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center"
        >
          <Card className="px-6 py-3">
            <Timer 
              isRunning={isTimerRunning} 
              onReset={timerResetKey}
            />
          </Card>
        </motion.div>
      )}

      <Dialog open={isCompleted} onOpenChange={setIsCompleted}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-center justify-center">
              <Sparkles className="text-accent" />
              恭喜！
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              您找到了所有 {currentPuzzle?.words.length} 个单词！做得好！
            </p>
            <Button onClick={createNewPuzzle} className="w-full" size="lg">
              创建新拼图
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}