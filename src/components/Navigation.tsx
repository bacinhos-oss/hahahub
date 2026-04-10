
import React from 'react';
import { Page } from '../types';

interface NavigationProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  onLogout?: () => void;
  user?: { name: string; role: string; avatar: string; isPaid?: boolean };
}

const Navigation: React.FC<NavigationProps> = ({ activePage, onNavigate, onLogout, user }) => {
  return (
    <header className="fixed top-0 z-50 w-full bg-brand-black border-b-4 border-white px-8 py-5 flex items-center justify-between">
      <div className="flex items-center gap-12">
        <button 
          onClick={() => onNavigate('landing')} 
          className="logo-text text-3xl md:text-4xl uppercase tracking-tighter hover:scale-105 transition-transform"
        >
          HAHAHUB
        </button>
        <nav className="hidden lg:flex items-center gap-10 italic">
          <button 
            onClick={() => onNavigate('discovery')}
            className={`text-xs font-black tracking-widest uppercase pb-1 border-b-4 transition-all ${activePage === 'discovery' ? 'border-brand-yellow text-brand-yellow' : 'border-transparent text-white/60 hover:text-white'}`}
          >
            CATALOG
          </button>
          <button 
            onClick={() => onNavigate('about')}
            className={`text-xs font-black tracking-widest uppercase pb-1 border-b-4 transition-all ${activePage === 'about' ? 'border-brand-pink text-brand-pink' : 'border-transparent text-white/60 hover:text-white'}`}
          >
            MISSION
          </button>
          <button 
            onClick={() => onNavigate('subscription')}
            className={`text-xs font-black tracking-widest uppercase pb-1 border-b-4 transition-all ${activePage === 'subscription' ? 'border-white text-white' : 'border-transparent text-white/60 hover:text-white'}`}
          >
            MY HUB
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-6">
        {user ? (
          <div className="flex items-center gap-4 pl-4 border-l-2 border-white/10">
            <button 
                onClick={() => onNavigate('subscription')}
                className="text-right hover:opacity-80 transition-opacity"
            >
              <p className="text-[11px] font-black tracking-[0.2em] text-white italic">{user.name}</p>
              <p className="text-[9px] text-brand-cyan font-black tracking-widest uppercase">{user.isPaid ? 'PRO MEMBER' : 'USER'}</p>
            </button>
            <button 
              onClick={onLogout}
              className="ml-2 w-10 h-10 flex items-center justify-center border-2 border-white hover:bg-brand-pink transition-all"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
            </button>
          </div>
        ) : (
          <button 
            onClick={() => onNavigate('login')}
            className="bg-white text-black font-black px-8 py-2 text-sm uppercase border-2 border-black hover:bg-brand-yellow transition-all shadow-neo-magenta italic"
          >
            LOGIN
          </button>
        )}
      </div>
    </header>
  );
};

export default Navigation;
