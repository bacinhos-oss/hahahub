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

const BELIEFS = [
  { title: 'Producer to producer', color: 'text-brand-yellow',
    text: 'No agents and no middlemen. You talk to the person who owns the rights, and the deal you close is yours. HahaHub takes no commission.' },
  { title: 'The show stays yours', color: 'text-brand-pink',
    text: 'You decide the terms, what you share and with whom. Scripts, creative teams and track records are seen only by Verified Producers.' },
  { title: 'Comedy first', color: 'text-brand-cyan',
    text: 'Farce, satire, monocomedy, musical comedy. Every kind of show that makes a full house laugh, and every kind of stage it plays on.' },
];

const STEPS = [
  { word: 'Tickle.', color: 'text-brand-yellow',
    text: 'Find a comedy that fits your stage and send its producer a tickle. Or list your own show and let producers from other countries find you.' },
  { word: 'Set up.', color: 'text-brand-pink',
    text: 'Talk directly. Exchange the script and the video, agree on royalty, territory and dates. Keep every deal in your Pipeline and every contract in Documents.' },
  { word: 'Punch.', color: 'text-brand-cyan',
    text: 'Curtain up. Their hit, your audience. Your hit, their city. Same laugh, a new language.' },
];

const WAYS = [
  {
    label: 'You have a show',
    sub: 'and want it to play abroad',
    color: 'text-brand-pink',
    steps: [
      'Become a member and list your show. The essentials take about five minutes.',
      'Producers abroad find it in the catalog and send you a tickle. You get an email.',
      'Reply from My Hub, agree on the terms and sign the licence directly with them.',
    ],
  },
  {
    label: 'You need a show',
    sub: 'and want a proven comedy for your stage',
    color: 'text-brand-cyan',
    steps: [
      'Browse the catalog. Filter by cast size, language, genre and type of humour.',
      'Send a tickle to the rights holder. They reply to you directly.',
      'Agree on royalty, territory and dates. Stage your version, or restage the original with Full Punch.',
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
          <section className="space-y-6">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-white/50">Mission</p>
            <h1 className="font-display text-white text-4xl sm:text-6xl md:text-7xl leading-[0.95] tracking-tight">
              Great comedy should not <span className="text-spectrumLight-blue">stop at the border.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 font-bold italic max-w-3xl leading-relaxed">
              Every season, comedies fill theatres for years and never leave their own country. Not because they would not work elsewhere, but because nobody abroad knows they exist.
            </p>
            <p className="text-lg md:text-xl text-white font-bold italic max-w-3xl leading-relaxed">
              HahaHub is the international professional network for theatre comedy producers. We call it the Laff Exchange: showcase your productions, discover new titles, connect directly with fellow producers and create new licensing opportunities.
            </p>
          </section>

          {/* STORY */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 border-t border-white/10 pt-12">
            <p className="text-xl md:text-2xl font-black uppercase italic text-white leading-snug tracking-tight">
              A show sells out in Prague.<br />Nobody in Lisbon <span className="text-brand-pink">knows it exists.</span>
            </p>
            <p className="text-xl md:text-2xl font-black uppercase italic text-white leading-snug tracking-tight">
              A comedy runs two years in Tallinn.<br />Madrid <span className="text-brand-cyan">has never heard of it.</span>
            </p>
            <p className="md:col-span-2 text-white/60 font-bold italic leading-relaxed max-w-3xl">
              We want to change that. The producer in Lisbon should be able to find the Prague hit in a minute, read it, watch it and call its producer the same day.
            </p>
          </section>

          {/* WHAT WE BELIEVE */}
          <section className="border-t border-white/10 pt-12">
            <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tight text-white mb-10">What we stand for</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
              {BELIEFS.map(b => (
                <div key={b.title}>
                  <h3 className={`text-lg font-black uppercase italic tracking-tight mb-3 ${b.color}`}>{b.title}</h3>
                  <p className="text-white/60 font-bold italic leading-relaxed">{b.text}</p>
                </div>
              ))}
            </div>
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
          </section>

          {/* WHO IT IS FOR */}
          <section className="border-t border-white/10 pt-12 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
            <div>
              <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tight text-white mb-4">Who it is for</h2>
              <p className="text-white/60 font-bold italic leading-relaxed">
                Independent and private theatres, production companies and producers who make comedy for a living. If you put shows on a stage and sell tickets, you belong here.
              </p>
            </div>
            <div>
              <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tight text-white mb-4">Membership</h2>
              <p className="text-white/60 font-bold italic leading-relaxed">
                Membership is free. Every member can browse the catalog, send tickles and post on LaffWire. List your first show and you become a Verified Producer: you unlock scripts, creative teams, track records and the full Studio in My Hub.
              </p>
              {!user && (
                <button onClick={() => onNavigate('login')}
                  className="mt-6 bg-white text-black px-8 py-3 font-black uppercase italic text-sm border-2 border-black hover:bg-brand-yellow transition-colors">
                  Become a member →
                </button>
              )}
            </div>
          </section>

          {/* COPYRIGHT & RIGHTS */}
          <section className="border-t border-white/10 pt-12 space-y-6">
            <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tight text-white">Copyright and licensing</h2>
            <div className="space-y-4 text-white/60 font-bold italic leading-relaxed max-w-3xl">
              <p>Every deal is made directly between producers. HahaHub connects you: the terms are negotiated and the licence is signed between the two parties. A show may be listed only by its copyright holder or with their permission.</p>
              <p>If you hold the rights to a show and believe it was published without your permission, write to <span className="text-white">legal@hahahub.art</span> and we will remove it promptly. No production may be used or performed without written permission from its copyright holder.</p>
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
