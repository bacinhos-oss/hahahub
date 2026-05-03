import React, { useState, useRef, useMemo } from 'react';
import Navigation from '../components/Navigation';
import ShareButton from '../components/ShareButton';
import { supabase } from '../lib/supabase';
import { Page, User, Show } from '../types';

interface SubscriptionPageProps {
  onNavigate: (page: Page) => void;
  onLogout?: () => void;
  user?: User;
  onToggleFavorite: (id: string) => void;
  onUpload: (show: Show) => void;
  shows: Show[];
  onDeleteShow: (id: string) => void;
  onUpdateShow: (show: Show) => void;
}

const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ onNavigate, onLogout, user, onToggleFavorite, onUpload, shows, onDeleteShow, onUpdateShow }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'upload'>('overview');
  const [manageShow, setManageShow] = useState<Show | null>(null);
  const [editForm, setEditForm] = useState<Partial<Show>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [realStats, setRealStats] = useState({
  totalViews: 0,
  totalInquiries: 0,
  totalLikes: 0,
})
  useEffect(() => {
  if (user?.id) {
    loadMyRealStats()
  }
}, [user])

const loadMyRealStats = async () => {
  // Pridobi vse show-e od tega uporabnika
  const { data: myShows } = await supabase
    .from('shows')
    .select('views_count, inquiries_count, likes_count')
    .eq('user_id', user?.id)
  
  if (myShows && myShows.length > 0) {
    const totalViews = myShows.reduce((sum, s) => sum + (s.views_count || 0), 0)
    const totalInquiries = myShows.reduce((sum, s) => sum + (s.inquiries_count || 0), 0)
    const totalLikes = myShows.reduce((sum, s) => sum + (s.likes_count || 0), 0)
    
    setRealStats({
      totalViews,
      totalInquiries,
      totalLikes,
    })
  }
}
  const [isSuccess, setIsSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '', originalTitle: '', author: '', director: '', directorNotes: '',
    originalProductionSolutions: '', producerName: user?.name || '', rightsHolder: '',
    producerEmail: user?.name ? `${user.name.toLowerCase()}@hahahub.com` : '',
    isDirectorMandatory: 'false', creativeTeamAvailability: 'Optional',
    genre: 'Comedy', subgenre: '', language: 'English', location: '',
    maleRoles: '1', femaleRoles: '1', canMergeRoles: 'false', duration: '90',
    hasIntermission: 'true', productionScale: 'Medium', isTouringFriendly: 'true',
    technicalComplexity: 'Medium', costumeComplexity: 'Medium', setComplexity: 'Medium',
    adaptationFlexibility: 'Medium', scalabilityNotes: '',
    techStaffLighting: '1', techStaffSound: '1', techStaffPrompter: '0',
    techStaffStagehands: '1', techStaffOther: '', premiereLocation: '',
    premiereDate: '', performancesCount: '0', totalAudience: '0',
    buyoutLocations: '', licensedCountries: '', riskProfile: 'Proven hit',
    breakEvenPerformances: '40', breakEvenThreshold: 'Medium',
    translationsAvailable: '', translationRightsIncluded: 'true',
    isSponsorFriendly: 'true', isGroupSalesFriendly: 'true',
    rightsClearingSpeed: 'Medium', exclusivityLevel: 'Exclusive',
    licenseType: 'License', licensingModel: 'Royalty-based',
    royaltyRange: '8-10%', advanceFee: '',
    productionYear: new Date().getFullYear().toString(),
    synopsis: '', scriptExcerpt: '', scriptScenario: '',
    audienceProfile: '', awards: '', boxOfficeIndicator: 'Emerging', budgetRange: 'Medium'
  });

  const daysRemaining = useMemo(() => {
    if (!user?.subscription?.expiryDate) return 365;
    const expiry = new Date(user.subscription.expiryDate);
    if (isNaN(expiry.getTime())) return 365;
    const today = new Date();
    const diff = expiry.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [user]);

  const subscriptionProgress = useMemo(() => {
    const total = 365;
    const remaining = Math.max(0, Math.min(total, daysRemaining));
    return ((total - remaining) / total) * 100;
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
  { label: 'Scripts Uploaded', value: userUploads.length, icon: 'upload', color: 'brand-cyan' },
  { label: 'Asset Scrapes', value: realStats.totalViews.toLocaleString(), icon: 'visibility', color: 'brand-yellow' },
  { label: 'Inquiry Rate', value: realStats.totalInquiries > 0 ? `${((realStats.totalInquiries / (realStats.totalViews || 1)) * 100).toFixed(1)}%` : '0%', icon: 'insights', color: 'brand-pink' },
  { label: 'Active Favs', value: realStats.totalLikes.toLocaleString(), icon: 'favorite', color: 'white' },
];

  const openManage = (show: Show) => {
    setManageShow(show);
    setEditForm({ ...show });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!manageShow) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('shows').update({
        title: editForm.title,
        author: editForm.author,
        director: editForm.director,
        synopsis: editForm.synopsis,
        genre: editForm.genre,
        language: editForm.language,
        location: editForm.location,
        duration: Number(editForm.duration),
        male_roles: Number(editForm.maleRoles),
        female_roles: Number(editForm.femaleRoles),
        producer_name: editForm.producerName,
        rights_holder: editForm.rightsHolder,
        premiere_date: editForm.premiereDate,
        license_type: editForm.licenseType,
        licensing_model: editForm.licensingModel,
        exclusivity_level: editForm.exclusivityLevel,
        royalty_range: editForm.royaltyRange,
        advance_fee: editForm.advanceFee,
        production_scale: editForm.productionScale,
        script_scenario: editForm.scriptScenario,
      }).eq('id', manageShow.id);
      
      if (error) {
        alert('Error saving: ' + error.message);
      } else {
        const updatedShow = {
          ...manageShow,
          ...editForm,
          duration: Number(editForm.duration) || manageShow.duration,
          maleRoles: Number(editForm.maleRoles) || manageShow.maleRoles,
          femaleRoles: Number(editForm.femaleRoles) || manageShow.femaleRoles,
        } as Show;
        onUpdateShow(updatedShow);
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
          setManageShow(null);
        }, 1500);
      }
    } catch (err: any) {
      alert('Error saving: ' + (err.message || err));
    }
    setIsSaving(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors.length > 0) setValidationErrors([]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleLaunch = () => {
    const errors: string[] = [];
    if (!formData.title.trim()) errors.push('Production Title');
    if (!formData.author.trim()) errors.push('Author/Playwright');
    if (!formData.rightsHolder.trim()) errors.push('Copyright Holder');
    if (!formData.location.trim()) errors.push('Origin Market');
    if (!formData.synopsis.trim()) errors.push('Synopsis');
    if (!formData.scriptScenario.trim()) errors.push('Script Scenario');
    if (!imagePreview) errors.push('Poster Image');

    if (errors.length > 0) {
      setValidationErrors(errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const newShow: Show = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      maleRoles: parseInt(formData.maleRoles),
      femaleRoles: parseInt(formData.femaleRoles),
      duration: parseInt(formData.duration),
      techStaffLighting: parseInt(formData.techStaffLighting),
      techStaffSound: parseInt(formData.techStaffSound),
      techStaffPrompter: parseInt(formData.techStaffPrompter),
      techStaffStagehands: parseInt(formData.techStaffStagehands),
      performancesCount: parseInt(formData.performancesCount),
      totalAudience: parseInt(formData.totalAudience),
      productionYear: parseInt(formData.productionYear),
      breakEvenPerformances: parseInt(formData.breakEvenPerformances),
      isDirectorMandatory: formData.isDirectorMandatory === 'true',
      canMergeRoles: formData.canMergeRoles === 'true',
      hasIntermission: formData.hasIntermission === 'true',
      isTouringFriendly: formData.isTouringFriendly === 'true',
      translationRightsIncluded: formData.translationRightsIncluded === 'true',
      isSponsorFriendly: formData.isSponsorFriendly === 'true',
      isGroupSalesFriendly: formData.isGroupSalesFriendly === 'true',
      transparencyScore: 92,
      likesCount: 0,
      viewsCount: 0,
      inquiriesCount: 0,
      imageUrl: imagePreview || '',
      productionPhotos: [],
      rightsStatus: 'Available',
      territoriesAvailable: 'Global',
      programmingCompatibility: ['Commercial'],
      stageType: 'Main Stage',
      humorType: 'Universal',
      boxOfficeIndicator: formData.boxOfficeIndicator as any,
    } as Show;

    onUpload(newShow);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setActiveTab('overview');
      setFormData({ ...formData, title: '', synopsis: '', scriptScenario: '' });
      setImagePreview(null);
    }, 2500);
  };

  //  
  return (
    <React.Fragment>
      {manageShow && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setManageShow(null)}></div>
          <div className="relative bg-brand-surface border-8 border-white w-full max-w-3xl max-h-[90vh] overflow-y-auto p-10 shadow-neo-cyan">
            <button onClick={() => setManageShow(null)} className="absolute top-6 right-6 text-white hover:text-brand-pink">
              <span className="material-symbols-outlined text-4xl">close</span>
            </button>
            <h2 className="text-3xl font-black uppercase italic">Edit Production</h2>
            <div className="grid grid-cols-2 gap-4 mt-6">
              {['title','author','director','genre','language','location','duration','maleRoles','femaleRoles','producerName','rightsHolder','premiereDate','licenseType','licensingModel','exclusivityLevel','royaltyRange','advanceFee','productionScale'].map(field => (
                <div key={field} className="bg-black/40 border border-white/10 p-3">
                  <label className="text-[9px] font-black uppercase text-gray-500 italic block mb-1">{field}</label>
                  <input name={field} value={(editForm as any)[field] || ''} onChange={handleEditChange} className="w-full bg-transparent text-white font-bold text-sm outline-none border-b border-white/20 focus:border-brand-cyan pb-1" />
                </div>
              ))}
              <div className="col-span-2 bg-black/40 border border-white/10 p-3">
                <label className="text-[9px] font-black uppercase text-gray-500 italic block mb-1">Synopsis</label>
                <textarea name="synopsis" value={editForm.synopsis || ''} onChange={handleEditChange} rows={3} className="w-full bg-transparent text-white italic text-sm outline-none border-b border-white/20 focus:border-brand-cyan" />
              </div>
              <div className="col-span-2 bg-black/40 border border-white/10 p-3">
                <label className="text-[9px] font-black uppercase text-gray-500 italic block mb-1">Script Scenario</label>
                <textarea name="scriptScenario" value={editForm.scriptScenario || ''} onChange={handleEditChange} rows={5} className="w-full bg-transparent text-white font-mono text-sm outline-none border-b border-white/20 focus:border-brand-cyan" />
              </div>
            </div>
            <button onClick={handleSave} disabled={isSaving} className="w-full bg-brand-cyan text-black py-4 font-black uppercase italic border-4 border-black shadow-neo-yellow hover:bg-brand-yellow transition-all mb-4 mt-6 disabled:opacity-50">
              {isSaving ? 'Saving...' : saveSuccess ? '✓ Saved!' : 'Save Changes'}
            </button>
            <button onClick={() => { if (confirm('Delete this show?')) { onDeleteShow(manageShow.id); setManageShow(null); } }} className="w-full bg-red-600 text-white py-4 font-black uppercase italic border-4 border-black">
              Delete This Asset Permanently
            </button>
          </div>
        </div>
      )}
    <div className="min-h-screen bg-brand-black flex flex-col">
      <Navigation activePage="subscription" onNavigate={onNavigate} onLogout={onLogout} user={user} />
      
      <main className="flex-1 pt-24 md:pt-32 pb-20 px-4 md:px-12 overflow-y-auto text-white">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <section className="flex flex-col md:flex-row items-end justify-between gap-10">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
                My <span className="text-brand-pink">Hub</span>
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <ShareButton title="My HAHAHUB Profile" text="Check out my comedy catalog!" url={window.location.href} />
              <div className="bg-brand-surface border-4 border-white p-6 shadow-neo-cyan flex items-center gap-6">
                <div>
                  <p className="text-xl font-black uppercase italic leading-none">{user.name}</p>
                  <p className="text-[10px] font-black text-brand-cyan uppercase tracking-widest mt-2">Verified Producer</p>
                </div>
              </div>
            </div>
          </section>

          <div className="flex border-b-8 border-white">
             <button 
               onClick={() => setActiveTab('overview')}
               className="flex-1 md:flex-none px-12 py-5 text-xl font-black uppercase italic transition-all bg-white text-black"
             >
               Overview
             </button>
          </div>

          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4">
              
              {/* MEMBERSHIP STATUS WIDGET */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 bg-white text-black p-8 md:p-10 border-8 border-black shadow-neo-magenta">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                    <div>
                      <h2 className="text-4xl font-black uppercase italic leading-none mb-2">Member Account</h2>
                      <p className="font-bold text-gray-500 uppercase tracking-widest text-xs italic">Status: {user.subscription?.status} • {user.subscription?.type} Tier</p>
                    </div>
                    <div className="bg-brand-black text-white px-6 py-4 border-4 border-black rotate-[-2deg]">
                      <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-50">Days to Lockdown</p>
                      <p className="text-4xl font-black italic leading-none">{daysRemaining}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-100 border-4 border-black relative overflow-hidden">
                       <div 
                         className="absolute top-0 left-0 h-full bg-brand-pink border-r-4 border-black transition-all duration-1000"
                         style={{ width: `${subscriptionProgress}%` }}
                       ></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest italic">
                       <span>Activation Date</span>
                       <span className="text-brand-pink">Expiring: {user.subscription?.expiryDate}</span>
                    </div>
                  </div>

                  <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t-4 border-black/5">
                    <div className="flex items-center gap-4">
                       <span className="material-symbols-outlined text-4xl text-brand-pink">sync</span>
                       <div>
                          <p className="text-[10px] font-black uppercase italic">Auto-Renewal</p>
                          <p className="text-sm font-bold">Enabled via PayPal Express</p>
                       </div>
                    </div>
                    <a href="mailto:info@hahahub.art?subject=Billing%20Request" className="bg-black text-white py-3 px-6 font-black uppercase text-xs hover:bg-brand-cyan hover:text-black transition-all border-4 border-black text-center">
                       Manage Billing
                    </a>
                  </div>
                </div>

                <div className="lg:col-span-4 bg-brand-surface border-4 border-white p-8 shadow-neo-yellow flex flex-col justify-between">
                   <div>
                      <h3 className="text-2xl font-black uppercase italic text-brand-yellow mb-6">Vault Privileges</h3>
                      <ul className="space-y-4">
                         {user.subscription?.discounts.map((d, i) => (
                           <li key={i} className="flex items-center gap-3 text-sm font-bold italic">
                              <span className="material-symbols-outlined text-brand-cyan">verified</span>
                              {d}
                           </li>
                         ))}
                      </ul>
                   </div>
                   <a href="mailto:info@hahahub.art?subject=Upgrade%20My%20Tier" className="mt-8 w-full border-4 border-white py-4 text-xs font-black uppercase italic hover:bg-white hover:text-black transition-all block text-center">
                      Upgrade My Tier
                   </a>
                </div>
              </div>

              {/* STATS OVERVIEW */}
              <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-brand-surface border-4 border-white p-8 shadow-neo-white">
                    <span className={`material-symbols-outlined text-4xl text-${stat.color} mb-6 block`}>{stat.icon}</span>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1 italic">{stat.label}</p>
                    <p className="text-4xl font-black uppercase italic tracking-tighter">{stat.value}</p>
                  </div>
                ))}
              </section>

              {/* ASSETS & RESOURCES */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* MY ASSETS LIST */}
                <section className="lg:col-span-8 space-y-8">
                  <div className="flex items-center gap-4">
                     <h2 className="text-4xl font-black uppercase italic leading-none">My <span className="text-brand-yellow">Assets</span></h2>
                     <div className="h-1 flex-1 bg-white/10"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {userUploads.length === 0 ? (
                        <div className="col-span-2 py-20 border-4 border-dashed border-white/10 text-center">
                          <p className="text-white/20 font-black uppercase italic">No active assets deployed.</p>
                          <button onClick={() => onNavigate('upload')} className="mt-4 text-brand-cyan uppercase font-black text-xs hover:underline italic">Deploy First Asset</button>
                        </div>
                      ) : userUploads.map((show) => (
                          <div key={show.id} className="bg-brand-surface border-4 border-white p-6 flex gap-6 group hover:shadow-neo-yellow transition-all">
                              <div className="w-24 h-32 border-2 border-white/10 flex-shrink-0">
                                  <img src={show.imageUrl} className="w-full h-full object-cover" alt={show.title} />
                              </div>
                              <div className="flex-1 flex flex-col justify-between">
                                  <div>
                                      <h3 className="text-xl font-black uppercase italic leading-none">{show.title}</h3>
                                      <div className="mt-2 flex items-center gap-2">
                                         <span className={`w-2 h-2 rounded-full ${show.rightsStatus === 'Available' ? 'bg-green-500' : 'bg-brand-yellow'}`}></span>
                                         <p className="text-[9px] text-gray-500 font-bold uppercase italic">{show.rightsStatus}</p>
                                      </div>
                                  </div>
                                  <div className="flex gap-2">
                                      <button onClick={() => openManage(show)} className="flex-1 bg-brand-pink text-white py-2 text-[9px] font-black uppercase italic border-2 border-black shadow-[2px_2px_0px_white]">Manage</button>
                                      <button className="px-3 bg-brand-black text-white py-2 border-2 border-white/20 hover:border-white transition-colors">
                                         <span className="material-symbols-outlined text-xs">bar_chart</span>
                                      </button>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
                </section>

                {/* RESOURCE CENTER */}
                <section className="lg:col-span-4 space-y-8">
                  <div className="flex items-center gap-4">
                     <h2 className="text-2xl font-black uppercase italic leading-none">Resource <span className="text-brand-cyan">Deck</span></h2>
                     <div className="h-1 flex-1 bg-white/10"></div>
                  </div>
                  <div className="bg-brand-surface border-4 border-white divide-y-4 divide-white/10 shadow-neo-cyan">
                     {[
                       { t: 'Deal Memo Template', i: 'description', s: 'PDF', href: 'mailto:info@hahahub.art?subject=Deal Memo Template Request' },
                       { t: 'Royalty Report Template', i: 'table_chart', s: 'XLS', href: 'mailto:info@hahahub.art?subject=Royalty Report Template Request' },
                       { t: 'Standard Comedy NDA', i: 'gavel', s: 'DOC', href: 'mailto:info@hahahub.art?subject=NDA Template Request' },
                       { t: 'Box Office Tracker', i: 'trending_up', s: 'PDF', href: 'mailto:info@hahahub.art?subject=Box Office Tracker Request' },
                     ].map((item, idx) => (
                       <a key={idx} href={item.href} className="p-4 flex items-center justify-between group hover:bg-brand-cyan/5 cursor-pointer transition-colors">
                          <div className="flex items-center gap-4">
                             <span className="material-symbols-outlined text-brand-cyan group-hover:scale-110 transition-transform">{item.i}</span>
                             <p className="text-xs font-black uppercase italic tracking-wider">{item.t}</p>
                          </div>
                          <span className="text-[8px] font-black bg-white/10 px-2 py-1 italic">{item.s}</span>
                       </a>
                     ))}
                  </div>
                  <div className="p-6 bg-brand-pink/5 border-2 border-brand-pink/20 italic">
                     <p className="text-[10px] font-black text-brand-pink uppercase tracking-widest mb-2">Producer Tip:</p>
                     <p className="text-xs font-bold leading-relaxed opacity-70">Keeping your "Script Scenario" updated to v4 increases catalog visibility by 40%.</p>
                  </div>
                </section>
              </div>
            </div>
        </div>
      </main>
    </div>
    </React.Fragment>
  );
};

export default SubscriptionPage;
                    <div className="lg:col-span-8 space-y-16">
                                             <section className="bg-brand-surface border-4 border-white p-10 shadow-neo-cyan">
                          <h3 className="text-3xl font-black uppercase italic text-brand-cyan mb-10">00. Rights & Identity</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                             <div><label className="block text-[10px] font-black uppercase text-gray-500 mb-2 italic">Production Company *</label><input name="producerName" value={formData.producerName} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white font-bold uppercase outline-none focus:border-brand-cyan" /></div>
                             <div><label className="block text-[10px] font-black uppercase text-gray-500 mb-2 italic">Copyright Holder Name *</label><input name="rightsHolder" value={formData.rightsHolder} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-brand-yellow font-bold uppercase outline-none focus:border-brand-yellow" placeholder="AUTHOR OR PUBLISHER NAME" /></div>
                             <div className="col-span-2"><label className="block text-[10px] font-black uppercase text-brand-cyan mb-2 italic">Currently Licensed Countries</label><input name="licensedCountries" value={formData.licensedCountries} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white font-bold italic outline-none focus:border-brand-cyan" placeholder="E.G. SLOVENIA, UK, JAPAN..." /></div>
                          </div>
                       </section>
                       <section className="bg-brand-surface border-4 border-white p-10 shadow-neo-magenta">
                          <h3 className="text-3xl font-black uppercase italic text-brand-pink mb-10">01. Creative Engine</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                             <div className="col-span-2"><label className="block text-[10px] font-black uppercase text-gray-500 mb-2 italic">Production Title *</label><input name="title" value={formData.title} onChange={handleInputChange} className="w-full bg-brand-black border-4 border-white px-6 py-5 text-white font-bold uppercase text-2xl outline-none focus:border-brand-yellow" /></div>
                             <div><label className="block text-[10px] font-black uppercase text-gray-500 mb-2 italic">Author / Playwright *</label><input name="author" value={formData.author} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white font-bold outline-none" /></div>
                             <div><label className="block text-[10px] font-black uppercase text-gray-500 mb-2 italic">Director</label><input name="director" value={formData.director} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white font-bold outline-none" /></div>
                             <div><label className="block text-[10px] font-black uppercase text-brand-yellow mb-2 italic">Main Genre *</label><input name="genre" value={formData.genre} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white font-black italic focus:border-brand-yellow outline-none uppercase" placeholder="E.G. COMEDY" /></div>
                             <div><label className="block text-[10px] font-black uppercase text-brand-pink mb-2 italic">Subgenre / Style</label><input name="subgenre" value={formData.subgenre} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white font-black italic focus:border-brand-pink outline-none" placeholder="E.G. Political Farce" /></div>
                             <div className="col-span-2"><label className="block text-[10px] font-black uppercase text-brand-pink mb-2 italic">Synopsis *</label><textarea name="synopsis" value={formData.synopsis} onChange={handleInputChange} rows={4} className="w-full bg-brand-black border-2 border-white/10 p-5 text-white italic outline-none focus:border-brand-pink"></textarea></div>
                             <div className="col-span-2"><label className="block text-[10px] font-black uppercase text-brand-cyan mb-2 italic">Director's Vision Notes</label><textarea name="directorNotes" value={formData.directorNotes} onChange={handleInputChange} rows={3} className="w-full bg-brand-black border-2 border-white/10 p-5 text-white italic outline-none focus:border-brand-cyan" placeholder="Style, interpretation, staging direction..."></textarea></div>
                             <div className="col-span-2"><label className="block text-[10px] font-black uppercase text-brand-yellow mb-2 italic">Original Staging Solutions</label><textarea name="originalProductionSolutions" value={formData.originalProductionSolutions} onChange={handleInputChange} rows={3} className="w-full bg-brand-black border-2 border-white/10 p-5 text-white italic outline-none focus:border-brand-yellow" placeholder="Describe unique technical or creative staging requirements..."></textarea></div>
                          </div>
                       </section>
                       <section className="bg-brand-surface border-4 border-white p-10 shadow-neo-yellow">
                          <h3 className="text-3xl font-black uppercase italic text-brand-yellow mb-10">02. Cast & Tech</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                             <div><label className="block text-[10px] font-black uppercase text-gray-500 mb-2 italic">Male Cast</label><input name="maleRoles" type="number" value={formData.maleRoles} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white font-black text-xl" /></div>
                             <div><label className="block text-[10px] font-black uppercase text-gray-500 mb-2 italic">Female Cast</label><input name="femaleRoles" type="number" value={formData.femaleRoles} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white font-black text-xl" /></div>
                             <div><label className="block text-[10px] font-black uppercase text-brand-pink mb-2 italic">Production Scale</label><select name="productionScale" value={formData.productionScale} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white text-xs font-black uppercase italic"><option value="Small">Small</option><option value="Medium">Medium</option><option value="Large">Large</option></select></div>
                             <div><label className="block text-[10px] font-black uppercase text-brand-cyan mb-2 italic">Touring Friendly</label><select name="isTouringFriendly" value={formData.isTouringFriendly} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white text-xs font-black uppercase italic"><option value="true">YES</option><option value="false">NO</option></select></div>
                             <div><label className="block text-[10px] font-black uppercase text-brand-pink mb-2 italic">Costume Complexity</label><select name="costumeComplexity" value={formData.costumeComplexity} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white text-xs font-black uppercase italic"><option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option></select></div>
                             <div><label className="block text-[10px] font-black uppercase text-brand-cyan mb-2 italic">Set Complexity</label><select name="setComplexity" value={formData.setComplexity} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white text-xs font-black uppercase italic"><option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option></select></div>
                             <div><label className="block text-[10px] font-black uppercase text-brand-cyan mb-2 italic">Lighting Staff</label><input name="techStaffLighting" type="number" value={formData.techStaffLighting} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white font-black text-xl" /></div>
                             <div><label className="block text-[10px] font-black uppercase text-brand-pink mb-2 italic">Sound Staff</label><input name="techStaffSound" type="number" value={formData.techStaffSound} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white font-black text-xl" /></div>
                             <div><label className="block text-[10px] font-black uppercase text-brand-yellow mb-2 italic">Stagehands</label><input name="techStaffStagehands" type="number" value={formData.techStaffStagehands} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white font-black text-xl" /></div>
                             <div><label className="block text-[10px] font-black uppercase text-white mb-2 italic">Prompter</label><input name="techStaffPrompter" type="number" value={formData.techStaffPrompter} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white font-black text-xl" /></div>
                             <div className="col-span-2"><label className="block text-[10px] font-black uppercase text-gray-500 mb-2 italic">Duration (Min) *</label><input name="duration" type="number" value={formData.duration} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white font-black text-xl" /></div>
                             <div className="col-span-2"><label className="block text-[10px] font-black uppercase text-gray-500 mb-2 italic">Origin Market *</label><input name="location" value={formData.location} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white font-bold uppercase" placeholder="E.G. SLOVENIA, USA..." /></div>
                          </div>
                       </section>
                       <section className="bg-brand-surface border-4 border-white p-10 shadow-neo-cyan">
                          <h3 className="text-3xl font-black uppercase italic text-brand-cyan mb-10">03. Market Performance</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                             <div><label className="block text-[10px] font-black uppercase text-brand-yellow mb-2 italic">Premiere Date</label><input name="premiereDate" type="date" value={formData.premiereDate} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white font-bold uppercase outline-none focus:border-brand-yellow" /></div>
                             <div><label className="block text-[10px] font-black uppercase text-brand-cyan mb-2 italic">Total Performances</label><input name="performancesCount" type="number" value={formData.performancesCount} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white font-black text-xl" /></div>
                             <div><label className="block text-[10px] font-black uppercase text-brand-pink mb-2 italic">Total Audience</label><input name="totalAudience" type="number" value={formData.totalAudience} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white font-black text-xl" /></div>
                             <div><label className="block text-[10px] font-black uppercase text-brand-yellow mb-2 italic">Box Office Indicator</label><select name="boxOfficeIndicator" value={formData.boxOfficeIndicator} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white text-xs font-black uppercase italic"><option value="High">High</option><option value="Medium">Medium</option><option value="Emerging">Emerging</option></select></div>
                          </div>
                       </section>
        </div>
      </main>
    </div>
    </React.Fragment>
  );
};

export default SubscriptionPage;
