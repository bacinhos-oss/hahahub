import React, { useState, useEffect } from 'react';
import { User, Show } from '../types';

interface ProducerStudioProps {
  user: User;
  shows: Show[];
}

type StudioTab = 'dashboard' | 'schedule' | 'contracts' | 'calculator' | 'contacts' | 'log';

const STORAGE_KEY = 'hahahub_studio_';

function load(key: string) {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY + key) || '[]'); } catch { return []; }
}
function save(key: string, data: any) {
  localStorage.setItem(STORAGE_KEY + key, JSON.stringify(data));
}

const ProducerStudio: React.FC<ProducerStudioProps> = ({ user, shows }) => {
  const [tab, setTab] = useState<StudioTab>('dashboard');

  const myShows = shows.filter((s: any) => s.user_id === user.id);

  // SCHEDULE STATE
  const [performances, setPerformances] = useState<any[]>(() => load('performances'));
  const [newPerf, setNewPerf] = useState({ date: '', time: '19:00', venue: '', city: '', show: '', techEmail: '', status: 'confirmed' });
  const [perfSaved, setPerfSaved] = useState(false);
  const [editPerfIdx, setEditPerfIdx] = useState<number | null>(null);

  // CONTRACTS STATE
  const [contracts, setContracts] = useState<any[]>(() => load('contracts'));
  const [showContractForm, setShowContractForm] = useState(false);
  const [newContract, setNewContract] = useState({ title: '', show: '', party: '', type: 'licensing', status: 'draft', date: '', notes: '' });
  const [editContractIdx, setEditContractIdx] = useState<number | null>(null);
  const [contractText, setContractText] = useState<string | null>(null);
  const [contractTextIdx, setContractTextIdx] = useState<number | null>(null);

  // CALCULATOR STATE
  const [calc, setCalc] = useState({ performances: '20', ticketPrice: '25', seats: '200', occupancy: '80', royaltyPct: '10', actorFee: '200', actorCount: '5', techFee: '150', techCount: '3', otherFee: '0', otherCount: '0' });

  // CONTACTS STATE
  const [contacts, setContacts] = useState<any[]>(() => load('contacts'));
  const [showContactForm, setShowContactForm] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', role: '', email: '', phone: '', org: '', notes: '' });

  // LOG STATE
  const [logs, setLogs] = useState<any[]>(() => load('logs'));
  const [newLog, setNewLog] = useState({ date: new Date().toISOString().split('T')[0], show: '', venue: '', attendance: '', notes: '' });

  // Save to localStorage on change
  useEffect(() => { save('performances', performances); }, [performances]);
  useEffect(() => { save('contracts', contracts); }, [contracts]);
  useEffect(() => { save('contacts', contacts); }, [contacts]);
  useEffect(() => { save('logs', logs); }, [logs]);

  // CALCULATOR
  const gross = Number(calc.ticketPrice) * Number(calc.seats) * (Number(calc.occupancy) / 100) * Number(calc.performances);
  const royalty = gross * Number(calc.royaltyPct) / 100;
  const actors = Number(calc.actorFee) * Number(calc.actorCount) * Number(calc.performances);
  const techs = Number(calc.techFee) * Number(calc.techCount) * Number(calc.performances);
  const other = Number(calc.otherFee) * Number(calc.otherCount) * Number(calc.performances);
  const totalCosts = actors + techs + other;
  const net = royalty - totalCosts;

  const inp = 'w-full bg-brand-black border-2 border-white/20 p-2 text-white font-bold outline-none focus:border-brand-yellow text-sm';
  const lbl = 'text-[9px] font-black uppercase tracking-widest text-white/40 italic mb-1 block';

  const tabs: { key: StudioTab; label: string; icon: string }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { key: 'schedule', label: 'Schedule', icon: 'calendar_month' },
    { key: 'contracts', label: 'Contracts', icon: 'description' },
    { key: 'calculator', label: 'Calculator', icon: 'calculate' },
    { key: 'contacts', label: 'Contacts', icon: 'contacts' },
    { key: 'log', label: 'Show Log', icon: 'history' },
  ];

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-4xl font-black uppercase italic">🎬 Producer <span className="text-brand-pink">Studio</span></h2>
        <p className="text-white/40 font-bold italic text-sm mt-1">ROAR exclusive · Your production command center</p>
        <p className="text-brand-yellow/60 text-[9px] font-black uppercase italic tracking-widest mt-2">⚠ Studio data is saved on this device only. Use the same browser to access your data.</p>
      </div>

      {/* STUDIO TABS */}
      <div className="flex gap-2 flex-wrap border-b-2 border-white/10 pb-4">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase italic transition-all border-2 ${tab === t.key ? 'bg-brand-pink text-white border-brand-pink' : 'border-white/20 text-white/40 hover:border-white hover:text-white'}`}>
            <span className="material-symbols-outlined text-sm">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── DASHBOARD ── */}
      {tab === 'dashboard' && (
        <div className="space-y-6">
          {myShows.length === 0 ? (
            <p className="text-white/20 italic">No shows uploaded yet.</p>
          ) : myShows.map((show: any) => {
            const showPerfs = performances.filter(p => p.show === show.title);
            const nextPerf = showPerfs.filter(p => new Date(p.date) >= new Date()).sort((a, b) => a.date.localeCompare(b.date))[0];
            const showContracts = contracts.filter(c => c.show === show.title);
            const showLogs = logs.filter(l => l.show === show.title);
            const totalAtt = showLogs.reduce((s: number, l: any) => s + (Number(l.attendance) || 0), 0);
            return (
              <div key={show.id} className="border-4 border-white/20 hover:border-brand-yellow transition-all">
                <div className="flex items-center justify-between gap-4 p-4 border-b-2 border-white/10">
                  <div>
                    <p className="font-black uppercase italic text-white text-lg">{show.title}</p>
                    <p className="text-white/30 text-xs">{show.genre} · {show.location}</p>
                  </div>
                  <select 
                    value={(() => { try { return JSON.parse(localStorage.getItem('hahahub_studio_status') || '{}')[show.id] || 'available'; } catch { return 'available'; } })()}
                    onChange={e => {
                      try {
                        const st = JSON.parse(localStorage.getItem('hahahub_studio_status') || '{}');
                        st[show.id] = e.target.value;
                        localStorage.setItem('hahahub_studio_status', JSON.stringify(st));
                      } catch {}
                    }}
                    className="bg-brand-black border-2 border-white/20 text-white font-black uppercase italic text-xs px-3 py-2 outline-none focus:border-brand-yellow">
                    <option value="available">Available</option>
                    <option value="negotiating">In Negotiation</option>
                    <option value="licensed">Licensed</option>
                    <option value="running">Running</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
                  <div className="p-4 border-r border-white/10">
                    <p className="text-[9px] font-black uppercase text-white/30 italic mb-1">Performances</p>
                    <p className="text-2xl font-black text-brand-yellow">{showPerfs.length}</p>
                  </div>
                  <div className="p-4 border-r border-white/10">
                    <p className="text-[9px] font-black uppercase text-white/30 italic mb-1">Next Show</p>
                    <p className="text-sm font-black text-white">{nextPerf ? new Date(nextPerf.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}</p>
                    <p className="text-[9px] text-white/30 italic">{nextPerf?.venue || ''}</p>
                  </div>
                  <div className="p-4 border-r border-white/10">
                    <p className="text-[9px] font-black uppercase text-white/30 italic mb-1">Contracts</p>
                    <p className="text-2xl font-black text-brand-cyan">{showContracts.length}</p>
                  </div>
                  <div className="p-4">
                    <p className="text-[9px] font-black uppercase text-white/30 italic mb-1">Total Audience</p>
                    <p className="text-2xl font-black text-brand-pink">{totalAtt.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── SCHEDULE ── */}
      {tab === 'schedule' && (
        <div className="space-y-6">
          <div className="border-4 border-brand-yellow/30 p-4 space-y-4">
            <p className="text-[9px] font-black uppercase italic text-brand-yellow tracking-widest">Add Performance</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div><label className={lbl}>Date</label><input type="date" value={newPerf.date} onChange={e => setNewPerf(p => ({...p, date: e.target.value}))} className={inp} /></div>
              <div><label className={lbl}>Time</label><input type="time" value={newPerf.time} onChange={e => setNewPerf(p => ({...p, time: e.target.value}))} className={inp} /></div>
              <div><label className={lbl}>Show</label>
                <select value={newPerf.show} onChange={e => setNewPerf(p => ({...p, show: e.target.value}))} className={inp}>
                  <option value="">Select show...</option>
                  {myShows.map((s: any) => <option key={s.id} value={s.title}>{s.title}</option>)}
                </select>
              </div>
              <div><label className={lbl}>Venue</label><input placeholder="Theatre name" value={newPerf.venue} onChange={e => setNewPerf(p => ({...p, venue: e.target.value}))} className={inp} /></div>
              <div><label className={lbl}>City</label><input placeholder="City" value={newPerf.city} onChange={e => setNewPerf(p => ({...p, city: e.target.value}))} className={inp} /></div>
              <div><label className={lbl}>Status</label>
                <select value={newPerf.status} onChange={e => setNewPerf(p => ({...p, status: e.target.value}))} className={inp}>
                  <option value="confirmed">Confirmed</option>
                  <option value="tentative">Tentative</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="col-span-2 md:col-span-3">
                <label className={lbl}>Tech/Crew Email <span className="text-brand-cyan">(receives show dossier automatically)</span></label>
                <input type="email" placeholder="technician@theatre.com" value={newPerf.techEmail} onChange={e => setNewPerf(p => ({...p, techEmail: e.target.value}))} className={inp} />
              </div>
            </div>
            <button onClick={() => {
              if (!newPerf.date || !newPerf.venue || !newPerf.show) return;
              const show = myShows.find((s: any) => s.title === newPerf.show);
              
              // Send email immediately on save if tech email provided
              if (newPerf.techEmail) {
                const subject = encodeURIComponent(`Tech Brief — ${newPerf.show} — ${newPerf.date}`);
                const body = encodeURIComponent(`Dear Colleague,

You are confirmed for:

Show: ${newPerf.show}
Date: ${newPerf.date} at ${newPerf.time}
Venue: ${newPerf.venue}, ${newPerf.city}

Show details:
Genre: ${show?.genre || '—'}
Duration: ${show?.duration || '—'} min
Cast: ${show?.maleRoles || 0}M + ${show?.femaleRoles || 0}F

Full production dossier: https://hahahub.art

Break a Laffing Leg!
${user.name}`);
                const a = document.createElement('a');
                a.href = `mailto:${newPerf.techEmail}?subject=${subject}&body=${body}`;
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }

              if (editPerfIdx !== null) {
                // UPDATE existing
                setPerformances(prev => prev.map((p, i) => i === editPerfIdx ? { ...newPerf, id: p.id } : p).sort((a, b) => a.date.localeCompare(b.date)));
                setEditPerfIdx(null);
              } else {
                // ADD new
                setPerformances(prev => [...prev, { ...newPerf, id: Date.now().toString() }].sort((a, b) => a.date.localeCompare(b.date)));
              }
              setNewPerf({ date: '', time: '19:00', venue: '', city: '', show: '', techEmail: '', status: 'confirmed' });
              setPerfSaved(true); setTimeout(() => setPerfSaved(false), 3000);
            }} className="bg-brand-yellow text-black px-6 py-2 font-black uppercase italic text-xs border-2 border-black hover:bg-white transition-all">
              {editPerfIdx !== null ? 'Update Performance' : `+ Add Performance${newPerf.techEmail ? ' & Send Dossier' : ''}`}
            </button>
            {newPerf.techEmail && <p className="text-white/30 text-[9px] font-black italic">✓ Your email client will open — click Send to dispatch the tech brief.</p>}
            {perfSaved && <p className="text-brand-cyan text-xs font-black italic">✓ Performance added!</p>}
          </div>

          {performances.length === 0 ? (
            <p className="text-white/20 italic text-sm">No performances scheduled.</p>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-6 gap-2 text-[9px] font-black uppercase italic text-white/30 px-4 pb-2">
                <span>Date</span><span>Time</span><span>Show</span><span>Venue</span><span>City</span><span>Status</span>
              </div>
              {performances.map((p, i) => (
                <div key={p.id || i} className={`border-2 px-4 py-3 grid grid-cols-6 gap-2 items-center transition-all ${p.status === 'cancelled' ? 'border-red-500/20 opacity-40' : p.status === 'tentative' ? 'border-brand-yellow/30' : 'border-white/10 hover:border-brand-yellow'}`}>
                  <span className="text-brand-yellow font-black text-sm">{new Date(p.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}</span>
                  <span className="text-white/60 text-sm">{p.time}</span>
                  <span className="text-white font-black italic text-xs truncate">{p.show}</span>
                  <span className="text-white/60 text-xs truncate">{p.venue}</span>
                  <span className="text-white/40 text-xs">{p.city}</span>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 ${p.status === 'confirmed' ? 'bg-brand-cyan text-black' : p.status === 'tentative' ? 'bg-brand-yellow text-black' : 'bg-red-500/30 text-red-400'}`}>{p.status}</span>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditPerfIdx(i); setNewPerf({...p}); }} className="text-white/20 hover:text-brand-yellow transition-colors">
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button onClick={() => setPerformances(prev => prev.filter((_, j) => j !== i))} className="text-white/20 hover:text-brand-pink transition-colors">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── CONTRACTS ── */}
      {tab === 'contracts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-[9px] font-black uppercase italic text-white/30 tracking-widest">{contracts.length} contracts</p>
            <button onClick={() => setShowContractForm(!showContractForm)}
              className="bg-brand-yellow text-black px-4 py-2 font-black uppercase italic text-xs border-2 border-black hover:bg-white transition-all">
              + New Contract
            </button>
          </div>

          {showContractForm && (
            <div className="border-4 border-brand-yellow/30 p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className={lbl}>Contract Title</label><input placeholder="e.g. Licensing — Show Title" value={newContract.title} onChange={e => setNewContract(p => ({...p, title: e.target.value}))} className={inp} /></div>
                <div><label className={lbl}>Show</label>
                  <select value={newContract.show} onChange={e => setNewContract(p => ({...p, show: e.target.value}))} className={inp}>
                    <option value="">Select show...</option>
                    {myShows.map((s: any) => <option key={s.id} value={s.title}>{s.title}</option>)}
                  </select>
                </div>
                <div><label className={lbl}>Counter Party</label><input placeholder="Name / Company" value={newContract.party} onChange={e => setNewContract(p => ({...p, party: e.target.value}))} className={inp} /></div>
                <div><label className={lbl}>Type</label>
                  <select value={newContract.type} onChange={e => setNewContract(p => ({...p, type: e.target.value}))} className={inp}>
                    <option value="licensing">Licensing Agreement</option>
                    <option value="coproduction">Co-production</option>
                    <option value="guest">Guest Performance</option>
                    <option value="actor">Actor Contract</option>
                    <option value="tech">Technical Contract</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div><label className={lbl}>Date</label><input type="date" value={newContract.date} onChange={e => setNewContract(p => ({...p, date: e.target.value}))} className={inp} /></div>
                <div><label className={lbl}>Status</label>
                  <select value={newContract.status} onChange={e => setNewContract(p => ({...p, status: e.target.value}))} className={inp}>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="signed">Signed</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                <div className="col-span-2"><label className={lbl}>Notes</label><textarea rows={2} value={newContract.notes} onChange={e => setNewContract(p => ({...p, notes: e.target.value}))} className={inp + ' resize-none'} /></div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => {
                  if (!newContract.title) return;
                  setContracts(prev => [...prev, { ...newContract, id: Date.now().toString() }]);
                  setNewContract({ title: '', show: '', party: '', type: 'licensing', status: 'draft', date: '', notes: '' });
                  setShowContractForm(false);
                }} className="bg-brand-yellow text-black px-6 py-2 font-black uppercase italic text-xs border-2 border-black">Save</button>
                <button onClick={() => setShowContractForm(false)} className="border-2 border-white/20 text-white/40 px-4 py-2 font-black uppercase italic text-xs">Cancel</button>
              </div>
            </div>
          )}

          {/* Template contracts */}
          <div className="space-y-2">
            <p className="text-[9px] font-black uppercase italic text-brand-cyan tracking-widest">Sample Templates</p>
            {[
              { label: 'Licensing Agreement', type: 'licensing' },
              { label: 'Co-production Agreement', type: 'coproduction' },
              { label: 'Guest Performance Contract', type: 'guest' },
            ].map((tmpl, i) => (
              <div key={i} className="border-2 border-brand-cyan/20 px-4 py-3 flex items-center justify-between gap-4 hover:border-brand-cyan transition-all">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-brand-cyan text-sm">description</span>
                  <span className="text-white font-black uppercase italic text-xs">{tmpl.label}</span>
                  <span className="text-[8px] font-black uppercase bg-brand-cyan/20 text-brand-cyan px-2 py-0.5">Template</span>
                </div>
                <button onClick={() => {
                  const show = myShows[0];
                  const today = new Date().toISOString().split('T')[0];
                  const filled = tmpl.label === 'Licensing Agreement' 
                    ? `THEATRICAL LICENSING AGREEMENT

Date: ${today}
Rights Holder: ${user.name}
Show: ${show?.title || '[SHOW TITLE]'}
Licensee: [LICENSEE NAME]
Territory: [COUNTRY]
Duration: [START] to [END]
Performances: [NUMBER]
Royalty: [X] pct of gross box office

Rights Holder: ___________________ Date: _______
Licensee: ___________________ Date: _______`
                    : `${tmpl.label.toUpperCase()}

Date: ${today}
Party A: ${user.name}
Party B: [OTHER PARTY]
Show: ${show?.title || '[SHOW TITLE]'}

[Fill in terms...]

Party A: ___________________ Date: _______
Party B: ___________________ Date: _______`;
                  const w = window.open('', '_blank');
                  if (w) { w.document.write('<pre style="font-family:monospace;padding:40px;font-size:14px;">' + filled + '</pre>'); w.print(); }
                }} className="text-[9px] font-black uppercase italic text-brand-cyan border border-brand-cyan/40 px-3 py-1 hover:bg-brand-cyan hover:text-black transition-all">
                  Fill & Print →
                </button>
              </div>
            ))}
          </div>

          {contracts.length > 0 && (
            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase italic text-white/30 tracking-widest">My Contracts</p>
              {contracts.map((c, i) => (
                <div key={c.id || i} className="border-2 border-white/10 px-4 py-3 hover:border-brand-yellow transition-all">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-black uppercase italic text-white text-sm truncate">{c.title}</p>
                      <p className="text-white/30 text-xs">{c.party} · {c.show} · {c.date}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 ${c.status === 'signed' ? 'bg-brand-cyan text-black' : c.status === 'sent' ? 'bg-brand-yellow text-black' : c.status === 'expired' ? 'bg-red-500/30 text-red-400' : 'border border-white/20 text-white/40'}`}>{c.status}</span>
                      <button onClick={() => { setContractTextIdx(i); setContractText(c.body || c.notes || ''); }} className="text-white/20 hover:text-brand-yellow transition-colors" title="Edit document">
                        <span className="material-symbols-outlined text-sm">edit_document</span>
                      </button>
                      <button onClick={() => setContracts(prev => prev.filter((_, j) => j !== i))} className="text-white/20 hover:text-brand-pink transition-colors">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                  {/* Inline contract editor */}
                  {contractTextIdx === i && (
                    <div className="mt-3 space-y-2">
                      <textarea
                        value={contractText || ''}
                        onChange={e => setContractText(e.target.value)}
                        rows={12}
                        className="w-full bg-black border-2 border-brand-yellow/40 p-4 text-white/80 font-mono text-xs outline-none focus:border-brand-yellow resize-y"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => {
                          setContracts(prev => prev.map((x, j) => j === i ? { ...x, body: contractText } : x));
                          setContractTextIdx(null);
                          setContractText(null);
                        }} className="bg-brand-yellow text-black px-4 py-2 font-black uppercase italic text-xs border-2 border-black">Save</button>
                        <button onClick={() => {
                          const blob = new Blob([contractText || ''], { type: 'text/plain' });
                          const a = document.createElement('a');
                          a.href = URL.createObjectURL(blob);
                          a.download = (c.title || 'contract') + '.txt';
                          a.click();
                        }} className="border-2 border-brand-cyan/40 text-brand-cyan px-4 py-2 font-black uppercase italic text-xs hover:bg-brand-cyan hover:text-black transition-all">Download</button>
                        <button onClick={() => { setContractTextIdx(null); setContractText(null); }} className="border-2 border-white/20 text-white/40 px-4 py-2 font-black uppercase italic text-xs">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── CALCULATOR ── */}
      {tab === 'calculator' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 border-4 border-white/10 p-4">
              <p className="text-[9px] font-black uppercase italic text-brand-yellow tracking-widest">Revenue</p>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={lbl}>Performances</label><input type="number" value={calc.performances} onChange={e => setCalc(p => ({...p, performances: e.target.value}))} className={inp} /></div>
                <div><label className={lbl}>Ticket Price (€)</label><input type="number" value={calc.ticketPrice} onChange={e => setCalc(p => ({...p, ticketPrice: e.target.value}))} className={inp} /></div>
                <div><label className={lbl}>Seats</label><input type="number" value={calc.seats} onChange={e => setCalc(p => ({...p, seats: e.target.value}))} className={inp} /></div>
                <div><label className={lbl}>Occupancy (%)</label><input type="number" value={calc.occupancy} onChange={e => setCalc(p => ({...p, occupancy: e.target.value}))} className={inp} /></div>
                <div className="col-span-2"><label className={lbl}>Royalty / Author Fee (%)</label><input type="number" value={calc.royaltyPct} onChange={e => setCalc(p => ({...p, royaltyPct: e.target.value}))} className={inp} /></div>
              </div>
            </div>

            <div className="space-y-4 border-4 border-white/10 p-4">
              <p className="text-[9px] font-black uppercase italic text-brand-pink tracking-widest">Costs per Performance</p>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={lbl}>Actor Fee (€)</label><input type="number" value={calc.actorFee} onChange={e => setCalc(p => ({...p, actorFee: e.target.value}))} className={inp} /></div>
                <div><label className={lbl}>No. of Actors</label><input type="number" value={calc.actorCount} onChange={e => setCalc(p => ({...p, actorCount: e.target.value}))} className={inp} /></div>
                <div><label className={lbl}>Tech Fee (€)</label><input type="number" value={calc.techFee} onChange={e => setCalc(p => ({...p, techFee: e.target.value}))} className={inp} /></div>
                <div><label className={lbl}>No. of Techs</label><input type="number" value={calc.techCount} onChange={e => setCalc(p => ({...p, techCount: e.target.value}))} className={inp} /></div>
                <div><label className={lbl}>Other Staff (€)</label><input type="number" value={calc.otherFee} onChange={e => setCalc(p => ({...p, otherFee: e.target.value}))} className={inp} /></div>
                <div><label className={lbl}>No. of Other</label><input type="number" value={calc.otherCount} onChange={e => setCalc(p => ({...p, otherCount: e.target.value}))} className={inp} /></div>
              </div>
            </div>
          </div>

          {/* RESULTS */}
          <div className="border-4 border-brand-yellow p-6 grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-[9px] font-black uppercase text-white/30 italic mb-1">Gross Revenue</p>
              <p className="text-xl font-black text-white">€{Math.round(gross).toLocaleString()}</p>
            </div>
            <div className="text-center border-l border-white/10">
              <p className="text-[9px] font-black uppercase text-brand-yellow/60 italic mb-1">Royalty / Author</p>
              <p className="text-xl font-black text-brand-yellow">€{Math.round(royalty).toLocaleString()}</p>
            </div>
            <div className="text-center border-l border-white/10">
              <p className="text-[9px] font-black uppercase text-brand-pink/60 italic mb-1">Total Costs</p>
              <p className="text-xl font-black text-brand-pink">€{Math.round(totalCosts).toLocaleString()}</p>
            </div>
            <div className="text-center border-l border-white/10 col-span-2 md:col-span-1">
              <p className="text-[9px] font-black uppercase text-white/30 italic mb-1">Breakdown</p>
              <p className="text-xs text-white/40 italic">Actors: €{Math.round(actors).toLocaleString()}</p>
              <p className="text-xs text-white/40 italic">Techs: €{Math.round(techs).toLocaleString()}</p>
              {other > 0 && <p className="text-xs text-white/40 italic">Other: €{Math.round(other).toLocaleString()}</p>}
            </div>
            <div className={`text-center border-l border-white/10 col-span-2 md:col-span-1 ${net >= 0 ? 'bg-brand-cyan/10' : 'bg-red-500/10'}`}>
              <p className="text-[9px] font-black uppercase italic mb-1" style={{color: net >= 0 ? '#03DAC6' : '#ef4444'}}>Net for Producer</p>
              <p className="text-2xl font-black" style={{color: net >= 0 ? '#03DAC6' : '#ef4444'}}>€{Math.round(net).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── CONTACTS ── */}
      {tab === 'contacts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[9px] font-black uppercase italic text-white/30 tracking-widest">{contacts.length} contacts</p>
            <button onClick={() => setShowContactForm(!showContactForm)}
              className="bg-brand-yellow text-black px-4 py-2 font-black uppercase italic text-xs border-2 border-black hover:bg-white transition-all">
              + Add Contact
            </button>
          </div>

          {showContactForm && (
            <div className="border-4 border-brand-yellow/30 p-4 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div><label className={lbl}>Name</label><input value={newContact.name} onChange={e => setNewContact(p => ({...p, name: e.target.value}))} className={inp} /></div>
                <div><label className={lbl}>Role</label><input placeholder="Director / Tech / Agent..." value={newContact.role} onChange={e => setNewContact(p => ({...p, role: e.target.value}))} className={inp} /></div>
                <div><label className={lbl}>Organisation</label><input value={newContact.org} onChange={e => setNewContact(p => ({...p, org: e.target.value}))} className={inp} /></div>
                <div><label className={lbl}>Email</label><input type="email" value={newContact.email} onChange={e => setNewContact(p => ({...p, email: e.target.value}))} className={inp} /></div>
                <div><label className={lbl}>Phone</label><input type="tel" value={newContact.phone} onChange={e => setNewContact(p => ({...p, phone: e.target.value}))} className={inp} /></div>
                <div><label className={lbl}>Notes</label><input value={newContact.notes} onChange={e => setNewContact(p => ({...p, notes: e.target.value}))} className={inp} /></div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => {
                  if (!newContact.name) return;
                  setContacts(prev => [...prev, { ...newContact, id: Date.now().toString() }]);
                  setNewContact({ name: '', role: '', email: '', phone: '', org: '', notes: '' });
                  setShowContactForm(false);
                }} className="bg-brand-yellow text-black px-6 py-2 font-black uppercase italic text-xs border-2 border-black">Save</button>
                <button onClick={() => setShowContactForm(false)} className="border-2 border-white/20 text-white/40 px-4 py-2 font-black uppercase italic text-xs">Cancel</button>
              </div>
            </div>
          )}

          {contacts.length === 0 ? (
            <p className="text-white/20 italic text-sm">No contacts yet.</p>
          ) : (
            <div className="space-y-2">
              {contacts.map((c, i) => (
                <div key={c.id || i} className="border-2 border-white/10 px-4 py-3 flex items-center justify-between gap-4 hover:border-brand-yellow transition-all">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 bg-brand-pink/20 border-2 border-brand-pink/30 flex items-center justify-center flex-shrink-0">
                      <span className="font-black text-brand-pink text-sm">{c.name[0]}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-black uppercase italic text-white text-sm">{c.name}</p>
                      <p className="text-white/30 text-xs">{c.role}{c.org ? ` · ${c.org}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {c.email && <a href={`mailto:${c.email}`} className="text-brand-cyan text-[9px] font-black uppercase italic hover:underline">{c.email}</a>}
                    {c.phone && <span className="text-white/40 text-xs">{c.phone}</span>}
                    <button onClick={() => setContacts(prev => prev.filter((_, j) => j !== i))} className="text-white/20 hover:text-brand-pink transition-colors">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SHOW LOG ── */}
      {tab === 'log' && (
        <div className="space-y-6">
          <div className="border-4 border-white/10 p-4 space-y-4">
            <p className="text-[9px] font-black uppercase italic text-white/30 tracking-widest">Log a Performance</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><label className={lbl}>Date</label><input type="date" value={newLog.date} onChange={e => setNewLog(p => ({...p, date: e.target.value}))} className={inp} /></div>
              <div><label className={lbl}>Show</label>
                <select value={newLog.show} onChange={e => setNewLog(p => ({...p, show: e.target.value}))} className={inp}>
                  <option value="">Select...</option>
                  {myShows.map((s: any) => <option key={s.id} value={s.title}>{s.title}</option>)}
                </select>
              </div>
              <div><label className={lbl}>Venue</label><input value={newLog.venue} onChange={e => setNewLog(p => ({...p, venue: e.target.value}))} className={inp} /></div>
              <div><label className={lbl}>Attendance</label><input type="number" value={newLog.attendance} onChange={e => setNewLog(p => ({...p, attendance: e.target.value}))} className={inp} /></div>
              <div className="col-span-2 md:col-span-4"><label className={lbl}>Notes</label><textarea rows={2} value={newLog.notes} onChange={e => setNewLog(p => ({...p, notes: e.target.value}))} placeholder="How did it go? Technical issues, audience reaction, notes for next time..." className={inp + ' resize-none'} /></div>
            </div>
            <button onClick={() => {
              if (!newLog.date || !newLog.show) return;
              setLogs(prev => [{ ...newLog, id: Date.now().toString() }, ...prev]);
              setNewLog({ date: new Date().toISOString().split('T')[0], show: '', venue: '', attendance: '', notes: '' });
            }} className="bg-brand-yellow text-black px-6 py-2 font-black uppercase italic text-xs border-2 border-black hover:bg-white transition-all">
              + Add Log Entry
            </button>
          </div>

          {logs.length === 0 ? (
            <p className="text-white/20 italic text-sm">No performance logs yet.</p>
          ) : (
            <div className="space-y-3">
              {logs.map((l, i) => (
                <div key={l.id || i} className="border-2 border-white/10 p-4 hover:border-brand-cyan transition-all">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-brand-yellow font-black text-sm">{new Date(l.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span className="text-white font-black italic text-sm">{l.show}</span>
                      {l.venue && <span className="text-white/40 text-xs italic">{l.venue}</span>}
                      {l.attendance && <span className="text-brand-cyan text-xs font-black">{Number(l.attendance).toLocaleString()} pax</span>}
                    </div>
                    <button onClick={() => setLogs(prev => prev.filter((_, j) => j !== i))} className="text-white/20 hover:text-brand-pink transition-colors flex-shrink-0">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                  {l.notes && <p className="text-white/40 text-sm italic border-l-2 border-white/10 pl-3">{l.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ProducerStudio;
