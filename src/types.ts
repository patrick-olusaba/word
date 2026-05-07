export type TileState = 'empty' | 'active' | 'absent' | 'present' | 'correct';
export type KeyState = 'unused' | 'absent' | 'present' | 'correct';

export interface GameStats {
  played: number;
  wins: number;
  streak: number;
  maxStreak: number;
  distribution: number[]; // index 0 = won in 1 guess, index 5 = won in 6
}

export interface ToastMessage {
  id: number;
  text: string;
}
