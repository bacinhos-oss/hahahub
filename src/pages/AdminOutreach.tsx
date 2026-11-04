import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

type Row = { id: string; name: string; email: string | null; org: string | null; country: string | null; status: string; note: string | null; created_at: string };

const STATUSES: { key: string; label: string; color: string }[] = [
  { key: 'to_contact', label: 'To contact', color: 'text-white/60 border-white/30' },
  { key: 'contacted', label: 'Contacted', color: 'text-brand-yellow border-brand-yellow' },
  { key: 'replied', label: 'Replied', color: 'text-brand-cyan border-brand-cyan' },
  { key: 'joined', label: 'Joined', color: 'text-green-400 border-green-400' },
  { key: 'no_reply', label: 'No reply', color: 'text-brand-pink border-brand-pink' },
];
const EMAIL_RE = /[^\s,;<>]+@[^\s,;<>]+\.[^\s,;<>]+/;

const gmailLink = (r: Row) => {
  const first = (r.name || '').trim().split(/\s+/)[0] || '';
  const subject = 'Your comedy show, in front of producers across Europe';
  const body = `Hi ${first},\n\nI'm Dejan, a comedy theatre director from Slovenia. I've built HahaHub (hahahub.art), a free international network where comedy theatre producers list their shows and find new titles to license for their own stage.\n\nIt's free to join and there are no commissions. You upload your production once (poster, cast, what's included), and other producers can send you an inquiry directly.\n\nWould you like to take a look? It takes about 5 minutes to list a show: https://hahahub.art\n\nBest,\nDejan Batoćanin\nFounder, HahaHub.art — The Laff Exchange`;
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(r.email || '')}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

const AdminOutreach: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    const { data, error } = await supabase.from('outreach').select('*').order('created_at', { ascending: false });
    if (error) setMsg('Could not load the list: ' + error.message + ' (did you run the SQL for the outreach table?)');
    else setRows((data as Row[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    STATUSES.forEach(s => { c[s.key] = rows.filter(r => r.status === s.key).length; });
    return c;
  }, [rows]);

  const shown = rows.filter(r =>
    (filter === 'all' || r.status === filter) &&
    (!search || [r.name, r.email, r.org, r.country].some(v => (v || '').toLowerCase().includes(search.toLowerCase()))));

  const doImport = async () => {
    const existing = new Set(rows.map(r => (r.email || '').toLowerCase()).filter(Boolean));
    const toAdd: any[] = [];
    for (const line of importText.split('\n')) {
      const t = line.trim();
      if (!t) continue;
      const parts = t.split(/[,;\t]/).map(p => p.trim()).filter(Boolean);
      const emailPart = parts.find(p => EMAIL_RE.test(p));
      const email = emailPart ? (emailPart.match(EMAIL_RE)![0]).toLowerCase() : null;
      const rest = parts.filter(p => p !== emailPart);
      if (!rest[0]) continue;
      if (email && existing.has(email)) continue;
      if (email) existing.add(email);
      toAdd.push({ name: rest[0], email, org: rest[1] || null, country: rest[2] || null });
    }
    if (!toAdd.length) { setMsg('Nothing new to add.'); return; }
    const { error } = await supabase.from('outreach').insert(toAdd);
    if (error) { setMsg('Import failed: ' + error.message); return; }
    setMsg(`Added ${toAdd.length} contact${toAdd.length > 1 ? 's' : ''}.`);
    setImportText(''); setShowImport(false);
    load();
  };

  const setStatus = async (id: string, status: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    const { error } = await supabase.from('outreach').update({ status }).eq('id', id);
    if (error) { setMsg('Could not save: ' + error.message); load(); }
  };
  const saveNote = async (id: string, note: string) => {
    await supabase.from('outreach').update({ note }).eq('id', id);
  };
  const remove = async (r: Row) => {
    if (!window.confirm(`Delete ${r.name}?`)) return;
    const { error } = await supabase.from('outreach').delete().eq('id', r.id);
    if (error) { setMsg('Could not delete: ' + error.message); return; }
    setRows(prev => prev.filter(x => x.id !== r.id));
  };
  const contactAndMark = (r: Row) => {
    window.open(gmailLink(r), '_blank');
    if (r.status === 'to_contact') setStatus(r.id, 'contacted');
  };

  const inp = 'bg-black border-2 border-white/20 text-white p-2 text-sm focus:border-brand-yellow outline-none';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {[{ key: 'all', label: 'All' }, ...STATUSES].map(s => (
          <button key={s.key} onClick={() => setFilter(s.key)}
            className={`px-3 py-2 border-2 text-[10px] font-black uppercase italic tracking-widest transition-all ${filter === s.key ? 'bg-white text-black border-white' : 'border-white/20 text-white/60 hover:text-white'}`}>
            {s.label} <span className="opacity-60">{counts[s.key] ?? 0}</span>
          </button>
        ))}
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className={`${inp} ml-auto w-48`} />
        <button onClick={() => setShowImport(v => !v)} className="bg-brand-yellow text-black px-4 py-2 font-black uppercase italic text-xs border-2 border-black">+ Import list</button>
      </div>

      {msg && <p className="text-brand-yellow text-xs font-bold italic">{msg}</p>}

      {showImport && (
        <div className="border-2 border-brand-yellow/40 p-4 space-y-3">
          <p className="text-[10px] font-black uppercase italic text-brand-yellow tracking-widest">Paste one person per line</p>
          <p className="text-white/40 text-xs">Format: <span className="font-mono">Name, email, organisation, country</span> (email, organisation and country are optional)</p>
          <textarea value={importText} onChange={e => setImportText(e.target.value)} rows={7} className={`${inp} w-full font-mono`} placeholder={'Ana Novak, ana@gledalisce.si, SLG Celje, Slovenia\nPaul Salamone, , English Theatre Berlin, Germany'} />
          <button onClick={doImport} disabled={!importText.trim()} className="bg-white text-black px-6 py-3 font-black uppercase italic text-sm border-2 border-black disabled:opacity-40">Add to list</button>
        </div>
      )}

      {loading ? <p className="text-white/40 text-sm italic">Loading…</p> : shown.length === 0 ? (
        <p className="text-white/30 text-sm italic border-2 border-dashed border-white/10 p-8 text-center">{rows.length === 0 ? 'The list is empty. Use “Import list” to add the first producers.' : 'Nobody matches this filter.'}</p>
      ) : (
        <div className="space-y-2">
          {shown.map(r => {
            const st = STATUSES.find(s => s.key === r.status) || STATUSES[0];
            return (
              <div key={r.id} className="border-2 border-white/10 p-3 flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-black uppercase italic text-white truncate">{r.name}</p>
                  <p className="text-white/50 text-xs truncate">{[r.org, r.country].filter(Boolean).join(' · ') || '—'}</p>
                  <p className="text-white/40 text-xs truncate">{r.email || 'no email yet'}</p>
                </div>
                <input defaultValue={r.note || ''} onBlur={e => saveNote(r.id, e.target.value)} placeholder="Note…" className={`${inp} md:w-56`} />
                <select value={r.status} onChange={e => setStatus(r.id, e.target.value)} className={`bg-black border-2 p-2 text-[10px] font-black uppercase italic ${st.color}`}>
                  {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
                <div className="flex gap-2">
                  {r.email && <button onClick={() => contactAndMark(r)} className="bg-white text-black px-3 py-2 text-[10px] font-black uppercase italic border-2 border-black hover:bg-brand-pink hover:text-white">Write in Gmail</button>}
                  {r.email && <button onClick={() => { navigator.clipboard?.writeText(r.email!); setMsg('Email copied.'); }} className="border-2 border-white/20 text-white/60 hover:text-white px-3 py-2 text-[10px] font-black uppercase italic">Copy</button>}
                  <button onClick={() => remove(r)} className="border-2 border-white/10 text-white/30 hover:text-brand-pink px-3 py-2 text-[10px] font-black uppercase italic">✕</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminOutreach;
