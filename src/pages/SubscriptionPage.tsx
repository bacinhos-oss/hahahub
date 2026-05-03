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

const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ onNavigate, onLogout, user, onToggleFavorite, shows, onDeleteShow, onUpdateShow }) => {
  const [manageShow, setManageShow] = useState<Show | null>(null);
  const [editForm, setEditForm] = useState<Partial<Show>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [realStats, setRealStats] = useState({ totalViews: 0, totalInquiries: 0, totalLikes: 0 });

  useEffect(() => {
    if (user?.id) loadMyRealStats();
  }, [user]);

  const loadMyRealStats = async () => {
    const { data: myShows } = await supabase
      .from('shows')
      .select('views_count, inquiries_count, likes_count')
      .eq('user_id', user?.id);
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
    const diff = expiry.getTime() - new Date().getTime();
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
    { label: 'Assets Deployed', value: userUploads.length, icon: 'upload', color: 'brand-cyan' },
    { label: 'Asset Views', value: realStats.totalViews.toLocaleString(), icon: 'visibility', color: 'brand-yellow' },
    { label: 'Inquiry Rate', value: realStats.totalInquiries > 0 ? ((realStats.totalInquiries / (realStats.totalViews || 1)) * 100).toFixed(1) + '%' : '0%', icon: 'insights', color: 'brand-pink' },
    { label: 'Active Favs', value: realStats.totalLikes.toLocaleString(), icon: 'favorite', color: 'white' },
  ];

  const openManage = (show: Show) => { setManageShow(show); setEditForm({ ...show }); };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!manageShow) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('shows').update({
        title: editForm.title, author: editForm.author, director: editForm.director,
        synopsis: editForm.synopsis, genre: editForm.genre, language: editForm.language,
        location: editForm.location, duration: Number(editForm.duration),
        male_roles: Number(editForm.maleRoles), female_roles: Number(editForm.femaleRoles),
        producer_name: editForm.producerName, rights_holder: editForm.rightsHolder,
        premiere_date: editForm.premiereDate, license_type: editForm.licenseType,
        licensing_model: editForm.licensingModel, exclusivity_level: editForm.exclusivityLevel,
        royalty_range: editForm.royaltyRange, advance_fee: editForm.advanceFee,
        production_scale: editForm.productionScale, script_scenario: editForm.scriptScenario,
      }).eq('id', manageShow.id);
      if (error) { alert('Error: ' + error.message); }
      else {
        onUpdateShow({ ...manageShow, ...editForm, duration: Number(editForm.duration) || manageShow.duration, maleRoles: Number(editForm.maleRoles) || manageShow.maleRoles, femaleRoles: Number(editForm.femaleRoles) || manageShow.femaleRoles } as Show);
        setSaveSuccess(true);
        setTimeout(() => { setSaveSuccess(false); setManageShow(null); }, 1500);
      }
    } catch (err: any) { alert('Error: ' + (err.message || err)); }
    setIsSaving(false);
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
            <h2 className="text-3xl font-black uppercase italic mb-6">Edit Production</h2>
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            <button onClick={handleSave} disabled={isSaving} className="w-full bg-brand-cyan text-black py-4 font-black uppercase italic border-4 border-black mt-6 mb-4 disabled:opacity-50">
              {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes'}
            </button>
            <button onClick={() => { if (confirm('Delete this show?')) { onDeleteShow(manageShow.id); setManageShow(null); } }} className="w-full bg-red-600 text-white py-4 font-black uppercase italic border-4 border-black">
              Delete This Asset Permanently
            </button>
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
                    <h2 className="text-4xl font-black uppercase italic leading-none mb-2">Member Account</h2>
                    <p className="font-bold text-gray-500 uppercase tracking-widest text-xs italic">Status: {user.subscription?.status} • {user.subscription?.type} Tier</p>
                  </div>
                  <div className="bg-brand-black text-white px-6 py-4 border-4 border-black rotate-[-2deg]">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-50">Days Remaining</p>
                    <p className="text-4xl font-black italic">{daysRemaining}</p>
                  </div>
                </div>
                <div className="h-6 bg-gray-100 border-4 border-black relative overflow-hidden mb-4">
                  <div className="absolute top-0 left-0 h-full bg-brand-pink border-r-4 border-black transition-all" style={{ width: subscriptionProgress + '%' }}></div>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest italic mb-8">
                  <span>Activation</span>
                  <span className="text-brand-pink">Expiring: {user.subscription?.expiryDate}</span>
                </div>
                <div className="grid grid-cols-2 gap-6 pt-8 border-t-4 border-black/10">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-3xl text-brand-pink">sync</span>
                    <div>
                      <p className="text-[10px] font-black uppercase italic">Auto-Renewal</p>
                      <p className="text-sm font-bold">Enabled via PayPal Express</p>
                    </div>
                  </div>
                  <a href="mailto:info@hahahub.art?subject=Billing%20Request" className="bg-black text-white py-3 px-6 font-black uppercase text-xs hover:bg-brand-cyan hover:text-black transition-all border-4 border-black text-center">Manage Billing</a>
                </div>
              </div>
              <div className="lg:col-span-4 bg-brand-surface border-4 border-white p-8 shadow-neo-yellow flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-black uppercase italic text-brand-yellow mb-6">Vault Privileges</h3>
                  <ul className="space-y-4">
                    {user.subscription?.discounts.map((d, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-bold italic">
                        <span className="material-symbols-outlined text-brand-cyan">verified</span>{d}
                      </li>
                    ))}
                  </ul>
                </div>
                <a href="mailto:info@hahahub.art?subject=Upgrade" className="mt-8 w-full border-4 border-white py-4 text-xs font-black uppercase italic hover:bg-white hover:text-black transition-all block text-center">Upgrade My Tier</a>
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
                      <button onClick={() => openManage(show)} className="mt-4 w-full bg-brand-pink text-white py-2 text-[9px] font-black uppercase italic border-2 border-black shadow-[2px_2px_0px_white]">Manage</button>
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
