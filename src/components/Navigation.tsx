import React, { useState } from 'react';
import { Page } from '../types';
import { Logo } from './Logo';
import { SpectrumBar } from './SpectrumBar';

interface NavigationProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  onLogout?: () => void;
  user?: { name: string; role: string; avatar: string; isPaid?: boolean; isAdmin?: boolean; email?: string };
}

// Full class names are written out so Tailwind can generate them
// (dynamic strings like `border-${color}` are never picked up by the build).
const NAV_COLORS = {
  yellow: { active: 'border-brand-yellow text-brand-yellow', hover: 'hover:text-brand-yellow', mobile: 'text-white/70 hover:text-brand-yellow' },
  pink:   { active: 'border-brand-pink text-brand-pink',     hover: 'hover:text-brand-pink',   mobile: 'text-white/70 hover:text-brand-pink' },
  cyan:   { active: 'border-brand-cyan text-brand-cyan',     hover: 'hover:text-brand-cyan',   mobile: 'text-brand-cyan/70 hover:text-brand-cyan' },
  blue:   { active: 'border-spectrumLight-blue text-spectrumLight-blue',   hover: 'hover:text-spectrumLight-blue',   mobile: 'text-white/70 hover:text-spectrumLight-blue' },
  green:  { active: 'border-spectrumLight-green text-spectrumLight-green', hover: 'hover:text-spectrumLight-green', mobile: 'text-white/70 hover:text-spectrumLight-green' },
} as const;

type NavColor = keyof typeof NAV_COLORS;

const PLAN_STYLES: Record<string, { label: string; color: string }> = {
  roar: { label: 'ROAR', color: 'text-spectrumLight-red' },
  laff: { label: 'LAFF', color: 'text-spectrum-orange' },
  gigl: { label: 'GIGL', color: 'text-spectrumLight-blue' },
};

const Navigation: React.FC<NavigationProps> = ({ activePage, onNavigate, onLogout, user }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = user?.role === 'admin' || (user as any)?.isAdmin || (user as any)?.email === 'bacinhos@gmail.com';

  const planKey = (user as any)?.plan === 'roar' ? 'roar' : (user as any)?.plan === 'laff' ? 'laff' : 'gigl';
  const plan = PLAN_STYLES[planKey];

  const go = (page: Page) => { onNavigate(page); setMenuOpen(false); };

  const navBtn = (page: Page, label: string, color: NavColor) => (
    <button
      onClick={() => go(page)}
      className={`text-xs font-black tracking-widest uppercase pb-1 border-b-4 transition-all ${
        activePage === page
          ? NAV_COLORS[color].active
          : `border-transparent text-white/60 ${NAV_COLORS[color].hover} hover:border-white/40`
      }`}
    >
      {label}
    </button>
  );

  const mobileBtn = (page: Page, label: string, color: NavColor) => (
    <button
      onClick={() => go(page)}
      className={`text-left text-lg font-black uppercase italic tracking-widest transition-colors ${NAV_COLORS[color].mobile}`}
    >
      {label}
    </button>
  );

  return (
    <header className="fixed top-0 z-50 w-full bg-brand-black px-4 md:px-8 py-4 md:py-5">
      <div className="flex items-center justify-between">
        {/* LOGO */}
        <button
          onClick={() => go(user ? 'discovery' : 'landing')}
          className="flex flex-col items-start hover:scale-105 transition-transform"
        >
          <Logo height={28} className="md:hidden" />
          <Logo height={40} className="hidden md:block" />
        </button>

        {/* DESKTOP NAV */}
        <nav className="hidden lg:flex items-center gap-10 italic">
          {navBtn('discovery', 'CATALOG', 'yellow')}
          {navBtn('wire', 'LAFFWIRE', 'pink')}
          {navBtn('about', 'MISSION', 'blue')}
          {navBtn('subscription', 'MY HUB', 'green')}
          {user && navBtn('upload', 'SHOWLOAD', 'cyan')}
          {isAdmin && navBtn('admin', 'ADMIN', 'pink')}
        </nav>

        {/* DESKTOP USER */}
        <div className="hidden lg:flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-4 pl-4 border-l-2 border-white/10">
              <button onClick={() => onNavigate('subscription')} className="text-right hover:opacity-80 transition-opacity">
                <p className="text-[11px] font-black tracking-[0.2em] text-white italic">{user.name}</p>
                <p className={`text-[9px] font-black tracking-widest uppercase ${plan.color}`}>{plan.label}</p>
              </button>
              <button onClick={onLogout} className="w-10 h-10 flex items-center justify-center border-2 border-white hover:bg-brand-pink transition-all">
                <span className="material-symbols-outlined text-sm">logout</span>
              </button>
            </div>
          ) : (
            <button onClick={() => onNavigate('login')} className="bg-brand-yellow text-black font-black px-6 py-2 text-sm uppercase border-4 border-black hover:bg-white transition-all shadow-neo-magenta italic">
              Tickle In →
            </button>
          )}
        </div>

        {/* MOBILE: user indicator + hamburger */}
        <div className="flex lg:hidden items-center gap-3">
          {user && (
            <div className="text-right">
              <p className="text-[10px] font-black text-white italic">{user.name}</p>
              <p className={`text-[8px] font-black uppercase ${plan.color}`}>{plan.label}</p>
            </div>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 border-2 border-white"
          >
            <span className={`block w-5 h-0.5 bg-white transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-5 h-0.5 bg-white transition-all ${menuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-5 h-0.5 bg-white transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-brand-black px-6 py-8 space-y-6 animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-6">
            {mobileBtn('discovery', 'CATALOG', 'yellow')}
            {mobileBtn('wire', 'LAFFWIRE', 'pink')}
            {mobileBtn('about', 'MISSION', 'blue')}
            {mobileBtn('subscription', 'MY HUB', 'green')}
            {user && mobileBtn('upload', 'SHOWLOAD', 'cyan')}
            {isAdmin && mobileBtn('admin', 'ADMIN', 'pink')}
            <button onClick={() => { setMenuOpen(false); window.dispatchEvent(new CustomEvent('openFeedback')); }} className="text-left text-lg font-black uppercase italic tracking-widest text-white/30 hover:text-white transition-colors">FEEDBACK</button>
          </div>
          <div className="border-t-2 border-white/10 pt-6">
            {user ? (
              <button onClick={() => { onLogout?.(); setMenuOpen(false); }} className="flex items-center gap-3 text-sm font-black uppercase italic text-brand-pink/70 hover:text-brand-pink transition-colors">
                <span className="material-symbols-outlined text-sm">logout</span>
                LOGOUT
              </button>
            ) : (
              <button onClick={() => go('login')} className="w-full bg-brand-yellow text-black font-black py-4 text-lg uppercase border-4 border-black italic hover:bg-white transition-all">
                Tickle In →
              </button>
            )}
          </div>
          <SpectrumBar height={4} className="absolute bottom-0 left-0 right-0" />
        </div>
      )}

      {/* Spectrum bar replaces the old white bottom border */}
      <SpectrumBar height={6} className="absolute bottom-0 left-0 right-0" />
    </header>
  );
};

export default Navigation;
