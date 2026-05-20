import React, { useState, useEffect } from 'react';
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
  type?: string;
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

const STATUS_LABELS: Record<DealStatus, string> = {
  new: 'Novo',
  contacted: 'Kontaktiran',
  negotiating: 'Pogajanja',
  contract_sent: 'Pogodba',
  signed: 'Podpisano',
  royalties: 'Royalties',
  completed: 'Zaključeno',
};

const STATUS_COLORS: Record<DealStatus, { bg: string; text: string; dot: string }> = {
  new: { bg: '#E6F1FB', text: '#185FA5', dot: '#378ADD' },
  contacted: { bg: '#E1F5EE', text: '#0F6E56', dot: '#1D9E75' },
  negotiating: { bg: '#FAEEDA', text: '#854F0B', dot: '#EF9F27' },
  contract_sent: { bg: '#EEEDFE', text: '#3C3489', dot: '#7F77DD' },
  signed: { bg: '#EAF3DE', text: '#3B6D11', dot: '#639922' },
  royalties: { bg: '#FAECE7', text: '#993C1D', dot: '#D85A30' },
  completed: { bg: '#F1EFE8', text: '#5F5E5A', dot: '#888780' },
};

const daysSince = (dateStr?: string) => {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
};

const daysUntil = (dateStr?: string) => {
  if (!dateStr) return null;
  const diff = Math.floor((new Date(dateStr).getTime() - Date.now()) / 86400000);
  return diff;
};

const formatDate = (d?: string) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('sl-SI', { day: 'numeric', month: 'short', year: 'numeric' });
};

const s: Record<string, React.CSSProperties> = {
  wrap: { padding: '1.5rem 0', fontFamily: 'var(--font-sans)' },
  topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '8px' },
  title: { fontSize: '16px', fontWeight: 500, color: 'var(--color-text-primary)' },
  subtitle: { fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' },
  tabs: { display: 'flex', gap: '4px', background: 'var(--color-background-secondary)', borderRadius: '8px', padding: '3px' },
  tab: { fontSize: '12px', padding: '5px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: 'transparent', color: 'var(--color-text-secondary)', fontWeight: 500 },
  tabActive: { fontSize: '12px', padding: '5px 14px', borderRadius: '6px', border: '0.5px solid var(--color-border-tertiary)', cursor: 'pointer', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', fontWeight: 500 },
  cols: { display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px', alignItems: 'flex-start' },
  col: { minWidth: '200px', flex: 1 },
  colHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', padding: '0 2px' },
  colLabel: { fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-secondary)' },
  colCount: { fontSize: '11px', background: 'var(--color-background-secondary)', color: 'var(--color-text-secondary)', padding: '1px 7px', borderRadius: '20px', border: '0.5px solid var(--color-border-tertiary)' },
  card: { background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '12px', padding: '12px', marginBottom: '8px', cursor: 'pointer', transition: 'border-color 0.15s' },
  cardName: { fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)', lineHeight: 1.3 },
  cardShow: { fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' },
  cardMeta: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', flexWrap: 'wrap' as const },
  badge: { fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: 500, display: 'inline-block' },
  cardBtns: { display: 'flex', gap: '4px', marginTop: '10px', flexWrap: 'wrap' as const },
  btnSm: { fontSize: '11px', padding: '4px 10px', borderRadius: '6px', border: '0.5px solid var(--color-border-tertiary)', background: 'transparent', color: 'var(--color-text-secondary)', cursor: 'pointer' },
  btnPrimary: { fontSize: '11px', padding: '4px 10px', borderRadius: '6px', border: 'none', background: '#E6F1FB', color: '#185FA5', cursor: 'pointer', fontWeight: 500 },
  btnDanger: { fontSize: '11px', padding: '4px 10px', borderRadius: '6px', border: 'none', background: '#FCEBEB', color: '#A32D2D', cursor: 'pointer' },
  panel: { background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '12px', padding: '1.25rem', marginTop: '1rem' },
  panelTitle: { fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '1rem' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1rem' },
  fieldLabel: { fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '3px' },
  fieldValue: { fontSize: '13px', color: 'var(--color-text-primary)', fontWeight: 500 },
  input: { width: '100%', fontSize: '12px', padding: '6px 8px', borderRadius: '6px', border: '0.5px solid var(--color-border-tertiary)', background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)', marginTop: '4px' },
  textarea: { width: '100%', fontSize: '12px', padding: '6px 8px', borderRadius: '6px', border: '0.5px solid var(--color-border-tertiary)', background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)', marginTop: '4px', minHeight: '70px', resize: 'vertical' as const },
  divider: { borderTop: '0.5px solid var(--color-border-tertiary)', margin: '1rem 0' },
  emptyCol: { border: '0.5px dashed var(--color-border-tertiary)', borderRadius: '12px', padding: '16px', textAlign: 'center' as const, fontSize: '12px', color: 'var(--color-text-tertiary)' },
  royaltyRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '8px', alignItems: 'center', padding: '10px 0', borderBottom: '0.5px solid var(--color-border-tertiary)', fontSize: '12px' },
  sectionLabel: { fontSize: '11px', fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.5px', color: 'var(--color-text-secondary)', marginBottom: '8px' },
  toast: { position: 'fixed' as const, bottom: '24px', right: '24px', background: '#639922', color: '#fff', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, zIndex: 9999 },
};

const DealsPipelinePage: React.FC<Props> = ({ user, onNavigate }) => {
  const [view, setView] = useState<'seller' | 'buyer'>('seller');
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [royaltyReports, setRoyaltyReports] = useState<RoyaltyReport[]>([]);

  // Sign modal state
  const [signForm, setSignForm] = useState({ signed_date: '', start_date: '', end_date: '', territory: '', royalty_pct: '', advance_amount: '', max_performances: '' });
  const [showSignForm, setShowSignForm] = useState(false);

  // Reply modal state
  const [replyText, setReplyText] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);

  // Royalty form state
  const [royaltyForm, setRoyaltyForm] = useState({ date: '', venue: '', tickets: '', ticket_price: '', notes: '' });
  const [showRoyaltyForm, setShowRoyaltyForm] = useState(false);

  useEffect(() => { loadDeals(); }, [user, view]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const loadDeals = async () => {
    setLoading(true);
    let query = supabase.from('inquiries').select('*').order('created_at', { ascending: false });
    if (view === 'seller') {
      query = query.eq('producer_id', user.id);
    } else {
      query = query.eq('recipient_id', user.id);
    }
    const { data } = await query;
    if (data) setDeals(data as Deal[]);

    // Load royalty reports
    const { data: reports } = await supabase
      .from('royalty_reports')
      .select('*')
      .order('date', { ascending: false });
    if (reports) setRoyaltyReports(reports as RoyaltyReport[]);

    setLoading(false);
  };

  const updateStatus = async (deal: Deal, newStatus: DealStatus) => {
    await supabase.from('inquiries').update({
      deal_status: newStatus,
      last_activity_at: new Date().toISOString(),
    }).eq('id', deal.id);
    setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, deal_status: newStatus, last_activity_at: new Date().toISOString() } : d));
    if (selectedDeal?.id === deal.id) setSelectedDeal(prev => prev ? { ...prev, deal_status: newStatus } : null);
    showToast(`Premaknjeno v: ${STATUS_LABELS[newStatus]}`);
  };

  const sendReply = async () => {
    if (!selectedDeal || !replyText.trim()) return;
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'deal_reply',
          to: selectedDeal.from_email,
          data: { from_name: selectedDeal.from_name, show_title: selectedDeal.show_title, message: replyText, producer_name: user.name },
        }),
      });
      await supabase.from('inquiries').update({ replied: true, deal_status: 'contacted', last_activity_at: new Date().toISOString() }).eq('id', selectedDeal.id);
      setDeals(prev => prev.map(d => d.id === selectedDeal.id ? { ...d, replied: true, deal_status: 'contacted' } : d));
      setSelectedDeal(prev => prev ? { ...prev, replied: true, deal_status: 'contacted' } : null);
      setReplyText('');
      setShowReplyForm(false);
      showToast('Email poslan!');
    } catch { showToast('Napaka pri pošiljanju.'); }
  };

  const markSigned = async () => {
    if (!selectedDeal) return;
    const updates = {
      deal_status: 'signed' as DealStatus,
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
    // Send confirmation emails
    try {
      await fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'deal_signed_producer', to: user.email, data: { show_title: selectedDeal.show_title, buyer: selectedDeal.from_name, territory: signForm.territory, signed_date: signForm.signed_date } }) });
      await fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'deal_signed_buyer', to: selectedDeal.from_email, data: { show_title: selectedDeal.show_title, producer: user.name, territory: signForm.territory, signed_date: signForm.signed_date } }) });
    } catch {}
    setDeals(prev => prev.map(d => d.id === selectedDeal.id ? { ...d, ...updates } : d));
    setSelectedDeal(prev => prev ? { ...prev, ...updates } : null);
    setShowSignForm(false);
    showToast('Pogodba označena kot podpisana!');
  };

  const saveNote = async (deal: Deal, note: string) => {
    await supabase.from('inquiries').update({ deal_notes: note }).eq('id', deal.id);
    setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, deal_notes: note } : d));
    if (selectedDeal?.id === deal.id) setSelectedDeal(prev => prev ? { ...prev, deal_notes: note } : null);
  };

  const addRoyaltyReport = async () => {
    if (!selectedDeal) return;
    const gross = Number(royaltyForm.tickets) * Number(royaltyForm.ticket_price);
    const royalty_amount = gross * (Number(selectedDeal.royalty_pct || 0) / 100);
    const { error } = await supabase.from('royalty_reports').insert({
      show_id: selectedDeal.show_id,
      show_title: selectedDeal.show_title,
      date: royaltyForm.date,
      venue: royaltyForm.venue,
      tickets: Number(royaltyForm.tickets),
      ticket_price: Number(royaltyForm.ticket_price),
      gross,
      royalty_amount,
      notes: royaltyForm.notes,
      buyer_id: user.id,
      buyer_name: user.name,
    });
    if (!error) {
      setRoyaltyForm({ date: '', venue: '', tickets: '', ticket_price: '', notes: '' });
      setShowRoyaltyForm(false);
      loadDeals();
      showToast('Report shranjen!');
    }
  };

  // Group deals by status
  const dealsByStatus = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = deals.filter(d => (d.deal_status || 'new') === status);
    return acc;
  }, {} as Record<DealStatus, Deal[]>);

  const getWarning = (deal: Deal): { type: 'red' | 'warn' | null; label: string } => {
    const days = daysSince(deal.last_activity_at || deal.created_at);
    const status = deal.deal_status || 'new';
    if (status === 'new' && days >= 14) return { type: 'red', label: `${days} dni brez odg.` };
    if (status === 'new' && days >= 7) return { type: 'warn', label: `${days} dni brez odg.` };
    if (status === 'contract_sent' && days >= 7) return { type: 'warn', label: `Čaka podpis ${days}d` };
    if (status === 'negotiating' && days >= 30) return { type: 'warn', label: '30 dni neakt.' };
    if (deal.contract_end_date) {
      const left = daysUntil(deal.contract_end_date);
      if (left !== null && left <= 30 && left > 0) return { type: 'warn', label: `Poteče čez ${left}d` };
    }
    return { type: null, label: '' };
  };

  const renderCard = (deal: Deal) => {
    const warn = getWarning(deal);
    const isSelected = selectedDeal?.id === deal.id;
    const status = deal.deal_status || 'new';
    const sc = STATUS_COLORS[status];
    return (
      <div
        key={deal.id}
        style={{ ...s.card, borderLeft: warn.type === 'red' ? '3px solid #E24B4A' : warn.type === 'warn' ? '3px solid #EF9F27' : undefined, boxShadow: isSelected ? '0 0 0 2px #378ADD' : undefined }}
        onClick={() => { setSelectedDeal(isSelected ? null : deal); setShowSignForm(false); setShowReplyForm(false); setShowRoyaltyForm(false); }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            <div style={s.cardName}>{deal.from_name}</div>
            <div style={s.cardShow}>{deal.show_title}</div>
          </div>
          {deal.territory && <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginLeft: '6px' }}>{deal.territory}</div>}
        </div>
        <div style={s.cardMeta}>
          <span style={{ ...s.badge, background: sc.bg, color: sc.text }}>{STATUS_LABELS[status]}</span>
          {warn.type && <span style={{ ...s.badge, background: warn.type === 'red' ? '#FCEBEB' : '#FAEEDA', color: warn.type === 'red' ? '#A32D2D' : '#854F0B' }}>{warn.label}</span>}
          <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', marginLeft: 'auto' }}>{formatDate(deal.created_at)}</span>
        </div>
        <div style={s.cardBtns} onClick={e => e.stopPropagation()}>
          {status === 'new' && <button style={s.btnPrimary} onClick={() => { setSelectedDeal(deal); setShowReplyForm(true); }}>Reply</button>}
          {status === 'new' && <button style={s.btnSm} onClick={() => updateStatus(deal, 'negotiating')}>Deal →</button>}
          {status === 'contacted' && <button style={s.btnSm} onClick={() => updateStatus(deal, 'negotiating')}>Pogajanja →</button>}
          {status === 'negotiating' && <button style={s.btnPrimary} onClick={() => updateStatus(deal, 'contract_sent')}>Pošlji pogodbo →</button>}
          {status === 'contract_sent' && <button style={s.btnPrimary} onClick={() => { setSelectedDeal(deal); setShowSignForm(true); }}>Označi podpisano ✓</button>}
          {status === 'signed' && <button style={s.btnPrimary} onClick={() => { setSelectedDeal(deal); setShowRoyaltyForm(true); }}>+ Report</button>}
        </div>
      </div>
    );
  };

  const reportsForDeal = selectedDeal ? royaltyReports.filter(r => r.show_id === selectedDeal.show_id) : [];

  return (
    <div style={s.wrap}>
      {toast && <div style={s.toast}>{toast}</div>}

      <div style={s.topBar}>
        <div>
          <div style={s.title}>Deal pipeline</div>
          <div style={s.subtitle}>{deals.length} aktivnih poslov</div>
        </div>
        <div style={s.tabs}>
          <button style={view === 'seller' ? s.tabActive : s.tab} onClick={() => { setView('seller'); setSelectedDeal(null); }}>Prodajalec</button>
          <button style={view === 'buyer' ? s.tabActive : s.tab} onClick={() => { setView('buyer'); setSelectedDeal(null); }}>Kupec</button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)', fontSize: '13px' }}>Nalagam...</div>
      ) : (
        <div style={s.cols}>
          {STATUS_ORDER.filter(st => st !== 'completed' || dealsByStatus['completed'].length > 0).map(status => (
            <div key={status} style={s.col}>
              <div style={s.colHead}>
                <span style={s.colLabel}>{STATUS_LABELS[status]}</span>
                <span style={s.colCount}>{dealsByStatus[status].length}</span>
              </div>
              {dealsByStatus[status].length === 0
                ? <div style={s.emptyCol}>Ni poslov</div>
                : dealsByStatus[status].map(renderCard)
              }
            </div>
          ))}
        </div>
      )}

      {/* DETAIL PANEL */}
      {selectedDeal && (
        <div style={s.panel}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={s.panelTitle}>{selectedDeal.from_name}</div>
            <button style={s.btnSm} onClick={() => { setSelectedDeal(null); setShowSignForm(false); setShowReplyForm(false); setShowRoyaltyForm(false); }}>✕</button>
          </div>

          <div style={s.grid2}>
            <div><span style={s.fieldLabel}>Predstava</span><span style={s.fieldValue}>{selectedDeal.show_title}</span></div>
            <div><span style={s.fieldLabel}>Email</span><span style={s.fieldValue}>{selectedDeal.from_email}</span></div>
            <div><span style={s.fieldLabel}>Ozemlje</span><span style={s.fieldValue}>{selectedDeal.territory || '—'}</span></div>
            <div><span style={s.fieldLabel}>Datum povpr.</span><span style={s.fieldValue}>{formatDate(selectedDeal.created_at)}</span></div>
            {selectedDeal.royalty_pct && <div><span style={s.fieldLabel}>Royalty</span><span style={s.fieldValue}>{selectedDeal.royalty_pct}%</span></div>}
            {selectedDeal.advance_amount && <div><span style={s.fieldLabel}>Advance</span><span style={s.fieldValue}>EUR {selectedDeal.advance_amount}</span></div>}
            {selectedDeal.contract_signed_date && <div><span style={s.fieldLabel}>Podpisano</span><span style={s.fieldValue}>{formatDate(selectedDeal.contract_signed_date)}</span></div>}
            {selectedDeal.contract_end_date && <div><span style={s.fieldLabel}>Poteče</span><span style={s.fieldValue}>{formatDate(selectedDeal.contract_end_date)}</span></div>}
          </div>

          {selectedDeal.message && (
            <div style={{ background: 'var(--color-background-secondary)', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
              {selectedDeal.message}
            </div>
          )}

          {/* Status premik */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {STATUS_ORDER.map(st => (
              <button
                key={st}
                style={{ ...s.btnSm, background: (selectedDeal.deal_status || 'new') === st ? STATUS_COLORS[st].bg : undefined, color: (selectedDeal.deal_status || 'new') === st ? STATUS_COLORS[st].text : undefined, fontWeight: (selectedDeal.deal_status || 'new') === st ? 500 : undefined }}
                onClick={() => updateStatus(selectedDeal, st)}
              >
                {STATUS_LABELS[st]}
              </button>
            ))}
          </div>

          <div style={s.divider} />

          {/* Notes */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={s.sectionLabel}>Notesi</div>
            <textarea
              style={s.textarea}
              defaultValue={selectedDeal.deal_notes || ''}
              placeholder="Dodaj opombe o tem poslu..."
              onBlur={e => saveNote(selectedDeal, e.target.value)}
            />
          </div>

          {/* Reply form */}
          {showReplyForm && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={s.sectionLabel}>Odgovor kupcu</div>
              <textarea
                style={s.textarea}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder={`Dear ${selectedDeal.from_name},\n\nHvala za vaše povpraševanje glede ${selectedDeal.show_title}...`}
              />
              <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                <button style={s.btnPrimary} onClick={sendReply}>Pošlji email</button>
                <button style={s.btnSm} onClick={() => setShowReplyForm(false)}>Prekliči</button>
              </div>
            </div>
          )}

          {/* Sign form */}
          {showSignForm && (
            <div style={{ border: '0.5px solid var(--color-border-tertiary)', borderRadius: '8px', padding: '12px', marginBottom: '1rem' }}>
              <div style={s.sectionLabel}>Označi pogodbo kot podpisano</div>
              <div style={s.grid2}>
                <div><label style={s.fieldLabel}>Datum podpisa</label><input type="date" style={s.input} value={signForm.signed_date} onChange={e => setSignForm(p => ({ ...p, signed_date: e.target.value }))} /></div>
                <div><label style={s.fieldLabel}>Začetek pogodbe</label><input type="date" style={s.input} value={signForm.start_date} onChange={e => setSignForm(p => ({ ...p, start_date: e.target.value }))} /></div>
                <div><label style={s.fieldLabel}>Konec pogodbe</label><input type="date" style={s.input} value={signForm.end_date} onChange={e => setSignForm(p => ({ ...p, end_date: e.target.value }))} /></div>
                <div><label style={s.fieldLabel}>Ozemlje</label><input type="text" style={s.input} placeholder="npr. Norveška" value={signForm.territory} onChange={e => setSignForm(p => ({ ...p, territory: e.target.value }))} /></div>
                <div><label style={s.fieldLabel}>Royalty %</label><input type="number" style={s.input} placeholder="12" value={signForm.royalty_pct} onChange={e => setSignForm(p => ({ ...p, royalty_pct: e.target.value }))} /></div>
                <div><label style={s.fieldLabel}>Advance (EUR)</label><input type="number" style={s.input} placeholder="2500" value={signForm.advance_amount} onChange={e => setSignForm(p => ({ ...p, advance_amount: e.target.value }))} /></div>
                <div><label style={s.fieldLabel}>Max izvedb</label><input type="number" style={s.input} placeholder="24" value={signForm.max_performances} onChange={e => setSignForm(p => ({ ...p, max_performances: e.target.value }))} /></div>
              </div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                <button style={s.btnPrimary} onClick={markSigned}>Potrdi podpis → Royalties</button>
                <button style={s.btnSm} onClick={() => setShowSignForm(false)}>Prekliči</button>
              </div>
            </div>
          )}

          {/* Royalty reports */}
          {(selectedDeal.deal_status === 'signed' || selectedDeal.deal_status === 'royalties') && (
            <div>
              <div style={s.divider} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={s.sectionLabel}>Royalty reports</div>
                <button style={s.btnPrimary} onClick={() => setShowRoyaltyForm(!showRoyaltyForm)}>+ Dodaj report</button>
              </div>

              {showRoyaltyForm && (
                <div style={{ border: '0.5px solid var(--color-border-tertiary)', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                  <div style={s.grid2}>
                    <div><label style={s.fieldLabel}>Datum izvedbe</label><input type="date" style={s.input} value={royaltyForm.date} onChange={e => setRoyaltyForm(p => ({ ...p, date: e.target.value }))} /></div>
                    <div><label style={s.fieldLabel}>Prizorišče</label><input type="text" style={s.input} placeholder="Teatro Roma" value={royaltyForm.venue} onChange={e => setRoyaltyForm(p => ({ ...p, venue: e.target.value }))} /></div>
                    <div><label style={s.fieldLabel}>Število vstopnic</label><input type="number" style={s.input} placeholder="350" value={royaltyForm.tickets} onChange={e => setRoyaltyForm(p => ({ ...p, tickets: e.target.value }))} /></div>
                    <div><label style={s.fieldLabel}>Cena vstopnice (EUR)</label><input type="number" style={s.input} placeholder="25" value={royaltyForm.ticket_price} onChange={e => setRoyaltyForm(p => ({ ...p, ticket_price: e.target.value }))} /></div>
                  </div>
                  {royaltyForm.tickets && royaltyForm.ticket_price && (
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '6px 0' }}>
                      Gross: EUR {(Number(royaltyForm.tickets) * Number(royaltyForm.ticket_price)).toLocaleString()} →
                      Royalty ({selectedDeal.royalty_pct || 0}%): EUR {(Number(royaltyForm.tickets) * Number(royaltyForm.ticket_price) * Number(selectedDeal.royalty_pct || 0) / 100).toLocaleString()}
                    </div>
                  )}
                  <textarea style={{ ...s.textarea, minHeight: '50px' }} placeholder="Opombe..." value={royaltyForm.notes} onChange={e => setRoyaltyForm(p => ({ ...p, notes: e.target.value }))} />
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                    <button style={s.btnPrimary} onClick={addRoyaltyReport}>Shrani report</button>
                    <button style={s.btnSm} onClick={() => setShowRoyaltyForm(false)}>Prekliči</button>
                  </div>
                </div>
              )}

              {reportsForDeal.length > 0 ? (
                <div>
                  <div style={{ ...s.royaltyRow, fontWeight: 500, color: 'var(--color-text-secondary)', fontSize: '11px' }}>
                    <span>Datum</span><span>Prizorišče</span><span>Vstopnice</span><span>Gross</span><span>Royalty</span>
                  </div>
                  {reportsForDeal.map(r => (
                    <div key={r.id} style={s.royaltyRow}>
                      <span>{formatDate(r.date)}</span>
                      <span>{r.venue}</span>
                      <span>{r.tickets}</span>
                      <span>EUR {Number(r.gross).toLocaleString()}</span>
                      <span style={{ fontWeight: 500, color: '#3B6D11' }}>EUR {Number(r.royalty_amount).toLocaleString()}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                    Skupaj royalty: EUR {reportsForDeal.reduce((sum, r) => sum + Number(r.royalty_amount), 0).toLocaleString()}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', textAlign: 'center', padding: '1rem' }}>Še ni reportov</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '0.5px solid var(--color-border-tertiary)' }}>
        <div style={s.sectionLabel}>Legenda</div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {STATUS_ORDER.map(st => (
            <div key={st} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: STATUS_COLORS[st].dot, flexShrink: 0 }} />
              {STATUS_LABELS[st]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DealsPipelinePage;
