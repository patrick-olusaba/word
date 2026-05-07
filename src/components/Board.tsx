import type { TileState } from '../types';
import { WORD_LENGTH } from '../hooks/useWordle';
import './Board.css';

interface TileProps {
  letter: string;
  state: TileState;
  isFlipping: boolean;
  flipDelay: number;
  isWinning: boolean;
  winDelay: number;
  isPopping: boolean;
  isHint: boolean;
}

function Tile({ letter, state, isFlipping, flipDelay, isWinning, winDelay, isPopping, isHint }: TileProps) {
  const colorClass = state !== 'empty' && state !== 'active' ? `tile--${state}` : '';
  const activeClass = state === 'active' ? 'tile--active' : '';
  const filledClass = letter ? 'tile--filled' : '';
  const flipClass = isFlipping ? 'tile--flipping' : '';
  const winClass = isWinning ? 'tile--win' : '';
  const popClass = isPopping ? 'tile--pop' : '';
  const hintClass = isHint ? 'tile--hint' : '';

  const style: React.CSSProperties = {};
  if (isFlipping) style.animationDelay = `${flipDelay}ms`;
  if (isWinning) style.animationDelay = `${winDelay}ms`;

  return (
    <div
      className={`tile ${colorClass} ${activeClass} ${filledClass} ${flipClass} ${winClass} ${popClass} ${hintClass}`}
      style={style}
    >
      {letter}
    </div>
  );
}

interface BoardProps {
  guesses: string[];
  results: TileState[][];
  currentGuess: string;
  animatingRow: number;
  animatingGuess: string;
  animatingResult: TileState[] | null;
  shakeRow: number;
  winRow: number;
  popCol: number;
  hintCol: number;
  maxGuesses: number;
}

export function Board({
  guesses, results, currentGuess, animatingRow, animatingGuess,
  animatingResult, shakeRow, winRow, popCol, hintCol, maxGuesses,
}: BoardProps) {
  const currentRow = guesses.length;

  return (
    <div className="board" role="grid" aria-label="Wordle board">
      {Array.from({ length: maxGuesses }, (_, rowIdx) => {
        const isCompleted = rowIdx < guesses.length;
        const isAnimating = rowIdx === animatingRow && animatingResult !== null;
        const isCurrent = !isCompleted && !isAnimating && rowIdx === currentRow;
        const isShaking = rowIdx === shakeRow;
        const isWinRow = rowIdx === winRow;

        let letters: string[];
        let states: TileState[];

        if (isCompleted) {
          letters = guesses[rowIdx].split('');
          states = results[rowIdx];
        } else if (isAnimating) {
          letters = animatingGuess.split('');
          states = animatingResult!;
        } else if (isCurrent) {
          letters = currentGuess.split('');
          states = Array.from({ length: WORD_LENGTH }, (_, i) => letters[i] ? 'active' : 'empty');
        } else {
          letters = [];
          states = Array(WORD_LENGTH).fill('empty');
        }

        return (
          <div key={rowIdx} className={`board__row ${isShaking ? 'board__row--shake' : ''}`} role="row">
            {Array.from({ length: WORD_LENGTH }, (_, colIdx) => (
              <Tile
                key={colIdx}
                letter={letters[colIdx] ?? ''}
                state={states[colIdx] ?? 'empty'}
                isFlipping={isAnimating}
                flipDelay={colIdx * 300}
                isWinning={isWinRow}
                winDelay={colIdx * 100}
                isPopping={isCurrent && colIdx === popCol}
                isHint={!isCompleted && !isAnimating && colIdx === hintCol}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
