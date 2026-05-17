import React, { useState, useEffect } from 'react';
import { User, Show } from '../types';

interface ProducerStudioProps {
  user: User;
  shows: Show[];
}

type StudioTab = 'dashboard' | 'royalty' | 'contracts' | 'calculator' | 'contacts' | 'log';

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

  // ROYALTY TRACKER STATE
  const [royaltyReports, setRoyaltyReports] = useState<any[]>(() => load('royalty_reports'));
  const [newReport, setNewReport] = useState({ date: '', show: '', venue: '', tickets: '', price: '', royaltyPct: '', notes: '' });
  const [reportSaved, setReportSaved] = useState(false);

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
  useEffect(() => { save('royalty_reports', royaltyReports); }, [royaltyReports]);
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
    { key: 'royalty', label: 'Royalty Tracker', icon: 'receipt_long' },
    { key: 'contracts', label: 'Contracts', icon: 'description' },
    { key: 'calculator', label: 'Calculator', icon: 'calculate' },
    { key: 'contacts', label: 'Contacts', icon: 'contacts' },
    { key: 'log', label: 'Show Log', icon: 'history' },
  ];

  return (
    <section className="space-y-6 text-white">
      <div>
        <h2 className="text-4xl font-black uppercase italic">Producer <span className="text-brand-pink">Studio</span></h2>
        <p className="text-white/40 font-bold italic text-sm mt-1">ROAR exclusive · Your production command center</p>
        <p className="text-brand-yellow/60 text-[9px] font-black uppercase italic tracking-widest mt-2">Studio data is saved on this device only. Use the same browser to access your data.</p>
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
            const showPerfs = royaltyReports.filter((p: any) => p.show === show.title);
            const nextPerf = showPerfs.slice(-1)[0];
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
                    <p className="text-[9px] font-black uppercase text-white/30 italic mb-1">Last Show</p>
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
      {/* ── ROYALTY TRACKER ── */}
      {tab === 'royalty' && (
        <div className="space-y-6">
          <p className="text-white/40 font-bold italic text-sm">Log each performance. The rights holder sees your reports automatically.</p>

          {/* ADD REPORT FORM */}
          <div className="border-4 border-brand-yellow/30 p-4 space-y-4">
            <p className="text-[9px] font-black uppercase italic text-brand-yellow tracking-widest">Log Performance</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div><label className={lbl}>Date</label><input type="date" value={newReport.date} onChange={e => setNewReport(p => ({...p, date: e.target.value}))} className={inp} /></div>
              <div><label className={lbl}>Show</label>
                <select value={newReport.show} onChange={e => setNewReport(p => ({...p, show: e.target.value}))} className={inp}>
                  <option value="">Select show...</option>
                  {myShows.map((s: any) => <option key={s.id} value={s.title}>{s.title}</option>)}
                </select>
              </div>
              <div><label className={lbl}>Venue</label><input placeholder="Theatre name" value={newReport.venue} onChange={e => setNewReport(p => ({...p, venue: e.target.value}))} className={inp} /></div>
              <div><label className={lbl}>Tickets Sold</label><input type="number" placeholder="e.g. 180" value={newReport.tickets} onChange={e => setNewReport(p => ({...p, tickets: e.target.value}))} className={inp} /></div>
              <div><label className={lbl}>Ticket Price (€)</label><input type="number" placeholder="e.g. 25" value={newReport.price} onChange={e => setNewReport(p => ({...p, price: e.target.value}))} className={inp} /></div>
              <div><label className={lbl}>Royalty %</label><input type="number" placeholder="e.g. 10" value={newReport.royaltyPct} onChange={e => setNewReport(p => ({...p, royaltyPct: e.target.value}))} className={inp} /></div>
              <div className="col-span-2 md:col-span-3"><label className={lbl}>Notes</label><input placeholder="Optional notes..." value={newReport.notes} onChange={e => setNewReport(p => ({...p, notes: e.target.value}))} className={inp} /></div>
            </div>

            {/* LIVE CALC */}
            {newReport.tickets && newReport.price && newReport.royaltyPct && (
              <div className="bg-brand-black border-4 border-brand-cyan p-4 flex items-center gap-8">
                <div>
                  <p className="text-[9px] font-black uppercase text-white/30 italic">Gross Box Office</p>
                  <p className="text-2xl font-black text-white">€{Math.round(Number(newReport.tickets) * Number(newReport.price)).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase text-brand-yellow italic">Royalty Due</p>
                  <p className="text-2xl font-black text-brand-yellow">€{Math.round(Number(newReport.tickets) * Number(newReport.price) * Number(newReport.royaltyPct) / 100).toLocaleString()}</p>
                </div>
              </div>
            )}

            <button onClick={() => {
              if (!newReport.date || !newReport.show || !newReport.tickets) return;
              const royaltyAmount = Math.round(Number(newReport.tickets) * Number(newReport.price) * Number(newReport.royaltyPct) / 100);
              const gross = Math.round(Number(newReport.tickets) * Number(newReport.price));
              const report = { ...newReport, id: Date.now().toString(), royaltyAmount, gross };
              setRoyaltyReports(prev => [report, ...prev]);
              setNewReport({ date: '', show: '', venue: '', tickets: '', price: '', royaltyPct: '', notes: '' });
              setReportSaved(true); setTimeout(() => setReportSaved(false), 3000);
            }} className="bg-brand-yellow text-black px-6 py-2 font-black uppercase italic text-xs border-2 border-black hover:bg-white transition-all">
              + Log Performance
            </button>
            {reportSaved && <p className="text-brand-cyan text-xs font-black italic">✓ Performance logged!</p>}
          </div>

          {/* SUMMARY */}
          {royaltyReports.length > 0 && (
            <div className="border-4 border-white/10 p-4 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-[9px] font-black uppercase text-white/30 italic">Total Performances</p>
                <p className="text-3xl font-black text-white">{royaltyReports.length}</p>
              </div>
              <div className="text-center border-x border-white/10">
                <p className="text-[9px] font-black uppercase text-white/30 italic">Total Box Office</p>
                <p className="text-3xl font-black text-brand-cyan">€{royaltyReports.reduce((s, r) => s + (r.gross || 0), 0).toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black uppercase text-brand-yellow italic">Total Royalties Due</p>
                <p className="text-3xl font-black text-brand-yellow">€{royaltyReports.reduce((s, r) => s + (r.royaltyAmount || 0), 0).toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* SELLER VIEW — reports from buyers for my shows */}
          <div className="border-t-4 border-white/10 pt-6 space-y-4">
            <p className="text-[9px] font-black uppercase italic text-brand-pink tracking-widest">Rights Holder View — Reports on Your Shows</p>
            {myShows.length === 0 ? (
              <p className="text-white/20 italic text-sm">No shows uploaded yet.</p>
            ) : (
              <div className="space-y-3">
                {myShows.map((show: any) => {
                  const showReports = royaltyReports.filter((r: any) => r.show === show.title);
                  const totalRoyalty = showReports.reduce((s: number, r: any) => s + (r.royaltyAmount || 0), 0);
                  const totalGross = showReports.reduce((s: number, r: any) => s + (r.gross || 0), 0);
                  return (
                    <div key={show.id} className="border-4 border-white/10 p-4 hover:border-brand-pink transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-black uppercase italic text-white">{show.title}</p>
                        <span className="text-brand-pink font-black text-lg">€{totalRoyalty.toLocaleString()} due</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <p className="text-[9px] font-black uppercase text-white/30 italic">Performances</p>
                          <p className="text-xl font-black text-white">{showReports.length}</p>
                        </div>
                        <div className="border-x border-white/10">
                          <p className="text-[9px] font-black uppercase text-white/30 italic">Box Office</p>
                          <p className="text-xl font-black text-brand-cyan">€{totalGross.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase text-brand-pink italic">Royalties</p>
                          <p className="text-xl font-black text-brand-pink">€{totalRoyalty.toLocaleString()}</p>
                        </div>
                      </div>
                      {showReports.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {showReports.map((r: any, i: number) => (
                            <div key={i} className="flex items-center justify-between text-xs border-t border-white/5 pt-1">
                              <span className="text-white/40">{new Date(r.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · {r.venue}</span>
                              <span className="text-brand-yellow font-black">€{(r.royaltyAmount || 0).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* REPORTS LIST */}
          {royaltyReports.length === 0 ? (
            <p className="text-white/20 italic text-sm">No performances logged yet.</p>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-6 gap-2 text-[9px] font-black uppercase italic text-white/30 px-4 pb-2">
                <span>Date</span><span>Show</span><span>Venue</span><span>Tickets</span><span>Gross</span><span>Royalty Due</span>
              </div>
              {royaltyReports.map((r, i) => (
                <div key={r.id || i} className="border-2 border-white/10 px-4 py-3 grid grid-cols-6 gap-2 items-center hover:border-brand-yellow transition-all">
                  <span className="text-brand-yellow font-black text-sm">{new Date(r.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                  <span className="text-white font-black italic text-xs truncate">{r.show}</span>
                  <span className="text-white/40 text-xs truncate">{r.venue}</span>
                  <span className="text-white/60 text-sm">{r.tickets}</span>
                  <span className="text-brand-cyan font-black text-sm">€{(r.gross || 0).toLocaleString()}</span>
                  <div className="flex items-center justify-between">
                    <span className="text-brand-yellow font-black text-sm">€{(r.royaltyAmount || 0).toLocaleString()}</span>
                    <button onClick={() => setRoyaltyReports(prev => prev.filter((_, j) => j !== i))} className="text-white/20 hover:text-brand-pink transition-colors">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
