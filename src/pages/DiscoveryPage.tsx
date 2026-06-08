
import { supabase } from '../lib/supabase';
import React, { useState, useMemo, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { Page, Show, User } from '../types';
import { Badge, getProfileBadges } from '../components/Badge';


interface DiscoveryPageProps {
  onNavigate: (page: Page) => void;
  onLogout?: () => void;
  user?: User;
  onToggleFavorite: (id: string) => void;
  onUpdateStats: (id: string, type: 'view' | 'inquiry') => void;
  shows: Show[];
  onViewProducer?: (producerId: string) => void;
  initialShowId?: string | null;
}

const DiscoveryPage: React.FC<DiscoveryPageProps> = ({ onNavigate, onLogout, user, onToggleFavorite, onUpdateStats, shows, onViewProducer, initialShowId }) => {
  const [selectedShowId, setSelectedShowId] = useState<string | null>(initialShowId || null);
  const [inquiryShowId, setInquiryShowId] = useState<string | null>(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquiryRateLimit, setInquiryRateLimit] = useState<number | null>(null); // koliko inquiries je poslal ta mesec (GIGL)
  const [inquiryFile, setInquiryFile] = useState<File | null>(null);
  const [inquirySending, setInquirySending] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<'script' | 'full_punch' | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [shortlist, setShortlist] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('hahahub_shortlist') || '[]'); } catch { return []; }
  });
  const [showShortlistOnly, setShowShortlistOnly] = useState(false);

  // Hide skeleton as soon as shows arrive
  useEffect(() => {
    if (shows.length > 0) {
      setIsLoading(false);
    }
  }, [shows]);

  const toggleShortlist = (e: React.MouseEvent, showId: string) => {
    e.stopPropagation();
    const next = shortlist.includes(showId)
      ? shortlist.filter(id => id !== showId)
      : [...shortlist, showId];
    setShortlist(next);
    localStorage.setItem('hahahub_shortlist', JSON.stringify(next));
  };

  // "New this week" — show uploaded in last 7 days
  const isNewThisWeek = (show: Show) => {
    if (!(show as any).created_at) return false;
    const created = new Date((show as any).created_at);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return created > weekAgo;
  };
  
  const [filterGenre, setFilterGenre] = useState('All');
  const [filterCountry, setFilterCountry] = useState('All');
  const [filterCast, setFilterCast] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedShow = useMemo(() => shows.find(s => s.id === selectedShowId) || null, [shows, selectedShowId]);
  const inquiryShow = useMemo(() => shows.find(s => s.id === inquiryShowId) || null, [shows, inquiryShowId]);

  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    shows.forEach(s => {
      if (s.genre) genres.add(s.genre);
      if (s.subgenre) genres.add(s.subgenre);
    });
    return ['All', ...Array.from(genres)].sort();
  }, [shows]);

  const allCountries = useMemo(() => ['All', ...new Set(shows.map(s => s.location))].sort(), [shows]);

  const filteredShows = useMemo(() => {
    let result = shows.filter(show => {
      if (!show.is_produced) return false;
      if (showShortlistOnly && !shortlist.includes(show.id)) return false;
      const totalCast = (show.maleRoles || 0) + (show.femaleRoles || 0);
      const matchesGenre = filterGenre === 'All' || show.genre === filterGenre || show.subgenre === filterGenre;
      const matchesCountry = filterCountry === 'All' || show.location === filterCountry;
      const matchesCast = filterCast === 'All' || 
                         (filterCast === 'Solo/Duo' && totalCast <= 2) ||
                         (filterCast === 'Small (3-5)' && totalCast >= 3 && totalCast <= 5) ||
                         (filterCast === 'Large (6+)' && totalCast >= 6);
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || [
        show.title, show.author, show.director, show.synopsis, (show as any).synopsis_en, (show as any).original_language, (show as any).script_in_english,
        show.genre, show.subgenre, show.location, show.language,
        show.humorType, show.rightsStatus, show.budgetRange,
        show.producerName,
        String(show.duration), String(show.maleRoles + show.femaleRoles),
      ].some(field => field?.toLowerCase().includes(q));
      return matchesGenre && matchesCountry && matchesCast && matchesSearch;
    });

    return result.sort((a, b) => {
      // ROAR/FEATURED vedno prvi
      const aFeatured = (a as any).producer_plan === 'roar' ? 1 : 0;
      const bFeatured = (b as any).producer_plan === 'roar' ? 1 : 0;
      if (bFeatured !== aFeatured) return bFeatured - aFeatured;
      // Potem normalni sort
      if (sortBy === 'Newest') return (b.productionYear || 0) - (a.productionYear || 0);
      if (sortBy === 'Popular') return (b.likesCount || 0) - (a.likesCount || 0);
      if (sortBy === 'Trending') return (b.viewsCount || 0) - (a.viewsCount || 0);
      return 0;
    });
  }, [shows, filterGenre, filterCountry, filterCast, sortBy, searchQuery, shortlist, showShortlistOnly]);

  const handleShowSelect = (show: Show) => {
    setSelectedShowId(show.id);
    onUpdateStats(show.id, 'view');
  };

  const renderDetailModal = () => {
    if (!selectedShow) return null;
    const isFavorited = user?.favorites.includes(selectedShow.id);
    const isGuest = !user || user.name === "Guest User";

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
        <div className="absolute inset-0 bg-brand-black/95 backdrop-blur-xl" onClick={() => setSelectedShowId(null)}></div>
        <div className="relative bg-brand-black border-4 border-white w-full max-w-7xl max-h-[90vh] overflow-y-auto overflow-x-hidden shadow-neo-yellow animate-in fade-in zoom-in-95 duration-500 ease-out text-white pb-12">
          <button onClick={() => setSelectedShowId(null)} className="absolute top-6 right-6 text-white hover:text-brand-pink transition-all z-20">
            <span className="material-symbols-outlined text-4xl font-black">close</span>
          </button>
          
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/3 border-b-4 lg:border-b-0 lg:border-r-4 border-white bg-brand-black overflow-hidden z-10 relative">
                <div className="flex flex-col h-full">
                  {/* POSTER */}
                  <div className="relative flex-shrink-0 aspect-[2/3]">
                    <img src={selectedShow.imageUrl} className="w-full h-full object-cover object-center" alt={selectedShow.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                    <div className="absolute bottom-3 left-4 z-10">
                      <p className="text-[8px] font-black uppercase tracking-widest text-white/50 italic">Poster</p>
                    </div>
                  </div>

                  {/* PRODUCTION PHOTOS */}
                  <div className="border-t-4 border-white flex-1 px-3 pt-3 pb-3">
                    <p className="text-[8px] font-black uppercase tracking-widest text-brand-cyan italic mb-3">Photos from Production</p>
                    <div className="space-y-2">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-full border-2 border-dashed border-white/20 overflow-hidden bg-white/5 flex items-center justify-center" style={{aspectRatio:"16/9"}}>
                          {selectedShow.productionPhotos && selectedShow.productionPhotos[i] ? (
                            <img src={selectedShow.productionPhotos[i]} alt={"Production photo " + (i + 1)} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <span className="material-symbols-outlined text-white/10 text-3xl">add_photo_alternate</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
            </div>

            <div className="flex-1 p-4 md:p-12 space-y-16 overflow-x-hidden">
              {isGuest ? (
                <div className="flex flex-col items-center justify-center text-center py-24 space-y-8">
                  <span className="material-symbols-outlined text-8xl text-brand-pink">lock_person</span>
                  <h2 className="text-4xl font-display uppercase italic text-white">PRODUCER TIER ONLY</h2>
                  <p className="text-gray-400 italic font-bold">Registration required to view full scripts, commercial Bible, and technical rider.</p>
                  <button onClick={() => onNavigate('login')} className="bg-brand-yellow text-black px-10 py-4 font-black uppercase text-sm border-4 border-white shadow-neo-magenta italic">Unlock Full Dossier</button>
                </div>
              ) : (
                <div className="space-y-16">
                  {/* HEADER */}
                  <div className="flex flex-row justify-between items-start gap-3">
                    <div className="flex-1 min-w-0 pr-2">
                      <span className="bg-brand-cyan text-black px-3 py-1 text-[10px] font-black uppercase italic mb-2 inline-block">PRODUCTION DOSSIER v{selectedShow.productionYear}</span>
                      <h2 className="text-4xl md:text-7xl font-black uppercase leading-[0.9] tracking-tighter italic break-words">{selectedShow.title}</h2>
                      <p className="text-base md:text-xl font-bold text-white/40 italic mt-4">{selectedShow.location} • {selectedShow.duration} min • {selectedShow.genre}</p>
                    </div>
                    <button onClick={() => onToggleFavorite(selectedShow.id)} className={`h-14 w-14 flex-shrink-0 flex items-center justify-center border-4 transition-all mt-8 ${isFavorited ? 'bg-brand-pink text-white border-black shadow-neo-white' : 'bg-transparent text-white border-white hover:border-brand-pink'}`}>
                      <span className="material-symbols-outlined text-2xl font-black">favorite</span>
                    </button>
                  </div>

                  {/* TRAILER VIDEO */}
                  {(selectedShow as any).trailer_url && (
                    <section className="space-y-4">
                      <h4 className="text-xl font-black uppercase italic text-brand-cyan">🎬 TRAILER</h4>
                      <div className="relative w-full border-4 border-brand-cyan" style={{paddingBottom:'56.25%'}}>
                        <iframe
                          className="absolute inset-0 w-full h-full"
                          src={(() => {
                            const url = (selectedShow as any).trailer_url;
                            if (url.includes('youtube.com/watch')) return url.replace('watch?v=', 'embed/');
                            if (url.includes('youtu.be/')) return 'https://www.youtube.com/embed/' + url.split('youtu.be/')[1];
                            if (url.includes('vimeo.com/')) return 'https://player.vimeo.com/video/' + url.split('vimeo.com/')[1];
                            return url;
                          })()}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </section>
                  )}

                  {/* SYNOPSIS - MOVED HIGHER AS REQUESTED */}
                  <section className="space-y-6">
                    <h4 className="text-xl font-black uppercase italic text-brand-pink">SYNOPSIS</h4>
                    {(selectedShow as any).synopsis_en && (
                      <div className="mb-4">
                        <p className="text-[9px] font-black uppercase tracking-widest text-brand-yellow mb-2 italic">English Synopsis</p>
                        <p className="text-gray-200 text-xl leading-relaxed italic border-l-8 border-brand-yellow pl-8 bg-white/5 py-4">{(selectedShow as any).synopsis_en}</p>
                      </div>
                    )}
                    {selectedShow.synopsis && (
                      <div>
                        {(selectedShow as any).synopsis_en && <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-2 italic">Original Language Synopsis</p>}
                        <p className="text-gray-200 text-xl leading-relaxed italic border-l-8 border-brand-pink pl-8 bg-white/5 py-4">{selectedShow.synopsis}</p>
                      </div>
                    )}
                    {(selectedShow as any).original_language && (
                      <div className="flex gap-4 mt-4 flex-wrap">
                        <span className="text-[9px] font-black uppercase italic text-white/30">Original: <span className="text-white/60">{(selectedShow as any).original_language}</span></span>
                        {(selectedShow as any).script_in_english && (selectedShow as any).script_in_english !== 'false' && (
                          <span className="text-[9px] font-black uppercase italic text-brand-cyan border border-brand-cyan/30 px-2 py-0.5">
                            Script in EN: {(selectedShow as any).script_in_english === 'true' ? '✓ Full' : 'Partial'}
                          </span>
                        )}
                      </div>
                    )}
                  </section>

                  {/* 00. RIGHTS & IDENTITY */}
                  <section className="space-y-8">
                     <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-cyan italic">00. RIGHTS & IDENTITY</h4>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-brand-surface border-4 border-white p-4 shadow-neo-cyan overflow-hidden">
                           <p className="text-[8px] font-black uppercase text-brand-cyan mb-2 tracking-widest">PRODUCER / COMPANY</p>
                           <p className="text-lg font-black uppercase italic">{selectedShow.producerName}</p>
                           {(selectedShow as any).user_id && (
                             <button
                               onClick={() => { if (onViewProducer && (selectedShow as any).user_id) { onViewProducer((selectedShow as any).user_id); } onNavigate('producer' as any); }}
                               className="text-[9px] font-black uppercase italic text-brand-cyan hover:text-white transition-colors mt-1 block"
                             >
                               View Producer Profile →
                             </button>
                           )}
                           <div className="flex flex-wrap gap-1 mt-2">
                             {(selectedShow as any).is_verified && (
                               <span className="bg-brand-cyan text-black text-[8px] font-black uppercase px-2 py-0.5 italic border border-black">VERIFIED</span>
                             )}
                             {(selectedShow as any).is_founding && (
                               <span className="bg-brand-yellow text-black text-[8px] font-black uppercase px-2 py-0.5 italic border border-black">FOUNDING</span>
                             )}
                           </div>
                        </div>
                        <div className="bg-brand-surface border-4 border-white p-4 overflow-hidden">
                           <p className="text-[8px] font-black uppercase text-brand-yellow mb-1 tracking-widest">COPYRIGHT HOLDER</p>
                           <p className="text-lg font-black uppercase italic">{selectedShow.rightsHolder}</p>
                        </div>
                        <div className="bg-brand-surface border-4 border-white p-4 overflow-hidden">
                           <p className="text-[8px] font-black uppercase text-brand-pink mb-1 tracking-widest">RIGHTS STATUS</p>
                           <p className="text-lg font-black uppercase italic">{selectedShow.rightsStatus}</p>
                        </div>
                        <div className="bg-brand-surface border-2 border-white/20 p-6">
                           <p className="text-[9px] font-black uppercase text-gray-500 mb-1 tracking-widest italic">Territories Available</p>
                           <p className="text-sm font-black uppercase italic">{selectedShow.territoriesAvailable || 'Global'}</p>
                        </div>
                        <div className="bg-brand-surface border-2 border-white/20 p-6">
                           <p className="text-[9px] font-black uppercase text-gray-500 mb-1 tracking-widest italic">Licensed Countries</p>
                           <p className="text-sm font-black uppercase italic">{selectedShow.licensedCountries || '—'}</p>
                        </div>
                        <div className="bg-brand-surface border-2 border-white/20 p-6">
                           <p className="text-[9px] font-black uppercase text-gray-500 mb-1 tracking-widest italic">Rights Clearing Speed</p>
                           <p className="text-sm font-black uppercase italic">{selectedShow.rightsClearingSpeed}</p>
                        </div>
                        {selectedShow.territoryConflicts && <div className="bg-brand-surface border-2 border-white/20 p-6">
                           <p className="text-[9px] font-black uppercase text-gray-500 mb-1 tracking-widest italic">Territory Conflicts</p>
                           <p className="text-sm font-black italic break-words">{selectedShow.territoryConflicts}</p>
                        </div>}
                        {selectedShow.mediaConflicts && <div className="bg-brand-surface border-2 border-white/20 p-6">
                           <p className="text-[9px] font-black uppercase text-gray-500 mb-1 tracking-widest italic">Media Conflicts</p>
                           <p className="text-sm font-black italic break-words">{selectedShow.mediaConflicts}</p>
                        </div>}
                     </div>
                  </section>

                  {/* 01. CREATIVE ENGINE */}
                  <section className="space-y-8">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink italic">01. CREATIVE ENGINE</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <div className="flex gap-4">
                          <div className="flex-1 border-l-4 border-brand-pink pl-4 py-2 bg-white/5">
                             <p className="text-[8px] font-black uppercase text-brand-pink italic">Playwright</p>
                             <p className="text-xl font-black italic">{selectedShow.author || '—'}</p>
                          </div>
                          <div className="flex-1 border-l-4 border-brand-cyan pl-4 py-2 bg-white/5">
                             <p className="text-[8px] font-black uppercase text-brand-cyan italic">Director</p>
                             <p className="text-xl font-black italic uppercase">{selectedShow.director || 'TBD'}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="border-l-4 border-brand-yellow pl-4 py-2 bg-white/5">
                             <p className="text-[8px] font-black uppercase text-brand-yellow italic">Subgenre</p>
                             <p className="text-sm font-black italic break-words">{selectedShow.subgenre || 'N/A'}</p>
                          </div>
                          <div className="border-l-4 border-white/40 pl-4 py-2 bg-white/5">
                             <p className="text-[8px] font-black uppercase text-gray-500 italic">Humor Type</p>
                             <p className="text-sm font-black italic break-words">{selectedShow.humorType}</p>
                          </div>
                          <div className="border-l-4 border-white/40 pl-4 py-2 bg-white/5">
                             <p className="text-[8px] font-black uppercase text-gray-500 italic">Director Mandatory</p>
                             <p className="text-sm font-black italic break-words">{selectedShow.isDirectorMandatory ? 'YES' : 'NO'}</p>
                          </div>
                          <div className="border-l-4 border-white/40 pl-4 py-2 bg-white/5">
                             <p className="text-[8px] font-black uppercase text-gray-500 italic">Creative Team</p>
                             <p className="text-sm font-black italic break-words">{selectedShow.creativeTeamAvailability}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-black/40 p-4 border border-white/10 flex justify-between items-center">
                             <span className="text-xs font-black uppercase italic text-brand-yellow">Male Roles</span>
                             <span className="text-2xl font-black">{selectedShow.maleRoles}</span>
                          </div>
                          <div className="bg-black/40 p-4 border border-white/10 flex justify-between items-center">
                             <span className="text-xs font-black uppercase italic text-brand-pink">Female Roles</span>
                             <span className="text-2xl font-black">{selectedShow.femaleRoles}</span>
                          </div>
                          <div className="bg-black/40 p-4 border border-white/10 flex justify-between items-center col-span-2">
                             <span className="text-xs font-black uppercase italic text-brand-cyan">Intermission</span>
                             <span className="text-sm font-black">{selectedShow.hasIntermission ? 'YES' : 'NO'}</span>
                          </div>
                        </div>
                        {selectedShow.translationsAvailable && <div className="border-l-4 border-brand-cyan pl-4 py-2 bg-white/5">
                           <p className="text-[8px] font-black uppercase text-brand-cyan italic">Translations Available</p>
                           <p className="text-sm font-black italic break-words">{selectedShow.translationsAvailable}</p>
                        </div>}
                        {selectedShow.internationalSuccessNotes && <div className="border-l-4 border-brand-yellow pl-4 py-2 bg-white/5">
                           <p className="text-[8px] font-black uppercase text-brand-yellow italic">International Success</p>
                           <p className="text-sm italic text-gray-300 break-words">{selectedShow.internationalSuccessNotes}</p>
                        </div>}
                      </div>
                      <div className="bg-brand-surface border-4 border-white p-8 space-y-6 shadow-neo-magenta">
                         <div className="border-b-2 border-white/10 pb-4">
                            <p className="text-[10px] font-black uppercase text-brand-pink italic mb-2">Director's Vision Notes</p>
                            <p className="text-sm italic leading-relaxed text-gray-300 break-words">{selectedShow.directorNotes || 'Standard staging permitted.'}</p>
                         </div>
                         <div>
                            <p className="text-[10px] font-black uppercase text-brand-cyan italic mb-2">Original Staging Solutions</p>
                            <p className="text-sm italic leading-relaxed text-gray-300 break-words">{selectedShow.originalProductionSolutions || 'No exclusive technical hardware required.'}</p>
                         </div>
                         {selectedShow.scalabilityNotes && <div>
                            <p className="text-[10px] font-black uppercase text-brand-yellow italic mb-2">Scalability Notes</p>
                            <p className="text-sm italic leading-relaxed text-gray-300 break-words">{selectedShow.scalabilityNotes}</p>
                         </div>}
                      </div>
                    </div>
                  </section>

                  {/* 02. FULL PUNCH */}
                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink italic">02. FULL PUNCH</h4>

                    {(selectedShow as any).has_full_punch_package ? (
                      <div className="border-4 border-brand-pink/40 bg-brand-pink/5 p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="font-black uppercase italic text-brand-pink text-sm">🥊 Full Punch Available</p>
                          <span className="text-[8px] font-black uppercase bg-brand-pink text-white px-2 py-0.5">
                            {(selectedShow as any).full_punch_royalty_pct || '15'}% royalty
                          </span>
                        </div>
                        <p className="text-white/40 text-xs italic">Complete know-how package. Everything you need to produce this show.</p>

                        {/* Contents */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                          {[
                            { key: 'fpTheScript',           label: '📄 The Script',          always: true },
                            { key: 'fpThePlaybook',         label: '📋 The Playbook' },
                            { key: 'fpTheSoundtrack',       label: '🎵 The Soundtrack' },
                            { key: 'fpTheVisuals',          label: '🎬 The Visuals' },
                            { key: 'fpTheWardrobe',         label: '👗 The Wardrobe' },
                            { key: 'fpTheSetBlueprint',    label: '🏗️ The Set Blueprint' },
                            { key: 'fpTheTechRider',       label: '🔧 The Tech Rider' },
                            { key: 'fpThePromoKit',        label: '📸 The Promo Kit' },
                            { key: 'fpTheHandoverSession', label: '🤝 The Handover Session' },
                          ].map(({ key, label, always }) => {
                            const included = always || (selectedShow as any)[key];
                            return (
                              <div key={key} className={"flex items-center gap-2 " + (included ? '' : 'opacity-25')}>
                                <span className={"text-[10px] font-black " + (included ? 'text-brand-pink' : 'text-white/20')}>{included ? '✓' : '✗'}</span>
                                <span className={"text-[10px] font-bold uppercase italic " + (included ? 'text-white/80' : 'text-white/30')}>{label}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Badges */}
                        <div className="flex gap-2 flex-wrap border-t border-white/10 pt-3">
                          {(selectedShow as any).fpPunchLanguage && (
                            <span className="text-[8px] font-black uppercase bg-white/10 text-white/50 px-2 py-0.5">
                              Lang: {(selectedShow as any).fpPunchLanguage}
                            </span>
                          )}
                          {(selectedShow as any).fpPunchSupport && (
                            <span className="text-[8px] font-black uppercase bg-brand-cyan/20 text-brand-cyan px-2 py-0.5">
                              🤝 Punch Support Included
                            </span>
                          )}
                          {(selectedShow as any).full_punch_advance_fee > 0 && (
                            <span className="text-[8px] font-black uppercase bg-white/10 text-white/50 px-2 py-0.5">
                              + €{(selectedShow as any).full_punch_advance_fee} advance
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-white/10 p-4">
                        <p className="text-white/20 text-xs italic font-black uppercase">Full Punch not offered — Script only</p>
                      </div>
                    )}

                    {/* Production Assets Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border-l-4 border-brand-yellow pl-4 py-2 bg-white/5">
                        <p className="text-[8px] font-black uppercase text-brand-yellow italic">🎵 Music</p>
                        {(selectedShow as any).music_author ? (
                          <>
                            <p className="text-sm font-black italic">{(selectedShow as any).music_author}</p>
                            <p className="text-[8px] text-brand-yellow/60 italic mt-1">
                              {(selectedShow as any).has_original_music ? 'Original composition' : 'Licensed / existing music'}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm font-black italic text-white/30">Not specified</p>
                        )}
                      </div>
                      <div className="border-l-4 border-brand-cyan pl-4 py-2 bg-white/5">
                        <p className="text-[8px] font-black uppercase text-brand-cyan italic">📽 Video / AV</p>
                        {(selectedShow as any).has_video_projections ? (
                          <>
                            {(selectedShow as any).video_author && <p className="text-sm font-black italic">{(selectedShow as any).video_author}</p>}
                            {(selectedShow as any).video_description && <p className="text-[8px] text-brand-cyan/60 italic mt-1">{(selectedShow as any).video_description}</p>}
                            {!(selectedShow as any).video_author && <p className="text-sm font-black italic">Original video content available</p>}
                          </>
                        ) : (
                          <p className="text-sm font-black italic text-white/30">No video projections</p>
                        )}
                      </div>
                      <div className="border-l-4 border-brand-pink pl-4 py-2 bg-white/5">
                        <p className="text-[8px] font-black uppercase text-brand-pink italic">📄 Script in English</p>
                        {(selectedShow as any).script_in_english === 'true' || (selectedShow as any).scriptInEnglish === 'true' ? (
                          <p className="text-sm font-black italic">Full script available</p>
                        ) : (selectedShow as any).script_in_english === 'partial' ? (
                          <p className="text-sm font-black italic">Synopsis only</p>
                        ) : (
                          <p className="text-sm font-black italic text-white/30">Not specified</p>
                        )}
                      </div>
                      <div className="border-l-4 border-white/20 pl-4 py-2 bg-white/5">
                        <p className="text-[8px] font-black uppercase text-white/40 italic">🌍 Translations</p>
                        {(selectedShow as any).translations_available || selectedShow.translationsAvailable ? (
                          <p className="text-sm font-black italic">{(selectedShow as any).translations_available || selectedShow.translationsAvailable}</p>
                        ) : (
                          <p className="text-sm font-black italic text-white/30">Not specified</p>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* 03. TECHNICAL STACK */}
                  <section className="space-y-8">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-yellow italic">03. TECHNICAL STACK & PRODUCTION SCALE</h4>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                       <div className="bg-brand-surface border-4 border-white p-6 text-center shadow-neo-cyan">
                          <p className="text-[8px] font-black text-gray-500 uppercase italic">Lighting</p>
                          <p className="text-2xl font-black text-brand-cyan">{selectedShow.techStaffLighting}</p>
                       </div>
                       <div className="bg-brand-surface border-4 border-white p-6 text-center shadow-neo-magenta">
                          <p className="text-[8px] font-black text-gray-500 uppercase italic">Sound</p>
                          <p className="text-2xl font-black text-brand-pink">{selectedShow.techStaffSound}</p>
                       </div>
                       <div className="bg-brand-surface border-4 border-white p-6 text-center shadow-neo-yellow">
                          <p className="text-[8px] font-black text-gray-500 uppercase italic">Stagehands</p>
                          <p className="text-2xl font-black text-brand-yellow">{selectedShow.techStaffStagehands}</p>
                       </div>
                       <div className="bg-brand-surface border-4 border-white p-6 text-center">
                          <p className="text-[8px] font-black text-gray-500 uppercase italic">Prompter</p>
                          <p className="text-2xl font-black text-white">{selectedShow.techStaffPrompter}</p>
                       </div>
                       <div className="bg-brand-surface border-4 border-white p-6 text-center shadow-neo-cyan">
                          <p className="text-[8px] font-black text-gray-500 uppercase italic">Scale</p>
                          <p className="text-xl font-black uppercase italic text-brand-cyan">{selectedShow.productionScale}</p>
                       </div>
                       <div className="bg-brand-surface border-4 border-white p-6 text-center shadow-neo-magenta">
                          <p className="text-[8px] font-black text-gray-500 uppercase italic">Touring</p>
                          <p className="text-xl font-black uppercase italic text-brand-pink">{selectedShow.isTouringFriendly ? 'YES' : 'NO'}</p>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       {[
                         { label: 'Technical', value: selectedShow.technicalComplexity },
                         { label: 'Costumes', value: selectedShow.costumeComplexity },
                         { label: 'Set', value: selectedShow.setComplexity },
                         { label: 'Adaptation', value: selectedShow.adaptationFlexibility },
                       ].map((item, i) => (
                         <div key={i} className="bg-black/30 border border-white/10 p-4 text-center overflow-hidden">
                           <p className="text-[8px] font-black text-gray-500 uppercase italic mb-1">{item.label}</p>
                           <p className={`font-black uppercase text-[10px] leading-tight break-words ${item.value === 'High' ? 'text-brand-pink' : item.value === 'Low' ? 'text-brand-cyan' : 'text-white'}`}>{item.value}</p>
                         </div>
                       ))}
                    </div>
                    {selectedShow.techStaffOther && <p className="text-xs text-gray-400 italic">Additional: {selectedShow.techStaffOther}</p>}
                  </section>

                  {/* 03. MARKET PERFORMANCE */}
                  <section className="space-y-8">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white italic">04. MARKET PERFORMANCE</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="bg-brand-surface border-2 border-white/10 p-6 flex items-center justify-between">
                           <div><p className="text-[8px] font-black text-gray-500 uppercase italic">Premiere</p><p className="text-base font-black text-brand-yellow">{selectedShow.premiereDate || 'N/A'}</p></div>
                           <span className="material-symbols-outlined text-brand-yellow">calendar_today</span>
                        </div>
                        <div className="bg-brand-surface border-2 border-white/10 p-6 flex items-center justify-between">
                           <div><p className="text-[8px] font-black text-gray-500 uppercase italic">Performances</p><p className="text-base font-black text-brand-cyan">{selectedShow.performancesCount.toLocaleString()}</p></div>
                           <span className="material-symbols-outlined text-brand-cyan">theater_comedy</span>
                        </div>
                        <div className="bg-brand-surface border-2 border-white/10 p-6 flex items-center justify-between">
                           <div><p className="text-[8px] font-black text-gray-500 uppercase italic">Total Audience</p><p className="text-base font-black text-brand-pink">{(selectedShow.totalAudience || 0).toLocaleString()}</p></div>
                           <span className="material-symbols-outlined text-brand-pink">groups</span>
                        </div>
                        <div className="bg-brand-surface border-2 border-white/10 p-6 flex items-center justify-between">
                           <div><p className="text-[8px] font-black text-gray-500 uppercase italic">Box Office</p><p className="text-base font-black">{selectedShow.boxOfficeIndicator}</p></div>
                           <span className="material-symbols-outlined text-white/40">trending_up</span>
                        </div>




                    </div>
                    {selectedShow.awards && <div className="border-l-4 border-brand-yellow pl-4 py-2 bg-white/5">
                       <p className="text-[8px] font-black uppercase text-brand-yellow italic">Awards</p>
                       <p className="text-sm font-black italic break-words">{selectedShow.awards}</p>
                    </div>}
                    {selectedShow.audienceProfile && <div className="border-l-4 border-brand-cyan pl-4 py-2 bg-white/5">
                       <p className="text-[8px] font-black uppercase text-brand-cyan italic">Audience Profile</p>
                       <p className="text-sm italic text-gray-300 break-words">{selectedShow.audienceProfile}</p>
                    </div>}
                    {selectedShow.locationsPlayed && <div className="border-l-4 border-white/30 pl-4 py-2 bg-white/5">
                       <p className="text-[8px] font-black uppercase text-gray-500 italic">Locations Played</p>
                       <p className="text-sm italic text-gray-300 break-words">{selectedShow.locationsPlayed}</p>
                    </div>}
                  </section>

                  {/* 04. RIGHTS */}
                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink italic">05. RIGHTS & LICENSING</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="bg-brand-surface border-4 border-white p-4">
                        <p className="text-[8px] font-black text-brand-pink uppercase italic mb-1">License Type</p>
                        <p className="text-sm font-black uppercase italic">{selectedShow.licenseType}</p>
                      </div>
                      <div className="bg-brand-surface border-4 border-white p-4">
                        <p className="text-[8px] font-black text-brand-pink uppercase italic mb-1">Exclusivity</p>
                        <p className="text-sm font-black uppercase italic">{selectedShow.exclusivityLevel}</p>
                      </div>
                      {selectedShow.territoriesAvailable && (
                        <div className="bg-brand-surface border-2 border-white/20 p-4">
                          <p className="text-[8px] font-black text-gray-500 uppercase italic mb-1">Territories</p>
                          <p className="text-sm font-black uppercase">{selectedShow.territoriesAvailable}</p>
                        </div>
                      )}
                      {(selectedShow as any).translations_available && (
                        <div className="bg-brand-surface border-2 border-white/20 p-4">
                          <p className="text-[8px] font-black text-gray-500 uppercase italic mb-1">Translations</p>
                          <p className="text-sm font-black uppercase">{(selectedShow as any).translations_available}</p>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* SCRIPT SCENARIO */}
                  {selectedShow.scriptScenario && (
                    <section className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-yellow italic">Script Scenario — 3 Pages in English</h4>
                      <div className="bg-black border-4 border-brand-yellow p-4 md:p-8 overflow-hidden">
                        <pre className="text-white font-mono text-xs md:text-sm leading-relaxed whitespace-pre-wrap break-words overflow-x-hidden">{selectedShow.scriptScenario}</pre>
                      </div>
                    </section>
                  )}

                  {/* SIMILAR SHOWS */}
                  {(() => {
                    const similar = shows
                      .filter(s => s.id !== selectedShow.id && s.is_produced && (s.genre === selectedShow.genre || s.location === selectedShow.location))
                      .slice(0, 3);
                    if (similar.length === 0) return null;
                    return (
                      <section className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 italic">Similar Shows</h4>
                        <div className="grid grid-cols-3 gap-3">
                          {similar.map(s => (
                            <div
                              key={s.id}
                              onClick={() => { setSelectedShowId(s.id); onUpdateStats(s.id, 'view'); }}
                              className="group cursor-pointer border-2 border-white/20 hover:border-brand-yellow transition-all overflow-hidden"
                            >
                              <div className="aspect-[2/3] relative overflow-hidden">
                                <img src={s.imageUrl} alt={s.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 p-2 w-full">
                                  <p className="text-[8px] font-black uppercase text-brand-cyan italic">{s.genre}</p>
                                  <p className="text-xs font-black uppercase italic text-white leading-tight line-clamp-2">{s.title}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    );
                  })()}

                  {/* CTA SECTION — PACKAGE SELECTOR */}
                  <div className="bg-brand-surface border-8 border-brand-cyan p-6 md:p-10 space-y-6 shadow-neo-magenta">
                    <div className="text-center">
                      <h4 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter">Select Package &amp; Tickle</h4>
                      <p className="text-white/30 text-xs italic mt-1">Choose your licensing package. Royalty is calculated per performance.</p>
                    </div>

                    {/* PACKAGES */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* SCRIPT */}
                      {(selectedShow as any).has_script_package !== false && (
                        <div className={"border-4 p-5 cursor-pointer transition-all space-y-3 " + (selectedPackage === 'script' ? 'border-brand-yellow bg-brand-yellow/10' : 'border-white/20 hover:border-brand-yellow/60')}
                          onClick={() => setSelectedPackage('script')}>
                          <div className="flex items-center justify-between">
                            <p className="font-black uppercase italic text-white text-lg">🎭 SCRIPT</p>
                            {selectedPackage === 'script' && <span className="text-[8px] font-black uppercase bg-brand-yellow text-black px-2 py-0.5">✓ SELECTED</span>}
                          </div>
                          <p className="text-white/40 text-xs italic">Script only — your production, your vision.</p>
                          <div className="border-t border-white/10 pt-3 space-y-1">
                            <p className="text-brand-yellow font-black text-2xl">
                              {(selectedShow as any).script_royalty_pct || '10'}%
                              <span className="text-white/30 text-xs font-bold ml-1">of gross box office</span>
                            </p>
                            {(selectedShow as any).script_advance_fee > 0 && (
                              <p className="text-white/40 text-xs">+ €{(selectedShow as any).script_advance_fee} advance</p>
                            )}
                          </div>
                          {selectedPackage === 'script' && (
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setInquiryShowId(selectedShowId);
                                setSelectedShowId(null);
                                setInquiryName(user?.name || '');
                                setInquiryEmail(user?.email || '');
                                setInquiryMessage('');
                                setInquirySuccess(false);
                                setIsInquiryOpen(true);
                              }}
                              className="w-full bg-brand-yellow text-black py-3 font-black uppercase italic text-sm border-2 border-black hover:bg-white transition-all">
                              Tickle It — Script →
                            </button>
                          )}
                        </div>
                      )}

                      {/* FULL PUNCH */}
                      {(selectedShow as any).has_full_punch_package && (
                        <div className={"border-4 p-5 cursor-pointer transition-all space-y-3 " + (selectedPackage === 'full_punch' ? 'border-brand-pink bg-brand-pink/10' : 'border-white/20 hover:border-brand-pink/60')}
                          onClick={() => setSelectedPackage('full_punch')}>
                          <div className="flex items-center justify-between">
                            <p className="font-black uppercase italic text-white text-lg">🥊 FULL PUNCH</p>
                            {selectedPackage === 'full_punch' && <span className="text-[8px] font-black uppercase bg-brand-pink text-white px-2 py-0.5">✓ SELECTED</span>}
                          </div>
                          <p className="text-white/40 text-xs italic">Complete know-how package. Everything you need to produce this show.</p>

                          {/* What's included */}
                          <div className="grid grid-cols-2 gap-1">
                            {[
                              { key: 'fpTheScript',           label: '📄 The Script',          always: true },
                              { key: 'fpThePlaybook',         label: '📋 The Playbook' },
                              { key: 'fpTheSoundtrack',       label: '🎵 The Soundtrack' },
                              { key: 'fpTheVisuals',          label: '🎬 The Visuals' },
                              { key: 'fpTheWardrobe',         label: '👗 The Wardrobe' },
                              { key: 'fpTheSetBlueprint',    label: '🏗️ The Set Blueprint' },
                              { key: 'fpTheTechRider',       label: '🔧 The Tech Rider' },
                              { key: 'fpThePromoKit',        label: '📸 The Promo Kit' },
                              { key: 'fpTheHandoverSession', label: '🤝 The Handover Session' },
                            ].filter(({ key, always }) => always || (selectedShow as any)[key]).map(({ label }) => (
                              <div key={label} className="flex items-center gap-1.5">
                                <span className="text-brand-pink text-[10px]">✓</span>
                                <span className="text-white/70 text-[10px] font-bold uppercase italic">{label}</span>
                              </div>
                            ))}
                          </div>

                          {/* Language + Support badges */}
                          <div className="flex gap-2 flex-wrap">
                            {(selectedShow as any).fpPunchLanguage && (
                              <span className="text-[8px] font-black uppercase bg-white/10 text-white/50 px-2 py-0.5">
                                Lang: {(selectedShow as any).fpPunchLanguage}
                              </span>
                            )}
                            {(selectedShow as any).fpPunchSupport && (
                              <span className="text-[8px] font-black uppercase bg-brand-cyan/20 text-brand-cyan px-2 py-0.5">
                                🤝 Punch Support Included
                              </span>
                            )}
                          </div>

                          <div className="border-t border-white/10 pt-3 space-y-1">
                            <p className="text-brand-pink font-black text-2xl">
                              {(selectedShow as any).full_punch_royalty_pct || '15'}%
                              <span className="text-white/30 text-xs font-bold ml-1">of gross box office</span>
                            </p>
                            {(selectedShow as any).full_punch_advance_fee > 0 && (
                              <p className="text-white/40 text-xs">+ €{(selectedShow as any).full_punch_advance_fee} advance</p>
                            )}
                            <p className="text-[8px] text-white/20 italic">All royalties included in one rate</p>
                          </div>
                          {selectedPackage === 'full_punch' && (
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setInquiryShowId(selectedShowId);
                                setSelectedShowId(null);
                                setInquiryName(user?.name || '');
                                setInquiryEmail(user?.email || '');
                                setInquiryMessage('');
                                setInquirySuccess(false);
                                setIsInquiryOpen(true);
                              }}
                              className="w-full bg-brand-pink text-white py-3 font-black uppercase italic text-sm border-2 border-black hover:bg-white hover:text-black transition-all">
                              Tickle It — Full Punch →
                            </button>
                          )}
                        </div>
                      )}

                      {/* Fallback if no packages set */}
                      {(selectedShow as any).has_script_package === false && !(selectedShow as any).has_full_punch_package && (
                        <div className="md:col-span-2">
                          <button
                            onClick={() => {
                              setInquiryShowId(selectedShowId);
                              setSelectedShowId(null);
                              setInquiryName(user?.name || '');
                              setInquiryEmail(user?.email || '');
                              setInquiryMessage('');
                              setInquirySuccess(false);
                              setIsInquiryOpen(true);
                            }}
                            className="w-full bg-brand-yellow text-black py-5 font-black uppercase italic text-xl border-4 border-black hover:bg-white transition-all">
                            Tickle It →
                          </button>
                        </div>
                      )}
                    </div>

                    {/* DOSSIER BUTTON */}
                    <div className="border-t border-white/10 pt-4 flex justify-center">
                      {user?.isPaid || user?.isAdmin ? (
                        <button onClick={() => downloadDossier(selectedShow)}
                          className="bg-transparent text-white px-8 py-3 font-black uppercase border-4 border-white hover:border-brand-cyan hover:text-brand-cyan transition-all italic text-sm flex items-center gap-3">
                          <span className="material-symbols-outlined text-xl">download</span>
                          The Dossier
                        </button>
                      ) : (
                        <button onClick={() => onNavigate('pricing')}
                          className="bg-transparent text-white/30 px-8 py-3 font-black uppercase border-4 border-white/20 hover:border-brand-yellow hover:text-brand-yellow transition-all italic text-sm flex items-center gap-3">
                          <span className="material-symbols-outlined text-xl">lock</span>
                          Dossier — LAFF+
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderInquiryModal = () => {
    if (!isInquiryOpen) return null;

    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 md:p-6">
        <div className="absolute inset-0 bg-brand-black/95 backdrop-blur-md" onClick={() => setIsInquiryOpen(false)}></div>
        <div className="relative bg-brand-surface border-8 border-white w-full max-w-2xl p-5 md:p-12 max-h-[90vh] overflow-y-auto overflow-x-hidden shadow-neo-cyan animate-in fade-in zoom-in-95 duration-500 ease-out">
          <button onClick={() => setIsInquiryOpen(false)} className="absolute top-6 right-6 text-white hover:text-brand-pink transition-all">
            <span className="material-symbols-outlined text-4xl font-black">close</span>
          </button>

          {inquirySuccess ? (
            <div className="text-center py-20 space-y-8 animate-in zoom-in">
              <div className="w-24 h-24 bg-brand-cyan border-4 border-black mx-auto flex items-center justify-center rotate-3 shadow-neo-magenta">
                <span className="material-symbols-outlined text-black text-6xl font-black">send</span>
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-black uppercase italic text-white">You Tickled<br/>the Laff! 🎭</h2>
                <p className="text-brand-cyan font-bold uppercase tracking-[0.2em] text-sm italic">The producer has been notified of your interest.</p>
                <div className="border-4 border-white/10 p-6 text-left space-y-3 mt-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-brand-yellow italic">What happens next?</p>
                  <div className="space-y-2">
                    <p className="text-white/60 text-sm flex items-start gap-3"><span className="text-brand-cyan font-black">01</span> The rights holder receives your inquiry by email immediately.</p>
                    <p className="text-white/60 text-sm flex items-start gap-3"><span className="text-brand-cyan font-black">02</span> Expect a reply within 2–5 business days.</p>
                    <p className="text-white/60 text-sm flex items-start gap-3"><span className="text-brand-cyan font-black">03</span> If interested, they will send you a licensing proposal directly.</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsInquiryOpen(false);
                  setInquirySuccess(false);
                }}
                className="bg-brand-yellow text-black px-10 py-4 font-black uppercase text-sm border-4 border-black shadow-neo-magenta italic"
              >
                Back to Catalog
              </button>
            </div>
          ) : (
            <div className="space-y-8 text-white">
              <div className="space-y-2">
                <h3 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter leading-tight">Initiate Rights<br className="md:hidden"/> Inquiry</h3>
                <p className="text-brand-cyan text-xs font-black uppercase tracking-widest italic truncate">Asset: {inquiryShow?.title}</p>
              </div>

              {/* PACKAGE SELECTOR */}
              <div className="space-y-3">
                <p className="text-[9px] font-black uppercase italic text-brand-yellow tracking-widest">Select Package</p>
                <p className="text-white/30 text-xs italic">Choose what you want to license. The rights holder will confirm availability and exact pricing.</p>
                <div className="space-y-3">
                  {(inquiryShow as any)?.has_script_package !== false && (
                    <button onClick={() => setSelectedPackage('script')}
                      className={"w-full text-left border-4 p-4 transition-all " + (selectedPackage === 'script' ? 'border-brand-yellow bg-brand-yellow/10' : 'border-white/20 hover:border-white/40')}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-black uppercase italic text-white text-sm">🎭 SCRIPT</p>
                          <p className="text-white/40 text-xs italic mt-1">Script only — you produce independently with your own creative team.</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {(inquiryShow as any)?.script_royalty_pct && (
                            <p className="text-brand-yellow font-black text-sm">{(inquiryShow as any).script_royalty_pct}% royalty</p>
                          )}
                          {(inquiryShow as any)?.script_advance_fee && (
                            <p className="text-white/40 text-xs">+ €{(inquiryShow as any).script_advance_fee} advance</p>
                          )}
                        </div>
                      </div>
                      {selectedPackage === 'script' && (
                        <div className="mt-3 border-t border-brand-yellow/30 pt-3">
                          <p className="text-[8px] font-black uppercase italic text-brand-yellow tracking-widest">✓ Selected</p>
                        </div>
                      )}
                    </button>
                  )}
                  {(inquiryShow as any)?.has_full_punch_package && (
                    <button onClick={() => setSelectedPackage('full_punch')}
                      className={"w-full text-left border-4 p-4 transition-all " + (selectedPackage === 'full_punch' ? 'border-brand-pink bg-brand-pink/10' : 'border-white/20 hover:border-white/40')}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-black uppercase italic text-white text-sm">🥊 FULL PUNCH</p>
                          <p className="text-white/40 text-xs italic mt-1">Complete know-how package. Everything you need to produce this show.</p>
                          {/* Contents grid */}
                          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-2">
                            {[
                              { key: 'fpTheScript',           label: '📄 The Script',          always: true },
                              { key: 'fpThePlaybook',         label: '📋 The Playbook' },
                              { key: 'fpTheSoundtrack',       label: '🎵 The Soundtrack' },
                              { key: 'fpTheVisuals',          label: '🎬 The Visuals' },
                              { key: 'fpTheWardrobe',         label: '👗 The Wardrobe' },
                              { key: 'fpTheSetBlueprint',    label: '🏗️ The Set Blueprint' },
                              { key: 'fpTheTechRider',       label: '🔧 The Tech Rider' },
                              { key: 'fpThePromoKit',        label: '📸 The Promo Kit' },
                              { key: 'fpTheHandoverSession', label: '🤝 The Handover Session' },
                            ].filter(({ key, always }) => always || (inquiryShow as any)?.[key]).map(({ label }) => (
                              <div key={label} className="flex items-center gap-1">
                                <span className="text-brand-pink text-[9px]">✓</span>
                                <span className="text-white/60 text-[9px] font-bold uppercase italic">{label}</span>
                              </div>
                            ))}
                          </div>
                          {(inquiryShow as any)?.fpPunchSupport && (
                            <p className="text-brand-cyan text-[9px] font-black uppercase italic mt-1.5">🤝 Punch Support Included</p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          {(inquiryShow as any)?.full_punch_royalty_pct && (
                            <p className="text-brand-pink font-black text-sm">{(inquiryShow as any).full_punch_royalty_pct}% royalty</p>
                          )}
                          {(inquiryShow as any)?.full_punch_advance_fee && (
                            <p className="text-white/40 text-xs">+ €{(inquiryShow as any).full_punch_advance_fee} advance</p>
                          )}
                          <p className="text-[8px] text-white/20 italic mt-1">All royalties included</p>
                        </div>
                      </div>
                      {selectedPackage === 'full_punch' && (
                        <div className="mt-3 border-t border-brand-pink/30 pt-3">
                          <p className="text-[8px] font-black uppercase italic text-brand-pink tracking-widest">✓ Selected</p>
                        </div>
                      )}
                    </button>
                  )}
                  {!selectedPackage && (
                    <p className="text-brand-pink text-[9px] font-black uppercase italic">Please select a package to continue.</p>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 italic">Full Name</label>
                    <input type="text" value={inquiryName} onChange={e => setInquiryName(e.target.value)} className="w-full bg-brand-black border-2 border-white/20 p-3 text-white font-bold uppercase outline-none focus:border-brand-cyan" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 italic">Email Address</label>
                    <input type="email" value={inquiryEmail} onChange={e => setInquiryEmail(e.target.value)} className="w-full bg-brand-black border-2 border-white/20 p-3 text-white font-bold outline-none focus:border-brand-cyan" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 italic">Message / Production Pitch</label>
                  <textarea rows={5} value={inquiryMessage} onChange={e => setInquiryMessage(e.target.value)} placeholder="Tell the rights holder about your planned production, venue, and dates..." className="w-full bg-brand-black border-2 border-white/20 p-6 text-white italic outline-none focus:border-brand-pink"></textarea>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 italic">Attachment <span className="text-white/20 normal-case font-normal">(optional — PDF, max 5MB)</span></label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={e => setInquiryFile(e.target.files?.[0] || null)}
                      className="w-full bg-brand-black border-2 border-white/20 p-3 text-white/60 text-sm font-bold outline-none focus:border-brand-cyan file:bg-brand-yellow file:text-black file:font-black file:uppercase file:text-[9px] file:px-3 file:py-1 file:border-0 file:mr-3 cursor-pointer"
                    />
                    {inquiryFile && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="bg-brand-cyan text-black text-[8px] font-black uppercase px-2 py-1">✓ ATTACHED</span>
                        <span className="text-white/40 text-xs">{inquiryFile.name}</span>
                        <button onClick={() => setInquiryFile(null)} className="text-white/20 hover:text-brand-pink text-xs">✕</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* GIGL rate limit opozorilo */}
              {user && user.plan === 'gigl' && inquiryRateLimit !== null && inquiryRateLimit >= 5 && (
                <div className="bg-brand-yellow text-black p-4 border-4 border-black font-black uppercase text-sm italic mb-2">
                  ⚡ GIGL plan: 5 inquiries per month used. Upgrade to LAFF for unlimited.
                  <button onClick={() => onNavigate('pricing')} className="ml-2 underline">Upgrade →</button>
                </div>
              )}

              <button
                disabled={!!(user && user.plan === 'gigl' && inquiryRateLimit !== null && inquiryRateLimit >= 5) || inquirySending}
                onClick={async () => {
                  // Rate limit check za GIGL — max 5 inquiries na mesec
                  if (user && user.plan === 'gigl') {
                    const now = new Date();
                    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                    const { count } = await supabase
                      .from('inquiries')
                      .select('*', { count: 'exact', head: true })
                      .eq('producer_id', user.id)
                      .gte('created_at', firstOfMonth);
                    const monthCount = count || 0;
                    setInquiryRateLimit(monthCount);
                    if (monthCount >= 5) return;
                  }

                  setInquirySending(true);
                  let attachmentUrl = '';

                  // Upload attachment če obstaja
                  if (inquiryFile) {
                    try {
                      const ext = inquiryFile.name.split('.').pop();
                      const path = `inquiries/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
                      const { data: uploadData } = await supabase.storage
                        .from('inquiry-attachments')
                        .upload(path, inquiryFile, { contentType: inquiryFile.type });
                      if (uploadData) {
                        const { data: urlData } = supabase.storage
                          .from('inquiry-attachments')
                          .getPublicUrl(uploadData.path);
                        attachmentUrl = urlData?.publicUrl || '';
                      }
                    } catch(e) { console.error('Attachment upload error:', e); }
                  }

                  try {
                    await fetch('https://jnilgukmyfukazwduuig.supabase.co/functions/v1/send-inquiry', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuaWxndWtteWZ1a2F6d2R1dWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MTQ2MDksImV4cCI6MjA5MTE5MDYwOX0.KbwZf30tJMdEb_3Zie3UoGA-zJO4Z7zIf9sKYOggSyU',
                      },
                      body: JSON.stringify({
                        to: inquiryShow?.producerEmail || 'info@hahahub.art',
                        replyTo: inquiryEmail,
                        showTitle: inquiryShow?.title,
                        showId: inquiryShow?.id,
                        producerId: inquiryShow?.userId || inquiryShow?.user_id,
                        fromName: inquiryName,
                        fromEmail: inquiryEmail,
                        message: inquiryMessage,
                        packageType: selectedPackage,
                      }),
                    });
                  } catch {}
                  
                  // Save sent inquiry to Supabase
                  try {
                    const { error: inquiryErr } = await supabase.from('inquiries').insert({
                      show_id: inquiryShow?.id,
                      producer_id: inquiryShow?.user_id,
                      from_name: inquiryName,
                      from_email: inquiryEmail,
                      message: inquiryMessage,
                      show_title: inquiryShow?.title,
                      recipient_id: user?.id,
                      type: 'sent',
                      is_read: false,
                      status: 'sent',
                      attachment_url: attachmentUrl || null,
                      package_type: selectedPackage,
                    });
                    if (inquiryErr) console.error('Inquiry save error:', inquiryErr);
                    // Posodobimo lokalni rate limit counter
                    if (user?.plan === 'gigl') setInquiryRateLimit(prev => (prev || 0) + 1);
                  } catch(e) { console.error('Inquiry save error:', e); }

                  // Confirmation email pošiljatelju
                  try {
                    await fetch('/api/send-email', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        type: 'inquiry_confirmation',
                        to: inquiryEmail || user?.email,
                        data: {
                          buyerName: inquiryName || user?.name,
                          showTitle: inquiryShow?.title,
                          producerName: inquiryShow?.producerName || 'Rights Holder',
                          message: inquiryMessage,
                          hasAttachment: !!attachmentUrl,
                        }
                      })
                    });
                  } catch(e) { console.error('Confirmation email error:', e); }

                  setInquiryFile(null);
                  setInquirySending(false);
                  setInquirySuccess(true);
                  onUpdateStats(inquiryShowId || '', 'inquiry');
                }}
                className="w-full bg-brand-pink text-white font-black uppercase py-6 border-4 border-black shadow-neo-yellow hover:bg-black transition-all italic tracking-[0.2em] text-xl disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {inquirySending ? 'SENDING...' : 'Send Inquiry 🥊'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };


  const downloadDossier = async (show: Show | null) => {
    if (!show) return;

    // Dynamically import to avoid SSR issues
    const jsPDF = (await import('jspdf')).default;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210; const H = 297;
    const margin = 14;
    const col = W - margin * 2;
    let y = 0;

    const addPage = () => { doc.addPage(); y = 0; };
    const checkY = (needed: number) => { if (y + needed > H - 20) addPage(); };

    // Helpers
    const black = () => doc.setTextColor(5, 5, 5);
    const white = () => doc.setTextColor(255, 255, 255);
    const yellow = () => doc.setTextColor(255, 222, 3);
    const pink = () => doc.setTextColor(255, 2, 102);
    const cyan = () => doc.setTextColor(3, 218, 198);
    const gray = () => doc.setTextColor(150, 150, 150);

    const fillBlack = () => doc.setFillColor(5, 5, 5);
    const fillSurface = () => doc.setFillColor(18, 18, 18);
    const fillYellow = () => doc.setFillColor(255, 222, 3);
    const fillPink = () => doc.setFillColor(255, 2, 102);
    const fillCyan = () => doc.setFillColor(3, 218, 198);

    const label = (text: string, x: number, yy: number, color: () => void = gray) => {
      color(); doc.setFontSize(6); doc.setFont('helvetica', 'bold');
      doc.text(text.toUpperCase(), x, yy);
    };
    const value = (text: string, x: number, yy: number, size = 10, color: () => void = black) => {
      color(); doc.setFontSize(size); doc.setFont('helvetica', 'bold');
      doc.text(String(text || '—'), x, yy);
    };
    const sectionTitle = (text: string, num: string) => {
      checkY(16);
      fillYellow(); doc.rect(margin, y, 2, 8, 'F');
      black(); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
      doc.text(num, margin + 5, y + 5.5);
      doc.setFontSize(13); doc.setFont('helvetica', 'bold');
      doc.text(text.toUpperCase(), margin + 16, y + 5.5);
      y += 12;
    };
    const statBox = (lbl: string, val: string, x: number, yy: number, w: number, h = 14) => {
      fillSurface(); doc.rect(x, yy, w, h, 'F');
      label(lbl, x + 3, yy + 5);
      value(val, x + 3, yy + 11, 9);
    };
    const divider = () => {
      doc.setDrawColor(40, 40, 40); doc.setLineWidth(0.3);
      doc.line(margin, y, W - margin, y); y += 6;
    };

    // ─── COVER ───────────────────────────────────────────────────────────────
    fillBlack(); doc.rect(0, 0, W, H, 'F');

    // Poster placeholder top-right (A4 ratio strip)
    if (show.imageUrl) {
      try {
        doc.addImage(show.imageUrl, 'JPEG', W - 70, 0, 70, 99);
      } catch {}
    }

    // Cover content
    y = H - 100;
    cyan(); doc.setFontSize(7); doc.setFont('helvetica', 'bold');
    doc.text(`PRODUCTION DOSSIER V${show.productionYear} · HAHAHUB · THE COMEDY RIGHTS MARKETPLACE`, margin, y);
    y += 10;

    // Big title
    yellow(); doc.setFontSize(show.title.length > 12 ? 28 : 36); doc.setFont('helvetica', 'bold');
    doc.text(show.title.toUpperCase(), margin, y);
    y += (show.title.length > 12 ? 12 : 16);

    if ((show as any).englishTitle && (show as any).englishTitle !== show.title) {
      white(); doc.setFontSize(12); doc.setFont('helvetica', 'normal');
      doc.text((show as any).englishTitle.toUpperCase(), margin, y);
      y += 8;
    }

    white(); doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.text(`${show.author} · ${(show as any).original_language || show.language || ''} · ${show.genre}${show.subgenre ? ' · ' + show.subgenre : ''}`, margin, y);
    y += 6;
    gray(); doc.setFontSize(8);
    doc.text(`${show.duration} min · ${(show.maleRoles || 0) + (show.femaleRoles || 0)} actors · ${show.productionScale} production`, margin, y);
    y += 12;

    // Packages on cover
    if ((show as any).has_script_package !== false) {
      fillYellow(); doc.rect(margin, y, 28, 8, 'F');
      black(); doc.setFontSize(7); doc.setFont('helvetica', 'bold');
      doc.text(`SCRIPT ${(show as any).scriptRoyaltyPct || ''}%`, margin + 2, y + 5.5);
    }
    if ((show as any).hasFullPunchPackage || (show as any).has_full_punch_package) {
      fillPink(); doc.rect(margin + 32, y, 40, 8, 'F');
      white(); doc.setFontSize(7); doc.setFont('helvetica', 'bold');
      doc.text(`FULL PUNCH ${(show as any).fullPunchRoyaltyPct || (show as any).full_punch_royalty_pct || ''}%`, margin + 34, y + 5.5);
    }

    // Footer strip
    fillYellow(); doc.rect(0, H - 10, W, 10, 'F');
    black(); doc.setFontSize(7); doc.setFont('helvetica', 'bold');
    doc.text('HAHAHUB · THE COMEDY RIGHTS MARKETPLACE · HAHAHUB.ART', margin, H - 4);
    doc.text('TICKLE. SET UP. PUNCH.', W - margin - 38, H - 4);

    // ─── PAGE 2 ───────────────────────────────────────────────────────────────
    addPage();
    fillBlack(); doc.rect(0, 0, W, H, 'F');
    y = margin;

    // Synopsis
    sectionTitle('Synopsis', '00');
    const synText = (show as any).synopsis_en || show.synopsis || 'No synopsis provided.';
    white(); doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    const synLines = doc.splitTextToSize(synText, col);
    synLines.forEach((line: string) => { checkY(6); doc.text(line, margin, y); y += 5; });
    y += 6; divider();

    // Rights & Identity
    sectionTitle('Rights & Identity', '01');
    const col2 = (col - 4) / 2;
    statBox('Copyright Holder', show.rightsHolder || show.producerName, margin, y, col2);
    statBox('Rights Status', show.rightsStatus, margin + col2 + 4, y, col2);
    y += 18;
    statBox('License Type', show.licenseType, margin, y, col2);
    statBox('Exclusivity', show.exclusivityLevel, margin + col2 + 4, y, col2);
    y += 18;
    statBox('Territories Available', (show as any).territoriesAvailable || 'Global', margin, y, col);
    y += 18;
    if ((show as any).licensedCountries) {
      statBox('Licensed Countries', (show as any).licensedCountries, margin, y, col);
      y += 18;
    }
    y += 4; divider();

    // Production
    sectionTitle('Production', '02');
    const col3 = (col - 8) / 3;
    statBox('Duration', `${show.duration} min`, margin, y, col3);
    statBox('Male Roles', String(show.maleRoles), margin + col3 + 4, y, col3);
    statBox('Female Roles', String(show.femaleRoles), margin + (col3 + 4) * 2, y, col3);
    y += 18;
    statBox('Production Scale', show.productionScale, margin, y, col3);
    statBox('Stage Type', (show as any).stageType || '—', margin + col3 + 4, y, col3);
    statBox('Touring Friendly', show.isTouringFriendly ? 'YES' : 'NO', margin + (col3 + 4) * 2, y, col3);
    y += 18;
    statBox('Tech Complexity', show.technicalComplexity, margin, y, col3);
    statBox('Lighting Staff', String(show.techStaffLighting), margin + col3 + 4, y, col3);
    statBox('Sound Staff', String(show.techStaffSound), margin + (col3 + 4) * 2, y, col3);
    y += 18;
    if (show.directorNotes) {
      checkY(20);
      fillSurface(); doc.rect(margin, y, col, 16, 'F');
      fillCyan(); doc.rect(margin, y, 2, 16, 'F');
      label("Director's Vision Notes", margin + 5, y + 5, cyan);
      white(); doc.setFontSize(8); doc.setFont('helvetica', 'normal');
      const dnLines = doc.splitTextToSize(show.directorNotes, col - 10);
      dnLines.slice(0, 2).forEach((line: string, i: number) => doc.text(line, margin + 5, y + 10 + i * 4));
      y += 20;
    }
    y += 4; divider();

    // Market Performance
    sectionTitle('Market Performance', '03');
    statBox('Premiere Date', show.premiereDate || '—', margin, y, col3);
    statBox('Premiere Location', show.premiereLocation || '—', margin + col3 + 4, y, col3);
    statBox('Box Office', show.boxOfficeIndicator, margin + (col3 + 4) * 2, y, col3);
    y += 18;
    statBox('Total Performances', String(show.performancesCount || 0), margin, y, col3);
    statBox('Total Audience', String(show.totalAudience || 0), margin + col3 + 4, y, col3);
    statBox('Production Year', String(show.productionYear), margin + (col3 + 4) * 2, y, col3);
    y += 18;
    if ((show as any).locationsPlayed) {
      statBox('Locations Played', (show as any).locationsPlayed, margin, y, col);
      y += 18;
    }
    if (show.awards) {
      checkY(16); statBox('Awards', show.awards, margin, y, col); y += 18;
    }
    y += 4; divider();

    // ─── PAGE 3 — FULL PUNCH ─────────────────────────────────────────────────
    addPage();
    fillBlack(); doc.rect(0, 0, W, H, 'F');
    y = margin;

    sectionTitle('Full Punch Package', '04');

    const hasFP = (show as any).hasFullPunchPackage || (show as any).has_full_punch_package;
    if (hasFP) {
      // FP header box
      fillPink(); doc.rect(margin, y, col, 16, 'F');
      black(); doc.setFontSize(11); doc.setFont('helvetica', 'bold');
      doc.text('🥊 FULL PUNCH AVAILABLE', margin + 4, y + 7);
      doc.setFontSize(9);
      const fpPct = (show as any).fullPunchRoyaltyPct || (show as any).full_punch_royalty_pct || '';
      doc.text(`${fpPct}% royalty of gross box office`, margin + 4, y + 13);
      y += 20;

      // Contents checklist
      white(); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
      doc.text('WHAT\'S IN THE PACKAGE:', margin, y); y += 7;

      const fpItems = [
        { key: 'fpTheScript',          db: 'fp_the_script',           label: 'The Script',           always: true },
        { key: 'fpThePlaybook',        db: 'fp_the_playbook',         label: 'The Playbook' },
        { key: 'fpTheSoundtrack',      db: 'fp_the_soundtrack',       label: 'The Soundtrack' },
        { key: 'fpTheVisuals',         db: 'fp_the_visuals',          label: 'The Visuals' },
        { key: 'fpTheWardrobe',        db: 'fp_the_wardrobe',         label: 'The Wardrobe' },
        { key: 'fpTheSetBlueprint',    db: 'fp_the_set_blueprint',    label: 'The Set Blueprint' },
        { key: 'fpTheTechRider',       db: 'fp_the_tech_rider',       label: 'The Tech Rider' },
        { key: 'fpThePromoKit',        db: 'fp_the_promo_kit',        label: 'The Promo Kit' },
        { key: 'fpTheHandoverSession', db: 'fp_the_handover_session', label: 'The Handover Session' },
      ];

      // 2 columns
      const half = Math.ceil(fpItems.length / 2);
      fpItems.forEach((item, i) => {
        const included = item.always || (show as any)[item.key] || (show as any)[item.db];
        const col2x = i < half ? margin : margin + col / 2 + 4;
        const iy = y + (i < half ? i : i - half) * 8;
        if (included) { fillCyan(); } else { doc.setFillColor(40, 40, 40); }
        doc.rect(col2x, iy, 4, 4, 'F');
        if (included) { cyan(); } else { doc.setTextColor(60, 60, 60); }
        doc.setFontSize(8); doc.setFont('helvetica', 'bold');
        doc.text(item.label.toUpperCase(), col2x + 7, iy + 3.5);
      });
      y += half * 8 + 8;

      // Language + Support
      const fpLang = (show as any).fpPunchLanguage || (show as any).fp_punch_language || 'EN';
      const fpSupport = (show as any).fpPunchSupport || (show as any).fp_punch_support;
      statBox('Punch Language', fpLang, margin, y, col3);
      statBox('Punch Support', fpSupport ? 'YES — Team Available' : 'No', margin + col3 + 4, y, col3 * 2 + 4);
      y += 18;

      if ((show as any).full_punch_advance_fee > 0) {
        statBox('Advance Fee', `€${(show as any).full_punch_advance_fee}`, margin, y, col);
        y += 18;
      }
    } else {
      fillSurface(); doc.rect(margin, y, col, 12, 'F');
      gray(); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
      doc.text('Full Punch not offered — Script only license available', margin + 4, y + 8);
      y += 16;
    }

    y += 4; divider();

    // Script Package
    sectionTitle('Script Package', '05');
    if ((show as any).has_script_package !== false) {
      fillYellow(); doc.rect(margin, y, col, 16, 'F');
      black(); doc.setFontSize(11); doc.setFont('helvetica', 'bold');
      doc.text('📄 SCRIPT LICENSE AVAILABLE', margin + 4, y + 7);
      const sPct = (show as any).scriptRoyaltyPct || (show as any).script_royalty_pct || '';
      doc.setFontSize(9);
      doc.text(`${sPct}% royalty of gross box office · Script only — your production, your vision`, margin + 4, y + 13);
      y += 20;
      if ((show as any).scriptAdvanceFee > 0 || (show as any).script_advance_fee > 0) {
        statBox('Advance Fee', `€${(show as any).scriptAdvanceFee || (show as any).script_advance_fee}`, margin, y, col);
        y += 18;
      }
    }

    y += 4; divider();

    // Creative Assets
    sectionTitle('Creative Assets', '06');
    if ((show as any).music_author || (show as any).musicAuthor) {
      statBox('Music Author', (show as any).music_author || (show as any).musicAuthor, margin, y, col2);
      statBox('Original Music', ((show as any).has_original_music || (show as any).hasOriginalMusic) ? 'YES' : 'NO', margin + col2 + 4, y, col2);
      y += 18;
    }
    if ((show as any).has_video_projections || (show as any).hasVideoProjections) {
      statBox('Video / AV', (show as any).video_author || (show as any).videoAuthor || 'Original content', margin, y, col2);
      if ((show as any).video_description || (show as any).videoDescription) {
        statBox('Video Description', (show as any).video_description || (show as any).videoDescription, margin + col2 + 4, y, col2);
      }
      y += 18;
    }
    statBox('Script in English', (show as any).script_in_english === 'true' ? 'Full Script' : (show as any).script_in_english === 'partial' ? 'Synopsis Only' : 'No', margin, y, col2);
    if ((show as any).translations_available || show.translationsAvailable) {
      statBox('Translations Available', (show as any).translations_available || show.translationsAvailable, margin + col2 + 4, y, col2);
    }
    y += 18;

    if (show.scriptScenario) {
      checkY(30);
      fillSurface(); doc.rect(margin, y, col, 28, 'F');
      fillYellow(); doc.rect(margin, y, 2, 28, 'F');
      label('Script Excerpt / Scenario', margin + 5, y + 5, yellow);
      white(); doc.setFontSize(8); doc.setFont('helvetica', 'normal');
      const scLines = doc.splitTextToSize(show.scriptScenario, col - 10);
      scLines.slice(0, 5).forEach((line: string, i: number) => doc.text(line, margin + 5, y + 11 + i * 4.5));
      y += 32;
    }

    // Footer on every page
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      fillYellow(); doc.rect(0, H - 10, W, 10, 'F');
      black(); doc.setFontSize(7); doc.setFont('helvetica', 'bold');
      doc.text('HAHAHUB · THE COMEDY RIGHTS MARKETPLACE · HAHAHUB.ART', margin, H - 4);
      doc.text(`${i} / ${pageCount}`, W - margin - 8, H - 4);
    }

    doc.save(`${show.title.replace(/\s+/g, '_')}_Dossier_HahaHub.pdf`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-black">
      {renderDetailModal()}
      {renderInquiryModal()}
      <Navigation activePage="discovery" onNavigate={onNavigate} onLogout={onLogout} user={user} />
      
      <main className="pt-32 pb-20 px-6 md:px-12 flex-1">
        <div className="max-w-7xl mx-auto space-y-16">
          <section className="space-y-8 text-white">

            {/* HEADER */}
            <div className="flex flex-col gap-2">
              <span className="text-brand-cyan text-[10px] font-black uppercase tracking-[0.5em] italic">TICKLE. SET UP. PUNCH.</span>
              <h1 className="text-5xl sm:text-7xl md:text-9xl font-black uppercase leading-[0.85] tracking-tighter italic">
                The <span className="text-brand-yellow">Laff</span><br/>Exchange
              </h1>
            </div>

            {/* SEARCH + FILTERS — ONE ROW */}
            <div className="flex flex-wrap items-end gap-3">
              {/* Stefunny Search */}
              <div className="relative flex-1 min-w-[200px]">
                <div className="flex items-center gap-3 bg-brand-surface border-4 border-brand-cyan p-3 shadow-neo-cyan focus-within:shadow-none focus-within:translate-x-0.5 focus-within:translate-y-0.5 transition-all">
                  <div className="flex-shrink-0 px-2 h-7 bg-brand-cyan border-2 border-black flex items-center justify-center font-black text-black text-[8px] uppercase italic whitespace-nowrap">Miss Stefunny</div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search... genre, country, cast, keywords"
                    className="flex-1 bg-transparent border-none text-white font-black text-xs uppercase outline-none italic placeholder:text-white/30 placeholder:normal-case placeholder:not-italic"
                  />
                  {searchQuery ? (
                    <button onClick={() => setSearchQuery('')} className="flex-shrink-0 text-white/40 hover:text-brand-pink transition-colors">
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  ) : (
                    <span className="material-symbols-outlined text-brand-cyan text-base flex-shrink-0">search</span>
                  )}
                </div>
                {searchQuery && (
                  <div className="absolute top-full mt-1 text-[9px] font-black uppercase italic text-white/30 z-10">
                    {filteredShows.length > 0 ? `${filteredShows.length} found 🥊` : `Nothing found.`}
                  </div>
                )}
              </div>

              {/* Comedy Type */}
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-white/30 italic block">Comedy Type</label>
                <select value={filterGenre} onChange={(e) => setFilterGenre(e.target.value)} className="bg-brand-black border-2 border-white/20 text-white font-black text-xs uppercase p-2 focus:border-brand-pink italic">
                  <option value="All">All Types</option>
                  <option value="Comedy">Comedy (All)</option>
                  <optgroup label="── Subgenres ──">
                    <option value="Farce">Farce</option>
                    <option value="Monocomedy">Monocomedy</option>
                    <option value="Black Comedy">Black Comedy</option>
                    <option value="Satire">Satire</option>
                    <option value="Absurd">Absurd / Surreal</option>
                    <option value="Romantic Comedy">Romantic Comedy</option>
                    <option value="Slapstick">Slapstick</option>
                    <option value="Stand-up">Stand-up Theatre</option>
                    <option value="Musical Comedy">Musical Comedy</option>
                    <option value="Dark Comedy">Dark Comedy</option>
                  </optgroup>
                  {allGenres.filter(g => g !== 'All' && g !== 'Comedy').map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              {/* Origin Market */}
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-white/30 italic block">Origin Market</label>
                <select value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)} className="bg-brand-black border-2 border-white/20 text-white font-black text-xs uppercase p-2 focus:border-brand-cyan italic">
                  {allCountries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Cast Size */}
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-white/30 italic block">Cast Size</label>
                <select value={filterCast} onChange={(e) => setFilterCast(e.target.value)} className="bg-brand-black border-2 border-white/20 text-white font-black text-xs uppercase p-2 focus:border-brand-yellow italic">
                  <option value="All">All Sizes</option>
                  <option value="Solo/Duo">Solo / Duo (1-2)</option>
                  <option value="Small (3-5)">Small (3-5)</option>
                  <option value="Large (6+)">Large (6+)</option>
                </select>
              </div>

              {/* Sort */}
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-white/30 italic block">Sort</label>
                <div className="flex items-center gap-2 bg-brand-surface border-2 border-white/20 p-2">
                  <span className="material-symbols-outlined text-brand-cyan text-sm">sort</span>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent border-none text-white font-black uppercase italic text-xs focus:ring-0 p-0 cursor-pointer">
                    <option value="Newest" className="bg-brand-black">Newest</option>
                    <option value="Popular" className="bg-brand-black">Most Liked</option>
                    <option value="Trending" className="bg-brand-black">Trending</option>
                  </select>
                </div>
              </div>

              {/* Tickle List */}
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-white/30 italic block">&nbsp;</label>
                <button onClick={() => setShowShortlistOnly(v => !v)}
                  className={`flex items-center gap-2 px-3 py-2 border-4 font-black uppercase text-xs italic transition-all ${showShortlistOnly ? 'bg-brand-yellow text-black border-black' : 'bg-transparent text-white/50 border-white/20 hover:border-white hover:text-white'}`}>
                  <span className="material-symbols-outlined text-sm" style={{fontVariationSettings:"'FILL' 1"}}>touch_app</span>
                  Tickle List {shortlist.length > 0 && <span>({shortlist.length})</span>}
                </button>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-24">
            {isLoading ? (
              // LOADING SKELETONS
              [...Array(6)].map((_, i) => (
                <div key={i} className="bg-brand-surface border-4 border-white/10 overflow-hidden animate-pulse">
                  <div className="aspect-[2/3] bg-white/5"></div>
                  <div className="p-5 space-y-3">
                    <div className="h-2 bg-white/10 w-1/3 rounded"></div>
                    <div className="h-4 bg-white/10 w-3/4 rounded"></div>
                    <div className="h-3 bg-white/10 w-1/2 rounded"></div>
                  </div>
                </div>
              ))
            ) : filteredShows.length === 0 ? (
              <div className="col-span-3 py-32 text-center space-y-4">
                <p className="text-5xl">🔍</p>
                <p className="text-white/40 font-black uppercase italic text-2xl">Shush.</p>
                <p className="text-white/20 font-black uppercase italic text-sm">Nothing matches your filters.</p>
                <p className="text-white/10 text-xs italic">Try adjusting genre, language or search term.</p>
              </div>
            ) : filteredShows.map((show, index) => {
              const plan = (user as any)?.plan || 'gigl';
              const freeLimit = !user ? 5 : plan === 'gigl' ? 15 : 9999;
              const isFreeBlocked = plan === 'gigl' && !user?.isAdmin && index >= freeLimit;
              return (
              <div
                key={show.id}
                onClick={() => isFreeBlocked ? onNavigate('pricing') : handleShowSelect(show)}
                className={`group relative cursor-pointer bg-brand-surface border-4 border-white overflow-hidden flex flex-col transition-all duration-200
                  ${isFreeBlocked ? 'opacity-40' : 'hover:border-brand-yellow hover:shadow-neo-yellow hover:translate-x-[-3px] hover:translate-y-[-3px]'}`}
              >
                {/* Lock overlay */}
                {isFreeBlocked && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70">
                    <span className="material-symbols-outlined text-brand-yellow text-4xl mb-2">lock</span>
                    <p className="text-brand-yellow font-black uppercase italic text-xs">Upgrade to LAFF</p>
                  </div>
                )}

                {/* IMAGE */}
                <div className="relative overflow-hidden" style={{aspectRatio:'2/3'}}>
                  {show.imageUrl ? (
                    <img src={(show as any).thumbnailUrl || show.imageUrl} alt={show.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                  ) : (
                    <div className="w-full h-full bg-brand-black flex items-center justify-center">
                      <span className="text-6xl font-black uppercase italic text-white/10">{show.title[0]}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

                  {/* TOP BADGES */}
                  <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                    {(show as any).producer_plan === 'roar' && (
                      <span className="text-[7px] font-black uppercase bg-brand-pink text-white px-2 py-0.5 italic border border-black">FEATURED</span>
                    )}
                    {(() => {
                      const days = (show as any).created_at ? Math.floor((Date.now() - new Date((show as any).created_at).getTime()) / 86400000) : 999;
                      return days <= 10 ? <span className="text-[7px] font-black uppercase bg-white text-black px-2 py-0.5 italic border border-black">NEW</span> : null;
                    })()}
                  </div>

                  {/* SHORTLIST BUTTON */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleShortlist(e, show.id); }}
                    className={"absolute top-2 right-2 w-8 h-8 flex items-center justify-center border-2 transition-all " + (shortlist.includes(show.id) ? "bg-brand-yellow border-brand-yellow text-black" : "bg-black/60 border-white/40 text-white hover:border-brand-yellow hover:text-brand-yellow")}
                  >
                    <span className="material-symbols-outlined text-base" style={{fontVariationSettings: shortlist.includes(show.id) ? "'FILL' 1" : "'FILL' 0"}}>touch_app</span>
                  </button>

                  {/* BOTTOM INFO */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-brand-pink text-[9px] font-black uppercase italic tracking-widest mb-1">{show.genre}</p>
                    <h3 className="font-black uppercase italic text-white text-sm leading-tight group-hover:text-brand-yellow transition-colors">{show.title}</h3>
                    <p className="text-white/40 text-[9px] font-bold mt-0.5">{show.author}</p>
                  </div>
                </div>

                {/* BOTTOM BAR */}
                <div className="border-t-4 border-white/20 group-hover:border-brand-yellow/30 px-3 py-2 space-y-1.5 transition-all">
                  {/* PACKAGES */}
                  <div className="flex gap-1 flex-wrap">
                    {(show as any).hasScriptPackage && (
                      <span className="text-[8px] font-black uppercase bg-brand-yellow/20 text-brand-yellow px-1.5 py-0.5">
                        Script {(show as any).scriptRoyaltyPct ? (show as any).scriptRoyaltyPct + '%' : ''}
                      </span>
                    )}
                    {(show as any).hasFullPunchPackage && (
                      <span className="text-[8px] font-black uppercase bg-brand-pink/20 text-brand-pink px-1.5 py-0.5">
                        Full Punch {(show as any).fullPunchRoyaltyPct ? (show as any).fullPunchRoyaltyPct + '%' : ''}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[10px] text-white/50 font-black">
                        <span className="material-symbols-outlined text-sm text-brand-cyan">visibility</span>
                        {show.viewsCount || 0}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-white/50 font-black">
                        <span className="material-symbols-outlined text-sm text-brand-pink" style={{fontVariationSettings:"'FILL' 1"}}>favorite</span>
                        {show.likesCount || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-white/30 text-[9px] font-black italic">{show.location}</span>
                      <span className="text-white/20 text-[9px]">·</span>
                      <span className="text-white/30 text-[9px] font-black italic">{show.productionYear}</span>
                      {getProfileBadges(show).slice(0,1).map(b => <Badge key={b} type={b} size="xs" />)}
                    </div>
                  </div>
                </div>
              </div>
            )})}
          </section>
        </div>
      </main>
    </div>
  );
};

export default DiscoveryPage;
