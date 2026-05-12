import React, { useState, useMemo, useEffect } from 'react';
import Navigation from '../components/Navigation';
import ShareButton from '../components/ShareButton';
import { supabase } from '../lib/supabase';
import { Page, User, Show } from '../types';

interface SubscriptionPageProps {
  onNavigate: (page: Page) => void;
  onLogout?: () => void;
  user?: User;
  onToggleFavorite: (id: string) => void;
  shows: Show[];
  onDeleteShow: (id: string) => void;
  onUpdateShow: (show: Show) => void;
}

const CONTRACT_TEMPLATES = [
  {
    title: 'Standard Licensing Agreement', tag: 'Essential', icon: 'description', color: 'brand-cyan',
    desc: 'Basic template for granting performance rights to a foreign producer. Covers territory, duration, royalties and exclusivity.',
    content: `THEATRICAL LICENSING AGREEMENT

This Agreement is entered into as of [DATE] between:

LICENSOR: [Name/Company], hereinafter "Rights Holder"
Address: [Address], [Country] | Email: [Email]

LICENSEE: [Name/Company], hereinafter "Producer"  
Address: [Address], [Country] | Email: [Email]

1. GRANT OF RIGHTS
The Rights Holder grants the Producer a license to produce and perform "[SHOW TITLE]" under:
Territory: [Country/Region] | Language: [Language]
Duration: [START DATE] to [END DATE] | Max Performances: [NUMBER]

2. FINANCIAL TERMS
Royalty: [X]% of gross box office per performance
Minimum Guarantee: EUR [AMOUNT] per performance
Advance Payment: EUR [AMOUNT] (non-refundable, due upon signing)
Payment: Within 30 days after each performance

3. ARTISTIC REQUIREMENTS
- Present the Work substantially as written
- No material changes without written consent
- Credit original author and production company in all materials
- Submit all marketing materials for approval prior to publication

4. CREDITS
All programs, posters, and advertising must include:
"[SHOW TITLE] is presented by arrangement with [RIGHTS HOLDER NAME]"
"Originally produced by [ORIGINAL PRODUCTION COMPANY]"

5. TERMINATION
Either party may terminate with 30 days written notice for material breach uncured within 14 days.

6. GOVERNING LAW: Laws of [COUNTRY]

Rights Holder: _________________________ Date: _________
Producer: _________________________ Date: _________`
  },
  {
    title: 'Option Agreement', tag: 'First Step', icon: 'timer', color: 'brand-pink',
    desc: 'Grants a producer exclusive rights to negotiate a full license within a set period — standard first step in any deal.',
    content: `THEATRICAL OPTION AGREEMENT

This Option Agreement is made as of [DATE] between:
RIGHTS HOLDER: [Name/Company]
PRODUCER: [Name/Company]
WORK: "[SHOW TITLE]" written by [AUTHOR]

1. OPTION GRANT
For EUR [OPTION FEE] (receipt acknowledged), Rights Holder grants Producer an exclusive option to negotiate and execute a full Licensing Agreement.

2. OPTION PERIOD
Valid for [NUMBER] months from signing.
Extension: [NUMBER] additional months upon payment of EUR [EXTENSION FEE].

3. OPTION FEE
EUR [AMOUNT] — non-refundable, applicable toward advance if full license executed.

4. PRODUCER'S RIGHTS DURING OPTION
- Develop production plans and approach venues
- Apply for grants and funding
- Announce production as "in development"

5. EXCLUSIVITY
Rights Holder will not grant any other producer rights in [TERRITORY] during the option period.

6. EXPIRATION
If not exercised within the option period, all rights revert to Rights Holder.

Rights Holder: _________________________ Date: _________
Producer: _________________________ Date: _________`
  },
  {
    title: 'Co-Production Agreement', tag: 'Popular', icon: 'handshake', color: 'brand-yellow',
    desc: 'Framework for joint productions between two or more producers across different territories.',
    content: `CO-PRODUCTION AGREEMENT

This Agreement is entered into as of [DATE] between:
CO-PRODUCER A: [Name/Company], [Country]
CO-PRODUCER B: [Name/Company], [Country]
PRODUCTION: "[SHOW TITLE]"

1. FINANCIAL CONTRIBUTIONS
Co-Producer A: [X]% = EUR [AMOUNT]
Co-Producer B: [X]% = EUR [AMOUNT]
Total Budget: EUR [TOTAL AMOUNT]

2. REVENUE SHARING (after all production costs)
Co-Producer A: [X]% | Co-Producer B: [X]%

3. CREATIVE RESPONSIBILITIES
Co-Producer A: [e.g., artistic direction, casting, script]
Co-Producer B: [e.g., venue, local marketing, technical]

4. TERRITORIES
Co-Producer A: [TERRITORY A] | Co-Producer B: [TERRITORY B]
Joint decisions required for all other territories.

5. CREDITS
All materials: "A co-production by [COMPANY A] and [COMPANY B]"
Equal and simultaneous billing.

6. DECISION MAKING
Major decisions require written consent of both parties.

7. DISPUTE RESOLUTION
Good faith negotiation → Mediation → ICC Arbitration.

Co-Producer A: _________________________ Date: _________
Co-Producer B: _________________________ Date: _________`
  },
  {
    title: 'Translation Rights Agreement', tag: 'Useful', icon: 'translate', color: 'brand-cyan',
    desc: 'Covers the rights to translate and adapt a script into another language for local production.',
    content: `TRANSLATION RIGHTS AGREEMENT

Made as of [DATE] between:
RIGHTS HOLDER: [Name/Company]
PRODUCER: [Name/Company]
ORIGINAL WORK: "[ORIGINAL TITLE]" by [AUTHOR] in [ORIGINAL LANGUAGE]

1. GRANT OF RIGHTS
Rights Holder grants Producer the right to commission and use a [TARGET LANGUAGE] translation for theatrical production in [TERRITORY].

2. TRANSLATION
Translator: [NAME] (approved by Rights Holder)
Translator fee: EUR [AMOUNT]

3. OWNERSHIP
Translation jointly owned by both parties.
Neither may use it without the other's written consent.

4. FINANCIAL TERMS
Translation royalty: [X]% of gross box office
Translator royalty: [X]% (included or additional)

5. QUALITY APPROVAL
Rights Holder may review and approve final translation before production.

6. CREDITS
"[ORIGINAL TITLE] by [ORIGINAL AUTHOR]"
"[TARGET LANGUAGE] translation by [TRANSLATOR NAME]"

7. REVERSION
If not produced within [NUMBER] months, translation rights revert to Rights Holder.

Rights Holder: _________________________ Date: _________
Producer: _________________________ Date: _________`
  },
  {
    title: 'Touring Rights Agreement', tag: 'Useful', icon: 'tour', color: 'brand-yellow',
    desc: 'Specific terms for productions that will tour across multiple venues or territories.',
    content: `TOURING RIGHTS AGREEMENT

Made as of [DATE] between:
RIGHTS HOLDER: [Name/Company]
TOURING PRODUCER: [Name/Company]
WORK: "[SHOW TITLE]"

1. APPROVED TOUR VENUES
1. [VENUE/CITY], [COUNTRY] — [FROM] to [TO]
2. [VENUE/CITY], [COUNTRY] — [FROM] to [TO]
3. [VENUE/CITY], [COUNTRY] — [FROM] to [TO]
Additional venues require written approval.

2. FINANCIAL TERMS
Royalty: [X]% of gross box office per venue
Minimum per venue: EUR [AMOUNT]
Settlement: Within 14 days after final performance at each venue.

3. PRODUCTION STANDARDS
- Maintain artistic standards of the approved production
- No principal cast substitution without written approval

4. INSURANCE
Comprehensive general liability: min EUR [AMOUNT] per occurrence.
Rights Holder named as additional insured.

5. REPORTING
Box office reports due within 7 days of final performance at each venue.

Rights Holder: _________________________ Date: _________
Touring Producer: _________________________ Date: _________`
  },
  {
    title: 'Letter of Intent (LOI)', tag: 'First Step', icon: 'mail', color: 'brand-pink',
    desc: 'Non-binding document to initiate formal negotiations — signals serious interest before full contract.',
    content: `LETTER OF INTENT

[DATE]

To: [RIGHTS HOLDER NAME]
From: [PRODUCER NAME / COMPANY]
Re: Expression of Interest — "[SHOW TITLE]"

Dear [RIGHTS HOLDER NAME],

[PRODUCER COMPANY] ("Producer") expresses formal interest in licensing "[SHOW TITLE]" by [AUTHOR].

PROPOSED TERMS:
Territory: [COUNTRY/REGION] | Language: [LANGUAGE]
Planned Premiere: [APPROXIMATE DATE]
Estimated Performances: [NUMBER]
Proposed Venue: [VENUE]

Financial Proposal:
- Royalty: [X]% of gross box office
- Advance: EUR [AMOUNT]
- Minimum guarantee: EUR [AMOUNT] per performance

Producer Background:
[BRIEF DESCRIPTION OF COMPANY AND TRACK RECORD]

NON-BINDING NATURE:
This LOI is a non-binding expression of intent. Neither party is legally obligated until a formal agreement is signed.

NEXT STEPS: We propose a call on [DATE] to discuss terms.

Sincerely,
[PRODUCER NAME] | [TITLE] | [COMPANY] | [EMAIL] | [PHONE]`
  },
]

const downloadContract = (title: string, content: string) => {
  const element = document.createElement('a')
  const file = new Blob([content], { type: 'text/plain' })
  element.href = URL.createObjectURL(file)
  element.download = title.replace(/[^a-z0-9]/gi, '_') + '_HAHAHUB_Template.txt'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

const inp = "w-full bg-brand-black border-2 border-white/20 px-4 py-3 text-white font-bold text-sm outline-none focus:border-brand-cyan";
const sel = "w-full bg-brand-black border-2 border-white/20 px-4 py-3 text-white font-black text-xs uppercase italic outline-none focus:border-brand-cyan";
const lbl = "block text-[9px] font-black uppercase text-gray-500 mb-1 italic";

const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ onNavigate, onLogout, user, onToggleFavorite, shows, onDeleteShow, onUpdateShow }) => {
  const [manageShow, setManageShow] = useState<Show | null>(null);
  const [editForm, setEditForm] = useState<Partial<Show>>({});
  const [editPhotoPreviews, setEditPhotoPreviews] = useState<(string | null)[]>([null, null, null]);
  const editPhotoRef0 = React.useRef<HTMLInputElement>(null);
  const editPhotoRef1 = React.useRef<HTMLInputElement>(null);
  const editPhotoRef2 = React.useRef<HTMLInputElement>(null);
  const editPhotoRefs = [editPhotoRef0, editPhotoRef1, editPhotoRef2];
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'assets' | 'inquiries' | 'profile'>('assets');
  const [profileForm, setProfileForm] = useState({ bio: '', website: '', location_city: '', festivals: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [realStats, setRealStats] = useState({ totalViews: 0, totalInquiries: 0, totalLikes: 0 });
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [tickledToast, setTickledToast] = useState<{show: boolean, showTitle: string}>({show: false, showTitle: ''});

  // Royalty Calculator state
  const [calcTicketPrice, setCalcTicketPrice] = useState(25);
  const [calcSeats, setCalcSeats] = useState(200);
  const [calcOccupancy, setCalcOccupancy] = useState(75);
  const [calcPerformances, setCalcPerformances] = useState(10);
  const [calcRoyalty, setCalcRoyalty] = useState(8);
  const calcGrossPerShow = calcTicketPrice * calcSeats * (calcOccupancy / 100);
  const calcTotalGross = calcGrossPerShow * calcPerformances;
  const calcTotalRoyalty = calcTotalGross * (calcRoyalty / 100);
  const calcROI = 99; // annual membership cost
  const calcMultiplier = calcTotalRoyalty > 0 ? (calcTotalRoyalty / calcROI).toFixed(1) : '0';

  useEffect(() => {
    if (user?.id) {
      loadMyRealStats();
      loadInquiries();
      supabase.from('profiles').select('bio, website, location_city, festivals').eq('id', user.id).maybeSingle().then(({ data }) => {
        if (data) setProfileForm({ bio: data.bio || '', website: data.website || '', location_city: data.location_city || '', festivals: data.festivals || '' });
      });
    }
  }, [user]);

  const loadMyRealStats = async () => {
    const { data: myShows } = await supabase.from('shows').select('views_count, inquiries_count, likes_count').eq('user_id', user?.id);
    if (myShows && myShows.length > 0) {
      setRealStats({
        totalViews: myShows.reduce((sum, s) => sum + (s.views_count || 0), 0),
        totalInquiries: myShows.reduce((sum, s) => sum + (s.inquiries_count || 0), 0),
        totalLikes: myShows.reduce((sum, s) => sum + (s.likes_count || 0), 0),
      });
    }
  };

  const loadInquiries = async () => {
    const { data } = await supabase
      .from('inquiries')
      .select('*')
      .eq('producer_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) {
      setInquiries(data);
      const unread = data.filter((inq: any) => !inq.is_read);
      const toastKey = 'hahahub_toast_shown_' + user?.id;
      const alreadyShown = sessionStorage.getItem(toastKey);
      if (unread.length > 0 && !alreadyShown) {
        setTickledToast({ show: true, showTitle: unread[0].show_title });
        sessionStorage.setItem(toastKey, '1');
        setTimeout(() => setTickledToast({ show: false, showTitle: '' }), 5000);
        // Send email notification for new inquiries
        unread.forEach(async (inq: any) => {
          if (!inq.email_sent && user?.email) {
            await fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'inquiry',
                to: user.email,
                data: {
                  producerName: user.name,
                  buyerName: inq.buyer_name || 'A Producer',
                  buyerEmail: inq.buyer_email || '',
                  showTitle: inq.show_title || '',
                  message: inq.message || '',
                },
              }),
            }).catch(console.error);
          }
        });
      }
    }
  };

  const markAsRead = async (inquiryId: string) => {
    // Optimistic update first — instant UI feedback
    setInquiries(prev => prev.map(inq => inq.id === inquiryId ? { ...inq, is_read: true } : inq));
    // Then persist to Supabase
    await supabase.from('inquiries').update({ is_read: true }).eq('id', inquiryId);
  };

  const daysRemaining = useMemo(() => {
    if (!user?.subscription?.expiryDate) return 365;
    const expiry = new Date(user.subscription.expiryDate);
    if (isNaN(expiry.getTime())) return 365;
    return Math.max(0, Math.ceil((expiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
  }, [user]);

  const subscriptionProgress = useMemo(() => {
    const total = 365;
    return ((total - Math.min(total, daysRemaining)) / total) * 100;
  }, [daysRemaining]);

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <button onClick={() => onNavigate('login')} className="bg-brand-yellow text-black px-12 py-5 font-black uppercase border-4 border-white shadow-neo-magenta italic">Login to View Hub</button>
      </div>
    );
  }

  const userUploads = shows.filter((s: Show) => (s as any).user_id === user.id || user.uploadedShowIds?.includes(s.id));

  const stats = [
    { label: 'Assets Deployed', value: userUploads.length, icon: 'upload', color: 'brand-cyan' },
    { label: 'Asset Views', value: realStats.totalViews.toLocaleString(), icon: 'visibility', color: 'brand-yellow' },
    { label: 'Inquiry Rate', value: realStats.totalInquiries > 0 ? ((realStats.totalInquiries / (realStats.totalViews || 1)) * 100).toFixed(1) + '%' : '0%', icon: 'insights', color: 'brand-pink' },
    { label: 'Active Favs', value: realStats.totalLikes.toLocaleString(), icon: 'favorite', color: 'white' },
  ];

  const openManage = (show: Show) => { setManageShow(show); setEditForm({ ...show }); setEditPhotoPreviews([show.productionPhotos?.[0] || null, show.productionPhotos?.[1] || null, show.productionPhotos?.[2] || null]); };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!manageShow) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('shows').update({
        title: editForm.title, author: editForm.author, director: editForm.director,
        director_notes: editForm.directorNotes, original_production_solutions: editForm.originalProductionSolutions,
        synopsis: editForm.synopsis, genre: editForm.genre, subgenre: editForm.subgenre,
        language: editForm.language, location: editForm.location,
        duration: Number(editForm.duration), male_roles: Number(editForm.maleRoles),
        female_roles: Number(editForm.femaleRoles), can_merge_roles: editForm.canMergeRoles,
        has_intermission: editForm.hasIntermission, is_director_mandatory: editForm.isDirectorMandatory,
        creative_team_availability: editForm.creativeTeamAvailability,
        production_scale: editForm.productionScale, is_touring_friendly: editForm.isTouringFriendly,
        technical_complexity: editForm.technicalComplexity, costume_complexity: editForm.costumeComplexity,
        set_complexity: editForm.setComplexity, adaptation_flexibility: editForm.adaptationFlexibility,
        scalability_notes: editForm.scalabilityNotes, stage_type: editForm.stageType,
        tech_staff_lighting: Number(editForm.techStaffLighting), tech_staff_sound: Number(editForm.techStaffSound),
        tech_staff_prompter: Number(editForm.techStaffPrompter), tech_staff_stagehands: Number(editForm.techStaffStagehands),
        tech_staff_other: editForm.techStaffOther,
        premiere_date: editForm.premiereDate, premiere_location: editForm.premiereLocation,
        production_year: Number(editForm.productionYear), performances_count: Number(editForm.performancesCount),
        total_audience: Number(editForm.totalAudience), locations_played: editForm.locationsPlayed,
        buyout_locations: editForm.buyoutLocations, box_office_indicator: editForm.boxOfficeIndicator,
        awards: editForm.awards, audience_profile: editForm.audienceProfile,
        producer_name: editForm.producerName, producer_email: editForm.producerEmail,
        rights_holder: editForm.rightsHolder, rights_status: editForm.rightsStatus,
        territories_available: editForm.territoriesAvailable, licensed_countries: editForm.licensedCountries,
        license_type: editForm.licenseType, licensing_model: editForm.licensingModel,
        exclusivity_level: editForm.exclusivityLevel, royalty_range: editForm.royaltyRange,
        advance_fee: editForm.advanceFee, rights_clearing_speed: editForm.rightsClearingSpeed,
        decision_maker_type: editForm.decisionMakerType, risk_profile: editForm.riskProfile,
        break_even_threshold: editForm.breakEvenThreshold, break_even_performances: Number(editForm.breakEvenPerformances),
        budget_range: editForm.budgetRange, humor_type: editForm.humorType,
        translations_available: editForm.translationsAvailable,
        translation_rights_included: editForm.translationRightsIncluded,
        is_sponsor_friendly: editForm.isSponsorFriendly, is_group_sales_friendly: editForm.isGroupSalesFriendly,
        exit_scenarios: editForm.exitScenarios, originating_producer_track_record: editForm.originatingProducerTrackRecord,
        territory_conflicts: editForm.territoryConflicts, media_conflicts: editForm.mediaConflicts,
        international_success_notes: editForm.internationalSuccessNotes,
        script_scenario: editForm.scriptScenario,
        is_produced: true,
        production_photos: editForm.productionPhotos || [],
      }).eq('id', manageShow.id);

      if (error) { console.error('Error:', error.message); }
      else {
        onUpdateShow({ ...manageShow, ...editForm, productionPhotos: editForm.productionPhotos || manageShow.productionPhotos } as Show);
        setSaveSuccess(true);
        setTimeout(() => { setSaveSuccess(false); setManageShow(null); }, 1500);
      }
    } catch (err: any) { console.error('Error:', err.message || err); }
    setIsSaving(false);
  };

  const F = (name: string, label: string, type = 'text', placeholder = '') => (
    <div>
      <label className={lbl}>{label}</label>
      <input name={name} type={type} value={(editForm as any)[name] || ''} onChange={handleEditChange} className={inp} placeholder={placeholder} />
    </div>
  );

  const S = (name: string, label: string, options: string[]) => (
    <div>
      <label className={lbl}>{label}</label>
      <select name={name} value={(editForm as any)[name] || ''} onChange={handleEditChange} className={sel}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const T = (name: string, label: string, rows = 3) => (
    <div className="col-span-2">
      <label className={lbl}>{label}</label>
      <textarea name={name} value={(editForm as any)[name] || ''} onChange={handleEditChange} rows={rows} className="w-full bg-brand-black border-2 border-white/20 px-4 py-3 text-white text-sm italic outline-none focus:border-brand-cyan" />
    </div>
  );

  return (
    <React.Fragment>
      {manageShow && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setManageShow(null)}></div>
          <div className="relative bg-brand-black border-8 border-white w-full max-w-5xl my-8 p-8 shadow-neo-cyan text-white">
            <button onClick={() => setManageShow(null)} className="absolute top-6 right-6 text-white hover:text-brand-pink z-10">
              <span className="material-symbols-outlined text-4xl">close</span>
            </button>

            <h2 className="text-4xl font-black uppercase italic mb-2">Edit Production</h2>
            <p className="text-brand-cyan text-xs font-black uppercase tracking-widest italic mb-10">{manageShow.title}</p>

            <div className="space-y-10">

              {/* 00. RIGHTS */}
              <section className="border-4 border-white/20 p-6">
                <h3 className="text-lg font-black uppercase italic text-brand-cyan mb-6">00. Rights & Identity</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {F('producerName', 'Production Company')}
                  {F('producerEmail', 'Producer Email')}
                  {F('rightsHolder', 'Copyright Holder')}
                  {S('rightsStatus', 'Rights Status', ['Available','Co-production Only','Licensed'])}
                  {F('territoriesAvailable', 'Territories Available')}
                  {F('licensedCountries', 'Licensed Countries')}
                  {F('territoryConflicts', 'Territory Conflicts')}
                  {F('mediaConflicts', 'Media Conflicts')}
                </div>
              </section>

              {/* 01. CREATIVE */}
              <section className="border-4 border-white/20 p-6">
                <h3 className="text-lg font-black uppercase italic text-brand-pink mb-6">01. Creative Engine</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="col-span-2 md:col-span-4">
                    <label className={lbl}>Production Title</label>
                    <input name="title" value={(editForm as any).title || ''} onChange={handleEditChange} className="w-full bg-brand-black border-4 border-white px-5 py-4 text-white font-bold uppercase text-xl outline-none focus:border-brand-yellow" />
                  </div>
                  {F('author', 'Author / Playwright')}
                  {F('director', 'Director')}
                  {F('genre', 'Genre')}
                  {F('subgenre', 'Subgenre')}
                  {F('language', 'Language')}
                  {F('location', 'Origin Market')}
                  {S('humorType', 'Humor Type', ['Universal','Language-based','Local Politics','Physical Comedy'])}
                  {F('translationsAvailable', 'Translations Available')}
                  {T('synopsis', 'Synopsis', 4)}
                  {T('directorNotes', "Director's Notes", 3)}
                  {T('originalProductionSolutions', 'Original Staging Solutions', 2)}
                  {T('internationalSuccessNotes', 'International Success Notes', 2)}
                  <div className="col-span-2 bg-brand-black border-4 border-brand-yellow p-4">
                    <label className="block text-[9px] font-black uppercase text-brand-yellow mb-1 italic">Script Scenario — 3 Pages in English</label>
                    <textarea name="scriptScenario" value={(editForm as any).scriptScenario || ''} onChange={handleEditChange} rows={15} className="w-full bg-black border-2 border-white/10 p-4 text-white font-mono text-sm leading-relaxed outline-none focus:border-brand-yellow" />
                  </div>
                </div>
              </section>

              {/* 02. PRODUCTION */}
              <section className="border-4 border-white/20 p-6">
                <h3 className="text-lg font-black uppercase italic text-brand-yellow mb-6">02. Production & Cast</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {F('maleRoles', 'Male Roles', 'number')}
                  {F('femaleRoles', 'Female Roles', 'number')}
                  {F('duration', 'Duration (min)', 'number')}
                  {F('productionYear', 'Production Year', 'number')}
                  {S('canMergeRoles', 'Can Merge Roles', ['false','true'])}
                  {S('hasIntermission', 'Intermission', ['false','true'])}
                  {S('productionScale', 'Scale', ['Small','Medium','Large'])}
                  {S('stageType', 'Stage Type', ['Main Stage','Black Box','Arena','Open Air'])}
                  {S('isTouringFriendly', 'Touring Friendly', ['true','false'])}
                  {S('technicalComplexity', 'Technical', ['Low','Medium','High'])}
                  {S('costumeComplexity', 'Costumes', ['Low','Medium','High'])}
                  {S('setComplexity', 'Set', ['Low','Medium','High'])}
                  {S('adaptationFlexibility', 'Adaptation', ['Low','Medium','High'])}
                  {S('isDirectorMandatory', 'Director Mandatory', ['false','true'])}
                  {S('creativeTeamAvailability', 'Creative Team', ['Optional','Required','Not required'])}
                  {S('budgetRange', 'Budget Range', ['Low','Medium','High'])}
                  <div className="col-span-2 md:col-span-4">
                    <label className={lbl}>Scalability Notes</label>
                    <input name="scalabilityNotes" value={(editForm as any).scalabilityNotes || ''} onChange={handleEditChange} className={inp} />
                  </div>
                  {F('techStaffLighting', 'Lighting', 'number')}
                  {F('techStaffSound', 'Sound', 'number')}
                  {F('techStaffPrompter', 'Prompter', 'number')}
                  {F('techStaffStagehands', 'Stagehands', 'number')}
                  <div className="col-span-2 md:col-span-4">{F('techStaffOther', 'Other Tech Staff')}</div>
                </div>
              </section>

              {/* 03. MARKET */}
              <section className="border-4 border-white/20 p-6">
                <h3 className="text-lg font-black uppercase italic text-brand-cyan mb-6">03. Market Performance</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {F('premiereDate', 'Premiere Date', 'date')}
                  {F('premiereLocation', 'Premiere Location')}
                  {F('performancesCount', 'Total Performances', 'number')}
                  {F('totalAudience', 'Total Audience', 'number')}
                  {F('locationsPlayed', 'Locations Played')}
                  {F('buyoutLocations', 'Buyout Locations')}
                  {S('boxOfficeIndicator', 'Box Office', ['High','Medium','Emerging'])}
                  {S('riskProfile', 'Risk Profile', ['Proven hit','Moderate risk','Experimental'])}
                  {S('breakEvenThreshold', 'Break Even Threshold', ['Low','Medium','High'])}
                  {F('breakEvenPerformances', 'Break Even Performances', 'number')}
                  {F('awards', 'Awards')}
                  {F('audienceProfile', 'Audience Profile')}
                  {F('originatingProducerTrackRecord', 'Producer Track Record')}
                  {F('exitScenarios', 'Exit Scenarios')}
                </div>
              </section>

              {/* 04. COMMERCIAL */}
              <section className="border-4 border-white/20 p-6">
                <h3 className="text-lg font-black uppercase italic text-brand-pink mb-6">04. Commercial Bible</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {S('licenseType', 'License Type', ['License','Option','Co-production'])}
                  {S('licensingModel', 'Licensing Model', ['Royalty-based','Flat fee','Hybrid'])}
                  {S('exclusivityLevel', 'Exclusivity', ['Exclusive','Semi-exclusive','Non-exclusive'])}
                  {S('rightsClearingSpeed', 'Clearing Speed', ['Fast','Medium','Slow'])}
                  {S('decisionMakerType', 'Decision Maker', ['Single','Committee'])}
                  {F('royaltyRange', 'Royalty Range')}
                  {F('advanceFee', 'Advance Fee')}
                  {S('isSponsorFriendly', 'Sponsor Friendly', ['true','false'])}
                  {S('isGroupSalesFriendly', 'Group Sales', ['true','false'])}
                  {S('translationRightsIncluded', 'Translation Rights', ['true','false'])}
                </div>
              </section>

            </div>

            {/* PRODUCTION PHOTOS */}
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-black uppercase italic text-brand-cyan border-b-2 border-brand-cyan/20 pb-2">Photos from Production</h3>
              <div className="space-y-2">
                {[0, 1, 2].map(i => (
                  <div key={i}>
                    <div
                      onClick={() => editPhotoRefs[i].current?.click()}
                      className="w-full h-24 border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-brand-cyan overflow-hidden bg-black/40 relative group"
                    >
                      {editPhotoPreviews[i] ? (
                        <>
                          <img src={editPhotoPreviews[i]!} className="w-full h-full object-cover" alt={"Photo " + (i+1)} />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-2xl">edit</span>
                          </div>
                        </>
                      ) : (
                        <span className="material-symbols-outlined text-white/20 text-3xl">add_photo_alternate</span>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={editPhotoRefs[i]}
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file || !manageShow) return;

                        // Show local preview immediately
                        const localUrl = URL.createObjectURL(file);
                        const newPreviews = [...editPhotoPreviews];
                        newPreviews[i] = localUrl;
                        setEditPhotoPreviews(newPreviews);

                        // Upload to Supabase Storage
                        const ext = file.name.split('.').pop();
                        const path = `production-photos/${manageShow.id}/photo_${i}_${Date.now()}.${ext}`;
                        const { data: uploadData, error: uploadError } = await supabase.storage
                          .from('show-images')
                          .upload(path, file, { upsert: true });

                        if (uploadError) {
                          // Fallback to base64 if storage fails
                          const reader = new FileReader();
                          reader.onload = () => {
                            const newPhotos = [...(editForm.productionPhotos || [null, null, null])];
                            newPhotos[i] = reader.result as string;
                            setEditForm(prev => ({ ...prev, productionPhotos: newPhotos }));
                          };
                          reader.readAsDataURL(file);
                        } else {
                          // Get public URL
                          const { data: urlData } = supabase.storage
                            .from('show-images')
                            .getPublicUrl(path);
                          const publicUrl = urlData.publicUrl;

                          // Update preview with real URL
                          const newPreviews2 = [...editPhotoPreviews];
                          newPreviews2[i] = publicUrl;
                          setEditPhotoPreviews(newPreviews2);

                          // Update form
                          const newPhotos = [...(editForm.productionPhotos || [null, null, null])];
                          newPhotos[i] = publicUrl;
                          setEditForm(prev => ({ ...prev, productionPhotos: newPhotos }));
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 space-y-4">
              <button onClick={handleSave} disabled={isSaving} className="w-full bg-brand-cyan text-black py-5 font-black uppercase italic border-4 border-black shadow-neo-yellow hover:bg-brand-yellow transition-all disabled:opacity-50 text-xl">
                {isSaving ? 'Saving...' : saveSuccess ? '✓ Saved!' : 'Save All Changes'}
              </button>
              <button onClick={() => { if (confirm('Delete this show permanently?')) { onDeleteShow(manageShow.id); setManageShow(null); } }} className="w-full bg-red-600 text-white py-4 font-black uppercase italic border-4 border-black">
                Delete This Asset Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-brand-black flex flex-col">
        <Navigation activePage="subscription" onNavigate={onNavigate} onLogout={onLogout} user={user} />
        <main className="flex-1 pt-24 md:pt-32 pb-20 px-4 md:px-12 text-white">
          <div className="max-w-7xl mx-auto space-y-12">

            {/* HEADER */}
            <section className="flex flex-col md:flex-row items-end justify-between gap-10">
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">My <span className="text-brand-pink">Hub</span></h1>
              <div className="flex items-center gap-6">
                <ShareButton title="My HAHAHUB Profile" text="Check out my comedy catalog!" url={window.location.href} />
                <div className="bg-brand-surface border-4 border-white p-6 shadow-neo-cyan">
                  <p className="text-xl font-black uppercase italic">{user.name}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {user.isAdmin && (
                      <span className="flex items-center gap-1 bg-brand-pink text-white text-[9px] font-black uppercase px-3 py-1 italic border-2 border-black shadow-[2px_2px_0px_black]">
                        ⚡ Admin
                      </span>
                    )}
                    {(user as any).is_founding && (
                      <span className="flex items-center gap-1 bg-brand-yellow text-black text-[9px] font-black uppercase px-3 py-1 italic border-2 border-black shadow-[2px_2px_0px_black]">
                        🏆 Founding Producer
                      </span>
                    )}
                    {(user as any).is_verified && (
                      <span className="flex items-center gap-1 bg-brand-cyan text-black text-[9px] font-black uppercase px-3 py-1 italic border-2 border-black shadow-[2px_2px_0px_black]">
                        ✓ Verified
                      </span>
                    )}
                    {user.isPaid && !(user as any).is_founding && (
                      <span className="flex items-center gap-1 bg-white/10 text-white text-[9px] font-black uppercase px-3 py-1 italic border border-white/20">
                        {(user as any).plan === 'roar' ? 'ROAR' : 'LAFF'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* ONBOARDING TOUR — samo za nove producente brez uploadov */}
            {userUploads.length === 0 && !user.isAdmin && (
              <section className="border-4 border-brand-yellow bg-brand-yellow/5 p-6 md:p-8">
                <div className="flex items-start gap-4 mb-6">
                  <span className="text-3xl">🎭</span>
                  <div>
                    <h3 className="text-xl font-black uppercase italic text-brand-yellow">Welcome to HahaHub!</h3>
                    <p className="text-white/60 font-bold italic text-sm mt-1">You're 3 steps away from going live. Here's how to start:</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { step: '01', icon: 'upload', color: 'brand-cyan', title: 'Deploy Your First Show', desc: 'Upload a production with full data — cast, rights, script scenario in English.', action: 'List Your Show →', page: 'upload' as const },
                    { step: '02', icon: 'search', color: 'brand-yellow', title: 'Browse the Catalog', desc: 'Explore international comedy productions. Tickle List shows you like.', action: 'Go to Catalog →', page: 'discovery' as const },
                    { step: '03', icon: 'mail', color: 'brand-pink', title: 'Send Your First Inquiry', desc: 'Contact a rights holder directly. No agents. No fees.', action: 'Browse Shows →', page: 'discovery' as const },
                  ].map((item, i) => (
                    <div key={i} className="bg-brand-black border-2 border-white/10 p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-3xl font-black italic text-${item.color} opacity-30`}>{item.step}</span>
                        <span className={`material-symbols-outlined text-2xl text-${item.color}`}>{item.icon}</span>
                      </div>
                      <h4 className="font-black uppercase italic text-white text-sm mb-2">{item.title}</h4>
                      <p className="text-white/40 text-xs font-bold italic leading-relaxed mb-4">{item.desc}</p>
                      <button onClick={() => onNavigate(item.page)} className={`text-[10px] font-black uppercase italic text-${item.color} hover:underline`}>{item.action}</button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* TICKLED TOAST NOTIFICATION */}
            {tickledToast.show && (
              <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-bounce">
                <div className="bg-brand-yellow text-black border-4 border-black shadow-neo-magenta px-8 py-6 text-center max-w-sm">
                  <p className="text-2xl font-black uppercase italic leading-none mb-1">YOU'VE BEEN<br/><span className="text-brand-pink">TICKLED!</span> 🎭</p>
                  <p className="text-xs font-black uppercase tracking-widest mt-2 opacity-70">{tickledToast.showTitle}</p>
                  <button onClick={() => setTickledToast({show: false, showTitle: ''})} className="mt-4 text-[9px] font-black uppercase border-2 border-black px-4 py-1 hover:bg-black hover:text-white transition-all">Dismiss</button>
                </div>
              </div>
            )}

            {/* TABS */}
            <div className="flex border-4 border-white/20 w-fit mb-2">
              {(['assets', 'inquiries', 'profile'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-black uppercase italic text-xs tracking-widest transition-all ${activeTab === tab ? 'bg-brand-yellow text-black' : 'text-white/40 hover:text-white'}`}>
                  {tab === 'assets' ? 'My Assets' : tab === 'inquiries' ? 'Inquiries' : 'My Profile'}
                </button>
              ))}
            </div>

            {/* 1. MY ASSETS */}
            {activeTab !== 'profile' && activeTab !== 'inquiries' && <section className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-4xl font-black uppercase italic">My <span className="text-brand-yellow">Assets</span></h2>
                <button onClick={() => onNavigate('upload')} className="bg-brand-cyan text-black px-8 py-3 font-black uppercase text-xs border-4 border-black shadow-neo-magenta italic hover:bg-brand-yellow transition-all">+ List Your Show</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {userUploads.length === 0 ? (
                  <div className="col-span-2 py-20 border-4 border-dashed border-white/10 text-center">
                    <p className="text-white/20 font-black uppercase italic">No active assets deployed.</p>
                    <button onClick={() => onNavigate('upload')} className="mt-4 text-brand-cyan uppercase font-black text-xs hover:underline italic">Deploy First Asset</button>
                  </div>
                ) : userUploads.map((show) => (
                  <div key={show.id} className={"bg-brand-surface border-4 p-4 md:p-6 flex gap-4 hover:shadow-neo-yellow transition-all " + (show.inquiriesCount > 0 && inquiries.some(inq => inq.show_id === show.id && !inq.is_read) ? "border-brand-cyan shadow-neo-cyan" : show.inquiriesCount > 0 ? "border-brand-cyan" : "border-white")}>
                    <div className="w-20 md:w-24 h-28 md:h-32 border-2 border-white/10 flex-shrink-0">
                      <img src={show.imageUrl} className="w-full h-full object-cover" alt={show.title} />
                    </div>
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        {inquiries.some(inq => inq.show_id === show.id && !inq.is_read) && (
                          <span className="inline-block bg-brand-cyan text-black text-[8px] font-black uppercase px-2 py-1 mb-1 text-[8px] font-black uppercase px-2 py-1 mb-1">🎭 New Tickle</span>
                        )}
                        <h3 className="text-lg font-black uppercase italic leading-none truncate">{show.title}</h3>
                        <div className="mt-2 flex items-center gap-2">
                          <span className={'w-2 h-2 rounded-full ' + (show.rightsStatus === 'Available' ? 'bg-green-500' : 'bg-brand-yellow')}></span>
                          <p className="text-[9px] text-gray-500 font-bold uppercase italic">{show.rightsStatus}</p>
                        </div>
                        <div className="mt-3 flex gap-4 text-[9px] font-black uppercase text-white/40">
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs text-brand-cyan">visibility</span>{show.viewsCount}</span>
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs text-brand-pink">favorite</span>{show.likesCount}</span>
                          <span className="flex items-center gap-1 relative">
                            {show.inquiriesCount > 0 && (
                              <span className="absolute -top-1 -right-2 w-2 h-2 bg-brand-cyan rounded-full animate-ping"></span>
                            )}
                            <span className="material-symbols-outlined text-xs text-brand-yellow">mail</span>
                            <span className={show.inquiriesCount > 0 ? "text-brand-cyan font-black" : ""}>{show.inquiriesCount}</span>
                          </span>
                        </div>
                      </div>
                      <button onClick={() => openManage(show)} className="mt-4 w-full bg-brand-pink text-white py-2 text-[9px] font-black uppercase italic border-2 border-black shadow-[2px_2px_0px_white]">Manage / Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            </section>}

            {/* 2. INQUIRIES */}
            {activeTab === 'inquiries' && <section className="space-y-6">
            {inquiries.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-4xl font-black uppercase italic">You've Been <span className="text-brand-cyan">Tickled</span></h2>
                    {inquiries.filter(i => !i.is_read).length > 0 && (
                      <span className="bg-brand-cyan text-black text-[9px] font-black px-3 py-1 uppercase font-black px-3 py-1 uppercase">{inquiries.filter(i => !i.is_read).length} UNREAD</span>
                    )}
                  </div>
                  <p className="text-[9px] font-black uppercase text-white/30 italic">{inquiries.length} total inquiries</p>
                </div>
                {inquiries.map((inq) => (
                  <div key={inq.id} className={"bg-brand-surface border-4 p-6 flex flex-col md:flex-row gap-4 justify-between " + (inq.is_read ? "border-white/20" : "border-brand-cyan")}>
                    <div className="flex-1">
                      <p className="text-[8px] font-black uppercase tracking-widest text-brand-cyan mb-1 italic">{inq.show_title}</p>
                      <p className="text-lg font-black uppercase italic text-white leading-none">{inq.from_name}</p>
                      <p className="text-xs text-white/40 font-bold mt-1">{inq.from_email}</p>
                      {inq.message && <p className="text-sm text-white/70 mt-3 italic border-l-4 border-brand-yellow pl-3">{inq.message}</p>}
                    </div>
                    <div className="flex flex-col gap-2 md:items-end justify-between">
                      <p className="text-[8px] text-white/30 font-bold uppercase">{new Date(inq.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      <div className="flex flex-col gap-2 items-end">
                        <a
                          href={"mailto:" + inq.from_email + "?subject=" + encodeURIComponent("Re: " + inq.show_title) + "&body=" + encodeURIComponent("\n\n---\nOriginal message from " + inq.from_name + ":\n" + (inq.message || ''))}
                          onClick={() => markAsRead(inq.id)}
                          className={"text-[9px] font-black uppercase px-4 py-2 border-2 transition-all italic " + (inq.is_read ? "bg-white/10 text-white/40 border-white/20 hover:bg-brand-yellow hover:text-black hover:border-black" : "bg-brand-yellow text-black hover:bg-white border-black")}
                        >
                          {inq.is_read ? "Tickle Back Again →" : "Tickle Back 🎭"}
                        </a>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(inq.from_email);
                            markAsRead(inq.id);
                          }}
                          className="text-[8px] font-bold italic text-white/30 hover:text-brand-cyan transition-colors underline"
                        >
                          {inq.from_email}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* 3. STATS */}
            <section className="grid grid-cols-2 xl:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <div key={i} className="bg-brand-surface border-4 border-white p-8 shadow-neo-white">
                  <span className={'material-symbols-outlined text-4xl mb-6 block text-' + stat.color}>{stat.icon}</span>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1 italic">{stat.label}</p>
                  <p className="text-4xl font-black uppercase italic">{stat.value}</p>
                </div>
              ))}
            </section>

            </section>}

            {/* ROYALTY + INVOICES - shown in assets tab */}
            {activeTab === 'assets' && <>
            {/* ROYALTY CALCULATOR */}
            <section className="bg-brand-surface border-4 border-brand-yellow p-6 md:p-10 shadow-neo-yellow">
              <div className="flex items-center gap-4 mb-8">
                <span className="material-symbols-outlined text-brand-yellow text-3xl">calculate</span>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black uppercase italic leading-none">Royalty <span className="text-brand-yellow">Calculator</span></h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-1">Estimate your licensing income</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {[
                  { label: 'Ticket Price (€)', value: calcTicketPrice, set: setCalcTicketPrice, min: 1, max: 200, step: 1 },
                  { label: 'Seats per Show', value: calcSeats, set: setCalcSeats, min: 10, max: 2000, step: 10 },
                  { label: 'Occupancy (%)', value: calcOccupancy, set: setCalcOccupancy, min: 10, max: 100, step: 5 },
                  { label: 'Number of Shows', value: calcPerformances, set: setCalcPerformances, min: 1, max: 500, step: 1 },
                  { label: 'Royalty Rate (%)', value: calcRoyalty, set: setCalcRoyalty, min: 1, max: 25, step: 0.5 },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/50 italic">{item.label}</label>
                      <span className="text-brand-yellow font-black text-sm">{item.value}{item.label.includes('%') ? '%' : item.label.includes('€') ? ' €' : ''}</span>
                    </div>
                    <input
                      type="range"
                      min={item.min} max={item.max} step={item.step}
                      value={item.value}
                      onChange={e => item.set(Number(e.target.value))}
                      className="w-full accent-brand-yellow h-2 bg-white/10 rounded-none cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t-4 border-brand-yellow/30 pt-6">
                <div className="bg-black/40 p-4 text-center">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">Gross / Show</p>
                  <p className="text-xl font-black text-brand-cyan">€{Math.round(calcGrossPerShow).toLocaleString()}</p>
                </div>
                <div className="bg-black/40 p-4 text-center">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">Total Gross</p>
                  <p className="text-xl font-black text-white">€{Math.round(calcTotalGross).toLocaleString()}</p>
                </div>
                <div className="bg-brand-yellow/10 border-4 border-brand-yellow p-4 text-center">
                  <p className="text-[9px] font-black uppercase tracking-widest text-brand-yellow/60 mb-1">Your Royalties</p>
                  <p className="text-2xl font-black text-brand-yellow">€{Math.round(calcTotalRoyalty).toLocaleString()}</p>
                </div>
                <div className="bg-black/40 p-4 text-center">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">ROI vs €99</p>
                  <p className="text-2xl font-black text-brand-pink">{calcMultiplier}×</p>
                </div>
              </div>
            </section>

            {/* 3. SUBSCRIPTION */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 bg-white text-black p-5 md:p-8 border-8 border-black shadow-neo-magenta overflow-hidden">
                <div className="flex justify-between items-start mb-6 gap-3">
                  <div className="min-w-0">
                    <h2 className="text-2xl md:text-4xl font-black uppercase italic leading-none mb-2">My Subscription</h2>
                    <p className="font-bold text-gray-500 uppercase tracking-widest text-xs italic">{user.subscription?.type} Plan • {user.subscription?.status}</p>
                  </div>
                  <div className={`px-4 py-3 border-4 border-black rotate-[-2deg] flex-shrink-0 ${daysRemaining <= 30 ? 'bg-brand-pink text-white' : 'bg-brand-black text-white'}`}>
                    <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-50">Days Left</p>
                    <p className="text-3xl font-black italic">{daysRemaining}</p>
                  </div>
                </div>

                {daysRemaining <= 7 && daysRemaining > 0 && (
                  <div className="bg-brand-pink text-white p-4 border-4 border-black mb-6 flex items-center gap-4">
                    <span className="material-symbols-outlined text-3xl">warning</span>
                    <div>
                      <p className="font-black uppercase text-sm">Access expiring soon!</p>
                      <p className="text-xs font-bold opacity-80">Expires on {user.subscription?.expiryDate}. Renew to keep your assets live.</p>
                    </div>
                  </div>
                )}

                {daysRemaining === 0 && (
                  <div className="bg-black text-brand-yellow p-4 border-4 border-brand-yellow mb-6 flex items-center gap-4">
                    <span className="material-symbols-outlined text-3xl text-brand-yellow">lock</span>
                    <div>
                      <p className="font-black uppercase text-sm">Access Expired</p>
                      <p className="text-xs font-bold opacity-80">Renew your subscription to restore full access.</p>
                    </div>
                  </div>
                )}

                <div className="h-5 bg-gray-100 border-4 border-black relative overflow-hidden mb-3">
                  <div className={`absolute top-0 left-0 h-full border-r-4 border-black transition-all ${daysRemaining <= 30 ? 'bg-brand-pink' : 'bg-brand-cyan'}`} style={{ width: subscriptionProgress + '%' }}></div>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest italic mb-8">
                  <span>Start</span>
                  <span className={daysRemaining <= 30 ? 'text-brand-pink' : 'text-gray-400'}>Expires: {user.subscription?.expiryDate}</span>
                </div>
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3 pt-6 border-t-4 border-black/10">
                  <a href="mailto:info@hahahub.art?subject=Renew%20Subscription" className="bg-brand-pink text-white py-4 px-4 font-black uppercase text-xs hover:bg-black transition-all border-4 border-black text-center">
                    Renew Subscription
                  </a>
                  <a href="mailto:info@hahahub.art?subject=Billing%20Question" className="bg-transparent text-black py-4 px-4 font-black uppercase text-xs hover:bg-black hover:text-white transition-all border-4 border-black text-center">
                    Contact Support
                  </a>
                </div>
              </div>

              <div className="lg:col-span-4 bg-brand-surface border-4 border-white p-8 shadow-neo-yellow flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-black uppercase italic text-brand-yellow mb-2">What's Included</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-6">Annual Pass Benefits</p>
                  <ul className="space-y-4">
                    {[
                      { icon: 'search', text: 'Full catalog access' },
                      { icon: 'upload', text: 'Unlimited asset uploads' },
                      { icon: 'analytics', text: 'Performance analytics' },
                      { icon: 'mail', text: 'Direct inquiry system' },
                      { icon: 'groups', text: 'VIP networking events' },
                      { icon: 'picture_as_pdf', text: 'Unlimited PDF downloads' },
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-bold italic">
                        <span className="material-symbols-outlined text-brand-cyan text-lg">{item.icon}</span>
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </div>
                <a href="mailto:info@hahahub.art?subject=Question" className="mt-8 w-full bg-brand-yellow text-black py-4 text-xs font-black uppercase italic border-4 border-black hover:bg-white transition-all block text-center">
                  Questions? Contact Us
                </a>
              </div>
            </div>

            {/* INVOICE ARCHIVE */}
            {(() => {
              const invoices = (() => { try { return JSON.parse(localStorage.getItem('hahahub_invoices') || '[]'); } catch { return []; } })();
              if (invoices.length === 0) return null;
              return (
                <section className="space-y-4">
                  <h2 className="text-xl font-black uppercase italic text-white">Invoice <span className="text-brand-yellow">Archive</span></h2>
                  <div className="space-y-3">
                    {invoices.map((inv: any) => (
                      <div key={inv.id} className="bg-brand-surface border-2 border-white/20 p-4 flex items-center justify-between gap-4">
                        <div>
                          <p className="font-black uppercase italic text-white text-sm">{inv.id}</p>
                          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{inv.date} · {inv.plan} · €{inv.amount}</p>
                        </div>
                        <button
                          onClick={() => {
                            const blob = new Blob([inv.html], { type: 'text/html' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `HahaHub-Invoice-${inv.id}.html`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                          className="flex items-center gap-2 bg-brand-yellow text-black px-4 py-2 font-black uppercase text-xs border-2 border-black hover:bg-white transition-all italic flex-shrink-0"
                        >
                          <span className="material-symbols-outlined text-sm">download</span>
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })()}

            {/* 4. CONTRACT TEMPLATES */}
            <section className="space-y-6">
              <div>
                <h2 className="text-xl font-black uppercase italic text-white/40">Contract <span className="text-white/20">Templates</span></h2>
                <p className="text-white/20 text-xs font-bold uppercase tracking-widest mt-1 italic">International rights agreement templates</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {CONTRACT_TEMPLATES.map((doc, i) => (
                  <div key={i} className="bg-brand-surface border-4 border-white p-6 flex flex-col justify-between hover:shadow-neo-yellow transition-all">
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <span className={`material-symbols-outlined text-4xl text-${doc.color}`}>{doc.icon}</span>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 border-2 border-${doc.color} text-${doc.color}`}>{doc.tag}</span>
                      </div>
                      <h3 className="text-lg font-black uppercase italic leading-tight mb-3">{doc.title}</h3>
                      <p className="text-xs text-white/50 font-bold leading-relaxed">{doc.desc}</p>
                    </div>
                    <button
                      onClick={() => downloadContract(doc.title, doc.content)}
                      className="mt-6 w-full py-3 text-[10px] font-black uppercase italic border-4 border-white text-center hover:bg-white hover:text-black transition-all"
                    >
                      ↓ Download Template
                    </button>
                  </div>
                ))}
              </div>
            </section>

          </>}

            {/* MY PROFILE TAB */}
            {activeTab === 'profile' && (
              <section className="space-y-8">
                <h2 className="text-4xl font-black uppercase italic">My <span className="text-brand-cyan">Profile</span></h2>
                <p className="text-white/40 font-bold italic text-sm">Appears on your public Producer Profile page.</p>
                <div className="space-y-6 max-w-2xl">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic block mb-2">Bio / About</label>
                    <textarea value={profileForm.bio} onChange={e => setProfileForm(p => ({...p, bio: e.target.value}))} placeholder="Short intro — who you are, what you produce..." className="w-full bg-brand-surface border-4 border-white/20 focus:border-brand-yellow text-white font-bold italic p-4 outline-none placeholder:text-white/20 resize-none h-28 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic block mb-2">City / Country</label>
                    <input type="text" value={profileForm.location_city} onChange={e => setProfileForm(p => ({...p, location_city: e.target.value}))} placeholder="Ljubljana, Slovenia" className="w-full bg-brand-surface border-4 border-white/20 focus:border-brand-yellow text-white font-bold italic p-4 outline-none placeholder:text-white/20 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic block mb-2">Website</label>
                    <input type="text" value={profileForm.website} onChange={e => setProfileForm(p => ({...p, website: e.target.value}))} placeholder="https://yourproduction.com" className="w-full bg-brand-surface border-4 border-white/20 focus:border-brand-yellow text-white font-bold italic p-4 outline-none placeholder:text-white/20 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic block mb-2">Festivals & Credits</label>
                    <textarea value={profileForm.festivals} onChange={e => setProfileForm(p => ({...p, festivals: e.target.value}))} placeholder="Edinburgh Fringe 2023, Avignon 2024..." className="w-full bg-brand-surface border-4 border-white/20 focus:border-brand-yellow text-white font-bold italic p-4 outline-none placeholder:text-white/20 resize-none h-20 transition-colors" />
                  </div>
                  <button onClick={async () => {
                    if (!user?.id) return;
                    setProfileSaving(true);
                    await supabase.from('profiles').update({ bio: profileForm.bio, website: profileForm.website, location_city: profileForm.location_city, festivals: profileForm.festivals }).eq('id', user.id);
                    setProfileSaving(false);
                    setProfileSaved(true);
                    setTimeout(() => setProfileSaved(false), 3000);
                  }} disabled={profileSaving} className="bg-brand-yellow text-black px-10 py-4 font-black uppercase italic border-4 border-black shadow-neo-magenta hover:bg-white transition-all disabled:opacity-40">
                    {profileSaving ? 'Saving...' : profileSaved ? 'Saved! ✓' : 'Save Profile →'}
                  </button>
                </div>
              </section>
            )}

          </div>
        </main>
      </div>
    </React.Fragment>
  );
};

export default SubscriptionPage;
