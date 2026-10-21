import React from 'react';

const COLORS = [
  '#EF4986',
  '#FBA21B',
  '#199BBF',
  '#16A34A',
  '#D02024',
  '#19A596',
  '#833998',
];

interface SpectrumBarProps {
  height?: number;
  className?: string;
}

export const SpectrumBar: React.FC<SpectrumBarProps> = ({ height = 6, className }) => {
  return (
    <div
      className={`flex w-full ${className ?? ''}`}
      style={{ height }}
      aria-hidden="true"
    >
      {COLORS.map((c) => (
        <div key={c} className="flex-1" style={{ backgroundColor: c }} />
      ))}
    </div>
  );
};

export default SpectrumBar;
