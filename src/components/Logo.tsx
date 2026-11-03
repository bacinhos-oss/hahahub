import React, { useRef, useState } from 'react';

const W = 2339;
const H = 464;
const RATIO = W / H;
// Cut points between the seven letters of the logo image (px in the 2339-wide original)
const CUTS = [0, 342, 668, 1010, 1336, 1676, 2002, 2339];
const COLORS = ['#EF4986', '#FBA21B', '#199BBF', '#16A34A', '#D02024', '#19A596', '#833998'];

interface LogoProps {
  height?: number;
  className?: string;
  /** letters gently wave on their own (use on big hero logos) */
  idle?: boolean;
}

type Piece = { id: number; dx: number; dy: number; color: string; rot: number };

export const Logo: React.FC<LogoProps> = ({ height = 36, className, idle = false }) => {
  const scale = height / H;
  const [pieces, setPieces] = useState<Piece[]>([]);
  const counter = useRef(0);

  const burst = () => {
    const batch: Piece[] = Array.from({ length: 22 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const dist = height * (1.2 + Math.random() * 2.2);
      return {
        id: counter.current++,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist - height * 0.6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rot: Math.round(Math.random() * 360),
      };
    });
    setPieces(p => [...p, ...batch]);
    window.setTimeout(() => setPieces(p => p.filter(x => !batch.includes(x))), 1000);
  };

  return (
    <span
      className={['hh-logo', idle ? 'hh-logo-idle' : '', className || ''].join(' ').trim()}
      style={{ height, width: Math.round(height * RATIO) }}
      role="img"
      aria-label="HahaHub"
      onClick={burst}
    >
      <span style={{ display: 'flex', width: '100%', height: '100%' }}>
      {CUTS.slice(0, -1).map((start, i) => (
        <i
          key={i}
          style={{
            width: (CUTS[i + 1] - start) * scale,
            height,
            backgroundImage: 'url(/hahahub_logo.png)',
            backgroundSize: `${W * scale}px ${height}px`,
            backgroundPosition: `${-start * scale}px 0`,
            ['--i' as any]: i,
          }}
        />
      ))}
      </span>
      {pieces.map(p => (
        <b
          key={p.id}
          className="hh-confetti"
          style={{
            background: p.color,
            ['--dx' as any]: `${p.dx}px`,
            ['--dy' as any]: `${p.dy}px`,
            ['--rot' as any]: `${p.rot}deg`,
          }}
        />
      ))}
    </span>
  );
};

export default Logo;
