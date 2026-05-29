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
  package_type?: string;
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

const STATUSES: { key: DealStatus; label: string; emoji: string; desc: string; bg: string }[] = [
  { key: 'new',           label: 'New',           emoji: '📬', desc: 'Inquiry received',      bg: 'bg-brand-pink' },
  { key: 'contacted',     label: 'Contacted',     emoji: '💬', desc: 'You replied',            bg: 'bg-brand-cyan' },
  { key: 'negotiating',   label: 'Negotiating',   emoji: '🤝', desc: 'In discussion',          bg: 'bg-brand-yellow' },
  { key: 'contract_sent', label: 'Contract Sent', emoji: '📄', desc: 'Awaiting signature',     bg: 'bg-purple-400' },
  { key: 'signed',        label: 'Signed',        emoji: '✅', desc: 'Deal confirmed',         bg: 'bg-green-400' },
  { key: 'royalties',     label: 'Royalties',     emoji: '💰', desc: 'Tracking performances',  bg: 'bg-orange-400' },
  { key: 'completed',     label: 'Completed',     emoji: '🏆', desc: 'Deal closed',            bg: 'bg-white/20' },
];

const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const fmtShort = (d?: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—';
const fmtTime = (d?: string) => d ? new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
const daysSince = (d?: string) => d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : 0;

const DealsPipelinePage: React.FC<Props> = ({ user, onNavigate }) => {
  const [view, setView] = useState<'tickled' | 'tickler'>('tickled');
  const [allTickled, setAllTickled] = useState<Deal[]>([]);
  const [allTickler, setAllTickler] = useState<Deal[]>([]);
  const [royaltyReports, setRoyaltyReports] = useState<RoyaltyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [activeDealId, setActiveDealId] = useState<string | null>(null);
  const [threadPosts, setThreadPosts] = useState<ThreadPost[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [threadMsg, setThreadMsg] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [openingThread, setOpeningThread] = useState(false);
  const [showSignForm, setShowSignForm] = useState(false);
  const [showRoyaltyForm, setShowRoyaltyForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sendingFile, setSendingFile] = useState(false);
  const [fileToSend, setFileToSend] = useState<File | null>(null);
  const [signForm, setSignForm] = useState({ signed_date: '', start_date: '', end_date: '', territory: '', royalty_pct: '', advance_amount: '', max_performances: '' });
  const [royaltyForm, setRoyaltyForm] = useState({ date: '', venue: '', tickets: '', ticket_price: '', notes: '' });
  const threadEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadData(); }, [user]);
  useEffect(() => { threadEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [threadPosts]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const loadData = async () => {
    setLoading(true);
    const [t1, t2, rr] = await Promise.all([
      supabase.from('inquiries').select('*').eq('producer_id', user.id).order('created_at', { ascending: false }),
      supabase.from('inquiries').select('*').eq('recipient_id', user.id).order('created_at', { ascending: false }),
      supabase.from('royalty_reports').select('*').order('date', { ascending: false }),
    ]);
    if (t1.data) setAllTickled(t1.data as Deal[]);
    if (t2.data) setAllTickler(t2.data as Deal[]);
    if (rr.data) setRoyaltyReports(rr.data as RoyaltyReport[]);
    setLoading(false);
  };

  const deals = view === 'tickled' ? allTickled : allTickler;
  const activeDeal = deals.find(d => d.id === activeDealId) || null;

  const openDeal = async (deal: Deal) => {
    if (activeDealId === deal.id) { setActiveDealId(null); setThreadPosts([]); return; }
    setActiveDealId(deal.id);
    setShowSignForm(false);
    setShowRoyaltyForm(false);
    setShowDeleteConfirm(false);
    setThreadMsg('');
    setFileToSend(null);
    if (!deal.is_read) {
      await supabase.from('inquiries').update({ is_read: true }).eq('id', deal.id);
      if (view === 'tickled') setAllTickled(p => p.map(d => d.id === deal.id ? { ...d, is_read: true } : d));
      else setAllTickler(p => p.map(d => d.id === deal.id ? { ...d, is_read: true } : d));
    }
    setThreadLoading(true);
    const { data } = await supabase.from('posts').select('*, profiles(name)').eq('deal_id', deal.id).eq('is_private', true).order('created_at', { ascending: true });
    setThreadPosts((data || []) as ThreadPost[]);
    setThreadLoading(false);
  };

  const updateStatus = async (deal: Deal, newStatus: DealStatus) => {
    await supabase.from('inquiries').update({ deal_status: newStatus, last_activity_at: new Date().toISOString() }).eq('id', deal.id);
    const update = (p: Deal[]) => p.map(d => d.id === deal.id ? { ...d, deal_status: newStatus } : d);
    if (view === 'tickled') setAllTickled(update); else setAllTickler(update);
    try {
      const { data: td } = await supabase.from('posts').select('thread_id, participants').eq('deal_id', deal.id).eq('is_private', true).limit(1).single();
      if (td?.thread_id) {
        const s = STATUSES.find(s => s.key === newStatus);
        await supabase.from('posts').insert({ user_id: user.id, type: 'news', content: `${s?.emoji} Status → ${s?.label}`, likes_count: 0, is_private: true, thread_id: td.thread_id, participants: td.participants, deal_id: deal.id, is_system: true, show_title: deal.show_title });
        if (activeDealId === deal.id) {
          const { data } = await supabase.from('posts').select('*, profiles(name)').eq('deal_id', deal.id).eq('is_private', true).order('created_at', { ascending: true });
          setThreadPosts((data || []) as ThreadPost[]);
        }
      }
    } catch {}
    const s = STATUSES.find(s => s.key === newStatus);
    showToast(`${s?.emoji} ${s?.label}`);
  };

  const deleteDeal = async (deal: Deal) => {
    await supabase.from('inquiries').delete().eq('id', deal.id);
    if (view === 'tickled') setAllTickled(p => p.filter(d => d.id !== deal.id));
    else setAllTickler(p => p.filter(d => d.id !== deal.id));
    setActiveDealId(null);
    setThreadPosts([]);
    setShowDeleteConfirm(false);
    showToast('Deal deleted');
  };

  const startThread = async (deal: Deal) => {
    setOpeningThread(true);
    try {
      const buyerId = deal.recipient_id || deal.producer_id;
      const producerId = user.id || '';
      await openDealThread(deal.id, deal.show_title, producerId, buyerId, `📬 New inquiry for "${deal.show_title}" from ${deal.from_name}`);
      await supabase.from('inquiries').update({ replied: true, deal_status: 'contacted', last_activity_at: new Date().toISOString() }).eq('id', deal.id);
      const update = (p: Deal[]) => p.map(d => d.id === deal.id ? { ...d, replied: true, deal_status: 'contacted' as DealStatus } : d);
      if (view === 'tickled') setAllTickled(update); else setAllTickler(update);
      const { data } = await supabase.from('posts').select('*, profiles(name)').eq('deal_id', deal.id).eq('is_private', true).order('created_at', { ascending: true });
      setThreadPosts((data || []) as ThreadPost[]);
      showToast('💬 Thread started!');
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

  const sendFile = async () => {
    if (!fileToSend || !activeDeal) return;
    setSendingFile(true);
    try {
      const ext = fileToSend.name.split('.').pop();
      const path = `deals/${activeDeal.id}_${Date.now()}.${ext}`;
      const { data: uploadData } = await supabase.storage.from('inquiry-attachments').upload(path, fileToSend, { contentType: fileToSend.type });
      if (uploadData) {
        const { data: urlData } = supabase.storage.from('inquiry-attachments').getPublicUrl(uploadData.path);
        const { data: td } = await supabase.from('posts').select('thread_id, participants').eq('deal_id', activeDeal.id).eq('is_private', true).limit(1).single();
        if (td?.thread_id) {
          await supabase.from('posts').insert({ user_id: user.id, type: 'news', content: `📎 ${fileToSend.name}\n${urlData?.publicUrl}`, likes_count: 0, is_private: true, thread_id: td.thread_id, participants: td.participants, deal_id: activeDeal.id, is_system: false, show_title: activeDeal.show_title });
          setFileToSend(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
          const { data } = await supabase.from('posts').select('*, profiles(name)').eq('deal_id', activeDeal.id).eq('is_private', true).order('created_at', { ascending: true });
          setThreadPosts((data || []) as ThreadPost[]);
          showToast('📎 File sent!');
        }
      }
    } catch { showToast('Error sending file.'); }
    setSendingFile(false);
  };

  const markSigned = async () => {
    if (!activeDeal) return;
    const updates: any = { deal_status: 'signed', contract_signed_date: signForm.signed_date, contract_start_date: signForm.start_date, contract_end_date: signForm.end_date, territory: signForm.territory, royalty_pct: signForm.royalty_pct ? Number(signForm.royalty_pct) : null, advance_amount: signForm.advance_amount ? Number(signForm.advance_amount) : null, max_performances: signForm.max_performances ? Number(signForm.max_performances) : null, last_activity_at: new Date().toISOString() };
    await supabase.from('inquiries').update(updates).eq('id', activeDeal.id);
    try {
      await fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'deal_signed_producer', to: user.email, data: { show_title: activeDeal.show_title, buyer: activeDeal.from_name, territory: signForm.territory, signed_date: signForm.signed_date } }) });
      await fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'deal_signed_buyer', to: activeDeal.from_email, data: { show_title: activeDeal.show_title, producer: user.name, territory: signForm.territory, signed_date: signForm.signed_date } }) });
    } catch {}
    const update = (p: Deal[]) => p.map(d => d.id === activeDeal.id ? { ...d, ...updates } : d);
    if (view === 'tickled') setAllTickled(update); else setAllTickler(update);
    setShowSignForm(false);
    showToast('✅ Signed! Emails sent.');
  };

  const addReport = async () => {
    if (!activeDeal) return;
    const gross = Number(royaltyForm.tickets) * Number(royaltyForm.ticket_price);
    const royalty_amount = gross * (Number(activeDeal.royalty_pct || 0) / 100);
    const { error } = await supabase.from('royalty_reports').insert({ show_id: activeDeal.show_id, show_title: activeDeal.show_title, date: royaltyForm.date, venue: royaltyForm.venue, tickets: Number(royaltyForm.tickets), ticket_price: Number(royaltyForm.ticket_price), gross, royalty_amount, notes: royaltyForm.notes, buyer_id: user.id, buyer_name: user.name });
    if (!error) { setRoyaltyForm({ date: '', venue: '', tickets: '', ticket_price: '', notes: '' }); setShowRoyaltyForm(false); loadData(); showToast('💰 Report saved!'); }
  };

  const showGroups = deals.reduce((acc, deal) => {
    const key = deal.show_title || 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(deal);
    return acc;
  }, {} as Record<string, Deal[]>);

  const totalRoyalties = royaltyReports.reduce((s, r) => s + Number(r.royalty_amount), 0);
  const reportsForDeal = activeDeal ? royaltyReports.filter(r => r.show_id === activeDeal.show_id) : [];
  const inp = "w-full bg-black border-2 border-white/20 p-2 text-white font-bold italic text-sm outline-none focus:border-brand-yellow";

  return (
    <div className="space-y-6">
      {toast && <div className="fixed bottom-6 right-6 z-50 bg-brand-yellow text-black px-6 py-3 font-black uppercase italic text-xs border-4 border-black">{toast}</div>}

      {/* HEADER */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-4xl font-black uppercase italic">DEAL <span className="text-brand-yellow">PIPELINE</span></h2>
          <p className="text-white/30 text-xs italic mt-1 uppercase font-black tracking-widest">{deals.length} deals · {deals.filter(d => !d.is_read).length} unread · €{totalRoyalties.toLocaleString()} royalties</p>
        </div>
        <div className="flex border-4 border-white/20">
          <button onClick={() => { setView('tickled'); setActiveDealId(null); setThreadPosts([]); }}
            className={"px-5 py-2 font-black uppercase italic text-xs transition-all flex items-center gap-2 " + (view === 'tickled' ? 'bg-brand-yellow text-black' : 'text-white/40 hover:text-white')}>
            🎭 Tickled <span className={"text-[8px] px-1.5 py-0.5 rounded-full " + (view === 'tickled' ? 'bg-black text-brand-yellow' : 'bg-white/10')}>{allTickled.length}</span>
          </button>
          <button onClick={() => { setView('tickler'); setActiveDealId(null); setThreadPosts([]); }}
            className={"px-5 py-2 font-black uppercase italic text-xs transition-all flex items-center gap-2 " + (view === 'tickler' ? 'bg-brand-cyan text-black' : 'text-white/40 hover:text-white')}>
            🥊 Tickler <span className={"text-[8px] px-1.5 py-0.5 rounded-full " + (view === 'tickler' ? 'bg-black text-brand-cyan' : 'bg-white/10')}>{allTickler.length}</span>
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'New', value: deals.filter(d => (d.deal_status||'new')==='new').length, color: 'text-brand-pink' },
          { label: 'Active', value: deals.filter(d => ['contacted','negotiating','contract_sent'].includes(d.deal_status||'new')).length, color: 'text-brand-yellow' },
          { label: 'Signed', value: deals.filter(d => ['signed','royalties'].includes(d.deal_status||'new')).length, color: 'text-green-400' },
          { label: 'Royalties', value: `€${totalRoyalties.toLocaleString()}`, color: 'text-orange-400' },
        ].map((s, i) => (
          <div key={i} className="border-4 border-white/10 p-4 text-center">
            <p className={"text-2xl font-black " + s.color}>{s.value}</p>
            <p className="text-[8px] font-black uppercase italic text-white/30 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <p className="text-white/20 font-black uppercase italic">Loading...</p>
      ) : deals.length === 0 ? (
        <div className="border-4 border-white/10 p-12 text-center space-y-3">
          <p className="text-5xl">{view === 'tickled' ? '🎭' : '🥊'}</p>
          <p className="text-white/40 font-black uppercase italic text-sm">
            {view === 'tickled' ? 'No inquiries yet.' : 'You have not tickled any shows yet.'}
          </p>
          {view === 'tickler' && (
            <button onClick={() => onNavigate('discovery')} className="bg-brand-yellow text-black px-6 py-2 font-black uppercase italic text-xs border-2 border-black hover:bg-white transition-all">Browse Catalog →</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">

          {/* LEFT */}
          <div className="space-y-4 min-h-96">
            {Object.entries(showGroups).map(([showTitle, showDeals]) => {
              const showRoyalties = royaltyReports.filter(r => r.show_title === showTitle).reduce((s, r) => s + Number(r.royalty_amount), 0);
              return (
                <div key={showTitle} className="border-4 border-white/20 overflow-hidden">
                  <div className="bg-white/5 px-4 py-3 flex items-center justify-between border-b-2 border-white/10">
                    <div>
                      <p className="text-[8px] font-black uppercase italic text-white/30">Show</p>
                      <p className="font-black uppercase italic text-white">{showTitle}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black uppercase italic text-white/30">{showDeals.length} deal{showDeals.length !== 1 ? 's' : ''}</p>
                      {showRoyalties > 0 && <p className="text-orange-400 font-black text-sm">€{showRoyalties.toLocaleString()}</p>}
                    </div>
                  </div>
                  {showDeals.map(deal => {
                    const s = STATUSES.find(s => s.key === (deal.deal_status || 'new')) || STATUSES[0];
                    const isActive = activeDealId === deal.id;
                    const days = daysSince(deal.last_activity_at || deal.created_at);
                    const isOverdue = ((deal.deal_status === 'new' || !deal.deal_status) && days >= 7) || (deal.deal_status === 'contract_sent' && days >= 7);
                    return (
                      <div key={deal.id} onClick={() => openDeal(deal)}
                        className={"border-b border-white/10 last:border-b-0 cursor-pointer transition-all " + (isActive ? 'bg-brand-yellow/5 border-l-4 border-l-brand-yellow' : isOverdue ? 'border-l-4 border-l-brand-pink hover:bg-white/3' : 'hover:bg-white/3')}>
                        <div className="px-4 py-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-lg flex-shrink-0">{s.emoji}</span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-black uppercase italic text-white text-sm">{deal.from_name}</p>
                                {!deal.is_read && <span className="text-[7px] font-black uppercase bg-brand-pink text-white px-1.5 py-0.5">NEW</span>}
                                {deal.package_type && <span className={"text-[7px] font-black uppercase px-1.5 py-0.5 " + (deal.package_type === 'full_punch' ? 'bg-brand-pink/20 text-brand-pink' : 'bg-brand-yellow/20 text-brand-yellow')}>{deal.package_type === 'full_punch' ? '🥊' : '🎭'}</span>}
                              </div>
                              <p className="text-white/30 text-xs">{fmtShort(deal.created_at)}{deal.territory && ` · ${deal.territory}`}</p>
                            </div>
                          </div>
                          <span className={"text-[7px] font-black uppercase px-2 py-1 flex-shrink-0 text-black " + s.bg}>{s.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* RIGHT */}
          <div className="lg:sticky lg:top-4">
            {!activeDeal ? (
              <div className="border-4 border-white/10 p-8 text-center space-y-4">
                <p className="text-4xl">👈</p>
                <p className="text-white/30 font-black uppercase italic text-sm">Select a deal to manage it</p>
                <div className="text-left space-y-2 border-t border-white/10 pt-4">
                  <p className="text-[8px] font-black uppercase italic text-white/20 tracking-widest mb-3">Deal stages</p>
                  {STATUSES.map(s => (
                    <div key={s.key} className="flex items-center gap-3">
                      <span className="text-base">{s.emoji}</span>
                      <div>
                        <span className="text-white/60 font-black uppercase italic text-xs">{s.label}</span>
                        <span className="text-white/20 text-xs italic"> — {s.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border-4 border-brand-yellow overflow-hidden">

                {/* DEAL HEADER */}
                <div className="bg-brand-yellow/10 px-5 py-4 border-b-2 border-brand-yellow/30">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={"text-[7px] font-black uppercase px-2 py-1 text-black " + (STATUSES.find(s => s.key === (activeDeal.deal_status||'new'))?.bg||'bg-brand-pink')}>
                          {STATUSES.find(s => s.key === (activeDeal.deal_status||'new'))?.emoji} {STATUSES.find(s => s.key === (activeDeal.deal_status||'new'))?.label}
                        </span>
                        {activeDeal.package_type && <span className={"text-[7px] font-black uppercase px-2 py-0.5 " + (activeDeal.package_type === 'full_punch' ? 'bg-brand-pink text-white' : 'bg-brand-yellow text-black')}>{activeDeal.package_type === 'full_punch' ? '🥊 Full Punch' : '🎭 Script'}</span>}
                      </div>
                      <p className="text-[8px] font-black uppercase italic text-brand-yellow tracking-widest truncate">{activeDeal.show_title}</p>
                      <p className="text-xl font-black uppercase italic text-white">{activeDeal.from_name}</p>
                      <p className="text-white/40 text-xs">{activeDeal.from_email}</p>
                      {activeDeal.message && <p className="text-white/40 text-xs italic mt-2 border-l-2 border-brand-yellow pl-2 line-clamp-2">{activeDeal.message}</p>}
                    </div>
                    <button onClick={() => { setActiveDealId(null); setThreadPosts([]); }} className="text-white/30 hover:text-white font-black text-xl leading-none flex-shrink-0">✕</button>
                  </div>
                  {(activeDeal.territory || activeDeal.royalty_pct) && (
                    <div className="flex gap-4 mt-3 flex-wrap">
                      {activeDeal.territory && <span className="text-[9px] font-black uppercase text-white/40 border-l-4 border-brand-cyan pl-2">{activeDeal.territory}</span>}
                      {activeDeal.royalty_pct && <span className="text-[9px] font-black uppercase text-white/40 border-l-4 border-brand-yellow pl-2">ROY {activeDeal.royalty_pct}%</span>}
                      {activeDeal.advance_amount && <span className="text-[9px] font-black uppercase text-white/40 border-l-4 border-brand-pink pl-2">ADV €{activeDeal.advance_amount}</span>}
                      {activeDeal.contract_end_date && <span className="text-[9px] font-black uppercase text-white/40 border-l-4 border-orange-400 pl-2">EXP {fmt(activeDeal.contract_end_date)}</span>}
                    </div>
                  )}
                </div>

                {/* STATUS SELECTOR */}
                <div className="px-4 py-4 border-b-2 border-white/10">
                  <p className="text-[8px] font-black uppercase italic text-white/30 tracking-widest mb-3">Where is this deal?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {STATUSES.map(s => {
                      const isCurrent = (activeDeal.deal_status || 'new') === s.key;
                      return (
                        <button key={s.key} onClick={() => updateStatus(activeDeal, s.key)}
                          className={"flex items-center gap-2 px-3 py-2 border-2 transition-all text-left " + (isCurrent ? s.bg + ' border-black text-black' : 'border-white/20 text-white/50 hover:border-white/60 hover:text-white')}>
                          <span className="text-base">{s.emoji}</span>
                          <div>
                            <p className={"text-xs font-black uppercase italic " + (isCurrent ? 'text-black' : '')}>{s.label}</p>
                            <p className={"text-[8px] " + (isCurrent ? 'text-black/60' : 'text-white/20')}>{s.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SIGN FORM */}
                {activeDeal.deal_status === 'contract_sent' && (
                  <div className="px-4 py-4 border-b-2 border-white/10 bg-green-400/5">
                    <button onClick={() => setShowSignForm(!showSignForm)} className="w-full bg-green-400 text-black py-3 font-black uppercase italic text-sm border-2 border-black hover:bg-white transition-all">
                      ✅ {showSignForm ? 'Cancel' : 'Mark as Signed — Enter Deal Terms'}
                    </button>
                    {showSignForm && (
                      <div className="mt-4 space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: 'Date Signed', key: 'signed_date', type: 'date' },
                            { label: 'Contract Start', key: 'start_date', type: 'date' },
                            { label: 'Contract End', key: 'end_date', type: 'date' },
                            { label: 'Territory', key: 'territory', type: 'text', ph: 'e.g. Norway' },
                            { label: 'Royalty %', key: 'royalty_pct', type: 'number', ph: '10' },
                            { label: 'Advance EUR', key: 'advance_amount', type: 'number', ph: '0' },
                            { label: 'Max Performances', key: 'max_performances', type: 'number', ph: '24' },
                          ].map(f => (
                            <div key={f.key}>
                              <p className="text-[8px] font-black uppercase italic text-white/30 mb-1">{f.label}</p>
                              <input type={f.type} placeholder={f.ph||''} value={(signForm as any)[f.key]} onChange={e => setSignForm(p => ({...p, [f.key]: e.target.value}))} className={inp} />
                            </div>
                          ))}
                        </div>
                        <button onClick={markSigned} className="w-full bg-green-400 text-black py-3 font-black uppercase italic text-sm border-2 border-black hover:bg-white transition-all">
                          ✅ Confirm — Move to Royalties & Send Emails
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ROYALTIES */}
                {(activeDeal.deal_status === 'signed' || activeDeal.deal_status === 'royalties') && (
                  <div className="px-4 py-4 border-b-2 border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[8px] font-black uppercase italic text-brand-yellow tracking-widest">💰 Royalty Reports</p>
                      <button onClick={() => setShowRoyaltyForm(!showRoyaltyForm)} className="bg-brand-yellow text-black px-3 py-1 font-black uppercase italic text-xs border-2 border-black hover:bg-white transition-all">
                        {showRoyaltyForm ? 'Cancel' : '+ Add'}
                      </button>
                    </div>
                    {showRoyaltyForm && (
                      <div className="space-y-3 mb-4 border-2 border-brand-yellow/30 p-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div><p className="text-[8px] font-black uppercase italic text-white/30 mb-1">Date</p><input type="date" value={royaltyForm.date} onChange={e => setRoyaltyForm(p => ({...p, date: e.target.value}))} className={inp} /></div>
                          <div><p className="text-[8px] font-black uppercase italic text-white/30 mb-1">Venue</p><input type="text" placeholder="Teatro Roma" value={royaltyForm.venue} onChange={e => setRoyaltyForm(p => ({...p, venue: e.target.value}))} className={inp} /></div>
                          <div><p className="text-[8px] font-black uppercase italic text-white/30 mb-1">Tickets Sold</p><input type="number" placeholder="350" value={royaltyForm.tickets} onChange={e => setRoyaltyForm(p => ({...p, tickets: e.target.value}))} className={inp} /></div>
                          <div><p className="text-[8px] font-black uppercase italic text-white/30 mb-1">Ticket Price €</p><input type="number" placeholder="25" value={royaltyForm.ticket_price} onChange={e => setRoyaltyForm(p => ({...p, ticket_price: e.target.value}))} className={inp} /></div>
                        </div>
                        {royaltyForm.tickets && royaltyForm.ticket_price && (
                          <div className="flex gap-4 border-l-4 border-brand-yellow pl-3">
                            <span className="text-white/40 text-sm">Gross: <span className="text-white font-black">€{(Number(royaltyForm.tickets)*Number(royaltyForm.ticket_price)).toLocaleString()}</span></span>
                            <span className="text-white/40 text-sm">Royalty: <span className="text-brand-yellow font-black">€{(Number(royaltyForm.tickets)*Number(royaltyForm.ticket_price)*Number(activeDeal.royalty_pct||0)/100).toLocaleString()}</span></span>
                          </div>
                        )}
                        <button onClick={addReport} className="w-full bg-brand-yellow text-black py-2 font-black uppercase italic text-xs border-2 border-black hover:bg-white transition-all">Save →</button>
                      </div>
                    )}
                    {reportsForDeal.length > 0 ? (
                      <div className="space-y-1">
                        {reportsForDeal.map(r => (
                          <div key={r.id} className="flex justify-between text-xs border-b border-white/5 pb-1">
                            <span className="text-white/40">{fmt(r.date)} · {r.venue}</span>
                            <span className="text-brand-yellow font-black">€{Number(r.royalty_amount).toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="flex justify-end pt-2">
                          <span className="text-brand-yellow font-black">Total: €{reportsForDeal.reduce((s,r)=>s+Number(r.royalty_amount),0).toLocaleString()}</span>
                        </div>
                      </div>
                    ) : <p className="text-white/20 text-xs italic">No reports yet.</p>}
                  </div>
                )}

                {/* THREAD */}
                <div>
                  <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between bg-brand-cyan/5">
                    <p className="text-[8px] font-black uppercase italic text-brand-cyan tracking-widest">🔒 Private Thread</p>
                    <button onClick={() => onNavigate('wire')} className="text-[8px] font-black uppercase italic text-brand-cyan hover:text-white transition-colors">Open in LaffWire →</button>
                  </div>
                  <div className="px-4 py-3 space-y-2 min-h-24 max-h-64 overflow-y-auto">
                    {threadLoading ? (
                      <p className="text-white/20 text-xs italic text-center py-4">Loading...</p>
                    ) : threadPosts.length === 0 ? (
                      <div className="text-center py-4 space-y-2">
                        <p className="text-white/20 text-xs italic">Start a private conversation with {activeDeal.from_name}.</p>
                        <button onClick={() => startThread(activeDeal)} disabled={openingThread} className="bg-brand-cyan text-black px-4 py-2 font-black uppercase italic text-xs border-2 border-black hover:bg-white transition-all disabled:opacity-30">
                          {openingThread ? 'Starting...' : '💬 Start Conversation →'}
                        </button>
                      </div>
                    ) : threadPosts.map(post => {
                      const isMe = post.user_id === user.id;
                      const isFile = post.content.startsWith('📎');
                      const fileUrl = isFile ? post.content.split('\n')[1] : null;
                      const fileName = isFile ? post.content.split('\n')[0].replace('📎 ', '') : null;
                      if (post.is_system) return (
                        <div key={post.id} className="text-center py-1">
                          <span className="text-[8px] font-black uppercase italic text-white/20 border border-white/10 px-2 py-0.5">{post.content}</span>
                        </div>
                      );
                      return (
                        <div key={post.id} className={"flex gap-2 " + (isMe ? 'flex-row-reverse' : '')}>
                          <div className={"w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[8px] font-black border-2 " + (isMe ? 'bg-brand-yellow text-black border-black' : 'bg-brand-cyan text-black border-black')}>
                            {((post.profiles?.name||'U')[0]).toUpperCase()}
                          </div>
                          <div className={"max-w-xs " + (isMe ? 'text-right' : '')}>
                            <div className={"border-2 px-3 py-1.5 " + (isMe ? 'border-brand-yellow/40' : 'border-white/20')}>
                              {isFile && fileUrl ? (
                                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-brand-cyan font-black italic text-xs hover:underline">📎 {fileName}</a>
                              ) : (
                                <p className="text-white font-bold italic text-xs">{post.content}</p>
                              )}
                            </div>
                            <p className="text-white/20 text-[8px] mt-0.5">{fmtTime(post.created_at)}</p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={threadEndRef} />
                  </div>
                  {threadPosts.length > 0 && (
                    <div className="border-t-2 border-white/10">
                      <div className="px-4 py-3 flex gap-2">
                        <input type="text" value={threadMsg} onChange={e => setThreadMsg(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); }}}
                          placeholder="Message... (Enter to send)"
                          className="flex-1 bg-black border-2 border-white/20 px-3 py-2 text-white font-bold italic text-xs outline-none focus:border-brand-cyan" />
                        <button onClick={sendMsg} disabled={sendingMsg||!threadMsg.trim()} className="bg-brand-cyan text-black px-4 font-black uppercase italic text-xs border-2 border-black disabled:opacity-30 hover:bg-white transition-all">
                          {sendingMsg ? '...' : '→'}
                        </button>
                      </div>
                      <div className="px-4 pb-3 flex gap-2 items-center border-t border-white/5 pt-2">
                        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.zip,.mp4"
                          onChange={e => setFileToSend(e.target.files?.[0]||null)}
                          className="text-white/30 text-[9px] flex-1 file:bg-white/10 file:text-white/60 file:font-black file:text-[8px] file:uppercase file:px-2 file:py-1 file:border-0 file:mr-2 cursor-pointer" />
                        {fileToSend && (
                          <button onClick={sendFile} disabled={sendingFile} className="bg-brand-yellow text-black px-3 py-1 font-black uppercase italic text-[9px] border-2 border-black disabled:opacity-30 hover:bg-white transition-all">
                            {sendingFile ? '...' : '📎 Send'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* DELETE */}
                <div className="px-4 py-3 border-t-2 border-white/10">
                  {!showDeleteConfirm ? (
                    <button onClick={() => setShowDeleteConfirm(true)} className="text-white/20 hover:text-brand-pink transition-colors font-black uppercase italic text-[9px]">
                      🗑 Delete this deal
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <p className="text-white/40 text-xs italic flex-1">Delete permanently?</p>
                      <button onClick={() => deleteDeal(activeDeal)} className="bg-brand-pink text-white px-3 py-1 font-black uppercase italic text-[9px] border-2 border-black hover:bg-red-600 transition-all">Yes</button>
                      <button onClick={() => setShowDeleteConfirm(false)} className="border-2 border-white/20 text-white/40 px-3 py-1 font-black uppercase italic text-[9px] hover:border-white hover:text-white transition-all">Cancel</button>
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
