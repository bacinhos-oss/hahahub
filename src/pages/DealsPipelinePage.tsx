import React, { useState, useEffect, useRef } from 'react';
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
  last_activity_at?: string;
  advance_amount?: number;
  royalty_pct?: number;
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
  buyer_id: string;
  buyer_name: string;
}

interface Msg {
  id: string;
  deal_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: { name: string };
}

const STATUSES: { key: DealStatus; label: string; dot: string; desc: string; bg: string }[] = [
  { key: 'new',           label: 'New',           dot: 'bg-brand-pink',   desc: 'Inquiry received',     bg: 'bg-brand-pink' },
  { key: 'contacted',     label: 'Contacted',     dot: 'bg-brand-cyan',   desc: 'You replied',          bg: 'bg-brand-cyan' },
  { key: 'negotiating',   label: 'Negotiating',   dot: 'bg-brand-yellow', desc: 'In discussion',        bg: 'bg-brand-yellow' },
  { key: 'contract_sent', label: 'Contract Sent', dot: 'bg-purple-400',   desc: 'Awaiting signature',   bg: 'bg-purple-400' },
  { key: 'signed',        label: 'Signed',        dot: 'bg-green-400',    desc: 'Deal confirmed',       bg: 'bg-green-400' },
  { key: 'royalties',     label: 'Royalties',     dot: 'bg-orange-400',   desc: 'Tracking performances', bg: 'bg-orange-400' },
  { key: 'completed',     label: 'Completed',     dot: 'bg-white/30',     desc: 'Deal closed',          bg: 'bg-white/20' },
];

const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const fmtShort = (d?: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—';
const fmtTime = (d?: string) => d ? new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
const daysSince = (d?: string) => d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : 0;

const DealsPipelinePage: React.FC<Props> = ({ user, onNavigate }) => {
  const [view, setView] = useState<'tickled' | 'tickler'>('tickled');
  const [viewMode, setViewMode] = useState<'shows' | 'list'>('shows');
  const [allTickled, setAllTickled] = useState<Deal[]>([]);
  const [allTickler, setAllTickler] = useState<Deal[]>([]);
  const [royaltyReports, setRoyaltyReports] = useState<RoyaltyReport[]>([]);
  const [msgCounts, setMsgCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [activeDealId, setActiveDealId] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [msgText, setMsgText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [sendingFile, setSendingFile] = useState(false);
  const [fileToSend, setFileToSend] = useState<File | null>(null);
  const [showSignForm, setShowSignForm] = useState(false);
  const [showRoyaltyForm, setShowRoyaltyForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [signForm, setSignForm] = useState({ signed_date: '', start_date: '', end_date: '', territory: '', royalty_pct: '', advance_amount: '', max_performances: '' });
  const [royaltyForm, setRoyaltyForm] = useState({ date: '', venue: '', tickets: '', ticket_price: '' });
  const msgsEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadData(); }, [user, view]);
  useEffect(() => { msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  // Realtime subscription for new messages
  useEffect(() => {
    if (!activeDealId) return;
    const channel = supabase
      .channel('deal_messages_' + activeDealId)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'deal_messages',
        filter: `deal_id=eq.${activeDealId}`,
      }, async () => {
        // Reload messages when new one arrives
        const { data } = await supabase.from('deal_messages').select('*, profiles(name)').eq('deal_id', activeDealId).order('created_at', { ascending: true });
        setMsgs((data || []) as Msg[]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeDealId]);

  // Realtime subscription for new messages on all deals (badge counter)
  useEffect(() => {
    const channel = supabase
      .channel('deal_messages_all_' + user.id)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'deal_messages',
      }, (payload: any) => {
        const newMsg = payload.new;
        // Only count messages from others
        if (newMsg.user_id !== user.id) {
          setMsgCounts(p => ({ ...p, [newMsg.deal_id]: (p[newMsg.deal_id] || 0) + 1 }));
          showToast('New message in ' + (newMsg.show_title || 'a deal'));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user.id]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const loadData = async () => {
    console.log('Pipeline user.id:', user.id, 'user:', user);
    setLoading(true);
    const [t1, t2, rr] = await Promise.all([
      supabase.from('inquiries').select('*').eq('producer_id', user.id).order('created_at', { ascending: false }),
      supabase.from('inquiries').select('*').eq('recipient_id', user.id).order('created_at', { ascending: false }),
      supabase.from('royalty_reports').select('*').order('date', { ascending: false }),
    ]);
    if (t1.data) setAllTickled(t1.data as Deal[]);
    if (t2.data) setAllTickler(t2.data as Deal[]);
    if (rr.data) setRoyaltyReports(rr.data as RoyaltyReport[]);
    const allDeals = [...(t1.data || []), ...(t2.data || [])];
    if (allDeals.length > 0) {
      const counts: Record<string, number> = {};
      for (const deal of allDeals.slice(0, 20)) {
        const { count } = await supabase.from('deal_messages').select('*', { count: 'exact', head: true }).eq('deal_id', deal.id).neq('user_id', user.id);
        counts[deal.id] = count || 0;
      }
      setMsgCounts(counts);
    }
    setLoading(false);
  };

  const deals = view === 'tickled' ? allTickled : allTickler;
  const activeDeal = deals.find(d => d.id === activeDealId) || null;

  const openDeal = async (deal: Deal) => {
    if (activeDealId === deal.id) { setActiveDealId(null); setMsgs([]); return; }
    setActiveDealId(deal.id);
    setShowSignForm(false);
    setShowRoyaltyForm(false);
    setShowDeleteConfirm(false);
    setMsgText('');
    setFileToSend(null);
    setMsgCounts(p => ({ ...p, [deal.id]: 0 }));
    if (!deal.is_read) {
      await supabase.from('inquiries').update({ is_read: true }).eq('id', deal.id);
      if (view === 'tickled') setAllTickled(p => p.map(d => d.id === deal.id ? { ...d, is_read: true } : d));
      else setAllTickler(p => p.map(d => d.id === deal.id ? { ...d, is_read: true } : d));
    }
    setMsgLoading(true);
    const { data } = await supabase.from('deal_messages').select('*, profiles(name)').eq('deal_id', deal.id).order('created_at', { ascending: true });
    setMsgs((data || []) as Msg[]);
    setMsgLoading(false);
  };

  const updateStatus = async (deal: Deal, newStatus: DealStatus) => {
    await supabase.from('inquiries').update({ deal_status: newStatus, last_activity_at: new Date().toISOString() }).eq('id', deal.id);
    const update = (p: Deal[]) => p.map(d => d.id === deal.id ? { ...d, deal_status: newStatus } : d);
    if (view === 'tickled') setAllTickled(update); else setAllTickler(update);
    const s = STATUSES.find(s => s.key === newStatus);
    showToast(s?.label || '');
  };

  const deleteDeal = async (deal: Deal) => {
    await supabase.from('inquiries').delete().eq('id', deal.id);
    if (view === 'tickled') setAllTickled(p => p.filter(d => d.id !== deal.id));
    else setAllTickler(p => p.filter(d => d.id !== deal.id));
    setActiveDealId(null);
    setMsgs([]);
    setShowDeleteConfirm(false);
    showToast('Deal deleted');
  };

  const sendMsg = async () => {
    if (!msgText.trim() || !activeDeal) return;
    setSendingMsg(true);
    const { error } = await supabase.from('deal_messages').insert({ deal_id: activeDeal.id, user_id: user.id, content: msgText.trim(), show_title: activeDeal.show_title });
    if (!error) {
      setMsgText('');
      const { data } = await supabase.from('deal_messages').select('*, profiles(name)').eq('deal_id', activeDeal.id).order('created_at', { ascending: true });
      setMsgs((data || []) as Msg[]);
    }
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
        const fileUrl = urlData?.publicUrl || '';
        await supabase.from('deal_messages').insert({ deal_id: activeDeal.id, user_id: user.id, content: `FILE:${fileToSend.name}|${fileUrl}`, show_title: activeDeal.show_title });
        setFileToSend(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        const { data } = await supabase.from('deal_messages').select('*, profiles(name)').eq('deal_id', activeDeal.id).order('created_at', { ascending: true });
        setMsgs((data || []) as Msg[]);
        showToast('File sent!');
      }
    } catch { showToast('Error sending file.'); }
    setSendingFile(false);
  };

  const markSigned = async () => {
    if (!activeDeal) return;
    const updates: any = { deal_status: 'signed', contract_signed_date: signForm.signed_date, contract_start_date: signForm.start_date, contract_end_date: signForm.end_date, territory: signForm.territory, royalty_pct: signForm.royalty_pct ? Number(signForm.royalty_pct) : null, advance_amount: signForm.advance_amount ? Number(signForm.advance_amount) : null, last_activity_at: new Date().toISOString() };
    await supabase.from('inquiries').update(updates).eq('id', activeDeal.id);
    try {
      await fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'deal_signed_producer', to: user.email, data: { show_title: activeDeal.show_title, buyer: activeDeal.from_name, territory: signForm.territory, signed_date: signForm.signed_date } }) });
      await fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'deal_signed_buyer', to: activeDeal.from_email, data: { show_title: activeDeal.show_title, producer: user.name, territory: signForm.territory, signed_date: signForm.signed_date } }) });
      await supabase.from('posts').insert({ user_id: user.id, type: 'deal', content: `DEAL SIGNED — "${activeDeal.show_title}"${signForm.territory ? ' · ' + signForm.territory : ''}`, likes_count: 0, is_private: false });
    } catch {}
    const update = (p: Deal[]) => p.map(d => d.id === activeDeal.id ? { ...d, ...updates } : d);
    if (view === 'tickled') setAllTickled(update); else setAllTickler(update);
    setShowSignForm(false);
    showToast('Signed! Emails sent.');
  };

  const addReport = async () => {
    if (!activeDeal) return;
    const gross = Number(royaltyForm.tickets) * Number(royaltyForm.ticket_price);
    const royalty_amount = gross * (Number(activeDeal.royalty_pct || 0) / 100);
    const { error } = await supabase.from('royalty_reports').insert({ show_id: activeDeal.show_id, show_title: activeDeal.show_title, date: royaltyForm.date, venue: royaltyForm.venue, tickets: Number(royaltyForm.tickets), ticket_price: Number(royaltyForm.ticket_price), gross, royalty_amount, buyer_id: user.id, buyer_name: user.name });
    if (!error) { setRoyaltyForm({ date: '', venue: '', tickets: '', ticket_price: '' }); setShowRoyaltyForm(false); loadData(); showToast('Report saved!'); }
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

  const DealRow = ({ deal }: { deal: Deal }) => {
    const s = STATUSES.find(s => s.key === (deal.deal_status || 'new')) || STATUSES[0];
    const isActive = activeDealId === deal.id;
    const days = daysSince(deal.last_activity_at || deal.created_at);
    const isOverdue = ((deal.deal_status === 'new' || !deal.deal_status) && days >= 7) || (deal.deal_status === 'contract_sent' && days >= 7);
    return (
      <div onClick={() => openDeal(deal)}
        className={"border-b border-white/10 last:border-b-0 cursor-pointer transition-all " + (isActive ? 'bg-brand-yellow/5 border-l-4 border-l-brand-yellow' : isOverdue ? 'border-l-4 border-l-brand-pink hover:bg-white/3' : 'hover:bg-white/3')}>
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={"w-2 h-2 rounded-full flex-shrink-0 " + s.dot} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-black uppercase italic text-white text-sm">{deal.from_name}</p>
                {!deal.is_read && <span className="text-[7px] font-black uppercase bg-brand-pink text-white px-1.5 py-0.5">NEW</span>}
                {(msgCounts[deal.id] || 0) > 0 && <span className="text-[7px] font-black uppercase bg-brand-cyan text-black px-1.5 py-0.5">{msgCounts[deal.id]} MSG</span>}
                {deal.package_type && <span className={"text-[7px] font-black uppercase px-1.5 py-0.5 " + (deal.package_type === 'full_punch' ? 'bg-brand-pink/20 text-brand-pink' : 'bg-brand-yellow/20 text-brand-yellow')}>{deal.package_type === 'full_punch' ? 'FULL PUNCH' : 'SCRIPT'}</span>}
              </div>
              <p className="text-white/30 text-xs">{fmtShort(deal.created_at)}{deal.territory && ` · ${deal.territory}`}</p>
            </div>
          </div>
          <span className={"text-[7px] font-black uppercase px-2 py-1 flex-shrink-0 text-black " + s.bg}>{s.label}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {toast && <div className="fixed bottom-6 right-6 z-50 bg-brand-yellow text-black px-6 py-3 font-black uppercase italic text-xs border-4 border-black">{toast}</div>}

      {/* HEADER */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-4xl font-black uppercase italic">DEAL <span className="text-brand-yellow">PIPELINE</span></h2>
          <p className="text-white/30 text-xs italic mt-1 uppercase font-black tracking-widest">{deals.length} deals · {deals.filter(d => !d.is_read).length} unread · EUR {totalRoyalties.toLocaleString()} royalties</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="flex border-4 border-white/20">
            <button onClick={() => { setView('tickled'); setActiveDealId(null); setMsgs([]); }} className={"px-4 py-2 font-black uppercase italic text-xs transition-all flex items-center gap-2 " + (view === 'tickled' ? 'bg-brand-yellow text-black' : 'text-white/40 hover:text-white')}>
              TICKLED <span className={"text-[8px] px-1.5 py-0.5 rounded-full " + (view === 'tickled' ? 'bg-black text-brand-yellow' : 'bg-white/10')}>{allTickled.length}</span>
            </button>
            <button onClick={() => { setView('tickler'); setActiveDealId(null); setMsgs([]); }} className={"px-4 py-2 font-black uppercase italic text-xs transition-all flex items-center gap-2 " + (view === 'tickler' ? 'bg-brand-cyan text-black' : 'text-white/40 hover:text-white')}>
              TICKLER <span className={"text-[8px] px-1.5 py-0.5 rounded-full " + (view === 'tickler' ? 'bg-black text-brand-cyan' : 'bg-white/10')}>{allTickler.length}</span>
            </button>
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
          { label: 'New', value: deals.filter(d => (d.deal_status || 'new') === 'new').length, color: 'text-brand-pink' },
          { label: 'Active', value: deals.filter(d => ['contacted','negotiating','contract_sent'].includes(d.deal_status || 'new')).length, color: 'text-brand-yellow' },
          { label: 'Signed', value: deals.filter(d => ['signed','royalties'].includes(d.deal_status || 'new')).length, color: 'text-green-400' },
          { label: 'Royalties', value: `EUR ${totalRoyalties.toLocaleString()}`, color: 'text-orange-400' },
        ].map((s, i) => (
          <div key={i} className="border-4 border-white/10 p-4 text-center">
            <p className={"text-xl font-black " + s.color}>{s.value}</p>
            <p className="text-[8px] font-black uppercase italic text-white/30 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <p className="text-white/20 font-black uppercase italic">Loading...</p>
      ) : deals.length === 0 ? (
        <div className="border-4 border-white/10 p-12 text-center space-y-3">
          <p className="text-white/40 font-black uppercase italic text-sm">
            {view === 'tickled' ? 'No inquiries yet.' : 'You have not tickled any shows yet.'}
          </p>
          {view === 'tickler' && (
            <button onClick={() => onNavigate('discovery')} className="bg-brand-yellow text-black px-6 py-2 font-black uppercase italic text-xs border-2 border-black hover:bg-white transition-all">Browse Catalog</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">

          {/* LEFT */}
          <div className="space-y-4 min-h-96">
            {viewMode === 'list' ? (
              <div className="border-4 border-white/20 overflow-hidden">
                {deals.map(deal => <DealRow key={deal.id} deal={deal} />)}
              </div>
            ) : (
              Object.entries(showGroups).map(([showTitle, showDeals]) => {
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
                        {showRoyalties > 0 && <p className="text-orange-400 font-black text-sm">EUR {showRoyalties.toLocaleString()}</p>}
                      </div>
                    </div>
                    {showDeals.map(deal => <DealRow key={deal.id} deal={deal} />)}
                  </div>
                );
              })
            )}
          </div>

          {/* RIGHT */}
          <div className="lg:sticky lg:top-4">
            {!activeDeal ? (
              <div className="border-4 border-white/10 overflow-hidden">
                <div className="bg-white/5 px-5 py-4 border-b-2 border-white/10">
                  <p className="text-[8px] font-black uppercase italic text-brand-yellow tracking-widest mb-1">How Pipeline works</p>
                  <p className="text-white/40 text-xs italic">Click any deal on the left to manage it. You are in control — move deals through stages manually.</p>
                </div>
                <div className="px-5 py-4 space-y-4">
                  <div className="space-y-3">
                    {STATUSES.map(s => (
                      <div key={s.key} className="flex gap-3 items-start">
                        <div className={"w-2 h-2 rounded-full flex-shrink-0 mt-1.5 " + s.dot} />
                        <div>
                          <p className="font-black uppercase italic text-white text-xs">{s.label}</p>
                          <p className="text-white/30 text-xs italic">{s.desc}</p>
                          {s.key === 'new' && <p className="text-white/20 text-[9px] italic mt-0.5">Reply in the message box. Move to Contacted when done.</p>}
                          {s.key === 'contract_sent' && <p className="text-white/20 text-[9px] italic mt-0.5">Mark as Signed button appears. Fill in deal terms.</p>}
                          {s.key === 'signed' && <p className="text-white/20 text-[9px] italic mt-0.5">Emails go to both parties. LaffWire announces the deal.</p>}
                          {s.key === 'royalties' && <p className="text-white/20 text-[9px] italic mt-0.5">Log each performance. Royalty is calculated automatically.</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/10 pt-4 space-y-2">
                    <p className="text-[8px] font-black uppercase italic text-brand-cyan tracking-widest">Tips</p>
                    {[
                      'TICKLED — inquiries sent to your shows',
                      'TICKLER — shows you have inquired about',
                      'Message box sends directly to the other party',
                      'Send scripts, PDFs or Full Punch materials via file upload',
                      'Delete a deal if it is no longer relevant',
                    ].map((tip, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        <span className="text-white/30 font-black text-xs flex-shrink-0">—</span>
                        <p className="text-white/30 text-xs italic">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-4 border-brand-yellow overflow-hidden">

                {/* DEAL HEADER */}
                <div className="bg-brand-yellow/10 px-5 py-4 border-b-2 border-brand-yellow/30">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={"text-[7px] font-black uppercase px-2 py-1 text-black " + (STATUSES.find(s => s.key === (activeDeal.deal_status || 'new'))?.bg || 'bg-brand-pink')}>
                          {STATUSES.find(s => s.key === (activeDeal.deal_status || 'new'))?.label}
                        </span>
                        {activeDeal.package_type && (
                          <span className={"text-[7px] font-black uppercase px-2 py-0.5 " + (activeDeal.package_type === 'full_punch' ? 'bg-brand-pink text-white' : 'bg-brand-yellow text-black')}>
                            {activeDeal.package_type === 'full_punch' ? 'FULL PUNCH' : 'SCRIPT'}
                          </span>
                        )}
                      </div>
                      <p className="text-[8px] font-black uppercase italic text-brand-yellow tracking-widest truncate">{activeDeal.show_title}</p>
                      <p className="text-xl font-black uppercase italic text-white">{activeDeal.from_name}</p>
                      <p className="text-white/40 text-xs">{activeDeal.from_email}</p>
                      {activeDeal.message && <p className="text-white/40 text-xs italic mt-2 border-l-2 border-brand-yellow pl-2 line-clamp-2">{activeDeal.message}</p>}
                    </div>
                    <button onClick={() => { setActiveDealId(null); setMsgs([]); }} className="text-white/30 hover:text-white font-black text-xl leading-none flex-shrink-0">✕</button>
                  </div>
                  {(activeDeal.territory || activeDeal.royalty_pct) && (
                    <div className="flex gap-4 mt-3 flex-wrap">
                      {activeDeal.territory && <span className="text-[9px] font-black uppercase text-white/40 border-l-4 border-brand-cyan pl-2">{activeDeal.territory}</span>}
                      {activeDeal.royalty_pct && <span className="text-[9px] font-black uppercase text-white/40 border-l-4 border-brand-yellow pl-2">ROY {activeDeal.royalty_pct}%</span>}
                      {activeDeal.advance_amount && <span className="text-[9px] font-black uppercase text-white/40 border-l-4 border-brand-pink pl-2">ADV EUR {activeDeal.advance_amount}</span>}
                    </div>
                  )}
                </div>

                {/* STATUS SELECTOR */}
                <div className="px-4 py-4 border-b-2 border-white/10">
                  <p className="text-[8px] font-black uppercase italic text-white/30 tracking-widest mb-1">Where is this deal?</p>
                  <p className="text-white/20 text-[9px] italic mb-3">Click a stage to move the deal. Saved automatically.</p>
                  <div className="grid grid-cols-2 gap-2">
                    {STATUSES.map(s => {
                      const isCurrent = (activeDeal.deal_status || 'new') === s.key;
                      return (
                        <button key={s.key} onClick={() => updateStatus(activeDeal, s.key)}
                          className={"flex items-center gap-2 px-3 py-2 border-2 transition-all text-left " + (isCurrent ? s.bg + ' border-black text-black' : 'border-white/20 text-white/50 hover:border-white/60 hover:text-white')}>
                          <div className={"w-2 h-2 rounded-full flex-shrink-0 " + (isCurrent ? 'bg-black/30' : s.dot)} />
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
                      {showSignForm ? 'Cancel' : 'Mark as Signed — Enter Deal Terms'}
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
                          ].map(f => (
                            <div key={f.key}>
                              <p className="text-[8px] font-black uppercase italic text-white/30 mb-1">{f.label}</p>
                              <input type={f.type} placeholder={f.ph || ''} value={(signForm as any)[f.key]} onChange={e => setSignForm(p => ({ ...p, [f.key]: e.target.value }))} className={inp} />
                            </div>
                          ))}
                        </div>
                        <button onClick={markSigned} className="w-full bg-green-400 text-black py-3 font-black uppercase italic text-sm border-2 border-black hover:bg-white transition-all">
                          Confirm — Move to Royalties and Send Emails
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ROYALTIES */}
                {(activeDeal.deal_status === 'signed' || activeDeal.deal_status === 'royalties') && (
                  <div className="px-4 py-4 border-b-2 border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[8px] font-black uppercase italic text-brand-yellow tracking-widest">Royalty Reports</p>
                      <button onClick={() => setShowRoyaltyForm(!showRoyaltyForm)} className="bg-brand-yellow text-black px-3 py-1 font-black uppercase italic text-xs border-2 border-black hover:bg-white transition-all">
                        {showRoyaltyForm ? 'Cancel' : '+ Add'}
                      </button>
                    </div>
                    {showRoyaltyForm && (
                      <div className="space-y-3 mb-4 border-2 border-brand-yellow/30 p-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div><p className="text-[8px] font-black uppercase italic text-white/30 mb-1">Date</p><input type="date" value={royaltyForm.date} onChange={e => setRoyaltyForm(p => ({ ...p, date: e.target.value }))} className={inp} /></div>
                          <div><p className="text-[8px] font-black uppercase italic text-white/30 mb-1">Venue</p><input type="text" placeholder="Teatro Roma" value={royaltyForm.venue} onChange={e => setRoyaltyForm(p => ({ ...p, venue: e.target.value }))} className={inp} /></div>
                          <div><p className="text-[8px] font-black uppercase italic text-white/30 mb-1">Tickets Sold</p><input type="number" placeholder="350" value={royaltyForm.tickets} onChange={e => setRoyaltyForm(p => ({ ...p, tickets: e.target.value }))} className={inp} /></div>
                          <div><p className="text-[8px] font-black uppercase italic text-white/30 mb-1">Ticket Price EUR</p><input type="number" placeholder="25" value={royaltyForm.ticket_price} onChange={e => setRoyaltyForm(p => ({ ...p, ticket_price: e.target.value }))} className={inp} /></div>
                        </div>
                        {royaltyForm.tickets && royaltyForm.ticket_price && (
                          <div className="flex gap-4 border-l-4 border-brand-yellow pl-3">
                            <span className="text-white/40 text-sm">Gross: <span className="text-white font-black">EUR {(Number(royaltyForm.tickets) * Number(royaltyForm.ticket_price)).toLocaleString()}</span></span>
                            <span className="text-white/40 text-sm">Royalty: <span className="text-brand-yellow font-black">EUR {(Number(royaltyForm.tickets) * Number(royaltyForm.ticket_price) * Number(activeDeal.royalty_pct || 0) / 100).toLocaleString()}</span></span>
                          </div>
                        )}
                        <button onClick={addReport} className="w-full bg-brand-yellow text-black py-2 font-black uppercase italic text-xs border-2 border-black hover:bg-white transition-all">Save Report</button>
                      </div>
                    )}
                    {reportsForDeal.length > 0 ? (
                      <div className="space-y-1">
                        {reportsForDeal.map(r => (
                          <div key={r.id} className="flex justify-between text-xs border-b border-white/5 pb-1">
                            <span className="text-white/40">{fmt(r.date)} · {r.venue}</span>
                            <span className="text-brand-yellow font-black">EUR {Number(r.royalty_amount).toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="flex justify-end pt-2">
                          <span className="text-brand-yellow font-black">Total: EUR {reportsForDeal.reduce((s, r) => s + Number(r.royalty_amount), 0).toLocaleString()}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-white/20 text-xs italic">No reports yet. Add the first performance.</p>
                    )}
                  </div>
                )}

                {/* MESSAGES */}
                <div>
                  <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between bg-brand-cyan/5">
                    <p className="text-[8px] font-black uppercase italic text-brand-cyan tracking-widest">Messages</p>
                    <p className="text-[8px] text-white/20 italic">Private — only you and {activeDeal.from_name} can see this</p>
                  </div>
                  <div className="px-4 py-3 space-y-3 min-h-24 max-h-64 overflow-y-auto">
                    {msgLoading ? (
                      <p className="text-white/20 text-xs italic text-center py-4">Loading...</p>
                    ) : msgs.length === 0 ? (
                      <p className="text-white/20 text-xs italic text-center py-4">No messages yet. Write below to start.</p>
                    ) : (
                      msgs.map(msg => {
                        const isMe = msg.user_id === user.id;
                        const isFile = msg.content.startsWith('FILE:');
                        let fileName = '';
                        let fileUrl = '';
                        if (isFile) {
                          const parts = msg.content.replace('FILE:', '').split('|');
                          fileName = parts[0];
                          fileUrl = parts[1];
                        }
                        return (
                          <div key={msg.id} className={"flex gap-2 " + (isMe ? 'flex-row-reverse' : '')}>
                            <div className={"w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[8px] font-black border-2 " + (isMe ? 'bg-brand-yellow text-black border-black' : 'bg-brand-cyan text-black border-black')}>
                              {((msg.profiles?.name || 'U')[0]).toUpperCase()}
                            </div>
                            <div className={"max-w-xs " + (isMe ? 'text-right' : '')}>
                              <div className={"border-2 px-3 py-1.5 " + (isMe ? 'border-brand-yellow/40' : 'border-white/20')}>
                                {isFile ? (
                                  <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-brand-cyan font-black italic text-xs hover:underline">
                                    Attachment: {fileName}
                                  </a>
                                ) : (
                                  <p className="text-white font-bold italic text-xs">{msg.content}</p>
                                )}
                              </div>
                              <p className="text-white/20 text-[8px] mt-0.5">{msg.profiles?.name} · {fmtTime(msg.created_at)}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={msgsEndRef} />
                  </div>
                  <div className="border-t-2 border-white/10">
                    <div className="px-4 py-3 flex gap-2">
                      <input type="text" value={msgText} onChange={e => setMsgText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
                        placeholder={`Message ${activeDeal.from_name}... (Enter to send)`}
                        className="flex-1 bg-black border-2 border-white/20 px-3 py-2 text-white font-bold italic text-xs outline-none focus:border-brand-cyan" />
                      <button onClick={sendMsg} disabled={sendingMsg || !msgText.trim()} className="bg-brand-cyan text-black px-4 font-black uppercase italic text-xs border-2 border-black disabled:opacity-30 hover:bg-white transition-all">
                        {sendingMsg ? '...' : 'Send'}
                      </button>
                    </div>
                    <div className="px-4 pb-3 flex gap-2 items-center border-t border-white/5 pt-2">
                      <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.zip"
                        onChange={e => setFileToSend(e.target.files?.[0] || null)}
                        className="text-white/30 text-[9px] flex-1 file:bg-white/10 file:text-white/60 file:font-black file:text-[8px] file:uppercase file:px-2 file:py-1 file:border-0 file:mr-2 cursor-pointer" />
                      {fileToSend && (
                        <button onClick={sendFile} disabled={sendingFile} className="bg-brand-yellow text-black px-3 py-1 font-black uppercase italic text-[9px] border-2 border-black disabled:opacity-30 hover:bg-white transition-all">
                          {sendingFile ? '...' : 'Send File'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* DELETE */}
                <div className="px-4 py-3 border-t-2 border-white/10">
                  {!showDeleteConfirm ? (
                    <button onClick={() => setShowDeleteConfirm(true)} className="text-white/20 hover:text-brand-pink transition-colors font-black uppercase italic text-[9px]">
                      Delete this deal
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
