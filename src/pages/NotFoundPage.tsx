import React from 'react';
import { Page } from '../types';

interface NotFoundPageProps {
  onNavigate: (page: Page) => void;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center px-4 text-center overflow-hidden">
      {/* Glitch background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-1 h-64 bg-brand-cyan opacity-20"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-48 bg-brand-pink opacity-20"></div>
        <div className="absolute bottom-1/4 left-1/2 w-1 h-32 bg-brand-yellow opacity-20"></div>
      </div>

      <div className="relative space-y-8 max-w-2xl">
        <div>
          <h1 className="font-display text-[120px] md:text-[200px] text-white uppercase leading-none tracking-tighter italic"
            style={{ textShadow: '4px 4px 0px #FF0266, 8px 8px 0px #03DAC6' }}>
            SHUSH.
          </h1>
          <p className="text-white/30 font-black uppercase text-sm md:text-lg tracking-[0.4em] italic mt-2">
            Nothing to see here. Move along.
          </p>
        </div>

        <div className="border-4 border-white/20 p-6 bg-brand-surface">
          <p className="text-white/60 font-bold italic text-lg leading-relaxed">
            This page doesn't exist. But the comedy does.
          </p>
          <p className="text-white/20 font-bold italic text-sm mt-2">
            Error 404 — The punchline was not found.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => onNavigate('discovery')}
            className="bg-brand-yellow text-black px-8 py-4 font-black uppercase border-4 border-black shadow-neo-magenta hover:translate-x-[-3px] hover:translate-y-[-3px] transition-all italic"
          >
            🥊 Send Inquiry →
          </button>
          <button
            onClick={() => onNavigate('landing')}
            className="bg-transparent text-white px-8 py-4 font-black uppercase border-4 border-white hover:border-brand-cyan hover:text-brand-cyan transition-all italic"
          >
            ← Go Home
          </button>
        </div>

        <p className="text-white/10 font-black uppercase text-xs tracking-widest">
          Break a Laffing Leg. 🦵
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;
