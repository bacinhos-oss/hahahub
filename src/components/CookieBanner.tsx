import React, { useState, useEffect } from 'react';

const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('hahahub_cookies');
    if (!accepted) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem('hahahub_cookies', 'accepted');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] bg-brand-black border-t-4 border-brand-yellow px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-[11px] font-bold italic text-white/70 max-w-2xl">
        🍪 We use only essential cookies for authentication. No tracking, no ads. 
        <a href="#" className="text-brand-cyan underline ml-1">Privacy Policy</a>
      </p>
      <div className="flex gap-3 flex-shrink-0">
        <button
          onClick={accept}
          className="bg-brand-yellow text-black px-6 py-2 font-black uppercase text-xs border-2 border-black hover:bg-white transition-all italic"
        >
          Accept
        </button>
        <button
          onClick={accept}
          className="border-2 border-white/30 text-white/50 px-6 py-2 font-black uppercase text-xs hover:border-white hover:text-white transition-all italic"
        >
          Decline
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;
