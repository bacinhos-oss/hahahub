
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

  const handlePlanSelect = (name: string, price: string) => {
    setSelectedPlan({ name, price });
  };

  const teaserShows = shows.slice(0, 4); // Take first 4 shows for teaser

  return (
    <div className="flex flex-col w-full relative bg-brand-black">
      <PaymentModal 
        isOpen={!!selectedPlan}
        planName={selectedPlan?.name || ''}
        price={selectedPlan?.price || ''}
        onClose={() => setSelectedPlan(null)}
        onSuccess={() => {
          onPurchaseSuccess(selectedPlan?.name || 'Annual Pass');
          setSelectedPlan(null);
        }}
      />

      <header className="fixed top-0 z-50 w-full bg-brand-black/90 backdrop-blur-md px-6 md:px-12 py-4 border-b-4 border-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div 
            onClick={() => onNavigate('landing')}
            className="logo-text text-white text-3xl md:text-5xl uppercase tracking-tighter cursor-pointer"
          >
            HahaHub
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => onNavigate('discovery')}
              className="hidden md:block text-xs font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors italic"
            >
              Catalog
            </button>
            <button 
              onClick={() => onNavigate('login')}
              className="bg-white text-black font-black px-8 py-2 text-sm uppercase border-2 border-black hover:bg-brand-yellow transition-all shadow-neo-magenta italic"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      <main className="pt-24 md:pt-40">
        {/* HERO SECTION */}
        <section className="px-4 md:px-12 py-10 md:py-20 flex flex-col items-start max-w-7xl mx-auto">
          <div className="space-y-4 mb-8">
            <span className="bg-brand-pink text-white px-4 py-1 text-xs font-black uppercase tracking-[0.4em] rotate-[-2deg] inline-block italic">The Stage Is Yours</span>
          </div>
          <h1 className="font-display text-white text-4xl sm:text-6xl md:text-8xl lg:text-[100px] leading-[0.85] tracking-tighter uppercase mb-8 md:mb-16 italic">
            INTERNATIONAL <br/>
            <span className="text-brand-yellow">THEATRE COMEDY</span> <br/>
            <span className="text-brand-cyan">PRODUCERS PLATFORM</span>
          </h1>
          <div className="max-w-2xl border-l-8 border-brand-pink pl-8 space-y-10">
            <p className="text-2xl md:text-3xl font-bold leading-tight text-white/80 italic">
              An explosive digital destination for international producers to find, license, and stage the world's funniest scripts.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <button 
                onClick={() => onNavigate('discovery')}
                className="bg-brand-yellow text-black px-12 py-6 text-2xl font-black uppercase tracking-tighter border-4 border-white shadow-neo-white hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all"
              >
                Enter Archive
              </button>
              <button 
                onClick={() => { document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="text-white border-b-4 border-brand-cyan pb-1 text-2xl font-black uppercase hover:text-brand-cyan transition-all italic"
              >
                View Plans
              </button>
            </div>
          </div>
        </section>

        {/* TEASER CATALOG SECTION */}
        <section className="px-6 md:px-12 py-24 bg-brand-surface border-y-8 border-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 select-none pointer-events-none">
             <span className="text-[200px] font-black uppercase leading-none italic">CONFIDENTIAL</span>
          </div>
          
          <div className="max-w-7xl mx-auto space-y-16 relative">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
               <div className="space-y-4">
                  <span className="text-brand-cyan text-xs font-black uppercase tracking-[0.5em] italic">Sector 01 // Leaked Assets</span>
                  <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white leading-[0.9]">
                    LATEST <br/> <span className="text-brand-pink">DEPLOYMENTS</span>
                  </h2>
               </div>
               <button 
                 onClick={() => onNavigate('discovery')}
                 className="text-white font-black uppercase border-b-4 border-brand-yellow pb-1 italic hover:text-brand-yellow transition-all"
               >
                 Explore Entire Library
               </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {teaserShows.map((show) => (
                <div 
                  key={show.id} 
                  onMouseEnter={() => setTeaserLock(show.id)}
                  onMouseLeave={() => setTeaserLock(null)}
                  onClick={() => onNavigate('login')}
                  className="group relative bg-brand-black border-4 border-white aspect-[4/6] cursor-pointer overflow-hidden transition-all hover:shadow-neo-yellow hover:translate-x-[-4px] hover:translate-y-[-4px]"
                >
                   <img 
                     src={show.imageUrl} 
                     className="w-full h-full object-cover transition-all grayscale group-hover:grayscale-0 scale-105 group-hover:scale-110" 
                     alt={show.title} 
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                   
                   <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-brand-pink text-white px-6 py-3 border-4 border-black font-black uppercase italic rotate-[-5deg] shadow-neo-white">
                        Access Locked
                      </div>
                      <p className="mt-4 text-[10px] font-black text-white uppercase tracking-widest bg-black/60 px-2">Producer Registration Req.</p>
                   </div>

                   <div className="absolute bottom-0 left-0 p-6 w-full">
                      <p className="text-brand-cyan text-[10px] font-black uppercase tracking-widest italic mb-2">{show.location} // {show.genre}</p>
                      <h3 className="text-xl font-black uppercase italic leading-none text-white">{show.title}</h3>
                   </div>
                </div>
              ))}
            </div>

            <div className="bg-brand-black border-4 border-white p-8 md:p-12 text-center space-y-6 relative group overflow-hidden">
               <div className="absolute inset-0 bg-brand-yellow/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700"></div>
               <div className="relative z-10">
                 <h3 className="text-3xl font-black uppercase italic leading-none mb-4">WANT TO VIEW THE <span className="text-brand-yellow">FULL DOSSIERS?</span></h3>
                 <p className="text-gray-400 font-bold italic max-w-xl mx-auto mb-8">
                   HaHaHub provides complete commercial data, technical riders, and full script access to verified theatre producers.
                 </p>
                 <button 
                   onClick={() => onNavigate('login')}
                   className="bg-brand-pink text-white px-10 py-5 font-black uppercase italic border-4 border-black shadow-neo-cyan hover:bg-black transition-all"
                 >
                   Verify Your Producer Identity
                 </button>
               </div>
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="px-6 md:px-12 py-24 border-b-8 border-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-6">
              <div className="w-16 h-16 bg-brand-cyan flex items-center justify-center border-4 border-black shadow-neo-magenta rotate-3">
                <span className="material-symbols-outlined text-black text-3xl font-black">search</span>
              </div>
              <h3 className="text-3xl font-black uppercase italic text-white">Advanced Search</h3>
              <p className="text-gray-400 font-bold italic">Filter by gender roles, genre, and production history to find the perfect fit.</p>
            </div>
            <div className="space-y-6">
              <div className="w-16 h-16 bg-brand-yellow flex items-center justify-center border-4 border-black shadow-neo-cyan -rotate-3">
                <span className="material-symbols-outlined text-black text-3xl font-black">verified</span>
              </div>
              <h3 className="text-3xl font-black uppercase italic text-white">Direct Licensing</h3>
              <p className="text-gray-400 font-bold italic">Transparent contracts and direct contact with rights holders. No middlemen.</p>
            </div>
            <div className="space-y-6">
              <div className="w-16 h-16 bg-brand-pink flex items-center justify-center border-4 border-black shadow-neo-yellow rotate-6">
                <span className="material-symbols-outlined text-black text-3xl font-black">public</span>
              </div>
              <h3 className="text-3xl font-black uppercase italic text-white">Global Reach</h3>
              <p className="text-gray-400 font-bold italic">Scripts from every continent, translated and ready for your stage.</p>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section className="px-6 md:px-12 py-32" id="pricing">
          <div className="max-w-6xl mx-auto flex flex-col items-center">
            <h2 className="font-display text-white text-6xl md:text-8xl uppercase mb-24 text-center">Get <span className="text-brand-pink">The Keys</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 w-full max-w-4xl">
              <div className="bg-brand-surface border-4 border-white p-12 shadow-neo-white">
                <h3 className="text-3xl font-black mb-4 uppercase italic">Quarterly</h3>
                <div className="text-5xl font-black text-brand-yellow mb-10">€59 <span className="text-sm text-gray-500">/ 3 MO</span></div>
                <button onClick={() => handlePlanSelect('Quarterly Pass', '€59')} className="w-full py-5 border-4 border-white text-white font-black uppercase hover:bg-white hover:text-black transition-all italic">PayPal Express</button>
              </div>
              <div className="bg-white border-4 border-white p-12 shadow-neo-magenta scale-105">
                <h3 className="text-3xl font-black mb-4 uppercase italic text-black">Annual Pro</h3>
                <div className="text-5xl font-black text-brand-pink mb-10">€99 <span className="text-sm text-gray-500">/ YEAR</span></div>
                <button onClick={() => handlePlanSelect('Annual Pass', '€99')} className="w-full py-5 bg-brand-pink text-white border-4 border-black font-black uppercase hover:bg-black transition-all shadow-neo-cyan italic">PayPal Express</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default LandingPage;
