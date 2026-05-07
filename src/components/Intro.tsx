import { useState, useEffect } from 'react';
import './Intro.css';

const ROWS = [
  { letters: ['B','O','N','G','O'], colors: ['#22c55e','#eab308','#3b82f6','#ef4444','#22c55e'] },
  { letters: ['W','O','R','D'],     colors: ['#eab308','#22c55e','#3b82f6','#ef4444'] },
];

const ALL_COUNT = ROWS.reduce((s, r) => s + r.letters.length, 0);

export function Intro({ onDone }: { onDone: () => void }) {
  const [flipped, setFlipped] = useState(0);
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    for (let i = 0; i < ALL_COUNT; i++) {
      setTimeout(() => setFlipped(i + 1), i * 160);
    }
    const total = ALL_COUNT * 160 + 600;
    setTimeout(() => setHiding(true), total);
    setTimeout(onDone, total + 400);
  }, [onDone]);

  let idx = 0;
  return (
    <div className={`intro ${hiding ? 'intro--hide' : ''}`}>
      <div className="intro__rows">
        {ROWS.map((row, ri) => (
          <div key={ri} className="intro__tiles">
            {row.letters.map((letter, ci) => {
              const tileIdx = idx++;
              return (
                <div
                  key={ci}
                  className={`intro__tile ${flipped > tileIdx ? 'intro__tile--flipped' : ''}`}
                  style={{ '--color': row.colors[ci] } as React.CSSProperties}
                >
                  <div className="intro__tile-inner">
                    <div className="intro__tile-front" />
                    <div className="intro__tile-back">{letter}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
