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
  { icon: 'travel_explore', title: 'Discover', text: 'Search comedy productions from around the world by genre, cast size, language and humor type.' },
  { icon: 'forum', title: 'Connect', text: 'Message the rights holder directly. No agents, no middlemen, no commission.' },
  { icon: 'handshake', title: 'License', text: 'Agree the terms with the producer, using our contract templates. The deal is yours.' },
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

const Row: React.FC<{ title: string; shows: Show[]; onOpen: () => void }> = ({ title, shows, onOpen }) => (
  <section className="mb-12">
    <div className="px-4 md:px-12 max-w-[1500px] mx-auto flex items-baseline justify-between mb-4">
      <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
      <button onClick={onOpen} className="text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors">See all →</button>
    </div>
    <div className="px-4 md:px-12 max-w-[1500px] mx-auto">
      <div className="flex gap-3 md:gap-4 overflow-x-auto snap-x pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {shows.map(s => <Poster key={s.id} show={s} onClick={onOpen} />)}
      </div>
    </div>
  </section>
);

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, shows }) => {
  const withImage = useMemo(() => shows.filter(s => s.imageUrl), [shows]);
  const hero = withImage[0];
  const latest = withImage.slice(0, 14);

  const genreRows = useMemo(() => {
    const map = new Map<string, Show[]>();
    withImage.forEach(s => {
      if (!s.genre) return;
      map.set(s.genre, [...(map.get(s.genre) || []), s]);
    });
    return [...map.entries()]
      .filter(([, list]) => list.length >= 3)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 2);
  }, [withImage]);

  const languages = new Set(shows.map(s => s.language).filter(Boolean)).size;
  const open = () => onNavigate('discovery');
  const join = () => onNavigate('login');

  const navLink = (label: string, page: Page) => (
    <button onClick={() => onNavigate(page)} className="text-sm font-bold text-white/70 hover:text-white transition-colors">{label}</button>
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
            <button onClick={join} className="hidden sm:block text-sm font-bold text-white/70 hover:text-white transition-colors">Sign in</button>
            <button onClick={join} className="bg-white text-black font-bold px-5 py-2 text-sm hover:bg-brand-pink hover:text-white transition-colors">
              Join free
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative min-h-[88vh] flex items-end md:items-center overflow-hidden">
          {hero && (
            <img src={hero.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 scale-110 blur-sm" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/60 to-brand-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-black/80 via-transparent to-transparent" />

          <div className="relative w-full max-w-[1500px] mx-auto px-4 md:px-12 pt-32 pb-16 md:pb-24">
            <h1 className="font-display text-white text-5xl sm:text-7xl md:text-8xl leading-[0.95] tracking-tight max-w-4xl mb-6">
              Comedy theatre,<br />licensed <span className="text-brand-pink">directly.</span>
            </h1>
            <p className="text-base md:text-xl text-white/70 max-w-xl mb-10 leading-relaxed">
              The catalog where producers, venues and festivals find and license comedy shows from around the world. No agents. No commission.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={join} className="bg-white text-black font-bold px-8 py-4 text-base hover:bg-brand-pink hover:text-white transition-colors">
                Join free
              </button>
              <button onClick={open} className="bg-white/10 text-white font-bold px-8 py-4 text-base backdrop-blur hover:bg-white/20 transition-colors">
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

        {/* ROWS */}
        {latest.length > 0 && (
          <div className="pt-10 -mt-8 relative">
            <Row title="Latest in the catalog" shows={latest} onOpen={open} />
            {genreRows.map(([genre, list]) => (
              <Row key={genre} title={genre} shows={list.slice(0, 14)} onOpen={open} />
            ))}
          </div>
        )}

        {/* PILLARS */}
        <section className="max-w-[1500px] mx-auto px-4 md:px-12 py-16 md:py-24">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-12 max-w-2xl leading-tight">
            From first look to signed deal, in one place.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
            {PILLARS.map(p => (
              <div key={p.title}>
                <span className="material-symbols-outlined text-3xl text-brand-pink mb-4 block">{p.icon}</span>
                <h3 className="text-lg font-bold text-white mb-2">{p.title}</h3>
                <p className="text-white/60 leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CLOSING CTA */}
        <section className="relative border-t border-white/10">
          <div className="max-w-3xl mx-auto px-4 py-20 md:py-28 text-center">
            <h2 className="font-display text-white text-4xl md:text-6xl leading-tight mb-4">Find your next show.</h2>
            <p className="text-white/60 text-lg mb-8">Create a free account with your email. No credit card.</p>
            <button onClick={join} className="bg-white text-black font-bold px-10 py-4 text-base hover:bg-brand-pink hover:text-white transition-colors">
              Join free
            </button>
            <p className="mt-10 text-xs text-white/30 leading-relaxed max-w-xl mx-auto">
              HahaHub is a discovery tool for professionals aged 18+ and is not a party to any licensing agreement between users. Shows remain the property of their rights holders.
            </p>
          </div>
          <SpectrumBar height={6} />
        </section>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default LandingPage;
