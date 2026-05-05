
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
    <div className="min-h-screen bg-brand-black flex flex-col">
      <Navigation activePage="about" onNavigate={onNavigate} onLogout={onLogout} user={user} />
      
      <main className="flex-1 pt-24 md:pt-40 pb-20 px-4 md:px-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-24">
          
          {/* Manifesto Section */}
          <section className="space-y-6">
            <span className="bg-brand-pink text-white px-4 py-1 text-xs font-black uppercase tracking-[0.4em] rotate-[-2deg] inline-block italic">Manifesto v3.1</span>
            <h1 className="text-4xl sm:text-6xl md:text-[100px] font-black uppercase italic tracking-tighter text-brand-yellow leading-none">
              OUR <br/> <span className="text-white">MISSION.</span>
            </h1>
          </section>

          {/* ROTATING QUOTES */}
          <section className="border-4 border-brand-yellow p-8 md:p-12 bg-brand-surface relative overflow-hidden">
            <div className="absolute top-4 right-6 text-[80px] font-black text-brand-yellow/10 leading-none">"</div>
            {[
              { quote: "Comedy is not a genre. It's a survival strategy.", author: "Chief of Laughter", org: "HahaHub" },
              { quote: "Laughter is the only currency that multiplies when shared.", author: "Chief of Laughter", org: "HahaHub" },
              { quote: "Rights are serious. Comedy is not. We handle both.", author: "Chief of Laughter", org: "HahaHub" },
              { quote: "The world has enough drama. We're here for the punchline.", author: "Chief of Laughter", org: "HahaHub" },
              { quote: "A show that makes you laugh once will be forgotten. One that makes you cry with laughter will run forever.", author: "Chief of Laughter", org: "HahaHub" },
            ].map((q, i) => (
              <div key={i} className={"border-l-4 border-brand-yellow pl-6 " + (i > 0 ? "mt-8 border-l-2 border-white/10" : "")}>
                <p className={"font-bold italic leading-relaxed mb-2 " + (i === 0 ? "text-2xl md:text-3xl text-white" : "text-base text-white/50")}>"{q.quote}"</p>
                <p className={"text-xs font-black uppercase tracking-widest " + (i === 0 ? "text-brand-yellow" : "text-white/20")}>— {q.author}, {q.org}</p>
              </div>
            ))}
          </section>

          {/* Core Vision Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-t-8 border-white pt-12">
            <div className="lg:col-span-7 space-y-8">
              <p className="text-2xl md:text-5xl font-black leading-none text-white italic tracking-tighter uppercase">
                HAHAHUB IS THE ULTIMATE <span className="text-brand-cyan">PRODUCER-TO-PRODUCER</span> DATABASE FOR THEATER COMEDIES.
              </p>
              <div className="h-2 w-24 bg-brand-pink"></div>
              <p className="text-xl text-white font-black leading-tight italic uppercase tracking-tighter">
                THE ESSENCE: FIND FRESH COMEDY FOR YOUR NEW SEASON AND SELL YOUR HITS ALL IN ONE PLACE.
              </p>
              <p className="text-xl text-gray-400 font-bold leading-relaxed italic">
                We connect producers through standardized commercial frameworks and transparent deal structures. Producers meet, assess risk, and license or co-produce works faster—without constant negotiation over the basics.
              </p>
              <p className="text-xl text-gray-400 font-bold leading-relaxed italic">
                HaHaHub reduces uncertainty, speeds up decisions, and enables scalable international collaboration.
              </p>
            </div>
            
            <div className="lg:col-span-5 bg-brand-surface border-4 border-white p-10 shadow-neo-magenta rotate-1">
              <h3 className="text-3xl font-black uppercase italic text-brand-pink mb-8 border-b-4 border-brand-pink pb-2">THE JOURNEY</h3>
              <ul className="space-y-8">
                {[
                  { t: 'DISCOVERY', d: 'Filter through standardized producer-centric metrics.' },
                  { t: 'EVALUATION', d: 'Immediate access to break-even data and risk profiles.' },
                  { t: 'CONNECTION', d: 'Direct channel between producers.' },
                  { t: 'EXECUTION', d: 'Reporting through standardized royalty cycles.' }
                ].map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="text-brand-yellow font-black text-2xl italic">/{i+1}</span>
                    <div>
                      <p className="font-black uppercase text-sm text-white tracking-widest italic mb-1">{step.t}</p>
                      <p className="text-xs text-gray-500 font-bold italic">{step.d}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Standard Fee Framework Section */}
          <section className="space-y-12">
            <div className="flex items-center gap-6">
              <h2 className="text-5xl md:text-7xl font-black uppercase italic text-white whitespace-nowrap">
                FEE <span className="text-brand-pink">&</span> RIGHTS
              </h2>
              <div className="h-2 flex-1 bg-white/10"></div>
            </div>

            <div className="bg-white text-black border-8 border-black p-10 md:p-16 shadow-neo-yellow">
              <div className="space-y-12">
                <div>
                  <h3 className="text-3xl font-black uppercase italic mb-6 border-l-8 border-black pl-4">HOW DEALS WORK</h3>
                  <p className="text-xl font-bold leading-relaxed italic">
                    All collaborations follow a pre-aligned commercial framework. Final terms are agreed directly between producers, but HAHAHUB sets the benchmark for transparency.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  <div className="bg-gray-100 p-8 border-4 border-black rotate-[-1deg] shadow-[4px_4px_0px_black]">
                    <h4 className="font-black text-brand-pink uppercase tracking-widest text-xs mb-4 italic">Royalty Standards</h4>
                    <p className="text-2xl font-black italic mb-2 uppercase">5–10% GBO</p>
                    <p className="text-xs font-bold italic text-gray-500">Typical range based on gross box office revenue.</p>
                  </div>

                  <div className="bg-gray-100 p-8 border-4 border-black rotate-[1deg] shadow-[4px_4px_0px_black]">
                    <h4 className="font-black text-brand-cyan uppercase tracking-widest text-xs mb-4 italic">Minimum Guarantee</h4>
                    <p className="text-2xl font-black italic mb-2 uppercase">€2K – €10K</p>
                    <p className="text-xs font-bold italic text-gray-500">Recoupable advance against royalties.</p>
                  </div>

                  <div className="bg-gray-100 p-8 border-4 border-black rotate-[-1deg] shadow-[4px_4px_0px_black]">
                    <h4 className="font-black text-brand-yellow uppercase tracking-widest text-xs mb-4 italic">License Scope</h4>
                    <p className="text-2xl font-black italic mb-2 uppercase">Per Territory</p>
                    <p className="text-xs font-bold italic text-gray-500">Licensed per term, with optional exclusivity.</p>
                  </div>
                </div>

                <div className="bg-brand-black text-white p-10 border-4 border-black shadow-[8px_8px_0px_#03DAC6]">
                  <p className="text-lg font-bold italic leading-relaxed text-center">
                    HaHaHub does not set prices but ensures shared definitions, reporting standards, and transparency to remove friction from international theatrical production.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Legal and Copyright Compliance Section */}
          <section className="space-y-12 bg-brand-surface border-4 border-brand-border p-8 md:p-12 shadow-neo-cyan">
            <div className="space-y-8">
              <h2 className="text-4xl font-black uppercase italic text-brand-cyan border-b-2 border-brand-cyan/20 pb-4">Copyright and Licensing</h2>
              <div className="space-y-6 text-gray-300 font-bold italic leading-relaxed">
                <p>
                  All content on this site, including plays, scripts, performances, and related materials, is protected by copyright. Each production is published only with the permission of its legitimate copyright holder (author, publisher, or authorized producer).
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  <div className="border-l-4 border-brand-pink pl-4 py-2">
                    <p className="text-[10px] uppercase text-brand-pink font-black tracking-widest">Metadata Field 01</p>
                    <p className="text-sm">Name of the copyright holder</p>
                  </div>
                  <div className="border-l-4 border-brand-pink pl-4 py-2">
                    <p className="text-[10px] uppercase text-brand-pink font-black tracking-widest">Metadata Field 02</p>
                    <p className="text-sm">Type of rights (copyright, performance license)</p>
                  </div>
                  <div className="border-l-4 border-brand-pink pl-4 py-2">
                    <p className="text-[10px] uppercase text-brand-pink font-black tracking-widest">Metadata Field 03</p>
                    <p className="text-sm">Date and duration of the license</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-8">
                <h3 className="text-2xl font-black uppercase italic text-white">Liability</h3>
                <p className="text-gray-400 font-bold italic">
                  If you are a copyright holder and believe your content has been published without authorization, please contact us immediately at <span className="text-brand-yellow">legal@hahahub.art</span>. Content that is the subject of a copyright dispute will be removed promptly until rights are clarified.
                </p>
              </div>

              <div className="space-y-4 pt-8">
                <h3 className="text-2xl font-black uppercase italic text-white">Use of Content</h3>
                <p className="text-gray-400 font-bold italic border-2 border-brand-pink/20 p-6 bg-brand-pink/5">
                  Any use, distribution, or performance of the productions without written permission from the copyright holder is strictly prohibited.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-20 text-center space-y-10 border-t-4 border-white/10">
            <h2 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter text-white">READY TO <span className="text-transparent" style={{ WebkitTextStroke: '2px white' }}>SCALE?</span></h2>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <button 
                onClick={() => onNavigate('discovery')}
                className="bg-brand-yellow text-black px-12 py-6 font-black uppercase text-xl border-4 border-white shadow-neo-magenta italic hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all"
              >
                JOIN THE NETWORK
              </button>
              <button 
                onClick={() => onNavigate('upload')}
                className="bg-brand-cyan text-black px-12 py-6 font-black uppercase text-xl border-4 border-white shadow-neo-white italic hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all"
              >
                DEPLOY ASSET
              </button>
            </div>
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
