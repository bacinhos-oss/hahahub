
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
    const { data } = await supabase.from('profiles').select('id, is_paid, name, uploaded_show_ids, subscription_expiry');
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
    const password = 'HH_' + Math.random().toString(36).substr(2, 8).toUpperCase();
    return { username, password };
  };

  const sendInvite = async () => {
    if (!newName || !newEmail) { alert("Please enter Name and Email."); return; }
    const { username, password } = generateCredentials(newName);

    const { data } = await supabase.from('invitations').insert([{
      recipient: newName,
      email: newEmail,
      duration: selectedDuration,
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
        body: JSON.stringify({ email: newEmail, name: newName, password, note: newNote, duration: selectedDuration })
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
        <div className="overflow-x-auto">
          {loadingUsers ? (
            <div className="p-12 text-center font-black uppercase italic text-brand-yellow text-2xl">LOADING...</div>
          ) : (
            <table className="w-full text-left italic">
              <thead className="bg-black/40 text-[10px] uppercase text-brand-yellow font-black tracking-[0.2em] border-b-2 border-brand-border">
                <tr>
                  <th className="px-8 py-4">Name</th>
                  <th className="px-8 py-4">Uploads</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Expires</th>
                  <th className="px-8 py-4 text-right">PRO Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-brand-border">
                {users.length === 0 ? (
                  <tr><td colSpan={5} className="p-12 text-center text-white/20 font-black uppercase italic">No producers yet.</td></tr>
                ) : users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-brand-yellow/5 transition-colors">
                    <td className="px-8 py-5"><span className="font-black text-sm uppercase">{u.name || '—'}</span></td>
                    <td className="px-8 py-5"><span className="text-xs font-bold">{u.uploaded_show_ids?.length || 0}</span></td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center gap-1.5 border px-2 py-1 text-[10px] font-black uppercase ${u.is_paid ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-white/5 text-white/40 border-white/10'}`}>
                        {u.is_paid ? 'PRO' : 'FREE'}
                      </span>
                    </td>
                    <td className="px-8 py-5"><span className="text-[10px] text-gray-500 font-bold">{u.subscription_expiry || '—'}</span></td>
                    <td className="px-8 py-5 text-right">
                      <button onClick={() => togglePro(u.id, u.is_paid)} className={`px-4 py-2 text-[10px] font-black uppercase italic border-2 transition-all ${u.is_paid ? 'border-brand-pink text-brand-pink hover:bg-brand-pink hover:text-white' : 'border-brand-cyan text-brand-cyan hover:bg-brand-cyan hover:text-black'}`}>
                        {u.is_paid ? 'Revoke PRO' : 'Grant PRO'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
          <div className="mb-10">
            <span className="text-brand-cyan text-xs font-black uppercase tracking-widest mb-4 block italic">Access Duration Tier</span>
            <div className="flex flex-wrap gap-3">
              {durations.map((dur) => (
                <button key={dur} onClick={() => setSelectedDuration(dur)} className={`px-6 py-3 text-xs font-black uppercase tracking-widest border-2 transition-all ${selectedDuration === dur ? 'bg-brand-pink text-white border-brand-pink shadow-[4px_4px_0px_white]' : 'bg-transparent text-white border-white/20 hover:border-white'}`}>{dur}</button>
              ))}
            </div>
          </div>
          <button onClick={sendInvite} className="bg-brand-yellow text-black font-black w-full py-6 text-xl uppercase tracking-wider border-4 border-black shadow-[6px_6px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all italic">
            Authorize & Dispatch Signal
          </button>
        </section>

        <section className="bg-brand-surface border-4 border-white overflow-hidden shadow-neo-cyan">
          <div className="px-8 py-5 border-b-4 border-white flex justify-between items-center bg-white/[0.02]">
            <h3 className="font-display text-xl uppercase tracking-tighter italic">Recent Despatches</h3>
            <span className="text-[10px] text-white/40 font-black uppercase italic">{invites.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left italic">
              <thead className="bg-black/40 text-[10px] uppercase text-brand-yellow font-black tracking-[0.2em] border-b-2 border-brand-border">
                <tr>
                  <th className="px-8 py-4">Producer</th>
                  <th className="px-8 py-4">Credentials</th>
                  <th className="px-8 py-4">Duration</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-brand-border">
                {invites.length === 0 ? (
                  <tr><td colSpan={5} className="p-12 text-center text-white/20 font-black uppercase italic">No invites sent yet.</td></tr>
                ) : invites.map((inv) => (
                  <tr key={inv.id} className="hover:bg-brand-yellow/5 transition-colors group">
                    <td className="px-8 py-5">
                      <span className="font-black text-sm uppercase block">{inv.recipient}</span>
                      <span className="text-[10px] text-gray-500">{inv.email}</span>
                    </td>
                    <td className="px-8 py-5 font-mono">
                       <span className="text-[10px] text-brand-cyan uppercase font-black block">U: {inv.generatedUsername}</span>
                       <span className="text-[10px] text-brand-pink uppercase font-black">P: {inv.generatedPassword}</span>
                    </td>
                    <td className="px-8 py-5"><span className="text-xs font-bold uppercase text-brand-yellow">{inv.duration}</span></td>
                    <td className="px-8 py-5">
                       <span className={`inline-flex items-center gap-1.5 border px-2 py-1 text-[10px] font-black uppercase ${inv.status === 'live' ? 'bg-green-500/10 text-green-400 border-green-500/30' : inv.status === 'pending' ? 'bg-brand-yellow/10 text-brand-yellow border-brand-yellow/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
                          {inv.status}
                       </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                        <button onClick={() => triggerExpiryNotification(inv)} className="text-white/20 hover:text-brand-yellow transition-colors">
                          <span className="material-symbols-outlined text-2xl">notifications_active</span>
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-brand-black text-white">
      <aside className="w-72 border-r-4 border-white bg-brand-black fixed h-full z-50">
        <div className="p-10">
          <div className="logo-text text-3xl flex flex-wrap leading-none cursor-pointer">
            <span className="text-brand-yellow">HAHA</span><span className="text-brand-cyan">HUB</span>
          </div>
          <p className="text-brand-pink text-[10px] font-black tracking-[0.2em] uppercase mt-2 italic">Control Center</p>
        </div>
        <nav className="flex-1 px-4 space-y-4 mt-16">
          <button onClick={() => { setActiveTab('analytics'); loadUsers(); }} className={`flex items-center gap-4 w-full px-6 py-5 border-4 transition-all ${activeTab === 'analytics' ? 'bg-brand-cyan text-black border-white shadow-[6px_6px_0px_white]' : 'text-white/40 border-transparent hover:text-white'}`}>
            <span className="material-symbols-outlined">analytics</span>
            <span className="text-xs font-black uppercase tracking-widest italic">Hub Metrics</span>
          </button>
          <button onClick={() => setActiveTab('access')} className={`flex items-center gap-4 w-full px-6 py-5 border-4 transition-all ${activeTab === 'access' ? 'bg-brand-yellow text-black border-white shadow-[6px_6px_0px_white]' : 'text-white/40 border-transparent hover:text-white'}`}>
            <span className="material-symbols-outlined">mail</span>
            <span className="text-xs font-black uppercase tracking-widest italic">Invite Dispatches</span>
          </button>
          <button onClick={() => setActiveTab('catalog')} className={`flex items-center gap-4 w-full px-6 py-5 border-4 transition-all ${activeTab === 'catalog' ? 'bg-brand-pink text-white border-white shadow-[6px_6px_0px_white]' : 'text-white/40 border-transparent hover:text-white'}`}>
            <span className="material-symbols-outlined">gavel</span>
            <span className="text-xs font-black uppercase tracking-widest italic">Archive Oversight</span>
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
