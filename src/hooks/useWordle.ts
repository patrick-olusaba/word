import { useState, useCallback, useEffect, useRef } from 'react';
import { EASY_WORDS, MEDIUM_WORDS, HARD_WORDS, CLUES } from '../words';
import { VALID_GUESSES } from '../validGuesses';
import type { TileState, KeyState, GameStats, ToastMessage } from '../types';
import { sounds } from '../sounds';
import { confetti } from '../confetti';

export const WORD_LENGTH = 5;
export type Difficulty = 'easy' | 'medium' | 'hard';

const VALID_GUESS_SET = new Set(VALID_GUESSES);

const MAX_GUESSES_MAP: Record<Difficulty, number> = { easy: 7, medium: 6, hard: 5 };
const WORD_POOL: Record<Difficulty, string[]> = {
  easy: EASY_WORDS,
  medium: MEDIUM_WORDS,
  hard: HARD_WORDS,
};

const STATS_KEY = 'wordle-stats';
const THEME_KEY = 'wordle-theme';
const HC_KEY = 'wordle-hc';
const DIFF_KEY = 'wordle-difficulty';
const DAILY_KEY = 'wordle-daily-mode';

function getDailyWord(pool: string[]): string {
  const epoch = new Date('2024-01-01').getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayIndex = Math.floor((today.getTime() - epoch) / 86400000);
  return pool[((dayIndex % pool.length) + pool.length) % pool.length];
}

function pickRandom(pool: string[]): string {
  return pool[Math.floor(Math.random() * pool.length)];
}

function checkGuess(guess: string, target: string): TileState[] {
  const result: TileState[] = Array(WORD_LENGTH).fill('absent') as TileState[];
  const targetArr = target.split('');
  const guessArr = guess.split('');

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessArr[i] === targetArr[i]) {
      result[i] = 'correct';
      targetArr[i] = '';
      guessArr[i] = '';
    }
  }
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessArr[i]) {
      const idx = targetArr.indexOf(guessArr[i]);
      if (idx !== -1) { result[i] = 'present'; targetArr[idx] = ''; }
    }
  }
  return result;
}

function loadStats(): GameStats {
  try {
    const s = JSON.parse(localStorage.getItem(STATS_KEY) ?? '{}');
    return {
      played: s.played ?? 0,
      wins: s.wins ?? 0,
      streak: s.streak ?? 0,
      maxStreak: s.maxStreak ?? 0,
      distribution: s.distribution ?? [0, 0, 0, 0, 0, 0, 0],
    };
  } catch {
    return { played: 0, wins: 0, streak: 0, maxStreak: 0, distribution: [0, 0, 0, 0, 0, 0, 0] };
  }
}

export interface WordleGame {
  targetWord: string;
  guesses: string[];
  results: TileState[][];
  currentGuess: string;
  gameOver: boolean;
  gameWon: boolean;
  isAnimating: boolean;
  keyStates: Record<string, KeyState>;
  toasts: ToastMessage[];
  stats: GameStats;
  animatingRow: number;
  animatingGuess: string;
  animatingResult: TileState[] | null;
  shakeRow: number;
  winRow: number;
  popCol: number;
  hintCol: number;
  hintUsed: boolean;
  clue: string;
  maxGuesses: number;
  statsOpen: boolean;
  helpOpen: boolean;
  theme: 'light' | 'dark';
  highContrast: boolean;
  difficulty: Difficulty;
  dailyMode: boolean;
  toggleTheme: () => void;
  toggleHighContrast: () => void;
  setDifficulty: (d: Difficulty) => void;
  toggleDailyMode: () => void;
  useHint: () => void;
  handleInput: (key: string) => void;
  resetGame: () => void;
  resetStats: () => void;
  setStatsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setHelpOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useWordle(): WordleGame {
  const [difficulty, setDifficultyState] = useState<Difficulty>(
    () => (localStorage.getItem(DIFF_KEY) as Difficulty) ?? 'medium'
  );
  const [dailyMode, setDailyMode] = useState(() => localStorage.getItem(DAILY_KEY) === 'true');

  const [targetWord, setTargetWord] = useState<string>(() => {
    const diff = (localStorage.getItem(DIFF_KEY) as Difficulty) ?? 'medium';
    const pool = WORD_POOL[diff];
    return localStorage.getItem(DAILY_KEY) === 'true' ? getDailyWord(pool) : pickRandom(pool);
  });

  const [guesses, setGuesses] = useState<string[]>([]);
  const [results, setResults] = useState<TileState[][]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [keyStates, setKeyStates] = useState<Record<string, KeyState>>({});
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [stats, setStats] = useState<GameStats>(loadStats);
  const [animatingRow, setAnimatingRow] = useState(-1);
  const [animatingGuess, setAnimatingGuess] = useState('');
  const [animatingResult, setAnimatingResult] = useState<TileState[] | null>(null);
  const [shakeRow, setShakeRow] = useState(-1);
  const [winRow, setWinRow] = useState(-1);
  const [popCol, setPopCol] = useState(-1);
  const [hintCol, setHintCol] = useState(-1);
  const [hintUsed, setHintUsed] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (localStorage.getItem(THEME_KEY) as 'light' | 'dark') ?? 'light'
  );
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem(HC_KEY) === 'true');

  const maxGuesses = MAX_GUESSES_MAP[difficulty];
  const toastIdRef = useRef(0);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-high-contrast', String(highContrast));
    localStorage.setItem(HC_KEY, String(highContrast));
  }, [highContrast]);

  useEffect(() => {
    try { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch { /* ignore */ }
  }, [stats]);

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'light' ? 'dark' : 'light')), []);
  const toggleHighContrast = useCallback(() => setHighContrast((v) => !v), []);

  const showToast = useCallback((text: string) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2800);
  }, []);

  const useHint = useCallback(() => {
    if (hintUsed || gameOver || isAnimating) return;
    // Pick a column not already correct in any guess
    const alreadyCorrect = new Set<number>();
    results.forEach((row) => row.forEach((s, i) => { if (s === 'correct') alreadyCorrect.add(i); }));
    const candidates = Array.from({ length: WORD_LENGTH }, (_, i) => i).filter((i) => !alreadyCorrect.has(i));
    if (candidates.length === 0) return;
    const col = candidates[Math.floor(Math.random() * candidates.length)];
    setHintCol(col);
    setHintUsed(true);
    showToast(`Hint: position ${col + 1} is "${targetWord[col]}"`);
  }, [hintUsed, gameOver, isAnimating, results, targetWord, showToast]);

  const setDifficulty = useCallback((d: Difficulty) => {
    if (guesses.length > 0) { showToast('Cannot change difficulty mid-game'); return; }
    localStorage.setItem(DIFF_KEY, d);
    setDifficultyState(d);
    const pool = WORD_POOL[d];
    setTargetWord(dailyMode ? getDailyWord(pool) : pickRandom(pool));
  }, [guesses.length, dailyMode, showToast]);

  const toggleDailyMode = useCallback(() => {
    if (guesses.length > 0) { showToast('Cannot change mode mid-game'); return; }
    setDailyMode((v) => {
      const next = !v;
      localStorage.setItem(DAILY_KEY, String(next));
      const pool = WORD_POOL[difficulty];
      setTargetWord(next ? getDailyWord(pool) : pickRandom(pool));
      return next;
    });
  }, [guesses.length, difficulty, showToast]);

  const handleInput = useCallback((key: string) => {
    const upper = key.toUpperCase();

    if (upper === 'DEL' || upper === 'BACKSPACE') {
      if (!gameOver && !isAnimating) { sounds.click(); setCurrentGuess((prev) => prev.slice(0, -1)); }
      return;
    }
    if (/^[A-Z]$/.test(upper)) {
      if (!gameOver && !isAnimating && currentGuess.length < WORD_LENGTH) {
        sounds.click();
        setPopCol(currentGuess.length);
        setTimeout(() => setPopCol(-1), 120);
        setCurrentGuess((prev) => prev + upper);
      }
      return;
    }
    if (upper !== 'ENTER') return;
    if (gameOver || isAnimating) return;

    if (currentGuess.length !== WORD_LENGTH) {
      sounds.error();
      showToast('Not enough letters');
      setShakeRow(guesses.length);
      setTimeout(() => setShakeRow(-1), 600);
      return;
    }

    if (!VALID_GUESS_SET.has(currentGuess)) {
      sounds.error();
      showToast('Not a valid word');
      setShakeRow(guesses.length);
      setTimeout(() => setShakeRow(-1), 600);
      return;
    }

    // Hard difficulty: must reuse revealed letters
    if (difficulty === 'hard') {
      for (let i = 0; i < results.length; i++) {
        for (let j = 0; j < WORD_LENGTH; j++) {
          const state = results[i][j];
          const letter = guesses[i][j];
          if (state === 'correct' && currentGuess[j] !== letter) {
            showToast(`${j + 1}${['st','nd','rd','th','th'][j]} letter must be ${letter}`);
            sounds.error();
            setShakeRow(guesses.length);
            setTimeout(() => setShakeRow(-1), 600);
            return;
          }
          if (state === 'present' && !currentGuess.includes(letter)) {
            showToast(`Guess must contain ${letter}`);
            sounds.error();
            setShakeRow(guesses.length);
            setTimeout(() => setShakeRow(-1), 600);
            return;
          }
        }
      }
    }

    const rowIndex = guesses.length;
    const submittedGuess = currentGuess;
    const result = checkGuess(submittedGuess, targetWord);

    sounds.whoosh();
    setIsAnimating(true);
    setAnimatingRow(rowIndex);
    setAnimatingGuess(submittedGuess);
    setAnimatingResult(result);
    setCurrentGuess('');

    setTimeout(() => {
      setGuesses((prev) => [...prev, submittedGuess]);
      setResults((prev) => [...prev, result]);
      setKeyStates((prev) => {
        const next = { ...prev };
        for (let i = 0; i < WORD_LENGTH; i++) {
          const letter = submittedGuess[i];
          const state = result[i] as KeyState;
          const current = next[letter];
          if (current === 'correct') continue;
          if (current === 'present' && state === 'absent') continue;
          next[letter] = state;
        }
        return next;
      });
      setAnimatingRow(-1);
      setAnimatingGuess('');
      setAnimatingResult(null);
      setIsAnimating(false);

      const won = submittedGuess === targetWord;
      const lost = !won && rowIndex + 1 >= maxGuesses;

      if (won) {
        setStats((prev) => {
          const dist = [...prev.distribution];
          dist[rowIndex] = (dist[rowIndex] ?? 0) + 1;
          return { played: prev.played + 1, wins: prev.wins + 1, streak: prev.streak + 1, maxStreak: Math.max(prev.streak + 1, prev.maxStreak), distribution: dist };
        });
        setGameWon(true);
        setGameOver(true);
        setWinRow(rowIndex);
        sounds.chime();
        confetti();
        showToast('Winner! 🎉');
        setTimeout(() => setStatsOpen(true), 900);
      } else if (lost) {
        setStats((prev) => ({ ...prev, played: prev.played + 1, streak: 0 }));
        setGameOver(true);
        showToast(targetWord);
        setTimeout(() => setStatsOpen(true), 900);
      }
    }, WORD_LENGTH * 300 + 250);
  }, [gameOver, isAnimating, currentGuess, guesses, results, targetWord, showToast, difficulty, maxGuesses]);

  const resetGame = useCallback(() => {
    const pool = WORD_POOL[difficulty];
    setTargetWord(dailyMode ? getDailyWord(pool) : pickRandom(pool));
    setGuesses([]);
    setResults([]);
    setCurrentGuess('');
    setGameOver(false);
    setGameWon(false);
    setIsAnimating(false);
    setKeyStates({});
    setAnimatingRow(-1);
    setAnimatingGuess('');
    setAnimatingResult(null);
    setShakeRow(-1);
    setWinRow(-1);
    setPopCol(-1);
    setHintCol(-1);
    setHintUsed(false);
    setStatsOpen(false);
    showToast('New game started!');
  }, [showToast, dailyMode, difficulty]);

  const resetStats = useCallback(() => {
    if (window.confirm('Reset all statistics? This cannot be undone.')) {
      setStats({ played: 0, wins: 0, streak: 0, maxStreak: 0, distribution: [0, 0, 0, 0, 0, 0, 0] });
      showToast('Progress reset');
    }
  }, [showToast]);

  return {
    targetWord, guesses, results, currentGuess, gameOver, gameWon, isAnimating,
    keyStates, toasts, stats, animatingRow, animatingGuess, animatingResult,
    shakeRow, winRow, popCol, hintCol, hintUsed, clue: CLUES[targetWord], maxGuesses, statsOpen, helpOpen, theme, highContrast,
    difficulty, dailyMode,
    toggleTheme, toggleHighContrast, setDifficulty, toggleDailyMode, useHint,
    handleInput, resetGame, resetStats, setStatsOpen, setHelpOpen,
  };
}
