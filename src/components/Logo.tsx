import React from 'react';

const RATIO = 2339 / 464;

interface LogoProps {
  height?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ height = 36, className }) => {
  return (
    <img
      src="/hahahub_logo.png"
      alt="HahaHub"
      height={height}
      width={Math.round(height * RATIO)}
      className={className}
      style={{ height, width: 'auto' }}
    />
  );
};

export default Logo;
