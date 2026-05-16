import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import { Page, User } from '../types';

interface AboutPageProps {
  onNavigate: (page: Page) => void;
  onLogout?: () => void;
  user?: User;
}

const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, onLogout, user }) => {
  const [roiPerformances, setRoiPerformances] = useState(20);
  const [roiTicket, setRoiTicket] = useState(30);
  const [roiSeats, setRoiSeats] = useState(300);
  const [roiOccupancy, setRoiOccupancy] = useState(70);
  const [roiRoyalty, setRoiRoyalty] = useState(8);

  const roiGross = roiTicket * roiSeats * (roiOccupancy / 100) * roiPerformances;
  const roiYourRoyalty = roiGross * (roiRoyalty / 100);
  const roiAgentFee = roiGross * 0.15; // typical agent 15%
  const roiHahahubFee = 99;
  const roiSaved = roiAgentFee - roiHahahubFee;

  return (
    <div className="min-h-screen bg-brand-black flex flex-col overflow-x-hidden">
      <Navigation activePage="about" onNavigate={onNavigate} onLogout={onLogout} user={user} />

      <main className="flex-1 pt-24 md:pt-40 pb-20 px-4 md:px-12">
        <div className="max-w-6xl mx-auto space-y-20 md:space-y-32">

          {/* MANIFESTO */}
          <section className="space-y-6">
            <span className="bg-brand-pink text-white px-4 py-1 text-xs font-black uppercase tracking-[0.4em] inline-block italic">Manifesto v3.1</span>
            <h1 className="text-5xl sm:text-7xl md:text-[100px] font-black uppercase italic tracking-tighter text-brand-yellow leading-none">
              OUR<br/><span className="text-white">MISSION.</span>
            </h1>
          </section>

          {/* CORE VISION */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-12 border-t-8 border-white pt-12">
            <div className="lg:col-span-7 space-y-6 md:space-y-8">
              <p className="text-2xl md:text-5xl font-black leading-none text-white italic tracking-tighter uppercase">
                YOUR HIT IS UNKNOWN IN <span className="text-brand-cyan">SWEDEN.</span> THEIR SHOW IS PERFECT FOR <span className="text-brand-yellow">YOUR STAGE.</span>
              </p>
              <div className="h-2 w-24 bg-brand-pink"></div>
              <p className="text-lg md:text-xl text-brand-yellow font-black leading-tight italic uppercase tracking-tighter">
                TICKLE. SET UP. PUNCH.
              </p>
              <p className="text-base md:text-lg text-gray-400 font-bold leading-relaxed italic">
                You have a gledališka comedy show that works. Somewhere, a producer needs exactly that for their next season. Or the other way around — they have the show, you have the stage.
              </p>
              <p className="text-base md:text-lg text-gray-400 font-bold leading-relaxed italic">
                HahaHub is where that happens. Browse, inquire, license. No agents, no commissions, no waiting rooms. Just producers talking to producers.
              </p>
              <p className="text-white/30 font-black uppercase text-xs tracking-widest italic">Rights are serious. Comedy is not. We handle both.</p>
            </div>

            <div className="lg:col-span-5 bg-brand-surface border-4 border-white p-8 md:p-10 shadow-neo-magenta md:rotate-1">
              <h3 className="text-2xl md:text-3xl font-black uppercase italic text-brand-pink mb-6 md:mb-8 border-b-4 border-brand-pink pb-2">THE MOVES</h3>
              <ul className="space-y-6 md:space-y-8">
                {[
                  { t: 'TICKLE', d: 'You browse the catalog. A gledališka comedy from Slovenia catches your eye. Or Spain. Or Japan. You send an inquiry — directly to the producer.' },
                  { t: 'SET UP', d: 'You talk. You agree on terms. License signed. No agent taking 15%. No waiting for someone to pass a message. Just two producers, a show, and a deal.' },
                  { t: 'PUNCH', d: 'Curtain up. Their show, your stage. Your audience laughs. And somewhere, another producer is doing the same with yours.' },
                  { t: 'BREAK A LEG.', d: '🎭', special: true },
                ].map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="text-brand-yellow font-black text-2xl italic flex-shrink-0">{i < 3 ? `/${i+1}` : '✓'}</span>
                    <div>
                      <p className={`font-black uppercase text-sm tracking-widest italic mb-1 ${step.special ? 'text-brand-yellow' : 'text-white'}`}>{step.t}</p>
                      <p className="text-xs text-gray-500 font-bold italic">{step.d}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* COMPETITIVE POSITION */}
          <section className="space-y-8">
            <h2 className="text-4xl md:text-6xl font-black uppercase italic text-white">
              No <span className="text-brand-yellow">Competition.</span>
            </h2>
            <p className="text-white/50 font-bold italic text-lg">Gledališka comedy rights. From one producer to another.</p>
            <div className="overflow-x-auto">
              <table className="w-full border-4 border-white text-sm">
                <thead>
                  <tr className="bg-white text-black">
                    <th className="p-4 text-left font-black uppercase italic text-xs tracking-widest"></th>
                    <th className="p-4 text-center font-black uppercase italic text-xs tracking-widest text-brand-pink">Old Model<br/>(Agents/Agencies)</th>
                    <th className="p-4 text-center font-black uppercase italic text-xs tracking-widest text-gray-500">MTI / Samuel French</th>
                    <th className="p-4 text-center font-black uppercase italic text-xs tracking-widest bg-brand-yellow text-black">HahaHub ✓</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {[
                    ['International', '✗', '✗', '✓'],
                    ['Comedy focus', '✗', '✗', '✓'],
                    ['P2P direct', '✗', '✗', '✓'],
                    ['No commission', '✗', '✗', '✓'],
                    ['Transparent data', '✗', 'Partial', '✓'],
                    ['Buy + sell', 'Buy only', 'Buy only', '✓'],
                  ].map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-brand-surface' : 'bg-brand-black'}>
                      <td className="p-4 font-black uppercase italic text-white/60 text-xs">{row[0]}</td>
                      <td className="p-4 text-center font-black text-brand-pink">{row[1]}</td>
                      <td className="p-4 text-center font-black text-white/40">{row[2]}</td>
                      <td className="p-4 text-center font-black text-brand-cyan">{row[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>



          {/* FEE & RIGHTS */}
          <section className="space-y-8 md:space-y-12">
            <div className="flex items-center gap-6">
              <h2 className="text-4xl md:text-7xl font-black uppercase italic text-white whitespace-nowrap">
                FEE <span className="text-brand-pink">&</span> RIGHTS
              </h2>
              <div className="h-2 flex-1 bg-white/10"></div>
            </div>

            <div className="bg-white text-black border-8 border-black p-6 md:p-16 shadow-neo-yellow">
              <div className="space-y-10 md:space-y-12">
                <div>
                  <h3 className="text-2xl md:text-3xl font-black uppercase italic mb-4 border-l-8 border-black pl-4">HOW DEALS WORK</h3>
                  <p className="text-base md:text-xl font-bold leading-relaxed italic">
                    All collaborations follow a pre-aligned commercial framework. Final terms are agreed directly between producers. HahaHub sets the benchmark for transparency.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
                  {[
                    { color: 'brand-pink', label: 'Royalty Standards', value: '5–10% GBO', desc: 'Typical range based on gross box office revenue.' },
                    { color: 'brand-cyan', label: 'Minimum Guarantee', value: '€2K – €10K', desc: 'Recoupable advance against royalties.' },
                    { color: 'brand-yellow', label: 'License Scope', value: 'Per Territory', desc: 'Licensed per term, with optional exclusivity.' },
                  ].map((item, i) => (
                    <div key={i} className="bg-gray-100 p-6 md:p-8 border-4 border-black shadow-[4px_4px_0px_black]">
                      <h4 className={`font-black text-${item.color} uppercase tracking-widest text-xs mb-4 italic`}>{item.label}</h4>
                      <p className="text-xl md:text-2xl font-black italic mb-2 uppercase">{item.value}</p>
                      <p className="text-xs font-bold italic text-gray-500">{item.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-brand-black text-white p-6 md:p-10 border-4 border-black shadow-neo-cyan">
                  <p className="text-base md:text-lg font-bold italic leading-relaxed text-center">
                    HahaHub does not set prices but ensures shared definitions, reporting standards, and transparency to remove friction from international theatrical production.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* COPYRIGHT */}
          <section className="space-y-8 bg-brand-surface border-4 border-white/20 p-6 md:p-12 shadow-neo-cyan">
            <h2 className="text-3xl md:text-4xl font-black uppercase italic text-brand-cyan border-b-2 border-brand-cyan/20 pb-4">Copyright and Licensing</h2>
            <div className="space-y-6 text-gray-300 font-bold italic leading-relaxed">
              <p>All content on this site is protected by copyright. Each production is published only with the permission of its legitimate copyright holder.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 pt-4">
                {[
                  { label: 'Metadata Field 01', text: 'Name of the copyright holder' },
                  { label: 'Metadata Field 02', text: 'Type of rights (copyright, performance license)' },
                  { label: 'Metadata Field 03', text: 'Date and duration of the license' },
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

          {/* CTA */}
          <section className="py-12 md:py-20 text-center border-t-4 border-white/10">
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
