import React, { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Page, User, Show } from '../types';
import { supabase } from '../lib/supabase';

interface ProducerPageProps {
  onNavigate: (page: Page) => void;
  onLogout?: () => void;
  user?: User;
  producerId?: string;
  shows: Show[];
  onUpdateStats: (showId: string, type: 'view' | 'inquiry') => void;
}

const ProducerPage: React.FC<ProducerPageProps> = ({ onNavigate, onLogout, user, producerId, shows, onUpdateStats }) => {
  const [producer, setProducer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!producerId) return;
    const load = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, name, email, is_verified, is_founding, is_paid, created_at, bio, website, location_city, festivals')
        .eq('id', producerId)
        .maybeSingle();
      setProducer(data);
      setLoading(false);
    };
    load();
  }, [producerId]);

  const producerShows = shows.filter(s => s.userId === producerId || (s as any).user_id === producerId);
  const totalViews = producerShows.reduce((sum, s) => sum + (s.viewsCount || 0), 0);
  const totalInquiries = producerShows.reduce((sum, s) => sum + (s.inquiriesCount || 0), 0);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-brand-black">
        <Navigation activePage="discovery" onNavigate={onNavigate} onLogout={onLogout} user={user} />
        <main className="pt-40 flex-1 flex items-center justify-center">
          <p className="text-white/20 font-black uppercase italic tracking-widest text-sm">Loading producer...</p>
        </main>
      </div>
    );
  }

  if (!producer) {
    return (
      <div className="flex flex-col min-h-screen bg-brand-black">
        <Navigation activePage="discovery" onNavigate={onNavigate} onLogout={onLogout} user={user} />
        <main className="pt-40 flex-1 flex flex-col items-center justify-center gap-4">
          <h1 className="text-6xl font-black uppercase italic text-white">SHUSH.</h1>
          <p className="text-white/40 font-bold italic">Producer not found.</p>
          <button onClick={() => onNavigate('discovery')} className="mt-4 bg-brand-yellow text-black px-8 py-3 font-black uppercase italic border-4 border-black">Back to The Laff Exchange →</button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-brand-black">
      <Navigation activePage="discovery" onNavigate={onNavigate} onLogout={onLogout} user={user} />

      <main className="pt-32 pb-20 px-4 md:px-12 flex-1">
        <div className="max-w-6xl mx-auto space-y-16">

          {/* PRODUCER HERO */}
          <section className="border-8 border-white p-8 md:p-16 shadow-neo-yellow">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-8 justify-between">
              <div>
                <span className="text-brand-cyan text-[10px] font-black uppercase tracking-[0.5em] italic block mb-3">Producer Profile</span>
                <h1 className="text-5xl md:text-8xl font-black uppercase italic text-white leading-[0.85] tracking-tighter mb-4">
                  {producer.name}
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  {producer.is_founding && (
                    <span className="bg-brand-yellow text-black px-3 py-1 text-xs font-black uppercase italic border-2 border-black">FOUNDING PRODUCER</span>
                  )}
                  {producer.is_verified && (
                    <span className="bg-brand-cyan text-black px-3 py-1 text-xs font-black uppercase italic border-2 border-black">VERIFIED</span>
                  )}
                  {producer.is_paid && !producer.is_founding && (
                    <span className="bg-white text-black px-3 py-1 text-xs font-black uppercase italic border-2 border-black">PRO MEMBER</span>
                  )}
                </div>
              </div>

              {/* STATS */}
              <div className="flex gap-6 md:gap-10">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-black text-brand-yellow">{producerShows.length}</div>
                  <p className="text-white/40 text-[9px] font-black uppercase italic tracking-widest mt-1">Shows</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-black text-brand-cyan">{totalViews.toLocaleString()}</div>
                  <p className="text-white/40 text-[9px] font-black uppercase italic tracking-widest mt-1">Views</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-black text-brand-pink">{totalInquiries}</div>
                  <p className="text-white/40 text-[9px] font-black uppercase italic tracking-widest mt-1">Inquiries</p>
                </div>
              </div>
            </div>

            {/* CONTACT */}
            {user?.isPaid && producer.email && (
              <div className="mt-8 pt-8 border-t-4 border-white/20 flex items-center gap-4">
                <a
                  href={`mailto:${producer.email}`}
                  className="bg-brand-yellow text-black px-8 py-3 font-black uppercase italic border-4 border-black hover:bg-white transition-all text-sm"
                >
                  Contact Producer →
                </a>
                <p className="text-white/30 text-xs font-bold italic">Direct contact — no agents</p>
              </div>
            )}
            {!user?.isPaid && (
              <div className="mt-8 pt-8 border-t-4 border-white/20">
                <button onClick={() => onNavigate('pricing')} className="bg-brand-yellow text-black px-8 py-3 font-black uppercase italic border-4 border-black hover:bg-white transition-all text-sm">
                  Unlock Contact Info — Pro →
                </button>
              </div>
            )}
          </section>

          {/* PRODUCER SHOWS */}
          <section>
            <h2 className="text-4xl md:text-6xl font-black uppercase italic text-white mb-8 tracking-tighter">
              Shows in <span className="text-brand-yellow">The Laff Exchange</span>
            </h2>
            {producerShows.length === 0 ? (
              <p className="text-white/30 font-bold italic">No shows listed yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {producerShows.map(show => (
                  <div
                    key={show.id}
                    onClick={() => { onNavigate('discovery'); onUpdateStats(show.id, 'view'); }}
                    className="group cursor-pointer bg-brand-surface border-4 border-white/20 hover:border-brand-yellow transition-all overflow-hidden"
                  >
                    <div className="aspect-[2/3] relative overflow-hidden">
                      {show.imageUrl ? (
                        <img src={show.imageUrl} alt={show.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                      ) : (
                        <div className="w-full h-full bg-brand-black flex items-center justify-center">
                          <span className="text-white/10 font-black text-5xl uppercase italic">{show.title[0]}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-transparent"></div>
                      <div className="absolute bottom-0 left-0 p-4 w-full">
                        <p className="text-brand-pink text-[9px] font-black uppercase italic tracking-widest mb-1">{show.genre}</p>
                        <h3 className="font-black uppercase italic text-white text-lg leading-tight group-hover:text-brand-yellow transition-colors">{show.title}</h3>
                        <p className="text-white/40 text-[10px] font-bold mt-1">{show.location} · {show.productionYear}</p>
                      </div>
                    </div>
                    <div className="p-4 border-t-4 border-white/20 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-white/40">{show.viewsCount} views</span>
                        <span className="text-[10px] font-black text-white/40">{show.likesCount} likes</span>
                      </div>
                      <span className="text-[9px] font-black uppercase italic text-brand-yellow">Open →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* BACK */}
          <div>
            <button onClick={() => onNavigate('discovery')} className="text-white/40 font-black uppercase italic text-xs hover:text-white transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to The Laff Exchange
            </button>
          </div>

        </div>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default ProducerPage;
