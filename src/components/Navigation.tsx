
import React, { useState } from 'react';
import { Page } from '../types';

interface NavigationProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  onLogout?: () => void;
  user?: { name: string; role: string; avatar: string; isPaid?: boolean; isAdmin?: boolean; email?: string };
}

const Navigation: React.FC<NavigationProps> = ({ activePage, onNavigate, onLogout, user }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = user?.role === 'admin' || (user as any)?.isAdmin || (user as any)?.email === 'bacinhos@gmail.com';

  const navBtn = (page: Page, label: string, color = 'brand-yellow') => (
    <button
      onClick={() => { onNavigate(page); setMenuOpen(false); }}
      className={`text-xs font-black tracking-widest uppercase pb-1 border-b-4 transition-all ${
        activePage === page
          ? `border-${color} text-${color}`
          : 'border-transparent text-white/60 hover:text-white hover:border-white/40'
      }`}
    >
      {label}
    </button>
  );

  return (
    <header className="fixed top-0 z-50 w-full bg-brand-black border-b-4 border-white px-4 md:px-8 py-4 md:py-5">
      <div className="flex items-center justify-between">
        {/* LOGO */}
        <button
          onClick={() => { onNavigate(user ? 'discovery' : 'landing'); setMenuOpen(false); }}
          className="logo-text text-2xl md:text-4xl uppercase tracking-tighter hover:scale-105 transition-transform"
        >
          HAHAHUB
        </button>

        {/* DESKTOP NAV */}
        <nav className="hidden lg:flex items-center gap-10 italic">
          {navBtn('discovery', 'CATALOG', 'brand-yellow')}
          {navBtn('about', 'MISSION', 'brand-pink')}
          {navBtn('subscription', 'MY HUB', 'white')}
          {isAdmin && navBtn('admin', 'ADMIN', 'brand-pink')}
        </nav>

        {/* DESKTOP USER */}
        <div className="hidden lg:flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-4 pl-4 border-l-2 border-white/10">
              <button onClick={() => onNavigate('subscription')} className="text-right hover:opacity-80 transition-opacity">
                <p className="text-[11px] font-black tracking-[0.2em] text-white italic">{user.name}</p>
                <p className="text-[9px] text-brand-cyan font-black tracking-widest uppercase">{user.isPaid ? 'PRO MEMBER' : 'USER'}</p>
              </button>
              <button onClick={onLogout} className="w-10 h-10 flex items-center justify-center border-2 border-white hover:bg-brand-pink transition-all">
                <span className="material-symbols-outlined text-sm">logout</span>
              </button>
            </div>
          ) : (
            <button onClick={() => onNavigate('login')} className="bg-white text-black font-black px-6 py-2 text-sm uppercase border-2 border-black hover:bg-brand-yellow transition-all shadow-neo-magenta italic">
              LOGIN
            </button>
          )}
        </div>

        {/* MOBILE: user indicator + hamburger */}
        <div className="flex lg:hidden items-center gap-3">
          {user && (
            <div className="text-right">
              <p className="text-[10px] font-black text-white italic">{user.name}</p>
              <p className="text-[8px] text-brand-cyan font-black uppercase">{user.isPaid ? 'PRO' : 'FREE'}</p>
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
        <div className="lg:hidden absolute top-full left-0 right-0 bg-brand-black border-b-4 border-white px-6 py-8 space-y-6 animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-6">
            <button onClick={() => { onNavigate('discovery'); setMenuOpen(false); }} className="text-left text-lg font-black uppercase italic tracking-widest text-white/70 hover:text-brand-yellow transition-colors">
              CATALOG
            </button>
            <button onClick={() => { onNavigate('about'); setMenuOpen(false); }} className="text-left text-lg font-black uppercase italic tracking-widest text-white/70 hover:text-brand-pink transition-colors">
              MISSION
            </button>
            <button onClick={() => { onNavigate('subscription'); setMenuOpen(false); }} className="text-left text-lg font-black uppercase italic tracking-widest text-white/70 hover:text-white transition-colors">
              MY HUB
            </button>
            {isAdmin && (
              <button onClick={() => { onNavigate('admin'); setMenuOpen(false); }} className="text-left text-lg font-black uppercase italic tracking-widest text-brand-pink/70 hover:text-brand-pink transition-colors">
                ADMIN
              </button>
            )}
          </div>

          <div className="border-t-2 border-white/10 pt-6">
            {user ? (
              <button onClick={() => { onLogout?.(); setMenuOpen(false); }} className="flex items-center gap-3 text-sm font-black uppercase italic text-brand-pink/70 hover:text-brand-pink transition-colors">
                <span className="material-symbols-outlined text-sm">logout</span>
                LOGOUT
              </button>
            ) : (
              <button onClick={() => { onNavigate('login'); setMenuOpen(false); }} className="w-full bg-white text-black font-black py-4 text-lg uppercase border-2 border-black shadow-neo-magenta italic hover:bg-brand-yellow transition-all">
                LOGIN
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navigation;
