import React from 'react';

// The "UB" from the logo, turned upright: purple B = eyes, teal U = smile.
const RATIO = 465 / 668;

interface SmileProps {
  height?: number;
  className?: string;
}

export const Smile: React.FC<SmileProps> = ({ height = 96, className }) => (
  <img
    src="/smile.png"
    alt=""
    aria-hidden="true"
    height={height}
    width={Math.round(height * RATIO)}
    className={className}
    style={{ height, width: 'auto' }}
  />
);

export default Smile;
