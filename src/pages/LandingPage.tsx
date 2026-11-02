import React, { useMemo } from 'react';
import Footer from '../components/Footer';
import { Page, Show } from '../types';
import { Logo } from '../components/Logo';
import { SpectrumBar } from '../components/SpectrumBar';

interface LandingPageProps {
  onNavigate: (page: Page) => void;
  onPurchaseSuccess?: (planName: string) => void;
  shows: Show[];
}

const PILLARS = [
  { icon: 'theater_comedy', title: 'Showcase', text: 'Present your productions to producers, venues and festivals worldwide.' },
  { icon: 'travel_explore', title: 'Discover', text: 'Find new titles by genre, cast size, language and humor type.' },
  { icon: 'forum', title: 'Connect', text: 'Talk directly with fellow producers. No agents, no middlemen.' },
  { icon: 'handshake', title: 'License', text: 'Agree the terms with the rights holder. The deal is between you and the producer.' },
];

const Poster: React.FC<{ show: Show; onClick: () => void }> = ({ show, onClick }) => (
  <button
    onClick={onClick}
    className="group relative flex-shrink-0 w-36 sm:w-44 md:w-52 aspect-[2/3] overflow-hidden bg-brand-surface snap-start text-left"
  >
    <img
      src={show.imageUrl}
      alt={(show as any).englishTitle || show.title}
      loading="lazy"
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-90" />
    <div className="absolute bottom-0 left-0 right-0 p-3">
      <p className="text-[9px] font-bold uppercase tracking-widest text-white/60 mb-0.5">{show.genre}</p>
      <h3 className="text-sm font-bold leading-tight text-white line-clamp-2">{(show as any).englishTitle || show.title}</h3>
    </div>
    <div className="absolute inset-0 ring-0 group-hover:ring-2 ring-inset ring-white/70 transition-all" />
  </button>
);

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, shows }) => {
  const withImage = useMemo(() => shows.filter(s => s.imageUrl), [shows]);
  const hero = withImage[0];
  const latest = withImage.slice(0, 12);

  const languages = new Set(shows.map(s => s.language).filter(Boolean)).size;
  const open = () => onNavigate('discovery');
  const join = () => onNavigate('login');

  const navLink = (label: string, page: Page) => (
    <button onClick={() => onNavigate(page)} className="text-xs font-black tracking-widest uppercase italic pb-1 border-b-4 border-transparent text-white/60 hover:text-brand-yellow hover:border-white/40 transition-all">{label}</button>
  );

  return (
    <div className="flex flex-col w-full bg-brand-black overflow-x-hidden">

      {/* NAV */}
      <header className="fixed top-0 z-50 w-full bg-gradient-to-b from-black via-black/80 to-transparent">
        <div className="max-w-[1500px] mx-auto px-4 md:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <button onClick={() => onNavigate('landing')}>
              <Logo height={34} className="md:hidden" />
              <Logo height={44} className="hidden md:block" />
            </button>
            <nav className="hidden md:flex items-center gap-8">
              {navLink('Catalog', 'discovery')}
              {navLink('Mission', 'about')}
              {navLink('FAQ', 'faq')}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={join} className="bg-white text-black font-black px-6 py-2 text-xs md:text-sm uppercase tracking-widest italic hover:bg-brand-pink hover:text-white transition-colors">
              Sign in
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative min-h-[80vh] flex items-end md:items-center overflow-hidden">
          {hero && (
            <img src={hero.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 scale-110 blur-sm" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/60 to-brand-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-black/80 via-transparent to-transparent" />

          <div className="relative w-full max-w-[1500px] mx-auto px-4 md:px-12 pt-32 pb-16 md:pb-24">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.35em] text-white/60 mb-5">
              International Comedy Theatre Producers Platform
            </p>
            <h1 className="font-display text-white text-5xl sm:text-7xl md:text-8xl leading-[0.9] tracking-tight mb-5">
              The Laff<br />Exchange
            </h1>
            <p className="font-display text-xl sm:text-2xl md:text-3xl uppercase tracking-[0.12em] mb-8">
              <span className="text-brand-yellow">Tickle.</span>{' '}
              <span className="text-brand-pink">Set up.</span>{' '}
              <span className="text-brand-cyan">Punch.</span>
            </p>
            <p className="text-base md:text-lg text-white/70 max-w-2xl mb-10 leading-relaxed">
              HahaHub is the international professional network for theatre comedy producers. Showcase productions, discover new titles, connect directly with fellow producers, and create new licensing opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={join} className="bg-white text-black font-black px-8 py-4 text-sm md:text-base uppercase tracking-widest italic hover:bg-brand-pink hover:text-white transition-colors">
                Join free
              </button>
              <button onClick={open} className="bg-white/10 text-white font-black px-8 py-4 text-sm md:text-base uppercase tracking-widest italic backdrop-blur hover:bg-white/20 transition-colors">
                Browse the catalog
              </button>
            </div>
            {shows.length > 0 && (
              <p className="mt-8 text-xs font-bold uppercase tracking-widest text-white/40">
                {shows.length} shows{languages > 1 ? ` · ${languages} languages` : ''} · Free to join
              </p>
            )}
          </div>
        </section>

        {/* POSTERS */}
        {latest.length > 0 && (
          <section className="pt-10 pb-16 relative overflow-hidden">
            <style>{`
              @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
              .ticker-track { display: flex; gap: 16px; animation: ticker 40s linear infinite; width: max-content; }
              .ticker-track:hover { animation-play-state: paused; }
            `}</style>
            <div className="px-4 md:px-12 max-w-[1500px] mx-auto flex items-baseline justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tight text-white">In the catalog</h2>
              <button onClick={open} className="text-xs font-black uppercase italic tracking-widest text-white/50 hover:text-white transition-colors">See all →</button>
            </div>
            <div className="ticker-track">
              {[...latest, ...latest].map((s, i) => <Poster key={i} show={s} onClick={open} />)}
            </div>
          </section>
        )}

        {/* PILLARS */}
        <section className="max-w-[1500px] mx-auto px-4 md:px-12 py-16 md:py-24">
          <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tight text-white mb-12 max-w-3xl leading-tight">
            Find comedy shows from around the world and license them directly from the producers.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-12">
            {PILLARS.map(p => (
              <div key={p.title}>
                <span className="material-symbols-outlined text-3xl text-brand-pink mb-4 block">{p.icon}</span>
                <h3 className="text-lg font-black uppercase italic tracking-widest text-white mb-2">{p.title}</h3>
                <p className="text-white/60 font-bold italic leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* LEGAL */}
        <section className="border-t border-white/10">
          <p className="max-w-3xl mx-auto px-4 py-10 text-center text-xs text-white/30 leading-relaxed">
            HahaHub is a discovery tool for professionals aged 18+ and is not a party to any licensing agreement between users. Shows remain the property of their rights holders.
          </p>
          <SpectrumBar height={6} />
        </section>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default LandingPage;
