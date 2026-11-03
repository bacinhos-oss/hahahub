import React, { useRef, useState } from 'react';

// The "UB" from the logo, turned upright: purple B = eyes, teal U = smile.
// Hover: it giggles. Click: it laughs out loud (HA! HA! bubbles float up).
const RATIO = 465 / 668;
const SOUNDS = ['HA!', 'HA HA!', 'HAHA!', 'HE HE!', 'HA!', 'HO HO!'];
const COLORS = ['#FF6B9D', '#FFB84D', '#4DC3E8', '#4ADE80', '#FF6B6B', '#3EE0CC', '#C77DDB', '#FFC80E'];

interface SmileProps {
  height?: number;
  className?: string;
}

type Bubble = { id: number; text: string; x: number; r: number; color: string; delay: number };

export const Smile: React.FC<SmileProps> = ({ height = 96, className }) => {
  const [laughing, setLaughing] = useState(false);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const counter = useRef(0);

  const laugh = () => {
    const batch: Bubble[] = Array.from({ length: 5 }, (_, i) => ({
      id: counter.current++,
      text: SOUNDS[Math.floor(Math.random() * SOUNDS.length)],
      x: Math.round((Math.random() - 0.5) * height * 1.6),
      r: Math.round((Math.random() - 0.5) * 40),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: i * 120,
    }));
    setLaughing(true);
    setBubbles(b => [...b, ...batch]);
    window.setTimeout(() => setLaughing(false), 950);
    window.setTimeout(() => setBubbles(b => b.filter(x => !batch.includes(x))), 2000);
  };

  return (
    <span
      className={`hh-smile ${laughing ? 'hh-smile-laughing' : ''} ${className || ''}`.trim()}
      style={{ height }}
      onClick={laugh}
      aria-hidden="true"
    >
      <img
        src="/smile.png"
        alt=""
        height={height}
        width={Math.round(height * RATIO)}
        style={{ height, width: 'auto', display: 'block' }}
        draggable={false}
      />
      {bubbles.map(b => (
        <b
          key={b.id}
          className="hh-ha"
          style={{
            color: b.color,
            fontSize: Math.max(14, Math.round(height * 0.2)),
            animationDelay: `${b.delay}ms`,
            ['--x' as any]: `${b.x}px`,
            ['--r' as any]: `${b.r}deg`,
          }}
        >
          {b.text}
        </b>
      ))}
    </span>
  );
};

export default Smile;
