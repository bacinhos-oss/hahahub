import React, { useState, useEffect, useRef } from 'react';
import { openDealThread, postToThread } from './LaffWirePage';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface Props {
  user: User;
  onNavigate: (page: string) => void;
}

type DealStatus = 'new' | 'contacted' | 'negotiating' | 'contract_sent' | 'signed' | 'royalties' | 'completed';

interface Deal {
  id: string;
  show_id: string;
  show_title: string;
  producer_id: string;
  from_name: string;
  from_email: string;
  message?: string;
  created_at: string;
  is_read: boolean;
  deal_status: DealStatus;
  replied: boolean;
  contract_signed_date?: string;
  contract_start_date?: string;
  contract_end_date?: string;
  deal_notes?: string;
  last_activity_at?: string;
  advance_amount?: number;
  royalty_pct?: number;
  max_performances?: number;
  territory?: string;
  recipient_id?: string;
  status?: string;
}

interface RoyaltyReport {
  id: string;
  show_id: string;
  show_title: string;
  date: string;
  venue: string;
  tickets: number;
  ticket_price: number;
  gross: number;
  royalty_amount: number;
  notes?: string;
  buyer_id: string;
  buyer_name: string;
}

interface ThreadPost {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  is_system: boolean;
  profiles?: { name: string };
}

const STATUS_CFG: Record<DealStatus, { label: string; bg: string; text: string; dot: string }> = {
  new:           { label: 'NEW',           bg: 'bg-brand-pink',    text: 'text-black', dot: 'bg-brand-pink' },
  contacted:     { label: 'CONTACTED',     bg: 'bg-brand-cyan',    text: 'text-black', dot: 'bg-brand-cyan' },
  negotiating:   { label: 'NEGOTIATING',   bg: 'bg-brand-yellow',  text: 'text-black', dot: 'bg-brand-yellow' },
  contract_sent: { label: 'CONTRACT SENT', bg: 'bg-purple-400',    text: 'text-black', dot: 'bg-purple-400' },
  signed:        { label: 'SIGNED',        bg: 'bg-green-400',     text: 'text-black', dot: 'bg-green-400' },
  royalties:     { label: 'ROYALTIES',     bg: 'bg-orange-400',    text: 'text-black', dot: 'bg-orange-400' },
  completed:     { label: 'COMPLETED',     bg: 'bg-white/20',      text: 'text-white', dot: 'bg-white/30' },
};

const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const fmtShort = (d?: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—';
const fmtTime = (d?: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
const daysSince = (d?: string) => d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : 0;
const daysUntil = (d?: string) => d ? Math.floor((new Date(d).getTime() - Date.now()) / 86400000) : null;

const DealsPipelinePage: React.FC<Props> = ({ user, onNavigate }) => {
  const [view, setView] = useState<'tickled' | 'tickler'>('tickled');
  const [viewMode, setViewMode] = useState<'shows' | 'list'>('shows');
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [royaltyReports, setRoyaltyReports] = useState<RoyaltyReport[]>([]);
  const [activeDealId, setActiveDealId] = useState<string | null>(null);
  const [threadPosts, setThreadPosts] = useState<ThreadPost[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [threadMsg, setThreadMsg] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [openingThread, setOpeningThread] = useState(false);
  const [showSignForm, setShowSignForm] = useState(false);
  const [showRoyaltyForm, setShowRoyaltyForm] = useState(false);
  const [signForm, setSignForm] = useState({ signed_date: '', start_date: '', end_date: '', territory: '', royalty_pct: '', advance_amount: '', max_performances: '' });
  const [royaltyForm, setRoyaltyForm] = useState({ date: '', venue: '', tickets: '', ticket_price: '', notes: '' });
  const threadEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadData(); }, [user, view]);
  useEffect(() => { threadEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [threadPosts]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const loadData = async () => {
    setLoading(true);
    let q = supabase.from('inquiries').select('*').order('created_at', { ascending: false });
    if (view === 'tickled') q = q.eq('producer_id', user.id);
    else q = q.eq('recipient_id', user.id);
    const { data } = await q;
    if (data) setDeals(data as Deal[]);
    const { data: rr } = await supabase.from('royalty_reports').select('*').order('date', { ascending: false });
    if (rr) setRoyaltyReports(rr as RoyaltyReport[]);
    setLoading(false);
  };

  const activeDeal = deals.find(d => d.id === activeDealId) || null;

  const openDeal = async (deal: Deal) => {
    if (activeDealId === deal.id) { setActiveDealId(null); setThreadPosts([]); return; }
    setActiveDealId(deal.id);
    setShowSignForm(false);
    setShowRoyaltyForm(false);
    setThreadMsg('');
    if (!deal.is_read) {
      await supabase.from('inquiries').update({ is_read: true }).eq('id', deal.id);
      setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, is_read: true } : d));
    }
    setThreadLoading(true);
    const { data } = await supabase.from('posts').select('*, profiles(name)').eq('deal_id', deal.id).eq('is_private', true).order('created_at', { ascending: true });
    setThreadPosts((data || []) as ThreadPost[]);
    setThreadLoading(false);
  };

  const updateStatus = async (deal: Deal, newStatus: DealStatus) => {
    await supabase.from('inquiries').update({ deal_status: newStatus, last_activity_at: new Date().toISOString() }).eq('id', deal.id);
    setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, deal_status: newStatus } : d));
    try {
      const { data: td } = await supabase.from('posts').select('thread_id, participants').eq('deal_id', deal.id).eq('is_private', true).limit(1).single();
      if (td?.thread_id) {
        await supabase.from('posts').insert({ user_id: user.id, type: 'news', content: `📌 Status → ${STATUS_CFG[newStatus].label}`, likes_count: 0, is_private: true, thread_id: td.thread_id, participants: td.participants, deal_id: deal.id, is_system: true, show_title: deal.show_title });
        if (activeDealId === deal.id) {
          const { data } = await supabase.from('posts').select('*, profiles(name)').eq('deal_id', deal.id).eq('is_private', true).order('created_at', { ascending: true });
          setThreadPosts((data || []) as ThreadPost[]);
        }
      }
    } catch {}
    showToast('STATUS → ' + STATUS_CFG[newStatus].label);
  };

  const startThread = async (deal: Deal) => {
    setOpeningThread(true);
    try {
      const buyerId = deal.recipient_id || deal.producer_id;
      const producerId = user.id || '';
      await openDealThread(deal.id, deal.show_title, producerId, buyerId, `New inquiry for "${deal.show_title}" from ${deal.from_name}`);
      await supabase.from('inquiries').update({ replied: true, deal_status: 'contacted', last_activity_at: new Date().toISOString() }).eq('id', deal.id);
      setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, replied: true, deal_status: 'contacted' } : d));
      const { data } = await supabase.from('posts').select('*, profiles(name)').eq('deal_id', deal.id).eq('is_private', true).order('created_at', { ascending: true });
      setThreadPosts((data || []) as ThreadPost[]);
      showToast('THREAD STARTED →');
    } catch { showToast('Error starting thread.'); }
    setOpeningThread(false);
  };

  const sendMsg = async () => {
    if (!threadMsg.trim() || !activeDeal) return;
    setSendingMsg(true);
    try {
      const { data: td } = await supabase.from('posts').select('thread_id, participants').eq('deal_id', activeDeal.id).eq('is_private', true).limit(1).single();
      if (td?.thread_id) {
        await supabase.from('posts').insert({ user_id: user.id, type: 'news', content: threadMsg.trim(), likes_count: 0, is_private: true, thread_id: td.thread_id, participants: td.participants, deal_id: activeDeal.id, is_system: false, show_title: activeDeal.show_title });
        setThreadMsg('');
        const { data } = await supabase.from('posts').select('*, profiles(name)').eq('deal_id', activeDeal.id).eq('is_private', true).order('created_at', { ascending: true });
        setThreadPosts((data || []) as ThreadPost[]);
      }
    } catch { showToast('Error sending.'); }
    setSendingMsg(false);
  };

  const markSigned = async () => {
    if (!activeDeal) return;
    const updates: any = { deal_status: 'signed', contract_signed_date: signForm.signed_date, contract_start_date: signForm.start_date, contract_end_date: signForm.end_date, territory: signForm.territory, royalty_pct: signForm.royalty_pct ? Number(signForm.royalty_pct) : null, advance_amount: signForm.advance_amount ? Number(signForm.advance_amount) : null, max_performances: signForm.max_performances ? Number(signForm.max_performances) : null, last_activity_at: new Date().toISOString() };
    await supabase.from('inquiries').update(updates).eq('id', activeDeal.id);
    try {
      await fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'deal_signed_producer', to: user.email, data: { show_title: activeDeal.show_title, buyer: activeDeal.from_name, territory: signForm.territory, signed_date: signForm.signed_date } }) });
      await fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'deal_signed_buyer', to: activeDeal.from_email, data: { show_title: activeDeal.show_title, producer: user.name, territory: signForm.territory, signed_date: signForm.signed_date } }) });
    } catch {}
    setDeals(prev => prev.map(d => d.id === activeDeal.id ? { ...d, ...updates } : d));
    setShowSignForm(false);
    showToast('SIGNED! EMAILS SENT →');
  };

  const addReport = async () => {
    if (!activeDeal) return;
    const gross = Number(royaltyForm.tickets) * Number(royaltyForm.ticket_price);
    const royalty_amount = gross * (Number(activeDeal.royalty_pct || 0) / 100);
    const { error } = await supabase.from('royalty_reports').insert({ show_id: activeDeal.show_id, show_title: activeDeal.show_title, date: royaltyForm.date, venue: royaltyForm.venue, tickets: Number(royaltyForm.tickets), ticket_price: Number(royaltyForm.ticket_price), gross, royalty_amount, notes: royaltyForm.notes, buyer_id: user.id, buyer_name: user.name });
    if (!error) { setRoyaltyForm({ date: '', venue: '', tickets: '', ticket_price: '', notes: '' }); setShowRoyaltyForm(false); loadData(); showToast('REPORT SAVED →'); }
  };

  const getWarning = (deal: Deal) => {
    const days = daysSince(deal.last_activity_at || deal.created_at);
    const s = deal.deal_status || 'new';
    if (s === 'new' && days >= 14) return 'red';
    if (s === 'new' && days >= 7) return 'yellow';
    if (s === 'contract_sent' && days >= 7) return 'yellow';
    if (deal.contract_end_date) { const l = daysUntil(deal.contract_end_date); if (l !== null && l <= 30 && l > 0) return 'yellow'; }
    return null;
  };

  const showGroups = deals.reduce((acc, deal) => {
    const key = deal.show_title || 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(deal);
    return acc;
  }, {} as Record<string, Deal[]>);

  const totalRoyalties = royaltyReports.reduce((s, r) => s + Number(r.royalty_amount), 0);
  const reportsForDeal = activeDeal ? royaltyReports.filter(r => r.show_id === activeDeal.show_id) : [];

  const btnY = "bg-brand-yellow text-black px-4 py-2 font-black uppercase italic text-xs border-2 border-black hover:bg-white transition-all";
  const btnC = "bg-brand-cyan text-black px-4 py-2 font-black uppercase italic text-xs border-2 border-black hover:bg-white transition-all";
  const inputCls = "w-full bg-black border-2 border-white/20 p-2 text-white font-bold italic text-sm outline-none focus:border-brand-yellow";

  return (
    <div className="space-y-6">
      {toast && <div className="fixed bottom-6 right-6 z-50 bg-brand-yellow text-black px-6 py-3 font-black uppercase italic text-xs border-4 border-black">{toast}</div>}

      {/* HEADER */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-4xl font-black uppercase italic">DEAL <span className="text-brand-yellow">PIPELINE</span></h2>
          <p className="text-white/30 font-bold italic text-xs mt-1 uppercase tracking-widest">
            {deals.length} deals · {deals.filter(d => !d.is_read).length} unread · EUR {totalRoyalties.toLocaleString()} royalties
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="flex border-4 border-white/20">
            <button onClick={() => { setView('tickled'); setActiveDealId(null); }} className={"px-4 py-2 font-black uppercase italic text-xs transition-all " + (view === 'tickled' ? 'bg-brand-yellow text-black' : 'text-white/40 hover:text-white')}>Tickled</button>
            <button onClick={() => { setView('tickler'); setActiveDealId(null); }} className={"px-4 py-2 font-black uppercase italic text-xs transition-all " + (view === 'tickler' ? 'bg-brand-cyan text-black' : 'text-white/40 hover:text-white')}>Tickler</button>
          </div>
          <div className="flex border-4 border-white/20">
            <button onClick={() => setViewMode('shows')} className={"px-4 py-2 font-black uppercase italic text-xs transition-all " + (viewMode === 'shows' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white')}>By Show</button>
            <button onClick={() => setViewMode('list')} className={"px-4 py-2 font-black uppercase italic text-xs transition-all " + (viewMode === 'list' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white')}>List</button>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'NEW', value: deals.filter(d => (d.deal_status || 'new') === 'new').length, color: 'text-brand-pink' },
          { label: 'ACTIVE', value: deals.filter(d => ['contacted','negotiating','contract_sent'].includes(d.deal_status || 'new')).length, color: 'text-brand-yellow' },
          { label: 'SIGNED', value: deals.filter(d => ['signed','royalties'].includes(d.deal_status || 'new')).length, color: 'text-green-400' },
          { label: 'ROYALTIES', value: `€${totalRoyalties.toLocaleString()}`, color: 'text-orange-400' },
        ].map((s, i) => (
          <div key={i} className="border-4 border-white/10 p-3 text-center">
            <p className={"text-2xl font-black " + s.color}>{s.value}</p>
            <p className="text-[8px] font-black uppercase italic text-white/30 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <p className="text-white/20 font-black uppercase italic text-sm">Loading...</p>
      ) : deals.length === 0 ? (
        <div className="border-4 border-white/10 p-8 text-center">
          <p className="text-white/20 font-black uppercase italic">No deals yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* LEFT — DEALS */}
          <div className="space-y-4">
            {viewMode === 'shows' ? (
              Object.entries(showGroups).map(([showTitle, showDeals]) => {
                const showRoyalties = royaltyReports.filter(r => r.show_title === showTitle).reduce((s, r) => s + Number(r.royalty_amount), 0);
                return (
                  <div key={showTitle} className="border-4 border-white/20 overflow-hidden">
                    <div className="bg-white/5 px-4 py-3 flex items-center justify-between border-b-2 border-white/10">
                      <div>
                        <p className="text-[8px] font-black uppercase italic text-white/30 tracking-widest">Show</p>
                        <p className="font-black uppercase italic text-white text-base">{showTitle}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-black uppercase italic text-white/30">{showDeals.length} deals</p>
                        {showRoyalties > 0 && <p className="text-orange-400 font-black text-sm">€{showRoyalties.toLocaleString()}</p>}
                      </div>
                    </div>
                    {showDeals.map(deal => {
                      const status = deal.deal_status || 'new';
                      const cfg = STATUS_CFG[status];
                      const warn = getWarning(deal);
                      const isActive = activeDealId === deal.id;
                      return (
                        <div key={deal.id}
                          className={"border-b border-white/10 last:border-b-0 cursor-pointer transition-all " + (isActive ? 'bg-brand-yellow/5 border-l-4 border-l-brand-yellow' : warn === 'red' ? 'border-l-4 border-l-brand-pink hover:bg-white/3' : warn === 'yellow' ? 'border-l-4 border-l-brand-yellow/60 hover:bg-white/3' : 'hover:bg-white/3')}
                          onClick={() => openDeal(deal)}>
                          <div className="px-4 py-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={"w-2 h-2 rounded-full flex-shrink-0 " + cfg.dot} />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-black uppercase italic text-white text-sm">{deal.from_name}</p>
                                  {deal.territory && <span className="text-[8px] font-black uppercase text-white/30 border border-white/10 px-1">{deal.territory}</span>}
                                  {!deal.is_read && <span className="text-[7px] font-black uppercase bg-brand-pink text-white px-1.5 py-0.5">NEW</span>}
                                  {warn === 'red' && <span className="text-[7px] font-black uppercase bg-brand-pink/20 text-brand-pink px-1.5 py-0.5">⚠ {daysSince(deal.last_activity_at || deal.created_at)}D</span>}
                                </div>
                                <p className="text-white/30 text-xs">{fmtShort(deal.created_at)}</p>
                              </div>
                            </div>
                            <span className={"text-[7px] font-black uppercase px-2 py-1 flex-shrink-0 " + cfg.bg + ' ' + cfg.text}>{cfg.label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })
            ) : (
              <div className="border-4 border-white/20 overflow-hidden">
                {deals.map(deal => {
                  const cfg = STATUS_CFG[deal.deal_status || 'new'];
                  const warn = getWarning(deal);
                  const isActive = activeDealId === deal.id;
                  return (
                    <div key={deal.id}
                      className={"border-b border-white/10 last:border-b-0 cursor-pointer transition-all " + (isActive ? 'bg-brand-yellow/5 border-l-4 border-l-brand-yellow' : warn === 'red' ? 'border-l-4 border-l-brand-pink' : 'hover:bg-white/3')}
                      onClick={() => openDeal(deal)}>
                      <div className="px-4 py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={"w-2 h-2 rounded-full flex-shrink-0 " + cfg.dot} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-black uppercase italic text-white text-sm">{deal.from_name}</p>
                              {!deal.is_read && <span className="text-[7px] font-black uppercase bg-brand-pink text-white px-1.5 py-0.5">NEW</span>}
                            </div>
                            <p className="text-white/30 text-xs italic truncate">{deal.show_title}</p>
                          </div>
                        </div>
                        <span className={"text-[7px] font-black uppercase px-2 py-1 flex-shrink-0 " + cfg.bg + ' ' + cfg.text}>{cfg.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT — DETAIL + THREAD */}
          <div>
            {!activeDeal ? (
              <div className="border-4 border-white/10 p-8 text-center">
                <p className="text-white/20 font-black uppercase italic text-sm">← Select a deal</p>
              </div>
            ) : (
              <div className="border-4 border-brand-yellow overflow-hidden">

                {/* DEAL HEADER */}
                <div className="bg-brand-yellow/10 px-5 py-4 border-b-2 border-brand-yellow/30">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className={"text-[8px] font-black uppercase px-2 py-0.5 inline-block mb-2 " + STATUS_CFG[activeDeal.deal_status || 'new'].bg + ' ' + STATUS_CFG[activeDeal.deal_status || 'new'].text}>
                        {STATUS_CFG[activeDeal.deal_status || 'new'].label}
                      </span>
                      <p className="text-[8px] font-black uppercase italic text-brand-yellow tracking-widest">{activeDeal.show_title}</p>
                      <p className="text-xl font-black uppercase italic text-white">{activeDeal.from_name}</p>
                      <p className="text-white/40 text-xs">{activeDeal.from_email}</p>
                    </div>
                    <button onClick={() => { setActiveDealId(null); setThreadPosts([]); }} className="text-white/30 hover:text-white font-black text-lg leading-none">✕</button>
                  </div>
                  {(activeDeal.territory || activeDeal.royalty_pct || activeDeal.contract_end_date) && (
                    <div className="flex gap-4 mt-3 flex-wrap">
                      {activeDeal.territory && <span className="text-[9px] font-black uppercase text-white/40 border-l-4 border-brand-cyan pl-2">{activeDeal.territory}</span>}
                      {activeDeal.royalty_pct && <span className="text-[9px] font-black uppercase text-white/40 border-l-4 border-brand-yellow pl-2">ROY {activeDeal.royalty_pct}%</span>}
                      {activeDeal.advance_amount && <span className="text-[9px] font-black uppercase text-white/40 border-l-4 border-brand-pink pl-2">ADV €{activeDeal.advance_amount}</span>}
                      {activeDeal.contract_end_date && <span className="text-[9px] font-black uppercase text-white/40 border-l-4 border-orange-400 pl-2">EXP {fmt(activeDeal.contract_end_date)}</span>}
                    </div>
                  )}
                  {activeDeal.message && (
                    <p className="text-white/50 text-sm italic border-l-4 border-brand-yellow pl-3 mt-3 line-clamp-2">{activeDeal.message}</p>
                  )}
                </div>

                {/* STATUS MOVER */}
                <div className="px-4 py-3 border-b-2 border-white/10">
                  <p className="text-[8px] font-black uppercase italic text-white/20 tracking-widest mb-2">Move status</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {(['new','contacted','negotiating','contract_sent','signed','royalties','completed'] as DealStatus[]).map(st => {
                      const cfg = STATUS_CFG[st];
                      const isCurrent = (activeDeal.deal_status || 'new') === st;
                      return (
                        <button key={st} onClick={() => updateStatus(activeDeal, st)}
                          className={"text-[7px] font-black uppercase px-2 py-1 border-2 transition-all " + (isCurrent ? cfg.bg + ' ' + cfg.text + ' border-black' : 'border-white/20 text-white/30 hover:border-white/60 hover:text-white')}>
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SIGN FORM */}
                {activeDeal.deal_status === 'contract_sent' && (
                  <div className="px-4 py-3 border-b-2 border-white/10">
                    <button onClick={() => setShowSignForm(!showSignForm)} className={btnY + " w-full"}>
                      {showSignForm ? 'Cancel' : 'Mark as Signed ✓'}
                    </button>
                    {showSignForm && (
                      <div className="mt-3 space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: 'Date signed', key: 'signed_date', type: 'date' },
                            { label: 'Start date', key: 'start_date', type: 'date' },
                            { label: 'End date', key: 'end_date', type: 'date' },
                            { label: 'Territory', key: 'territory', type: 'text', placeholder: 'Norway' },
                            { label: 'Royalty %', key: 'royalty_pct', type: 'number', placeholder: '12' },
                            { label: 'Advance EUR', key: 'advance_amount', type: 'number', placeholder: '2500' },
                            { label: 'Max performances', key: 'max_performances', type: 'number', placeholder: '24' },
                          ].map(f => (
                            <div key={f.key}>
                              <p className="text-[8px] font-black uppercase text-white/30 italic mb-1">{f.label}</p>
                              <input type={f.type} placeholder={f.placeholder || ''} value={(signForm as any)[f.key]} onChange={e => setSignForm(p => ({...p, [f.key]: e.target.value}))} className={inputCls} />
                            </div>
                          ))}
                        </div>
                        <button onClick={markSigned} className="bg-green-400 text-black px-6 py-2 font-black uppercase italic text-xs border-2 border-black hover:bg-white transition-all w-full">
                          Confirm Signed → Send emails
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ROYALTY REPORTS */}
                {(activeDeal.deal_status === 'signed' || activeDeal.deal_status === 'royalties') && (
                  <div className="px-4 py-3 border-b-2 border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[8px] font-black uppercase italic text-brand-yellow tracking-widest">Royalty Reports</p>
                      <button onClick={() => setShowRoyaltyForm(!showRoyaltyForm)} className={btnY}>+ Add</button>
                    </div>
                    {showRoyaltyForm && (
                      <div className="space-y-2 mb-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div><p className="text-[8px] font-black uppercase text-white/30 italic mb-1">Date</p><input type="date" value={royaltyForm.date} onChange={e => setRoyaltyForm(p => ({...p, date: e.target.value}))} className={inputCls} /></div>
                          <div><p className="text-[8px] font-black uppercase text-white/30 italic mb-1">Venue</p><input type="text" placeholder="Teatro Roma" value={royaltyForm.venue} onChange={e => setRoyaltyForm(p => ({...p, venue: e.target.value}))} className={inputCls} /></div>
                          <div><p className="text-[8px] font-black uppercase text-white/30 italic mb-1">Tickets</p><input type="number" placeholder="350" value={royaltyForm.tickets} onChange={e => setRoyaltyForm(p => ({...p, tickets: e.target.value}))} className={inputCls} /></div>
                          <div><p className="text-[8px] font-black uppercase text-white/30 italic mb-1">Price EUR</p><input type="number" placeholder="25" value={royaltyForm.ticket_price} onChange={e => setRoyaltyForm(p => ({...p, ticket_price: e.target.value}))} className={inputCls} /></div>
                        </div>
                        {royaltyForm.tickets && royaltyForm.ticket_price && (
                          <div className="flex gap-4 border-l-4 border-brand-yellow pl-3 text-sm">
                            <span className="text-white/40">Gross: <span className="text-white font-black">€{(Number(royaltyForm.tickets) * Number(royaltyForm.ticket_price)).toLocaleString()}</span></span>
                            <span className="text-white/40">Royalty: <span className="text-brand-yellow font-black">€{(Number(royaltyForm.tickets) * Number(royaltyForm.ticket_price) * Number(activeDeal.royalty_pct || 0) / 100).toLocaleString()}</span></span>
                          </div>
                        )}
                        <button onClick={addReport} className={btnY + " w-full"}>Save Report →</button>
                      </div>
                    )}
                    {reportsForDeal.length > 0 && (
                      <div className="space-y-1">
                        {reportsForDeal.map(r => (
                          <div key={r.id} className="flex justify-between text-xs border-b border-white/5 pb-1">
                            <span className="text-white/40">{fmt(r.date)} · {r.venue}</span>
                            <span className="text-brand-yellow font-black">€{Number(r.royalty_amount).toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="flex justify-end pt-1">
                          <span className="text-brand-yellow font-black text-sm">Total: €{reportsForDeal.reduce((s, r) => s + Number(r.royalty_amount), 0).toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* LAFFWIRE THREAD */}
                <div>
                  <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between bg-brand-cyan/5">
                    <p className="text-[8px] font-black uppercase italic text-brand-cyan tracking-widest">🔒 LaffWire Thread</p>
                    <button onClick={() => onNavigate('wire')} className="text-[8px] font-black uppercase italic text-brand-cyan hover:text-white transition-colors">Open in LaffWire →</button>
                  </div>
                  <div className="px-4 py-3 space-y-2 min-h-32 max-h-72 overflow-y-auto">
                    {threadLoading ? (
                      <p className="text-white/20 text-xs italic text-center py-4">Loading...</p>
                    ) : threadPosts.length === 0 ? (
                      <div className="text-center py-4 space-y-2">
                        <p className="text-white/20 text-xs italic">No messages yet.</p>
                        <button onClick={() => startThread(activeDeal)} disabled={openingThread} className={btnC + " disabled:opacity-30"}>
                          {openingThread ? 'Starting...' : 'Start Conversation →'}
                        </button>
                      </div>
                    ) : threadPosts.map(post => {
                      const isMe = post.user_id === user.id;
                      if (post.is_system) return (
                        <div key={post.id} className="text-center py-1">
                          <span className="text-[8px] font-black uppercase italic text-white/20 border border-white/10 px-2 py-0.5">{post.content}</span>
                        </div>
                      );
                      return (
                        <div key={post.id} className={"flex gap-2 " + (isMe ? 'flex-row-reverse' : '')}>
                          <div className={"w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[8px] font-black border-2 " + (isMe ? 'bg-brand-yellow text-black border-black' : 'bg-brand-cyan text-black border-black')}>
                            {((post.profiles?.name || 'U')[0]).toUpperCase()}
                          </div>
                          <div className={"max-w-xs " + (isMe ? 'text-right' : '')}>
                            <div className={"border-2 px-3 py-1.5 " + (isMe ? 'border-brand-yellow/40' : 'border-white/20')}>
                              <p className="text-white font-bold italic text-xs">{post.content}</p>
                            </div>
                            <p className="text-white/20 text-[8px] mt-0.5">{fmtTime(post.created_at)}</p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={threadEndRef} />
                  </div>
                  {threadPosts.length > 0 && (
                    <div className="px-4 py-3 border-t-2 border-white/10 flex gap-2">
                      <input type="text" value={threadMsg} onChange={e => setThreadMsg(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); }}}
                        placeholder="Type a message... (Enter to send)"
                        className="flex-1 bg-black border-2 border-white/20 px-3 py-2 text-white font-bold italic text-xs outline-none focus:border-brand-cyan"
                      />
                      <button onClick={sendMsg} disabled={sendingMsg || !threadMsg.trim()} className={btnC + " disabled:opacity-30 flex-shrink-0"}>
                        {sendingMsg ? '...' : 'Send →'}
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default DealsPipelinePage;
