import React from 'react';
import { Page } from '../types';
import Smile from '../components/Smile';

interface NotFoundPageProps {
  onNavigate: (page: Page) => void;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center px-4 text-center">
      <Smile height={200} className="mb-10" />
      <p className="text-xs font-bold uppercase tracking-[0.35em] text-white/50 mb-3">Error 404</p>
      <h1 className="font-display text-white text-3xl md:text-5xl leading-tight mb-4">The punchline was not found.</h1>
      <p className="text-white/50 font-bold italic max-w-md mb-10">This page doesn't exist. But the comedy does.</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => onNavigate('discovery')}
          className="bg-white text-black px-8 py-4 font-black uppercase text-sm tracking-widest italic hover:bg-brand-pink hover:text-white transition-colors"
        >
          Browse the catalog
        </button>
        <button
          onClick={() => onNavigate('landing')}
          className="bg-white/10 text-white px-8 py-4 font-black uppercase text-sm tracking-widest italic hover:bg-white/20 transition-colors"
        >
          Home
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
