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
  const [foundingTaken, setFoundingTaken] = useState<number>(0);

  useEffect(() => {
    const load = async () => {
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_paid', true);
      setFoundingTaken(count || 0);
    };
    load();
  }, []);

  const foundingLeft = Math.max(0, FOUNDING_TOTAL - foundingTaken);

  return (
    <div className="flex flex-col min-h-screen bg-brand-black">
      <PaymentModal
        isOpen={!!selectedPlan}
        planName={selectedPlan?.name || ''}
        price={selectedPlan?.price || ''}
        onClose={() => setSelectedPlan(null)}
        onSuccess={() => { onPurchaseSuccess(selectedPlan?.name || ''); setSelectedPlan(null); }}
      />
      <Navigation activePage="landing" onNavigate={onNavigate} onLogout={onLogout} user={user} />

      <main className="pt-32 pb-20 px-4 md:px-12">
        <div className="max-w-7xl mx-auto space-y-24">

          {/* HEADER */}
          <section className="text-center space-y-4">
            <span className="bg-brand-cyan text-black px-4 py-1 text-xs font-black uppercase tracking-[0.4em] italic inline-block">Pricing</span>
            <h1 className="text-white text-6xl md:text-[120px] font-black uppercase italic leading-[0.85] tracking-tighter">
              Comedy<br/><span className="text-brand-pink">Travels.</span>
            </h1>
            <p className="text-white/40 font-bold italic text-lg max-w-xl mx-auto">No per-inquiry fees. No commissions. No agents. Ever.</p>
          </section>

          {/* FOUNDING BANNER */}
          {foundingLeft > 0 && (
            <section className="bg-brand-yellow border-8 border-black p-8 md:p-12 shadow-neo-magenta">
              <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <span className="bg-black text-brand-yellow px-3 py-1 text-xs font-black uppercase tracking-widest italic inline-block mb-3">
                    {foundingLeft} spots left
                  </span>
                  <h2 className="text-4xl md:text-6xl font-black uppercase italic text-black leading-[0.9]">Founding<br/>Producer</h2>
                  <p className="text-black/60 font-bold italic mt-3 text-sm max-w-md">The first {FOUNDING_TOTAL} producers join free forever. Upload at least one show and help shape The Laff Exchange.</p>
                </div>
                <div className="flex-shrink-0 text-center">
                  <div className="text-7xl font-black text-black mb-1">€0</div>
                  <p className="text-black/50 font-black uppercase text-xs italic mb-4">Free Forever</p>
                  <div className="w-48 h-2 bg-black/20 mb-2">
                    <div className="h-2 bg-black" style={{ width: `${Math.min(100, (foundingTaken / FOUNDING_TOTAL) * 100)}%` }}></div>
                  </div>
                  <p className="text-black/50 text-xs font-black uppercase italic mb-6">{foundingTaken} / {FOUNDING_TOTAL} taken</p>
                  <button onClick={() => onNavigate('login')} className="bg-black text-brand-yellow px-10 py-4 font-black uppercase text-sm border-4 border-black hover:bg-brand-pink hover:text-white transition-all italic">
                    Claim Your Spot →
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* 3 PLANS */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">

              {/* GIGL - Free */}
              <div className="bg-brand-surface border-4 border-white/20 p-6 md:p-8">
                <p className="text-white/40 text-xs font-black uppercase tracking-widest italic mb-1">Free</p>
                <h3 className="text-4xl font-black uppercase italic text-white mb-1">GIGL</h3>
                <div className="text-6xl font-black text-white/40 mb-1">€0</div>
                <p className="text-white/20 text-xs font-bold italic mb-8">forever</p>
                <ul className="space-y-3 mb-10">
                  {[
                    '3 shows preview',
                    'Basic catalog browse',
                    '3 Laff Wire posts',
                    'No contact access',
                    'No uploads',
                  ].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-bold text-white/30">
                      <span className="material-symbols-outlined text-white/20 text-base">remove</span>{f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => onNavigate('login')} className="w-full py-4 border-4 border-white/20 text-white/40 font-black uppercase text-sm italic hover:border-white hover:text-white transition-all">
                  Start Free
                </button>
              </div>

              {/* LAFF - Pro */}
              <div className="bg-white border-8 border-black p-6 md:p-10 shadow-neo-magenta relative md:-mt-4">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-brand-pink text-white px-6 py-1 font-black uppercase text-xs italic border-4 border-black whitespace-nowrap">
                  Most Popular
                </div>
                <p className="text-gray-400 text-xs font-black uppercase tracking-widest italic mb-1">Pro</p>
                <h3 className="text-4xl font-black uppercase italic text-black mb-1">LAFF</h3>
                <div className="text-6xl font-black text-brand-pink mb-1">€99</div>
                <p className="text-gray-400 text-xs font-bold italic mb-8">per year · ~€8/month</p>
                <ul className="space-y-3 mb-10">
                  {[
                    'Full catalog access',
                    'Unlimited show uploads',
                    'Direct contact with rights holders',
                    'Contract templates',
                    'The Dossier PDF download',
                    'Laff Wire — 7 days feed',
                    'Post to Laff Wire',
                    'Performance analytics',
                  ].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-bold text-black">
                      <span className="material-symbols-outlined text-brand-pink text-base">check_circle</span>{f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => user ? setSelectedPlan({ name: 'LAFF Annual', price: '€99' }) : onNavigate('login')}
                  className="w-full py-5 bg-black text-brand-yellow border-4 border-black font-black uppercase text-lg hover:bg-brand-pink hover:text-white transition-all italic"
                >
                  Start Laffing →
                </button>
                <p className="text-gray-400 text-xs font-bold italic mt-3 text-center">Secure payment via Stripe</p>
              </div>

              {/* ROAR - Studio */}
              <div className="bg-brand-surface border-4 border-brand-cyan p-6 md:p-8 shadow-neo-cyan">
                <p className="text-brand-cyan text-xs font-black uppercase tracking-widest italic mb-1">Studio</p>
                <h3 className="text-4xl font-black uppercase italic text-white mb-1">ROAR</h3>
                <div className="text-6xl font-black text-brand-cyan mb-1">€189</div>
                <p className="text-white/30 text-xs font-bold italic mb-8">per year · ~€16/month</p>
                <ul className="space-y-3 mb-10">
                  {[
                    'Everything in LAFF',
                    'VERIFIED badge',
                    'Priority listing in catalog',
                    'Public Producer Profile',
                    'The Laff Wire — live, real-time',
                    'Co-production feature',
                    'Multi-user (3 seats)',
                    'White-label Dossier',
                    'Show of the Month eligible',
                  ].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-bold text-white/70">
                      <span className="material-symbols-outlined text-brand-cyan text-base">check_circle</span>{f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => user ? setSelectedPlan({ name: 'ROAR Annual', price: '€189' }) : onNavigate('login')}
                  className="w-full py-4 bg-brand-cyan text-black border-4 border-black font-black uppercase text-sm italic hover:bg-white transition-all"
                >
                  Start Roaring →
                </button>
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
                    <th className="p-4 font-black uppercase italic text-white/40 text-xs tracking-widest text-center">GIGL</th>
                    <th className="p-4 font-black uppercase italic text-brand-pink text-xs tracking-widest text-center bg-white/5">LAFF</th>
                    <th className="p-4 font-black uppercase italic text-brand-cyan text-xs tracking-widest text-center">ROAR</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { f: 'Browse catalog', gigl: '3 shows', laff: 'Unlimited', roar: 'Unlimited + Priority' },
                    { f: 'Upload shows', gigl: '✗', laff: 'Unlimited', roar: 'Unlimited' },
                    { f: 'Contact rights holders', gigl: '✗', laff: '✓', roar: '✓' },
                    { f: 'The Dossier PDF', gigl: '✗', laff: '✓', roar: '✓' },
                    { f: 'Contract templates', gigl: '✗', laff: '✓', roar: '✓' },
                    { f: 'The Laff Wire', gigl: '3 posts only', laff: '7 days', roar: 'Live · Real-time' },
                    { f: 'Post to Laff Wire', gigl: '✗', laff: '✓', roar: '✓' },
                    { f: 'Producer Profile', gigl: '✗', laff: '✗', roar: '✓' },
                    { f: 'VERIFIED badge', gigl: '✗', laff: '✗', roar: '✓' },
                    { f: 'Priority listing', gigl: '✗', laff: '✗', roar: '✓' },
                    { f: 'Multi-user (3 seats)', gigl: '✗', laff: '✗', roar: '✓' },
                    { f: 'White-label Dossier', gigl: '✗', laff: '✗', roar: '✓' },
                  ].map((row, i) => (
                    <tr key={i} className={`border-b border-white/10 ${i % 2 === 0 ? 'bg-white/5' : ''}`}>
                      <td className="p-4 font-bold text-white/60 italic">{row.f}</td>
                      <td className="p-4 text-center font-black text-white/30">{row.gigl}</td>
                      <td className="p-4 text-center font-black text-white bg-white/5">{row.laff}</td>
                      <td className="p-4 text-center font-black text-brand-cyan">{row.roar}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* NO COMMISSION */}
          <section className="border-8 border-white p-8 md:p-16 text-center shadow-neo-yellow">
            <h2 className="text-4xl md:text-6xl font-black uppercase italic text-white mb-4 tracking-tighter">
              No Commission.<br/><span className="text-brand-yellow">Ever.</span>
            </h2>
            <p className="text-white/40 font-bold italic text-lg max-w-2xl mx-auto">
              Flat annual fee only. We never take a cut of your licensing deals. The deal is between you and the producer.
            </p>
          </section>

        </div>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default PricingPage;
