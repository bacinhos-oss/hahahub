import React, { useState, useEffect } from 'react';

const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const choice = localStorage.getItem('hahahub_cookies');
    if (!choice) {
      setVisible(true);
    } else if (choice === 'accepted') {
      enableGA();
    }
  }, []);

  const enableGA = () => {
    (window as any)['ga-disable-G-SEPT0657QY'] = false;
  };

  const disableGA = () => {
    (window as any)['ga-disable-G-SEPT0657QY'] = true;
  };

  const accept = () => {
    localStorage.setItem('hahahub_cookies', 'accepted');
    enableGA();
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('hahahub_cookies', 'declined');
    disableGA();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] bg-brand-black border-t-4 border-brand-yellow px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-[11px] font-bold italic text-white/70 max-w-2xl leading-relaxed">
        We use essential cookies for authentication and Google Analytics to understand how producers use The Laff Exchange. No ads. No third-party tracking.{' '}
        <a href="/privacy" className="text-brand-cyan underline hover:text-white transition-colors">Privacy Policy</a>
      </p>
      <div className="flex gap-3 flex-shrink-0">
        <button
          onClick={accept}
          className="bg-brand-yellow text-black px-6 py-2 font-black uppercase text-xs border-2 border-black hover:bg-white transition-all italic"
        >
          Accept All
        </button>
        <button
          onClick={decline}
          className="border-2 border-white/30 text-white/50 px-6 py-2 font-black uppercase text-xs hover:border-white hover:text-white transition-all italic"
        >
          Essential Only
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;
