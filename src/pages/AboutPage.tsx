import React from 'react';
import Navigation from '../components/Navigation';
import { Page, User } from '../types';

interface AboutPageProps {
  onNavigate: (page: Page) => void;
  onLogout?: () => void;
  user?: User;
}

const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, onLogout, user }) => {
  return (
    <div className="min-h-screen bg-brand-black flex flex-col overflow-x-hidden">
      <Navigation activePage="about" onNavigate={onNavigate} onLogout={onLogout} user={user} />

      <main className="flex-1 pt-24 md:pt-40 pb-20 px-4 md:px-12">
        <div className="max-w-5xl mx-auto space-y-20 md:space-y-32">

          {/* HEADLINE */}
          <section className="space-y-6">
            <span className="bg-brand-pink text-white px-4 py-1 text-xs font-black uppercase tracking-[0.4em] inline-block italic">Mission</span>
            <h1 className="text-5xl sm:text-7xl md:text-[100px] font-black uppercase italic tracking-tighter text-white leading-none">
              THEATRE<br/>
              COMEDY<br/>
              <span className="text-brand-yellow">TRAVELS.</span>
            </h1>
          </section>

          {/* CORE STATEMENT */}
          <section className="border-t-8 border-white pt-12 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <p className="text-2xl md:text-3xl font-black uppercase italic text-white leading-tight tracking-tighter">
                  A show kills in Prague.<br/>
                  Nobody in London<br/>
                  <span className="text-brand-pink">knows it exists.</span>
                </p>
                <p className="text-2xl md:text-3xl font-black uppercase italic text-white leading-tight tracking-tighter">
                  A production runs two years<br/>in Tallinn. Madrid has<br/>
                  <span className="text-brand-cyan">never heard of it.</span>
                </p>
              </div>
              <div className="space-y-6 self-end">
                <p className="text-base md:text-lg text-gray-400 font-bold leading-relaxed italic">
                  The best theatre comedy in Europe is invisible — because language gets in the way.
                </p>
                <p className="text-base md:text-lg text-gray-400 font-bold leading-relaxed italic">
                  HahaHub removes that wall. Like travelling theatre troupes of old — show to show, city to city, stage to stage — across Europe and beyond.
                </p>
                <p className="text-white/30 font-black uppercase text-xs tracking-widest italic">Theatre comedy. Producer to producer. Direct.</p>
              </div>
            </div>

            {/* CITIES */}
            <div className="border-t-4 border-white/10 pt-10 grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { from: 'Prague', to: 'Amsterdam' },
                { from: 'Tallinn', to: 'Madrid' },
                { from: 'Warsaw', to: 'London' },
                { from: 'Helsinki', to: 'Paris' },
                { from: 'Reykjavik', to: 'Berlin' },
              ].map((city, i) => (
                <div key={i} className="border-l-4 border-brand-pink pl-3 py-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-brand-pink">{city.from}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mt-1">→ {city.to}</p>
                </div>
              ))}
            </div>
          </section>

          {/* TICKLE SET UP PUNCH */}
          <section className="space-y-0">
            <h2 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter text-white leading-none mb-16">
              TICKLE.<br/>
              <span className="text-brand-yellow">SET UP.</span><br/>
              <span className="text-brand-pink">PUNCH.</span>
            </h2>

            <div className="border-t-4 border-white/10 py-12 grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-2">
                <span className="text-[80px] font-black text-white/5 leading-none">01</span>
              </div>
              <div className="md:col-span-10 space-y-4">
                <h3 className="text-3xl md:text-5xl font-black uppercase italic text-brand-yellow tracking-tighter">Tickle.</h3>
                <p className="text-base md:text-lg text-gray-400 font-bold leading-relaxed italic max-w-2xl">
                  Browse the catalog. Find a theatre comedy show that fits your stage. Or list yours — let other producers find it. Send an inquiry. Talk directly to the producer.
                </p>
              </div>
            </div>

            <div className="border-t-4 border-white/10 py-12 grid grid-cols-1 md:grid-cols-12 gap-6 bg-brand-surface">
              <div className="md:col-span-2 px-6">
                <span className="text-[80px] font-black text-white/5 leading-none">02</span>
              </div>
              <div className="md:col-span-10 space-y-4 px-6 md:px-0">
                <h3 className="text-3xl md:text-5xl font-black uppercase italic text-brand-cyan tracking-tighter">Set Up.</h3>
                <p className="text-base md:text-lg text-gray-400 font-bold leading-relaxed italic max-w-2xl">
                  You agree on terms. License signed. No commission. No middlemen. Just two producers and a theatre comedy show that needs a new stage.
                </p>
              </div>
            </div>

            <div className="border-t-4 border-white/10 py-12 grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-2">
                <span className="text-[80px] font-black text-white/5 leading-none">03</span>
              </div>
              <div className="md:col-span-10 space-y-4">
                <h3 className="text-3xl md:text-5xl font-black uppercase italic text-brand-pink tracking-tighter">Punch.</h3>
                <p className="text-base md:text-lg text-gray-400 font-bold leading-relaxed italic max-w-2xl">
                  Curtain up. Their show, your audience. Your show, their city. Same laugh. Different language. That's theatre comedy. That's the point.
                </p>
              </div>
            </div>
          </section>

          {/* COPYRIGHT & RIGHTS */}
          <section className="space-y-8 bg-brand-surface border-4 border-white/20 p-6 md:p-12 shadow-neo-cyan">
            <h2 className="text-3xl md:text-4xl font-black uppercase italic text-brand-cyan border-b-2 border-brand-cyan/20 pb-4">Copyright and Licensing</h2>
            <div className="space-y-6 text-gray-300 font-bold italic leading-relaxed">
              <p>All transactions are directly between producers. HahaHub is the marketplace — terms, fees, and agreements are negotiated and signed between the parties involved.</p>
              <p>All content on this platform is published only with the permission of its legitimate copyright holder.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 pt-4">
                {[
                  { label: 'Rights Holder', text: 'Name of the copyright holder — listed on every show' },
                  { label: 'License Type', text: 'Type of rights: copyright, performance license, territory' },
                  { label: 'Duration', text: 'Date and duration of the license — agreed between producers' },
                ].map((item, i) => (
                  <div key={i} className="border-l-4 border-brand-pink pl-4 py-2">
                    <p className="text-[10px] uppercase text-brand-pink font-black tracking-widest">{item.label}</p>
                    <p className="text-sm mt-1">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4 pt-4">
              <h3 className="text-xl md:text-2xl font-black uppercase italic text-white">Liability</h3>
              <p className="text-gray-400 font-bold italic text-sm md:text-base">
                If you are a copyright holder and believe your content has been published without authorization, contact us at <span className="text-brand-yellow">legal@hahahub.art</span>. Disputed content will be removed promptly.
              </p>
            </div>
            <div className="space-y-4 pt-4">
              <h3 className="text-xl md:text-2xl font-black uppercase italic text-white">Use of Content</h3>
              <p className="text-gray-400 font-bold italic border-2 border-brand-pink/20 p-4 md:p-6 bg-brand-pink/5 text-sm md:text-base">
                Any use, distribution, or performance of productions without written permission from the copyright holder is strictly prohibited.
              </p>
            </div>
          </section>

          {/* SIGN OFF */}
          <section className="py-12 border-t-4 border-white/10 text-center">
            <p className="text-white/20 font-black uppercase text-xs tracking-widest italic">Break a Laffing Leg. 🦵</p>
          </section>

        </div>
      </main>

      <footer className="bg-brand-black border-t-4 border-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="logo-text text-2xl uppercase opacity-50">HAHAHUB</div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">© 2025 ALL LAUGHS RESERVED</p>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
