import type { KeyState } from '../types';
import './Keyboard.css';

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL'],
];

interface KeyProps {
  label: string;
  state: KeyState;
  onPress: (key: string) => void;
  isDisabled: boolean;
}

function Key({ label, state, onPress, isDisabled }: KeyProps) {
  const isLarge = label === 'ENTER' || label === 'DEL';
  const stateClass = state !== 'unused' ? `key--${state}` : '';

  return (
    <button
      className={`key ${isLarge ? 'key--large' : ''} ${stateClass}`}
      onClick={(e) => {
        e.preventDefault();
        onPress(label);
      }}
      disabled={isDisabled}
      aria-label={label}
    >
      {label}
    </button>
  );
}

interface KeyboardProps {
  keyStates: Record<string, KeyState>;
  onKey: (key: string) => void;
  disabled: boolean;
}

export function Keyboard({ keyStates, onKey, disabled }: KeyboardProps) {
  return (
    <div className="keyboard" role="group" aria-label="Keyboard">
      {KEYBOARD_ROWS.map((row, i) => (
        <div key={i} className="keyboard__row">
          {row.map((key) => (
            <Key
              key={key}
              label={key}
              state={keyStates[key] ?? 'unused'}
              onPress={onKey}
              isDisabled={disabled}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
