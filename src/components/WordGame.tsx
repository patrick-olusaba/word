import { useEffect, useState } from 'react';
import { useWordle } from '../hooks/useWordle';
import type { Difficulty } from '../hooks/useWordle';
import { Board } from './Board';
import { Keyboard } from './Keyboard';
import { StatsModal, HelpModal } from './Modal';
import { Intro } from './Intro';

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export function WordGame() {
  const game = useWordle();
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const key = e.key;
      if (key === 'Enter') game.handleInput('ENTER');
      else if (key === 'Backspace') game.handleInput('DEL');
      else if (/^[a-zA-Z]$/.test(key)) game.handleInput(key.toUpperCase());
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [game.handleInput]);

  return (
    <div className="app">
      {showIntro && <Intro onDone={() => setShowIntro(false)} />}
      <header className="header">
        <button className="header__icon-btn" onClick={() => game.setHelpOpen(true)} aria-label="How to play">❓</button>
        <h1 className="header__title">BONGO WORD</h1>
        <div className="header__actions">
          {game.difficulty === 'easy' && (
            <button
              className="header__icon-btn"
              onClick={game.useHint}
              aria-label="Hint"
              title="Reveal a letter"
              data-active={!game.hintUsed}
              disabled={game.hintUsed || game.gameOver}
              style={{ opacity: game.hintUsed ? 0.3 : 1 }}
            >💡</button>
          )}
          <button className="header__icon-btn" onClick={game.toggleDailyMode} aria-label="Daily mode" title="Daily word mode" data-active={game.dailyMode}>📅</button>
          <button className="header__icon-btn" onClick={game.toggleHighContrast} aria-label="High contrast" title="High contrast" data-active={game.highContrast}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '-0.5px' }}>HC</span>
          </button>
          <button className="header__icon-btn" onClick={game.toggleTheme} aria-label="Toggle theme">{game.theme === 'dark' ? '☀️' : '🌙'}</button>
          <button className="header__icon-btn" onClick={() => game.setStatsOpen(true)} aria-label="Statistics">📊</button>
        </div>
      </header>

      <div className="diff-bar">
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            className={`diff-pill diff-pill--${d} ${game.difficulty === d ? 'diff-pill--active' : ''}`}
            onClick={() => game.setDifficulty(d)}
          >
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
      </div>

      <div className="toast-container" aria-live="polite">
        {game.toasts.map((t) => <div key={t.id} className="toast">{t.text}</div>)}
      </div>

      <main className="game-container">
        <div className="board-container">
          <Board
            guesses={game.guesses}
            results={game.results}
            currentGuess={game.currentGuess}
            animatingRow={game.animatingRow}
            animatingGuess={game.animatingGuess}
            animatingResult={game.animatingResult}
            shakeRow={game.shakeRow}
            winRow={game.winRow}
            popCol={game.popCol}
            hintCol={game.hintCol}
            maxGuesses={game.maxGuesses}
          />
        </div>
        <Keyboard keyStates={game.keyStates} onKey={game.handleInput} disabled={game.isAnimating} />
      </main>

      <StatsModal
        open={game.statsOpen}
        stats={game.stats}
        gameOver={game.gameOver}
        gameWon={game.gameWon}
        targetWord={game.targetWord}
        results={game.results}
        onPlayAgain={game.resetGame}
        onClose={() => game.setStatsOpen(false)}
        onReset={game.resetStats}
      />
      <HelpModal open={game.helpOpen} onClose={() => game.setHelpOpen(false)} />
    </div>
  );
}
