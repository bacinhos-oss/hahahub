import React from 'react';
import Footer from '../components/Footer';

const STEPS = [
  { word: 'TICKLE', color: 'text-brand-yellow', text: 'Browse the catalog and find a show your audience will love.' },
  { word: 'SET UP', color: 'text-brand-pink', text: 'Send an inquiry and talk directly with the producer.' },
  { word: 'PUNCH', color: 'text-brand-cyan', text: 'Agree the terms and license the show. No commission.' },
];

const PricingPage: React.FC<any> = ({ onNavigate }) => {
  const go = (page: string) => onNavigate && onNavigate(page);
  return (
    <div className="flex flex-col w-full bg-brand-black min-h-screen pt-28 md:pt-32">
      <main className="flex-1">
        <section className="px-4 md:px-12 py-12 md:py-20 max-w-5xl mx-auto text-center">
          <span className="bg-brand-pink text-white px-4 py-1 text-xs font-black uppercase tracking-[0.4em] inline-block italic mb-6">The Laff Exchange</span>
          <h1 className="font-display text-white text-5xl md:text-8xl leading-[0.9] uppercase italic mb-6">
            Free to <span className="text-brand-yellow">join.</span>
          </h1>
          <p className="text-white/60 font-bold italic text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Sign up with your email. No credit card. No plans to choose. We are building the catalog together, and we will tell you in advance if paid tools ever arrive.
          </p>
          <button onClick={() => go('login')} className="bg-white text-black px-10 py-5 text-lg md:text-xl font-black uppercase border-2 border-black  hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all italic">
            Join Free →
          </button>
        </section>
        <section className="px-4 md:px-12 pb-16 md:pb-24 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <div key={i} className="border-2 border-white/10 p-6 md:p-8">
                <p className={`font-display text-4xl uppercase italic mb-3 ${s.color}`}>{s.word}</p>
                <p className="text-white/60 font-bold italic leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer onNavigate={go as any} />
    </div>
  );
};

export default PricingPage;
