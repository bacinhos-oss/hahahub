import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Page, User, Show } from '../types';

interface Invitation {
  id: string;
  recipient: string;
  email: string;
  duration: string;
  status: string;
  generatedUsername: string;
  generatedPassword: string;
  plan?: string;
}

type InvitationDuration = '7 Days' | '1 Month' | '1 Year' | 'Lifetime';
const durations: InvitationDuration[] = ['7 Days', '1 Month', '1 Year', 'Lifetime'];

interface AdminPageProps {
  onNavigate: (page: Page) => void;
  onLogout?: () => void;
  shows: Show[];
  onDeleteShow: (id: string) => void;
  user?: User;
}

const AdminPage: React.FC<AdminPageProps> = ({ onNavigate, onLogout, shows, onDeleteShow }) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'access' | 'catalog'>('analytics');
  const [users, setUsers] = useState<any[]>([]);
  const [invites, setInvites] = useState<Invitation[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newNote, setNewNote] = useState('');
  const [password, setPassword] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<InvitationDuration>('1 Month');
  const [invitePlan, setInvitePlan] = useState<'gigl' | 'laff' | 'roar'>('laff');
  const [mailLog, setMailLog] = useState<{ title: string; msg: string } | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadUsers();
    loadInvites();
  }, []);

  const loadUsers = async () => {
    setLoadingUsers(true);
    const { data } = await supabase.from('profiles').select('id, name, email, is_paid, is_verified, is_founding, uploaded_show_ids, subscription_expiry, user_type').order('created_at', { ascending: false });
    setUsers(data || []);
    setLoadingUsers(false);
  };

  const loadInvites = async () => {
    const { data } = await supabase.from('invitations').select('*').order('created_at', { ascending: false });
    if (data) setInvites(data.map((inv: any) => ({
      id: inv.id, recipient: inv.recipient, email: inv.email,
      duration: inv.duration, status: inv.status,
      generatedUsername: inv.email, generatedPassword: inv.password || '—',
      plan: inv.plan || 'laff',
    })));
  };

  const triggerMailLog = (title: string, msg: string) => {
    setMailLog({ title, msg });
    setTimeout(() => setMailLog(null), 8000);
  };

  const sendInvite = async () => {
    if (!newName || !newEmail || !password) return;
    setSending(true);
    const { data } = await supabase.from('invitations').insert([{
      recipient: newName, email: newEmail, duration: selectedDuration,
      status: 'pending', password, note: newNote, plan: invitePlan,
    }]).select();
    if (data?.[0]) {
      setInvites(prev => [{ id: data[0].id, recipient: newName, email: newEmail, duration: selectedDuration, status: 'pending', generatedUsername: newEmail, generatedPassword: password, plan: invitePlan }, ...prev]);
    }
    try {
      await fetch("https://jnilgukmyfukazwduuig.supabase.co/functions/v1/send-invite", {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail, name: newName, password, note: newNote, duration: selectedDuration, plan: invitePlan })
      });
      triggerMailLog(`Email Sent to ${newName}`, `Dispatched to: ${newEmail}\nPassword: ${password}\nPlan: ${invitePlan.toUpperCase()}\nDuration: ${selectedDuration}`);
    } catch (e) { console.error(e); }
    setNewName(''); setNewEmail(''); setNewNote(''); setPassword('');
    setSending(false);
  };

  const deleteInvite = async (id: string, name: string) => {
    if (!window.confirm(`Delete invite for ${name}?`)) return;
    await supabase.from('invitations').delete().eq('id', id);
    setInvites(prev => prev.filter(i => i.id !== id));
  };

  const deleteUser = async (id: string, name: string) => {
    if (!window.confirm(`Delete ${name}? Cannot be undone.`)) return;
    await supabase.from('profiles').delete().eq('id', id);
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const setPlan = async (userId: string, plan: string) => {
    const isPaid = plan !== 'gigl';
    const expiryStr = isPaid ? new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0] : null;
    await supabase.from('profiles').update({ user_type: plan, is_paid: isPaid, subscription_expiry: expiryStr }).eq('id', userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, user_type: plan, is_paid: isPaid, subscription_expiry: expiryStr } : u));
    // Send upgrade notification email
    const u = users.find(x => x.id === userId);
    if (u?.email && isPaid) {
      try {
        await fetch("https://jnilgukmyfukazwduuig.supabase.co/functions/v1/send-invite", {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: u.email, name: u.name,
            note: `Your HahaHub membership has been upgraded to ${plan.toUpperCase()}. Log in to access your new features. Break a Laffing Leg. 🦵`,
            duration: '1 Year', plan,
          })
        });
        triggerMailLog(`Upgrade sent to ${u.name}`, `${u.email} upgraded to ${plan.toUpperCase()}`);
      } catch(e) { console.error(e); }
    }
  };

  const toggleVerified = async (id: string, current: boolean) => {
    await supabase.from('profiles').update({ is_verified: !current }).eq('id', id);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, is_verified: !current } : u));
  };

  const toggleFounding = async (id: string, current: boolean) => {
    await supabase.from('profiles').update({ is_founding: !current }).eq('id', id);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, is_founding: !current } : u));
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-black text-white">

      {/* TOP NAV */}
      <div className="border-b-4 border-white bg-brand-black sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <div className="logo-text text-2xl flex leading-none">
              <span className="text-brand-yellow">HAHA</span><span className="text-brand-cyan">HUB</span>
            </div>
            <p className="text-brand-pink text-[8px] font-black tracking-[0.2em] uppercase italic">Control Center</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('discovery')} className="text-white/40 hover:text-white transition-colors text-xs font-black uppercase italic">← Catalog</button>
            {onLogout && <button onClick={onLogout} className="text-brand-pink/60 hover:text-brand-pink transition-colors"><span className="material-symbols-outlined text-sm">power_settings_new</span></button>}
          </div>
        </div>
        <nav className="flex border-t-2 border-white/10 overflow-x-auto">
          {([
            { key: 'analytics', label: 'Producers', icon: 'group' },
            { key: 'access', label: 'Invites', icon: 'mail' },
            { key: 'catalog', label: 'Archive', icon: 'gavel' },
          ] as const).map(tab => (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); if (tab.key === 'analytics') loadUsers(); }}
              className={`flex items-center gap-2 px-5 py-3 border-r-2 border-white/10 transition-all flex-shrink-0 text-[10px] font-black uppercase tracking-widest italic
                ${activeTab === tab.key ? tab.key === 'analytics' ? 'bg-brand-cyan text-black' : tab.key === 'access' ? 'bg-brand-yellow text-black' : 'bg-brand-pink text-white' : 'text-white/40 hover:text-white'}`}>
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* MAIL LOG */}
      {mailLog && (
        <div className="fixed top-20 right-4 z-[100] bg-brand-black border-4 border-brand-yellow p-6 shadow-neo-magenta w-80 animate-in slide-in-from-right-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-brand-yellow text-xs font-black uppercase italic">{mailLog.title}</span>
            <button onClick={() => setMailLog(null)}><span className="material-symbols-outlined text-sm text-white/40">close</span></button>
          </div>
          <p className="text-[10px] font-mono text-white/70 whitespace-pre-wrap">{mailLog.msg}</p>
        </div>
      )}

      <main className="flex-1 p-4 md:p-8">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none text-white">
            {activeTab === 'analytics' ? 'PRODUCERS' : activeTab === 'access' ? 'INVITES' : 'ARCHIVE'}
          </h1>
          <div className="h-2 w-32 bg-brand-pink mt-2"></div>
        </div>

        {/* PRODUCERS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-3">
            {loadingUsers ? (
              <p className="text-brand-yellow font-black uppercase italic animate-pulse">Loading...</p>
            ) : users.length === 0 ? (
              <p className="text-white/20 font-black uppercase italic">No producers yet.</p>
            ) : users.map((u: any) => {
              const isExpired = u.subscription_expiry && 
                !u.is_founding &&
                u.user_type !== 'roar' &&
                new Date(u.subscription_expiry + 'T23:59:59') < new Date();
              return (
                <div key={u.id} className={`border-4 p-4 transition-all ${isExpired ? 'border-red-500/30 opacity-60' : 'border-white/20 hover:border-brand-yellow'}`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-black uppercase italic text-white truncate">{u.name || '—'}</p>
                      <p className="text-white/30 text-xs italic truncate">{u.email}</p>
                      <div className="flex gap-3 mt-1 flex-wrap">
                        <span className="text-white/20 text-[9px]">{u.uploaded_show_ids?.length || 0} shows</span>
                        {u.is_founding ? (
                          <span className="text-[9px] text-brand-yellow font-black uppercase italic">⭐ Founding — Lifetime</span>
                        ) : u.subscription_expiry ? (
                          <span className={`text-[9px] font-black uppercase italic px-2 py-0.5 border ${isExpired ? 'text-brand-pink border-brand-pink/30 bg-brand-pink/10' : 'text-brand-cyan border-brand-cyan/20'}`}>
                            {isExpired ? '⚠ EXPIRED' : `Valid until ${u.subscription_expiry}`}
                          </span>
                        ) : (
                          <span className="text-[9px] text-white/20 italic">No expiry set</span>
                        )}
                      </div>
                    </div>
                    <span className={`flex-shrink-0 px-2 py-1 text-[9px] font-black uppercase border ${u.user_type === 'roar' ? 'text-brand-pink border-brand-pink/40' : u.user_type === 'laff' || u.is_paid ? 'text-green-400 border-green-500/30' : 'text-white/30 border-white/10'}`}>
                      {u.user_type === 'roar' ? 'ROAR' : u.user_type === 'laff' || u.is_paid ? 'LAFF' : 'GIGL'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <select value={u.user_type || (u.is_paid ? 'laff' : 'gigl')} onChange={e => setPlan(u.id, e.target.value)}
                      className="px-3 py-2 text-[10px] font-black uppercase italic border-2 border-white/20 bg-brand-black text-white hover:border-brand-yellow cursor-pointer">
                      <option value="gigl">GIGL — Free</option>
                      <option value="laff">LAFF — €99</option>
                      <option value="roar">ROAR — €189</option>
                    </select>
                    <button onClick={() => toggleVerified(u.id, u.is_verified)}
                      className={`px-3 py-2 text-[10px] font-black uppercase italic border-2 transition-all flex items-center gap-1 ${u.is_verified ? 'bg-brand-cyan border-brand-cyan text-black' : 'border-white/20 text-white/30 hover:border-brand-cyan'}`}>
                      <span className="material-symbols-outlined text-sm">check</span>
                      {u.is_verified ? 'Verified' : 'Verify'}
                    </button>
                    <button onClick={() => toggleFounding(u.id, u.is_founding)}
                      className={`px-3 py-2 text-[10px] font-black uppercase italic border-2 transition-all flex items-center gap-1 ${u.is_founding ? 'bg-brand-yellow border-brand-yellow text-black' : 'border-white/20 text-white/30 hover:border-brand-yellow'}`}>
                      <span className="material-symbols-outlined text-sm">star</span>
                      {u.is_founding ? 'Founding' : 'Found.'}
                    </button>
                    <button onClick={async () => {
                      const newExpiry = new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0];
                      await supabase.from('profiles').update({ subscription_expiry: newExpiry, is_paid: true }).eq('id', u.id);
                      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, subscription_expiry: newExpiry, is_paid: true } : x));
                      // Send email to producer
                      if (u.email) {
                        try {
                          await fetch("https://jnilgukmyfukazwduuig.supabase.co/functions/v1/send-invite", {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              email: u.email, name: u.name || u.email,
                              note: u.name + ". Your HahaHub membership has been extended for 1 year. Valid until " + newExpiry + ".\n\nBreak a Laffing Leg. 🦵\nhahahub.art",
                              duration: '1 Year', plan: u.user_type || 'laff',
                            })
                          });
                        } catch(e) { console.error(e); }
                      }
                      triggerMailLog('Extended ' + (u.name || u.email), 'Account extended until ' + newExpiry + '. Email sent.');
                    }} className="px-3 py-2 text-[10px] font-black uppercase italic border-2 border-brand-cyan/30 text-brand-cyan hover:bg-brand-cyan hover:text-black transition-all flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">update</span>
                      +1 Year
                    </button>
                    <button onClick={async () => {
                      if (!u.email) return;
                      const { error } = await supabase.auth.resetPasswordForEmail(u.email, { redirectTo: 'https://www.hahahub.art/login' });
                      if (!error) triggerMailLog('Reset sent to ' + (u.name || u.email), 'Password reset link sent to ' + u.email);
                      else triggerMailLog('Error', error.message);
                    }} className="px-3 py-2 text-[10px] font-black uppercase italic border-2 border-brand-yellow/30 text-brand-yellow hover:bg-brand-yellow hover:text-black transition-all flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">lock_reset</span>
                      Reset PW
                    </button>
                    <button onClick={() => deleteUser(u.id, u.name || u.email)}
                      className="px-3 py-2 text-[10px] font-black uppercase italic border-2 border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center gap-1 ml-auto">
                      <span className="material-symbols-outlined text-sm">delete</span>
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* INVITES TAB */}
        {activeTab === 'access' && (
          <div className="space-y-8">
            {/* SEND INVITE FORM */}
            <div className="border-4 border-brand-yellow p-6 space-y-4 shadow-neo-yellow">
              <p className="text-brand-yellow text-[10px] font-black uppercase italic tracking-widest">New Invite →</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input type="text" placeholder="Producer Name" value={newName} onChange={e => setNewName(e.target.value)}
                  className="bg-brand-black border-2 border-white/20 focus:border-brand-yellow text-white font-bold italic p-3 outline-none text-sm resize-none" />
                <input type="email" placeholder="Email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                  className="bg-brand-black border-2 border-white/20 focus:border-brand-yellow text-white font-bold italic p-3 outline-none text-sm resize-none" />
                <div className="relative">
                <input type="text" placeholder="Temp Password" value={password} onChange={e => setPassword(e.target.value)}
                  className="bg-brand-black border-2 border-white/20 focus:border-brand-yellow text-white font-bold italic p-3 outline-none text-sm resize-none" />
                <div className="relative">
                  <textarea placeholder="Personal invite note..." value={newNote} onChange={e => setNewNote(e.target.value)} rows={4}
                    className="w-full bg-brand-black border-2 border-white/20 focus:border-brand-yellow text-white font-bold italic p-3 outline-none text-sm resize-none" />
                  <button type="button"
                    onClick={() => {
                      const lines = [
                        'Hey ' + (newName || '[Name]') + '! 🥊',
                        '',
                        "You're invited to The Laff Exchange — the first P2P comedy rights marketplace.",
                        '',
                        'Your login credentials:',
                        'Email: ' + (newEmail || '[email]'),
                        'Password: ' + (password || '[password]'),
                        '',
                        'Change your password after first login: My Hub → My Profile.',
                        '',
                        'Welcome to the Exchange. Break a Laffing Leg. 🦵',
                        '— The HahaHub Team',
                      ];
                      setNewNote(lines.join('\n'));
                    }}
                    className="absolute bottom-2 right-2 text-[8px] font-black uppercase italic text-brand-yellow border border-brand-yellow/40 px-2 py-1 hover:bg-brand-yellow hover:text-black transition-all">
                    Fill Template
                  </button>
                </div>
              </div>
              {/* Duration */}
              <div>
                <p className="text-[9px] font-black uppercase italic text-white/40 mb-2">Duration</p>
                <div className="flex gap-2 flex-wrap">
                  {durations.map(d => (
                    <button key={d} onClick={() => setSelectedDuration(d)}
                      className={`px-4 py-2 text-[10px] font-black uppercase italic border-2 transition-all ${selectedDuration === d ? 'bg-brand-pink text-white border-brand-pink' : 'border-white/20 text-white/40 hover:border-white'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              {/* Plan */}
              <div>
                <p className="text-[9px] font-black uppercase italic text-white/40 mb-2">Plan</p>
                <div className="flex gap-2 flex-wrap">
                  {(['gigl', 'laff', 'roar'] as const).map(plan => (
                    <button key={plan} onClick={() => setInvitePlan(plan)}
                      className={`px-4 py-2 text-[10px] font-black uppercase italic border-2 transition-all ${invitePlan === plan ?
                        plan === 'roar' ? 'bg-brand-pink text-white border-brand-pink' :
                        plan === 'laff' ? 'bg-brand-cyan text-black border-brand-cyan' :
                        'bg-white text-black border-white' : 'border-white/20 text-white/40 hover:border-white'}`}>
                      {plan === 'gigl' ? 'GIGL — Free' : plan === 'laff' ? 'LAFF — €99' : 'ROAR — €189'}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={sendInvite} disabled={sending || !newName || !newEmail || !password}
                className="bg-brand-yellow text-black px-8 py-3 font-black uppercase italic border-4 border-black hover:bg-white transition-all disabled:opacity-40 text-sm">
                {sending ? 'Dispatching...' : 'Dispatch Invite →'}
              </button>
            </div>

            {/* INVITE LIST */}
            <div className="space-y-3">
              <p className="text-[9px] font-black uppercase italic text-white/40 tracking-widest">{invites.length} invites dispatched</p>
              {invites.length === 0 ? (
                <p className="text-white/20 font-black uppercase italic">No invites yet.</p>
              ) : invites.map(inv => (
                <div key={inv.id} className="border-4 border-white/20 p-4 hover:border-brand-yellow transition-all">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <p className="font-black uppercase italic text-white">{inv.recipient}</p>
                      <p className="text-white/30 text-xs italic truncate">{inv.email}</p>
                    </div>
                    <span className={`flex-shrink-0 px-2 py-1 text-[9px] font-black uppercase italic border ${inv.status === 'used' ? 'bg-brand-yellow text-black border-brand-yellow' : 'text-white/40 border-white/20'}`}>
                      {inv.status === 'used' ? '🥊 Tickled' : 'Sent'}
                    </span>
                  </div>
                  <div className="bg-brand-black border border-white/10 p-3 mb-3 font-mono">
                    <p className="text-[10px] text-brand-cyan font-black">Email: {inv.generatedUsername}</p>
                    <p className="text-[10px] text-brand-pink font-black">Pass: {inv.generatedPassword}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex gap-3 flex-wrap">
                      <span className="text-[9px] font-black uppercase text-brand-yellow">{inv.duration}</span>
                      <span className="text-[9px] font-black uppercase text-brand-cyan">{inv.plan?.toUpperCase() || 'LAFF'}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={async () => {
                        try {
                          await fetch("https://jnilgukmyfukazwduuig.supabase.co/functions/v1/send-invite", {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: inv.email, name: inv.recipient, password: inv.generatedPassword, duration: inv.duration, plan: inv.plan || 'laff', note: 'Resent credentials.' })
                          });
                          triggerMailLog('Resent to ' + inv.recipient, 'Credentials resent to ' + inv.email);
                        } catch(e) { console.error(e); }
                      }} className="px-3 py-1 text-[9px] font-black uppercase italic border-2 border-brand-cyan/30 text-brand-cyan hover:bg-brand-cyan hover:text-black transition-all flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">send</span>
                        Resend
                      </button>
                      <button onClick={() => deleteInvite(inv.id, inv.recipient)}
                        className="px-3 py-1 text-[9px] font-black uppercase italic border-2 border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">delete</span>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </div>
        )}

        {/* ARCHIVE TAB */}
        {activeTab === 'catalog' && (
          <div className="space-y-3">
            {shows.length === 0 ? (
              <p className="text-white/20 font-black uppercase italic">No shows in archive.</p>
            ) : shows.map(show => (
              <div key={show.id} className="border-4 border-white/20 p-4 flex items-center justify-between gap-4 hover:border-brand-pink transition-all">
                <div className="min-w-0">
                  <p className="font-black uppercase italic text-white truncate">{show.title}</p>
                  <p className="text-white/30 text-xs italic">{show.genre} · {show.location} · {show.productionYear}</p>
                  <p className="text-white/20 text-[9px] mt-1">{show.viewsCount} views · {show.inquiriesCount} inquiries</p>
                </div>
                <button onClick={() => onDeleteShow(show.id)}
                  className="flex-shrink-0 px-3 py-2 text-[10px] font-black uppercase italic border-2 border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">delete</span>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminPage;
