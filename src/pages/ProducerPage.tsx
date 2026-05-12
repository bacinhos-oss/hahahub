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

// Instagram-style badge component
const Badge: React.FC<{ type: string; size?: 'sm' | 'md' | 'lg' }> = ({ type, size = 'md' }) => {
  const sizes = { sm: 'w-5 h-5 text-[8px]', md: 'w-7 h-7 text-[10px]', lg: 'w-10 h-10 text-sm' };
  const s = sizes[size];

  if (type === 'verified') return (
    <div className={`${s} rounded-full bg-brand-cyan border-2 border-black flex items-center justify-center flex-shrink-0`} title="Verified">
      <span className="material-symbols-outlined text-black font-black" style={{fontSize: size === 'lg' ? '16px' : '10px'}}>check</span>
    </div>
  );
  if (type === 'founding') return (
    <div className={`${s} rounded-full bg-brand-yellow border-2 border-black flex items-center justify-center flex-shrink-0`} title="Founding Producer">
      <span className="material-symbols-outlined text-black font-black" style={{fontSize: size === 'lg' ? '16px' : '10px'}}>star</span>
    </div>
  );
  if (type === 'roar') return (
    <div className={`${s} rounded-full bg-brand-pink border-2 border-black flex items-center justify-center flex-shrink-0`} title="ROAR Member">
      <span className="material-symbols-outlined text-white font-black" style={{fontSize: size === 'lg' ? '16px' : '10px'}}>bolt</span>
    </div>
  );
  if (type === 'laff') return (
    <div className={`${s} rounded-full bg-white border-2 border-black flex items-center justify-center flex-shrink-0`} title="LAFF Member">
      <span className="material-symbols-outlined text-black font-black" style={{fontSize: size === 'lg' ? '16px' : '10px'}}>music_note</span>
    </div>
  );
  if (type === 'active') return (
    <div className={`${s} rounded-full bg-green-500 border-2 border-black flex items-center justify-center flex-shrink-0`} title="Active Producer">
      <span className="material-symbols-outlined text-white font-black" style={{fontSize: '10px'}}>trending_up</span>
    </div>
  );
  if (type === 'international') return (
    <div className={`${s} rounded-full bg-blue-500 border-2 border-black flex items-center justify-center flex-shrink-0`} title="International">
      <span className="material-symbols-outlined text-white font-black" style={{fontSize: '10px'}}>language</span>
    </div>
  );
  return null;
};

const ProducerPage: React.FC<ProducerPageProps> = ({ onNavigate, onLogout, user, producerId, shows, onUpdateStats }) => {
  const [producer, setProducer] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!producerId) { setLoading(false); return; }
    const load = async () => {
      const [{ data: profileData }, { data: postsData }] = await Promise.all([
        supabase.from('profiles').select('id, name, email, is_verified, is_founding, is_paid, created_at, bio, website, location_city, festivals, avatar_url, user_type').eq('id', producerId).maybeSingle(),
        supabase.from('posts').select('*').eq('user_id', producerId).order('created_at', { ascending: false }).limit(5),
      ]);
      setProducer(profileData);
      setPosts(postsData || []);
      setLoading(false);
    };
    load();
  }, [producerId]);

  const producerShows = shows.filter(s => (s as any).user_id === producerId);
  const totalViews = producerShows.reduce((sum, s) => sum + (s.viewsCount || 0), 0);
  const totalInquiries = producerShows.reduce((sum, s) => sum + (s.inquiriesCount || 0), 0);
  const countriesCount = producerShows.reduce((acc, s) => {
    if (s.licensedCountries) s.licensedCountries.split(',').forEach((c: string) => acc.add(c.trim()));
    return acc;
  }, new Set()).size;

  const getBadges = () => {
    if (!producer) return [];
    const b = [];
    if (producer.is_verified || producer.user_type === 'roar') b.push('verified');
    if (producer.is_founding) b.push('founding');
    if (producer.user_type === 'roar') b.push('roar');
    else if (producer.is_paid) b.push('laff');
    if (posts.length >= 5) b.push('active');
    if (countriesCount >= 3) b.push('international');
    return b;
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    return `${days}d ago`;
  };

  const POST_COLORS: Record<string, string> = {
    new_show: 'bg-brand-yellow text-black',
    discount: 'bg-brand-pink text-white',
    co_production: 'bg-brand-cyan text-black',
    news: 'bg-white text-black',
    rights: 'bg-brand-yellow text-black',
  };
  const POST_LABELS: Record<string, string> = {
    new_show: 'NEW SHOW', discount: 'DISCOUNT', co_production: 'CO-PRODUCTION', news: 'NEWS', rights: 'RIGHTS',
  };

  if (loading) return (
    <div className="flex flex-col min-h-screen bg-brand-black">
      <Navigation activePage="discovery" onNavigate={onNavigate} onLogout={onLogout} user={user} />
      <main className="pt-40 flex-1 flex items-center justify-center">
        <p className="text-white/20 font-black uppercase italic tracking-widest animate-pulse">Loading producer...</p>
      </main>
    </div>
  );

  if (!producer) return (
    <div className="flex flex-col min-h-screen bg-brand-black">
      <Navigation activePage="discovery" onNavigate={onNavigate} onLogout={onLogout} user={user} />
      <main className="pt-40 flex-1 flex flex-col items-center justify-center gap-4">
        <h1 className="text-6xl font-black uppercase italic text-white">SHUSH.</h1>
        <p className="text-white/40 font-bold italic">Producer not found.</p>
        <button onClick={() => onNavigate('discovery')} className="mt-4 bg-brand-yellow text-black px-8 py-3 font-black uppercase italic border-4 border-black">← Back to Catalog</button>
      </main>
    </div>
  );

  const badges = getBadges();

  return (
    <div className="flex flex-col min-h-screen bg-brand-black">
      <Navigation activePage="discovery" onNavigate={onNavigate} onLogout={onLogout} user={user} />

      <main className="pt-32 pb-20 px-4 md:px-12 flex-1">
        <div className="max-w-5xl mx-auto space-y-12">

          {/* PROFILE HERO */}
          <section className="flex flex-col md:flex-row items-start gap-8 md:gap-12">
            
            {/* AVATAR */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 border-4 border-white overflow-hidden bg-brand-surface flex items-center justify-center">
                  {producer.avatar_url ? (
                    <img src={producer.avatar_url} alt={producer.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl font-black uppercase italic text-white/20">{producer.name?.[0]}</span>
                  )}
                </div>
                {/* Badges around avatar */}
                {badges.length > 0 && (
                  <div className="absolute -bottom-3 -right-3 flex gap-1">
                    {badges.slice(0, 3).map(b => <Badge key={b} type={b} size="md" />)}
                  </div>
                )}
              </div>
            </div>

            {/* INFO */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3 flex-wrap mb-2">
                <h1 className="text-4xl md:text-6xl font-black uppercase italic text-white leading-none tracking-tighter">
                  {producer.name}
                </h1>
                {/* Inline badges */}
                <div className="flex items-center gap-1 mt-2">
                  {badges.map(b => <Badge key={b} type={b} size="sm" />)}
                </div>
              </div>

              {/* Badge legend */}
              {badges.length > 0 && (
                <div className="flex gap-3 flex-wrap mb-4">
                  {badges.includes('verified') && <span className="text-[9px] font-black uppercase italic text-brand-cyan">✓ Verified</span>}
                  {badges.includes('founding') && <span className="text-[9px] font-black uppercase italic text-brand-yellow">★ Founding</span>}
                  {badges.includes('roar') && <span className="text-[9px] font-black uppercase italic text-brand-pink">⚡ ROAR</span>}
                  {badges.includes('laff') && <span className="text-[9px] font-black uppercase italic text-white/60">♪ LAFF</span>}
                  {badges.includes('active') && <span className="text-[9px] font-black uppercase italic text-green-400">↑ Active</span>}
                  {badges.includes('international') && <span className="text-[9px] font-black uppercase italic text-blue-400">🌍 International</span>}
                </div>
              )}

              {/* Location + website */}
              <div className="flex items-center gap-4 flex-wrap mb-4">
                {producer.location_city && (
                  <span className="text-white/40 text-xs font-bold italic flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">location_on</span>{producer.location_city}
                  </span>
                )}
                {producer.website && (
                  <a href={producer.website} target="_blank" rel="noopener noreferrer" className="text-brand-cyan text-xs font-bold italic hover:text-white transition-colors flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">language</span>
                    {producer.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>

              {/* Bio */}
              {producer.bio && (
                <p className="text-white/60 font-bold italic leading-relaxed text-sm max-w-xl mb-4">{producer.bio}</p>
              )}

              {/* Festivals */}
              {producer.festivals && (
                <div className="border-l-4 border-brand-yellow pl-4 mb-6">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30 italic mb-1">Festivals & Credits</p>
                  <p className="text-white/50 font-bold italic text-xs">{producer.festivals}</p>
                </div>
              )}

              {/* Stats */}
              <div className="flex gap-6 md:gap-10">
                <div>
                  <div className="text-3xl font-black text-brand-yellow">{producerShows.length}</div>
                  <p className="text-white/30 text-[9px] font-black uppercase italic">Shows</p>
                </div>
                <div>
                  <div className="text-3xl font-black text-brand-cyan">{totalViews.toLocaleString()}</div>
                  <p className="text-white/30 text-[9px] font-black uppercase italic">Views</p>
                </div>
                <div>
                  <div className="text-3xl font-black text-brand-pink">{totalInquiries}</div>
                  <p className="text-white/30 text-[9px] font-black uppercase italic">Inquiries</p>
                </div>
                {countriesCount > 0 && (
                  <div>
                    <div className="text-3xl font-black text-white">{countriesCount}</div>
                    <p className="text-white/30 text-[9px] font-black uppercase italic">Countries</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* CONTACT */}
          <div className="flex gap-4 flex-wrap">
            {user?.isPaid && producer.email ? (
              <a href={`mailto:${producer.email}`} className="bg-brand-yellow text-black px-8 py-3 font-black uppercase italic border-4 border-black hover:bg-white transition-all text-sm shadow-[4px_4px_0px_black]">
                Tickle This Producer →
              </a>
            ) : !user?.isPaid ? (
              <button onClick={() => onNavigate('pricing')} className="bg-brand-yellow text-black px-8 py-3 font-black uppercase italic border-4 border-black hover:bg-white transition-all text-sm">
                Unlock Contact — LAFF →
              </button>
            ) : null}
            <button onClick={() => onNavigate('discovery')} className="px-8 py-3 font-black uppercase italic border-4 border-white/20 text-white/40 hover:border-white hover:text-white transition-all text-sm">
              ← Back to Catalog
            </button>
          </div>

          {/* SHOWS */}
          {producerShows.length > 0 && (
            <section>
              <h2 className="text-3xl md:text-5xl font-black uppercase italic text-white mb-6 tracking-tighter">
                Shows in <span className="text-brand-yellow">The Laff Exchange</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {producerShows.map(show => (
                  <div key={show.id} onClick={() => { onNavigate('discovery'); onUpdateStats(show.id, 'view'); }}
                    className="group cursor-pointer bg-brand-surface border-4 border-white/20 hover:border-brand-yellow transition-all overflow-hidden">
                    <div className="h-48 relative overflow-hidden">
                      {show.imageUrl ? (
                        <img src={show.imageUrl} alt={show.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                      ) : (
                        <div className="w-full h-full bg-brand-black flex items-center justify-center">
                          <span className="text-white/10 font-black text-5xl uppercase italic">{show.title[0]}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 p-4">
                        <p className="text-brand-pink text-[9px] font-black uppercase italic tracking-widest">{show.genre}</p>
                        <h3 className="font-black uppercase italic text-white text-base leading-tight group-hover:text-brand-yellow transition-colors">{show.title}</h3>
                        <p className="text-white/40 text-[10px] mt-0.5">{show.location} · {show.productionYear}</p>
                      </div>
                    </div>
                    <div className="px-4 py-3 border-t-4 border-white/20 flex items-center justify-between">
                      <div className="flex gap-3">
                        <span className="text-[10px] text-white/30 font-bold">{show.viewsCount} views</span>
                        <span className="text-[10px] text-white/30 font-bold">{show.likesCount} likes</span>
                      </div>
                      <span className="text-[9px] font-black uppercase italic text-brand-yellow">Open →</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* WIRE POSTS */}
          {posts.length > 0 && (
            <section>
              <h2 className="text-3xl font-black uppercase italic text-white mb-6 tracking-tighter">
                On <span className="text-brand-pink">The Laff Wire</span>
              </h2>
              <div className="space-y-3">
                {posts.map(post => (
                  <div key={post.id} className="border-4 border-white/20 p-5 hover:border-brand-yellow transition-all">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-[8px] font-black uppercase italic px-2 py-1 border-2 border-black ${POST_COLORS[post.type] || 'bg-white text-black'}`}>
                        {POST_LABELS[post.type] || 'POST'}
                      </span>
                      <span className="text-white/20 text-[10px] font-black italic">{timeAgo(post.created_at)}</span>
                    </div>
                    <p className="text-white/70 font-bold italic text-sm leading-relaxed">{post.content}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default ProducerPage;
