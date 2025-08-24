import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { WordSearchData } from './WordSearchGame';

interface Position {
  row: number;
  col: number;
}

interface WordGridProps {
  puzzle: WordSearchData;
  foundWords: string[];
  onWordFound: (word: string) => void;
  showHints: boolean;
}

export function WordGrid({ puzzle, foundWords, onWordFound, showHints }: WordGridProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPos, setStartPos] = useState<Position | null>(null);
  const [currentPos, setCurrentPos] = useState<Position | null>(null);
  const [selectedPath, setSelectedPath] = useState<Position[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);

  const getPositionFromEvent = useCallback((e: React.MouseEvent | React.TouchEvent): Position | null => {
    if (!gridRef.current) return null;
    
    const rect = gridRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY;
    
    if (!clientX || !clientY) return null;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const cellSize = rect.width / puzzle.grid[0].length;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    
    if (row >= 0 && row < puzzle.grid.length && col >= 0 && col < puzzle.grid[0].length) {
      return { row, col };
    }
    
    return null;
  }, [puzzle.grid]);

  const getPathBetweenPositions = useCallback((start: Position, end: Position): Position[] => {
    const path: Position[] = [];
    const rowDiff = end.row - start.row;
    const colDiff = end.col - start.col;
    
    const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
    
    if (steps === 0) {
      return [start];
    }
    
    // Allow horizontal, vertical, and diagonal directions
    const isValidDirection = (
      rowDiff === 0 || // horizontal
      colDiff === 0 || // vertical
      Math.abs(rowDiff) === Math.abs(colDiff) // diagonal
    );
    
    if (!isValidDirection) {
      return [start];
    }
    
    const rowStep = steps > 0 ? rowDiff / steps : 0;
    const colStep = steps > 0 ? colDiff / steps : 0;
    
    for (let i = 0; i <= steps; i++) {
      path.push({
        row: start.row + Math.round(rowStep * i),
        col: start.col + Math.round(colStep * i)
      });
    }
    
    return path;
  }, []);

  const getWordFromPath = useCallback((path: Position[]): string => {
    return path.map(pos => puzzle.grid[pos.row][pos.col]).join('');
  }, [puzzle.grid]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const pos = getPositionFromEvent(e);
    if (pos) {
      setIsSelecting(true);
      setStartPos(pos);
      setCurrentPos(pos);
      setSelectedPath([pos]);
    }
  }, [getPositionFromEvent]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isSelecting || !startPos) return;
    
    const pos = getPositionFromEvent(e);
    if (pos && (pos.row !== currentPos?.row || pos.col !== currentPos?.col)) {
      setCurrentPos(pos);
      const path = getPathBetweenPositions(startPos, pos);
      setSelectedPath(path);
    }
  }, [isSelecting, startPos, currentPos, getPositionFromEvent, getPathBetweenPositions]);

  const handleMouseUp = useCallback(() => {
    if (!isSelecting || selectedPath.length === 0) {
      setIsSelecting(false);
      setStartPos(null);
      setCurrentPos(null);
      setSelectedPath([]);
      return;
    }
    
    const selectedWord = getWordFromPath(selectedPath);
    const reversedWord = selectedWord.split('').reverse().join('');
    
    if (puzzle.words.includes(selectedWord) && !foundWords.includes(selectedWord)) {
      onWordFound(selectedWord);
    } else if (puzzle.words.includes(reversedWord) && !foundWords.includes(reversedWord)) {
      onWordFound(reversedWord);
    }
    
    setIsSelecting(false);
    setStartPos(null);
    setCurrentPos(null);
    setSelectedPath([]);
  }, [isSelecting, selectedPath, getWordFromPath, puzzle.words, foundWords, onWordFound]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const pos = getPositionFromEvent(e);
    if (pos) {
      setIsSelecting(true);
      setStartPos(pos);
      setCurrentPos(pos);
      setSelectedPath([pos]);
    }
  }, [getPositionFromEvent]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSelecting || !startPos) return;
    
    const pos = getPositionFromEvent(e);
    if (pos && (pos.row !== currentPos?.row || pos.col !== currentPos?.col)) {
      setCurrentPos(pos);
      const path = getPathBetweenPositions(startPos, pos);
      setSelectedPath(path);
    }
  }, [isSelecting, startPos, currentPos, getPositionFromEvent, getPathBetweenPositions]);

  const handleTouchEnd = useCallback(() => {
    handleMouseUp();
  }, [handleMouseUp]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isSelecting) {
        handleMouseUp();
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchend', handleGlobalMouseUp);
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, [isSelecting, handleMouseUp]);

  const getFoundWordsPositions = useCallback(() => {
    const positions = new Set<string>();
    
    foundWords.forEach(word => {
      puzzle.positions.forEach(pos => {
        if (pos.word === word) {
          const path = getPathBetweenPositions(
            { row: pos.startRow, col: pos.startCol },
            { row: pos.endRow, col: pos.endCol }
          );
          path.forEach(p => positions.add(`${p.row}-${p.col}`));
        }
      });
    });
    
    return positions;
  }, [foundWords, puzzle.positions, getPathBetweenPositions]);

  const getHintPositions = useCallback(() => {
    if (!showHints) return new Set<string>();
    
    const hintPositions = new Set<string>();
    const unfoundWords = puzzle.words.filter(word => !foundWords.includes(word));
    
    unfoundWords.forEach(word => {
      puzzle.positions.forEach(pos => {
        if (pos.word === word) {
          // Add the first letter position as a hint
          hintPositions.add(`${pos.startRow}-${pos.startCol}`);
        }
      });
    });
    
    return hintPositions;
  }, [showHints, puzzle.words, puzzle.positions, foundWords]);

  const foundPositions = getFoundWordsPositions();
  const hintPositions = getHintPositions();

  const getCellClassName = useCallback((row: number, col: number) => {
    const isSelected = selectedPath.some(pos => pos.row === row && pos.col === col);
    const isFound = foundPositions.has(`${row}-${col}`);
    const isHint = hintPositions.has(`${row}-${col}`);
    
    let className = 'aspect-square flex items-center justify-center text-lg font-bold cursor-pointer select-none transition-all duration-200 border border-border/20 ';
    
    if (isFound) {
      className += 'bg-primary/20 text-primary ';
    } else if (isSelected) {
      className += 'bg-accent/30 text-accent-foreground ';
    } else if (isHint) {
      className += 'bg-accent/30 text-accent border-accent/50 animate-pulse shadow-md ring-2 ring-accent/30 ';
    } else {
      className += 'bg-card hover:bg-muted/50 text-foreground ';
    }
    
    return className;
  }, [selectedPath, foundPositions, hintPositions]);

  return (
    <div className="space-y-4">
      <motion.div
        ref={gridRef}
        className="grid gap-1 max-w-lg mx-auto select-none"
        style={{ 
          gridTemplateColumns: `repeat(${puzzle.grid[0].length}, 1fr)`,
          touchAction: 'none'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {puzzle.grid.map((row, rowIndex) =>
          row.map((letter, colIndex) => (
            <motion.div
              key={`${rowIndex}-${colIndex}`}
              className={getCellClassName(rowIndex, colIndex)}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: (rowIndex + colIndex) * 0.02,
                type: "spring",
                stiffness: 300
              }}
            >
              {letter}
            </motion.div>
          ))
        )}
      </motion.div>
      
      <div className="text-center text-sm text-muted-foreground space-y-1">
        <div>点击并拖拽以水平、垂直或对角线选择单词</div>
        <div className="text-xs">单词可以正向或反向</div>
        {showHints && (
          <div className="text-xs text-accent font-medium">💡 提示：闪烁的字母显示未找到单词的起始位置</div>
        )}
      </div>
    </div>
  );
}