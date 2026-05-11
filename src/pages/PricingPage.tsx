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

const PricingPage: React.FC<PricingPageProps> = ({ onNavigate, onLogout, user, onPurchaseSuccess }) => {
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: string } | null>(null);
  const [foundingTaken, setFoundingTaken] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_paid', true);
      setFoundingTaken(count || 0);
    };
    load();
  }, []);

  const foundingLeft = foundingTaken !== null ? Math.max(0, FOUNDING_TOTAL - foundingTaken) : null;

  return (
    <div className="flex flex-col min-h-screen bg-brand-black">
      <PaymentModal
        isOpen={!!selectedPlan}
        planName={selectedPlan?.name || ''}
        price={selectedPlan?.price || ''}
        onClose={() => setSelectedPlan(null)}
        onSuccess={() => { onPurchaseSuccess(selectedPlan?.name || 'Annual Pass'); setSelectedPlan(null); }}
      />
      <Navigation activePage="landing" onNavigate={onNavigate} onLogout={onLogout} user={user} />

      <main className="pt-32 pb-20 px-4 md:px-12">
        <div className="max-w-7xl mx-auto space-y-24">

          {/* HEADER */}
          <section className="text-center space-y-4">
            <span className="bg-brand-cyan text-black px-4 py-1 text-xs font-black uppercase tracking-[0.4em] italic inline-block">Pricing</span>
            <h1 className="font-display text-white text-6xl md:text-[120px] uppercase italic leading-[0.85] tracking-tighter">
              Comedy<br/><span className="text-brand-pink">Travels.</span>
            </h1>
            <p className="text-white/40 font-bold italic text-lg max-w-xl mx-auto">
              No per-inquiry fees. No commissions. No agents. Ever.
            </p>
          </section>

          {/* FOUNDING PRODUCER BANNER */}
          {foundingLeft !== null && foundingLeft > 0 && (
            <section className="bg-brand-yellow border-8 border-black p-8 md:p-12 shadow-neo-magenta">
              <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <span className="bg-black text-brand-yellow px-3 py-1 text-xs font-black uppercase tracking-widest italic inline-block mb-3">
                    🏆 {foundingLeft} spots left
                  </span>
                  <h2 className="text-4xl md:text-6xl font-black uppercase italic text-black leading-[0.9]">
                    Founding<br/>Producer
                  </h2>
                  <p className="text-black/60 font-bold italic mt-3 text-sm max-w-md">
                    The first {FOUNDING_TOTAL} producers join free forever. No annual fee. No credit card. Upload at least one show and help shape The Laff Exchange.
                  </p>
                </div>
                <div className="flex-shrink-0 text-center">
                  <div className="text-7xl font-black text-black mb-1">€0</div>
                  <p className="text-black/50 font-black uppercase text-xs italic mb-6">Free Forever</p>
                  <div className="w-48 h-2 bg-black/20 mb-2">
                    <div className="h-2 bg-black transition-all" style={{ width: `${Math.min(100, ((foundingTaken || 0) / FOUNDING_TOTAL) * 100)}%` }}></div>
                  </div>
                  <p className="text-black/50 text-xs font-black uppercase italic mb-6">{foundingTaken || 0} / {FOUNDING_TOTAL} taken</p>
                  <button
                    onClick={() => onNavigate('login')}
                    className="bg-black text-brand-yellow px-10 py-4 font-black uppercase text-sm border-4 border-black hover:bg-brand-pink hover:text-white transition-all italic shadow-[4px_4px_0px_rgba(0,0,0,0.3)]"
                  >
                    Claim Your Spot →
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* 3 TIERS */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">

              {/* FREE */}
              <div className="bg-brand-surface border-4 border-white/30 p-6 md:p-8">
                <p className="text-white/40 text-xs font-black uppercase tracking-widest italic mb-2">Free</p>
                <h3 className="text-3xl font-black uppercase italic text-white mb-1">Explorer</h3>
                <div className="text-6xl font-black text-white/60 mb-1">€0</div>
                <p className="text-white/30 text-xs font-bold italic mb-8">forever</p>
                <ul className="space-y-4 mb-10">
                  {[
                    { f: 'Browse 3 shows', ok: false },
                    { f: 'Basic search', ok: false },
                    { f: 'No contact info', ok: false },
                    { f: 'No uploads', ok: false },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-bold text-white/40">
                      <span className="material-symbols-outlined text-white/20 text-base">remove</span>{item.f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => onNavigate('login')} className="w-full py-4 border-4 border-white/20 text-white/40 font-black uppercase text-sm italic hover:border-white hover:text-white transition-all">
                  Start Free
                </button>
              </div>

              {/* PRO */}
              <div className="bg-white border-8 border-black p-6 md:p-10 shadow-neo-magenta relative md:-mt-4">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-brand-pink text-white px-6 py-1 font-black uppercase text-xs italic border-4 border-black whitespace-nowrap">
                  Most Popular
                </div>
                <p className="text-gray-400 text-xs font-black uppercase tracking-widest italic mb-2">Pro</p>
                <h3 className="text-3xl font-black uppercase italic text-black mb-1">Comedy Passport</h3>
                <div className="text-6xl font-black text-brand-pink mb-1">€99</div>
                <p className="text-gray-400 text-xs font-bold italic mb-8">per year · ~€8/month</p>
                <ul className="space-y-4 mb-10">
                  {[
                    'Full catalog access',
                    'Unlimited show uploads',
                    'Direct contact with rights holders',
                    'Contract templates',
                    'Performance analytics',
                    'Priority support',
                    'The Dossier PDF download',
                  ].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-bold text-black">
                      <span className="material-symbols-outlined text-brand-pink text-base">check_circle</span>{f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => user ? setSelectedPlan({ name: 'Annual Pass', price: '€99' }) : onNavigate('login')}
                  className="w-full py-5 bg-black text-brand-yellow border-4 border-black font-black uppercase text-lg hover:bg-brand-pink hover:text-white transition-all italic"
                >
                  Set It Up Now →
                </button>
                <p className="text-gray-400 text-xs font-bold italic mt-3 text-center">Secure payment via PayPal</p>
              </div>

              {/* STUDIO */}
              <div className="bg-brand-surface border-4 border-brand-cyan p-6 md:p-8 shadow-neo-cyan">
                <p className="text-brand-cyan text-xs font-black uppercase tracking-widest italic mb-2">Studio</p>
                <h3 className="text-3xl font-black uppercase italic text-white mb-1">Production House</h3>
                <div className="text-6xl font-black text-brand-cyan mb-1">€299</div>
                <p className="text-white/30 text-xs font-bold italic mb-8">per year</p>
                <ul className="space-y-4 mb-10">
                  {[
                    'Everything in Pro',
                    'Verified badge ✓',
                    'Advanced analytics',
                    'Priority listing',
                    'Multi-user access',
                    'Dedicated support',
                    'White-label options',
                  ].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-bold text-white/70">
                      <span className="material-symbols-outlined text-brand-cyan text-base">check_circle</span>{f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => window.location.href = 'mailto:info@hahahub.art?subject=Studio Plan'}
                  className="w-full py-4 bg-brand-cyan text-black border-4 border-black font-black uppercase text-sm italic hover:bg-white transition-all"
                >
                  Contact Us →
                </button>
                <p className="text-white/20 text-xs font-bold italic mt-3 text-center">Coming soon — reserve your spot</p>
              </div>
            </div>
          </section>

          {/* COMPARISON TABLE */}
          <section>
            <h2 className="text-4xl md:text-6xl font-black uppercase italic text-white mb-10 tracking-tighter">
              What You <span className="text-brand-yellow">Get</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-4 border-white/20 text-sm">
                <thead>
                  <tr className="border-b-4 border-white/20">
                    <th className="text-left p-4 font-black uppercase italic text-white/40 text-xs tracking-widest">Feature</th>
                    <th className="p-4 font-black uppercase italic text-white/60 text-xs tracking-widest text-center">Explorer</th>
                    <th className="p-4 font-black uppercase italic text-brand-pink text-xs tracking-widest text-center bg-white/5">Comedy Passport</th>
                    <th className="p-4 font-black uppercase italic text-brand-cyan text-xs tracking-widest text-center">Production House</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { f: 'Browse shows', free: '3 only', pro: 'Unlimited', studio: 'Unlimited' },
                    { f: 'STEFUNNY search', free: 'Basic', pro: 'Full', studio: 'Full' },
                    { f: 'Show detail & dossier', free: '✗', pro: '✓', studio: '✓' },
                    { f: 'Contact rights holders', free: '✗', pro: '✓', studio: '✓' },
                    { f: 'Upload shows', free: '✗', pro: 'Unlimited', studio: 'Unlimited' },
                    { f: 'Contract templates', free: '✗', pro: '✓', studio: '✓' },
                    { f: 'The Dossier PDF', free: '✗', pro: '✓', studio: '✓' },
                    { f: 'Verified badge', free: '✗', pro: '✗', studio: '✓' },
                    { f: 'Priority listing', free: '✗', pro: '✗', studio: '✓' },
                    { f: 'Multi-user access', free: '✗', pro: '✗', studio: '✓' },
                  ].map((row, i) => (
                    <tr key={i} className={`border-b border-white/10 ${i % 2 === 0 ? 'bg-white/5' : ''}`}>
                      <td className="p-4 font-bold text-white/60 italic">{row.f}</td>
                      <td className="p-4 text-center font-black text-white/30">{row.free}</td>
                      <td className="p-4 text-center font-black text-white bg-white/5">{row.pro}</td>
                      <td className="p-4 text-center font-black text-brand-cyan">{row.studio}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* GUARANTEE */}
          <section className="border-8 border-white p-8 md:p-16 text-center shadow-neo-yellow">
            <span className="material-symbols-outlined text-brand-yellow text-6xl mb-6 block">verified_user</span>
            <h2 className="text-4xl md:text-6xl font-black uppercase italic text-white mb-4 tracking-tighter">
              No Commission.<br/><span className="text-brand-yellow">Ever.</span>
            </h2>
            <p className="text-white/40 font-bold italic text-lg max-w-2xl mx-auto">
              HahaHub charges a flat annual fee only. We never take a cut of your licensing deals. The deal is between you and the producer — we just make the introduction.
            </p>
          </section>

        </div>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default PricingPage;
