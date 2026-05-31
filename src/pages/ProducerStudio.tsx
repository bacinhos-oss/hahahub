import React, { useState, useEffect } from 'react';
import { User, Show } from '../types';
import { supabase } from '../lib/supabase';

interface ProducerStudioProps {
  user: User;
  shows: Show[];
  initialTab?: StudioTab;
  hideHeader?: boolean;
  hideTabs?: boolean;
}

type StudioTab = 'dashboard' | 'royalty' | 'incoming' | 'contracts' | 'calculator' | 'contacts' | 'log';

const STORAGE_KEY = 'hahahub_studio_';

function load(key: string) {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY + key) || '[]'); } catch { return []; }
}
function save(key: string, data: any) {
  localStorage.setItem(STORAGE_KEY + key, JSON.stringify(data));
}

const ProducerStudio: React.FC<ProducerStudioProps> = ({ user, shows, initialTab, hideHeader = false, hideTabs = false }) => {
  const [tab, setTab] = useState<StudioTab>(initialTab || 'dashboard');

  const myShows = shows.filter((s: any) => s.user_id === user.id);

  // ROYALTY TRACKER STATE
  const [royaltyReports, setRoyaltyReports] = useState<any[]>([]);
  const [sellerReports, setSellerReports] = useState<any[]>([]);
  const [licensedShows, setLicensedShows] = useState<any[]>([]);
  const [newReport, setNewReport] = useState({ date: '', show: '', venue: '', tickets: '', price: '', royaltyPct: '', notes: '' });
  const [reportSaved, setReportSaved] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  // ANALYTICS STATE
  const [analyticsInquiries, setAnalyticsInquiries] = useState<any[]>([]);
  const [analyticsDeals, setAnalyticsDeals] = useState<any[]>([]);
  const [showViews, setShowViews] = useState<any[]>([]);

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
  const net = gross - royalty - totalCosts;

  // Load shows I have licensed (from deals where I am buyer)
  useEffect(() => {
    if (!user?.id) return;
    supabase.from('deals').select('show_title, royalty_pct, show_id').eq('buyer_email', (user as any).email)
      .then(({ data }) => { if (data) setLicensedShows(data); });
  }, [user]);

  // Load buyer reports (my own logged performances)
  const loadRoyaltyData = async () => {
    if (!user?.id) return;
    setReportLoading(true);
    
    // Buyer view - reports I logged
    const { data: buyerData } = await supabase
      .from('royalty_reports')
      .select('*')
      .eq('buyer_id', user.id)
      .order('date', { ascending: false });
    if (buyerData) setRoyaltyReports(buyerData);

    // Seller view - reports on my shows
    const myShowIds = myShows.map((s: any) => s.id).filter(Boolean);
    if (myShowIds.length > 0) {
      const { data: sellerData } = await supabase
        .from('royalty_reports')
        .select('*')
        .in('show_id', myShowIds)
        .order('date', { ascending: false });
      if (sellerData) setSellerReports(sellerData);
    }
    setReportLoading(false);
  };

  useEffect(() => {
    if (myShows.length > 0 || user?.id) loadRoyaltyData();
  }, [myShows]);

  // Load analytics data
  useEffect(() => {
    if (!user?.id) return;
    const myShowIds = shows.filter((s: any) => s.user_id === user.id).map((s: any) => s.id).filter(Boolean);
    // Inquiries na moje showe (TICKLED)
    supabase.from('inquiries').select('*').eq('producer_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setAnalyticsInquiries(data); });
    // Inquiries ki sem jih jaz poslal (TICKLER)
    supabase.from('inquiries').select('*').eq('recipient_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setAnalyticsDeals(data); });
    // Timestamped views
    if (myShowIds.length > 0) {
      supabase.from('show_views').select('show_id, created_at').in('show_id', myShowIds)
        .gte('created_at', new Date(Date.now() - 56 * 24 * 60 * 60 * 1000).toISOString()) // last 8 weeks
        .then(({ data }) => { if (data) setShowViews(data); });
    }
  }, [user?.id]);

  const inp = 'w-full bg-brand-black border-2 border-white/20 p-2 text-white font-bold outline-none focus:border-brand-yellow text-sm';
  const lbl = 'text-[9px] font-black uppercase tracking-widest text-white/40 italic mb-1 block';

  const tabs: { key: StudioTab; label: string; icon: string }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { key: 'royalty', label: 'Royalty Tracker', icon: 'receipt_long' },
    { key: 'incoming', label: 'Incoming Royalties', icon: 'savings' },
    { key: 'contracts', label: 'Contracts', icon: 'description' },
    { key: 'calculator', label: 'Calculator', icon: 'calculate' },
    { key: 'contacts', label: 'Contacts', icon: 'contacts' },
    { key: 'log', label: 'Show Log', icon: 'history' },
  ];

  return (
    <section className="space-y-6 text-white">
      {!hideHeader && (
      <div>
        <h2 className="text-4xl font-black uppercase italic">Producer <span className="text-brand-pink">Studio</span></h2>
        <p className="text-white/40 font-bold italic text-sm mt-1">ROAR exclusive · Your production command center</p>
        <p className="text-brand-yellow/60 text-[9px] font-black uppercase italic tracking-widest mt-2">Studio data is saved on this device only. Use the same browser to access your data.</p>
      </div>
      )}

      {/* STUDIO TABS */}
      {!hideTabs && <div className="flex gap-2 flex-wrap border-b-2 border-white/10 pb-4">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase italic transition-all border-2 ${tab === t.key ? 'bg-brand-pink text-white border-brand-pink' : 'border-white/20 text-white/40 hover:border-white hover:text-white'}`}>
            <span className="material-symbols-outlined text-sm">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>}

      {/* ── DASHBOARD ── */}
      {tab === 'dashboard' && (() => {
        // ── HELPERS ──
        const totalViews = myShows.reduce((s: number, sh: any) => s + (sh.viewsCount || 0), 0);
        const totalInq = analyticsInquiries.length;
        const conversion = totalViews > 0 ? Math.round((totalInq / totalViews) * 100) : 0;
        const activeDeals = analyticsInquiries.filter((i: any) => ['contacted','negotiating','contract_sent'].includes(i.deal_status || '')).length;
        const signedDeals = analyticsInquiries.filter((i: any) => ['signed','royalties','completed'].includes(i.deal_status || '')).length;
        const totalRoyaltiesEarned = sellerReports.reduce((s: number, r: any) => s + Number(r.royalty_amount || 0), 0);

        // ── WEEKLY VIEWS CHART (last 8 weeks) ──
        const now = new Date();
        const weeks = Array.from({ length: 8 }, (_, i) => {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - (7 * (7 - i)));
          weekStart.setHours(0, 0, 0, 0);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 7);
          const label = weekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
          const count = showViews.filter(v => {
            const d = new Date(v.created_at);
            return d >= weekStart && d < weekEnd;
          }).length;
          return { label, count };
        });
        const maxViews = Math.max(...weeks.map(w => w.count), 1);

        // ── MONTHLY INQUIRIES (last 6 months) ──
        const months = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
          const label = d.toLocaleDateString('en-GB', { month: 'short' });
          const count = analyticsInquiries.filter(inq => {
            const id = new Date(inq.created_at);
            return id.getMonth() === d.getMonth() && id.getFullYear() === d.getFullYear();
          }).length;
          return { label, count };
        });
        const maxInq = Math.max(...months.map(m => m.count), 1);

        // ── TOP TERRITORIES ──
        const terrCount: Record<string, number> = {};
        analyticsInquiries.forEach((i: any) => { if (i.territory) terrCount[i.territory] = (terrCount[i.territory] || 0) + 1; });
        const topTerritories = Object.entries(terrCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
        const maxTerrCount = topTerritories[0]?.[1] || 1;

        // ── PACKAGE SPLIT ──
        const fpCount = analyticsInquiries.filter((i: any) => i.package_type === 'full_punch').length;
        const scriptCount = analyticsInquiries.filter((i: any) => i.package_type !== 'full_punch').length;
        const fpPct = totalInq > 0 ? Math.round((fpCount / totalInq) * 100) : 0;

        return (
          <div className="space-y-6">

            {/* TOP KPI CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Total Views', value: totalViews.toLocaleString(), color: 'text-brand-yellow', sub: 'all time', icon: 'visibility' },
                { label: 'Tickles', value: totalInq.toString(), color: 'text-brand-pink', sub: 'inquiries received', icon: 'touch_app' },
                { label: 'Conversion', value: conversion + '%', color: 'text-brand-cyan', sub: 'views → inquiries', icon: 'trending_up' },
                { label: 'Royalties', value: '€' + totalRoyaltiesEarned.toLocaleString(), color: 'text-green-400', sub: 'earned to date', icon: 'payments' },
              ].map((s, i) => (
                <div key={i} className="border-4 border-white/10 p-4 hover:border-white/20 transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[8px] font-black uppercase italic text-white/30">{s.label}</p>
                    <span className="material-symbols-outlined text-sm text-white/15">{s.icon}</span>
                  </div>
                  <p className={"text-3xl font-black " + s.color}>{s.value}</p>
                  <p className="text-[8px] text-white/20 mt-1">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* CONVERSION FUNNEL */}
            <div className="border-4 border-white/10 p-5">
              <p className="text-[9px] font-black uppercase tracking-widest text-brand-cyan italic mb-4">Conversion Funnel</p>
              <div className="flex items-end gap-0">
                {[
                  { label: 'Views', value: totalViews, color: 'bg-brand-yellow', pct: 100 },
                  { label: 'Inquiries', value: totalInq, color: 'bg-brand-pink', pct: totalViews > 0 ? Math.round((totalInq / totalViews) * 100) : 0 },
                  { label: 'Active', value: activeDeals, color: 'bg-brand-cyan', pct: totalInq > 0 ? Math.round((activeDeals / totalInq) * 100) : 0 },
                  { label: 'Signed', value: signedDeals, color: 'bg-green-500', pct: totalInq > 0 ? Math.round((signedDeals / totalInq) * 100) : 0 },
                ].map((f, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <p className="text-sm font-black text-white">{f.value}</p>
                    <div className="w-full flex justify-center">
                      <div className={f.color + " transition-all"} style={{ width: '80%', height: Math.max(f.pct * 0.6, 4) + 'px', minHeight: '4px' }} />
                    </div>
                    <p className="text-[8px] font-black uppercase italic text-white/30">{f.label}</p>
                    {i > 0 && <p className="text-[8px] text-white/20">{f.pct}%</p>}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* WEEKLY VIEWS CHART */}
              <div className="border-4 border-white/10 p-5">
                <p className="text-[9px] font-black uppercase tracking-widest text-brand-yellow italic mb-4">
                  Weekly Views — Last 8 Weeks
                  {showViews.length === 0 && <span className="text-white/20 normal-case font-normal ml-2">(tracking starts now)</span>}
                </p>
                <div className="flex items-end gap-1.5 h-24">
                  {weeks.map((w, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <p className="text-[7px] text-white/30 font-black">{w.count > 0 ? w.count : ''}</p>
                      <div className="w-full bg-brand-yellow/20 relative" style={{ height: '60px' }}>
                        <div className="w-full bg-brand-yellow absolute bottom-0 transition-all"
                          style={{ height: Math.max((w.count / maxViews) * 60, w.count > 0 ? 3 : 0) + 'px' }} />
                      </div>
                      <p className="text-[6px] text-white/20 font-black text-center leading-tight">{w.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* MONTHLY INQUIRIES */}
              <div className="border-4 border-white/10 p-5">
                <p className="text-[9px] font-black uppercase tracking-widest text-brand-pink italic mb-4">Monthly Inquiries — Last 6 Months</p>
                <div className="flex items-end gap-1.5 h-24">
                  {months.map((m, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <p className="text-[7px] text-white/30 font-black">{m.count > 0 ? m.count : ''}</p>
                      <div className="w-full bg-brand-pink/20 relative" style={{ height: '60px' }}>
                        <div className="w-full bg-brand-pink absolute bottom-0 transition-all"
                          style={{ height: Math.max((m.count / maxInq) * 60, m.count > 0 ? 3 : 0) + 'px' }} />
                      </div>
                      <p className="text-[7px] text-white/30 font-black">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* TOP TERRITORIES */}
              <div className="border-4 border-white/10 p-5">
                <p className="text-[9px] font-black uppercase tracking-widest text-brand-cyan italic mb-4">Top Territories</p>
                {topTerritories.length === 0 ? (
                  <p className="text-white/20 text-xs italic">No territory data yet.</p>
                ) : (
                  <div className="space-y-2">
                    {topTerritories.map(([territory, count]) => (
                      <div key={territory} className="flex items-center gap-3">
                        <p className="text-xs font-black text-white w-24 flex-shrink-0 uppercase">{territory}</p>
                        <div className="flex-1 bg-white/5 h-5 relative">
                          <div className="bg-brand-cyan h-5 absolute left-0 top-0 transition-all"
                            style={{ width: Math.round((count / maxTerrCount) * 100) + '%' }} />
                          <p className="absolute right-2 top-0 h-5 flex items-center text-[8px] font-black text-black z-10"
                            style={{ color: (count / maxTerrCount) > 0.4 ? '#000' : 'rgba(255,255,255,0.5)' }}>{count}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PACKAGE SPLIT */}
              <div className="border-4 border-white/10 p-5">
                <p className="text-[9px] font-black uppercase tracking-widest text-brand-pink italic mb-4">Package Interest</p>
                {totalInq === 0 ? (
                  <p className="text-white/20 text-xs italic">No inquiries yet.</p>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[9px] font-black uppercase text-brand-pink">🥊 Full Punch</span>
                        <span className="text-[9px] font-black text-white">{fpCount} · {fpPct}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-4">
                        <div className="bg-brand-pink h-4 transition-all" style={{ width: fpPct + '%' }} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[9px] font-black uppercase text-brand-yellow">📄 Script Only</span>
                        <span className="text-[9px] font-black text-white">{scriptCount} · {100 - fpPct}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-4">
                        <div className="bg-brand-yellow h-4 transition-all" style={{ width: (100 - fpPct) + '%' }} />
                      </div>
                    </div>
                    <p className="text-[8px] text-white/20 italic">{totalInq} total inquiries</p>
                  </div>
                )}
              </div>
            </div>

            {/* PER SHOW */}
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30 italic mb-3">Per Show Breakdown</p>
              {myShows.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-4xl mb-2">📊</p>
                  <p className="text-white/20 font-black uppercase italic text-sm">No shows yet.</p>
                </div>
              ) : myShows.map((show: any) => {
                const showInq = analyticsInquiries.filter((i: any) => i.show_id === show.id);
                const showRep = sellerReports.filter((r: any) => r.show_id === show.id);
                const showViewsData = showViews.filter((v: any) => v.show_id === show.id);
                const royaltiesShow = showRep.reduce((s: number, r: any) => s + Number(r.royalty_amount || 0), 0);
                const audienceShow = showRep.reduce((s: number, r: any) => s + Number(r.tickets || 0), 0);
                const viewsShow = show.viewsCount || 0;
                const convShow = viewsShow > 0 ? Math.round((showInq.length / viewsShow) * 100) : 0;
                const signed = showInq.filter((i: any) => ['signed','royalties','completed'].includes(i.deal_status || '')).length;
                const active = showInq.filter((i: any) => ['contacted','negotiating','contract_sent'].includes(i.deal_status || '')).length;
                const territories = [...new Set(showInq.map((i: any) => i.territory).filter(Boolean))] as string[];
                return (
                  <div key={show.id} className="border-4 border-white/10 hover:border-white/20 transition-all mb-3">
                    <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        {show.imageUrl && <img src={show.imageUrl} className="w-8 h-12 object-cover" alt="" />}
                        <div>
                          <p className="font-black uppercase italic text-white">{show.title}</p>
                          <p className="text-white/30 text-[10px]">{show.genre} · {show.duration} min</p>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        {signed > 0 && <span className="text-[7px] font-black uppercase bg-green-500/20 text-green-400 px-2 py-0.5">{signed} SIGNED</span>}
                        {active > 0 && <span className="text-[7px] font-black uppercase bg-brand-yellow/20 text-brand-yellow px-2 py-0.5">{active} ACTIVE</span>}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-6 divide-x divide-white/10">
                      {[
                        { label: 'Views', value: viewsShow.toLocaleString(), color: 'text-brand-yellow' },
                        { label: 'Inquiries', value: showInq.length, color: 'text-brand-pink' },
                        { label: 'Conv.', value: convShow + '%', color: 'text-brand-cyan' },
                        { label: 'Perfs.', value: showRep.length, color: 'text-white' },
                        { label: 'Audience', value: audienceShow.toLocaleString(), color: 'text-white' },
                        { label: 'Royalties', value: '€' + royaltiesShow.toLocaleString(), color: 'text-brand-yellow' },
                      ].map((s, i) => (
                        <div key={i} className="p-3 text-center">
                          <p className="text-[7px] font-black uppercase italic text-white/25 mb-1">{s.label}</p>
                          <p className={"text-lg font-black " + s.color}>{s.value}</p>
                        </div>
                      ))}
                    </div>
                    {territories.length > 0 && (
                      <div className="px-5 py-2 border-t border-white/10 flex items-center gap-2 flex-wrap">
                        <p className="text-[8px] font-black uppercase italic text-white/20">From:</p>
                        {territories.map((t: string) => <span key={t} className="text-[8px] font-black uppercase border border-white/15 text-white/40 px-1.5 py-0.5">{t}</span>)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        );
      })()}

      {/* ── SCHEDULE ── */}
      {/* ── ROYALTY TRACKER ── */}
      {tab === 'royalty' && (
        <div className="space-y-6">
          <div className="border-l-4 border-brand-yellow pl-4">
            <p className="text-white font-black uppercase italic text-sm">Performance Log</p>
            <p className="text-white/50 text-sm italic mt-1">As a licensee, log every performance of a show you have licensed. Enter tickets sold and ticket price — royalty is calculated automatically and sent to the rights holder. This is your legal obligation under the licensing agreement.</p>
          </div>

          {/* ADD REPORT FORM */}
          <div className="border-4 border-brand-yellow/30 p-4 space-y-4">
            <p className="text-[9px] font-black uppercase italic text-brand-yellow tracking-widest">Log Performance</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div><label className={lbl}>Date</label><input type="date" value={newReport.date} onChange={e => setNewReport(p => ({...p, date: e.target.value}))} className={inp} /></div>
              <div><label className={lbl}>Show <span className="text-brand-cyan">(licensed)</span></label>
                <select value={newReport.show} onChange={e => {
                  const sel = licensedShows.find((s: any) => s.show_title === e.target.value);
                  setNewReport(p => ({...p, show: e.target.value, royaltyPct: sel?.royalty_pct || p.royaltyPct}));
                }} className={inp}>
                  <option value="">Select licensed show...</option>
                  {licensedShows.map((s: any, i: number) => <option key={i} value={s.show_title}>{s.show_title}</option>)}
                  {licensedShows.length === 0 && <option disabled value="">No licensed shows found. License a show first.</option>}
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

            <button onClick={async () => {
              if (!newReport.date || !newReport.show || !newReport.tickets) return;
              const royaltyAmount = Math.round(Number(newReport.tickets) * Number(newReport.price) * Number(newReport.royaltyPct) / 100);
              const gross = Math.round(Number(newReport.tickets) * Number(newReport.price));
              const show = myShows.find((s: any) => s.title === newReport.show);
              await supabase.from('royalty_reports').insert({
                show_id: show?.id,
                show_title: newReport.show,
                buyer_id: user.id,
                buyer_name: user.name,
                date: newReport.date,
                venue: newReport.venue,
                tickets: Number(newReport.tickets),
                ticket_price: Number(newReport.price),
                royalty_pct: Number(newReport.royaltyPct),
                royalty_amount: royaltyAmount,
                gross,
                notes: newReport.notes,
              });
              await loadRoyaltyData();
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
                  const showReports = sellerReports.filter((r: any) => r.show_id === show.id);
                  const totalRoyalty = showReports.reduce((s: number, r: any) => s + (r.royalty_amount || 0), 0);
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
                              <span className="text-white/40">{r.date ? new Date(r.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'} · {r.venue || '—'} · {r.buyer_name || 'Buyer'}</span>
                              <span className="text-brand-yellow font-black">€{(r.royalty_amount || 0).toLocaleString()}</span>
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
      {tab === 'calculator' && (() => {
        // Per performance calculations
        const revenuePerf = Number(calc.ticketPrice) * Number(calc.seats) * (Number(calc.occupancy) / 100);
        const royaltyPerf = revenuePerf * Number(calc.royaltyPct) / 100;
        const costsPerf = actors / Number(calc.performances || 1) + techs / Number(calc.performances || 1) + other / Number(calc.performances || 1);
        const fixedCosts = Number((calc as any).fixedCosts || 0);
        const netPerf = revenuePerf - royaltyPerf - (costsPerf);
        const breakEven = netPerf > 0 ? Math.ceil(fixedCosts / netPerf) : null;
        const totalNet = net - fixedCosts;

        // Scenarios (pessimistic 60%, realistic calc.occupancy, optimistic 100%)
        const scenario = (occ: number) => {
          const r = Number(calc.ticketPrice) * Number(calc.seats) * (occ / 100) * Number(calc.performances);
          const roy = r * Number(calc.royaltyPct) / 100;
          const c = actors + techs + other + fixedCosts;
          return r - roy - c;
        };

        // Break-even chart — performances 1 to max
        const maxPerf = Math.max(Number(calc.performances), breakEven ? breakEven + 5 : 20, 20);
        const chartPoints = Array.from({ length: Math.min(maxPerf, 30) }, (_, i) => {
          const p = i + 1;
          const r = Number(calc.ticketPrice) * Number(calc.seats) * (Number(calc.occupancy) / 100) * p;
          const roy = r * Number(calc.royaltyPct) / 100;
          const c = (Number(calc.actorFee) * Number(calc.actorCount) + Number(calc.techFee) * Number(calc.techCount) + Number(calc.otherFee) * Number(calc.otherCount)) * p + fixedCosts;
          return { p, net: r - roy - c };
        });
        const maxNet = Math.max(...chartPoints.map(p => Math.abs(p.net)), 1);

        return (
          <div className="space-y-5">
            <div className="border-l-4 border-brand-yellow pl-4">
              <p className="text-white font-black uppercase italic text-sm">Break-Even Calculator</p>
              <p className="text-white/40 text-xs italic mt-1">Enter your production parameters — see break-even point, profit scenarios, and per-performance net. Use before signing a licensing deal.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* REVENUE */}
              <div className="space-y-3 border-4 border-white/10 p-4">
                <p className="text-[9px] font-black uppercase italic text-brand-yellow tracking-widest">Revenue</p>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className={lbl}>Performances</label><input type="number" value={calc.performances} onChange={e => setCalc(p => ({...p, performances: e.target.value}))} className={inp} /></div>
                  <div><label className={lbl}>Ticket Price (€)</label><input type="number" value={calc.ticketPrice} onChange={e => setCalc(p => ({...p, ticketPrice: e.target.value}))} className={inp} /></div>
                  <div><label className={lbl}>Seats</label><input type="number" value={calc.seats} onChange={e => setCalc(p => ({...p, seats: e.target.value}))} className={inp} /></div>
                  <div><label className={lbl}>Occupancy (%)</label><input type="number" value={calc.occupancy} onChange={e => setCalc(p => ({...p, occupancy: e.target.value}))} className={inp} /></div>
                  <div className="col-span-2"><label className={lbl}>Royalty / Author Fee (%)</label><input type="number" value={calc.royaltyPct} onChange={e => setCalc(p => ({...p, royaltyPct: e.target.value}))} className={inp} /></div>
                </div>
              </div>

              {/* VARIABLE COSTS */}
              <div className="space-y-3 border-4 border-white/10 p-4">
                <p className="text-[9px] font-black uppercase italic text-brand-pink tracking-widest">Variable Costs (per perf.)</p>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className={lbl}>Actor Fee (€)</label><input type="number" value={calc.actorFee} onChange={e => setCalc(p => ({...p, actorFee: e.target.value}))} className={inp} /></div>
                  <div><label className={lbl}>No. of Actors</label><input type="number" value={calc.actorCount} onChange={e => setCalc(p => ({...p, actorCount: e.target.value}))} className={inp} /></div>
                  <div><label className={lbl}>Tech Fee (€)</label><input type="number" value={calc.techFee} onChange={e => setCalc(p => ({...p, techFee: e.target.value}))} className={inp} /></div>
                  <div><label className={lbl}>No. of Techs</label><input type="number" value={calc.techCount} onChange={e => setCalc(p => ({...p, techCount: e.target.value}))} className={inp} /></div>
                  <div><label className={lbl}>Other Staff (€)</label><input type="number" value={calc.otherFee} onChange={e => setCalc(p => ({...p, otherFee: e.target.value}))} className={inp} /></div>
                  <div><label className={lbl}>No. of Other</label><input type="number" value={calc.otherCount} onChange={e => setCalc(p => ({...p, otherCount: e.target.value}))} className={inp} /></div>
                </div>
              </div>

              {/* FIXED COSTS */}
              <div className="space-y-3 border-4 border-brand-cyan/20 p-4">
                <p className="text-[9px] font-black uppercase italic text-brand-cyan tracking-widest">Fixed Costs (one-time)</p>
                <p className="text-white/30 text-[9px] italic">Set, costumes, marketing, rights advance fee — paid once regardless of performances.</p>
                <div>
                  <label className={lbl}>Fixed Costs (€)</label>
                  <input type="number" value={(calc as any).fixedCosts || ''} placeholder="e.g. 15000"
                    onChange={e => setCalc(p => ({...p, fixedCosts: e.target.value} as any))} className={inp} />
                </div>
                {fixedCosts > 0 && breakEven && (
                  <div className="border-2 border-brand-cyan/30 p-3 bg-brand-cyan/5">
                    <p className="text-[8px] font-black uppercase italic text-brand-cyan mb-1">Break-Even Point</p>
                    <p className="text-2xl font-black text-brand-cyan">{breakEven} perfs</p>
                    <p className="text-[9px] text-white/30 italic">to cover fixed costs</p>
                  </div>
                )}
                {fixedCosts > 0 && !breakEven && (
                  <div className="border-2 border-red-500/30 p-3 bg-red-500/5">
                    <p className="text-[8px] font-black uppercase italic text-red-400 mb-1">⚠ Break-Even</p>
                    <p className="text-sm font-black text-red-400">Never — per-perf loss</p>
                  </div>
                )}
              </div>
            </div>

            {/* RESULTS */}
            <div className="border-4 border-brand-yellow p-4 grid grid-cols-2 md:grid-cols-6 gap-3">
              {[
                { label: 'Gross Revenue', value: '€' + Math.round(gross).toLocaleString(), color: 'text-white' },
                { label: 'Royalty / Author', value: '€' + Math.round(royalty).toLocaleString(), color: 'text-brand-yellow' },
                { label: 'Variable Costs', value: '€' + Math.round(totalCosts).toLocaleString(), color: 'text-brand-pink' },
                { label: 'Fixed Costs', value: '€' + Math.round(fixedCosts).toLocaleString(), color: 'text-brand-cyan' },
                { label: 'Net / Performance', value: '€' + Math.round(netPerf).toLocaleString(), color: netPerf >= 0 ? 'text-green-400' : 'text-red-400' },
                { label: 'Total Net', value: '€' + Math.round(totalNet).toLocaleString(), color: totalNet >= 0 ? 'text-green-400' : 'text-red-400' },
              ].map((s, i) => (
                <div key={i} className={"text-center p-2 " + (i === 5 ? (totalNet >= 0 ? 'bg-green-500/10' : 'bg-red-500/10') : '')}>
                  <p className="text-[7px] font-black uppercase italic text-white/30 mb-1">{s.label}</p>
                  <p className={"text-lg font-black " + s.color}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* SCENARIOS */}
            <div className="border-4 border-white/10 p-4">
              <p className="text-[9px] font-black uppercase italic text-white/30 tracking-widest mb-3">Scenarios — Total Net</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: '😬 Pessimistic', occ: 60, color: 'border-red-500/40 text-red-400' },
                  { label: '😐 Realistic', occ: Number(calc.occupancy), color: 'border-brand-yellow/40 text-brand-yellow' },
                  { label: '😄 Optimistic', occ: 100, color: 'border-green-500/40 text-green-400' },
                ].map(s => {
                  const v = scenario(s.occ);
                  return (
                    <div key={s.label} className={"border-4 p-4 text-center " + s.color.split(' ')[0]}>
                      <p className="text-[9px] font-black uppercase italic text-white/40 mb-1">{s.label}</p>
                      <p className="text-[9px] text-white/25 mb-2">{s.occ}% occupancy</p>
                      <p className={"text-2xl font-black " + s.color.split(' ')[1]}>€{Math.round(v).toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BREAK-EVEN CHART */}
            <div className="border-4 border-white/10 p-4">
              <p className="text-[9px] font-black uppercase italic text-white/30 tracking-widest mb-4">
                Cumulative Net by Performance
                {breakEven && <span className="text-brand-cyan ml-2">Break-even at perf #{breakEven}</span>}
              </p>
              <div className="relative h-32">
                {/* Zero line */}
                <div className="absolute w-full border-t border-white/20" style={{ top: '50%' }} />
                <div className="flex items-end gap-0.5 h-full">
                  {chartPoints.map((pt, i) => {
                    const isBreakEven = breakEven && pt.p === breakEven;
                    const pct = pt.net / maxNet;
                    const barH = Math.abs(pct) * 50;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center justify-center h-full relative group">
                        {pt.net >= 0 ? (
                          <div className="w-full flex flex-col justify-end" style={{ height: '50%' }}>
                            <div className={`w-full transition-all ${isBreakEven ? 'bg-brand-cyan' : 'bg-green-500/60'}`}
                              style={{ height: barH + '%' }} />
                          </div>
                        ) : (
                          <div className="w-full flex flex-col justify-start" style={{ height: '50%', marginTop: '50%' }}>
                            <div className="w-full bg-red-500/60 transition-all" style={{ height: barH + '%' }} />
                          </div>
                        )}
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-1 hidden group-hover:block bg-brand-black border border-white/20 px-2 py-1 text-[8px] font-black text-white whitespace-nowrap z-10">
                          P{pt.p}: €{Math.round(pt.net).toLocaleString()}
                        </div>
                        {(pt.p % 5 === 0 || pt.p === 1) && (
                          <p className="absolute bottom-0 text-[6px] text-white/20 font-black" style={{ bottom: '-14px' }}>{pt.p}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <p className="text-[8px] text-white/20 italic mt-5 text-center">Number of performances → hover for value</p>
            </div>

          </div>
        );
      })()}


      {/* ── CONTACTS ── */}
      {tab === 'contacts' && (
        <div className="space-y-6">
          <div className="border-l-4 border-brand-cyan pl-4">
            <p className="text-white font-black uppercase italic text-sm">Contacts</p>
            <p className="text-white/50 text-sm italic mt-1">Your private address book of producers, agents, and theatre directors. Add contacts you meet at festivals or through deals. Notes are private — only you can see them.</p>
          </div>
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
          <div className="border-l-4 border-white/30 pl-4">
            <p className="text-white font-black uppercase italic text-sm">Show Log</p>
            <p className="text-white/50 text-sm italic mt-1">A timeline of all activities across your shows — performances, contracts signed, royalties received. Your complete production history in one place.</p>
          </div>
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
