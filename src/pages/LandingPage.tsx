import React, { useState } from 'react';
import Footer from '../components/Footer';
import { Page, Show } from '../types';
import PaymentModal from '../components/PaymentModal';

interface LandingPageProps {
  onNavigate: (page: Page) => void;
  onPurchaseSuccess: (planName: string) => void;
  shows: Show[];
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onPurchaseSuccess, shows }) => {
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: string } | null>(null);
  const [teaserLock, setTeaserLock] = useState<string | null>(null);
  const teaserShows = shows.slice(0, 4);

  return (
    <div className="flex flex-col w-full relative bg-brand-black">
      <PaymentModal
        isOpen={!!selectedPlan}
        planName={selectedPlan?.name || ''}
        price={selectedPlan?.price || ''}
        onClose={() => setSelectedPlan(null)}
        onSuccess={() => { onPurchaseSuccess(selectedPlan?.name || 'Annual Pass'); setSelectedPlan(null); }}
      />

      {/* NAV */}
      <header className="fixed top-0 z-50 w-full bg-brand-black/95 backdrop-blur-md px-6 md:px-12 py-4 border-b-4 border-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div onClick={() => onNavigate('landing')} className="logo-text text-white text-3xl md:text-5xl uppercase tracking-tighter cursor-pointer">HahaHub</div>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('login')} className="text-xs font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors italic hidden md:block">Sign In</button>
            <button onClick={() => onNavigate('login')} className="bg-brand-yellow text-black font-black px-8 py-3 text-sm uppercase border-4 border-black hover:bg-white transition-all shadow-neo-magenta italic">
              Join Hub →
            </button>
          </div>
        </div>
      </header>

      <main className="pt-24 md:pt-32">

        {/* HERO */}
        <section className="px-6 md:px-12 py-20 md:py-32 max-w-7xl mx-auto">
          <div className="max-w-5xl">
            <span className="bg-brand-pink text-white px-4 py-1 text-xs font-black uppercase tracking-[0.4em] inline-block italic mb-8">The Global Comedy Rights Ecosystem</span>
            <h1 className="font-display text-white text-5xl sm:text-7xl md:text-9xl leading-[0.85] tracking-tighter uppercase mb-8 italic">
              INTERNATIONAL<br/>
              <span className="text-brand-yellow">THEATRE COMEDY</span><br/>
              <span className="text-brand-cyan">PRODUCERS</span><br/>
              PLATFORM.
            </h1>
            <p className="text-xl md:text-2xl font-bold text-white/60 italic max-w-2xl mb-12 leading-relaxed">
              The global ecosystem for comedy rights. Browse, license, and stage the world's funniest productions. Direct. No middlemen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => onNavigate('login')} className="bg-brand-yellow text-black px-12 py-6 text-xl font-black uppercase border-4 border-black shadow-neo-white hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all italic">
                🎭 Tickle the Laugh — Join →
              </button>
              <button onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })} className="text-white border-b-4 border-white/30 pb-1 text-xl font-black uppercase hover:border-brand-cyan hover:text-brand-cyan transition-all italic">
                How it works ↓
              </button>
            </div>
          </div>
        </section>

        {/* QUOTES */}
        <section className="px-6 md:px-12 py-16 border-y-4 border-white/10 bg-brand-surface overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { quote: "Laughter is the only currency that multiplies when shared.", author: "Chief of Laughter", org: "HahaHub" },
                { quote: "Comedy is not a genre. It's a survival strategy.", author: "Chief of Laughter", org: "HahaHub" },
                { quote: "The human race has one really effective weapon, and that is laughter.", author: "Mark Twain", org: "1835–1910" },
              ].map((q, i) => (
                <div key={i} className={"border-l-4 pl-6 " + (i === 0 ? "border-brand-yellow" : i === 1 ? "border-brand-cyan" : "border-brand-pink")}>
                  <p className="text-white/70 font-bold italic text-lg leading-relaxed mb-4">"{q.quote}"</p>
                  <p className={"text-xs font-black uppercase tracking-widest " + (i === 0 ? "text-brand-yellow" : i === 1 ? "text-brand-cyan" : "text-brand-pink")}>— {q.author}</p>
                  <p className="text-white/20 text-[9px] font-bold uppercase tracking-widest mt-1">{q.org}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TEASER CATALOG */}
        <section className="px-6 md:px-12 py-24 border-b-4 border-white/10">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
              <div>
                <span className="text-brand-cyan text-xs font-black uppercase tracking-[0.5em] italic">Latest Deployments</span>
                <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white leading-[0.9] mt-2">
                  IN THE <span className="text-brand-pink">VAULT</span>
                </h2>
              </div>
              <button onClick={() => onNavigate('login')} className="text-white font-black uppercase border-b-4 border-brand-yellow pb-1 italic hover:text-brand-yellow transition-all">
                View Full Catalog →
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {teaserShows.map((show) => (
                <div
                  key={show.id}
                  onMouseEnter={() => setTeaserLock(show.id)}
                  onMouseLeave={() => setTeaserLock(null)}
                  onClick={() => onNavigate('login')}
                  className="group relative bg-brand-black border-4 border-white aspect-[2/3] cursor-pointer overflow-hidden hover:shadow-neo-yellow hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all"
                >
                  <img src={show.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 scale-105 group-hover:scale-110 transition-all duration-700" alt={show.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-70"></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-brand-pink text-white px-4 py-2 border-4 border-black font-black uppercase italic rotate-[-3deg] text-sm">Access Locked</div>
                  </div>
                  <div className="absolute bottom-0 left-0 p-4 w-full">
                    <p className="text-brand-cyan text-[9px] font-black uppercase tracking-widest italic mb-1">{show.genre}</p>
                    <h3 className="text-sm md:text-lg font-black uppercase italic leading-none text-white">{show.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="px-6 md:px-12 py-24 border-b-4 border-white/10" id="how">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-black uppercase italic text-white mb-4">How It <span className="text-brand-cyan">Works</span></h2>
            <p className="text-white/40 font-bold italic text-lg mb-16">Join the ecosystem of 100+ producers worldwide.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: '01', icon: 'search', color: 'brand-cyan', title: 'Browse', desc: 'Explore 50+ international comedy productions. Filter by genre, territory, cast size, and budget.' },
                { step: '02', icon: 'handshake', color: 'brand-yellow', title: 'License', desc: 'Contact rights holders directly. Use our contract templates. No agents, no hidden fees.' },
                { step: '03', icon: 'theater_comedy', color: 'brand-pink', title: 'Stage It', desc: 'Get full script, technical rider, and commercial data. Everything you need to produce.' },
              ].map((item, i) => (
                <div key={i} className="border-4 border-white p-8 hover:shadow-neo-yellow transition-all">
                  <div className="flex items-start justify-between mb-8">
                    <span className={`text-6xl font-black italic text-${item.color} opacity-30`}>{item.step}</span>
                    <span className={`material-symbols-outlined text-4xl text-${item.color}`}>{item.icon}</span>
                  </div>
                  <h3 className="text-3xl font-black uppercase italic text-white mb-4">{item.title}</h3>
                  <p className="text-gray-400 font-bold italic leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOR WHO */}
        <section className="px-6 md:px-12 py-24 bg-brand-surface border-b-4 border-white/10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl md:text-7xl font-black uppercase italic text-white mb-8">Built for <span className="text-brand-yellow">Producers.</span></h2>
              <div className="space-y-6">
                {[
                  { icon: 'verified', text: 'Verified rights holders only — every listing is authenticated' },
                  { icon: 'description', text: 'Full commercial data — royalties, territories, box office history' },
                  { icon: 'translate', text: 'Translation rights included where available' },
                  { icon: 'support_agent', text: 'Direct contact with decision makers — no gatekeepers' },
                  { icon: 'picture_as_pdf', text: '3-page script scenario in English for every production' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-brand-cyan text-2xl flex-shrink-0 mt-1">{item.icon}</span>
                    <p className="text-white/70 font-bold italic text-lg leading-tight">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-8 border-white p-8 bg-brand-black shadow-neo-yellow">
              <p className="text-brand-cyan text-xs font-black uppercase tracking-[0.4em] italic mb-6">Who it's for</p>
              <div className="space-y-4">
                {['Theater Producers', 'Venue Programmers', 'Festival Directors', 'Co-Production Houses', 'Rights Agents'].map((role, i) => (
                  <div key={i} className="flex items-center gap-4 border-b border-white/10 pb-4">
                    <span className="w-2 h-2 bg-brand-pink flex-shrink-0"></span>
                    <span className="font-black uppercase italic text-white text-lg">{role}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="px-6 md:px-12 py-32" id="pricing">
          <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
            <span className="bg-brand-cyan text-black px-4 py-1 text-xs font-black uppercase tracking-[0.4em] italic mb-8">Simple Pricing</span>
            <h2 className="font-display text-white text-6xl md:text-8xl uppercase mb-6 italic">One Price.<br/><span className="text-brand-pink">Full Access.</span></h2>
            <p className="text-white/40 font-bold italic text-xl mb-16 max-w-xl">No tiers, no upsells, no per-inquiry fees. One annual membership gives you everything.</p>

            <div className="w-full max-w-lg">
              <div className="bg-white border-8 border-black p-12 shadow-neo-magenta relative">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-brand-pink text-white px-6 py-1 font-black uppercase text-xs italic border-4 border-black">Most Popular</div>
                <h3 className="text-3xl font-black uppercase italic text-black mb-2">Annual Pro Pass</h3>
                <p className="text-gray-500 font-bold italic text-sm mb-8">Full access for 12 months</p>
                <div className="text-7xl font-black text-brand-pink mb-2">€99</div>
                <p className="text-gray-400 text-sm font-bold italic mb-10">per year · ~€8/month</p>
                <ul className="text-left space-y-3 mb-10">
                  {['Full catalog access', 'Unlimited asset uploads', 'Contract templates', 'Direct licensing tools', 'Performance analytics', 'VIP networking events'].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-bold text-black">
                      <span className="material-symbols-outlined text-brand-pink text-lg">check_circle</span>{f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => onNavigate('login')}
                  className="w-full py-5 bg-black text-brand-yellow border-4 border-black font-black uppercase text-xl hover:bg-brand-pink hover:text-white transition-all shadow-[6px_6px_0px_#FF0266] italic"
                >
                  Enter the Ecosystem →
                </button>
                <p className="text-gray-400 text-xs font-bold italic mt-4 text-center">Secure payment via PayPal</p>
              </div>
            </div>
          </div>
        </section>

        {/* TERMS MINI */}
        <section className="px-6 md:px-12 py-16 border-t-4 border-white/10">
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
