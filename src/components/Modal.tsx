import type { GameStats, TileState } from '../types';
import './Modal.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-content">{children}</div>
    </div>
  );
}

/* ── Stats Modal ─────────────────────────── */

interface StatsModalProps {
  open: boolean;
  stats: GameStats;
  gameOver: boolean;
  gameWon: boolean;
  targetWord: string;
  results: TileState[][];
  onPlayAgain: () => void;
  onClose: () => void;
  onReset: () => void;
}

export function StatsModal({
  open,
  stats,
  gameOver,
  gameWon,
  targetWord,
  results,
  onPlayAgain,
  onClose,
  onReset,
}: StatsModalProps) {
  const winPct = stats.played
    ? Math.round((stats.wins / stats.played) * 100)
    : 0;

  const maxDist = Math.max(...stats.distribution, 1);

  const handleShare = () => {
    const EMOJI: Record<string, string> = { correct: '🟩', present: '🟨', absent: '⬛' };
    const grid = results
      .map((row) => row.map((s) => EMOJI[s] ?? '⬛').join(''))
      .join('\n');
    const text = `BONGO WORD ${results.length}/6\n\n${grid}`;
    navigator.clipboard.writeText(text).then(() => {
      // toast handled outside; just a best-effort copy
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="modal__title">
        {gameOver ? (gameWon ? 'CONGRATS! 🎉' : 'GAME OVER') : 'STATISTICS'}
      </h2>

      {gameOver && (
        <div className="modal__game-over-msg">
          {gameWon ? (
            <>Splendid! You found <strong>{targetWord}</strong>.</>
          ) : (
            <>Unlucky. The correct word was <strong>{targetWord}</strong>. Better luck next time!</>
          )}
        </div>
      )}

      <div className="stats-grid">
        <StatItem value={stats.played} label="Played" />
        <StatItem value={winPct} label="Win %" />
        <StatItem value={stats.streak} label={`${stats.streak >= 3 ? '🔥 ' : ''}Streak`} />
        <StatItem value={stats.maxStreak} label="Max" />
      </div>

      <div className="dist-chart">
        <p className="dist-chart__title">GUESS DISTRIBUTION</p>
        {stats.distribution.map((count, i) => (
          <div key={i} className="dist-row">
            <span className="dist-row__label">{i + 1}</span>
            <div
              className="dist-row__bar"
              style={{ width: `${Math.max((count / maxDist) * 100, 8)}%` }}
            >
              {count}
            </div>
          </div>
        ))}
      </div>

      <div className="modal__actions">
        {gameOver && (
          <button className="btn btn--share" onClick={handleShare}>
            SHARE 📋
          </button>
        )}
        <button className="btn btn--primary" onClick={onPlayAgain}>
          PLAY AGAIN
        </button>
        <button className="btn btn--secondary" onClick={onClose}>
          CLOSE
        </button>
        <button className="btn btn--danger" onClick={onReset}>
          RESET ALL PROGRESS
        </button>
      </div>
    </Modal>
  );
}

function StatItem({ value, label }: { value: number; label: string }) {
  return (
    <div className="stat-item">
      <span className="stat-item__value">{value}</span>
      <span className="stat-item__label">{label}</span>
    </div>
  );
}

/* ── Help Modal ──────────────────────────── */

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

export function HelpModal({ open, onClose }: HelpModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="modal__title">How To Play</h2>
      <p className="help__subtitle">Guess the word in 6 tries.</p>
      <ul className="help__rules">
        <li>Each guess must be a valid 5-letter word.</li>
        <li>
          The colour of the tiles will change to show how close your guess was.
        </li>
      </ul>

      <div className="help__legend">
        <LegendItem color="var(--correct)" label="Correct letter, correct spot" />
        <LegendItem color="var(--present)" label="Correct letter, wrong spot" />
        <LegendItem color="var(--absent)" label="Letter not in the word" />
      </div>

      <button className="btn btn--primary help__close-btn" onClick={onClose}>
        GOT IT!
      </button>
    </Modal>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="help__legend-item">
      <div className="help__swatch" style={{ backgroundColor: color }} />
      <span>{label}</span>
    </div>
  );
}
