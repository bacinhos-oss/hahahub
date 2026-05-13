
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
  const [isLoading, setIsLoading] = useState(true);
  const [shortlist, setShortlist] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('hahahub_shortlist') || '[]'); } catch { return []; }
  });
  const [showShortlistOnly, setShowShortlistOnly] = useState(false);

  // Simulate loading skeleton — disappears when shows arrive
  useEffect(() => {
    if (shows.length > 0) {
      const t = setTimeout(() => setIsLoading(false), 400);
      return () => clearTimeout(t);
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
  const [filterRisk, setFilterRisk] = useState('All');
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
      const matchesRisk = filterRisk === 'All' || show.riskProfile === filterRisk;
      const matchesCast = filterCast === 'All' || 
                         (filterCast === 'Solo/Duo' && totalCast <= 2) ||
                         (filterCast === 'Small (3-5)' && totalCast >= 3 && totalCast <= 5) ||
                         (filterCast === 'Large (6+)' && totalCast >= 6);
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || [
        show.title, show.author, show.director, show.synopsis,
        show.genre, show.subgenre, show.location, show.language,
        show.humorType, show.rightsStatus, show.budgetRange,
        show.producerName, show.riskProfile,
        String(show.duration), String(show.maleRoles + show.femaleRoles),
      ].some(field => field?.toLowerCase().includes(q));
      return matchesGenre && matchesCountry && matchesRisk && matchesCast && matchesSearch;
    });

    return result.sort((a, b) => {
      if (sortBy === 'Newest') return (b.productionYear || 0) - (a.productionYear || 0);
      if (sortBy === 'Popular') return (b.likesCount || 0) - (a.likesCount || 0);
      if (sortBy === 'Trending') return (b.viewsCount || 0) - (a.viewsCount || 0);
      return 0;
    });
  }, [shows, filterGenre, filterCountry, filterRisk, filterCast, sortBy, searchQuery, shortlist, showShortlistOnly]);

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
        <div className="relative bg-brand-black border-4 border-white w-full max-w-7xl max-h-[90vh] overflow-y-auto overflow-x-hidden shadow-neo-yellow animate-in zoom-in duration-300 text-white pb-12">
          <button onClick={() => setSelectedShowId(null)} className="absolute top-6 right-6 text-white hover:text-brand-pink transition-all z-20">
            <span className="material-symbols-outlined text-4xl font-black">close</span>
          </button>
          
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/3 border-b-4 lg:border-b-0 lg:border-r-4 border-white bg-brand-black overflow-hidden z-10 relative">
                <div className="flex flex-col h-full">
                  {/* POSTER */}
                  <div className="relative flex-shrink-0" style={{height: '55%', minHeight: '280px'}}>
                    <img src={selectedShow.imageUrl} className="w-full h-full object-cover object-center" alt={selectedShow.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                    <div className="absolute top-4 left-4 z-10">
                      <div className="px-3 py-1 text-[9px] font-black uppercase italic border-2 border-black shadow-[3px_3px_0px_white] bg-brand-yellow text-black">
                        {selectedShow.riskProfile}
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-4 z-10">
                      <p className="text-[8px] font-black uppercase tracking-widest text-white/50 italic">Poster</p>
                    </div>
                  </div>

                  {/* PRODUCTION PHOTOS */}
                  <div className="border-t-4 border-white flex-1 px-3 pt-3 pb-3">
                    <p className="text-[8px] font-black uppercase tracking-widest text-brand-cyan italic mb-3">Photos from Production</p>
                    <div className="space-y-2">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-full h-24 border-2 border-dashed border-white/20 overflow-hidden bg-white/5 flex items-center justify-center">
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
                  <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                    <div className="max-w-3xl">
                      <span className="bg-brand-cyan text-black px-3 py-1 text-[10px] font-black uppercase italic mb-2 inline-block">PRODUCTION DOSSIER v{selectedShow.productionYear}</span>
                      <h2 className="text-5xl md:text-8xl font-black uppercase leading-[0.9] tracking-tighter italic">{selectedShow.title}</h2>
                      <p className="text-xl font-bold text-white/40 italic mt-4">{selectedShow.location} • {selectedShow.duration} min • {selectedShow.genre}</p>
                    </div>
                    <button onClick={() => onToggleFavorite(selectedShow.id)} className={`h-16 w-16 flex-shrink-0 flex items-center justify-center border-4 transition-all ${isFavorited ? 'bg-brand-pink text-white border-black shadow-neo-white' : 'bg-transparent text-white border-white hover:border-brand-pink'}`}>
                      <span className="material-symbols-outlined text-3xl font-black">favorite</span>
                    </button>
                  </div>

                  {/* TRANSPARENCY SCORE GAUGE */}
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-4 md:p-6 border-4 border-white/10 bg-white/5">
                    <div className="flex-shrink-0">
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/30 italic mb-2">Transparency Score</p>
                      <div className="relative w-24 h-24">
                        <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1A1A1A" strokeWidth="3" />
                          <circle
                            cx="18" cy="18" r="15.9" fill="none"
                            stroke={selectedShow.transparencyScore >= 80 ? '#03DAC6' : selectedShow.transparencyScore >= 50 ? '#FFDE03' : '#FF0266'}
                            strokeWidth="3"
                            strokeDasharray={`${selectedShow.transparencyScore} 100`}
                            strokeLinecap="butt"
                            className="transition-all duration-1000"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-black text-white">{selectedShow.transparencyScore}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black uppercase italic text-white mb-2">
                        {selectedShow.transparencyScore >= 80 ? '✓ High Transparency' : selectedShow.transparencyScore >= 50 ? '~ Medium Transparency' : '⚠ Low Transparency'}
                      </p>
                      <p className="text-xs text-white/40 font-bold italic leading-relaxed">
                        {selectedShow.transparencyScore >= 80
                          ? 'This production has complete commercial data, rights info, and production history. Low-risk deal.'
                          : selectedShow.transparencyScore >= 50
                          ? 'Most key data is present. Some commercial details may need to be confirmed directly with the producer.'
                          : 'Limited data available. Recommend direct contact to verify rights and commercial terms before proceeding.'}
                      </p>
                      <div className="mt-3 h-2 bg-white/10 w-full">
                        <div
                          className="h-full transition-all duration-1000"
                          style={{
                            width: `${selectedShow.transparencyScore}%`,
                            background: selectedShow.transparencyScore >= 80 ? '#03DAC6' : selectedShow.transparencyScore >= 50 ? '#FFDE03' : '#FF0266'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* SYNOPSIS - MOVED HIGHER AS REQUESTED */}
                  <section className="space-y-6">
                    <h4 className="text-xl font-black uppercase italic text-brand-pink">SYNOPSIS</h4>
                    <p className="text-gray-200 text-2xl leading-relaxed italic border-l-8 border-brand-pink pl-8 bg-white/5 py-4">{selectedShow.synopsis}</p>
                  </section>

                  {/* 00. RIGHTS & IDENTITY */}
                  <section className="space-y-8">
                     <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-cyan italic">00. RIGHTS & IDENTITY</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-brand-surface border-4 border-white p-6 shadow-neo-cyan">
                           <p className="text-[9px] font-black uppercase text-brand-cyan mb-2 tracking-widest italic">Producer / Company</p>
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
                        <div className="bg-brand-surface border-4 border-white p-6">
                           <p className="text-[9px] font-black uppercase text-brand-yellow mb-1 tracking-widest italic">Copyright Holder</p>
                           <p className="text-lg font-black uppercase italic">{selectedShow.rightsHolder}</p>
                        </div>
                        <div className="bg-brand-surface border-4 border-white p-6">
                           <p className="text-[9px] font-black uppercase text-brand-pink mb-1 tracking-widest italic">Rights Status</p>
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
                             <span className="text-xs font-black uppercase italic text-brand-cyan">Can Merge Roles</span>
                             <span className="text-sm font-black">{selectedShow.canMergeRoles ? 'YES' : 'NO'}</span>
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

                  {/* 02. TECHNICAL STACK */}
                  <section className="space-y-8">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-yellow italic">02. TECHNICAL STACK & PRODUCTION SCALE</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white italic">03. MARKET PERFORMANCE</h4>
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
                        <div className="bg-brand-surface border-2 border-white/10 p-6">
                           <p className="text-[8px] font-black text-gray-500 uppercase italic mb-1">Risk Profile</p>
                           <p className="text-sm font-black uppercase text-brand-yellow">{selectedShow.riskProfile}</p>
                        </div>
                        <div className="bg-brand-surface border-2 border-white/10 p-6">
                           <p className="text-[8px] font-black text-gray-500 uppercase italic mb-1">Break Even</p>
                           <p className="text-sm font-black uppercase">{selectedShow.breakEvenPerformances} shows</p>
                        </div>
                        <div className="bg-brand-surface border-2 border-white/10 p-6">
                           <p className="text-[8px] font-black text-gray-500 uppercase italic mb-1">Sponsor Friendly</p>
                           <p className="text-sm font-black uppercase">{selectedShow.isSponsorFriendly ? 'YES' : 'NO'}</p>
                        </div>
                        <div className="bg-brand-surface border-2 border-white/10 p-6">
                           <p className="text-[8px] font-black text-gray-500 uppercase italic mb-1">Group Sales</p>
                           <p className="text-sm font-black uppercase">{selectedShow.isGroupSalesFriendly ? 'YES' : 'NO'}</p>
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

                  {/* 04. COMMERCIAL BIBLE */}
                  <section className="space-y-8">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink italic">04. COMMERCIAL BIBLE & CLEARANCE</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                       <div className="bg-brand-surface border-4 border-white p-4">
                          <p className="text-[8px] font-black text-brand-pink uppercase italic mb-1">License Type</p>
                          <p className="text-sm font-black uppercase italic">{selectedShow.licenseType}</p>
                       </div>
                       <div className="bg-brand-surface border-4 border-white p-4">
                          <p className="text-[8px] font-black text-brand-pink uppercase italic mb-1">Model</p>
                          <p className="text-sm font-black uppercase italic">{selectedShow.licensingModel}</p>
                       </div>
                       <div className="bg-brand-surface border-4 border-white p-4">
                          <p className="text-[8px] font-black text-brand-pink uppercase italic mb-1">Royalties</p>
                          <p className="text-sm font-black uppercase italic">{selectedShow.royaltyRange || 'Standard'}</p>
                       </div>
                       <div className="bg-brand-surface border-4 border-white p-4">
                          <p className="text-[8px] font-black text-brand-pink uppercase italic mb-1">Advance Fee</p>
                          <p className="text-sm font-black uppercase italic text-brand-yellow">{selectedShow.advanceFee || '€0'}</p>
                       </div>
                       <div className="bg-brand-surface border-4 border-white p-4">
                          <p className="text-[8px] font-black text-brand-pink uppercase italic mb-1">Exclusivity</p>
                          <p className="text-sm font-black uppercase italic">{selectedShow.exclusivityLevel}</p>
                       </div>
                       <div className="bg-brand-surface border-2 border-white/20 p-4">
                          <p className="text-[8px] font-black text-gray-500 uppercase italic mb-1">Decision Maker</p>
                          <p className="text-sm font-black uppercase">{selectedShow.decisionMakerType}</p>
                       </div>
                       <div className="bg-brand-surface border-2 border-white/20 p-4">
                          <p className="text-[8px] font-black text-gray-500 uppercase italic mb-1">Translation Rights</p>
                          <p className="text-sm font-black uppercase">{selectedShow.translationRightsIncluded ? 'INCLUDED' : 'SEPARATE'}</p>
                       </div>
                       {selectedShow.exitScenarios && <div className="sm:col-span-2 bg-brand-surface border-2 border-white/20 p-4">
                          <p className="text-[8px] font-black text-gray-500 uppercase italic mb-1">Exit Scenarios</p>
                          <p className="text-sm italic text-gray-300 break-words">{selectedShow.exitScenarios}</p>
                       </div>}
                    </div>

                    {/* ROYALTY CALCULATOR */}
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

                  {/* CTA SECTION */}
                  <div className="bg-brand-surface border-8 border-brand-cyan p-6 md:p-12 text-center space-y-6 shadow-neo-magenta">
                      <div className="space-y-2">
                        <h4 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-tight">Initiate Rights<br/>Clearing</h4>
                        <p className="text-xs md:text-sm font-black uppercase italic text-brand-cyan leading-relaxed">
                          Estimated Advance: {selectedShow.advanceFee || "€0"}<br className="md:hidden"/> • Clearing Speed: {selectedShow.rightsClearingSpeed}
                        </p>
                      </div>
                      <div className="flex flex-col md:flex-row gap-4 justify-center">
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
                          className="w-full md:w-auto bg-brand-yellow text-black px-8 md:px-16 py-5 md:py-8 font-black uppercase border-4 border-black shadow-[8px_8px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all italic tracking-[0.2em] md:tracking-[0.4em] text-lg md:text-2xl"
                        >
                          Tickle It
                        </button>
                        <button
                          onClick={() => downloadDossier(selectedShow)}
                          className="w-full md:w-auto bg-transparent text-white px-8 md:px-12 py-5 md:py-8 font-black uppercase border-4 border-white hover:border-brand-cyan hover:text-brand-cyan transition-all italic tracking-[0.2em] text-sm md:text-base flex items-center justify-center gap-3"
                        >
                          <span className="material-symbols-outlined text-xl">download</span>
                          The Dossier
                        </button>
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
        <div className="relative bg-brand-surface border-8 border-white w-full max-w-2xl p-5 md:p-12 max-h-[90vh] overflow-y-auto overflow-x-hidden shadow-neo-cyan animate-in zoom-in duration-300">
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
                <p className="text-white/40 text-xs font-bold italic">Expect a reply within 2-5 business days.</p>
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
              </div>

              <button 
                onClick={async () => {
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
                      }),
                    });
                  } catch {}
                  setInquirySuccess(true);
                  onUpdateStats(inquiryShowId || '', 'inquiry');
                }}
                className="w-full bg-brand-pink text-white font-black uppercase py-6 border-4 border-black shadow-neo-yellow hover:bg-black transition-all italic tracking-[0.2em] text-xl"
              >
                Send Inquiry 🥊
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
    <p class="synopsis">${show.synopsis || 'No synopsis provided.'}</p>
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
      <div class="stat"><div class="stat-label">Licensing Model</div><div class="stat-value">${show.licensingModel}</div></div>
      <div class="stat"><div class="stat-label">Royalty Range</div><div class="stat-value">${show.royaltyRange || 'On request'}</div></div>
      <div class="stat"><div class="stat-label">Advance Fee</div><div class="stat-value">${show.advanceFee || 'On request'}</div></div>
      <div class="stat"><div class="stat-label">Rights Status</div><div class="stat-value">${show.rightsStatus}</div></div>
      <div class="stat"><div class="stat-label">Clearing Speed</div><div class="stat-value">${show.rightsClearingSpeed}</div></div>
    </div>
    ${show.licensedCountries ? `<div style="margin-top:16px"><div class="stat-label" style="font-size:8px;font-weight:900;letter-spacing:0.3em;text-transform:uppercase;color:#999;margin-bottom:8px">Licensed Countries</div><p style="font-size:13px;font-weight:700">${show.licensedCountries}</p></div>` : ''}
  </div>

  <div class="section">
    <div class="section-label">Quality</div>
    <div class="section-title">Transparency Score</div>
    <div style="font-size:48px;font-weight:900">${show.transparencyScore}<span style="font-size:18px;color:#999">/100</span></div>
    <div class="score-bar"><div class="score-fill"></div></div>
    <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;color:#999;margin-top:8px">Data completeness & commercial transparency rating</p>
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

            {/* STEFUNNY LINK */}
            <button
              onClick={() => onNavigate('stefunny')}
              className="flex items-center gap-4 bg-brand-surface border-4 border-brand-yellow p-4 md:p-5 shadow-neo-yellow hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all w-full text-left group"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-brand-yellow border-2 border-black flex items-center justify-center font-black text-black text-xs uppercase italic rotate-[-2deg]">
                SF
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-brand-yellow italic">MISS STEFUNNY</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/30 italic">— Tickle Finder</span>
                </div>
                <p className="text-white/40 font-bold italic text-xs">Search by genre, country, cast, keywords →</p>
              </div>
              <span className="material-symbols-outlined text-brand-yellow text-2xl flex-shrink-0 group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>

            {/* SORT + SHORTLIST */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 bg-brand-surface border-2 border-white/20 p-3">
                <span className="material-symbols-outlined text-brand-cyan text-base">sort</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none text-white font-black uppercase italic text-xs focus:ring-0 p-0 cursor-pointer"
                >
                  <option value="Newest" className="bg-brand-black">Newest</option>
                  <option value="Popular" className="bg-brand-black">Most Liked</option>
                  <option value="Trending" className="bg-brand-black">Trending</option>
                </select>
              </div>
              <button
                onClick={() => setShowShortlistOnly(v => !v)}
                className={`flex items-center gap-2 px-4 py-3 border-4 font-black uppercase text-xs italic transition-all ${showShortlistOnly ? 'bg-brand-yellow text-black border-black shadow-neo-magenta' : 'bg-transparent text-white/50 border-white/20 hover:border-white hover:text-white'}`}
              >
                <span className="material-symbols-outlined text-base">bookmark</span>
                Tickle List {shortlist.length > 0 && <span className="ml-1">({shortlist.length})</span>}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 border-y-4 border-white/10 py-8">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/40 italic">Comedy Type</label>
                    <select value={filterGenre} onChange={(e) => setFilterGenre(e.target.value)} className="w-full bg-brand-black border-2 border-white/20 text-white font-black text-xs uppercase p-2 focus:border-brand-pink italic">
                        <option value="All">All Types</option>
                        <option value="Comedy">Comedy (All)</option>
                        <optgroup label="── Comedy Subgenres ──">
                          <option value="Farce">Farce</option>
                          <option value="Monocomedy">Monocomedy</option>
                          <option value="Black Comedy">Black Comedy</option>
                          <option value="Satire">Satire</option>
                          <option value="Absurd">Absurd / Surreal</option>
                          <option value="Romantic Comedy">Romantic Comedy</option>
                          <option value="Slapstick">Slapstick</option>
                          <option value="Stand-up">Stand-up Theatre</option>
                          <option value="Improv">Improv / Sketch</option>
                          <option value="Musical Comedy">Musical Comedy</option>
                          <option value="Dark Comedy">Dark Comedy</option>
                        </optgroup>
                        {allGenres.filter(g => g !== 'All' && g !== 'Comedy').map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/40 italic">Origin Market</label>
                    <select value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)} className="w-full bg-brand-black border-2 border-white/20 text-white font-black text-xs uppercase p-2 focus:border-brand-cyan italic">
                        {allCountries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/40 italic">Cast Size</label>
                    <select value={filterCast} onChange={(e) => setFilterCast(e.target.value)} className="w-full bg-brand-black border-2 border-white/20 text-white font-black text-xs uppercase p-2 focus:border-brand-yellow italic">
                        <option value="All">All Sizes</option>
                        <option value="Solo/Duo">Solo / Duo (1-2)</option>
                        <option value="Small (3-5)">Small (3-5)</option>
                        <option value="Large (6+)">Large (6+)</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/40 italic">Risk Profile</label>
                    <select value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)} className="w-full bg-brand-black border-2 border-white/20 text-white font-black text-xs uppercase p-2 focus:border-white italic">
                        <option value="All">Any Risk</option>
                        <option value="Proven hit">Proven Hit</option>
                        <option value="Moderate risk">Moderate Risk</option>
                        <option value="Experimental">Experimental</option>
                    </select>
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
              const isFreeBlocked = !user?.isPaid && !user?.isAdmin && index >= 3;
              return (
              <div key={show.id} onClick={() => isFreeBlocked ? onNavigate('pricing') : handleShowSelect(show)} className={`group relative cursor-pointer bg-brand-surface border-4 hover:shadow-neo-yellow hover:translate-x-[-3px] hover:translate-y-[-3px] transition-all duration-200 overflow-hidden flex flex-col ${isFreeBlocked ? 'opacity-40 hover:opacity-60' : ''} ${(show as any).producer_plan === 'roar' ? 'border-brand-pink shadow-[4px_4px_0px_rgba(255,2,102,0.5)] hover:shadow-none hover:border-brand-pink' : 'border-white hover:border-brand-yellow hover:shadow-neo-yellow'}`}>
                {isFreeBlocked && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm border-4 border-brand-yellow">
                    <span className="material-symbols-outlined text-brand-yellow text-4xl mb-2">lock</span>
                    <p className="text-brand-yellow font-black uppercase italic text-xs tracking-widest text-center px-4">Pro Access Only</p>
                    <p className="text-white/40 font-bold italic text-[10px] mt-1">Unlock all shows →</p>
                  </div>
                )}
                <div className="aspect-[2/3] relative overflow-hidden">
                  <img src={show.imageUrl} alt={show.title} className="w-full h-full object-cover transition-all duration-700 grayscale group-hover:grayscale-0 scale-105 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/20 opacity-80 group-hover:opacity-60 transition-opacity"></div>
                  <div className="absolute top-4 left-4 z-10 flex flex-col items-start gap-2">
                    {isNewThisWeek(show) && (
                      <span className="px-3 py-1 text-[9px] font-black uppercase italic bg-brand-pink text-white border-2 border-black shadow-[2px_2px_0px_black] animate-pulse">🔥 New</span>
                    )}
                  </div>
                  <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
                    <button
                      onClick={(e) => toggleShortlist(e, show.id)}
                      className={`w-8 h-8 flex items-center justify-center border-2 transition-all ${shortlist.includes(show.id) ? 'bg-brand-yellow text-black border-black' : 'bg-black/60 text-white/60 border-white/30 hover:border-white hover:text-white'}`}
                    >
                      <span className="material-symbols-outlined text-sm">{shortlist.includes(show.id) ? 'bookmark' : 'bookmark_border'}</span>
                    </button>
                    <span className="px-3 py-1 text-[10px] font-black uppercase italic border border-black shadow-[2px_2px_0px_white] bg-brand-yellow text-black">{show.productionYear}</span>
                    <span className="px-3 py-1 text-[10px] font-black uppercase italic border border-black shadow-[2px_2px_0px_white] bg-brand-cyan text-black">{show.location}</span>
                  </div>
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <div className="space-y-2">
                      <p className="text-brand-pink text-[10px] font-black uppercase italic tracking-[0.2em]">{show.genre} {show.subgenre ? `• ${show.subgenre}` : ''}</p>
                      <h3 className="text-xl md:text-3xl font-black uppercase italic leading-tight text-white group-hover:text-brand-yellow transition-colors line-clamp-2">{show.title}</h3>
                      <p className="text-white/60 text-xs uppercase font-bold">{show.author}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-brand-black border-t-4 border-white p-5 flex items-center justify-between">
                  <div className="flex items-center gap-2 group/metric">
                    <span className="material-symbols-outlined text-brand-cyan text-base">visibility</span>
                    <span className="text-[11px] font-black text-white/60 group-hover/metric:text-brand-cyan transition-colors">{show.viewsCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    {(show as any).producer_plan === 'roar' && (
                      <span className="text-[7px] font-black uppercase text-white bg-brand-pink px-2 py-0.5 italic border border-black">FEATURED</span>
                    )}
                    {(show as any).is_verified && (
                      <span className="text-[8px] font-black uppercase text-black bg-brand-cyan px-2 py-0.5 italic border border-black">VERIFIED</span>
                    )}
                    {(show as any).is_founding && (
                      <span className="text-[8px] font-black uppercase text-black bg-brand-yellow px-2 py-0.5 italic border border-black">FOUNDING</span>
                    )}
                    {show.licensedCountries && show.licensedCountries.split(',').filter(Boolean).length > 0 && (
                      <span className="text-[8px] font-black uppercase text-white bg-brand-pink px-2 py-0.5 italic border border-black">
                        {show.licensedCountries.split(',').filter((s: string) => s.trim()).length} COUNTRIES
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 group/metric">
                    <span className="material-symbols-outlined text-brand-pink text-base">favorite</span>
                    <span className="text-[11px] font-black text-white/60 group-hover/metric:text-brand-pink transition-colors">{show.likesCount.toLocaleString()}</span>
                  </div>
                  <div className="text-[9px] font-black text-white/30 uppercase italic">
                    EST. {show.productionYear}
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
