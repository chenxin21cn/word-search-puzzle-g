import { useState, useCallback, useMemo, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, RotateCcw, Sparkles, Palette, Lightbulb } from '@phosphor-icons/react';
import { WordGrid } from './WordGrid';
import { generateWordSearch } from '../lib/wordSearchGenerator';
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
  const [isCompleted, setIsCompleted] = useState(false);
  const [wordThemes] = useKV<Record<string, string[]>>('word-themes', {
    'Animals': ['CAT', 'DOG', 'BIRD', 'FISH', 'LION'],
    'Colors': ['RED', 'BLUE', 'GREEN', 'PINK', 'BROWN'],
    'Food': ['PIZZA', 'APPLE', 'BREAD', 'CAKE', 'SOUP'],
    'Family': ['MOM', 'DAD', 'BABY', 'UNCLE', 'AUNT']
  });

  useEffect(() => {
    if (currentPuzzle && foundWords.length === currentPuzzle.words.length && foundWords.length > 0) {
      setTimeout(() => setIsCompleted(true), 500);
    }
  }, [currentPuzzle, foundWords]);

  const processWords = useCallback((input: string): string[] => {
    if (!input.trim()) return [];
    
    return input
      .split(',')
      .map(word => word.trim().toUpperCase().replace(/[^A-Z]/g, ''))
      .filter(word => word.length > 0 && word.length <= 10) // Reduced max length
      .filter((word, index, arr) => arr.indexOf(word) === index)
      .slice(0, 8); // Reduced max words from 12 to 8
  }, []);

  const generatePuzzle = useCallback(() => {
    const words = processWords(inputWords);
    if (words.length === 0) return;

    const puzzle = generateWordSearch(words);
    if (puzzle) {
      setCurrentPuzzle(puzzle);
      setFoundWords([]);
      setIsCompleted(false);
      setInputWords('');
    }
  }, [inputWords, setCurrentPuzzle, setFoundWords]);

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
  }, [setCurrentPuzzle, setFoundWords, setShowHints]);

  const toggleHints = useCallback(() => {
    setShowHints(current => !current);
  }, [setShowHints]);

  const validWords = useMemo(() => processWords(inputWords), [inputWords, processWords]);

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
                <h2 className="text-xl font-semibold text-foreground mb-2">Create Your Puzzle</h2>
                <p className="text-muted-foreground text-sm mb-4">
                  Enter words separated by commas. Words will be hidden horizontally and vertically (max 8 words, 10 letters each).
                </p>
              </div>
              
              <div className="space-y-3">
                <Input
                  placeholder="Enter words separated by commas (e.g., CAT, DOG, BIRD, FISH)"
                  value={inputWords}
                  onChange={(e) => setInputWords(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && generatePuzzle()}
                  className="text-base"
                />

                {Object.keys(wordThemes).length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Or choose a theme:</p>
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
                      Words to include ({validWords.length}):
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
                  Generate Puzzle
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
                <h3 className="font-semibold text-foreground">Find These Words</h3>
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
            
            <Button 
              onClick={toggleHints} 
              variant={showHints ? "default" : "outline"}
              className="w-full"
              size="lg"
            >
              <Lightbulb className="mr-2" />
              {showHints ? 'Hide Hints' : 'Show Hints'}
            </Button>
            
            <Button 
              onClick={createNewPuzzle} 
              variant="outline" 
              className="w-full"
              size="lg"
            >
              <RotateCcw className="mr-2" />
              New Puzzle
            </Button>
          </div>
        </motion.div>
      )}

      <Dialog open={isCompleted} onOpenChange={setIsCompleted}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-center justify-center">
              <Sparkles className="text-accent" />
              Congratulations!
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              You found all {currentPuzzle?.words.length} words! Great job!
            </p>
            <Button onClick={createNewPuzzle} className="w-full" size="lg">
              Create New Puzzle
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}