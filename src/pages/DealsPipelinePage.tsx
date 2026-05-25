import React, { useState, useEffect } from 'react';
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

const STATUS_ORDER: DealStatus[] = ['new', 'contacted', 'negotiating', 'contract_sent', 'signed', 'royalties', 'completed'];

const STATUS_CFG: Record<DealStatus, { label: string; border: string; bg: string; text: string }> = {
  new:           { label: 'NEW',           border: 'border-brand-pink',   bg: 'bg-brand-pink text-black',       text: 'text-brand-pink' },
  contacted:     { label: 'CONTACTED',     border: 'border-brand-cyan',   bg: 'bg-brand-cyan text-black',       text: 'text-brand-cyan' },
  negotiating:   { label: 'NEGOTIATING',   border: 'border-brand-yellow', bg: 'bg-brand-yellow text-black',     text: 'text-brand-yellow' },
  contract_sent: { label: 'CONTRACT SENT', border: 'border-purple-400',   bg: 'bg-purple-400 text-black',       text: 'text-purple-400' },
  signed:        { label: 'SIGNED',        border: 'border-green-400',    bg: 'bg-green-400 text-black',        text: 'text-green-400' },
  royalties:     { label: 'ROYALTIES',     border: 'border-orange-400',   bg: 'bg-orange-400 text-black',       text: 'text-orange-400' },
  completed:     { label: 'COMPLETED',     border: 'border-white/30',     bg: 'bg-white/20 text-white',         text: 'text-white/40' },
};

const daysSince = (d?: string) => d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : 0;
const daysUntil = (d?: string) => d ? Math.floor((new Date(d).getTime() - Date.now()) / 86400000) : null;
const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const DealsPipelinePage: React.FC<Props> = ({ user, onNavigate }) => {
  const [view, setView] = useState<'seller' | 'buyer'>('seller');
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [royaltyReports, setRoyaltyReports] = useState<RoyaltyReport[]>([]);
  const [openingThread, setOpeningThread] = useState<string | null>(null);
  const [dealThreads, setDealThreads] = useState<Record<string, any[]>>({});
  const [threadMsg, setThreadMsg] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [expandedThread, setExpandedThread] = useState<string | null>(null);
  const [showSignForm, setShowSignForm] = useState(false);
  const [showRoyaltyForm, setShowRoyaltyForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<DealStatus | 'all'>('all');
  const [signForm, setSignForm] = useState({ signed_date: '', start_date: '', end_date: '', territory: '', royalty_pct: '', advance_amount: '', max_performances: '' });
  const [royaltyForm, setRoyaltyForm] = useState({ date: '', venue: '', tickets: '', ticket_price: '', notes: '' });

  useEffect(() => { loadData(); }, [user, view]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const loadData = async () => {
    setLoading(true);
    let q = supabase.from('inquiries').select('*').order('created_at', { ascending: false });
    if (view === 'seller') q = q.eq('producer_id', user.id);
    else q = q.eq('recipient_id', user.id);
    const { data } = await q;
    if (data) setDeals(data as Deal[]);
    const { data: rr } = await supabase.from('royalty_reports').select('*').order('date', { ascending: false });
    if (rr) setRoyaltyReports(rr as RoyaltyReport[]);
    setLoading(false);
  };

  const loadThreadForDeal = async (dealId: string) => {
    const { data } = await supabase.from('posts')
      .select('*, profiles(name)')
      .eq('deal_id', dealId)
      .eq('is_private', true)
      .order('created_at', { ascending: true });
    if (data) setDealThreads(prev => ({ ...prev, [dealId]: data }));
  };

  const sendThreadMessage = async (deal: Deal) => {
    if (!threadMsg.trim()) return;
    setSendingMsg(true);
    try {
      const { data: threadData } = await supabase.from('posts')
        .select('thread_id, participants').eq('deal_id', deal.id).eq('is_private', true).limit(1).single();
      if (threadData?.thread_id) {
        await supabase.from('posts').insert({
          user_id: user.id,
          type: 'news',
          content: threadMsg.trim(),
          likes_count: 0,
          is_private: true,
          thread_id: threadData.thread_id,
          participants: threadData.participants,
          deal_id: deal.id,
          is_system: false,
          show_title: deal.show_title,
        });
        setThreadMsg('');
        loadThreadForDeal(deal.id);
        showToast('MESSAGE SENT →');
      }
    } catch { showToast('Error sending.'); }
    setSendingMsg(false);
  };

  const updateStatus = async (deal: Deal, newStatus: DealStatus) => {
    await supabase.from('inquiries').update({ deal_status: newStatus, last_activity_at: new Date().toISOString() }).eq('id', deal.id);
    setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, deal_status: newStatus } : d));
    if (selectedDeal?.id === deal.id) setSelectedDeal(prev => prev ? { ...prev, deal_status: newStatus } : null);
    // Post status update to LaffWire thread
    try {
      const { data: threadData } = await supabase.from('posts')
        .select('thread_id, participants').eq('deal_id', deal.id).eq('is_private', true).limit(1).single();
      if (threadData?.thread_id) {
        await postToThread(threadData.thread_id, user.id || '', threadData.participants[0], threadData.participants[1], deal.id,
          `📌 Status → ${STATUS_CFG[newStatus].label}`, true);
      }
    } catch {}
    showToast('STATUS → ' + STATUS_CFG[newStatus].label);
  };

  const openLaffWireThread = async (deal: Deal) => {
    setOpeningThread(deal.id);
    try {
      const buyerId = deal.recipient_id || deal.producer_id;
      const producerId = user.id || '';
      const threadId = await openDealThread(
        deal.id,
        deal.show_title,
        producerId,
        buyerId,
        `New inquiry for "${deal.show_title}" from ${deal.from_name}`
      );
      await postToThread(threadId, producerId, producerId, buyerId, deal.id,
        `📌 Status → CONTACTED`, true);
      await supabase.from('inquiries').update({
        replied: true, deal_status: 'contacted', last_activity_at: new Date().toISOString()
      }).eq('id', deal.id);
      setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, replied: true, deal_status: 'contacted' } : d));
      if (selectedDeal?.id === deal.id) setSelectedDeal(prev => prev ? { ...prev, replied: true, deal_status: 'contacted' } : null);
      showToast('LAFFWIRE THREAD OPENED →');
      onNavigate('wire');
    } catch (e) { showToast('Error opening thread.'); }
    setOpeningThread(null);
  };

  const markSigned = async () => {
    if (!selectedDeal) return;
    const updates: any = {
      deal_status: 'signed',
      contract_signed_date: signForm.signed_date,
      contract_start_date: signForm.start_date,
      contract_end_date: signForm.end_date,
      territory: signForm.territory,
      royalty_pct: signForm.royalty_pct ? Number(signForm.royalty_pct) : null,
      advance_amount: signForm.advance_amount ? Number(signForm.advance_amount) : null,
      max_performances: signForm.max_performances ? Number(signForm.max_performances) : null,
      last_activity_at: new Date().toISOString(),
    };
    await supabase.from('inquiries').update(updates).eq('id', selectedDeal.id);
    try {
      await fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'deal_signed_producer', to: user.email, data: { show_title: selectedDeal.show_title, buyer: selectedDeal.from_name, territory: signForm.territory, signed_date: signForm.signed_date } }) });
      await fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'deal_signed_buyer', to: selectedDeal.from_email, data: { show_title: selectedDeal.show_title, producer: user.name, territory: signForm.territory, signed_date: signForm.signed_date } }) });
    } catch {}
    setDeals(prev => prev.map(d => d.id === selectedDeal.id ? { ...d, ...updates } : d));
    setSelectedDeal(prev => prev ? { ...prev, ...updates } : null);
    setShowSignForm(false);
    showToast('CONTRACT SIGNED! MOVING TO ROYALTIES →');
  };

  const addRoyaltyReport = async () => {
    if (!selectedDeal) return;
    const gross = Number(royaltyForm.tickets) * Number(royaltyForm.ticket_price);
    const royalty_amount = gross * (Number(selectedDeal.royalty_pct || 0) / 100);
    const { error } = await supabase.from('royalty_reports').insert({
      show_id: selectedDeal.show_id, show_title: selectedDeal.show_title,
      date: royaltyForm.date, venue: royaltyForm.venue,
      tickets: Number(royaltyForm.tickets), ticket_price: Number(royaltyForm.ticket_price),
      gross, royalty_amount, notes: royaltyForm.notes,
      buyer_id: user.id, buyer_name: user.name,
    });
    if (!error) {
      setRoyaltyForm({ date: '', venue: '', tickets: '', ticket_price: '', notes: '' });
      setShowRoyaltyForm(false);
      loadData();
      showToast('REPORT SAVED →');
    }
  };

  const saveNote = async (note: string) => {
    if (!selectedDeal) return;
    await supabase.from('inquiries').update({ deal_notes: note }).eq('id', selectedDeal.id);
    setDeals(prev => prev.map(d => d.id === selectedDeal.id ? { ...d, deal_notes: note } : d));
    showToast('NOTE SAVED →');
  };

  const getWarning = (deal: Deal) => {
    const days = daysSince(deal.last_activity_at || deal.created_at);
    const status = deal.deal_status || 'new';
    if (status === 'new' && days >= 14) return { type: 'red', label: `${days}D NO REPLY` };
    if (status === 'new' && days >= 7) return { type: 'yellow', label: `${days}D NO REPLY` };
    if (status === 'contract_sent' && days >= 7) return { type: 'yellow', label: `WAITING ${days}D` };
    if (deal.contract_end_date) {
      const left = daysUntil(deal.contract_end_date);
      if (left !== null && left <= 30 && left > 0) return { type: 'yellow', label: `EXPIRES IN ${left}D` };
    }
    return null;
  };

  const filteredDeals = filterStatus === 'all' ? deals : deals.filter(d => (d.deal_status || 'new') === filterStatus);
  const reportsForDeal = selectedDeal ? royaltyReports.filter(r => r.show_id === selectedDeal.show_id) : [];

  const inputCls = "w-full bg-black border-2 border-white/20 p-2 text-white font-bold italic text-sm outline-none focus:border-brand-yellow";
  const btnYellow = "bg-brand-yellow text-black px-4 py-2 font-black uppercase italic text-xs border-2 border-black hover:bg-white transition-all";
  const btnCyan = "bg-brand-cyan text-black px-4 py-2 font-black uppercase italic text-xs border-2 border-black hover:bg-white transition-all";
  const btnGhost = "border-2 border-white/20 text-white/40 px-4 py-2 font-black uppercase italic text-xs hover:border-white hover:text-white transition-all";

  return (
    <div className="space-y-6">
      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-brand-yellow text-black px-6 py-3 font-black uppercase italic text-xs border-4 border-black shadow-neo-yellow">
          {toast}
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-4xl font-black uppercase italic">
            DEAL <span className="text-brand-yellow">PIPELINE</span>
          </h2>
          <p className="text-white/40 font-bold italic text-xs mt-1 uppercase tracking-widest">
            {deals.length} active deals · {deals.filter(d => !d.is_read).length} unread
          </p>
        </div>
        {/* VIEW TOGGLE */}
        <div className="flex border-4 border-white/20">
          <button onClick={() => { setView('seller'); setSelectedDeal(null); }}
            className={"px-5 py-2 font-black uppercase italic text-xs transition-all " + (view === 'seller' ? 'bg-brand-yellow text-black' : 'text-white/40 hover:text-white')}>
            SELLER
          </button>
          <button onClick={() => { setView('buyer'); setSelectedDeal(null); }}
            className={"px-5 py-2 font-black uppercase italic text-xs transition-all " + (view === 'buyer' ? 'bg-brand-cyan text-black' : 'text-white/40 hover:text-white')}>
            BUYER
          </button>
        </div>
      </div>

      {/* STATUS FILTER BAR */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterStatus('all')}
          className={"px-4 py-1 font-black uppercase italic text-[9px] border-2 transition-all " + (filterStatus === 'all' ? 'bg-white text-black border-white' : 'border-white/20 text-white/40 hover:text-white')}>
          ALL ({deals.length})
        </button>
        {STATUS_ORDER.map(st => {
          const count = deals.filter(d => (d.deal_status || 'new') === st).length;
          if (count === 0) return null;
          return (
            <button key={st} onClick={() => setFilterStatus(st)}
              className={"px-4 py-1 font-black uppercase italic text-[9px] border-2 transition-all " + (filterStatus === st ? STATUS_CFG[st].bg + ' border-black' : STATUS_CFG[st].border + ' ' + STATUS_CFG[st].text + ' hover:bg-white/10')}>
              {STATUS_CFG[st].label} ({count})
            </button>
          );
        })}
      </div>

      {/* DEALS LIST */}
      {loading ? (
        <p className="text-white/20 italic text-sm uppercase font-black">Loading pipeline...</p>
      ) : filteredDeals.length === 0 ? (
        <div className="border-4 border-white/10 p-8 text-center">
          <p className="text-white/20 italic font-black uppercase text-sm">No deals yet.</p>
          {view === 'buyer' && (
            <button onClick={() => onNavigate('discovery')} className={"mt-4 " + btnYellow}>
              Browse Catalog →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDeals.map(deal => {
            const status = deal.deal_status || 'new';
            const cfg = STATUS_CFG[status];
            const warn = getWarning(deal);
            const isSelected = selectedDeal?.id === deal.id;
            const days = daysSince(deal.created_at);

            return (
              <div key={deal.id}
                className={"border-4 p-5 transition-all cursor-pointer " + (isSelected ? 'border-brand-yellow shadow-neo-yellow' : warn?.type === 'red' ? 'border-brand-pink shadow-neo-pink' : warn?.type === 'yellow' ? 'border-brand-yellow/60' : deal.is_read ? 'border-white/20 hover:border-white/40' : 'border-brand-cyan shadow-neo-cyan')}
                onClick={() => { setSelectedDeal(isSelected ? null : deal); setReplyingTo(null); setShowSignForm(false); setShowRoyaltyForm(false); }}>

                <div className="flex flex-col md:flex-row gap-4 justify-between">
                  <div className="flex-1 min-w-0">
                    {/* STATUS + WARNING */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={"text-[8px] font-black uppercase px-3 py-1 inline-block border " + cfg.bg}>
                        {cfg.label}
                      </span>
                      {warn && (
                        <span className={"text-[8px] font-black uppercase px-3 py-1 border " + (warn.type === 'red' ? 'bg-brand-pink text-black border-brand-pink' : 'border-brand-yellow text-brand-yellow')}>
                          ⚠ {warn.label}
                        </span>
                      )}
                      {!deal.is_read && <span className="text-[8px] font-black uppercase px-2 py-1 bg-brand-pink text-white">UNREAD</span>}
                    </div>

                    {/* SHOW TITLE */}
                    <p className={"text-[8px] font-black uppercase tracking-widest mb-1 italic " + cfg.text}>{deal.show_title}</p>

                    {/* NAME */}
                    <p className="text-lg font-black uppercase italic text-white leading-none">{deal.from_name}</p>
                    <p className="text-xs text-white/40 font-bold mt-1">{deal.from_email}</p>

                    {/* TERRITORY + DATES */}
                    {(deal.territory || deal.contract_end_date) && (
                      <div className="flex gap-4 mt-2 flex-wrap">
                        {deal.territory && <span className="text-[9px] font-black uppercase text-white/40 border-l-4 border-brand-cyan pl-2">{deal.territory}</span>}
                        {deal.royalty_pct && <span className="text-[9px] font-black uppercase text-white/40 border-l-4 border-brand-yellow pl-2">ROY {deal.royalty_pct}%</span>}
                        {deal.contract_end_date && <span className="text-[9px] font-black uppercase text-white/40 border-l-4 border-brand-pink pl-2">EXP {fmt(deal.contract_end_date)}</span>}
                      </div>
                    )}

                    {/* MESSAGE */}
                    {deal.message && !isSelected && (
                      <p className="text-sm text-white/40 mt-2 italic border-l-4 border-brand-yellow pl-3 line-clamp-1">{deal.message}</p>
                    )}

                    <p className="text-[9px] text-white/20 font-bold uppercase mt-2">{fmt(deal.created_at)} · {days}D AGO</p>
                  </div>

                  {/* QUICK ACTION BUTTONS */}
                  <div className="flex flex-col gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    {status === 'new' && (
                      <>
                        <button onClick={() => openLaffWireThread(deal)}
                          className={btnYellow}>{openingThread === deal.id ? 'Opening...' : 'REPLY via LaffWire →'}</button>
                        <button onClick={() => updateStatus(deal, 'negotiating')}
                          className={btnGhost}>DEAL →</button>
                      </>
                    )}
                    {status === 'contacted' && (
                      <button onClick={() => updateStatus(deal, 'negotiating')} className={btnCyan}>NEGOTIATING →</button>
                    )}
                    {status === 'negotiating' && (
                      <button onClick={() => updateStatus(deal, 'contract_sent')} className={btnYellow}>SEND CONTRACT →</button>
                    )}
                    {status === 'contract_sent' && (
                      <button onClick={() => { setSelectedDeal(deal); setShowSignForm(true); setReplyingTo(null); }}
                        className={btnCyan}>MARK SIGNED ✓</button>
                    )}
                    {(status === 'signed' || status === 'royalties') && (
                      <button onClick={() => { setSelectedDeal(deal); setShowRoyaltyForm(true); }}
                        className={btnYellow}>+ REPORT</button>
                    )}
                  </div>
                </div>

                {/* EXPANDED DETAIL */}
                {isSelected && (
                  <div className="mt-5 border-t-2 border-white/10 pt-5 space-y-5" onClick={e => e.stopPropagation()}>

                    {/* FULL MESSAGE */}
                    {deal.message && (
                      <p className="text-sm text-white/60 italic border-l-4 border-brand-yellow pl-3">{deal.message}</p>
                    )}

                    {/* CONTRACT INFO */}
                    {deal.contract_signed_date && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="border-l-4 border-brand-yellow pl-3">
                          <p className="text-[9px] font-black uppercase text-white/30 italic">Signed</p>
                          <p className="text-white font-black text-sm">{fmt(deal.contract_signed_date)}</p>
                        </div>
                        <div className="border-l-4 border-brand-cyan pl-3">
                          <p className="text-[9px] font-black uppercase text-white/30 italic">Start</p>
                          <p className="text-white font-black text-sm">{fmt(deal.contract_start_date)}</p>
                        </div>
                        <div className="border-l-4 border-brand-pink pl-3">
                          <p className="text-[9px] font-black uppercase text-white/30 italic">End</p>
                          <p className="text-white font-black text-sm">{fmt(deal.contract_end_date)}</p>
                        </div>
                        <div className="border-l-4 border-white/20 pl-3">
                          <p className="text-[9px] font-black uppercase text-white/30 italic">Max Perf.</p>
                          <p className="text-white font-black text-sm">{deal.max_performances || '—'}</p>
                        </div>
                      </div>
                    )}

                    {/* STATUS MOVER */}
                    <div>
                      <p className="text-[9px] font-black uppercase italic text-white/30 tracking-widest mb-2">MOVE TO STATUS</p>
                      <div className="flex gap-2 flex-wrap">
                        {STATUS_ORDER.map(st => (
                          <button key={st} onClick={() => updateStatus(deal, st)}
                            className={"text-[8px] font-black uppercase px-3 py-1 border-2 transition-all italic " + ((deal.deal_status || 'new') === st ? STATUS_CFG[st].bg + ' border-black' : STATUS_CFG[st].border + ' ' + STATUS_CFG[st].text + ' hover:bg-white/10')}>
                            {STATUS_CFG[st].label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* NOTES */}
                    <div>
                      <p className="text-[9px] font-black uppercase italic text-brand-yellow tracking-widest mb-2">NOTES</p>
                      <textarea
                        defaultValue={deal.deal_notes || ''}
                        onBlur={e => saveNote(e.target.value)}
                        rows={3}
                        placeholder="Add deal notes..."
                        className="w-full bg-black border-2 border-white/20 p-3 text-white font-bold italic text-sm outline-none focus:border-brand-yellow resize-none"
                      />
                    </div>

                    {/* INLINE LAFFWIRE THREAD */}
                    <div className="border-4 border-brand-cyan/40 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2 border-b-2 border-brand-cyan/20">
                        <p className="text-[8px] font-black uppercase italic text-brand-cyan tracking-widest">🔒 LaffWire Thread</p>
                        <div className="flex gap-2">
                          <button onClick={() => { setExpandedThread(expandedThread === deal.id ? null : deal.id); loadThreadForDeal(deal.id); }}
                            className={btnSm}>
                            {expandedThread === deal.id ? 'Collapse ↑' : 'Expand ↓'}
                          </button>
                          <button onClick={() => onNavigate('wire')} className={btnCyan}>Open in LaffWire →</button>
                        </div>
                      </div>

                      {/* TIMELINE — always visible */}
                      <div className="px-4 py-3 space-y-2 max-h-40 overflow-y-auto">
                        {(dealThreads[deal.id] || []).length === 0 ? (
                          <div className="text-center py-3">
                            <p className="text-white/20 text-xs italic">No messages yet.</p>
                            <button onClick={() => openLaffWireThread(deal)} className={"mt-2 " + btnYellow}>
                              {openingThread === deal.id ? 'Opening...' : 'Start Thread →'}
                            </button>
                          </div>
                        ) : (dealThreads[deal.id] || []).map((post: any) => {
                          const isMe = post.user_id === user.id;
                          const isSystem = post.is_system;
                          if (isSystem) return (
                            <div key={post.id} className="text-center">
                              <span className="text-[8px] font-black uppercase italic text-white/20 border border-white/10 px-2 py-0.5">
                                {post.content}
                              </span>
                            </div>
                          );
                          return (
                            <div key={post.id} className={"flex gap-2 " + (isMe ? 'flex-row-reverse' : '')}>
                              <div className={"w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[8px] font-black border-2 " + (isMe ? 'bg-brand-yellow text-black border-black' : 'bg-brand-cyan text-black border-black')}>
                                {(post.profiles?.name || 'U')[0]}
                              </div>
                              <div className={"max-w-xs " + (isMe ? 'text-right' : '')}>
                                <div className={"border-2 px-2 py-1 " + (isMe ? 'border-brand-yellow/40' : 'border-white/20')}>
                                  <p className="text-white font-bold italic text-xs">{post.content}</p>
                                </div>
                                <p className="text-white/20 text-[8px] mt-0.5">{post.profiles?.name} · {new Date(post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* MESSAGE INPUT — always visible if thread exists */}
                      {(dealThreads[deal.id] || []).length > 0 && (
                        <div className="border-t-2 border-brand-cyan/20 p-3 flex gap-2">
                          <input
                            type="text"
                            value={threadMsg}
                            onChange={e => setThreadMsg(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') sendThreadMessage(deal); }}
                            placeholder="Type a message..."
                            className="flex-1 bg-black border-2 border-white/20 px-3 py-1.5 text-white font-bold italic text-xs outline-none focus:border-brand-cyan"
                          />
                          <button onClick={() => sendThreadMessage(deal)} disabled={sendingMsg || !threadMsg.trim()}
                            className={"disabled:opacity-30 " + btnCyan}>
                            Send →
                          </button>
                        </div>
                      )}
                    </div>

                    {/* SIGN FORM */}
                    {showSignForm && selectedDeal?.id === deal.id && (
                      <div className="border-4 border-green-400/40 p-5 space-y-4">
                        <p className="text-[9px] font-black uppercase italic text-green-400 tracking-widest">Mark Contract as Signed</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          <div>
                            <p className="text-[9px] font-black uppercase text-white/30 italic mb-1">Date Signed</p>
                            <input type="date" value={signForm.signed_date} onChange={e => setSignForm(p => ({ ...p, signed_date: e.target.value }))} className={inputCls} />
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase text-white/30 italic mb-1">Contract Start</p>
                            <input type="date" value={signForm.start_date} onChange={e => setSignForm(p => ({ ...p, start_date: e.target.value }))} className={inputCls} />
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase text-white/30 italic mb-1">Contract End</p>
                            <input type="date" value={signForm.end_date} onChange={e => setSignForm(p => ({ ...p, end_date: e.target.value }))} className={inputCls} />
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase text-white/30 italic mb-1">Territory</p>
                            <input type="text" placeholder="e.g. Norway" value={signForm.territory} onChange={e => setSignForm(p => ({ ...p, territory: e.target.value }))} className={inputCls} />
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase text-white/30 italic mb-1">Royalty %</p>
                            <input type="number" placeholder="12" value={signForm.royalty_pct} onChange={e => setSignForm(p => ({ ...p, royalty_pct: e.target.value }))} className={inputCls} />
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase text-white/30 italic mb-1">Advance EUR</p>
                            <input type="number" placeholder="2500" value={signForm.advance_amount} onChange={e => setSignForm(p => ({ ...p, advance_amount: e.target.value }))} className={inputCls} />
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase text-white/30 italic mb-1">Max Performances</p>
                            <input type="number" placeholder="24" value={signForm.max_performances} onChange={e => setSignForm(p => ({ ...p, max_performances: e.target.value }))} className={inputCls} />
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button onClick={markSigned} className="bg-green-400 text-black px-6 py-2 font-black uppercase italic text-xs border-2 border-black hover:bg-white transition-all">
                            Confirm Signed → Royalties
                          </button>
                          <button onClick={() => setShowSignForm(false)} className={btnGhost}>Cancel</button>
                        </div>
                      </div>
                    )}

                    {/* ROYALTY REPORTS */}
                    {(deal.deal_status === 'signed' || deal.deal_status === 'royalties' || deal.deal_status === 'completed') && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[9px] font-black uppercase italic text-brand-yellow tracking-widest">Royalty Reports</p>
                          <button onClick={() => setShowRoyaltyForm(!showRoyaltyForm)} className={btnYellow}>+ Add Report</button>
                        </div>

                        {showRoyaltyForm && selectedDeal?.id === deal.id && (
                          <div className="border-4 border-brand-yellow/40 p-5 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-[9px] font-black uppercase text-white/30 italic mb-1">Performance Date</p>
                                <input type="date" value={royaltyForm.date} onChange={e => setRoyaltyForm(p => ({ ...p, date: e.target.value }))} className={inputCls} />
                              </div>
                              <div>
                                <p className="text-[9px] font-black uppercase text-white/30 italic mb-1">Venue</p>
                                <input type="text" placeholder="Teatro Roma" value={royaltyForm.venue} onChange={e => setRoyaltyForm(p => ({ ...p, venue: e.target.value }))} className={inputCls} />
                              </div>
                              <div>
                                <p className="text-[9px] font-black uppercase text-white/30 italic mb-1">Tickets Sold</p>
                                <input type="number" placeholder="350" value={royaltyForm.tickets} onChange={e => setRoyaltyForm(p => ({ ...p, tickets: e.target.value }))} className={inputCls} />
                              </div>
                              <div>
                                <p className="text-[9px] font-black uppercase text-white/30 italic mb-1">Ticket Price EUR</p>
                                <input type="number" placeholder="25" value={royaltyForm.ticket_price} onChange={e => setRoyaltyForm(p => ({ ...p, ticket_price: e.target.value }))} className={inputCls} />
                              </div>
                            </div>
                            {royaltyForm.tickets && royaltyForm.ticket_price && (
                              <div className="flex gap-6 border-l-4 border-brand-yellow pl-4">
                                <div>
                                  <p className="text-[9px] font-black uppercase text-white/30 italic">Gross</p>
                                  <p className="text-white font-black">EUR {(Number(royaltyForm.tickets) * Number(royaltyForm.ticket_price)).toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-[9px] font-black uppercase text-white/30 italic">Royalty ({deal.royalty_pct || 0}%)</p>
                                  <p className="text-brand-yellow font-black">EUR {(Number(royaltyForm.tickets) * Number(royaltyForm.ticket_price) * Number(deal.royalty_pct || 0) / 100).toLocaleString()}</p>
                                </div>
                              </div>
                            )}
                            <input type="text" placeholder="Notes..." value={royaltyForm.notes} onChange={e => setRoyaltyForm(p => ({ ...p, notes: e.target.value }))} className={inputCls} />
                            <div className="flex gap-3">
                              <button onClick={addRoyaltyReport} className={btnYellow}>Save Report →</button>
                              <button onClick={() => setShowRoyaltyForm(false)} className={btnGhost}>Cancel</button>
                            </div>
                          </div>
                        )}

                        {reportsForDeal.length > 0 ? (
                          <div className="space-y-2">
                            <div className="grid grid-cols-5 gap-2 text-[8px] font-black uppercase text-white/30 italic pb-2 border-b border-white/10">
                              <span>Date</span><span>Venue</span><span>Tickets</span><span>Gross</span><span>Royalty</span>
                            </div>
                            {reportsForDeal.map(r => (
                              <div key={r.id} className="grid grid-cols-5 gap-2 text-xs font-bold text-white/70 py-2 border-b border-white/5">
                                <span>{fmt(r.date)}</span>
                                <span>{r.venue}</span>
                                <span>{r.tickets}</span>
                                <span>€{Number(r.gross).toLocaleString()}</span>
                                <span className="text-brand-yellow font-black">€{Number(r.royalty_amount).toLocaleString()}</span>
                              </div>
                            ))}
                            <div className="flex justify-end pt-2">
                              <div className="border-l-4 border-brand-yellow pl-4">
                                <p className="text-[9px] font-black uppercase text-white/30 italic">Total Royalty</p>
                                <p className="text-brand-yellow font-black text-lg">EUR {reportsForDeal.reduce((s, r) => s + Number(r.royalty_amount), 0).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-white/20 italic text-sm font-bold uppercase">No reports yet.</p>
                        )}
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* PIPELINE STATUS SUMMARY */}
      <div className="border-4 border-white/10 p-5">
        <p className="text-[9px] font-black uppercase italic text-white/30 tracking-widest mb-4">Pipeline Overview</p>
        <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
          {STATUS_ORDER.map(st => {
            const count = deals.filter(d => (d.deal_status || 'new') === st).length;
            return (
              <button key={st} onClick={() => setFilterStatus(filterStatus === st ? 'all' : st)}
                className={"p-3 border-2 text-center transition-all " + (filterStatus === st ? STATUS_CFG[st].bg + ' border-black' : 'border-white/10 hover:border-white/30')}>
                <p className={"text-2xl font-black " + (filterStatus === st ? 'text-black' : STATUS_CFG[st].text)}>{count}</p>
                <p className={"text-[7px] font-black uppercase italic mt-1 " + (filterStatus === st ? 'text-black' : 'text-white/30')}>{STATUS_CFG[st].label}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DealsPipelinePage;
