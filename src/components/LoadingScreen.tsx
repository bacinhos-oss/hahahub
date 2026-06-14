import React, { useEffect, useState } from 'react';

const LoadingScreen: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 1500);
    const t2 = setTimeout(() => onDone(), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center transition-opacity duration-500 ${fade ? 'opacity-0' : 'opacity-100'}`}>
      <img
        src="/hhh-logo.png"
        alt="HahaHub"
        className="w-64 md:w-96 animate-pulse"
        style={{ filter: 'drop-shadow(0 0 20px #FF0266) drop-shadow(0 0 40px #03DAC6)' }}
      />
    </div>
  );
};

export default LoadingScreen;
