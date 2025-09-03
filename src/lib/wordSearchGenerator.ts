export interface WordPosition {
  word: string;
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export interface WordSearchResult {
  grid: string[][];
  words: string[];
  positions: WordPosition[];
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface DifficultyConfig {
  gridSize: { min: number; max: number };
  maxWords: number;
  maxWordLength: number;
  allowedDirections: number[][];
  placementAttempts: number;
}

export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  easy: {
    gridSize: { min: 8, max: 12 },
    maxWords: 6,
    maxWordLength: 8,
    allowedDirections: [
      [0, 1],   // horizontal right
      [0, -1],  // horizontal left
      [1, 0],   // vertical down
      [-1, 0],  // vertical up
    ],
    placementAttempts: 100,
  },
  medium: {
    gridSize: { min: 10, max: 15 },
    maxWords: 8,
    maxWordLength: 10,
    allowedDirections: [
      [0, 1],   // horizontal right
      [0, -1],  // horizontal left
      [1, 0],   // vertical down
      [-1, 0],  // vertical up
      [1, 1],   // diagonal down-right
      [1, -1],  // diagonal down-left
      [-1, 1],  // diagonal up-right
      [-1, -1], // diagonal up-left
    ],
    placementAttempts: 150,
  },
  hard: {
    gridSize: { min: 12, max: 18 },
    maxWords: 12,
    maxWordLength: 15,
    allowedDirections: [
      [0, 1],   // horizontal right
      [0, -1],  // horizontal left
      [1, 0],   // vertical down
      [-1, 0],  // vertical up
      [1, 1],   // diagonal down-right
      [1, -1],  // diagonal down-left
      [-1, 1],  // diagonal up-right
      [-1, -1], // diagonal up-left
    ],
    placementAttempts: 200,
  },
};

const DIRECTIONS = [
  [0, 1],   // horizontal right
  [0, -1],  // horizontal left
  [1, 0],   // vertical down
  [-1, 0],  // vertical up
  [1, 1],   // diagonal down-right
  [1, -1],  // diagonal down-left
  [-1, 1],  // diagonal up-right
  [-1, -1], // diagonal up-left
];

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomLetter(): string {
  return String.fromCharCode(65 + Math.floor(Math.random() * 26));
}

function canPlaceWord(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  direction: number[]
): boolean {
  const [dRow, dCol] = direction;
  const endRow = row + (word.length - 1) * dRow;
  const endCol = col + (word.length - 1) * dCol;

  // Check bounds
  if (endRow < 0 || endRow >= grid.length || endCol < 0 || endCol >= grid[0].length) {
    return false;
  }

  // Check if cells are empty or contain the same letter
  for (let i = 0; i < word.length; i++) {
    const currentRow = row + i * dRow;
    const currentCol = col + i * dCol;
    const currentCell = grid[currentRow][currentCol];
    
    if (currentCell !== '' && currentCell !== word[i]) {
      return false;
    }
  }

  return true;
}

function placeWord(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  direction: number[]
): WordPosition {
  const [dRow, dCol] = direction;
  
  for (let i = 0; i < word.length; i++) {
    const currentRow = row + i * dRow;
    const currentCol = col + i * dCol;
    grid[currentRow][currentCol] = word[i];
  }

  return {
    word,
    startRow: row,
    startCol: col,
    endRow: row + (word.length - 1) * dRow,
    endCol: col + (word.length - 1) * dCol,
  };
}

export function generateWordSearch(words: string[], difficulty: DifficultyLevel = 'medium'): WordSearchResult | null {
  if (words.length === 0) return null;

  const config = DIFFICULTY_CONFIGS[difficulty];
  const maxWordLength = Math.max(...words.map(w => w.length));
  const gridSize = Math.max(config.gridSize.min, Math.min(config.gridSize.max, maxWordLength + 3));
  
  // Initialize empty grid
  const grid: string[][] = Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill(''));

  const positions: WordPosition[] = [];
  const placedWords: string[] = [];

  // Sort words by length (longest first) for better placement success
  const sortedWords = [...words].sort((a, b) => b.length - a.length);

  for (const word of sortedWords) {
    let placed = false;
    let attempts = 0;
    const maxAttempts = config.placementAttempts;

    while (!placed && attempts < maxAttempts) {
      const direction = config.allowedDirections[Math.floor(Math.random() * config.allowedDirections.length)];
      const row = getRandomInt(0, gridSize - 1);
      const col = getRandomInt(0, gridSize - 1);

      if (canPlaceWord(grid, word, row, col, direction)) {
        const position = placeWord(grid, word, row, col, direction);
        positions.push(position);
        placedWords.push(word);
        placed = true;
      }

      attempts++;
    }

    if (!placed) {
      console.warn(`Could not place word: ${word}`);
    }
  }

  // Fill empty cells with random letters
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (grid[row][col] === '') {
        grid[row][col] = getRandomLetter();
      }
    }
  }

  return {
    grid,
    words: placedWords,
    positions,
  };
}