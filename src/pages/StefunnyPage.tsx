import React, { useState, useEffect, useRef } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Page, User, Show } from '../types';

interface StefunnyPageProps {
  onNavigate: (page: Page) => void;
  onLogout?: () => void;
  user?: User;
  shows: Show[];
  onToggleFavorite: (showId: string) => void;
  onUpdateStats: (showId: string, type: 'view' | 'inquiry') => void;
}

const StefunnyPage: React.FC<StefunnyPageProps> = ({ onNavigate, onLogout, user, shows, onToggleFavorite, onUpdateStats }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Show[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(() => {
      const q = query.toLowerCase();
      const filtered = shows.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.author?.toLowerCase().includes(q) ||
        s.genre?.toLowerCase().includes(q) ||
        s.subgenre?.toLowerCase().includes(q) ||
        s.location?.toLowerCase().includes(q) ||
        s.synopsis?.toLowerCase().includes(q) ||
        s.humorType?.toLowerCase().includes(q) ||
        s.language?.toLowerCase().includes(q) ||
        String(s.maleRoles + s.femaleRoles).includes(q) ||
        String(s.productionYear).includes(q)
      );
      setResults(filtered);
      setSearching(false);
      setHasSearched(true);
    }, 400);
    return () => clearTimeout(timer);
  }, [query, shows]);

  const canAccess = user?.isPaid || user?.isAdmin;

  return (
    <div className="flex flex-col min-h-screen bg-brand-black">
      <Navigation activePage="stefunny" onNavigate={onNavigate} onLogout={onLogout} user={user} />

      <main className="pt-24 pb-20 flex-1">

        {/* MISS STEFUNNY HERO */}
        <div className="px-6 md:px-12 py-12 md:py-20 border-b-4 border-white/10">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-8 md:gap-16">

              {/* Miss Stefunny visual */}
              <div className="flex-shrink-0">
                <div className="relative w-32 h-32 md:w-48 md:h-48">
                  {/* Abstract Miss Stefunny icon - noir detective style */}
                  <div className="w-full h-full bg-brand-yellow border-4 border-black shadow-[8px_8px_0px_black] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1/3 bg-black flex items-center justify-center">
                      <div className="text-brand-yellow font-black text-xs uppercase tracking-widest italic">MISS</div>
                    </div>
                    <div className="mt-4 text-center">
                      <div className="text-5xl md:text-7xl font-black text-black italic leading-none">SF</div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-pink"></div>
                  </div>
                  <div className="absolute -bottom-3 -right-3 bg-brand-pink border-4 border-black px-2 py-1">
                    <span className="text-white font-black text-[8px] uppercase tracking-widest italic">Tickle Finder</span>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="flex-1">
                <span className="text-brand-cyan text-[10px] font-black uppercase tracking-[0.5em] italic block mb-2">Smart Search</span>
                <h1 className="text-6xl md:text-[100px] font-black uppercase italic leading-[0.85] tracking-tighter text-white">
                  MISS<br/><span className="text-brand-yellow">STEFUNNY</span>
                </h1>
                <p className="text-white/40 font-bold italic mt-4 text-sm md:text-base max-w-lg">
                  The world's only comedy rights detective. Genre, country, cast, keywords — she finds the show. You close the deal.
                </p>
              </div>
            </div>

            {/* SEARCH BOX */}
            <div className="mt-10 md:mt-16">
              <div className="flex items-center gap-4 bg-brand-surface border-4 border-brand-yellow p-4 md:p-6 shadow-neo-yellow focus-within:shadow-neo-cyan transition-all">
                <div className="flex-shrink-0 w-10 h-10 bg-brand-yellow border-2 border-black flex items-center justify-center font-black text-black text-xs uppercase italic rotate-[-2deg]">
                  SF
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Ask Stefunny... genre, country, cast size, keywords"
                  className="flex-1 bg-transparent border-none text-white font-black text-base md:text-xl uppercase outline-none italic placeholder:text-white/20 placeholder:normal-case placeholder:not-italic placeholder:text-sm"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="text-white/40 hover:text-brand-pink transition-colors flex-shrink-0">
                    <span className="material-symbols-outlined text-2xl">close</span>
                  </button>
                )}
                {!query && (
                  <span className="material-symbols-outlined text-brand-yellow text-3xl flex-shrink-0">search</span>
                )}
              </div>

              {/* STATUS */}
              <div className="mt-3 h-6 flex items-center">
                {searching && (
                  <span className="text-[10px] font-black uppercase italic text-white/30 tracking-widest">
                    Stefunny is tickling the vault...
                  </span>
                )}
                {!searching && hasSearched && query && (
                  <span className={`text-[10px] font-black uppercase italic tracking-widest ${results.length > 0 ? 'text-brand-cyan' : 'text-brand-pink'}`}>
                    {results.length > 0
                      ? `Stefunny found ${results.length} show${results.length !== 1 ? 's' : ''} for you. 🥊`
                      : `Stefunny looked everywhere. Nothing. Try funnier keywords.`}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RESULTS */}
        {hasSearched && results.length > 0 && (
          <div className="px-6 md:px-12 py-10">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map(show => (
                  <div
                    key={show.id}
                    onClick={() => canAccess ? onNavigate('discovery') : onNavigate('pricing')}
                    className="bg-brand-surface border-4 border-white/20 hover:border-brand-yellow transition-all cursor-pointer group p-0 overflow-hidden"
                  >
                    {/* Image */}
                    <div className="relative h-40 overflow-hidden border-b-4 border-white/20">
                      {show.imageUrl ? (
                        <img src={show.imageUrl} alt={show.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                      ) : (
                        <div className="w-full h-full bg-brand-black flex items-center justify-center">
                          <span className="text-white/10 font-black text-4xl uppercase italic">{show.title[0]}</span>
                        </div>
                      )}
                      {/* Badges */}
                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        {(show as any).is_verified && (
                          <span className="text-[7px] font-black uppercase text-black bg-brand-cyan px-2 py-0.5 italic border border-black">VERIFIED</span>
                        )}
                        {(show as any).is_founding && (
                          <span className="text-[7px] font-black uppercase text-black bg-brand-yellow px-2 py-0.5 italic border border-black">FOUNDING</span>
                        )}
                      </div>
                    </div>
                    {/* Info */}
                    <div className="p-4">
                      <p className="text-[9px] font-black uppercase tracking-widest text-brand-cyan italic mb-1">{show.genre}</p>
                      <h3 className="font-black uppercase italic text-white text-sm leading-tight mb-1 group-hover:text-brand-yellow transition-colors">{show.title}</h3>
                      <p className="text-white/40 text-[10px] font-bold italic mb-3">{show.author} · {show.location} · {show.productionYear}</p>
                      {canAccess ? (
                        <span className="text-[9px] font-black uppercase italic text-brand-yellow">View Dossier →</span>
                      ) : (
                        <span className="text-[9px] font-black uppercase italic text-brand-pink">Unlock Access →</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* EMPTY STATE - no search yet */}
        {!hasSearched && (
          <div className="px-6 md:px-12 py-20 text-center">
            <div className="max-w-lg mx-auto space-y-6">
              <p className="text-white/20 font-black uppercase italic text-sm tracking-widest">Try searching for</p>
              <div className="flex flex-wrap gap-3 justify-center">
                {['Physical Comedy', 'France', '2 actors', 'Dark Comedy', 'Touring', 'Slovenia', 'Musical', 'Universal'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-4 py-2 border-2 border-white/20 text-white/40 font-black uppercase italic text-xs hover:border-brand-yellow hover:text-brand-yellow transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default StefunnyPage;
