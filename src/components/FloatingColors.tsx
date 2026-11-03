import React from 'react';

const COLORS = ['#EF4986', '#FBA21B', '#199BBF', '#16A34A', '#D02024', '#19A596', '#833998', '#FFC80E'];

// Slowly drifting colour blocks (the logo palette) for hero backgrounds
const BLOCKS = Array.from({ length: 16 }, (_, i) => ({
  left: `${(i * 37 + 6) % 96}%`,
  size: 14 + ((i * 11) % 26),
  duration: 16 + ((i * 7) % 14),
  delay: -((i * 5) % 18),
  color: COLORS[i % COLORS.length],
}));

export const FloatingColors: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
    {BLOCKS.map((b, i) => (
      <span
        key={i}
        className="hh-float"
        style={{ left: b.left, width: b.size, height: b.size, background: b.color, animationDuration: `${b.duration}s`, animationDelay: `${b.delay}s` }}
      />
    ))}
  </div>
);

export default FloatingColors;
