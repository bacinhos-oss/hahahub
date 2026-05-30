
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
}

const DiscoveryPage: React.FC<DiscoveryPageProps> = ({ onNavigate, onLogout, user, onToggleFavorite, onUpdateStats, shows, onViewProducer }) => {
  const [selectedShowId, setSelectedShowId] = useState<string | null>(null);
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
            {/* LEFT — POSTER + PHOTOS */}
            <div className="lg:w-80 flex-shrink-0 border-b-4 lg:border-b-0 lg:border-r-4 border-white bg-brand-black">
              {/* POSTER */}
              <div className="relative" style={{aspectRatio: '1/1.414'}}>
                <img src={selectedShow.imageUrl} className="w-full h-full object-cover object-top" alt={selectedShow.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 z-10 flex gap-1 flex-wrap">
                  <span className="bg-brand-cyan text-black text-[7px] font-black uppercase px-1.5 py-0.5">{selectedShow.genre}</span>
                  {selectedShow.productionYear && <span className="bg-white/20 text-white text-[7px] font-black uppercase px-1.5 py-0.5">{selectedShow.productionYear}</span>}
                </div>
              </div>
              {/* PRODUCTION PHOTOS */}
              {selectedShow.productionPhotos && selectedShow.productionPhotos.some(p => p) && (
                <div className="border-t-4 border-white p-3">
                  <p className="text-[8px] font-black uppercase text-brand-cyan italic mb-2 tracking-widest">Production Photos</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[0, 1, 2].map(i => (
                      selectedShow.productionPhotos?.[i] ? (
                        <div key={i} className="aspect-square overflow-hidden border border-white/20">
                          <img src={selectedShow.productionPhotos[i]} alt={"Photo " + (i+1)} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                        </div>
                      ) : null
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT — CONTENT */}
            <div className="flex-1 p-4 md:p-8 space-y-8 overflow-x-hidden min-w-0">
              {isGuest ? (
                <div className="flex flex-col items-center justify-center text-center py-16 space-y-6">
                  <span className="material-symbols-outlined text-6xl text-brand-pink">lock_person</span>
                  <h2 className="text-3xl font-black uppercase italic text-white">Producer Access Only</h2>
                  <button onClick={() => onNavigate('login')} className="bg-brand-yellow text-black px-8 py-3 font-black uppercase text-sm border-4 border-white italic">Login to View →</button>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* HEADER */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <span className="bg-brand-cyan text-black px-2 py-0.5 text-[9px] font-black uppercase italic mb-2 inline-block">Production Dossier · {selectedShow.productionYear}</span>
                      <h2 className="text-3xl md:text-5xl font-black uppercase leading-none italic break-words">{(selectedShow as any).english_title || (selectedShow as any).englishTitle || selectedShow.title}</h2>
                      {((selectedShow as any).english_title || (selectedShow as any).englishTitle) && selectedShow.title !== ((selectedShow as any).english_title) && (
                        <p className="text-white/30 text-sm italic mt-1">{selectedShow.title}</p>
                      )}
                      <p className="text-sm font-bold text-white/40 italic mt-2">{selectedShow.duration} min · {selectedShow.genre}</p>
                    </div>
                    <button onClick={() => onToggleFavorite(selectedShow.id)} className={`h-10 w-10 flex-shrink-0 flex items-center justify-center border-4 transition-all ${isFavorited ? 'bg-brand-pink text-white border-black' : 'bg-transparent text-white border-white hover:border-brand-pink'}`}>
                      <span className="material-symbols-outlined text-lg font-black">favorite</span>
                    </button>
                  </div>

                  {/* SYNOPSIS */}
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

                  {/* 00. BASIC INFO */}
                  <section className="space-y-4">
                    <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-cyan italic border-b border-white/10 pb-2">00. Basic Info</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="border-l-4 border-brand-pink pl-3 py-2 bg-white/3">
                        <p className="text-[8px] font-black uppercase text-brand-pink italic">Author</p>
                        <p className="text-sm font-black italic">{selectedShow.author || '—'}</p>
                      </div>
                      <div className="border-l-4 border-brand-cyan pl-3 py-2 bg-white/3">
                        <p className="text-[8px] font-black uppercase text-brand-cyan italic">Director</p>
                        <p className="text-sm font-black italic">{selectedShow.director || '—'}</p>
                      </div>
                      <div className="border-l-4 border-brand-yellow pl-3 py-2 bg-white/3">
                        <p className="text-[8px] font-black uppercase text-brand-yellow italic">Genre</p>
                        <p className="text-sm font-black italic">{selectedShow.genre}{selectedShow.subgenre ? ` · ${selectedShow.subgenre}` : ''}</p>
                      </div>
                      <div className="border-l-4 border-white/20 pl-3 py-2 bg-white/3">
                        <p className="text-[8px] font-black uppercase text-white/40 italic">Humor</p>
                        <p className="text-sm font-black italic">{selectedShow.humorType || '—'}</p>
                      </div>
                      <div className="border-l-4 border-white/20 pl-3 py-2 bg-white/3">
                        <p className="text-[8px] font-black uppercase text-white/40 italic">Language</p>
                        <p className="text-sm font-black italic">{(selectedShow as any).original_language || selectedShow.language || '—'}</p>
                      </div>
                      <div className="border-l-4 border-white/20 pl-3 py-2 bg-white/3">
                        <p className="text-[8px] font-black uppercase text-white/40 italic">Year</p>
                        <p className="text-sm font-black italic">{selectedShow.productionYear || '—'}</p>
                      </div>
                    </div>
                    {selectedShow.awards && (
                      <div className="border-l-4 border-brand-yellow pl-3 py-2 bg-white/3">
                        <p className="text-[8px] font-black uppercase text-brand-yellow italic">Awards</p>
                        <p className="text-sm font-black italic">{selectedShow.awards}</p>
                      </div>
                    )}
                    {selectedShow.internationalSuccessNotes && (
                      <div className="border-l-4 border-brand-cyan pl-3 py-2 bg-white/3">
                        <p className="text-[8px] font-black uppercase text-brand-cyan italic">International Success</p>
                        <p className="text-sm italic text-white/60">{selectedShow.internationalSuccessNotes}</p>
                      </div>
                    )}
                  </section>

                  {/* 01. PRODUCTION */}
                  <section className="space-y-4">
                    <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-pink italic border-b border-white/10 pb-2">01. Production</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { label: 'Male Roles', value: selectedShow.maleRoles, color: 'text-brand-yellow' },
                        { label: 'Female Roles', value: selectedShow.femaleRoles, color: 'text-brand-pink' },
                        { label: 'Duration', value: selectedShow.duration ? `${selectedShow.duration} min` : '—', color: 'text-brand-cyan' },
                        { label: 'Intermission', value: selectedShow.hasIntermission ? 'Yes' : 'No', color: 'text-white' },
                        { label: 'Scale', value: selectedShow.productionScale || '—', color: 'text-brand-cyan' },
                        { label: 'Stage', value: selectedShow.stageType || '—', color: 'text-white' },
                        { label: 'Touring', value: selectedShow.isTouringFriendly ? 'Yes' : 'No', color: 'text-brand-yellow' },
                        { label: 'Adaptation', value: selectedShow.adaptationFlexibility || '—', color: 'text-white' },
                      ].map((item, i) => (
                        <div key={i} className="bg-black/20 border border-white/10 p-3 text-center">
                          <p className="text-[8px] font-black text-white/30 uppercase italic">{item.label}</p>
                          <p className={`text-sm font-black uppercase italic ${item.color}`}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: 'Lighting', value: selectedShow.techStaffLighting },
                        { label: 'Sound', value: selectedShow.techStaffSound },
                        { label: 'Stagehands', value: selectedShow.techStaffStagehands },
                        { label: 'Technical', value: selectedShow.technicalComplexity },
                      ].map((item, i) => (
                        <div key={i} className="bg-black/20 border border-white/10 p-2 text-center">
                          <p className="text-[7px] font-black text-white/30 uppercase italic">{item.label}</p>
                          <p className="text-sm font-black text-white">{item.value ?? '—'}</p>
                        </div>
                      ))}
                    </div>
                    {selectedShow.directorNotes && (
                      <div className="border-l-4 border-brand-pink pl-3 py-2 bg-white/3">
                        <p className="text-[8px] font-black uppercase text-brand-pink italic">Director Notes</p>
                        <p className="text-sm italic text-white/60">{selectedShow.directorNotes}</p>
                      </div>
                    )}
                    {selectedShow.originalProductionSolutions && (
                      <div className="border-l-4 border-brand-cyan pl-3 py-2 bg-white/3">
                        <p className="text-[8px] font-black uppercase text-brand-cyan italic">Original Staging Solutions</p>
                        <p className="text-sm italic text-white/60">{selectedShow.originalProductionSolutions}</p>
                      </div>
                    )}
                  </section>

                  {/* 02. CREATIVE ASSETS */}
                  <section className="space-y-4">
                    <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-yellow italic border-b border-white/10 pb-2">02. Creative Assets</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="border-l-4 border-brand-yellow pl-3 py-2 bg-white/3">
                        <p className="text-[8px] font-black uppercase text-brand-yellow italic">Music</p>
                        {(selectedShow as any).music_author ? (
                          <>
                            <p className="text-sm font-black italic">{(selectedShow as any).music_author}</p>
                            <p className="text-[8px] text-brand-yellow/50 italic mt-0.5">{(selectedShow as any).has_original_music ? 'Original composition' : 'Licensed music'}</p>
                          </>
                        ) : <p className="text-sm italic text-white/30">Not specified</p>}
                      </div>
                      <div className="border-l-4 border-brand-cyan pl-3 py-2 bg-white/3">
                        <p className="text-[8px] font-black uppercase text-brand-cyan italic">Video / AV</p>
                        {(selectedShow as any).has_video_projections ? (
                          <>
                            {(selectedShow as any).video_author && <p className="text-sm font-black italic">{(selectedShow as any).video_author}</p>}
                            {(selectedShow as any).video_description && <p className="text-[8px] text-brand-cyan/50 italic mt-0.5">{(selectedShow as any).video_description}</p>}
                            {!(selectedShow as any).video_author && <p className="text-sm italic text-white/60">Original video content</p>}
                          </>
                        ) : <p className="text-sm italic text-white/30">No video projections</p>}
                      </div>
                      <div className="border-l-4 border-brand-pink pl-3 py-2 bg-white/3">
                        <p className="text-[8px] font-black uppercase text-brand-pink italic">Script in English</p>
                        {(selectedShow as any).script_in_english === 'true' || (selectedShow as any).scriptInEnglish === 'true' ? (
                          <p className="text-sm font-black italic text-brand-cyan">Full script available</p>
                        ) : (selectedShow as any).script_in_english === 'partial' ? (
                          <p className="text-sm font-black italic">Synopsis only</p>
                        ) : <p className="text-sm italic text-white/30">Not specified</p>}
                      </div>
                      <div className="border-l-4 border-white/20 pl-3 py-2 bg-white/3">
                        <p className="text-[8px] font-black uppercase text-white/40 italic">Translations</p>
                        {(selectedShow as any).translations_available || selectedShow.translationsAvailable ? (
                          <p className="text-sm font-black italic">{(selectedShow as any).translations_available || selectedShow.translationsAvailable}</p>
                        ) : <p className="text-sm italic text-white/30">Not specified</p>}
                      </div>
                    </div>
                  </section>

                  {/* 03. MARKET PERFORMANCE */}
                  <section className="space-y-4">
                    <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-white italic border-b border-white/10 pb-2">03. Market Performance</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="bg-black/20 border border-white/10 p-3">
                        <p className="text-[7px] font-black text-white/30 uppercase italic">Premiere</p>
                        <p className="text-xs font-black text-brand-yellow">{selectedShow.premiereDate || '—'}</p>
                        {selectedShow.premiereLocation && <p className="text-[8px] text-white/30 italic mt-0.5">{selectedShow.premiereLocation}</p>}
                      </div>
                      <div className="bg-black/20 border border-white/10 p-3 text-center">
                        <p className="text-[7px] font-black text-white/30 uppercase italic">Performances</p>
                        <p className="text-xl font-black text-brand-cyan">{selectedShow.performancesCount || 0}</p>
                      </div>
                      <div className="bg-black/20 border border-white/10 p-3 text-center">
                        <p className="text-[7px] font-black text-white/30 uppercase italic">Audience</p>
                        <p className="text-xl font-black text-brand-pink">{(selectedShow.totalAudience || 0).toLocaleString()}</p>
                      </div>
                      <div className="bg-black/20 border border-white/10 p-3 text-center">
                        <p className="text-[7px] font-black text-white/30 uppercase italic">Box Office</p>
                        <p className="text-xs font-black uppercase italic">{selectedShow.boxOfficeIndicator || '—'}</p>
                      </div>
                    </div>
                    {selectedShow.locationsPlayed && (
                      <div className="border-l-4 border-white/20 pl-3 py-2 bg-white/3">
                        <p className="text-[8px] font-black uppercase text-white/40 italic">Locations Played</p>
                        <p className="text-sm italic text-white/60">{selectedShow.locationsPlayed}</p>
                      </div>
                    )}
                  </section>

                  {/* 04. RIGHTS */}
                  <section className="space-y-4">
                    <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-pink italic border-b border-white/10 pb-2">04. Rights & Identity</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <div className="bg-brand-surface border-4 border-white p-3 shadow-neo-cyan">
                        <p className="text-[7px] font-black text-brand-cyan uppercase italic mb-1">Producer</p>
                        <p className="text-sm font-black uppercase italic">{selectedShow.producerName || '—'}</p>
                        {(selectedShow as any).user_id && (
                          <button onClick={() => { if (onViewProducer && (selectedShow as any).user_id) onViewProducer((selectedShow as any).user_id); onNavigate('producer' as any); }}
                            className="text-[8px] font-black uppercase italic text-brand-cyan hover:text-white transition-colors mt-1 block">
                            View Profile →
                          </button>
                        )}
                      </div>
                      <div className="bg-brand-surface border-2 border-white/20 p-3">
                        <p className="text-[7px] font-black text-white/40 uppercase italic mb-1">Copyright</p>
                        <p className="text-sm font-black uppercase italic">{selectedShow.rightsHolder || '—'}</p>
                      </div>
                      <div className="bg-brand-surface border-2 border-white/20 p-3">
                        <p className="text-[7px] font-black text-white/40 uppercase italic mb-1">Status</p>
                        <p className="text-sm font-black uppercase italic">{selectedShow.rightsStatus || '—'}</p>
                      </div>
                      <div className="bg-brand-surface border-2 border-white/20 p-3">
                        <p className="text-[7px] font-black text-white/40 uppercase italic mb-1">License</p>
                        <p className="text-sm font-black uppercase italic">{selectedShow.licenseType || '—'}</p>
                      </div>
                      <div className="bg-brand-surface border-2 border-white/20 p-3">
                        <p className="text-[7px] font-black text-white/40 uppercase italic mb-1">Exclusivity</p>
                        <p className="text-sm font-black uppercase italic">{selectedShow.exclusivityLevel || '—'}</p>
                      </div>
                      {selectedShow.territoriesAvailable && (
                        <div className="bg-brand-surface border-2 border-white/20 p-3">
                          <p className="text-[7px] font-black text-white/40 uppercase italic mb-1">Territories</p>
                          <p className="text-sm font-black italic">{selectedShow.territoriesAvailable}</p>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* 05. PACKAGES */}
                  <section className="space-y-4">
                    <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-yellow italic border-b border-white/10 pb-2">05. Licensing Packages</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(selectedShow as any).hasScriptPackage ? (
                        <div className="border-4 border-brand-yellow/50 p-4 space-y-2">
                          <p className="font-black uppercase italic text-white text-sm">Script Package</p>
                          <p className="text-white/30 text-xs italic">Script only. Buyer produces independently.</p>
                          <div className="flex gap-4 mt-2">
                            <div>
                              <p className="text-[8px] font-black uppercase text-brand-yellow italic">Royalty</p>
                              <p className="text-2xl font-black text-brand-yellow">{(selectedShow as any).scriptRoyaltyPct || (selectedShow as any).script_royalty_pct || '—'}<span className="text-sm">%</span></p>
                            </div>
                            {((selectedShow as any).scriptAdvanceFee || (selectedShow as any).script_advance_fee) && (
                              <div>
                                <p className="text-[8px] font-black uppercase text-white/40 italic">Advance</p>
                                <p className="text-lg font-black">EUR {(selectedShow as any).scriptAdvanceFee || (selectedShow as any).script_advance_fee}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : null}
                      {(selectedShow as any).hasFullPunchPackage ? (
                        <div className="border-4 border-brand-pink/50 p-4 space-y-2">
                          <p className="font-black uppercase italic text-white text-sm">Full Punch Package</p>
                          <p className="text-white/30 text-xs italic">Script + know-how + video + music.</p>
                          <div className="flex gap-4 mt-2">
                            <div>
                              <p className="text-[8px] font-black uppercase text-brand-pink italic">Royalty</p>
                              <p className="text-2xl font-black text-brand-pink">{(selectedShow as any).fullPunchRoyaltyPct || (selectedShow as any).full_punch_royalty_pct || '—'}<span className="text-sm">%</span></p>
                            </div>
                            {((selectedShow as any).fullPunchAdvanceFee || (selectedShow as any).full_punch_advance_fee) && (
                              <div>
                                <p className="text-[8px] font-black uppercase text-white/40 italic">Advance</p>
                                <p className="text-lg font-black">EUR {(selectedShow as any).fullPunchAdvanceFee || (selectedShow as any).full_punch_advance_fee}</p>
                              </div>
                            )}
                          </div>
                          {((selectedShow as any).fullPunchIncludes || (selectedShow as any).full_punch_includes) && (
                            <p className="text-[9px] text-white/40 italic mt-1">{(selectedShow as any).fullPunchIncludes || (selectedShow as any).full_punch_includes}</p>
                          )}
                        </div>
                      ) : null}
                      {!(selectedShow as any).hasScriptPackage && !(selectedShow as any).hasFullPunchPackage && (
                        <p className="text-white/30 text-sm italic">Licensing terms available on request.</p>
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
                          <p className="text-white/40 text-xs italic">Script + know-how: director notes, set/costume reference, video, music.</p>
                          {(selectedShow as any).full_punch_includes && (
                            <p className="text-brand-pink text-[9px] italic">Includes: {(selectedShow as any).full_punch_includes}</p>
                          )}
                          <div className="border-t border-white/10 pt-3 space-y-1">
                            <p className="text-brand-pink font-black text-2xl">
                              {(selectedShow as any).full_punch_royalty_pct || '15'}%
                              <span className="text-white/30 text-xs font-bold ml-1">of gross box office</span>
                            </p>
                            {(selectedShow as any).full_punch_advance_fee > 0 && (
                              <p className="text-white/40 text-xs">+ €{(selectedShow as any).full_punch_advance_fee} advance</p>
                            )}
                            <p className="text-[8px] text-white/20 italic">Video + music royalties included</p>
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
                          <p className="text-white/40 text-xs italic mt-1">Script + full know-how: director's notes, set/costume design reference, video material, original music. You decide what to use.</p>
                          {(inquiryShow as any)?.full_punch_includes && (
                            <p className="text-brand-pink text-[9px] italic mt-1">Includes: {(inquiryShow as any).full_punch_includes}</p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          {(inquiryShow as any)?.full_punch_royalty_pct && (
                            <p className="text-brand-pink font-black text-sm">{(inquiryShow as any).full_punch_royalty_pct}% royalty</p>
                          )}
                          {(inquiryShow as any)?.full_punch_advance_fee && (
                            <p className="text-white/40 text-xs">+ €{(inquiryShow as any).full_punch_advance_fee} advance</p>
                          )}
                          <p className="text-[8px] text-white/20 italic mt-1">Incl. video + music</p>
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
              {user && user.plan === 'gigl' && inquiryRateLimit !== null && inquiryRateLimit >= 3 && (
                <div className="bg-brand-yellow text-black p-4 border-4 border-black font-black uppercase text-sm italic mb-2">
                  ⚡ GIGL plan: 3 inquiries per month used. Upgrade to LAFF for unlimited.
                  <button onClick={() => onNavigate('pricing')} className="ml-2 underline">Upgrade →</button>
                </div>
              )}

              <button
                disabled={!!(user && user.plan === 'gigl' && inquiryRateLimit !== null && inquiryRateLimit >= 3) || inquirySending}
                onClick={async () => {
                  // Rate limit check za GIGL — max 3 inquiries na mesec
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
                    if (monthCount >= 3) return;
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


  const downloadDossier = (show: Show | null) => {
    if (!show) return;
    const totalCast = (show.maleRoles || 0) + (show.femaleRoles || 0);
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${show.title} — Production Dossier</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700;900&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Space Grotesk', sans-serif; background: #fff; color: #050505; }
    .cover { background: #050505; color: #fff; padding: 60px 48px 48px; min-height: 320px; display: flex; flex-direction: column; justify-content: flex-end; }
    .cover-label { font-size: 9px; font-weight: 900; letter-spacing: 0.4em; text-transform: uppercase; color: #03DAC6; margin-bottom: 12px; }
    .cover-title { font-size: 72px; font-weight: 900; text-transform: uppercase; line-height: 0.85; letter-spacing: -2px; margin-bottom: 16px; }
    .cover-title span { color: #FFDE03; }
    .cover-meta { font-size: 13px; font-weight: 700; text-transform: uppercase; color: rgba(255,255,255,0.4); letter-spacing: 0.2em; }
    .section { padding: 40px 48px; border-bottom: 3px solid #f0f0f0; }
    .section-label { font-size: 8px; font-weight: 900; letter-spacing: 0.5em; text-transform: uppercase; color: #03DAC6; margin-bottom: 8px; }
    .section-title { font-size: 22px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; margin-bottom: 20px; border-left: 6px solid #FFDE03; padding-left: 16px; }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
    .stat { background: #f8f8f8; padding: 16px; }
    .stat-label { font-size: 8px; font-weight: 900; letter-spacing: 0.3em; text-transform: uppercase; color: #999; margin-bottom: 4px; }
    .stat-value { font-size: 20px; font-weight: 900; text-transform: uppercase; }
    .synopsis { font-size: 14px; line-height: 1.7; color: #333; font-weight: 500; }
    .score-bar { height: 8px; background: #f0f0f0; margin-top: 8px; }
    .score-fill { height: 8px; background: ${(show.transparencyScore || 0) >= 80 ? '#03DAC6' : (show.transparencyScore || 0) >= 50 ? '#FFDE03' : '#FF0266'}; width: ${show.transparencyScore || 0}%; }
    .footer { background: #050505; color: rgba(255,255,255,0.3); padding: 32px 48px; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.3em; display: flex; justify-content: space-between; align-items: center; }
    .footer span { color: #FFDE03; }
  </style>
</head>
<body>
  <div class="cover">
    <div class="cover-label">Production Dossier v${show.productionYear} · HahaHub · The Laff Exchange</div>
    <div class="cover-title">${show.title}</div>
    <div class="cover-meta">${show.author} · ${show.location} · ${show.genre}${show.subgenre ? ' · ' + show.subgenre : ''}</div>
  </div>

  <div class="section">
    <div class="section-label">Overview</div>
    <div class="section-title">Synopsis</div>
    <p class="synopsis">${(show as any).synopsis_en || show.synopsis || 'No synopsis provided.'}</p>
  </div>

  <div class="section">
    <div class="section-label">Production Data</div>
    <div class="section-title">Key Specs</div>
    <div class="grid3">
      <div class="stat"><div class="stat-label">Duration</div><div class="stat-value">${show.duration} min</div></div>
      <div class="stat"><div class="stat-label">Cast Size</div><div class="stat-value">${totalCast} actors</div></div>
      <div class="stat"><div class="stat-label">Production Year</div><div class="stat-value">${show.productionYear}</div></div>
      <div class="stat"><div class="stat-label">Male Roles</div><div class="stat-value">${show.maleRoles}</div></div>
      <div class="stat"><div class="stat-label">Female Roles</div><div class="stat-value">${show.femaleRoles}</div></div>
      <div class="stat"><div class="stat-label">Budget Range</div><div class="stat-value">${show.budgetRange}</div></div>
      <div class="stat"><div class="stat-label">Scale</div><div class="stat-value">${show.productionScale}</div></div>
      <div class="stat"><div class="stat-label">Touring</div><div class="stat-value">${show.isTouringFriendly ? 'Yes' : 'No'}</div></div>
      <div class="stat"><div class="stat-label">Performances</div><div class="stat-value">${show.performancesCount || 0}</div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-label">Licensing</div>
    <div class="section-title">Rights & Commercial</div>
    <div class="grid2">
      <div class="stat"><div class="stat-label">License Type</div><div class="stat-value">${show.licenseType}</div></div>
      <div class="stat"><div class="stat-label">License Type</div><div class="stat-value">${show.licenseType || 'License'}</div></div>
      <div class="stat"><div class="stat-label">Advance Fee</div><div class="stat-value">${show.advanceFee || 'On request'}</div></div>
      <div class="stat"><div class="stat-label">Rights Status</div><div class="stat-value">${show.rightsStatus}</div></div>
      <div class="stat"><div class="stat-label">Clearing Speed</div><div class="stat-value">${show.rightsClearingSpeed}</div></div>
    </div>
    ${show.licensedCountries ? `<div style="margin-top:16px"><div class="stat-label" style="font-size:8px;font-weight:900;letter-spacing:0.3em;text-transform:uppercase;color:#999;margin-bottom:8px">Licensed Countries</div><p style="font-size:13px;font-weight:700">${show.licensedCountries}</p></div>` : ''}
  </div>

  <div class="section">
    <div class="section-label">Quality</div>

  </div>

  <div class="section">
    <div class="section-label">Contact</div>
    <div class="section-title">Rights Holder</div>
    <div class="grid2">
      <div class="stat"><div class="stat-label">Producer</div><div class="stat-value" style="font-size:16px">${show.producerName}</div></div>
      <div class="stat"><div class="stat-label">Rights Holder</div><div class="stat-value" style="font-size:16px">${show.rightsHolder || show.producerName}</div></div>
    </div>
    <p style="margin-top:16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;color:#999">Inquiries via HahaHub — hahahub.art</p>
  </div>

  <div class="footer">
    <div>HahaHub · <span>The Laff Exchange</span> · hahahub.art</div>
    <div>TICKLE. SET UP. PUNCH.</div>
    <div>Break a <span>Laffing</span> Leg. 🦵</div>
  </div>
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${show.title.replace(/\s+/g, '_')}_Dossier_HahaHub.html`;
    a.click();
    URL.revokeObjectURL(url);
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
                <div className="flex items-center gap-3 bg-brand-surface border-4 border-brand-yellow p-3 shadow-neo-yellow focus-within:shadow-none focus-within:translate-x-0.5 focus-within:translate-y-0.5 transition-all">
                  <div className="flex-shrink-0 w-7 h-7 bg-brand-yellow border-2 border-black flex items-center justify-center font-black text-black text-[8px] uppercase italic">SF</div>
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
                    <span className="material-symbols-outlined text-brand-yellow text-base flex-shrink-0">search</span>
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
                  <span className="material-symbols-outlined text-sm">bookmark</span>
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
              <div className="col-span-3 py-32 text-center">
                <p className="text-white/20 font-black uppercase italic text-2xl">Shush.</p>
                <p className="text-white/10 font-black uppercase italic text-sm mt-2">Nothing to tickle here. Adjust your filters.</p>
              </div>
            ) : filteredShows.map((show, index) => {
              const plan = (user as any)?.plan || 'gigl';
              const freeLimit = !user ? 5 : plan === 'gigl' ? 5 : 9999;
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
                    <img src={show.imageUrl} alt={show.title}
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
                    <span className="material-symbols-outlined text-base" style={shortlist.includes(show.id) ? {fontVariationSettings:"'FILL' 1"} : {}}>bookmark</span>
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
