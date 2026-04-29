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
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    director: '',
    producerName: user?.name || '', 
    rightsHolder: '',
    producerEmail: user?.name ? `${user.name.toLowerCase()}@hahahub.com` : '',
    genre: 'Comedy',
    subgenre: '',
    language: 'English',
    location: '', 
    maleRoles: '1',
    femaleRoles: '1',
    duration: '90',
    productionScale: 'Medium',
    isTouringFriendly: 'true',
    techStaffLighting: '1',
    techStaffSound: '1',
    techStaffPrompter: '0',
    techStaffStagehands: '1',
    licensedCountries: '',
    exclusivityLevel: 'Exclusive',
    licenseType: 'License',
    licensingModel: 'Royalty-based',
    royaltyRange: '8-10%',
    advanceFee: '',
    productionYear: new Date().getFullYear().toString(),
    premiereDate: '', 
    performancesCount: '0', 
    totalAudience: '0', 
    synopsis: '',
    scriptScenario: '', 
    boxOfficeIndicator: 'Emerging',
    directorNotes: '',
    originalProductionSolutions: '',
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
    { label: 'Asset Scrapes', value: '1,240', icon: 'visibility', color: 'brand-yellow' },
    { label: 'Inquiry Rate', value: '3.2%', icon: 'insights', color: 'brand-pink' },
    { label: 'Active Favs', value: user.favorites.length, icon: 'favorite', color: 'white' },
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
      isDirectorMandatory: false,
      canMergeRoles: false,
      hasIntermission: true,
      isTouringFriendly: formData.isTouringFriendly === 'true',
      translationRightsIncluded: true,
      isSponsorFriendly: true,
      isGroupSalesFriendly: true,
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
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase italic">My <span className="text-brand-pink">Hub</span></h1>
          <div className="flex border-b-8 border-white">
             <button onClick={() => setActiveTab('overview')} className={`flex-1 md:flex-none px-12 py-5 text-xl font-black uppercase italic transition-all ${activeTab === 'overview' ? 'bg-white text-black' : 'bg-brand-black text-white/40 hover:text-white'}`}>Overview</button>
             <button onClick={() => setActiveTab('upload')} className={`flex-1 md:flex-none px-12 py-5 text-xl font-black uppercase italic transition-all ${activeTab === 'upload' ? 'bg-brand-cyan text-black' : 'bg-brand-black text-white/40 hover:text-white'}`}>Deploy Asset</button>
          </div>

          {activeTab === 'overview' ? (
            <div className="space-y-16">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <section className="lg:col-span-8 space-y-8">
                  <h2 className="text-4xl font-black uppercase italic">My <span className="text-brand-yellow">Assets</span></h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {userUploads.map((show: Show) => (
                          <div key={show.id} className="bg-brand-surface border-4 border-white p-6 flex gap-6 group hover:shadow-neo-yellow transition-all">
                              <div className="w-24 h-32 border-2 border-white/10 flex-shrink-0">
                                  <img src={show.imageUrl} className="w-full h-full object-cover" alt={show.title} />
                              </div>
                              <div className="flex-1 flex flex-col justify-between">
                                  <h3 className="text-xl font-black uppercase italic leading-none">{show.title}</h3>
                                  <button onClick={() => openManage(show)} className="flex-1 bg-brand-pink text-white py-2 text-[9px] font-black uppercase italic border-2 border-black">Manage</button>
                              </div>
                          </div>
                      ))}
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <div className="space-y-12 pb-20">
               {isSuccess ? (
                 <div className="bg-brand-cyan p-20 text-black text-center border-8 border-white">
                   <h2 className="text-6xl font-black uppercase italic">ASSET DEPLOYED</h2>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    <div className="lg:col-span-8 space-y-16">
                       <section className="bg-brand-surface border-4 border-white p-10">
                          <input name="title" value={formData.title} onChange={handleInputChange} className="w-full bg-brand-black border-4 border-white px-6 py-5 text-white font-bold uppercase text-2xl" placeholder="Production Title *" />
                       </section>
                       <section className="bg-brand-surface border-4 border-white p-10">
                          <input name="author" value={formData.author} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white font-bold" placeholder="Author / Playwright *" />
                       </section>
                       <section className="bg-brand-surface border-4 border-white p-10">
                          <textarea name="synopsis" value={formData.synopsis} onChange={handleInputChange} rows={4} className="w-full bg-brand-black border-2 border-white/10 p-5 text-white italic" placeholder="Synopsis *"></textarea>
                       </section>
                       <section className="bg-brand-surface border-4 border-white p-10">
                          <textarea name="scriptScenario" value={formData.scriptScenario} onChange={handleInputChange} rows={12} className="w-full bg-brand-black border-2 border-white/10 p-8 text-white font-mono text-sm" placeholder="Public Preview Script Scenario (3 Pages) *"></textarea>
                       </section>
                       <div className="bg-white text-black p-10">
                          <div onClick={() => fileInputRef.current?.click()} className="w-full h-64 border-4 border-dashed border-black/20 flex flex-col items-center justify-center cursor-pointer">
                             {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <span className="text-6xl">+</span>}
                             <p className="mt-2 text-[8px] font-black uppercase text-gray-400">Main Poster *</p>
                          </div>
                          <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                          <button onClick={handleLaunch} className="w-full bg-brand-pink text-white font-black uppercase py-6 border-4 border-black mt-6">Deploy to Vault</button>
                       </div>
                    </div>
                 </div>
               )}
            </div>
          )}
        </div>
      </main>
    </div>
    </React.Fragment>
  );
};

export default SubscriptionPage;