import React, { useState, useEffect } from 'react';

// Google Consent Mode: analytics cookies only after "Accept all" (index.html starts with "denied").
const setAnalyticsConsent = (granted: boolean) => {
  const g = (window as any).gtag;
  if (typeof g === 'function') g('consent', 'update', { analytics_storage: granted ? 'granted' : 'denied' });
};

/** Opens the cookie banner again so the visitor can change their choice (used in the footer and Privacy Policy). */
export const openCookieSettings = () => window.dispatchEvent(new Event('hh-cookie-settings'));

const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let choice: string | null = null;
    try { choice = localStorage.getItem('hahahub_cookies'); } catch { /* private mode */ }
    if (!choice) setVisible(true);
    const reopen = () => setVisible(true);
    window.addEventListener('hh-cookie-settings', reopen);
    return () => window.removeEventListener('hh-cookie-settings', reopen);
  }, []);

  const choose = (accepted: boolean) => {
    try { localStorage.setItem('hahahub_cookies', accepted ? 'accepted' : 'declined'); } catch { /* private mode */ }
    setAnalyticsConsent(accepted);
    setVisible(false);
  };
  const accept = () => choose(true);
  const decline = () => choose(false);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] bg-brand-black/95 backdrop-blur border-t border-white/20 px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <p className="text-[11px] font-bold italic text-white/70 max-w-2xl leading-relaxed">
        We use essential cookies to run the site. With your consent we also use Google Analytics to see how the platform is used. No ads.{' '}
        <a href="#privacy" className="text-brand-cyan underline hover:text-white transition-colors">Privacy Policy</a>
      </p>
      <div className="flex gap-3 flex-shrink-0">
        <button
          onClick={accept}
          className="bg-white text-black px-5 py-2 font-black uppercase text-xs tracking-widest hover:bg-brand-pink hover:text-white transition-colors italic"
        >
          Accept All
        </button>
        <button
          onClick={decline}
          className="border border-white/30 text-white/60 px-5 py-2 font-black uppercase text-xs tracking-widest hover:border-white hover:text-white transition-all italic"
        >
          Essential Only
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;
