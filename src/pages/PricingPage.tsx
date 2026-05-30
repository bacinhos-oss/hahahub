import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import PaymentModal from '../components/PaymentModal';
import Footer from '../components/Footer';
import { Page, User } from '../types';
import { supabase } from '../lib/supabase';

interface PricingPageProps {
  onNavigate: (page: Page) => void;
  onLogout?: () => void;
  user?: User;
  onPurchaseSuccess: (planName: string) => void;
}

const FOUNDING_TOTAL = 30;

const Check = () => <span className="material-symbols-outlined text-base text-brand-cyan" style={{fontVariationSettings:"'FILL' 1"}}>check_circle</span>;
const Cross = () => <span className="material-symbols-outlined text-base text-white/20">remove</span>;

const PricingPage: React.FC<PricingPageProps> = ({ onNavigate, onLogout, user, onPurchaseSuccess }) => {
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: string } | null>(null);
  const [foundingTaken, setFoundingTaken] = useState<number>(0);

  useEffect(() => {
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_paid', true)
      .then(({ count }) => setFoundingTaken(count || 0));
  }, []);

  const foundingLeft = Math.max(0, FOUNDING_TOTAL - foundingTaken);

  return (
    <div className="flex flex-col min-h-screen bg-brand-black text-white">
      <PaymentModal
        isOpen={!!selectedPlan}
        planName={selectedPlan?.name || ''}
        price={selectedPlan?.price || ''}
        onClose={() => setSelectedPlan(null)}
        onSuccess={() => { onPurchaseSuccess(selectedPlan?.name || ''); setSelectedPlan(null); }}
      />
      <Navigation activePage="pricing" onNavigate={onNavigate} onLogout={onLogout} user={user} />

      <main className="pt-32 pb-24 px-4 md:px-12">
        <div className="max-w-6xl mx-auto space-y-20">

          {/* HEADER */}
          <section className="text-center space-y-6">
            <span className="bg-brand-cyan text-black px-4 py-1 text-xs font-black uppercase tracking-[0.4em] italic inline-block">Membership</span>
            <h1 className="text-6xl md:text-[100px] font-black uppercase italic leading-[0.85] tracking-tighter">
              Comedy<br/><span className="text-brand-pink">Travels.</span>
            </h1>
            <p className="text-white/40 font-bold italic text-lg max-w-xl mx-auto">
              No per-inquiry fees. No commissions. No agents. No middlemen.<br/>Just you, the show, and the deal.
            </p>
          </section>

          {/* FOUNDING BANNER */}
          {foundingLeft > 0 && (
            <section className="bg-brand-yellow border-8 border-black p-8 md:p-12 shadow-neo-magenta">
              <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <span className="bg-black text-brand-yellow px-3 py-1 text-xs font-black uppercase tracking-widest italic inline-block mb-3">
                    Only {foundingLeft} spots left
                  </span>
                  <h2 className="text-4xl md:text-5xl font-black uppercase italic text-black leading-[0.9]">
                    Founding<br/>Producer
                  </h2>
                  <p className="text-black/60 font-bold italic mt-3 text-sm max-w-md">
                    The first {FOUNDING_TOTAL} producers who believe comedy belongs everywhere. Upload at least one show. Shape the platform. Own a piece of the joke.
                  </p>
                </div>
                <div className="flex-shrink-0 text-center">
                  <div className="text-7xl font-black text-black mb-1">€0</div>
                  <p className="text-black/50 font-black uppercase text-xs italic mb-4">Free. Forever. No strings.</p>
                  <div className="w-48 h-3 bg-black/20 mb-2 border-2 border-black">
                    <div className="h-full bg-black transition-all" style={{ width: `${Math.min(100, (foundingTaken / FOUNDING_TOTAL) * 100)}%` }} />
                  </div>
                  <p className="text-black/50 text-xs font-black uppercase italic mb-6">{foundingTaken} / {FOUNDING_TOTAL} claimed</p>
                  <button onClick={() => onNavigate('login')} className="bg-black text-brand-yellow px-10 py-4 font-black uppercase text-sm border-4 border-black hover:bg-brand-pink hover:text-white transition-all italic">
                    Claim Your Spot →
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* 3 PLANS */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 items-stretch">

            {/* GIGL */}
            <div className="bg-brand-surface border-4 border-white/20 p-7 flex flex-col">
              <div className="mb-6">
                <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.4em] italic mb-2">The first laugh is free.</p>
                <h3 className="text-5xl font-black uppercase italic text-white mb-3">GIGL</h3>
                <div className="text-5xl font-black text-white/40 mb-1">€0</div>
                <p className="text-white/20 text-xs font-bold italic">forever</p>
              </div>
              <p className="text-white/40 text-sm italic mb-6 border-l-4 border-white/10 pl-3">
                You dip your toe in. One show. Five catalog pages. No credit card. No commitment. Just enough to see if the water's funny.
              </p>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  { t: '1 show upload', ok: true },
                  { t: 'Browse 5 catalog pages', ok: true },
                  { t: 'Send inquiries (3/month)', ok: true },
                  { t: 'Pipeline — deal management', ok: true },
                  { t: 'LaffWire feed', ok: true },
                  { t: 'Full dossier access', ok: false },
                  { t: 'Unlimited catalog browsing', ok: false },
                  { t: 'Unlimited show uploads', ok: false },
                ].map((f, i) => (
                  <li key={i} className={`flex items-center gap-3 text-sm font-bold ${f.ok ? 'text-white/70' : 'text-white/20'}`}>
                    {f.ok ? <Check /> : <Cross />}{f.t}
                  </li>
                ))}
              </ul>
              <button onClick={() => { sessionStorage.setItem('selectedPlan','gigl'); onNavigate('login'); }}
                className="w-full py-4 border-4 border-white/20 text-white/40 font-black uppercase text-sm italic hover:border-white hover:text-white transition-all">
                Start for Free
              </button>
            </div>

            {/* LAFF */}
            <div className="bg-white border-8 border-black p-7 flex flex-col shadow-neo-magenta md:-mt-4 md:mb-0 relative">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-brand-pink text-white px-6 py-1 font-black uppercase text-xs italic border-4 border-black whitespace-nowrap">
                Most Popular
              </div>
              <div className="mb-6">
                <p className="text-gray-400 text-[9px] font-black uppercase tracking-[0.4em] italic mb-2">You're serious. We can tell.</p>
                <h3 className="text-5xl font-black uppercase italic text-black mb-3">LAFF</h3>
                <div className="text-5xl font-black text-brand-pink mb-1">€99</div>
                <p className="text-gray-400 text-xs font-bold italic">per year · €8/month</p>
              </div>
              <p className="text-gray-500 text-sm italic mb-6 border-l-4 border-brand-pink pl-3">
                Five shows in the vault. The full catalog at your feet. Real conversations with real rights holders. No filters. No agents. Just deals.
              </p>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  { t: 'Upload up to 5 shows', ok: true },
                  { t: 'Full catalog — unlimited browsing', ok: true },
                  { t: 'Unlimited inquiries', ok: true },
                  { t: 'Full dossier — all sections', ok: true },
                  { t: 'Pipeline — complete deal management', ok: true },
                  { t: 'Royalty tracking', ok: true },
                  { t: 'LaffWire — post & read', ok: true },
                  { t: 'Priority listing in catalog', ok: false },
                  { t: 'FEATURED badge', ok: false },
                  { t: 'Unlimited show uploads', ok: false },
                ].map((f, i) => (
                  <li key={i} className={`flex items-center gap-3 text-sm font-bold ${f.ok ? 'text-black' : 'text-black/25'}`}>
                    <span className={`material-symbols-outlined text-base ${f.ok ? 'text-brand-pink' : 'text-black/20'}`} style={{fontVariationSettings:"'FILL' 1"}}>{f.ok ? 'check_circle' : 'remove'}</span>
                    {f.t}
                  </li>
                ))}
              </ul>
              <button onClick={() => user ? setSelectedPlan({ name: 'LAFF Annual', price: '€99' }) : onNavigate('login')}
                className="w-full py-5 bg-black text-brand-yellow border-4 border-black font-black uppercase text-lg hover:bg-brand-pink hover:text-white transition-all italic">
                Start Laffing →
              </button>
              <p className="text-gray-400 text-[9px] font-bold italic mt-3 text-center uppercase tracking-widest">Secure payment via Stripe</p>
            </div>

            {/* ROAR */}
            <div className="bg-brand-surface border-4 border-brand-pink p-7 flex flex-col shadow-[8px_8px_0px_rgba(255,2,102,0.4)]">
              <div className="mb-6">
                <p className="text-brand-pink text-[9px] font-black uppercase tracking-[0.4em] italic mb-2">No limits. No excuses.</p>
                <h3 className="text-5xl font-black uppercase italic text-white mb-3">ROAR</h3>
                <div className="text-5xl font-black text-brand-pink mb-1">€189</div>
                <p className="text-white/30 text-xs font-bold italic">per year · €16/month</p>
              </div>
              <p className="text-white/50 text-sm italic mb-6 border-l-4 border-brand-pink pl-3">
                Unlimited everything. You're not testing the water — you own the pool. FEATURED in catalog. Priority listing. Full command center. This is your stage.
              </p>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  { t: 'Unlimited show uploads', ok: true },
                  { t: 'Full catalog — unlimited browsing', ok: true },
                  { t: 'Unlimited inquiries', ok: true },
                  { t: 'Full dossier — all sections', ok: true },
                  { t: 'Pipeline — complete deal management', ok: true },
                  { t: 'Royalty tracking', ok: true },
                  { t: 'LaffWire — live real-time', ok: true },
                  { t: 'FEATURED badge in catalog', ok: true },
                  { t: 'Priority listing — always first', ok: true },
                  { t: 'VERIFIED badge on profile', ok: true },
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-white/80">
                    <Check />{f.t}
                  </li>
                ))}
              </ul>
              <button onClick={() => user ? setSelectedPlan({ name: 'ROAR Annual', price: '€189' }) : (sessionStorage.setItem('selectedPlan','roar'), onNavigate('login'))}
                className="w-full py-4 bg-brand-pink text-white border-4 border-black font-black uppercase text-sm italic hover:bg-white hover:text-black transition-all">
                Start Roaring →
              </button>
            </div>

          </section>

          {/* COMPARISON TABLE */}
          <section>
            <h2 className="text-4xl font-black uppercase italic text-white mb-8 tracking-tighter">
              The Full <span className="text-brand-yellow">Breakdown</span>
            </h2>
            <div className="overflow-x-auto border-4 border-white/20">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-4 border-white/20">
                    <th className="text-left p-4 font-black uppercase italic text-white/40 text-xs tracking-widest w-1/2">Feature</th>
                    <th className="p-4 font-black uppercase italic text-white/40 text-xs tracking-widest text-center">GIGL</th>
                    <th className="p-4 font-black uppercase italic text-brand-pink text-xs tracking-widest text-center bg-white/5">LAFF</th>
                    <th className="p-4 font-black uppercase italic text-brand-pink text-xs tracking-widest text-center">ROAR</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { f: 'Show uploads', gigl: '1 show', laff: '5 shows', roar: 'Unlimited' },
                    { f: 'Catalog browsing', gigl: '5 pages', laff: 'Unlimited', roar: 'Unlimited' },
                    { f: 'Full dossier access', gigl: '✗', laff: '✓', roar: '✓' },
                    { f: 'Send inquiries', gigl: '3/month', laff: 'Unlimited', roar: 'Unlimited' },
                    { f: 'Pipeline — deal management', gigl: '✓', laff: '✓', roar: '✓' },
                    { f: 'Royalty tracking', gigl: '✗', laff: '✓', roar: '✓' },
                    { f: 'LaffWire', gigl: 'Read only', laff: 'Post & read', roar: 'Live · Real-time' },
                    { f: 'FEATURED badge', gigl: '✗', laff: '✗', roar: '✓' },
                    { f: 'Priority catalog listing', gigl: '✗', laff: '✗', roar: '✓' },
                    { f: 'VERIFIED badge', gigl: '✗', laff: '✗', roar: '✓' },
                    { f: 'Commission on deals', gigl: '0%', laff: '0%', roar: '0%' },
                  ].map((row, i) => (
                    <tr key={i} className={`border-b border-white/10 ${i % 2 === 0 ? 'bg-white/3' : ''}`}>
                      <td className="p-4 font-bold text-white/60 italic">{row.f}</td>
                      <td className="p-4 text-center font-black text-white/30">{row.gigl}</td>
                      <td className="p-4 text-center font-black text-white bg-white/5">{row.laff}</td>
                      <td className="p-4 text-center font-black text-brand-pink">{row.roar}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* NO COMMISSION */}
          <section className="border-8 border-white p-8 md:p-16 text-center shadow-neo-yellow">
            <h2 className="text-4xl md:text-6xl font-black uppercase italic text-white mb-4 tracking-tighter">
              0% Commission.<br/><span className="text-brand-yellow">Always.</span>
            </h2>
            <p className="text-white/40 font-bold italic text-lg max-w-2xl mx-auto">
              We charge a flat annual fee. That's it. The deal you close is your deal. Every euro of your licensing fee stays yours. We're a marketplace, not a middleman with a hat.
            </p>
          </section>

          {/* FAQ TEASER */}
          <section className="text-center space-y-4">
            <p className="text-white/30 text-sm italic">Still not sure? Read our FAQ or drop us a line.</p>
            <button onClick={() => onNavigate('faq')} className="border-4 border-white/20 text-white/40 px-8 py-3 font-black uppercase text-sm italic hover:border-white hover:text-white transition-all">
              Read the FAQ →
            </button>
          </section>

        </div>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default PricingPage;
