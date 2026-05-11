import React, { useState, useEffect, useRef } from 'react';
import Footer from '../components/Footer';
import { Page, Show } from '../types';
import PaymentModal from '../components/PaymentModal';
import { supabase } from '../lib/supabase';

interface LandingPageProps {
  onNavigate: (page: Page) => void;
  onPurchaseSuccess: (planName: string) => void;
  shows: Show[];
}

const FOUNDING_TOTAL = 30;

const FAQ_ITEMS = [
  { q: 'Who is HahaHub for?', a: 'Theater producers, venue programmers, festival directors, and co-production houses. Whether you want to license a show from another country or sell your own production internationally — HahaHub is your platform.' },
  { q: 'Can I list my own show?', a: 'Yes. Every Pro member can upload unlimited shows with full commercial data — cast size, royalty terms, territories, script scenario in English. Your show is visible to producers worldwide.' },
  { q: 'How does licensing work?', a: 'You find a show, click "Tickle It", and contact the rights holder directly. HahaHub provides the discovery platform and contract templates — the deal is between you and the producer. No commission.' },
  { q: 'Is HahaHub a rights agency?', a: 'No. We are a producer-to-producer marketplace. We do not represent any shows, take commissions, or act as an intermediary in licensing deals.' },
  { q: 'What is the Founding Producer offer?', a: 'The first 30 producers join free forever. No annual fee, ever. In return, upload at least one show with full data and give us feedback on the platform.' },
  { q: 'What payment methods do you accept?', a: 'We accept card payments via Stripe. Secure, no middlemen. All prices are in EUR.' },
  { q: 'Can I cancel or get a refund?', a: 'Subscriptions are annual and non-refundable. They do not auto-renew — you will be notified 30 days before expiry.' },
  { q: 'What languages are supported?', a: 'The platform is in English. Shows can be in any language — we require a 3-page script scenario in English for every listing.' },
];

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onPurchaseSuccess, shows }) => {
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: string } | null>(null);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [sliderIdx, setSliderIdx] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [foundingTaken, setFoundingTaken] = useState<number | null>(null);
  const sliderRef = useRef<NodeJS.Timeout | null>(null);

  const quotes = [
    { quote: "Laughter is the only currency that multiplies when shared.", author: "Chief of Laughter", org: "HahaHub" },
    { quote: "Comedy is not a genre. It's a survival strategy.", author: "Chief of Laughter", org: "HahaHub" },
    { quote: "Rights are serious. Comedy is not. We handle both.", author: "Chief of Laughter", org: "HahaHub" },
    { quote: "A show that makes you laugh once will be forgotten. One that makes you cry with laughter will run forever.", author: "Chief of Laughter", org: "HahaHub" },
    { quote: "The world has enough drama. We're here for the punchline.", author: "Chief of Laughter", org: "HahaHub" },
    { quote: "The human race has one really effective weapon, and that is laughter.", author: "Mark Twain", org: "1835–1910" },
    { quote: "Life does not cease to be funny when people die.", author: "George Bernard Shaw", org: "1856–1950" },
    { quote: "We are all in the gutter, but some of us are looking at the stars.", author: "Oscar Wilde", org: "1854–1900" },
  ];

  const sliderShows = shows.slice(0, 6);

  // Load real founding producer count from Supabase
  useEffect(() => {
    const loadFoundingCount = async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_paid', true);
      setFoundingTaken(count || 0);
    };
    loadFoundingCount();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setQuoteIdx(i => (i + 1) % quotes.length), 4500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (sliderShows.length === 0) return;
    sliderRef.current = setInterval(() => setSliderIdx(i => (i + 1) % sliderShows.length), 3000);
    return () => { if (sliderRef.current) clearInterval(sliderRef.current); };
  }, [sliderShows.length]);

  const foundingLeft = foundingTaken !== null ? Math.max(0, FOUNDING_TOTAL - foundingTaken) : null;
  const isFull = foundingLeft === 0;

  return (
    <div className="flex flex-col w-full relative bg-brand-black overflow-x-hidden">
      <PaymentModal
        isOpen={!!selectedPlan}
        planName={selectedPlan?.name || ''}
        price={selectedPlan?.price || ''}
        onClose={() => setSelectedPlan(null)}
        onSuccess={() => { onPurchaseSuccess(selectedPlan?.name || 'Annual Pass'); setSelectedPlan(null); }}
      />

      {/* NAV */}
      <header className="fixed top-0 z-50 w-full bg-brand-black/95 backdrop-blur-md px-4 md:px-12 py-4 border-b-4 border-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div onClick={() => onNavigate('landing')} className="logo-text text-white text-3xl md:text-5xl uppercase tracking-tighter cursor-pointer">HahaHub</div>
          <div className="flex items-center gap-3 md:gap-4">
            <button onClick={() => onNavigate('login')} className="text-xs font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors italic hidden md:block">Sign In</button>
            <button onClick={() => onNavigate('login')} className="bg-brand-yellow text-black font-black px-5 md:px-8 py-3 text-xs md:text-sm uppercase border-4 border-black hover:bg-white transition-all shadow-neo-magenta italic">
              Set Up Your Show →
            </button>
          </div>
        </div>
      </header>

      <main className="pt-24 md:pt-32">

        {/* HERO */}
        <section className="px-4 md:px-12 py-16 md:py-32 max-w-7xl mx-auto">
          <div className="max-w-5xl">
            <span className="bg-brand-pink text-white px-4 py-1 text-xs font-black uppercase tracking-[0.4em] inline-block italic mb-6 md:mb-8">The Comedy Rights Marketplace</span>
            <h1 className="font-display text-white text-6xl sm:text-8xl md:text-[130px] leading-[0.85] tracking-tighter uppercase mb-4 md:mb-6 italic">
              TICKLE.<br/>
              <span className="text-brand-yellow">SET UP.</span><br/>
              <span className="text-brand-pink">PUNCH.</span>
            </h1>
            <p className="text-lg md:text-2xl font-black uppercase italic text-white/60 tracking-widest mb-6 md:mb-8">
              International Comedy Theatre Producers Platform
            </p>
            <p className="text-base md:text-lg font-bold text-white/40 italic max-w-2xl mb-10 md:mb-12 leading-relaxed">
              Your hit in Spain is unknown in Germany. HahaHub changes that. The first producer-to-producer comedy rights marketplace. Buy rights, sell rights. Direct. No agents. No middlemen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => onNavigate('login')} className="bg-brand-yellow text-black px-8 md:px-12 py-5 md:py-6 text-lg md:text-xl font-black uppercase border-4 border-black shadow-neo-white hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all italic">
                🥊 Tickle It Now →
              </button>
              <button onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })} className="text-white border-b-4 border-white/30 pb-1 text-lg md:text-xl font-black uppercase hover:border-brand-cyan hover:text-brand-cyan transition-all italic self-start sm:self-auto">
                How it works ↓
              </button>
            </div>
          </div>
        </section>

        {/* SLIDER — top shows autoplay */}
        {sliderShows.length > 0 && (
          <section className="py-16 md:py-24 border-b-4 border-white/10 overflow-hidden">
            <div className="px-4 md:px-12 max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-end gap-4">
              <div>
                <span className="text-brand-cyan text-xs font-black uppercase tracking-[0.5em] italic">Latest Deployments</span>
                <h2 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter text-white leading-[0.9] mt-2">
                  IN THE <span className="text-brand-pink">VAULT</span>
                </h2>
              </div>
              <button onClick={() => onNavigate('login')} className="text-white font-black uppercase border-b-4 border-brand-yellow pb-1 italic hover:text-brand-yellow transition-all text-sm">
                View Full Catalog →
              </button>
            </div>
            <div className="relative">
              <div className="flex gap-4 px-4 md:px-12 overflow-x-auto snap-x snap-mandatory pb-4" style={{ scrollbarWidth: 'none' }}>
                {sliderShows.map((show, i) => (
                  <div
                    key={show.id}
                    onClick={() => onNavigate('login')}
                    className={`group relative flex-shrink-0 w-48 md:w-64 aspect-[2/3] cursor-pointer overflow-hidden border-4 transition-all duration-500 snap-start ${i === sliderIdx ? 'border-brand-yellow shadow-neo-yellow scale-105' : 'border-white/30 grayscale hover:grayscale-0'}`}
                  >
                    <img src={show.imageUrl} className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-all duration-700" alt={show.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-brand-pink text-white px-3 py-2 border-4 border-black font-black uppercase italic rotate-[-3deg] text-xs">Access Locked</div>
                    </div>
                    <div className="absolute bottom-0 left-0 p-3 w-full">
                      <p className="text-brand-cyan text-[9px] font-black uppercase tracking-widest italic mb-1">{show.genre}</p>
                      <h3 className="text-sm font-black uppercase italic leading-tight text-white line-clamp-2">{show.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-2 mt-6">
                {sliderShows.map((_, i) => (
                  <button key={i} onClick={() => setSliderIdx(i)} className={`h-1.5 transition-all ${i === sliderIdx ? 'w-8 bg-brand-yellow' : 'w-2 bg-white/20'}`} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* TICKLE. SET UP. PUNCH. */}
        <section className="px-4 md:px-12 py-16 md:py-24 border-b-4 border-white/10" id="how">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 md:mb-16">
              <h2 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter text-white leading-none">
                TICKLE.<br/><span className="text-brand-yellow">SET UP.</span><br/><span className="text-brand-pink">PUNCH.</span>
              </h2>
              <p className="text-white/40 font-bold italic text-lg mt-6 max-w-xl">Whether you're buying rights or selling them — same three moves.</p>
            </div>

            {/* BUY */}
            <div className="mb-10">
              <div className="flex items-center gap-4 mb-6">
                <span className="bg-brand-cyan text-black px-4 py-1 text-xs font-black uppercase tracking-widest italic">I want to stage a show</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { step: 'TICKLE', icon: 'search', color: 'brand-cyan', title: 'Tickle the Vault', desc: "Something's been rotting in your season lineup. Hunt it down. International. Raw. Funny as hell. The show your audience didn't know they needed.", cta: 'Tickle It →' },
                  { step: 'SET UP', icon: 'mail', color: 'brand-yellow', title: 'Cut the Middleman', desc: 'Direct line to the producer. Templates. Terms. Done. No commission. No bullshit. No mercy.', cta: 'Set It Up →' },
                  { step: 'PUNCH', icon: 'theater_comedy', color: 'brand-pink', title: 'Curtain Up', desc: "Lights on. They're already laughing. That's your show now. You found it here.", cta: 'Punch It →' },
                ].map((item, i) => (
                  <div key={i} className="border-4 border-white p-6 md:p-8 hover:shadow-neo-cyan hover:border-brand-cyan transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <span className={`text-xs font-black uppercase tracking-widest text-${item.color} italic`}>{item.step}</span>
                      <span className={`material-symbols-outlined text-3xl text-${item.color}`}>{item.icon}</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-black uppercase italic text-white mb-3 group-hover:text-brand-cyan transition-colors">{item.title}</h3>
                    <p className="text-gray-400 font-bold italic leading-relaxed text-sm mb-4">{item.desc}</p>
                    <button onClick={() => onNavigate('login')} className={`text-[10px] font-black uppercase italic text-${item.color} hover:underline`}>{item.cta}</button>
                  </div>
                ))}
              </div>
            </div>

            {/* SELL */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="bg-brand-pink text-white px-4 py-1 text-xs font-black uppercase tracking-widest italic">I want to sell my show internationally</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { step: 'TICKLE', icon: 'upload', color: 'brand-pink', title: 'Deploy Your Hit', desc: "Your show is killing it at home. Nobody abroad gives a damn. Yet. Drop it. Raw data. Full dossier. Go international or go home.", cta: 'Set Up Your Show →' },
                  { step: 'SET UP', icon: 'notifications', color: 'brand-yellow', title: "You've Been Tickled 📩", desc: "Someone wants your show. Negotiate direct. Keep every cent. No agent taking their 15% cut of your sweat.", cta: 'Set It Up →' },
                  { step: 'PUNCH', icon: 'handshake', color: 'brand-cyan', title: 'New Stage. New Country.', desc: "Your punchline. Their stage. Different language. Same laugh. That's international. That's HahaHub. Play it.", cta: 'Punch It →' },
                ].map((item, i) => (
                  <div key={i} className="border-4 border-white/40 p-6 md:p-8 hover:shadow-neo-magenta hover:border-brand-pink transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <span className={`text-xs font-black uppercase tracking-widest text-${item.color} italic`}>{item.step}</span>
                      <span className={`material-symbols-outlined text-3xl text-${item.color}`}>{item.icon}</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-black uppercase italic text-white mb-3 group-hover:text-brand-pink transition-colors">{item.title}</h3>
                    <p className="text-gray-400 font-bold italic leading-relaxed text-sm mb-4">{item.desc}</p>
                    <button onClick={() => onNavigate('login')} className={`text-[10px] font-black uppercase italic text-${item.color} hover:underline`}>{item.cta}</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FOR WHO */}
        <section className="px-4 md:px-12 py-16 md:py-24 bg-brand-surface border-b-4 border-white/10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-7xl font-black uppercase italic text-white mb-8">Built for <span className="text-brand-yellow">Producers.</span></h2>
              <div className="space-y-5">
                {[
                  { icon: 'verified', text: 'Verified rights holders only — every listing is authenticated' },
                  { icon: 'description', text: 'Full commercial data — royalties, territories, box office history' },
                  { icon: 'translate', text: 'Translation rights included where available' },
                  { icon: 'support_agent', text: 'Direct contact with decision makers — no gatekeepers' },
                  { icon: 'picture_as_pdf', text: '3-page script scenario in English for every production' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-brand-cyan text-2xl flex-shrink-0 mt-0.5">{item.icon}</span>
                    <p className="text-white/70 font-bold italic text-base md:text-lg leading-tight">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-8 border-white p-6 md:p-8 bg-brand-black shadow-neo-yellow">
              <p className="text-brand-cyan text-xs font-black uppercase tracking-[0.4em] italic mb-6">Who it's for</p>
              <div className="space-y-4">
                {['Theater Producers', 'Venue Programmers', 'Festival Directors', 'Co-Production Houses', 'Rights Agents'].map((role, i) => (
                  <div key={i} className="flex items-center gap-4 border-b border-white/10 pb-4">
                    <span className="w-2 h-2 bg-brand-pink flex-shrink-0"></span>
                    <span className="font-black uppercase italic text-white text-base md:text-lg">{role}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FOUNDING PRODUCER — po For Who */}
        {!isFull && (
          <section className="px-4 md:px-12 py-12 md:py-20 bg-brand-yellow border-y-8 border-black">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <span className="bg-black text-brand-yellow px-4 py-1 text-xs font-black uppercase tracking-[0.4em] inline-block italic mb-4">Limited — {foundingLeft !== null ? foundingLeft : '...'} spots left</span>
                <h2 className="text-4xl md:text-6xl font-black uppercase italic text-black leading-[0.9] mb-4">
                  Founding<br/>Producer
                </h2>
                <p className="text-black/70 font-bold italic text-lg md:text-xl max-w-xl leading-relaxed">
                  The first {FOUNDING_TOTAL} producers join <strong className="text-black">free forever</strong>. No annual fee. No credit card. Upload at least one show with full data and help shape the platform.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {['Free Forever ✓', 'Founding Producer Badge ✓', 'Unlimited Uploads ✓', 'Shape the Product ✓'].map((b, i) => (
                    <span key={i} className="bg-black text-brand-yellow px-3 py-1 text-xs font-black uppercase italic border-2 border-black">{b}</span>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0 text-center w-full md:w-auto">
                <div className="bg-black border-8 border-black p-8 md:p-12 inline-block w-full md:w-auto">
                  <p className="text-brand-yellow text-[10px] font-black uppercase tracking-[0.4em] mb-2">Spots Remaining</p>
                  <div className="text-8xl md:text-9xl font-black text-white leading-none mb-2">
                    {foundingLeft !== null ? foundingLeft : '—'}
                  </div>
                  <p className="text-white/40 text-xs font-black uppercase tracking-widest">of {FOUNDING_TOTAL} total</p>
                  <div className="mt-6 h-3 bg-white/10 border-2 border-white/20 w-full md:w-48 mx-auto">
                    <div
                      className="h-full bg-brand-yellow transition-all duration-1000"
                      style={{ width: foundingTaken !== null ? `${Math.min(100, (foundingTaken / FOUNDING_TOTAL) * 100)}%` : '0%' }}
                    ></div>
                  </div>
                  <p className="text-white/30 text-[9px] font-black uppercase mt-2">
                    {foundingTaken !== null ? foundingTaken : '...'} taken
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('login')}
                  className="mt-6 w-full bg-black text-brand-yellow font-black px-10 py-5 text-lg uppercase border-4 border-black hover:bg-white hover:text-black transition-all italic shadow-[6px_6px_0px_#FF00FF]"
                >
                  Claim Your Spot →
                </button>
              </div>
            </div>
          </section>
        )}

        {/* QUOTES — fiksna višina */}
        <section className="px-4 md:px-12 py-12 md:py-16 border-b-4 border-white/10 bg-brand-surface">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-16">
              <div className="flex gap-2 flex-shrink-0">
                {quotes.map((_, i) => (
                  <button key={i} onClick={() => setQuoteIdx(i)} className={"h-1.5 transition-all " + (i === quoteIdx ? "w-8 bg-brand-yellow" : "w-2 bg-white/20")} />
                ))}
              </div>
              <div className="border-l-4 border-brand-yellow pl-6 h-28 md:h-24 flex flex-col justify-center overflow-hidden">
                <p className="text-white/80 font-bold italic text-lg md:text-2xl leading-snug mb-3 line-clamp-3">"{quotes[quoteIdx].quote}"</p>
                <p className="text-xs font-black uppercase tracking-widest text-brand-yellow">— {quotes[quoteIdx].author}</p>
                <p className="text-white/20 text-[9px] font-bold uppercase tracking-widest mt-1">{quotes[quoteIdx].org}</p>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING — 3 tieri */}
        <section className="px-4 md:px-12 py-16 md:py-32" id="pricing">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <span className="bg-brand-cyan text-black px-4 py-1 text-xs font-black uppercase tracking-[0.4em] italic mb-6 inline-block">Pricing</span>
              <h2 className="font-display text-white text-5xl md:text-8xl uppercase italic">Comedy <span className="text-brand-pink">Travels.</span></h2>
              <p className="text-white/40 font-bold italic text-lg mt-4 max-w-xl mx-auto">Pick your passport. No per-inquiry fees. No commissions. Ever.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
              {/* FREE */}
              <div className="bg-brand-surface border-4 border-white/30 p-6 md:p-8">
                <p className="text-white/40 text-xs font-black uppercase tracking-widest italic mb-2">Free</p>
                <h3 className="text-2xl font-black uppercase italic text-white mb-1">Explorer</h3>
                <div className="text-5xl font-black text-white/60 mb-1">€0</div>
                <p className="text-white/30 text-xs font-bold italic mb-8">forever</p>
                <ul className="space-y-3 mb-8">
                  {['Browse 3 shows', 'Basic search', 'No contact info', 'No uploads'].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-bold text-white/40">
                      <span className="material-symbols-outlined text-white/20 text-base">remove</span>{f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => onNavigate('login')} className="w-full py-4 border-4 border-white/20 text-white/40 font-black uppercase text-sm italic hover:border-white hover:text-white transition-all">
                  Start Free
                </button>
              </div>
              {/* PRO */}
              <div className="bg-white border-8 border-black p-6 md:p-10 shadow-neo-magenta relative md:-mt-4">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-brand-pink text-white px-6 py-1 font-black uppercase text-xs italic border-4 border-black whitespace-nowrap">Most Popular</div>
                <p className="text-gray-400 text-xs font-black uppercase tracking-widest italic mb-2">Pro</p>
                <h3 className="text-2xl font-black uppercase italic text-black mb-1">Comedy Passport</h3>
                <div className="text-5xl font-black text-brand-pink mb-1">€99</div>
                <p className="text-gray-400 text-xs font-bold italic mb-8">per year · ~€8/month</p>
                <ul className="space-y-3 mb-8">
                  {['Full catalog access', 'Unlimited show uploads', 'Direct contact with rights holders', 'Contract templates', 'Performance analytics', 'Priority support'].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-bold text-black">
                      <span className="material-symbols-outlined text-brand-pink text-base">check_circle</span>{f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => onNavigate('login')} className="w-full py-5 bg-black text-brand-yellow border-4 border-black font-black uppercase text-lg hover:bg-brand-pink hover:text-white transition-all italic">
                  Set It Up Now →
                </button>
                <p className="text-gray-400 text-xs font-bold italic mt-3 text-center">Secure payment via Stripe</p>
              </div>
              {/* STUDIO */}
              <div className="bg-brand-surface border-4 border-brand-cyan p-6 md:p-8 shadow-neo-cyan">
                <p className="text-brand-cyan text-xs font-black uppercase tracking-widest italic mb-2">Studio</p>
                <h3 className="text-2xl font-black uppercase italic text-white mb-1">Production House</h3>
                <div className="text-5xl font-black text-brand-cyan mb-1">€299</div>
                <p className="text-white/30 text-xs font-bold italic mb-8">per year</p>
                <ul className="space-y-3 mb-8">
                  {['Everything in Pro', 'Verified badge ✓', 'Advanced analytics', 'Priority listing', 'Multi-user access', 'Dedicated support'].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-bold text-white/70">
                      <span className="material-symbols-outlined text-brand-cyan text-base">check_circle</span>{f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => window.location.href = 'mailto:info@hahahub.art?subject=Studio Plan'} className="w-full py-4 bg-brand-cyan text-black border-4 border-black font-black uppercase text-sm italic hover:bg-white transition-all">
                  Contact Us →
                </button>
                <p className="text-white/20 text-xs font-bold italic mt-3 text-center">Coming soon — reserve your spot</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 md:px-12 py-16 md:py-24 border-t-4 border-white/10 bg-brand-surface">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black uppercase italic text-white mb-3">FAQ</h2>
            <p className="text-white/30 font-bold italic text-lg mb-12">Everything you need to know.</p>
            <div className="space-y-3">
              {FAQ_ITEMS.map((item, i) => (
                <div key={i} className={"border-4 transition-all " + (openFaq === i ? "border-brand-yellow" : "border-white/20")}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left gap-4">
                    <span className="font-black uppercase italic text-white text-sm md:text-base">{item.q}</span>
                    <span className={`material-symbols-outlined text-2xl flex-shrink-0 transition-transform ${openFaq === i ? 'text-brand-yellow rotate-45' : 'text-white/40'}`}>add</span>
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 border-t-2 border-white/10 pt-4">
                      <p className="text-white/60 font-bold italic leading-relaxed text-sm">{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TERMS */}
        <section className="px-4 md:px-12 py-16 border-t-4 border-white/10">
          <div className="max-w-4xl mx-auto space-y-6 text-white/30 text-xs font-bold italic leading-relaxed">
            <h3 className="text-white/60 font-black uppercase text-sm tracking-widest not-italic">Terms of Use — Summary</h3>
            <p>HAHAHUB is a producer-to-producer platform for discovering and licensing international theatrical productions. By registering, you confirm you are a professional acting in a commercial capacity and are at least 18 years of age.</p>
            <p>Subscriptions are annual, non-refundable, and do not auto-renew. HAHAHUB is a discovery platform only — we are not party to any licensing agreements between users. Contract templates are provided for reference and do not constitute legal advice.</p>
            <p>All content uploaded by users remains the property of the respective rights holders. HAHAHUB reserves the right to remove listings that violate these terms. Governing law: Slovenia.</p>
            <p>Questions: <span className="text-brand-yellow">info@hahahub.art</span></p>
            <div className="flex gap-6 pt-2">
              <button onClick={() => onNavigate('privacy')} className="text-white/40 hover:text-white transition-colors underline">Privacy Policy</button>
              <button onClick={() => onNavigate('about')} className="text-white/40 hover:text-white transition-colors underline">About</button>
            </div>
          </div>
        </section>

      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default LandingPage;
