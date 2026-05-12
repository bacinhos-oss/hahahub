import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Page, User } from '../types';
import { supabase } from '../lib/supabase';

interface LaffWirePageProps {
  onNavigate: (page: Page) => void;
  onLogout?: () => void;
  user?: User;
}

const POST_TYPES: Record<string, { label: string; color: string; icon: string }> = {
  new_show: { label: 'NEW SHOW', color: 'bg-brand-yellow text-black', icon: 'theater_comedy' },
  discount: { label: 'DISCOUNT', color: 'bg-brand-pink text-white', icon: 'local_offer' },
  co_production: { label: 'CO-PRODUCTION', color: 'bg-brand-cyan text-black', icon: 'handshake' },
  news: { label: 'NEWS', color: 'bg-white text-black', icon: 'newspaper' },
  rights: { label: 'RIGHTS AVAILABLE', color: 'bg-brand-yellow text-black', icon: 'gavel' },
};

const LaffWirePage: React.FC<LaffWirePageProps> = ({ onNavigate, onLogout, user }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState('news');
  const [submitting, setSubmitting] = useState(false);

  const plan = (user as any)?.plan || 'gigl';
  const isRoar = plan === 'roar' || user?.isAdmin;
  const isLaff = plan === 'laff' || isRoar;

  useEffect(() => {
    loadPosts();
    // Real-time for ROAR members
    if (isRoar) {
      const channel = supabase
        .channel('laff_wire')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
          setPosts(prev => [payload.new, ...prev]);
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    let query = supabase
      .from('posts')
      .select('*, profiles(name, is_verified, is_founding)')
      .order('created_at', { ascending: false });

    // GIGL — only 3 posts
    if (!isLaff) query = query.limit(3);
    // LAFF — 7 days
    else if (!isRoar) {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte('created_at', sevenDaysAgo);
    }

    const { data } = await query;
    setPosts(data || []);
    setLoading(false);
  };

  const handlePost = async () => {
    if (!newPost.trim() || !user?.id || !isLaff) return;
    setSubmitting(true);
    await supabase.from('posts').insert({
      user_id: user.id,
      type: postType,
      content: newPost.trim(),
    });
    setNewPost('');
    setSubmitting(false);
    loadPosts();
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-black">
      <Navigation activePage="wire" onNavigate={onNavigate} onLogout={onLogout} user={user} />

      <main className="pt-32 pb-20 px-4 md:px-12 flex-1">
        <div className="max-w-3xl mx-auto space-y-10">

          {/* HEADER */}
          <section className="space-y-3">
            <span className="text-brand-pink text-[10px] font-black uppercase tracking-[0.5em] italic">Live Feed</span>
            <h1 className="text-6xl md:text-9xl font-black uppercase italic leading-[0.85] tracking-tighter text-white">
              THE LAFF<br/><span className="text-brand-pink">WIRE</span>
            </h1>
            <p className="text-white/40 font-bold italic">What's happening on The Laff Exchange. Right now.</p>
          </section>

          {/* POST COMPOSER — LAFF + ROAR only */}
          {isLaff && (
            <section className="border-4 border-white/20 p-6 space-y-4">
              <p className="text-[10px] font-black uppercase italic text-white/40 tracking-widest">Post to The Laff Wire</p>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(POST_TYPES).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setPostType(key)}
                    className={`px-3 py-1 text-[9px] font-black uppercase italic border-2 transition-all ${postType === key ? `${val.color} border-black` : 'border-white/20 text-white/40 hover:border-white'}`}
                  >
                    {val.label}
                  </button>
                ))}
              </div>
              <textarea
                value={newPost}
                onChange={e => setNewPost(e.target.value)}
                placeholder="What's happening? New show, discount, co-production opportunity..."
                className="w-full bg-transparent border-2 border-white/20 text-white font-bold italic p-4 outline-none placeholder:text-white/20 resize-none h-24 focus:border-brand-yellow transition-colors"
              />
              <button
                onClick={handlePost}
                disabled={submitting || !newPost.trim()}
                className="bg-brand-yellow text-black px-8 py-3 font-black uppercase italic border-4 border-black hover:bg-white transition-all disabled:opacity-40 text-sm"
              >
                {submitting ? 'Posting...' : 'Punch It Out →'}
              </button>
            </section>
          )}

          {/* FEED */}
          <section className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="border-4 border-white/10 p-6 animate-pulse">
                    <div className="h-4 bg-white/10 w-1/4 mb-3"></div>
                    <div className="h-6 bg-white/10 w-3/4 mb-2"></div>
                    <div className="h-4 bg-white/10 w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="border-4 border-white/20 p-12 text-center">
                <p className="text-white/20 font-black uppercase italic text-sm">Nothing on the wire yet.</p>
                <p className="text-white/10 font-bold italic text-xs mt-2">Be the first to punch it out.</p>
              </div>
            ) : (
              posts.map((post, i) => {
                const type = POST_TYPES[post.type] || POST_TYPES.news;
                const isBlurred = !isLaff && i >= 3;
                return (
                  <div key={post.id} className={`border-4 border-white/20 hover:border-brand-yellow transition-all p-6 relative ${isBlurred ? 'opacity-30 pointer-events-none' : ''}`}>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <span className={`text-[8px] font-black uppercase italic px-2 py-1 border-2 border-black ${type.color}`}>
                          {type.label}
                        </span>
                        <span className="text-white font-black uppercase italic text-sm">
                          {post.profiles?.name || 'Producer'}
                        </span>
                        {post.profiles?.is_verified && (
                          <span className="text-[7px] font-black uppercase text-black bg-brand-cyan px-2 py-0.5 italic border border-black">VERIFIED</span>
                        )}
                        {post.profiles?.is_founding && (
                          <span className="text-[7px] font-black uppercase text-black bg-brand-yellow px-2 py-0.5 italic border border-black">FOUNDING</span>
                        )}
                      </div>
                      <span className="text-white/30 text-[10px] font-black italic flex-shrink-0">{timeAgo(post.created_at)}</span>
                    </div>
                    <p className="text-white/80 font-bold italic leading-relaxed">{post.content}</p>
                  </div>
                );
              })
            )}
          </section>

          {/* UPGRADE BANNER — GIGL users */}
          {!isLaff && (
            <section className="border-8 border-brand-yellow p-8 text-center shadow-neo-yellow">
              <h2 className="text-3xl font-black uppercase italic text-white mb-2">Want the full wire?</h2>
              <p className="text-white/40 font-bold italic text-sm mb-6">LAFF members see 7 days. ROAR members get it live, real-time.</p>
              <button onClick={() => onNavigate('pricing')} className="bg-brand-yellow text-black px-10 py-4 font-black uppercase italic border-4 border-black hover:bg-white transition-all">
                Upgrade Now →
              </button>
            </section>
          )}

          {/* ROAR live indicator */}
          {isRoar && (
            <div className="flex items-center gap-2 text-brand-pink text-[10px] font-black uppercase italic">
              <span className="w-2 h-2 rounded-full bg-brand-pink animate-pulse"></span>
              Live — updates in real-time
            </div>
          )}

        </div>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default LaffWirePage;
