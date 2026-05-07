export function confetti() {
  const colors = ['#22c55e', '#eab308', '#3b82f6', '#ef4444', '#a855f7'];
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden';
  document.body.appendChild(container);

  for (let i = 0; i < 80; i++) {
    const piece = document.createElement('div');
    piece.style.cssText = `position:absolute;width:10px;height:10px;background:${colors[i % colors.length]};
      top:-20px;left:${Math.random() * 100}%;opacity:1;border-radius:2px;
      animation:confettiFall ${1.5 + Math.random() * 1}s ease-out forwards`;
    piece.style.setProperty('--x', `${(Math.random() - 0.5) * 200}px`);
    piece.style.setProperty('--r', `${Math.random() * 720}deg`);
    container.appendChild(piece);
  }

  setTimeout(() => container.remove(), 3000);
}

// Inject keyframes
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes confettiFall {
      to {
        transform: translateY(100vh) translateX(var(--x)) rotate(var(--r));
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}
