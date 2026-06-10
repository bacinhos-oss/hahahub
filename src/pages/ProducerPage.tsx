import React, { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Avatar, Badge, getProfileBadges } from '../components/Badge';
import { Page, User, Show } from '../types';
import { supabase } from '../lib/supabase';

interface ProducerPageProps {
  onNavigate: (page: Page) => void;
  onLogout?: () => void;
  user?: User;
  producerId?: string;
  shows: Show[];
  onUpdateStats: (showId: string, type: 'view' | 'inquiry') => void;
  onViewShow?: (showId: string) => void;
}

const ProducerPage: React.FC<ProducerPageProps> = ({ onNavigate, onLogout, user, producerId, shows, onUpdateStats, onViewShow }) => {
  const [producer, setProducer] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'shows' | 'wire'>('shows');

  useEffect(() => {
    if (!producerId) { setLoading(false); return; }
    const load = async () => {
      const [{ data: profileData }, { data: postsData }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', producerId).maybeSingle(),
        supabase.from('posts').select('*').eq('user_id', producerId).order('created_at', { ascending: false }).limit(10),
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
    if (s.licensedCountries) s.licensedCountries.split(',').forEach((c: string) => { if (c.trim()) acc.add(c.trim()); });
    return acc;
  }, new Set()).size;

  const badges = producer ? getProfileBadges(producer, posts.length, countriesCount) : [];

  const POST_COLORS: Record<string, string> = {
    new_show: 'bg-brand-yellow text-black', discount: 'bg-brand-pink text-white',
    co_production: 'bg-brand-cyan text-black', news: 'bg-white text-black', rights: 'bg-brand-yellow text-black',
  };
  const POST_LABELS: Record<string, string> = {
    new_show: 'NEW SHOW', discount: 'DISCOUNT', co_production: 'CO-PRODUCTION', news: 'NEWS', rights: 'RIGHTS',
  };

  const timeAgo = (d: string) => {
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s/60) + 'm ago';
    if (s < 86400) return Math.floor(s/3600) + 'h ago';
    return Math.floor(s/86400) + 'd ago';
  };

  if (loading) return (
    <div className="flex flex-col min-h-screen bg-brand-black">
      <Navigation activePage="discovery" onNavigate={onNavigate} onLogout={onLogout} user={user} />
      <main className="pt-40 flex-1 flex items-center justify-center">
        <p className="text-white/20 font-black uppercase italic tracking-widest animate-pulse">Loading...</p>
      </main>
    </div>
  );

  if (!producer) return (
    <div className="flex flex-col min-h-screen bg-brand-black">
      <Navigation activePage="discovery" onNavigate={onNavigate} onLogout={onLogout} user={user} />
      <main className="pt-40 flex-1 flex flex-col items-center justify-center gap-4">
        <h1 className="text-6xl font-black uppercase italic text-white">SHUSH.</h1>
        <p className="text-white/40 font-bold italic">Producer not found.</p>
        <button onClick={() => onNavigate('discovery')} className="mt-4 bg-brand-yellow text-black px-8 py-3 font-black uppercase italic border-4 border-black">← Back</button>
      </main>
    </div>
  );

  const isOwnProfile = user?.id === producerId;

  return (
    <div className="flex flex-col min-h-screen bg-brand-black">
      <Navigation activePage="discovery" onNavigate={onNavigate} onLogout={onLogout} user={user} />

      <main className="pt-16 pb-20 flex-1">

        {/* BACK */}
        <div className="px-4 md:px-8 pt-4 pb-2 max-w-4xl mx-auto w-full">
          <button onClick={() => onNavigate('discovery')}
            className="text-white/40 hover:text-white font-black uppercase italic text-xs transition-all">
            ← Back
          </button>
        </div>

        <div className="max-w-4xl mx-auto px-4 md:px-8">

          {/* PROFILE HEADER */}
          <div className="relative mb-6">
            <div className="flex flex-col md:flex-row items-end gap-4 md:gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-brand-black overflow-hidden bg-brand-surface flex items-center justify-center"
                    style={{ boxShadow: badges.includes('verified') ? '0 0 0 4px #03DAC6' : badges.includes('founding') ? '0 0 0 4px #FFDE03' : '0 0 0 4px white' }}>
                    {producer.avatar_url ? (
                      <img src={producer.avatar_url} alt={producer.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl md:text-5xl font-black uppercase text-white/30 italic">{producer.name?.[0]}</span>
                    )}
                  </div>
                  {/* Primary badge */}
                  {badges.length > 0 && (
                    <div className="absolute bottom-0 right-0 translate-x-1 translate-y-1">
                      <Badge type={badges[0]} size="md" />
                    </div>
                  )}
                </div>
              </div>

              {/* Name + badges + actions */}
              <div className="flex-1 min-w-0 pt-2">
                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-3xl md:text-5xl font-black uppercase italic text-white tracking-tighter leading-none">
                        {producer.name}
                      </h1>
                      {/* All badges inline */}
                      <div className="flex gap-1">
                        {badges.map(b => <Badge key={b} type={b} size="sm" />)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {badges.map(b => <Badge key={b} type={b} size="xs" showLabel />)}
                    </div>
                    {producer.location_city && (
                      <p className="text-white/30 text-xs font-bold italic mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        {producer.location_city}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 flex-shrink-0 flex-wrap">
                    {isOwnProfile ? (
                      <button onClick={() => onNavigate('subscription')}
                        className="px-5 py-2 border-4 border-white text-white font-black uppercase italic text-xs hover:bg-white hover:text-black transition-all">
                        Edit Profile
                      </button>
                    ) : user?.isPaid ? (
                      producer.email ? (
                        <div className="flex items-center gap-2 border-4 border-brand-yellow p-3 bg-brand-surface">
                          <span className="text-white font-black italic text-xs truncate max-w-[160px]">{producer.email}</span>
                          <button
                            onClick={() => { navigator.clipboard.writeText(producer.email); }}
                            className="flex-shrink-0 bg-brand-yellow text-black px-3 py-1 font-black uppercase italic text-xs border-2 border-black hover:bg-white transition-all flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">content_copy</span>
                            Copy
                          </button>
                        </div>
                      ) : (
                        <span className="px-5 py-2 border-4 border-white/20 text-white/30 font-black uppercase italic text-xs">
                          No contact info
                        </span>
                      )
                    ) : !user ? (
                      <button onClick={() => onNavigate('login')}
                        className="px-5 py-2 bg-brand-yellow text-black border-4 border-black font-black uppercase italic text-xs hover:bg-white transition-all">
                        Sign In →
                      </button>
                    ) : (
                      <button onClick={() => onNavigate('pricing')}
                        className="px-5 py-2 bg-brand-yellow text-black border-4 border-black font-black uppercase italic text-xs hover:bg-white transition-all">
                        LAFF+ to Contact →
                      </button>
                    )}
                    {/* Add to HAHAfriends */}
                    {user && !isOwnProfile && (
                      <button onClick={async () => {
                        // Check if already added
                        const { data: existing } = await supabase.from('hahafriends')
                          .select('id').eq('user_id', user.id).eq('friend_user_id', producerId).maybeSingle();
                        if (existing) { alert(`${producer.name} is already in your HAHAfriends! 🤝`); return; }
                        await supabase.from('hahafriends').insert({
                          user_id: user.id,
                          friend_user_id: producerId,
                          name: producer.name,
                          email: producer.email || null,
                          plan: producer.user_type || null,
                          source: 'profile',
                        });
                        alert(`${producer.name} added to HAHAfriends! 🤝`);
                      }} className="px-4 py-2 border-4 border-brand-cyan/40 text-brand-cyan font-black uppercase italic text-xs hover:bg-brand-cyan hover:text-black transition-all flex items-center gap-1">
                        🤝 Add to HAHAfriends
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BIO */}
          {producer.bio && (
            <p className="text-white/60 font-bold italic leading-relaxed text-sm md:text-base mb-4 max-w-2xl">{producer.bio}</p>
          )}

          {producer.website && (
            <a href={producer.website} target="_blank" rel="noopener noreferrer"
              className="text-brand-cyan text-xs font-bold italic hover:text-white transition-colors flex items-center gap-1 mb-4 w-fit">
              <span className="material-symbols-outlined text-sm">language</span>
              {producer.website.replace(/^https?:\/\//, '')}
            </a>
          )}

          {producer.festivals && (
            <div className="border-l-4 border-brand-yellow pl-4 mb-6">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30 italic mb-1">Festivals & Credits</p>
              <p className="text-white/50 font-bold italic text-xs">{producer.festivals}</p>
            </div>
          )}

          {/* STATS */}
          <div className="grid grid-cols-4 gap-4 mb-8 border-y-4 border-white/10 py-6">
            {[
              { val: producerShows.length, label: 'Shows', color: 'text-brand-yellow' },
              { val: totalViews.toLocaleString(), label: 'Views', color: 'text-brand-cyan' },
              { val: totalInquiries, label: 'Inquiries', color: 'text-brand-pink' },
              { val: countriesCount || posts.length, label: countriesCount ? 'Countries' : 'Posts', color: 'text-white' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className={`text-2xl md:text-4xl font-black ${s.color}`}>{s.val}</div>
                <p className="text-white/30 text-[9px] font-black uppercase italic tracking-widest mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* TABS */}
          <div className="flex border-b-4 border-white/10 mb-6">
            {(['shows', 'wire'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-black uppercase italic text-sm tracking-widest transition-all border-b-4 -mb-[4px] ${activeTab === tab ? 'border-brand-yellow text-brand-yellow' : 'border-transparent text-white/30 hover:text-white'}`}>
                {tab === 'shows' ? `Shows (${producerShows.length})` : `Wire (${posts.length})`}
              </button>
            ))}
          </div>

          {/* SHOWS TAB */}
          {activeTab === 'shows' && (
            producerShows.length === 0 ? (
              <p className="text-white/20 font-bold italic py-12 text-center">No shows listed yet.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {producerShows.map(show => (
                  <div key={show.id} onClick={() => { onUpdateStats(show.id, 'view'); if (onViewShow) onViewShow(show.id); else onNavigate('discovery'); }}
                    className="group cursor-pointer border-4 border-white/20 hover:border-brand-yellow transition-all overflow-hidden bg-brand-surface">
                    <div className="h-40 md:h-52 relative overflow-hidden">
                      {show.imageUrl ? (
                        <img src={show.imageUrl} alt={show.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                      ) : (
                        <div className="w-full h-full bg-brand-black flex items-center justify-center">
                          <span className="text-5xl font-black uppercase italic text-white/10">{show.title[0]}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 p-3 w-full">
                        <p className="text-brand-pink text-[8px] font-black uppercase italic tracking-widest">{show.genre}</p>
                        <h3 className="font-black uppercase italic text-white text-sm leading-tight group-hover:text-brand-yellow transition-colors">{show.title}</h3>
                        <p className="text-white/40 text-[9px] mt-0.5">{show.productionYear} · {show.location}</p>
                      </div>
                    </div>
                    <div className="px-3 py-2 flex justify-between items-center border-t-2 border-white/10">
                      <span className="text-[9px] text-white/30">{show.viewsCount} views</span>
                      <span className="text-[8px] font-black uppercase italic text-brand-yellow">Open →</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* WIRE TAB */}
          {activeTab === 'wire' && (
            posts.length === 0 ? (
              <p className="text-white/20 font-bold italic py-12 text-center">No posts yet.</p>
            ) : (
              <div className="space-y-4">
                {posts.map(post => (
                  <div key={post.id} className="border-4 border-white/20 hover:border-brand-yellow transition-all p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-[8px] font-black uppercase italic px-2 py-1 border-2 border-black rounded-full ${POST_COLORS[post.type] || 'bg-white text-black'}`}>
                        {POST_LABELS[post.type] || 'POST'}
                      </span>
                      <span className="text-white/20 text-[9px] italic">{timeAgo(post.created_at)}</span>
                    </div>
                    <p className="text-white/70 font-bold italic leading-relaxed">{post.content}</p>
                    {post.likes_count > 0 && (
                      <p className="text-white/20 text-[9px] mt-3 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-brand-pink" style={{fontVariationSettings:"'FILL' 1"}}>favorite</span>
                        {post.likes_count}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )
          )}

        </div>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default ProducerPage;
