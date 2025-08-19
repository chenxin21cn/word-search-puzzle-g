# Word Search Game

An interactive word search puzzle generator where users can input custom word lists and solve puzzles by dragging across hidden words in multiple directions.

**Experience Qualities**: 
1. **Engaging** - Smooth drag interactions and satisfying word discovery animations create an addictive puzzle-solving experience
2. **Intuitive** - Clear visual feedback and familiar game mechanics make it instantly playable for all ages  
3. **Personalized** - Custom word input allows users to create themed puzzles for education, entertainment, or specific interests

**Complexity Level**: Light Application (multiple features with basic state)
- Combines puzzle generation, interactive selection, progress tracking, and customization features with persistent game state

## Essential Features

**Word Input System**
- Functionality: Accept comma-separated word list from user input
- Purpose: Enable personalized puzzle creation for any theme or difficulty
- Trigger: User types words in input field and clicks "Generate Puzzle"
- Progression: Input words → Validate words → Generate grid → Display puzzle
- Success criteria: Words are properly validated, duplicates removed, and puzzle generates successfully

**Grid Generation Algorithm**
- Functionality: Place words in random positions/directions, fill remaining cells with random letters
- Purpose: Create challenging, varied puzzles with good word distribution
- Trigger: User submits valid word list
- Progression: Parse words → Place words randomly → Fill empty cells → Return grid
- Success criteria: All words fit in grid, no overlaps conflict, random letters fill gaps

**Interactive Word Selection**
- Functionality: Click and drag across letters to select words, highlight selected path
- Purpose: Provide satisfying, precise word discovery mechanism
- Trigger: User clicks on grid cell and drags mouse
- Progression: Mouse down → Track drag path → Highlight cells → Mouse up → Check if valid word
- Success criteria: Smooth selection visual feedback, accurate word detection in all directions

**Progress Tracking**
- Functionality: Mark found words, show completion status, celebration on finish
- Purpose: Provide clear feedback and sense of accomplishment
- Trigger: User successfully selects a hidden word
- Progression: Valid word found → Mark word as found → Update word bank → Check completion → Show success state
- Success criteria: Found words stay highlighted, word bank updates, completion triggers new puzzle option

## Edge Case Handling

- **Duplicate words**: Remove duplicates from input automatically
- **Invalid characters**: Strip non-alphabetic characters and convert to uppercase
- **Empty input**: Show helpful message prompting for word entry
- **Words too long**: Limit word length to ensure grid fit (max 15 characters)
- **Grid overflow**: Dynamically resize grid or limit word count if placement fails
- **Mobile touch**: Support touch events for drag selection on mobile devices

## Design Direction

The design should feel playful yet focused, reminiscent of classic puzzle books but with modern digital polish - clean typography, satisfying interactions, and gentle animations that enhance rather than distract from the core puzzle-solving experience.

## Color Selection

Complementary (opposite colors) - Using a warm blue primary with orange accents to create visual interest while maintaining excellent readability for the letter grid.

- **Primary Color**: Deep Blue (oklch(0.45 0.15 240)) - Communicates focus and intelligence, used for UI elements and found words
- **Secondary Colors**: Light Blue (oklch(0.85 0.08 240)) for subtle backgrounds and Neutral Gray (oklch(0.65 0.02 240)) for inactive states  
- **Accent Color**: Warm Orange (oklch(0.65 0.15 45)) - Creates excitement and draws attention to interactive elements and success states
- **Foreground/Background Pairings**: 
  - Background (White oklch(1 0 0)): Dark Gray text (oklch(0.2 0.02 240)) - Ratio 12.6:1 ✓
  - Primary (Deep Blue oklch(0.45 0.15 240)): White text (oklch(1 0 0)) - Ratio 7.8:1 ✓
  - Accent (Warm Orange oklch(0.65 0.15 45)): White text (oklch(1 0 0)) - Ratio 4.9:1 ✓
  - Card (Light Gray oklch(0.98 0.01 240)): Dark Gray text (oklch(0.2 0.02 240)) - Ratio 11.8:1 ✓

## Font Selection

Typography should be clean and highly legible for the letter grid while feeling approachable and friendly for UI elements - using Inter for its excellent readability at small sizes and modern, geometric character.

- **Typographic Hierarchy**: 
  - H1 (Game Title): Inter Bold/32px/tight letter spacing
  - H2 (Section Headers): Inter Semibold/20px/normal spacing  
  - Body (Instructions): Inter Regular/16px/relaxed line height
  - Grid Letters: Inter Bold/18px/wide letter spacing for clarity
  - Word Bank: Inter Medium/14px/normal spacing

## Animations

Subtle and purposeful animations that provide feedback without being distracting - smooth selection highlighting, gentle word bank updates, and satisfying completion celebrations that enhance the puzzle-solving flow.

- **Purposeful Meaning**: Selection animations guide the eye and confirm actions, while completion effects provide rewarding feedback for puzzle solving
- **Hierarchy of Movement**: Grid selection gets primary animation focus, followed by word bank updates, with UI transitions being most subtle

## Component Selection

- **Components**: Card for word input area, Button for actions, Input for word entry, custom Grid component for puzzle display, Badge for word bank items, Dialog for completion celebration
- **Customizations**: Custom grid component with drag selection, custom word bank with strikethrough animations, custom selection overlay with smooth path highlighting
- **States**: Buttons show hover/active states, grid cells highlight on selection, word bank items animate when found, completion dialog appears with celebration
- **Icon Selection**: Plus for adding words, RotateCcw for new puzzle, Check for completed words, Sparkles for celebration
- **Spacing**: Consistent 4-unit (16px) spacing between major sections, 2-unit (8px) for related elements, 1-unit (4px) for tight groupings
- **Mobile**: Grid scales responsively, touch-friendly cell sizes (minimum 44px), word input becomes full-width, simplified layout with stacked sections