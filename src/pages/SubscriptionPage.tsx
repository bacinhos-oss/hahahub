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

const inp = "w-full bg-brand-black border-2 border-white/20 px-4 py-3 text-white font-bold text-sm outline-none focus:border-brand-cyan";
const sel = "w-full bg-brand-black border-2 border-white/20 px-4 py-3 text-white font-black text-xs uppercase italic outline-none focus:border-brand-cyan";
const lbl = "block text-[9px] font-black uppercase text-gray-500 mb-1 italic";

const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ onNavigate, onLogout, user, onToggleFavorite, shows, onDeleteShow, onUpdateShow }) => {
  const [manageShow, setManageShow] = useState<Show | null>(null);
  const [editForm, setEditForm] = useState<Partial<Show>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [realStats, setRealStats] = useState({ totalViews: 0, totalInquiries: 0, totalLikes: 0 });

  useEffect(() => { if (user?.id) loadMyRealStats(); }, [user]);

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

  const openManage = (show: Show) => { setManageShow(show); setEditForm({ ...show }); };

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
      }).eq('id', manageShow.id);

      if (error) { alert('Error: ' + error.message); }
      else {
        onUpdateShow({ ...manageShow, ...editForm } as Show);
        setSaveSuccess(true);
        setTimeout(() => { setSaveSuccess(false); setManageShow(null); }, 1500);
      }
    } catch (err: any) { alert('Error: ' + (err.message || err)); }
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

            <section className="flex flex-col md:flex-row items-end justify-between gap-10">
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">My <span className="text-brand-pink">Hub</span></h1>
              <div className="flex items-center gap-6">
                <ShareButton title="My HAHAHUB Profile" text="Check out my comedy catalog!" url={window.location.href} />
                <div className="bg-brand-surface border-4 border-white p-6 shadow-neo-cyan">
                  <p className="text-xl font-black uppercase italic">{user.name}</p>
                  <p className="text-[10px] font-black text-brand-cyan uppercase tracking-widest mt-1">Verified Producer</p>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 bg-white text-black p-8 border-8 border-black shadow-neo-magenta">
                <div className="flex justify-between items-start mb-8 gap-6">
                  <div>
                    <h2 className="text-4xl font-black uppercase italic leading-none mb-2">My Subscription</h2>
                    <p className="font-bold text-gray-500 uppercase tracking-widest text-xs italic">{user.subscription?.type} Plan • {user.subscription?.status}</p>
                  </div>
                  <div className={`px-6 py-4 border-4 border-black rotate-[-2deg] ${daysRemaining <= 30 ? 'bg-brand-pink text-white' : 'bg-brand-black text-white'}`}>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-50">Days Left</p>
                    <p className="text-4xl font-black italic">{daysRemaining}</p>
                  </div>
                </div>

                {daysRemaining <= 7 && (
                  <div className="bg-brand-pink text-white p-4 border-4 border-black mb-6 flex items-center gap-4">
                    <span className="material-symbols-outlined text-3xl">warning</span>
                    <div>
                      <p className="font-black uppercase text-sm">Access expiring soon!</p>
                      <p className="text-xs font-bold opacity-80">Your access expires on {user.subscription?.expiryDate}. Renew to keep your assets live.</p>
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

                <div className="grid grid-cols-2 gap-4 pt-6 border-t-4 border-black/10">
                  <a href="mailto:info@hahahub.art?subject=Renew%20Subscription" className="bg-brand-pink text-white py-4 px-6 font-black uppercase text-xs hover:bg-black transition-all border-4 border-black text-center">
                    Renew Subscription
                  </a>
                  <a href="mailto:info@hahahub.art?subject=Billing%20Question" className="bg-transparent text-black py-4 px-6 font-black uppercase text-xs hover:bg-black hover:text-white transition-all border-4 border-black text-center">
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
                <a href="mailto:info@hahahub.art?subject=Upgrade" className="mt-8 w-full bg-brand-yellow text-black py-4 text-xs font-black uppercase italic border-4 border-black hover:bg-white transition-all block text-center">
                  Questions? Contact Us
                </a>
              </div>
            </div>

            <section className="grid grid-cols-2 xl:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <div key={i} className="bg-brand-surface border-4 border-white p-8 shadow-neo-white">
                  <span className={'material-symbols-outlined text-4xl mb-6 block text-' + stat.color}>{stat.icon}</span>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1 italic">{stat.label}</p>
                  <p className="text-4xl font-black uppercase italic">{stat.value}</p>
                </div>
              ))}
            </section>

            <section className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-4xl font-black uppercase italic">My <span className="text-brand-yellow">Assets</span></h2>
                <button onClick={() => onNavigate('upload')} className="bg-brand-cyan text-black px-8 py-3 font-black uppercase text-xs border-4 border-black shadow-neo-magenta italic hover:bg-brand-yellow transition-all">+ Deploy Asset</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {userUploads.length === 0 ? (
                  <div className="col-span-2 py-20 border-4 border-dashed border-white/10 text-center">
                    <p className="text-white/20 font-black uppercase italic">No active assets deployed.</p>
                    <button onClick={() => onNavigate('upload')} className="mt-4 text-brand-cyan uppercase font-black text-xs hover:underline italic">Deploy First Asset</button>
                  </div>
                ) : userUploads.map((show) => (
                  <div key={show.id} className="bg-brand-surface border-4 border-white p-6 flex gap-6 hover:shadow-neo-yellow transition-all">
                    <div className="w-24 h-32 border-2 border-white/10 flex-shrink-0">
                      <img src={show.imageUrl} className="w-full h-full object-cover" alt={show.title} />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-black uppercase italic leading-none">{show.title}</h3>
                        <div className="mt-2 flex items-center gap-2">
                          <span className={'w-2 h-2 rounded-full ' + (show.rightsStatus === 'Available' ? 'bg-green-500' : 'bg-brand-yellow')}></span>
                          <p className="text-[9px] text-gray-500 font-bold uppercase italic">{show.rightsStatus}</p>
                        </div>
                        <div className="mt-3 flex gap-4 text-[9px] font-black uppercase text-white/40">
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs text-brand-cyan">visibility</span>{show.viewsCount}</span>
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs text-brand-pink">favorite</span>{show.likesCount}</span>
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs text-brand-yellow">mail</span>{show.inquiriesCount}</span>
                        </div>
                      </div>
                      <button onClick={() => openManage(show)} className="mt-4 w-full bg-brand-pink text-white py-2 text-[9px] font-black uppercase italic border-2 border-black shadow-[2px_2px_0px_white]">Manage / Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </main>
      </div>
    </React.Fragment>
  );
};

export default SubscriptionPage;
