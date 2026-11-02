import React from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Page, User } from '../types';
import Smile from '../components/Smile';

interface AboutPageProps {
  onNavigate: (page: Page) => void;
  onLogout?: () => void;
  user?: User;
}

const STEPS = [
  { word: 'Tickle.', color: 'text-brand-yellow', text: 'Browse the catalog and find a comedy show that fits your stage. Or list yours and let other producers find it. Send an inquiry and talk directly to the producer.' },
  { word: 'Set up.', color: 'text-brand-pink', text: 'Agree on the terms. Use our contract templates. No commission, no middlemen. Just two producers and a show that needs a new stage.' },
  { word: 'Punch.', color: 'text-brand-cyan', text: 'Curtain up. Their show, your audience. Your show, their city. Same laugh, different language.' },
];

const WAYS = [
  {
    label: 'You have a show',
    sub: 'You are licensing it out',
    color: 'text-brand-pink',
    steps: [
      'Upload your show with synopsis, cast and royalty terms. Your dossier is your pitch.',
      'A producer finds it and sends an inquiry. You get an email.',
      'Reply directly from My Hub, agree the terms and mark the deal.',
    ],
  },
  {
    label: 'You need a show',
    sub: 'You are licensing it in',
    color: 'text-brand-cyan',
    steps: [
      'Browse the catalog. Filter by cast size, language and humor type.',
      'Send an inquiry. The rights holder replies directly.',
      'Agree on royalty, territory and number of performances. Mark the deal.',
    ],
  },
];

const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, onLogout, user }) => {
  return (
    <div className="min-h-screen bg-brand-black flex flex-col overflow-x-hidden">
      <Navigation activePage="about" onNavigate={onNavigate} onLogout={onLogout} user={user} />

      <main className="flex-1 pt-28 md:pt-36 pb-20 px-4 md:px-12">
        <div className="max-w-5xl mx-auto space-y-20 md:space-y-28">

          {/* HEADLINE */}
          <section className="space-y-5">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-white/50">Mission</p>
            <h1 className="font-display text-white text-4xl sm:text-6xl md:text-7xl leading-[0.95] tracking-tight">
              Theatre comedy <span className="text-spectrumLight-blue">travels.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 font-bold italic max-w-2xl leading-relaxed">
              The best theatre comedy in Europe is invisible, because language gets in the way. HahaHub removes that wall. Like the travelling troupes of old, from show to show and city to city.
            </p>
          </section>

          {/* STORY */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 border-t border-white/10 pt-12">
            <p className="text-xl md:text-2xl font-black uppercase italic text-white leading-snug tracking-tight">
              A show kills in Prague.<br />Nobody in London <span className="text-brand-pink">knows it exists.</span>
            </p>
            <p className="text-xl md:text-2xl font-black uppercase italic text-white leading-snug tracking-tight">
              A production runs two years in Tallinn. Madrid <span className="text-brand-cyan">has never heard of it.</span>
            </p>
          </section>

          {/* TICKLE SET UP PUNCH */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 border-t border-white/10 pt-12">
            {STEPS.map(s => (
              <div key={s.word}>
                <h2 className={`font-display text-3xl md:text-4xl uppercase tracking-wide mb-4 ${s.color}`}>{s.word}</h2>
                <p className="text-white/60 font-bold italic leading-relaxed">{s.text}</p>
              </div>
            ))}
          </section>

          {/* HOW IT WORKS */}
          <section className="border-t border-white/10 pt-12">
            <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tight text-white mb-10">How it works</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {WAYS.map(w => (
                <div key={w.label} className="border border-white/10 bg-brand-surface p-6 md:p-8">
                  <p className={`text-xs font-black uppercase tracking-widest ${w.color}`}>{w.label}</p>
                  <p className="text-white/40 text-sm italic font-bold mb-6">{w.sub}</p>
                  <ol className="space-y-4">
                    {w.steps.map((t, i) => (
                      <li key={i} className="flex gap-4">
                        <span className="text-white/30 font-black italic">{i + 1}</span>
                        <span className="text-white/70 font-bold italic leading-relaxed text-sm md:text-base">{t}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
            <p className="mt-8 text-white/40 font-bold italic text-sm">0% commission. No per-inquiry fees. No agents. The deal you close is yours.</p>
          </section>

          {/* COPYRIGHT & RIGHTS */}
          <section className="border-t border-white/10 pt-12 space-y-6">
            <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tight text-white">Copyright and licensing</h2>
            <div className="space-y-4 text-white/60 font-bold italic leading-relaxed max-w-3xl">
              <p>All transactions are directly between producers. HahaHub is a discovery tool: terms and agreements are negotiated and signed between the parties involved. Every show is published only with the permission of its copyright holder.</p>
              <p>If you are a copyright holder and believe your content has been published without authorization, contact <span className="text-white">legal@hahahub.art</span>. Disputed content is removed promptly. Any use or performance of a production without written permission from the copyright holder is prohibited.</p>
            </div>
          </section>

          <section className="pt-4 text-center">
            <div className="flex justify-center mb-4"><Smile height={96} /></div>
            <p className="text-white/20 font-black uppercase text-xs tracking-widest italic">Break a Laffing Leg. 🦵</p>
          </section>

        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default AboutPage;
