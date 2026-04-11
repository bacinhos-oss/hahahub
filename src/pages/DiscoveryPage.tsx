
import React, { useState, useMemo } from 'react';
import Navigation from '../components/Navigation';
import { Page, Show, User } from '../types';

export const INITIAL_SHOWS: Show[] = [
  { 
    id: '1', 
    title: 'The Midnight Guffaw', 
    originalTitle: 'The Midnight Guffaw', 
    englishTitle: 'The Midnight Guffaw',
    author: 'J. Miller', 
    director: 'Alan Smithee',
    directorNotes: 'The staging should feel claustrophobic yet whimsical. Use minimal props to emphasize the dialogue.',
    originalProductionSolutions: 'Mechanical rotating floor in Act III. Glowing neon costumes that react to sound.',
    producerName: 'Global Comedy Collective',
    producerEmail: 'clearing@gcc.com',
    isDirectorMandatory: false,
    creativeTeamAvailability: 'Optional',
    genre: 'Satire', 
    subgenre: 'Political Farce',
    language: 'English',
    maleRoles: 2,
    femaleRoles: 3,
    canMergeRoles: true,
    duration: 95,
    hasIntermission: true,
    productionScale: 'Medium',
    isTouringFriendly: true,
    technicalComplexity: 'Medium',
    costumeComplexity: 'High',
    setComplexity: 'Medium',
    adaptationFlexibility: 'High',
    scalabilityNotes: 'Scales down to 3 actors with doubling for smaller venues.',
    stageType: 'Main Stage',
    techStaffLighting: 1,
    techStaffSound: 1,
    techStaffPrompter: 0,
    techStaffStagehands: 2,
    techStaffOther: '1 Pyrotechnics operator required for Act II.',
    performancesCount: 120,
    totalAudience: 15400,
    premiereDate: '2023-05-14',
    locationsPlayed: 'London, Edinburgh, Dublin, Berlin',
    boxOfficeIndicator: 'High',
    awards: 'Fringe First 2023, National Comedy Award 2024',
    audienceProfile: 'Ages 25-65, Urban, Political enthusiasts',
    productionYear: 2023,
    rightsHolder: 'Miller Arts Ltd & Global Comedy Collective',
    rightsStatus: 'Available',
    territoriesAvailable: 'Global',
    licensedCountries: 'UK, Ireland, France',
    exclusivityLevel: 'Exclusive',
    licenseType: 'License',
    territoryConflicts: 'None',
    mediaConflicts: 'Streaming series in development',
    premiereLocation: 'London, Royal Court',
    buyoutLocations: 'None',
    riskProfile: 'Proven hit',
    breakEvenThreshold: 'Medium',
    breakEvenPerformances: 40,
    programmingCompatibility: ['Commercial', 'Touring', 'Repertory'],
    translationsAvailable: 'English, German, French',
    translationRightsIncluded: true,
    isSponsorFriendly: true,
    isGroupSalesFriendly: true,
    rightsClearingSpeed: 'Medium',
    decisionMakerType: 'Single',
    exitScenarios: 'Termination after 1 year if GBO < 30%.',
    // Removed duplicate property originatingProducerTrack_Record to fix type error
    originatingProducerTrackRecord: '3 West End transfers, 10+ years in comedy.',
    transparencyScore: 98,
    location: 'United Kingdom', 
    humorType: 'Local Politics',
    internationalSuccessNotes: 'Highly successful in Fringe circuits.',
    licensingModel: 'Royalty-based',
    royaltyRange: '8-10%',
    advanceFee: '€3,500',
    budgetRange: 'Medium',
    likesCount: 452, 
    viewsCount: 12840, 
    inquiriesCount: 15, 
    synopsis: 'A biting satire about a parliament that accidentally outlaws gravity. What follows is a literal and figurative collapse of order as politicians attempt to hold sessions while hovering three feet above their seats.', 
    scriptExcerpt: 'MINISTER: "By the power of this wig, I declare the floor optional!"', 
    scriptScenario: `[ PAGE 1 ]
SCENE 1: THE PARLIAMENTARY CHAMBER
The chamber is circular. THE MINISTER sits in a chair that is suspended two inches off the ground. He looks worried.

MINISTER
(To himself)
If the gravity report leaks before lunch, we are all literally toast. Floating toast.

CLERK
Sir, the representative from the North is here. She’s... hovering.

MINISTER
Tell her to use the lead-lined boots! We have standards!

[ PAGE 2 ]
SCENE 2: THE LOBBY
A frantic energy. Journalists are holding onto marble pillars.

REPORTER
Minister! Is it true that the law of physics was repealed in a closed session?

MINISTER
Laws are laws, young man! If the majority votes for lightness, lightness is what the people shall have!

[ PAGE 3 ]
SCENE 3: THE ROOFTOP
The Minister stands at the edge. A pigeon flies past, then stops and starts walking on thin air.

MINISTER
See? Even the birds are confused. This is the ultimate comedy of errors. Or the ultimate tragedy of flight.

(Blackout)`,
    imageUrl: 'https://images.unsplash.com/photo-1514525253361-bee87184919a?auto=format&fit=crop&q=80&w=400&h=600',
    productionPhotos: []
  },
  { 
    id: '2', 
    title: 'The Quantum Quip', 
    originalTitle: 'Quanten-Witz', 
    author: 'Hans Berger', 
    director: 'M. Schmidt',
    producerName: 'Berlin Stage Lab',
    producerEmail: 'rights@berlinstagelab.de',
    isDirectorMandatory: true,
    creativeTeamAvailability: 'Optional',
    genre: 'Sci-Fi Comedy', 
    language: 'German',
    maleRoles: 1,
    femaleRoles: 1,
    canMergeRoles: false,
    duration: 80,
    hasIntermission: false,
    productionScale: 'Small',
    isTouringFriendly: true,
    technicalComplexity: 'High',
    costumeComplexity: 'Low',
    setComplexity: 'Low',
    adaptationFlexibility: 'Medium',
    scalabilityNotes: 'Highly portable, uses video mapping.',
    stageType: 'Black Box',
    techStaffLighting: 2,
    techStaffSound: 1,
    techStaffPrompter: 0,
    techStaffStagehands: 0,
    techStaffOther: 'Video tech required.',
    performancesCount: 45,
    totalAudience: 3200,
    premiereDate: '2024-01-20',
    locationsPlayed: 'Berlin, Munich, Hamburg',
    boxOfficeIndicator: 'Emerging',
    awards: 'Innovation in Arts Award 2024',
    audienceProfile: 'Millennials, Tech enthusiasts',
    productionYear: 2024,
    rightsHolder: 'Hans Berger',
    rightsStatus: 'Available',
    territoriesAvailable: 'Global (excl. Germany)',
    licensedCountries: 'Germany',
    exclusivityLevel: 'Semi-exclusive',
    licenseType: 'Option',
    premiereLocation: 'Volksbühne Berlin',
    buyoutLocations: 'None',
    riskProfile: 'Experimental',
    breakEvenThreshold: 'Low',
    breakEvenPerformances: 20,
    programmingCompatibility: ['Festival', 'Experimental'],
    translationsAvailable: 'German, English',
    translationRightsIncluded: true,
    isSponsorFriendly: true,
    isGroupSalesFriendly: false,
    rightsClearingSpeed: 'Fast',
    decisionMakerType: 'Single',
    exitScenarios: 'Standard termination.',
    originatingProducerTrackRecord: 'Emerging experimental collective.',
    transparencyScore: 92,
    location: 'Germany', 
    humorType: 'Universal',
    licensingModel: 'Flat fee',
    royaltyRange: 'None',
    advanceFee: '€2,000',
    budgetRange: 'Low',
    likesCount: 89, 
    viewsCount: 2400, 
    inquiriesCount: 4, 
    synopsis: 'A scientist accidentally splits himself into two versions: one extremely rude and one extremely polite. They must share a studio apartment while trying to win back their ex-fiancée.', 
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400&h=600',
    productionPhotos: []
  },
  { 
    id: '3', 
    title: "Ghost Writer's Grin", 
    originalTitle: "Il Sorriso del Fantasma", 
    author: 'Lucia Rosso', 
    director: 'F. Fellini II',
    producerName: 'Milano Teatro Greco',
    producerEmail: 'licensing@teatrogreco.it',
    isDirectorMandatory: false,
    creativeTeamAvailability: 'Not required',
    genre: 'Supernatural', 
    subgenre: 'Slapstick',
    language: 'Italian',
    maleRoles: 4,
    femaleRoles: 2,
    canMergeRoles: true,
    duration: 105,
    hasIntermission: true,
    productionScale: 'Large',
    isTouringFriendly: false,
    technicalComplexity: 'High',
    costumeComplexity: 'High',
    setComplexity: 'High',
    adaptationFlexibility: 'Low',
    scalabilityNotes: 'Requires complex rigging for ghostly effects.',
    stageType: 'Main Stage',
    techStaffLighting: 2,
    techStaffSound: 2,
    techStaffPrompter: 1,
    techStaffStagehands: 5,
    techStaffOther: 'SFX specialist.',
    performancesCount: 300,
    totalAudience: 85000,
    premiereDate: '2022-11-05',
    locationsPlayed: 'Rome, Milan, Venice, Florence',
    boxOfficeIndicator: 'High',
    awards: 'Best Comedy - Italian Theatre Awards 2023',
    audienceProfile: 'Families, General Public',
    productionYear: 2022,
    rightsHolder: 'Milano Teatro Greco',
    rightsStatus: 'Co-production Only',
    territoriesAvailable: 'USA, UK, France',
    licensedCountries: 'Italy',
    exclusivityLevel: 'Exclusive',
    licenseType: 'Co-production',
    premiereLocation: 'Teatro alla Scala',
    buyoutLocations: 'Milan',
    riskProfile: 'Proven hit',
    breakEvenThreshold: 'High',
    breakEvenPerformances: 100,
    programmingCompatibility: ['Commercial', 'Repertory'],
    translationsAvailable: 'Italian, English, French',
    translationRightsIncluded: true,
    isSponsorFriendly: true,
    isGroupSalesFriendly: true,
    rightsClearingSpeed: 'Slow',
    decisionMakerType: 'Committee',
    exitScenarios: 'Buy-out option after 3 years.',
    originatingProducerTrackRecord: '50+ years of institutional theatre history.',
    transparencyScore: 95,
    location: 'Italy', 
    humorType: 'Physical Comedy',
    licensingModel: 'Hybrid',
    royaltyRange: '12% GBO',
    advanceFee: '€10,000',
    budgetRange: 'High',
    likesCount: 1205, 
    viewsCount: 45000, 
    inquiriesCount: 28, 
    synopsis: 'A haunted house comedy where the ghost is a failed playwright who won’t let the new residents sleep until they finish his unproduced 500-page masterpiece.', 
    imageUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=400&h=600',
    productionPhotos: []
  },
  { 
    id: '4', 
    title: "Startup Cemetery", 
    originalTitle: "Kerevet", 
    author: 'Avi Cohen', 
    director: 'Y. Levi',
    producerName: 'Tel Aviv Fringe',
    producerEmail: 'contact@ta-fringe.org',
    isDirectorMandatory: false,
    creativeTeamAvailability: 'Optional',
    genre: 'Dark Comedy', 
    subgenre: 'Corporate Satire',
    language: 'Hebrew / English',
    maleRoles: 2,
    femaleRoles: 2,
    canMergeRoles: false,
    duration: 75,
    hasIntermission: false,
    productionScale: 'Small',
    isTouringFriendly: true,
    technicalComplexity: 'Low',
    costumeComplexity: 'Medium',
    setComplexity: 'Medium',
    adaptationFlexibility: 'High',
    scalabilityNotes: 'Can be played in office spaces or lobbies.',
    stageType: 'Arena',
    techStaffLighting: 1,
    techStaffSound: 1,
    techStaffPrompter: 0,
    techStaffStagehands: 1,
    techStaffOther: 'IT support for live app integration.',
    performancesCount: 65,
    totalAudience: 4800,
    premiereDate: '2024-03-12',
    locationsPlayed: 'Tel Aviv, Haifa, Jerusalem',
    boxOfficeIndicator: 'Medium',
    awards: 'Tel Aviv Fringe Excellence 2024',
    audienceProfile: 'Start-up workers, Entrepreneurs',
    productionYear: 2024,
    rightsHolder: 'Avi Cohen',
    rightsStatus: 'Available',
    territoriesAvailable: 'Global',
    licensedCountries: 'Israel',
    exclusivityLevel: 'Non-exclusive',
    licenseType: 'License',
    premiereLocation: 'ZOA House',
    buyoutLocations: 'None',
    riskProfile: 'Moderate risk',
    breakEvenThreshold: 'Low',
    breakEvenPerformances: 30,
    programmingCompatibility: ['Commercial', 'Festival'],
    translationsAvailable: 'Hebrew, English',
    translationRightsIncluded: true,
    isSponsorFriendly: true,
    isGroupSalesFriendly: true,
    rightsClearingSpeed: 'Fast',
    decisionMakerType: 'Single',
    exitScenarios: 'None.',
    originatingProducerTrackRecord: 'Acclaimed fringe producer with 3 international transfers.',
    transparencyScore: 90,
    location: 'Israel', 
    humorType: 'Universal',
    licensingModel: 'Royalty-based',
    royaltyRange: '8% GBO',
    advanceFee: '€1,500',
    budgetRange: 'Low',
    likesCount: 212, 
    viewsCount: 5600, 
    inquiriesCount: 9, 
    synopsis: 'A funeral home specializing in failed tech companies holds a "burial" for a social media app for pets. But the CEO won\'t let it die without one last pivot.', 
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=400&h=600',
    productionPhotos: []
  },
  { 
    id: '5', 
    title: "Last Laugh in Ljubljana", 
    originalTitle: "Zadnji smeh v Ljubljani", 
    author: 'Marko Vidmar', 
    director: 'S. Horvat',
    producerName: 'Ljubljana City Theatre',
    producerEmail: 'info@mgl.si',
    isDirectorMandatory: true,
    creativeTeamAvailability: 'Required',
    genre: 'Meta-Comedy', 
    subgenre: 'Farce',
    language: 'Slovenian',
    maleRoles: 2,
    femaleRoles: 1,
    canMergeRoles: false,
    duration: 90,
    hasIntermission: false,
    productionScale: 'Medium',
    isTouringFriendly: true,
    technicalComplexity: 'Medium',
    costumeComplexity: 'Medium',
    setComplexity: 'Medium',
    adaptationFlexibility: 'High',
    scalabilityNotes: 'Requires a working electric kettle and a toaster on stage.',
    stageType: 'Main Stage',
    techStaffLighting: 1,
    techStaffSound: 1,
    techStaffPrompter: 1,
    techStaffStagehands: 2,
    techStaffOther: 'None.',
    performancesCount: 150,
    totalAudience: 25000,
    premiereDate: '2023-09-22',
    locationsPlayed: 'Ljubljana, Maribor, Trieste, Zagreb',
    boxOfficeIndicator: 'High',
    awards: 'Borštnik Comedy Award 2024',
    audienceProfile: 'Ages 18-99, Cultural enthusiasts',
    productionYear: 2023,
    rightsHolder: 'MGL & Marko Vidmar',
    rightsStatus: 'Available',
    territoriesAvailable: 'Balkans, Central Europe',
    licensedCountries: 'Slovenia',
    exclusivityLevel: 'Exclusive',
    licenseType: 'License',
    premiereLocation: 'MGL Main Stage',
    buyoutLocations: 'Ljubljana',
    riskProfile: 'Proven hit',
    breakEvenThreshold: 'Medium',
    breakEvenPerformances: 50,
    programmingCompatibility: ['Repertory', 'Touring'],
    translationsAvailable: 'Slovenian, Croatian, English',
    translationRightsIncluded: true,
    isSponsorFriendly: true,
    isGroupSalesFriendly: true,
    rightsClearingSpeed: 'Medium',
    decisionMakerType: 'Committee',
    exitScenarios: 'Standard MGL terms.',
    originatingProducerTrackRecord: 'National institution with high quality standards.',
    transparencyScore: 99,
    location: 'Slovenia', 
    humorType: 'Language-based',
    licensingModel: 'Royalty-based',
    royaltyRange: '10% GBO',
    advanceFee: '€2,500',
    budgetRange: 'Medium',
    likesCount: 560, 
    viewsCount: 15000, 
    inquiriesCount: 12, 
    synopsis: 'Two washed-up actors try to perform a comedy during a city-wide power outage. As the audience waits in the dark, they realize the real comedy is their failing friendship.', 
    imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400&h=600',
    productionPhotos: []
  }
];

interface DiscoveryPageProps {
  onNavigate: (page: Page) => void;
  onLogout?: () => void;
  user?: User;
  onToggleFavorite: (id: string) => void;
  onUpdateStats: (id: string, type: 'view' | 'inquiry') => void;
  shows: Show[];
}

const DiscoveryPage: React.FC<DiscoveryPageProps> = ({ onNavigate, onLogout, user, onToggleFavorite, onUpdateStats, shows }) => {
  const [selectedShowId, setSelectedShowId] = useState<string | null>(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  
  const [filterGenre, setFilterGenre] = useState('All');
  const [filterCountry, setFilterCountry] = useState('All');
  const [filterCast, setFilterCast] = useState('All');
  const [filterRisk, setFilterRisk] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedShow = useMemo(() => shows.find(s => s.id === selectedShowId) || null, [shows, selectedShowId]);

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
      const totalCast = (show.maleRoles || 0) + (show.femaleRoles || 0);
      const matchesGenre = filterGenre === 'All' || show.genre === filterGenre || show.subgenre === filterGenre;
      const matchesCountry = filterCountry === 'All' || show.location === filterCountry;
      const matchesRisk = filterRisk === 'All' || show.riskProfile === filterRisk;
      const matchesCast = filterCast === 'All' || 
                         (filterCast === 'Solo/Duo' && totalCast <= 2) ||
                         (filterCast === 'Small (3-5)' && totalCast >= 3 && totalCast <= 5) ||
                         (filterCast === 'Large (6+)' && totalCast >= 6);
      const matchesSearch = show.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            show.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesGenre && matchesCountry && matchesRisk && matchesCast && matchesSearch;
    });

    return result.sort((a, b) => {
      if (sortBy === 'Newest') return (b.productionYear || 0) - (a.productionYear || 0);
      if (sortBy === 'Popular') return (b.likesCount || 0) - (a.likesCount || 0);
      if (sortBy === 'Trending') return (b.viewsCount || 0) - (a.viewsCount || 0);
      return 0;
    });
  }, [shows, filterGenre, filterCountry, filterRisk, filterCast, sortBy, searchQuery]);

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
        <div className="relative bg-brand-black border-4 border-white w-full max-w-7xl max-h-[90vh] overflow-y-auto shadow-neo-yellow animate-in zoom-in duration-300 text-white pb-12">
          <button onClick={() => setSelectedShowId(null)} className="absolute top-6 right-6 text-white hover:text-brand-pink transition-all z-20">
            <span className="material-symbols-outlined text-4xl font-black">close</span>
          </button>
          
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/3 border-b-4 lg:border-b-0 lg:border-r-4 border-white sticky top-0 h-auto lg:h-[90vh] bg-brand-black overflow-hidden z-10">
                <div className="w-full h-full relative">
                  <img src={selectedShow.imageUrl} className="w-full h-full object-cover" alt={selectedShow.title} />
                  <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
                    <div className="px-4 py-2 text-[10px] font-black uppercase italic border-2 border-black shadow-[4px_4px_0px_white] bg-brand-yellow text-black">
                      {selectedShow.riskProfile}
                    </div>
                  </div>
                </div>
            </div>

            <div className="flex-1 p-8 md:p-12 space-y-16">
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

                  {/* SYNOPSIS - MOVED HIGHER AS REQUESTED */}
                  <section className="space-y-6">
                    <h4 className="text-xl font-black uppercase italic text-brand-pink">SYNOPSIS</h4>
                    <p className="text-gray-200 text-2xl leading-relaxed italic border-l-8 border-brand-pink pl-8 bg-white/5 py-4">{selectedShow.synopsis}</p>
                  </section>

                  {/* 00. RIGHTS & IDENTITY */}
                  <section className="space-y-8">
                     <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-cyan italic">00. RIGHTS & IDENTITY</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-brand-surface border-4 border-white p-6 shadow-neo-cyan">
                           <p className="text-[9px] font-black uppercase text-brand-cyan mb-1 tracking-widest italic">Producer / Company</p>
                           <p className="text-lg font-black uppercase italic">{selectedShow.producerName}</p>
                        </div>
                        <div className="bg-brand-surface border-4 border-white p-6">
                           <p className="text-[9px] font-black uppercase text-brand-yellow mb-1 tracking-widest italic">Copyright Holder</p>
                           <p className="text-lg font-black uppercase italic">{selectedShow.rightsHolder}</p>
                        </div>
                        <div className="bg-brand-surface border-4 border-white p-6">
                           <p className="text-[9px] font-black uppercase text-brand-pink mb-1 tracking-widest italic">License Territories</p>
                           <p className="text-xs font-black uppercase italic text-white/60">{selectedShow.licensedCountries || "Global (Unrestricted)"}</p>
                        </div>
                     </div>
                  </section>

                  {/* 01. CREATIVE ENGINE */}
                  <section className="space-y-8">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink italic">01. CREATIVE ENGINE</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div className="space-y-8">
                        <div className="space-y-4">
                           <div className="flex gap-4">
                             <div className="flex-1 border-l-4 border-brand-pink pl-4 py-2 bg-white/5">
                                <p className="text-[8px] font-black uppercase text-brand-pink italic">Playwright</p>
                                <p className="text-xl font-black italic">{selectedShow.author}</p>
                             </div>
                             <div className="flex-1 border-l-4 border-brand-cyan pl-4 py-2 bg-white/5">
                                <p className="text-[8px] font-black uppercase text-brand-cyan italic">Director</p>
                                <p className="text-xl font-black italic uppercase">{selectedShow.director || "TBD"}</p>
                             </div>
                           </div>
                           <div className="border-l-4 border-brand-yellow pl-4 py-2 bg-white/5">
                              <p className="text-[8px] font-black uppercase text-brand-yellow italic">Style / Subgenre</p>
                              <p className="text-lg font-black italic text-brand-yellow/80">{selectedShow.subgenre || "N/A"}</p>
                           </div>
                        </div>
                        <div>
                           <p className="text-[9px] font-black uppercase text-gray-500 mb-2 italic">Cast Profile</p>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="bg-black/40 p-4 border border-white/10 flex justify-between items-center">
                                 <span className="text-xs font-black uppercase italic text-brand-yellow">Male</span>
                                 <span className="text-2xl font-black">{selectedShow.maleRoles}</span>
                              </div>
                              <div className="bg-black/40 p-4 border border-white/10 flex justify-between items-center">
                                 <span className="text-xs font-black uppercase italic text-brand-pink">Female</span>
                                 <span className="text-2xl font-black">{selectedShow.femaleRoles}</span>
                              </div>
                           </div>
                        </div>
                      </div>
                      <div className="bg-brand-surface border-4 border-white p-8 space-y-6 shadow-neo-magenta">
                         <div className="border-b-2 border-white/10 pb-4">
                            <p className="text-[10px] font-black uppercase text-brand-pink italic mb-2">Director's Vision Notes</p>
                            <p className="text-sm italic leading-relaxed text-gray-300">{selectedShow.directorNotes || "Standard staging permitted."}</p>
                         </div>
                         <div>
                            <p className="text-[10px] font-black uppercase text-brand-cyan italic mb-2">Original Staging Solutions</p>
                            <p className="text-sm italic leading-relaxed text-gray-300">{selectedShow.originalProductionSolutions || "No exclusive technical hardware required."}</p>
                         </div>
                      </div>
                    </div>
                  </section>

                  {/* 02. TECHNICAL STACK & SCALE - UPDATED GRAPHICS */}
                  <section className="space-y-8">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-yellow italic">02. TECHNICAL STACK & PRODUCTION SCALE</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                       <div className="bg-brand-surface border-4 border-white p-6 text-center shadow-neo-cyan">
                          <p className="text-[8px] font-black text-gray-500 uppercase italic">Lighting Staff</p>
                          <p className="text-2xl font-black text-brand-cyan">{selectedShow.techStaffLighting}</p>
                       </div>
                       <div className="bg-brand-surface border-4 border-white p-6 text-center shadow-neo-magenta">
                          <p className="text-[8px] font-black text-gray-500 uppercase italic">Sound Staff</p>
                          <p className="text-2xl font-black text-brand-pink">{selectedShow.techStaffSound}</p>
                       </div>
                       <div className="bg-brand-surface border-4 border-white p-6 text-center shadow-neo-yellow">
                          <p className="text-[8px] font-black text-gray-500 uppercase italic">Stagehands</p>
                          <p className="text-2xl font-black text-brand-yellow">{selectedShow.techStaffStagehands}</p>
                       </div>
                       <div className="bg-brand-surface border-4 border-white p-6 text-center shadow-neo-white">
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
                  </section>

                  {/* 03. MARKET PERFORMANCE */}
                  <section className="space-y-8">
                    <div className="flex items-center gap-6">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white italic whitespace-nowrap">03. MARKET PERFORMANCE</h4>
                       <div className="h-1 flex-1 bg-white/10"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-8">
                        <div className="bg-brand-surface border-2 border-white/10 p-6 flex items-center justify-between">
                           <div>
                              <p className="text-[8px] font-black text-gray-500 uppercase italic">Premiere Date</p>
                              <p className="text-lg font-black text-brand-yellow">{selectedShow.premiereDate || "N/A"}</p>
                           </div>
                           <span className="material-symbols-outlined text-brand-yellow">calendar_today</span>
                        </div>
                        <div className="bg-brand-surface border-2 border-white/10 p-6 flex items-center justify-between">
                           <div>
                              <p className="text-[8px] font-black text-gray-500 uppercase italic">Performances</p>
                              <p className="text-lg font-black text-brand-cyan">{selectedShow.performancesCount.toLocaleString()}</p>
                           </div>
                           <span className="material-symbols-outlined text-brand-cyan">theater_comedy</span>
                        </div>
                        <div className="bg-brand-surface border-2 border-white/10 p-6 flex items-center justify-between">
                           <div>
                              <p className="text-[8px] font-black text-gray-500 uppercase italic">Total Audience</p>
                              <p className="text-lg font-black text-brand-pink">{(selectedShow.totalAudience || 0).toLocaleString()}</p>
                           </div>
                           <span className="material-symbols-outlined text-brand-pink">groups</span>
                        </div>
                        <div className="bg-brand-surface border-2 border-white/10 p-6 flex items-center justify-between">
                           <div>
                              <p className="text-[8px] font-black text-gray-500 uppercase italic">Box Office</p>
                              <p className="text-lg font-black text-white">{selectedShow.boxOfficeIndicator}</p>
                           </div>
                           <span className="material-symbols-outlined text-white/40">trending_up</span>
                        </div>
                    </div>
                  </section>

                  {/* 04. COMMERCIAL BIBLE - REMOVED FINANCIAL PROJECTIONS AS PER REQUEST */}
                  <section className="space-y-8">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink italic">04. COMMERCIAL BIBLE & CLEARANCE</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6">
                       <div className="bg-brand-surface border-4 border-white p-6">
                          <p className="text-[8px] font-black text-brand-pink uppercase italic mb-1">License Type</p>
                          <p className="text-lg font-black uppercase italic">{selectedShow.licenseType}</p>
                       </div>
                       <div className="bg-brand-surface border-4 border-white p-6">
                          <p className="text-[8px] font-black text-brand-pink uppercase italic mb-1">Model</p>
                          <p className="text-lg font-black uppercase italic">{selectedShow.licensingModel}</p>
                       </div>
                       <div className="bg-brand-surface border-4 border-white p-6">
                          <p className="text-[8px] font-black text-brand-pink uppercase italic mb-1">Royalties</p>
                          <p className="text-lg font-black uppercase italic">{selectedShow.royaltyRange || "Standard"}</p>
                       </div>
                       <div className="bg-brand-surface border-4 border-white p-6">
                          <p className="text-[8px] font-black text-brand-pink uppercase italic mb-1">Advance Fee</p>
                          <p className="text-lg font-black uppercase italic text-brand-yellow">{selectedShow.advanceFee || "€0"}</p>
                       </div>
                       <div className="bg-brand-surface border-4 border-white p-6">
                          <p className="text-[8px] font-black text-brand-pink uppercase italic mb-1">Exclusivity</p>
                          <p className="text-lg font-black uppercase italic">{selectedShow.exclusivityLevel}</p>
                       </div>
                    </div>
                  </section>

                  {/* SCRIPT PREVIEW - HIGH CONTRAST */}
                  <section className="space-y-4 bg-white p-10 border-8 border-black shadow-neo-yellow">
                     <div className="flex justify-between items-center border-b-4 border-black pb-4 mb-8">
                        <h4 className="text-2xl font-black uppercase italic text-black">SCRIPT SCENARIO EXCERPT (3 PAGES)</h4>
                        <span className="bg-black text-white px-3 py-1 text-[10px] font-black uppercase italic">PUBLIC PREVIEW</span>
                     </div>
                     <div className="bg-white text-black font-mono text-base whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto pr-6 italic font-bold">
                        {selectedShow.scriptScenario || "No public script preview available for this asset."}
                     </div>
                  </section>

                  {/* CTA SECTION */}
                  <div className="bg-brand-surface border-8 border-brand-cyan p-12 text-center space-y-10 shadow-neo-magenta">
                      <div className="space-y-2">
                        <h4 className="text-5xl font-black uppercase italic tracking-tighter">Initiate Rights Clearing</h4>
                        <p className="text-sm font-black uppercase italic text-brand-cyan">Estimated Advance: {selectedShow.advanceFee || "€0"} • Clearing Speed: {selectedShow.rightsClearingSpeed}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setSelectedShowId(null);
                          setIsInquiryOpen(true);
                        }}
                        className="bg-brand-yellow text-black px-16 py-8 font-black uppercase border-4 border-black shadow-[8px_8px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all italic tracking-[0.4em] text-2xl"
                      >
                        Send Inquiry
                      </button>
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
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
        <div className="absolute inset-0 bg-brand-black/95 backdrop-blur-md" onClick={() => setIsInquiryOpen(false)}></div>
        <div className="relative bg-brand-surface border-8 border-white w-full max-w-2xl p-12 shadow-neo-cyan animate-in zoom-in duration-300">
          <button onClick={() => setIsInquiryOpen(false)} className="absolute top-6 right-6 text-white hover:text-brand-pink transition-all">
            <span className="material-symbols-outlined text-4xl font-black">close</span>
          </button>

          {inquirySuccess ? (
            <div className="text-center py-20 space-y-8 animate-in zoom-in">
              <div className="w-24 h-24 bg-brand-cyan border-4 border-black mx-auto flex items-center justify-center rotate-3 shadow-neo-magenta">
                <span className="material-symbols-outlined text-black text-6xl font-black">send</span>
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-black uppercase italic text-white">Signal Transmitted!</h2>
                <p className="text-brand-cyan font-bold uppercase tracking-[0.2em] text-sm italic">The producer has been notified of your interest.</p>
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
            <div className="space-y-10 text-white">
              <div className="space-y-2">
                <h3 className="text-4xl font-black uppercase italic tracking-tighter">Initiate Rights Inquiry</h3>
                <p className="text-brand-cyan text-xs font-black uppercase tracking-widest italic">Asset: {selectedShow?.title}</p>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 italic">Full Name</label>
                    <input type="text" defaultValue={user?.name} className="w-full bg-brand-black border-2 border-white/20 p-4 text-white font-bold uppercase outline-none focus:border-brand-cyan" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 italic">Email Address</label>
                    <input type="email" defaultValue={`${user?.name?.toLowerCase()}@producer.com`} className="w-full bg-brand-black border-2 border-white/20 p-4 text-white font-bold outline-none focus:border-brand-cyan" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 italic">Message / Production Pitch</label>
                  <textarea rows={5} placeholder="Tell the rights holder about your planned production, venue, and dates..." className="w-full bg-brand-black border-2 border-white/20 p-6 text-white italic outline-none focus:border-brand-pink"></textarea>
                </div>
              </div>

              <button 
                onClick={() => {
                  setInquirySuccess(true);
                  onUpdateStats(selectedShowId || '', 'inquiry');
                }}
                className="w-full bg-brand-pink text-white font-black uppercase py-6 border-4 border-black shadow-neo-yellow hover:bg-black transition-all italic tracking-[0.2em] text-xl"
              >
                Send Encrypted Signal
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-black">
      {renderDetailModal()}
      {renderInquiryModal()}
      <Navigation activePage="discovery" onNavigate={onNavigate} onLogout={onLogout} user={user} />
      
      <main className="pt-32 pb-20 px-6 md:px-12 flex-1">
        <div className="max-w-7xl mx-auto space-y-16">
          <section className="space-y-10 text-white">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <h1 className="text-4xl sm:text-6xl md:text-9xl font-black uppercase leading-[0.8] tracking-tighter italic group">
                Comedy <span className="text-brand-yellow">Vault</span>
              </h1>
              <div className="flex items-center gap-4 bg-brand-surface border-2 border-white/20 p-4 shadow-neo-cyan">
                <span className="material-symbols-outlined text-brand-cyan">sort</span>
                <div className="flex flex-col">
                  <label className="text-[8px] font-black uppercase text-white/40 italic">Sort By</label>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent border-none text-white font-black uppercase italic text-sm focus:ring-0 p-0 cursor-pointer"
                  >
                    <option value="Newest" className="bg-brand-black">Newest Assets</option>
                    <option value="Popular" className="bg-brand-black">Most Liked</option>
                    <option value="Trending" className="bg-brand-black">Trending Now</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 border-y-4 border-white/10 py-8">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/40 italic">Comedy Type</label>
                    <select value={filterGenre} onChange={(e) => setFilterGenre(e.target.value)} className="w-full bg-brand-black border-2 border-white/20 text-white font-black text-xs uppercase p-2 focus:border-brand-pink italic">
                        {allGenres.map(g => <option key={g} value={g}>{g}</option>)}
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
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/40 italic">Search</label>
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="TITLE / AUTHOR..." className="w-full bg-brand-black border-2 border-white/20 text-white font-black text-xs uppercase p-2 focus:border-white italic" />
                </div>
            </div>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 pb-24">
            {filteredShows.map((show) => (
              <div key={show.id} onClick={() => handleShowSelect(show)} className="group relative cursor-pointer bg-brand-surface border-4 border-white hover:shadow-neo-yellow transition-all overflow-hidden flex flex-col">
                <div className="aspect-[4/6] relative overflow-hidden">
                  <img src={show.imageUrl} alt={show.title} className="w-full h-full object-cover transition-all duration-700 grayscale group-hover:grayscale-0 scale-105 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent opacity-80 group-hover:opacity-100"></div>
                  <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
                     <span className="px-2 py-0.5 text-[8px] font-black uppercase italic border border-black shadow-[2px_2px_0px_white] bg-brand-yellow text-black">{show.duration}m</span>
                     <span className="px-2 py-0.5 text-[8px] font-black uppercase italic border border-black shadow-[2px_2px_0px_white] bg-brand-cyan text-black">{show.location}</span>
                  </div>
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <div className="space-y-2">
                      <p className="text-brand-pink text-[9px] font-black uppercase italic tracking-[0.2em]">{show.genre} {show.subgenre ? `• ${show.subgenre}` : ''}</p>
                      <h3 className="text-2xl font-black uppercase italic leading-[0.85] text-white group-hover:text-brand-yellow transition-colors">{show.title}</h3>
                    </div>
                  </div>
                </div>
                <div className="bg-brand-black border-t-4 border-white p-4 flex items-center justify-between">
                   <div className="flex items-center gap-2 group/metric">
                      <span className="material-symbols-outlined text-brand-cyan text-sm">visibility</span>
                      <span className="text-[10px] font-black text-white/60 group-hover/metric:text-brand-cyan transition-colors">{show.viewsCount.toLocaleString()}</span>
                   </div>
                   <div className="flex items-center gap-2 group/metric">
                      <span className="material-symbols-outlined text-brand-pink text-sm">favorite</span>
                      <span className="text-[10px] font-black text-white/60 group-hover/metric:text-brand-pink transition-colors">{show.likesCount.toLocaleString()}</span>
                   </div>
                   <div className="text-[8px] font-black text-white/20 uppercase italic">
                      EST. {show.productionYear}
                   </div>
                </div>
              </div>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
};

export default DiscoveryPage;
