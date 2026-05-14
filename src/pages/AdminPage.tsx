
import React, { useState, useEffect } from 'react';
import { Page, Invitation, InvitationDuration, Show } from '../types';
import { supabase } from '../lib/supabase';

interface AdminPageProps {
  onNavigate: (page: Page) => void;
  onLogout?: () => void;
  shows: Show[];
  onDeleteShow: (id: string) => void;
}

type AdminTab = 'access' | 'analytics' | 'catalog';

const AdminPage: React.FC<AdminPageProps> = ({ onNavigate, onLogout, shows, onDeleteShow }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [invites, setInvites] = useState<Invitation[]>([]);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newNote, setNewNote] = useState('Welcome to the Vault. Your credentials for the HAHAHUB Producer Tier are enclosed below.');
  const [selectedDuration, setSelectedDuration] = useState<InvitationDuration>('1 Month');
  const [invitePlan, setInvitePlan] = useState<'gigl' | 'laff' | 'roar'>('laff');
  const [mailLog, setMailLog] = useState<{title: string, msg: string} | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [liveStats, setLiveStats] = useState({ totalUsers: 0, proUsers: 0 });

  const durations: InvitationDuration[] = ['7 Days', '1 Month', '1 Year', 'Lifetime'];

  useEffect(() => {
    loadStats();
    loadInvites();
  }, []);

  const loadStats = async () => {
    const { data } = await supabase.from('profiles').select('id, is_paid, name, email, is_verified, is_founding, uploaded_show_ids, subscription_expiry, user_type').order('created_at', { ascending: false });
    if (data) {
      setUsers(data);
      setLiveStats({
        totalUsers: data.length,
        proUsers: data.filter((p: any) => p.is_paid).length,
      });
    }
  };

  const loadInvites = async () => {
    const { data } = await supabase.from('invitations').select('*').order('created_at', { ascending: false });
    if (data) {
      setInvites(data.map((inv: any) => ({
        id: inv.id,
        recipient: inv.recipient,
        email: inv.email,
        duration: inv.duration,
        sentDate: new Date(inv.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        status: inv.status,
        note: inv.note,
        generatedUsername: inv.generated_username,
        generatedPassword: inv.generated_password,
      })));
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    await loadStats();
    // Load individual users with email
    const { data } = await supabase
      .from('profiles')
      .select('id, name, email, is_paid, is_verified, is_founding, uploaded_show_ids, subscription_expiry, user_type')
      .order('created_at', { ascending: false });
    if (data) setUsers(data);
    setLoadingUsers(false);
  };

  const triggerMailLog = (title: string, msg: string) => {
    setMailLog({ title, msg });
    setTimeout(() => setMailLog(null), 8000);
  };

  const generateCredentials = (name: string) => {
    const slug = name.toUpperCase().replace(/\s+/g, '_');
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const username = `${slug}_PRO_${randomId}`;
    const password = 'Hh_' + Math.random().toString(36).substr(2, 8);
    return { username, password };
  };

  const sendInvite = async () => {
    if (!newName || !newEmail) { alert("Please enter Name and Email."); return; }
    const { username, password } = generateCredentials(newName);

    const { data } = await supabase.from('invitations').insert([{
      recipient: newName,
      email: newEmail,
      duration: selectedDuration,
      plan: invitePlan,
      status: 'pending',
      note: newNote,
      generated_username: username,
      generated_password: password,
    }]).select().single();

    const newInvite: Invitation = {
      id: data?.id || Date.now().toString(),
      recipient: newName, email: newEmail, duration: selectedDuration,
      sentDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'pending', note: newNote,
      generatedUsername: username, generatedPassword: password,
    };

    setInvites(prev => [newInvite, ...prev]);
    // Send real email via Supabase Edge Function
    try {
      await fetch("https://jnilgukmyfukazwduuig.supabase.co/functions/v1/send-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuaWxndWtteWZ1a2F6d2R1dWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MTQ2MDksImV4cCI6MjA5MTE5MDYwOX0.KbwZf30tJMdEb_3Zie3UoGA-zJO4Z7zIf9sKYOggSyU" },
        body: JSON.stringify({ email: newEmail, name: newName, password, note: newNote, duration: selectedDuration, plan: invitePlan })
      });
      triggerMailLog(`Email Sent to ${newName}`, `Real email dispatched to: ${newEmail}\n\nEmail: ${newEmail}\nPassword: ${password}\nDuration: ${selectedDuration}`);
    } catch (e) {
      triggerMailLog(`Access Provisioned: ${newName}`, `Credentials:\nEmail: ${newEmail}\nPassword: ${password}\nDuration: ${selectedDuration}`);
    }
    setNewNote('Welcome to the Vault. Your credentials for the HAHAHUB Producer Tier are enclosed below.');
  };

  const togglePro = async (userId: string, currentStatus: boolean) => {
    const expiry = new Date(); expiry.setFullYear(expiry.getFullYear() + 1);
    const expiryStr = `Dec 24, ${expiry.getFullYear()}`;
    await supabase.from('profiles').update({ is_paid: !currentStatus, subscription_expiry: !currentStatus ? expiryStr : null }).eq('id', userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_paid: !currentStatus, subscription_expiry: !currentStatus ? expiryStr : null } : u));
    setLiveStats(prev => ({ ...prev, proUsers: !currentStatus ? prev.proUsers + 1 : prev.proUsers - 1 }));
    triggerMailLog(`PRO ${!currentStatus ? 'Granted' : 'Revoked'}`, `User PRO access ${!currentStatus ? `ACTIVATED until ${expiryStr}` : 'DEACTIVATED'}.`);
  };

  const triggerExpiryNotification = async (inv: Invitation) => {
    triggerMailLog(`Expiry Notification: ${inv.recipient}`, `SYSTEM ALERT sent to ${inv.email}. "Your HAHAHUB access (${inv.generatedUsername}) has officially expired."`);
    await supabase.from('invitations').update({ status: 'expired' }).eq('id', inv.id);
    setInvites(prev => prev.map(i => i.id === inv.id ? { ...i, status: 'expired' } : i));
  };

  const handleCopyrightDeletion = (show: Show) => {
    const reason = prompt("Copyright violation reason:", "Unauthorized distribution of proprietary script assets.");
    if (reason === null) return;
    if (window.confirm(`Permanently delete "${show.title}"?`)) {
      onDeleteShow(show.id);
      triggerMailLog(`Copyright Enforcement: ${show.title}`, `LEGAL CEASE & DESIST sent to ${show.producerEmail}.\nShow: ${show.title}\nStatus: REMOVED\nReason: ${reason}`);
    }
  };

  const renderAnalytics = () => (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { label: 'Total Producers', value: liveStats.totalUsers, color: 'brand-cyan', icon: 'group' },
          { label: 'PRO Members', value: liveStats.proUsers, color: 'brand-yellow', icon: 'workspace_premium' },
          { label: 'Live Assets', value: shows.length, color: 'white', icon: 'description' },
          { label: 'Total Views', value: shows.reduce((a, s) => a + (s.viewsCount || 0), 0).toLocaleString(), color: 'brand-pink', icon: 'visibility' },
        ].map((stat, i) => (
          <div key={i} className="bg-brand-surface border-4 border-white p-6 shadow-neo-white relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-white/40">{stat.icon}</span>
              <span className="text-[10px] font-black px-2 py-0.5 bg-green-500 text-black">LIVE</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1 italic">{stat.label}</p>
            <p className="text-3xl font-black uppercase italic tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-brand-surface border-4 border-white overflow-hidden shadow-neo-cyan">
        <div className="px-8 py-5 border-b-4 border-white flex justify-between items-center">
          <h3 className="font-display text-xl uppercase tracking-tighter italic">All Producers</h3>
          <button onClick={loadUsers} className="text-[10px] font-black uppercase tracking-widest text-brand-cyan border-2 border-brand-cyan px-4 py-2 hover:bg-brand-cyan hover:text-black transition-all italic">Refresh</button>
        </div>
        <div className="space-y-3">
          {loadingUsers ? (
            <div className="p-12 text-center font-black uppercase italic text-brand-yellow text-2xl">LOADING...</div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-white/20 font-black uppercase italic">No producers yet.</div>
          ) : users.map((u: any) => {
            const isExpired = u.subscription_expiry && new Date(u.subscription_expiry) < new Date();
            return (
              <div key={u.id} className={`border-4 p-4 md:p-5 transition-all ${isExpired ? 'opacity-50 border-red-500/30' : 'border-white/20 hover:border-brand-yellow'}`}>
                {/* TOP ROW */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-black uppercase italic text-white text-sm truncate">{u.name || '—'}</p>
                    <p className="text-white/30 text-xs italic truncate">{u.email}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-white/20 text-[9px] italic">{u.uploaded_show_ids?.length || 0} shows</span>
                      {u.subscription_expiry && (
                        <span className={`text-[9px] font-bold italic ${isExpired ? 'text-brand-pink' : 'text-white/30'}`}>
                          {isExpired ? '⚠ EXPIRED' : `Exp: ${u.subscription_expiry}`}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`flex-shrink-0 px-2 py-1 text-[10px] font-black uppercase border ${u.user_type === 'roar' ? 'bg-brand-pink/10 text-brand-pink border-brand-pink/30' : u.user_type === 'laff' || u.is_paid ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-white/5 text-white/40 border-white/10'}`}>
                    {u.user_type === 'roar' ? 'ROAR' : u.user_type === 'laff' || u.is_paid ? 'LAFF' : 'GIGL'}
                  </span>
                </div>
                {/* ACTIONS ROW */}
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={u.user_type || (u.is_paid ? 'laff' : 'gigl')}
                    onChange={async (e) => {
                      const plan = e.target.value;
                      const isPaid = plan !== 'gigl';
                      const expiryStr = isPaid ? new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0] : null;
                      await supabase.from('profiles').update({ user_type: plan, is_paid: isPaid, subscription_expiry: expiryStr }).eq('id', u.id);
                      setUsers((prev: any[]) => prev.map(x => x.id === u.id ? { ...x, user_type: plan, is_paid: isPaid, subscription_expiry: expiryStr } : x));
                    }}
                    className="px-3 py-2 text-[10px] font-black uppercase italic border-2 border-white/20 bg-brand-black text-white hover:border-brand-yellow transition-all cursor-pointer"
                  >
                    <option value="gigl">GIGL — Free</option>
                    <option value="laff">LAFF — €99</option>
                    <option value="roar">ROAR — €189</option>
                  </select>
                  <button
                    onClick={async () => {
                      const newVal = !u.is_verified;
                      await supabase.from('profiles').update({ is_verified: newVal }).eq('id', u.id);
                      setUsers((prev: any[]) => prev.map(x => x.id === u.id ? { ...x, is_verified: newVal } : x));
                    }}
                    className={`px-3 py-2 text-[10px] font-black uppercase italic border-2 transition-all ${u.is_verified ? 'border-brand-cyan bg-brand-cyan text-black' : 'border-white/20 text-white/30 hover:border-brand-cyan'}`}>
                    <span className="material-symbols-outlined text-sm align-middle mr-1">check</span>
                    {u.is_verified ? 'Verified' : 'Verify'}
                  </button>
                  <button
                    onClick={async () => {
                      const newVal = !u.is_founding;
                      await supabase.from('profiles').update({ is_founding: newVal }).eq('id', u.id);
                      setUsers((prev: any[]) => prev.map(x => x.id === u.id ? { ...x, is_founding: newVal } : x));
                    }}
                    className={`px-3 py-2 text-[10px] font-black uppercase italic border-2 transition-all ${u.is_founding ? 'border-brand-yellow bg-brand-yellow text-black' : 'border-white/20 text-white/30 hover:border-brand-yellow'}`}>
                    <span className="material-symbols-outlined text-sm align-middle mr-1">star</span>
                    {u.is_founding ? 'Founding' : 'Found.'}
                  </button>
                  <button
                    onClick={async () => {
                      if (!window.confirm(`Delete ${u.name}? This cannot be undone.`)) return;
                      await supabase.from('profiles').delete().eq('id', u.id);
                      setUsers((prev: any[]) => prev.filter(x => x.id !== u.id));
                    }}
                    className="px-3 py-2 text-[10px] font-black uppercase italic border-2 border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">delete</span>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderCatalogManagement = () => (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
       <section className="bg-brand-surface border-4 border-white overflow-hidden shadow-neo-magenta">
          <div className="px-8 py-5 border-b-4 border-white flex justify-between items-center bg-white/[0.02]">
            <h3 className="font-display text-xl uppercase tracking-tighter italic">Archive Oversight</h3>
            <span className="text-[10px] bg-brand-pink text-white px-3 py-1 font-black uppercase tracking-[0.2em] italic">Compliance Sentinel</span>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left italic">
                <thead className="bg-black/40 text-[10px] uppercase text-brand-yellow font-black tracking-[0.2em] border-b-2 border-brand-border">
                   <tr>
                      <th className="px-8 py-4">Show Details</th>
                      <th className="px-8 py-4">Producer / Market</th>
                      <th className="px-8 py-4">Stats</th>
                      <th className="px-8 py-4 text-right">Legal Enforcement</th>
                   </tr>
                </thead>
                <tbody className="divide-y-2 divide-brand-border">
                   {shows.length === 0 ? (
                     <tr><td colSpan={4} className="p-20 text-center text-white/20 font-black uppercase italic tracking-widest">Archive is currently empty.</td></tr>
                   ) : shows.map((show) => (
                     <tr key={show.id} className="hover:bg-brand-pink/5 transition-colors">
                        <td className="px-8 py-5">
                           <div className="flex items-center gap-4">
                              {show.imageUrl && <img src={show.imageUrl} className="w-12 h-16 object-cover border-2 border-white/20" alt={show.title} />}
                              <div>
                                 <span className="font-black text-sm uppercase block">{show.title}</span>
                                 <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">{show.genre} • {show.language}</span>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-5">
                           <span className="text-xs font-black uppercase block">{show.producerName}</span>
                           <span className="text-[9px] text-brand-cyan uppercase font-bold">{show.location}</span>
                        </td>
                        <td className="px-8 py-5">
                           <div className="flex gap-4">
                              <div className="text-center">
                                 <p className="text-[8px] text-gray-500 font-black uppercase italic">Views</p>
                                 <p className="text-xs font-black">{(show.viewsCount || 0).toLocaleString()}</p>
                              </div>
                              <div className="text-center">
                                 <p className="text-[8px] text-gray-500 font-black uppercase italic">Inquiries</p>
                                 <p className="text-xs font-black">{show.inquiriesCount || 0}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                           <button onClick={() => handleCopyrightDeletion(show)} className="bg-brand-pink text-white px-4 py-2 text-[10px] font-black uppercase italic border-2 border-black shadow-[4px_4px_0px_black] hover:bg-black transition-all">
                             Strike Asset (Copyright)
                           </button>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </section>
    </div>
  );

  const renderAccessControl = () => (
    <div className="grid grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-4">
      <div className="col-span-12 xl:col-span-8 space-y-10">
        <section className="bg-brand-surface border-4 border-white p-10 relative shadow-neo-yellow">
          <span className="absolute -top-4 left-8 bg-brand-yellow text-black text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1 italic">NEW INVITE DISPATCH</span>
          <div className="grid grid-cols-2 gap-8 mb-8 mt-4">
            <label className="flex flex-col">
              <span className="text-brand-pink text-xs font-black uppercase tracking-widest mb-2 italic">Producer Name *</span>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full border-4 border-white bg-brand-black text-white h-14 px-4 font-bold uppercase focus:border-brand-cyan outline-none" placeholder="E.G. BILL BURR" />
            </label>
            <label className="flex flex-col">
              <span className="text-brand-yellow text-xs font-black uppercase tracking-widest mb-2 italic">Official Email *</span>
              <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="w-full border-4 border-white bg-brand-black text-white h-14 px-4 font-bold focus:border-brand-cyan outline-none" placeholder="PRODUCER@STAGE.COM" />
            </label>
          </div>
          <div className="mb-8">
            <label className="flex flex-col">
              <span className="text-brand-cyan text-xs font-black uppercase tracking-widest mb-2 italic">Invitation Note</span>
              <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} rows={4} className="w-full border-4 border-white bg-brand-black text-white focus:border-brand-pink p-4 font-bold italic outline-none text-sm" />
            </label>
          </div>
          <div className="mb-8">
            <span className="text-brand-cyan text-xs font-black uppercase tracking-widest mb-4 block italic">Access Duration Tier</span>
            <div className="flex flex-wrap gap-3">
              {durations.map((dur) => (
                <button key={dur} onClick={() => setSelectedDuration(dur)} className={`px-6 py-3 text-xs font-black uppercase tracking-widest border-2 transition-all ${selectedDuration === dur ? 'bg-brand-pink text-white border-brand-pink shadow-[4px_4px_0px_white]' : 'bg-transparent text-white border-white/20 hover:border-white'}`}>{dur}</button>
              ))}
            </div>
          </div>
          <div className="mb-10">
            <span className="text-brand-yellow text-xs font-black uppercase tracking-widest mb-4 block italic">Plan Tier</span>
            <div className="flex flex-wrap gap-3">
              {(['gigl', 'laff', 'roar'] as const).map((plan) => (
                <button key={plan} onClick={() => setInvitePlan(plan)}
                  className={`px-6 py-3 text-xs font-black uppercase tracking-widest border-2 transition-all ${invitePlan === plan ? 
                    plan === 'roar' ? 'bg-brand-pink text-white border-brand-pink shadow-[4px_4px_0px_white]' :
                    plan === 'laff' ? 'bg-brand-cyan text-black border-brand-cyan shadow-[4px_4px_0px_white]' :
                    'bg-white/20 text-white border-white shadow-[4px_4px_0px_white]'
                  : 'bg-transparent text-white/40 border-white/20 hover:border-white hover:text-white'}`}>
                  {plan === 'gigl' ? 'GIGL — Free' : plan === 'laff' ? 'LAFF — €99' : 'ROAR — €189'}
                </button>
              ))}
            </div>
          </div>
          <button onClick={sendInvite} className="bg-brand-yellow text-black font-black w-full py-6 text-xl uppercase tracking-wider border-4 border-black shadow-[6px_6px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all italic">
            Authorize & Dispatch Signal
          </button>
        </section>

        <section className="bg-brand-surface border-4 border-white overflow-hidden shadow-neo-cyan">
          <div className="px-4 md:px-8 py-5 border-b-4 border-white flex justify-between items-center bg-white/[0.02]">
            <h3 className="font-display text-xl uppercase tracking-tighter italic">Recent Despatches</h3>
            <span className="text-[10px] text-white/40 font-black uppercase italic">{invites.length} total</span>
          </div>
          <div className="overflow-x-auto w-full">
            <div className="space-y-3">
              {invites.length === 0 ? (
                <div className="p-12 text-center text-white/20 font-black uppercase italic">No invites sent yet.</div>
              ) : invites.map((inv) => (
                <div key={inv.id} className="border-4 border-white/20 p-4 hover:border-brand-yellow transition-all">
                  {/* TOP */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <p className="font-black uppercase italic text-white text-sm">{inv.recipient}</p>
                      <p className="text-white/30 text-xs italic truncate">{inv.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2 py-1 text-[9px] font-black uppercase border ${inv.status === 'live' ? 'bg-green-500/10 text-green-400 border-green-500/30' : inv.status === 'pending' ? 'bg-brand-yellow/10 text-brand-yellow border-brand-yellow/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
                        {inv.status}
                      </span>
                    </div>
                  </div>
                  {/* CREDENTIALS */}
                  <div className="bg-brand-black border-2 border-white/10 p-3 mb-3 font-mono">
                    <p className="text-[10px] text-brand-cyan font-black">U: {inv.generatedUsername}</p>
                    <p className="text-[10px] text-brand-pink font-black">P: {inv.generatedPassword}</p>
                  </div>
                  {/* BOTTOM */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-black uppercase text-brand-yellow">{inv.duration}</span>
                      <span className="text-[9px] font-black uppercase text-brand-cyan">{(inv as any).plan || 'laff'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => triggerExpiryNotification(inv)}
                        className="px-3 py-1 text-[9px] font-black uppercase italic border-2 border-white/20 text-white/30 hover:border-brand-yellow hover:text-brand-yellow transition-all flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">notifications_active</span>
                        Notify
                      </button>
                      <button
                        onClick={async () => {
                          if (!window.confirm(`Delete invite for ${inv.recipient}?`)) return;
                          await supabase.from('invitations').delete().eq('id', inv.id);
                          setInvites(prev => prev.filter(i => i.id !== inv.id));
                        }}
                        className="px-3 py-1 text-[9px] font-black uppercase italic border-2 border-red-500/40 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">delete</span>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-brand-black text-white">
      {/* TOP NAV — mobile friendly */}
      <div className="border-b-4 border-white bg-brand-black sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <div className="logo-text text-2xl flex flex-wrap leading-none">
              <span className="text-brand-yellow">HAHA</span><span className="text-brand-cyan">HUB</span>
            </div>
            <p className="text-brand-pink text-[8px] font-black tracking-[0.2em] uppercase italic">Control Center</p>
          </div>
          <button onClick={() => onNavigate('discovery')} className="text-white/40 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav className="flex border-t-2 border-white/10 overflow-x-auto">
          <button onClick={() => { setActiveTab('analytics'); loadUsers(); }} className={`flex items-center gap-2 px-4 py-3 border-r-2 border-white/10 transition-all flex-shrink-0 ${activeTab === 'analytics' ? 'bg-brand-cyan text-black' : 'text-white/40 hover:text-white'}`}>
            <span className="material-symbols-outlined text-sm">analytics</span>
            <span className="text-[10px] font-black uppercase tracking-widest italic">Metrics</span>
          </button>
          <button onClick={() => setActiveTab('access')} className={`flex items-center gap-2 px-4 py-3 border-r-2 border-white/10 transition-all flex-shrink-0 ${activeTab === 'access' ? 'bg-brand-yellow text-black' : 'text-white/40 hover:text-white'}`}>
            <span className="material-symbols-outlined text-sm">mail</span>
            <span className="text-[10px] font-black uppercase tracking-widest italic">Invites</span>
          </button>
          <button onClick={() => setActiveTab('catalog')} className={`flex items-center gap-2 px-4 py-3 border-r-2 border-white/10 transition-all flex-shrink-0 ${activeTab === 'catalog' ? 'bg-brand-pink text-white' : 'text-white/40 hover:text-white'}`}>
            <span className="material-symbols-outlined text-sm">gavel</span>
            <span className="text-[10px] font-black uppercase tracking-widest italic">Archive</span>
          </button>
          <div className="pt-20">
            <button onClick={onLogout} className="flex items-center gap-4 w-full px-6 py-4 text-brand-pink/60 hover:text-brand-pink italic transition-colors">
              <span className="material-symbols-outlined">power_settings_new</span>
              <span className="text-xs font-black uppercase tracking-widest">Logout HQ</span>
            </button>
          </div>
        </nav>
      </aside>

      <main className="ml-72 flex-1 p-16 relative">
        {mailLog && (
          <div className="fixed top-12 right-12 z-[100] bg-brand-black border-4 border-brand-yellow p-8 shadow-neo-magenta w-[420px] animate-in slide-in-from-right-10">
             <div className="flex items-center justify-between mb-4 border-b-2 border-brand-yellow/20 pb-2">
                <div className="flex items-center gap-3 text-brand-yellow">
                   <span className="material-symbols-outlined">mark_email_unread</span>
                   <span className="text-sm font-black uppercase tracking-widest italic">{mailLog.title}</span>
                </div>
                <button onClick={() => setMailLog(null)} className="text-white/40 hover:text-white"><span className="material-symbols-outlined text-sm">close</span></button>
             </div>
             <p className="text-[11px] font-mono text-white/90 leading-relaxed italic mb-6 whitespace-pre-wrap">{mailLog.msg}</p>
             <p className="text-[8px] font-black text-brand-yellow/40 uppercase mt-4 italic text-right">SIGNAL STATUS: ENCRYPTED & SENT</p>
          </div>
        )}
        <header className="mb-20 text-white">
          <div className="flex flex-col gap-4">
             <h1 className="text-7xl font-black uppercase tracking-tighter italic leading-none">
               {activeTab === 'analytics' ? 'THE METRICS' : activeTab === 'access' ? 'ACCESS INVITES' : 'ARCHIVE OVERSIGHT'}
             </h1>
             <div className="h-3 w-64 bg-brand-pink"></div>
             <p className="text-white/40 text-sm font-black italic uppercase tracking-widest">HAHAHUB Internal Administration / Revision 4.0</p>
          </div>
        </header>
        {activeTab === 'analytics' ? renderAnalytics() : activeTab === 'access' ? renderAccessControl() : renderCatalogManagement()}
      </main>
    </div>
  );
};

export default AdminPage;
