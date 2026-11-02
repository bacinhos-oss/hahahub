import React, { useState } from 'react';
import Footer from '../components/Footer';
import { Page, Show } from '../types';
import { Logo } from '../components/Logo';
import { SpectrumBar } from '../components/SpectrumBar';

interface LandingPageProps {
  onNavigate: (page: Page) => void;
  onPurchaseSuccess?: (planName: string) => void;
  shows: Show[];
}

const STEPS = [
  { word: 'TICKLE', color: 'text-brand-yellow', text: 'Browse the catalog and find a show your audience will love.' },
  { word: 'SET UP', color: 'text-brand-pink', text: 'Send an inquiry and talk directly with the producer. Use our contract templates.' },
  { word: 'PUNCH', color: 'text-brand-cyan', text: 'Agree the terms and license the show. The deal is between you and the producer.' },
];

const FAQ_ITEMS = [
  { q: 'Is it really free?', a: 'Yes. Joining is free and needs no credit card. We are building the catalog first. If paid tools arrive later, we will tell you in advance, and the first 20 founding producers keep free access forever.' },
  { q: 'Who is HahaHub for?', a: 'Theater producers, venue programmers, festival directors and co-production houses who want to license comedy shows from other countries, or offer their own.' },
  { q: 'How does licensing work?', a: 'You find a show, send an inquiry and talk directly with the rights holder. HahaHub provides discovery tools and contract templates. The deal is between you and the producer. No commission.' },
  { q: 'Is HahaHub a rights agency?', a: 'No. We do not represent any shows, take commissions or act as an intermediary in licensing deals.' },
];

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, shows }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const sliderShows = shows.slice(0, 6);

  return (
    <div className="flex flex-col w-full relative bg-brand-black overflow-x-hidden">

      {/* NAV */}
      <header className="fixed top-0 z-50 w-full bg-brand-black/95 backdrop-blur-md px-4 md:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => onNavigate('landing')} className="flex items-center hover:scale-105 transition-transform">
            <Logo height={36} className="md:hidden" />
            <Logo height={52} className="hidden md:block" />
          </button>
          <button onClick={() => onNavigate('login')} className="bg-brand-yellow text-black font-black px-5 md:px-8 py-3 text-xs md:text-sm uppercase border-4 border-black hover:bg-white transition-all shadow-neo-magenta italic">
            Join Free →
          </button>
        </div>
        <SpectrumBar height={6} className="absolute bottom-0 left-0 right-0" />
      </header>

      <main className="pt-20 md:pt-24">

        {/* HERO */}
        <section className="px-4 md:px-12 py-16 md:py-28 max-w-7xl mx-auto">
          <div className="max-w-5xl">
            <span className="bg-brand-pink text-white px-4 py-1 text-xs font-black uppercase tracking-[0.4em] inline-block italic mb-6 md:mb-8">The Laff Exchange</span>
            <h1 className="font-display text-white text-6xl sm:text-8xl md:text-[130px] leading-[0.85] tracking-tighter uppercase mb-6 md:mb-8 italic">
              TICKLE.<br/>
              <span className="text-brand-yellow">SET UP.</span><br/>
              <span className="text-brand-pink">PUNCH.</span>
            </h1>
            <p className="text-base md:text-xl font-bold text-white/60 italic max-w-2xl mb-10 md:mb-12 leading-relaxed">
              Find comedy shows from around the world and license them directly from the producers. No agents. No middlemen. Free to join.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => onNavigate('login')} className="bg-brand-yellow text-black px-8 md:px-12 py-5 md:py-6 text-lg md:text-xl font-black uppercase border-4 border-black shadow-neo-white hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all italic">
                Join Free →
              </button>
              <button onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })} className="text-white border-b-4 border-white/30 pb-1 text-lg md:text-xl font-black uppercase hover:border-brand-cyan hover:text-brand-cyan transition-all italic self-start sm:self-auto">
                How it works ↓
              </button>
            </div>
          </div>
        </section>

        {/* SLIDER */}
        {sliderShows.length > 0 && (
          <section className="py-16 md:py-24 border-y-4 border-white/10 overflow-hidden">
            <div className="px-4 md:px-12 max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-end gap-4">
              <h2 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter text-white leading-[0.9]">
                IN THE <span className="text-brand-pink">VAULT</span>
              </h2>
              <button onClick={() => onNavigate('login')} className="text-white font-black uppercase border-b-4 border-brand-yellow pb-1 italic hover:text-brand-yellow transition-all text-sm">
                View Full Catalog →
              </button>
            </div>
            <div className="relative overflow-hidden">
              <style>{`
                @keyframes ticker {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }
                .ticker-track {
                  display: flex;
                  gap: 16px;
                  animation: ticker 30s linear infinite;
                  width: max-content;
                }
                .ticker-track:hover {
                  animation-play-state: paused;
                }
              `}</style>
              <div className="ticker-track">
                {[...sliderShows, ...sliderShows].map((show, i) => (
                  <div
                    key={i}
                    onClick={() => onNavigate('login')}
                    className="group relative flex-shrink-0 w-48 md:w-64 aspect-[2/3] cursor-pointer overflow-hidden border-2 border-white/20 hover:border-brand-pink transition-all duration-300"
                  >
                    <img src={show.imageUrl} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" alt={show.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-brand-pink text-white px-3 py-2 border-4 border-black font-black uppercase italic rotate-[-3deg] text-xs">Join Free</div>
                    </div>
                    <div className="absolute bottom-0 left-0 p-3 w-full">
                      <p className="text-brand-cyan text-[9px] font-black uppercase tracking-widest italic mb-1">{show.genre}</p>
                      <h3 className="text-sm font-black uppercase italic leading-tight text-white line-clamp-2">{(show as any).englishTitle || show.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* HOW IT WORKS */}
        <section className="px-4 md:px-12 py-16 md:py-28 max-w-7xl mx-auto" id="how">
          <h2 className="text-4xl md:text-7xl font-black uppercase italic text-white mb-12">How it <span className="text-brand-yellow">works.</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <div key={i} className="border-4 border-white/10 p-6 md:p-8">
                <p className={`font-display text-4xl md:text-5xl uppercase italic mb-4 ${s.color}`}>{s.word}</p>
                <p className="text-white/60 font-bold italic leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FREE TO JOIN */}
        <section className="px-4 md:px-12 py-14 md:py-20 bg-brand-yellow border-y-8 border-black">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display text-5xl md:text-7xl uppercase italic text-black leading-[0.9] mb-4">Free to join.</h2>
            <p className="text-black/70 font-black italic text-base md:text-xl mb-8 max-w-2xl mx-auto">
              Sign up with your email. No credit card. No plans to choose. We are building the catalog together.
            </p>
            <button onClick={() => onNavigate('login')} className="bg-black text-brand-yellow px-10 py-5 text-lg md:text-xl font-black uppercase border-4 border-black hover:bg-white hover:text-black transition-all italic">
              Join Free →
            </button>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 md:px-12 py-16 md:py-24 bg-brand-surface">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black uppercase italic text-white mb-10">FAQ</h2>
            <div className="space-y-3">
              {FAQ_ITEMS.map((item, i) => (
                <div key={i} className={'border-4 transition-all ' + (openFaq === i ? 'border-brand-yellow' : 'border-white/20')}>
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
        <section className="px-4 md:px-12 py-12 border-t-4 border-white/10">
          <div className="max-w-4xl mx-auto space-y-4 text-white/30 text-xs font-bold italic leading-relaxed">
            <p>HAHAHUB is a producer-to-producer exchange for discovering and licensing international theatrical productions. By registering, you confirm you are a professional acting in a commercial capacity and are at least 18 years of age. HAHAHUB is a discovery tool only and is not party to any licensing agreement between users.</p>
            <p>All content uploaded by users remains the property of the respective rights holders. Questions: <span className="text-brand-yellow">info@hahahub.art</span></p>
            <div className="flex gap-6 pt-2">
              <button onClick={() => onNavigate('terms')} className="text-white/40 hover:text-white transition-colors underline">Terms of Service</button>
              <button onClick={() => onNavigate('privacy')} className="text-white/40 hover:text-white transition-colors underline">Privacy Policy</button>
            </div>
          </div>
        </section>

      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default LandingPage;
