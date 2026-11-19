
import { downloadShowStory } from '../lib/storyImage';
import { supabase } from '../lib/supabase';
import React, { useState, useMemo, useEffect } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Page, Show, User } from '../types';
import Smile from '../components/Smile';
import { ShowDossierSections } from '../components/ShowFields';
import { SHOW_SECTIONS, PACKAGES_SECTION, PACKAGE_INFO, FP_ITEMS, rawValue, displayValue } from '../lib/showFields';
import { Mascot, TierPill, getTier, isShownTier, isSampleShow, SampleRibbon, canSeeVerified, VerifiedLock } from '../components/Mascot';


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
  const [linkCopied, setLinkCopied] = useState(false);
  const [inquiryShowId, setInquiryShowId] = useState<string | null>(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
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
  const [filterLanguage, setFilterLanguage] = useState('All');
  const [filtersOpen, setFiltersOpen] = useState(false);
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

  const allLanguages = useMemo(() => ['All', ...new Set(shows.map(s => (s.language || '').trim()).filter(Boolean))].sort(), [shows]);
  const filtersActive = filterGenre !== 'All' || filterCountry !== 'All' || filterCast !== 'All' || filterLanguage !== 'All' || !!searchQuery;
  const activeFilterCount = [filterGenre, filterCountry, filterCast, filterLanguage].filter(v => v !== 'All').length;
  const clearFilters = () => { setFilterGenre('All'); setFilterCountry('All'); setFilterCast('All'); setFilterLanguage('All'); setSearchQuery(''); };
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
        show.title, (show as any).originalTitle, show.author, show.director, (show as any).synopsis_en, (show as any).original_language, (show as any).script_in_english,
        show.genre, show.subgenre, show.location, show.language,
        show.humorType, show.rightsStatus,
        show.producerName,
        String(show.duration), String(show.maleRoles + show.femaleRoles),
      ].some(field => field?.toLowerCase().includes(q));
      const matchesLanguage = filterLanguage === 'All' || (show.language || '').trim() === filterLanguage;
      return matchesGenre && matchesCountry && matchesCast && matchesLanguage && matchesSearch;
    });

    return result.sort((a, b) => {
      if (sortBy === 'Newest') return (b.productionYear || 0) - (a.productionYear || 0);
      if (sortBy === 'Popular') return (b.likesCount || 0) - (a.likesCount || 0);
      if (sortBy === 'Trending') return (b.viewsCount || 0) - (a.viewsCount || 0);
      return 0;
    });
  }, [shows, filterGenre, filterCountry, filterCast, filterLanguage, sortBy, searchQuery, shortlist, showShortlistOnly]);

  const handleShowSelect = (show: Show) => {
    setSelectedShowId(show.id);
    onUpdateStats(show.id, 'view');
  };

  const renderDetailModal = () => {
    if (!selectedShow) return null;
    const isFavorited = user?.favorites.includes(selectedShow.id);
    const isGuest = !user || user.name === "Guest User";
    // Scripts, creators and performance history: Verified Producers, the show's own producer, and all samples.
    const isOwnShow = !!user && (selectedShow as any)?.user_id === user.id;
    const fullAccess = canSeeVerified(user) || isOwnShow || isSampleShow(selectedShow);
    const listShow = () => { setSelectedShowId(null); onNavigate('upload'); };

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
        <div className="absolute inset-0 bg-brand-black/95 backdrop-blur-xl" onClick={() => setSelectedShowId(null)}></div>
        <div className="relative bg-brand-black border-2 border-white w-full max-w-7xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto overflow-x-hidden  animate-in fade-in zoom-in-95 duration-500 ease-out text-white pb-12">
          <button onClick={() => setSelectedShowId(null)} className="absolute top-6 right-6 text-white hover:text-brand-pink transition-all z-20">
            <span className="material-symbols-outlined text-4xl font-black">close</span>
          </button>
          
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/3 border-b-4 lg:border-b-0 lg:border-r-4 border-white bg-brand-black overflow-hidden z-10 relative">
                <div className="flex flex-col h-full">
                  {/* POSTER */}
                  <div className="relative flex-shrink-0 aspect-[2/3] max-w-[calc(70vh*2/3)] lg:max-w-none mx-auto lg:mx-0 w-full">
                    <img src={selectedShow.imageUrl} className="w-full h-full object-cover object-center" alt={selectedShow.title} />
                    {isSampleShow(selectedShow) && <SampleRibbon big />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                    <div className="absolute bottom-3 left-4 z-10">
                      <p className="text-[8px] font-black uppercase tracking-widest text-white/50 italic">Poster</p>
                    </div>
                  </div>

                  {/* PRODUCTION PHOTOS — only shown when the producer uploaded some */}
                  {selectedShow.productionPhotos && selectedShow.productionPhotos.filter(Boolean).length > 0 && (
                    <div className="border-t-4 border-white flex-1 px-3 pt-3 pb-3">
                      <p className="text-[8px] font-black uppercase tracking-widest text-brand-cyan italic mb-3">Photos from Production</p>
                      <div className="space-y-2">
                        {selectedShow.productionPhotos.filter(Boolean).slice(0, 3).map((url: string, i: number) => (
                          <div key={i} className="w-full border-2 border-white/20 overflow-hidden bg-white/5" style={{aspectRatio:"16/9"}}>
                            <img src={url} alt={"Production photo " + (i + 1)} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
            </div>

            <div className="flex-1 p-4 md:p-12 space-y-16 overflow-x-hidden">
              {isGuest ? (
                <div className="flex flex-col items-center justify-center text-center py-24 space-y-8">
                  <span className="material-symbols-outlined text-8xl text-brand-pink">lock_person</span>
                  <h2 className="text-4xl font-display uppercase italic text-white">MEMBERS ONLY</h2>
                  <p className="text-gray-400 italic font-bold">Become a member to view full scripts, commercial Bible, and technical rider.</p>
                  <button onClick={() => onNavigate('login')} className="bg-white text-black hover:bg-brand-pink hover:text-white px-10 py-4 font-black uppercase text-sm border-2 border-white  italic">Unlock Full Dossier</button>
                </div>
              ) : (
                <div className="space-y-16">
                  {isSampleShow(selectedShow) && (
                    <div className="bg-brand-yellow text-black border-2 border-black px-5 py-4 flex items-center gap-3">
                      <span className="material-symbols-outlined text-2xl">info</span>
                      <p className="font-black uppercase italic text-sm leading-snug">Sample listing. This show only demonstrates how HahaHub works. It is not a real offer and cannot be tickled.</p>
                    </div>
                  )}
                  {/* HEADER */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-3">
                    <div className="flex-1 min-w-0 w-full sm:pr-2">
                      <span className="bg-brand-cyan text-black px-3 py-1 text-[10px] font-black uppercase italic mb-2 inline-block">PRODUCTION DOSSIER v{selectedShow.productionYear}</span>
                      <h2 className="text-4xl md:text-7xl font-black uppercase leading-[0.9] tracking-tighter italic break-words">{selectedShow.title}</h2>
                      {(selectedShow as any).originalTitle && (selectedShow as any).originalTitle !== selectedShow.title && (
                        <p className="text-white/30 text-sm italic mt-1">Original title: {(selectedShow as any).originalTitle}</p>
                      )}
                      <p className="text-base md:text-xl font-bold text-white/40 italic mt-4">{selectedShow.location} • {selectedShow.duration} min • {selectedShow.genre}</p>
                    </div>
                    <div className="flex gap-3 flex-shrink-0 sm:mt-8">
                    <button
                      title="Copy link to this show"
                      onClick={async () => {
                        const link = `https://hahahub.art/show/${selectedShow.id}`;
                        try {
                          if (navigator.share) { await navigator.share({ title: selectedShow.title + ' — HahaHub', url: link }); }
                          else { await navigator.clipboard.writeText(link); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000); }
                        } catch { /* user cancelled */ }
                      }}
                      className="h-14 px-4 flex-shrink-0 flex items-center justify-center gap-2 border-2 border-white/40 text-white hover:border-brand-cyan hover:text-brand-cyan transition-all"
                    >
                      <span className="material-symbols-outlined text-xl">{linkCopied ? 'check' : 'link'}</span>
                      <span className="text-[10px] font-black uppercase italic tracking-widest hidden md:inline">{linkCopied ? 'Copied' : 'Share'}</span>
                    </button>
                    <button
                      title="Download an Instagram Story image of this show"
                      onClick={async () => {
                        try { await downloadShowStory(selectedShow as any); }
                        catch (e) { console.error(e); alert('Could not create the image. Try again in a moment.'); }
                      }}
                      className="h-14 px-4 flex-shrink-0 flex items-center justify-center gap-2 border-2 border-white/40 text-white hover:border-brand-yellow hover:text-brand-yellow transition-all"
                    >
                      <span className="material-symbols-outlined text-xl">photo_camera</span>
                      <span className="text-[10px] font-black uppercase italic tracking-widest hidden md:inline">Story</span>
                    </button>
                    <button onClick={() => onToggleFavorite(selectedShow.id)} className={`h-14 w-14 flex-shrink-0 flex items-center justify-center border-2 transition-all  ${isFavorited ? 'bg-brand-pink text-white border-black ' : 'bg-transparent text-white border-white hover:border-brand-pink'}`}>
                      <span className="material-symbols-outlined text-2xl font-black">favorite</span>
                    </button>
                    </div>
                  </div>

                  {/* TRAILER VIDEO */}
                  {(selectedShow as any).trailer_url && (
                    <section className="space-y-4">
                      <h4 className="text-xl font-black uppercase italic text-brand-cyan">🎬 TRAILER</h4>
                      <div className="relative w-full border-2 border-brand-cyan" style={{paddingBottom:'56.25%'}}>
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
                  </section>

                  {/* PRODUCER */}
                  <section className="max-w-md">
                        <div className="bg-brand-surface border-2 border-white p-4  overflow-hidden">
                           <p className="text-[8px] font-black uppercase text-brand-cyan mb-2 tracking-widest">PRODUCER</p>
                           <p className="text-lg font-black uppercase italic">{selectedShow.producerName}</p>
                           {(selectedShow as any).user_id && (
                             <button
                               onClick={() => { if (onViewProducer && (selectedShow as any).user_id) { onViewProducer((selectedShow as any).user_id); } onNavigate('producer'); }}
                               className="text-[9px] font-black uppercase italic text-brand-cyan hover:text-white transition-colors mt-1 block"
                             >
                               View Producer Profile →
                             </button>
                           )}
                           {!isSampleShow(selectedShow) && isShownTier(getTier(selectedShow)) && (
                             <div className="mt-3"><TierPill tier={getTier(selectedShow)} size="md" /></div>
                           )}
                        </div>
                  </section>

                  {/* 01 to 06: same sections, labels and order as Showload and My Hub (src/lib/showFields.ts) */}
                  <ShowDossierSections show={selectedShow} fullAccess={fullAccess} onList={listShow}
                    onAskExcerpt={isOwnShow ? undefined : () => {
                      setInquiryShowId(selectedShowId);
                      setSelectedShowId(null);
                      setSelectedPackage((selectedShow as any).has_script_package !== false ? 'script' : 'full_punch');
                      setInquiryName(user?.name || '');
                      setInquiryEmail(user?.email || '');
                      setInquiryMessage(`Hello, we are interested in "${selectedShow.title}". Could you send us a script excerpt (one scene is enough) so we can read it with our team? Thank you.`);
                      setInquirySuccess(false);
                      setIsInquiryOpen(true);
                    }} />

                  {/* SIMILAR SHOWS */}
                  {(() => {
                    const similar = shows
                      .filter(s => s.id !== selectedShow.id && s.is_produced && (s.genre === selectedShow.genre || s.location === selectedShow.location))
                      .slice(0, 3);
                    if (similar.length === 0) return null;
                    return (
                      <section className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 italic">Similar Shows</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {similar.map(s => (
                            <div
                              key={s.id}
                              onClick={() => { setSelectedShowId(s.id); onUpdateStats(s.id, 'view'); }}
                              className="group cursor-pointer border-2 border-white/20 hover:border-brand-yellow transition-all overflow-hidden"
                            >
                              <div className="aspect-[2/3] relative overflow-hidden">
                                <img src={s.imageUrl} alt={s.title} className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" />
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
                  <div className="bg-brand-surface border-2 md:border-2 border-brand-cyan p-4 md:p-10 space-y-4 md:space-y-6 ">
                    <div className="text-center">
                      <h4 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter">Select Package &amp; Tickle</h4>
                      <p className="text-white/40 text-xs italic mt-1 max-w-xl mx-auto">{PACKAGE_INFO.script.name}: {PACKAGE_INFO.script.tagline.toLowerCase()} {PACKAGE_INFO.fullPunch.name}: {PACKAGE_INFO.fullPunch.tagline.toLowerCase()} Royalty is a {PACKAGE_INFO.royaltyHelp}.</p>
                    </div>

                    {/* PACKAGES */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                      {/* SCRIPT */}
                      {(selectedShow as any).has_script_package !== false && (
                        <div className={"border-2 p-5 cursor-pointer transition-all space-y-3 " + (selectedPackage === 'script' ? 'border-brand-yellow bg-brand-yellow/10' : 'border-white/20 hover:border-brand-yellow/60')}
                          onClick={() => setSelectedPackage('script')}>
                          <div className="flex items-center justify-between">
                            <p className="font-black uppercase italic text-white text-lg">{PACKAGE_INFO.script.icon} {PACKAGE_INFO.script.name}</p>
                            {selectedPackage === 'script' && <span className="text-[8px] font-black uppercase bg-brand-yellow text-black px-2 py-0.5">✓ SELECTED</span>}
                          </div>
                          <p className="text-brand-yellow text-xs font-black uppercase italic">{PACKAGE_INFO.script.tagline}</p>
                          <p className="text-white/40 text-xs italic leading-relaxed">{PACKAGE_INFO.script.buyerText}</p>
                          <div className="border-t border-white/10 pt-3 space-y-1">
                            <p className="text-brand-yellow font-black text-2xl">
                              {(selectedShow as any).script_royalty_pct ? <>{(selectedShow as any).script_royalty_pct}%<span className="text-white/30 text-xs font-bold ml-1">of gross box office</span></> : <span className="text-base">Royalty on request</span>}
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
                              className="w-full bg-white text-black py-3 font-black uppercase italic text-sm border-2 border-black hover:bg-brand-pink hover:text-white transition-all">
                              Tickle It: The Script →
                            </button>
                          )}
                        </div>
                      )}

                      {/* FULL PUNCH */}
                      {(selectedShow as any).has_full_punch_package && (
                        <div className={"border-2 p-5 cursor-pointer transition-all space-y-3 " + (selectedPackage === 'full_punch' ? 'border-brand-pink bg-brand-pink/10' : 'border-white/20 hover:border-brand-pink/60')}
                          onClick={() => setSelectedPackage('full_punch')}>
                          <div className="flex items-center justify-between">
                            <p className="font-black uppercase italic text-white text-lg">{PACKAGE_INFO.fullPunch.icon} {PACKAGE_INFO.fullPunch.name}</p>
                            {selectedPackage === 'full_punch' && <span className="text-[8px] font-black uppercase bg-brand-pink text-white px-2 py-0.5">✓ SELECTED</span>}
                          </div>
                          <p className="text-brand-pink text-xs font-black uppercase italic">{PACKAGE_INFO.fullPunch.tagline}</p>
                          <p className="text-white/40 text-xs italic leading-relaxed">{PACKAGE_INFO.fullPunch.buyerText}</p>

                          {/* What's included */}
                          <div className="grid grid-cols-2 gap-1">
                            {FP_ITEMS.map(it => ({ key: it.key, label: it.icon + ' ' + it.label, always: it.always })).filter(({ key, always }) => always || (selectedShow as any)[key]).map(({ label }) => (
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
                                Materials in: {(selectedShow as any).fpPunchLanguage}
                              </span>
                            )}
                            {(selectedShow as any).fpPunchSupport && (
                              <span className="text-[8px] font-black uppercase bg-brand-cyan/20 text-brand-cyan px-2 py-0.5">
                                🤝 Punch Support: team helps in rehearsals
                              </span>
                            )}
                          </div>

                          <div className="border-t border-white/10 pt-3 space-y-1">
                            <p className="text-brand-pink font-black text-2xl">
                              {(selectedShow as any).full_punch_royalty_pct ? <>{(selectedShow as any).full_punch_royalty_pct}%<span className="text-white/30 text-xs font-bold ml-1">of gross box office</span></> : <span className="text-base">Royalty on request</span>}
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
                              Tickle It: Full Punch →
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
                            className="w-full bg-white text-black py-5 font-black uppercase italic text-xl border-2 border-black hover:bg-brand-pink hover:text-white transition-all">
                            Tickle It →
                          </button>
                        </div>
                      )}
                    </div>

                    {/* DOSSIER BUTTON */}
                    <div className="border-t border-white/10 pt-4 flex justify-center">
                      <button onClick={() => downloadDossier(selectedShow, fullAccess)}
                        className="bg-transparent text-white px-8 py-3 font-black uppercase border-2 border-white hover:border-brand-cyan hover:text-brand-cyan transition-all italic text-sm flex items-center gap-3">
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
    if (selectedShow && isSampleShow(selectedShow)) return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-brand-black/95 backdrop-blur-md" onClick={() => setIsInquiryOpen(false)}></div>
        <div className="relative bg-brand-surface border-2 border-brand-yellow w-full max-w-md p-8 text-center">
          <Smile height={72} className="mx-auto mb-6" />
          <h3 className="text-2xl font-black uppercase italic text-white mb-3">Just a sample</h3>
          <p className="text-white/60 font-bold italic leading-relaxed mb-8">This show only demonstrates how HahaHub works, so it cannot be tickled. Browse the real shows in the catalog, or list your own.</p>
          <button onClick={() => setIsInquiryOpen(false)} className="bg-white text-black px-8 py-3 font-black uppercase italic text-sm hover:bg-brand-pink hover:text-white transition-colors">Got it</button>
        </div>
      </div>
    );

    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 md:p-6">
        <div className="absolute inset-0 bg-brand-black/95 backdrop-blur-md" onClick={() => setIsInquiryOpen(false)}></div>
        <div className="relative bg-brand-surface border-2 border-white w-full max-w-2xl p-5 md:p-12 max-h-[90vh] overflow-y-auto overflow-x-hidden  animate-in fade-in zoom-in-95 duration-500 ease-out">
          <button onClick={() => setIsInquiryOpen(false)} className="absolute top-6 right-6 text-white hover:text-brand-pink transition-all">
            <span className="material-symbols-outlined text-4xl font-black">close</span>
          </button>

          {inquirySuccess ? (
            <div className="text-center py-20 space-y-8 animate-in zoom-in">
              <div className="w-24 h-24 bg-brand-cyan border-2 border-black mx-auto flex items-center justify-center rotate-3 ">
                <span className="material-symbols-outlined text-black text-6xl font-black">send</span>
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-black uppercase italic text-white">You Tickled<br/>the Laff! 🎭</h2>
                <p className="text-brand-cyan font-bold uppercase tracking-[0.2em] text-sm italic">The producer has been notified of your interest.</p>
                <div className="border-2 border-white/10 p-6 text-left space-y-3 mt-4">
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
                className="bg-white text-black hover:bg-brand-pink hover:text-white px-10 py-4 font-black uppercase text-sm border-2 border-black  italic"
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
                      className={"w-full text-left border-2 p-4 transition-all " + (selectedPackage === 'script' ? 'border-brand-yellow bg-brand-yellow/10' : 'border-white/20 hover:border-white/40')}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-black uppercase italic text-white text-sm">{PACKAGE_INFO.script.icon} {PACKAGE_INFO.script.name}</p>
                          <p className="text-white/40 text-xs italic mt-1">{PACKAGE_INFO.script.buyerText}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {(inquiryShow as any)?.script_royalty_pct && (
                            <p className="text-brand-yellow font-black text-sm">{(inquiryShow as any).script_royalty_pct}% of box office</p>
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
                      className={"w-full text-left border-2 p-4 transition-all " + (selectedPackage === 'full_punch' ? 'border-brand-pink bg-brand-pink/10' : 'border-white/20 hover:border-white/40')}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-black uppercase italic text-white text-sm">{PACKAGE_INFO.fullPunch.icon} {PACKAGE_INFO.fullPunch.name}</p>
                          <p className="text-white/40 text-xs italic mt-1">{PACKAGE_INFO.fullPunch.buyerText}</p>
                          {/* Contents grid */}
                          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-2">
                            {FP_ITEMS.map(it => ({ key: it.key, label: it.icon + ' ' + it.label, always: it.always })).filter(({ key, always }) => always || (inquiryShow as any)?.[key]).map(({ label }) => (
                              <div key={label} className="flex items-center gap-1">
                                <span className="text-brand-pink text-[9px]">✓</span>
                                <span className="text-white/60 text-[9px] font-bold uppercase italic">{label}</span>
                              </div>
                            ))}
                          </div>
                          {(inquiryShow as any)?.fpPunchSupport && (
                            <p className="text-brand-cyan text-[9px] font-black uppercase italic mt-1.5">🤝 Punch Support: team helps in rehearsals</p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          {(inquiryShow as any)?.full_punch_royalty_pct && (
                            <p className="text-brand-pink font-black text-sm">{(inquiryShow as any).full_punch_royalty_pct}% of box office</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
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

              <button
                disabled={inquirySending}
                onClick={async () => {

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
                    await fetch('/api/send-email', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        type: 'inquiry',
                        to: inquiryShow?.producerEmail || 'info@hahahub.art',
                        data: {
                          producerName: inquiryShow?.producerName || '',
                          buyerName: inquiryName,
                          buyerEmail: inquiryEmail,
                          showTitle: inquiryShow?.title,
                          message: inquiryMessage,
                          packageType: selectedPackage,
                        },
                      }),
                    });
                  } catch (notifyErr) { console.error('Producer notification email failed:', notifyErr); }
                  
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
                    if (inquiryErr) {
                      console.error('Inquiry save error:', inquiryErr);
                      alert('❌ Something went wrong saving your inquiry. It may not reach the producer. Please try again, or email info@hahahub.art for help.');
                      setInquirySending(false);
                      return;
                    }
                  } catch(e) {
                    console.error('Inquiry save error:', e);
                    alert('❌ Something went wrong saving your inquiry. It may not reach the producer. Please try again, or email info@hahahub.art for help.');
                    setInquirySending(false);
                    return;
                  }

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
                className="w-full bg-brand-pink text-white font-black uppercase py-6 border-2 border-black  hover:bg-black transition-all italic tracking-[0.2em] text-xl disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {inquirySending ? 'SENDING...' : 'Send Inquiry 🥊'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };


  const downloadDossier = async (show: Show | null, fullAccess = false) => {
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
    const yellow = () => doc.setTextColor(255, 200, 14);
    const pink = () => doc.setTextColor(239, 73, 134);
    const cyan = () => doc.setTextColor(25, 165, 150);
    const gray = () => doc.setTextColor(150, 150, 150);

    const fillBlack = () => doc.setFillColor(5, 5, 5);
    const fillSurface = () => doc.setFillColor(18, 18, 18);
    const fillYellow = () => doc.setFillColor(255, 200, 14);
    const fillPink = () => doc.setFillColor(239, 73, 134);
    const fillCyan = () => doc.setFillColor(25, 165, 150);

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
    const mainTitle = show.title;
    yellow(); doc.setFontSize(mainTitle.length > 12 ? 28 : 36); doc.setFont('helvetica', 'bold');
    doc.text(mainTitle.toUpperCase(), margin, y);
    y += (mainTitle.length > 12 ? 12 : 16);

    if ((show as any).originalTitle && (show as any).originalTitle !== mainTitle) {
      white(); doc.setFontSize(12); doc.setFont('helvetica', 'normal');
      doc.text(`Original title: ${(show as any).originalTitle}`.toUpperCase(), margin, y);
      y += 8;
    }

    white(); doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.text(`${show.author} · ${show.location || ''} · ${(show as any).original_language || show.language || ''} · ${show.genre}${show.subgenre ? ' · ' + show.subgenre : ''}`, margin, y);
    y += 6;
    gray(); doc.setFontSize(8);
    doc.text(`${show.duration} min · ${(show.maleRoles || 0) + (show.femaleRoles || 0)} actors · ${show.productionScale} production`, margin, y);
    y += 12;

    // Packages on cover
    if ((show as any).has_script_package !== false) {
      fillYellow(); doc.rect(margin, y, 28, 8, 'F');
      black(); doc.setFontSize(7); doc.setFont('helvetica', 'bold');
      doc.text(`SCRIPT${(show as any).scriptRoyaltyPct ? ' ' + (show as any).scriptRoyaltyPct + '%' : ''}`, margin + 2, y + 5.5);
    }
    if ((show as any).hasFullPunchPackage || (show as any).has_full_punch_package) {
      fillPink(); doc.rect(margin + 32, y, 40, 8, 'F');
      white(); doc.setFontSize(7); doc.setFont('helvetica', 'bold');
      doc.text(`FULL PUNCH${(show as any).full_punch_royalty_pct ? ' ' + (show as any).full_punch_royalty_pct + '%' : ''}`, margin + 34, y + 5.5);
    }

    // Footer strip
    fillYellow(); doc.rect(0, H - 10, W, 10, 'F');
    black(); doc.setFontSize(7); doc.setFont('helvetica', 'bold');
    doc.text('HAHAHUB · THE COMEDY RIGHTS MARKETPLACE · HAHAHUB.ART', margin, H - 4);
    doc.text('TICKLE. SET UP. PUNCH.', W - margin - 38, H - 4);

    // ─── PAGE 2+: same sections as Showload, My Hub and the dossier (src/lib/showFields.ts) ───
    const pdfSafe = (t: any) => String(t ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[đĐ]/g, m => (m === 'đ' ? 'd' : 'D')).replace(/[^\x20-\x7E\n -ÿ]/g, '').trim();
    const lightBox = () => doc.setFillColor(242, 242, 242);
    const dark = () => doc.setTextColor(20, 20, 20);
    const newPage = () => { doc.addPage(); y = margin; };
    const need = (h: number) => { if (y + h > H - 18) newPage(); };
    const head = (num: string, text: string) => {
      need(18);
      fillYellow(); doc.rect(margin, y, 2, 8, 'F');
      dark(); doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.text(num, margin + 5, y + 5.5);
      doc.setFontSize(13); doc.text(pdfSafe(text).toUpperCase(), margin + 14, y + 5.5);
      y += 12;
    };
    const para = (text: string, size = 9, font: 'helvetica' | 'courier' = 'helvetica') => {
      dark(); doc.setFont(font, 'normal'); doc.setFontSize(size);
      doc.splitTextToSize(pdfSafe(text), col).forEach((line: string) => { need(5); doc.text(line, margin, y); y += size * 0.5; });
      y += 3;
    };
    const lockedNote = () => {
      need(14); lightBox(); doc.rect(margin, y, col, 11, 'F');
      gray(); doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
      doc.text('VERIFIED PRODUCERS ONLY. LIST YOUR FIRST SHOW ON HAHAHUB.ART TO UNLOCK THIS.', margin + 4, y + 7);
      y += 15;
    };
    const boxRow = (items: { l: string; v: string }[], cols = 3) => {
      const w = (col - (cols - 1) * 4) / cols;
      for (let i = 0; i < items.length; i += cols) {
        const row = items.slice(i, i + cols).map(it => ({ ...it, lines: doc.setFontSize(9) && doc.splitTextToSize(pdfSafe(it.v), w - 6).slice(0, 3) }));
        const h = 9 + Math.max(...row.map(r => r.lines.length)) * 4.5;
        need(h + 4);
        row.forEach((r, j) => {
          const x = margin + j * (w + 4);
          lightBox(); doc.rect(x, y, w, h, 'F');
          label(pdfSafe(r.l), x + 3, y + 5);
          dark(); doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
          r.lines.forEach((ln: string, k: number) => doc.text(ln, x + 3, y + 10 + k * 4.5));
        });
        y += h + 4;
      }
    };

    newPage();
    head('', 'Synopsis');
    para((show as any).synopsis_en || 'No synopsis provided.', 10);

    SHOW_SECTIONS.forEach(sec => {
      const fields = sec.fields.filter(d => !d.hideInDossier && displayValue(d, rawValue(show, d.key)) !== '' && (!d.dependsOn || !!String(rawValue(show, d.dependsOn) ?? '').trim()));
      if (!fields.length) return;
      head(sec.num, sec.title);
      if (sec.lock && !fullAccess) { lockedNote(); return; }
      boxRow(fields.filter(d => !d.wide).map(d => ({ l: d.label, v: d.locked && !fullAccess ? 'Verified Producers only' : displayValue(d, rawValue(show, d.key)) })));
      fields.filter(d => d.wide).forEach(d => {
        need(12); label(pdfSafe(d.label), margin, y); y += 4;
        if (d.locked && !fullAccess) { lockedNote(); return; }
        para(displayValue(d, rawValue(show, d.key)), d.key === 'script_scenario' ? 8 : 9, d.key === 'script_scenario' ? 'courier' : 'helvetica');
      });
      y += 2;
    });

    head(PACKAGES_SECTION.num, PACKAGES_SECTION.title);
    para('Royalty is a percentage of gross box office, paid per performance.', 8);
    const pkg = (on: boolean, info: { name: string; tagline: string; buyerText: string }, pct: any, adv: any, extra?: () => void) => {
      if (!on) return;
      need(30);
      dark(); doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
      doc.text(pdfSafe(`${info.name}${pct ? '  ·  ' + pct + '% of box office' : '  ·  royalty on request'}${Number(adv) > 0 ? '  ·  EUR ' + adv + ' advance' : ''}`).toUpperCase(), margin, y); y += 6;
      gray(); doc.setFontSize(8); doc.text(pdfSafe(info.tagline).toUpperCase(), margin, y); y += 5;
      para(info.buyerText, 9);
      extra?.();
      y += 3;
    };
    pkg(rawValue(show, 'has_script_package') !== false, PACKAGE_INFO.script, rawValue(show, 'script_royalty_pct'), rawValue(show, 'script_advance_fee'));
    pkg(!!rawValue(show, 'has_full_punch_package'), PACKAGE_INFO.fullPunch, rawValue(show, 'full_punch_royalty_pct'), rawValue(show, 'full_punch_advance_fee'), () => {
      FP_ITEMS.filter(it => it.always || rawValue(show, it.key)).forEach(it => {
        need(6); dark(); doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
        doc.text('+ ' + pdfSafe(it.label), margin + 2, y);
        gray(); doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
        doc.text(pdfSafe(it.desc), margin + 50, y); y += 5;
      });
      y += 2;
      boxRow([
        { l: 'Language of the materials', v: rawValue(show, 'fp_punch_language') || 'EN' },
        { l: 'Punch Support', v: rawValue(show, 'fp_punch_support') ? 'Yes, the team helps in rehearsals' : 'No' },
      ], 2);
    });

    // Footer on every page
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      fillYellow(); doc.rect(0, H - 10, W, 10, 'F');
      black(); doc.setFontSize(7); doc.setFont('helvetica', 'bold');
      doc.text('HAHAHUB · THE COMEDY RIGHTS MARKETPLACE · HAHAHUB.ART', margin, H - 4);
      if (i > 1) doc.text(`${i} / ${pageCount}`, W - margin - 8, H - 4);
    }

    doc.save(`${(show.title).replace(/\s+/g, '_')}_Dossier_HahaHub.pdf`);
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
              <h1 className="font-display text-white text-4xl sm:text-5xl md:text-6xl leading-[0.95] tracking-tight">
                The Laff <span className="text-brand-yellow">Exchange</span>
              </h1>
            </div>

            {/* SEARCH + FILTERS — ONE ROW */}
            <div className="flex flex-wrap items-end gap-3">
              {/* Stefunny Search */}
              <div className="relative w-full md:w-auto md:flex-1 md:min-w-[200px] md:max-w-[480px]">
                <div className="flex items-center gap-2 bg-brand-surface border-2 border-white/20 hover:border-brand-cyan/60 focus-within:border-brand-cyan transition-all">
                  <div className="flex-shrink-0 px-3 py-2.5 bg-brand-cyan/10 border-r border-white/10 flex items-center justify-center">
                    <span className="font-black text-brand-cyan text-[8px] uppercase italic whitespace-nowrap tracking-widest">Miss Stefunny</span>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search genre, country, cast, keywords..."
                    className="flex-1 bg-transparent border-none text-white text-xs outline-none placeholder:text-white/20 py-2.5 pr-2"
                  />
                  {searchQuery ? (
                    <button onClick={() => setSearchQuery('')} className="flex-shrink-0 text-white/40 hover:text-brand-pink transition-colors pr-2">
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  ) : (
                    <span className="material-symbols-outlined text-white/30 text-base flex-shrink-0 pr-2">search</span>
                  )}
                </div>
                {searchQuery && (
                  <div className="absolute top-full mt-1 text-[9px] font-black uppercase italic text-white/30 z-10">
                    {filteredShows.length > 0 ? `${filteredShows.length} found 🥊` : `Nothing found.`}
                  </div>
                )}
              </div>

              {/* Phones: filters fold away behind one button */}
              <button onClick={() => setFiltersOpen(v => !v)}
                className={`md:hidden self-end flex items-center gap-2 px-3 py-2 border-2 font-black uppercase text-xs italic transition-all ${filtersOpen || activeFilterCount ? 'border-white text-white' : 'border-white/20 text-white/60'}`}>
                <span className="material-symbols-outlined text-sm">tune</span>
                Filters{activeFilterCount > 0 && <span className="text-brand-yellow">({activeFilterCount})</span>}
              </button>

              <div className={`${filtersOpen ? 'grid' : 'hidden'} order-last w-full grid-cols-2 gap-3 md:order-none md:contents`}>
              {/* Comedy Type */}
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-white/30 italic block">Comedy Type</label>
                <select value={filterGenre} onChange={(e) => setFilterGenre(e.target.value)} className="w-full md:w-auto bg-brand-black border-2 border-white/20 text-white font-black text-xs uppercase p-2 focus:border-brand-pink italic">
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
                <select value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)} className="w-full md:w-auto bg-brand-black border-2 border-white/20 text-white font-black text-xs uppercase p-2 focus:border-brand-cyan italic">
                  {allCountries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Language */}
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-white/30 italic block">Language</label>
                <select value={filterLanguage} onChange={(e) => setFilterLanguage(e.target.value)} className="w-full md:w-auto bg-brand-black border-2 border-white/20 text-white font-black text-xs uppercase p-2 focus:border-brand-yellow italic">
                  {allLanguages.map(l => <option key={l} value={l}>{l === 'All' ? 'All Languages' : l}</option>)}
                </select>
              </div>

              {/* Cast Size */}
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-white/30 italic block">Cast Size</label>
                <select value={filterCast} onChange={(e) => setFilterCast(e.target.value)} className="w-full md:w-auto bg-brand-black border-2 border-white/20 text-white font-black text-xs uppercase p-2 focus:border-brand-yellow italic">
                  <option value="All">All Sizes</option>
                  <option value="Solo/Duo">Solo / Duo (1-2)</option>
                  <option value="Small (3-5)">Small (3-5)</option>
                  <option value="Large (6+)">Large (6+)</option>
                </select>
              </div>

              {filtersActive && (
                <button onClick={clearFilters} className="self-end text-[10px] font-black uppercase italic text-brand-pink border-2 border-brand-pink/40 px-3 py-2 hover:bg-brand-pink hover:text-white transition-all">✕ Clear filters</button>
              )}
              </div>

              {/* Sort */}
              <div className="space-y-1">
                <label className="hidden md:block text-[8px] font-black uppercase text-white/30 italic">Sort</label>
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
                <label className="hidden md:block text-[8px] font-black uppercase text-white/30 italic">&nbsp;</label>
                <button onClick={() => setShowShortlistOnly(v => !v)}
                  className={`flex items-center gap-2 px-3 py-2 border-2 font-black uppercase text-xs italic transition-all ${showShortlistOnly ? 'bg-brand-yellow text-black border-black' : 'bg-transparent text-white/50 border-white/20 hover:border-white hover:text-white'}`}>
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
                <div key={i} className="bg-brand-surface border-2 border-white/10 overflow-hidden animate-pulse">
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
                <div className="flex justify-center"><Smile height={110} className="opacity-70" /></div>
                <p className="text-white/40 font-black uppercase italic text-2xl">Shush.</p>
                <p className="text-white/20 font-black uppercase italic text-sm">Nothing matches your filters.</p>
                <p className="text-white/30 text-xs italic">Try adjusting genre, language or search term.</p>
                {filtersActive && <button onClick={clearFilters} className="mt-2 bg-white text-black px-6 py-3 font-black uppercase italic text-xs border-2 border-black hover:bg-brand-pink hover:text-white transition-all">Clear all filters</button>}
              </div>
            ) : filteredShows.map((show, index) => {
              const isFreeBlocked = !user && index >= 5;
              return (
              <div
                key={show.id}
                onClick={() => isFreeBlocked ? onNavigate('login') : handleShowSelect(show)}
                className={`group relative cursor-pointer bg-brand-surface border-2 border-white/30 overflow-hidden flex flex-col transition-all duration-300
                  ${isFreeBlocked ? 'opacity-40' : 'hover:border-brand-pink hover:shadow-[0_0_20px_rgba(239, 73, 134,0.3)]'}`}
              >
                {/* Lock overlay */}
                {isFreeBlocked && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70">
                    <span className="material-symbols-outlined text-brand-yellow text-4xl mb-2">lock</span>
                    <p className="text-brand-yellow font-black uppercase italic text-xs">Become a member to unlock</p>
                  </div>
                )}

                {/* IMAGE */}
                <div className="relative overflow-hidden" style={{aspectRatio:'2/3'}}>
                  {isSampleShow(show) && <SampleRibbon />}
                  {show.imageUrl ? (
                    <img src={show.imageUrl} alt={show.title}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full bg-brand-black flex items-center justify-center">
                      <span className="text-6xl font-black uppercase italic text-white/10">{(show.title)[0]}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

                  {/* TOP BADGES */}
                  <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                    {(() => {
                      const days = (show as any).created_at ? Math.floor((Date.now() - new Date((show as any).created_at).getTime()) / 86400000) : 999;
                      return days <= 10 ? <span className="text-[7px] font-black uppercase bg-white text-black px-2 py-0.5 italic border border-black">NEW</span> : null;
                    })()}
                    {!!String((show as any).script_scenario ?? '').trim() && (
                      <span className="text-[7px] font-black uppercase bg-brand-yellow text-black px-2 py-0.5 italic border border-black">SCRIPT EXCERPT</span>
                    )}
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
                      <button
                        type="button"
                        title={user ? 'Like' : 'Sign in to like'}
                        onClick={(e) => { e.stopPropagation(); if (user) onToggleFavorite(show.id); }}
                        className="flex items-center gap-1 text-[10px] text-white/50 font-black hover:text-white transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm text-brand-pink" style={{fontVariationSettings: user?.favorites?.includes(show.id) ? "'FILL' 1" : "'FILL' 0"}}>favorite</span>
                        {show.likesCount || 0}
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-white/30 text-[9px] font-black italic">{show.location}</span>
                      <span className="text-white/20 text-[9px]">·</span>
                      <span className="text-white/30 text-[9px] font-black italic">{show.productionYear}</span>
                      {!isSampleShow(show) && isShownTier(getTier(show)) && <Mascot tier={getTier(show)} height={16} className="ml-1" />}
                    </div>
                  </div>
                  {isSampleShow(show) ? (
                    <div className="mt-1 text-center bg-white/5 text-white/50 border border-white/15 py-1.5 text-[10px] font-black uppercase italic tracking-widest">
                      Sample listing · not a real offer
                    </div>
                  ) : (
                  <div className="mt-1 text-center bg-brand-yellow/10 text-brand-yellow group-hover:bg-brand-yellow group-hover:text-black border border-brand-yellow/40 py-1.5 text-[10px] font-black uppercase italic tracking-widest transition-all">
                    Tickle it — send inquiry →
                  </div>
                  )}
                </div>
              </div>
            )})}
          </section>
        </div>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default DiscoveryPage;
