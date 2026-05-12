import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Page, User } from '../types';
import { supabase } from '../lib/supabase';

interface LaffWirePageProps {
  onNavigate: (page: Page) => void;
  onLogout?: () => void;
  user?: User;
  onViewProducer?: (producerId: string) => void;
}

const POST_TYPES: Record<string, { label: string; color: string }> = {
  new_show:      { label: 'NEW SHOW',        color: 'bg-brand-yellow text-black' },
  discount:      { label: 'DISCOUNT',         color: 'bg-brand-pink text-white' },
  co_production: { label: 'CO-PRODUCTION',    color: 'bg-brand-cyan text-black' },
  news:          { label: 'NEWS',             color: 'bg-white text-black' },
  rights:        { label: 'RIGHTS AVAILABLE', color: 'bg-brand-yellow text-black' },
};

const DEMO_POSTS = [
  { id: 'demo1', type: 'new_show', content: 'Just listed: "Tango Mortale" — a dark comedy from Buenos Aires. 2 actors, universal humor, touring friendly. Check it out in the catalog.', created_at: new Date(Date.now() - 2 * 3600000).toISOString(), profiles: { name: 'MAJ BOTOCANIN', is_verified: true, is_founding: true, id: null } },
  { id: 'demo2', type: 'co_production', content: 'Looking for a co-production partner in Scandinavia for our new physical comedy. Budget: medium. Premiere planned Spring 2026. DM or Tickle us directly.', created_at: new Date(Date.now() - 5 * 3600000).toISOString(), profiles: { name: 'JURE KOREN', is_verified: false, is_founding: true, id: null } },
  { id: 'demo3', type: 'news', content: 'We just returned from Edinburgh Fringe with 3 new contacts. The international market is hungry for Eastern European comedy. Exciting times.', created_at: new Date(Date.now() - 24 * 3600000).toISOString(), profiles: { name: 'TARA KAJZER', is_verified: true, is_founding: false, id: null } },
  { id: 'demo4', type: 'discount', content: '20% discount on licensing fee for any show staged before June 2026. First come, first served. Inquire directly via The Laff Exchange.', created_at: new Date(Date.now() - 2 * 86400000).toISOString(), profiles: { name: 'DEJAN BOTOCANIN', is_verified: true, is_founding: true, id: null } },
];

const LaffWirePage: React.FC<LaffWirePageProps> = ({ onNavigate, onLogout, user, onViewProducer }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState('news');
  const [submitting, setSubmitting] = useState(false);

  const plan = (user as any)?.plan || 'gigl';
  const isRoar = plan === 'roar' || user?.isAdmin;
  const isLaff = plan === 'laff' || isRoar;

  useEffect(() => {
    loadPosts();
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
    try {
      let query = supabase
        .from('posts')
        .select('*, profiles(id, name, is_verified, is_founding)')
        .order('created_at', { ascending: false });

      if (!isLaff) query = query.limit(3);
      else if (!isRoar) {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('created_at', sevenDaysAgo);
      }

      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        setPosts(DEMO_POSTS);
      } else {
        setPosts(data);
      }
    } catch {
      setPosts(DEMO_POSTS);
    }
    setLoading(false);
  };

  const handlePost = async () => {
    if (!newPost.trim() || !user?.id) return;
    setSubmitting(true);
    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      type: postType,
      content: newPost.trim(),
    });
    if (!error) {
      setNewPost('');
      setShowComposer(false);
      loadPosts();
    }
    setSubmitting(false);
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 2) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-black">
      <Navigation activePage="wire" onNavigate={onNavigate} onLogout={onLogout} user={user} />

      <main className="pt-32 pb-20 px-4 md:px-12 flex-1">
        <div className="max-w-3xl mx-auto">

          {/* HEADER */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-brand-pink text-[10px] font-black uppercase tracking-[0.5em] italic block mb-2">Live Feed</span>
              <h1 className="text-6xl md:text-9xl font-black uppercase italic leading-[0.85] tracking-tighter text-white">
                THE LAFF<br/><span className="text-brand-pink">WIRE</span>
              </h1>
              <p className="text-white/30 font-bold italic mt-3 text-sm">What's happening on The Laff Exchange.</p>
            </div>
            {/* POST BUTTON */}
            {isLaff && (
              <button
                onClick={() => setShowComposer(!showComposer)}
                className="flex-shrink-0 bg-brand-yellow text-black px-8 py-4 font-black uppercase italic border-4 border-black shadow-[4px_4px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-sm"
              >
                {showComposer ? 'Cancel' : '+ Punch It Out'}
              </button>
            )}
            {isRoar && (
              <div className="flex items-center gap-2 text-brand-pink text-[9px] font-black uppercase italic">
                <span className="w-2 h-2 rounded-full bg-brand-pink animate-pulse"></span>
                Live
              </div>
            )}
          </div>

          {/* COMPOSER */}
          {showComposer && isLaff && (
            <div className="border-4 border-brand-yellow p-6 mb-8 space-y-4 shadow-neo-yellow">
              <p className="text-[10px] font-black uppercase italic text-white/40 tracking-widest">Post type</p>
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
                placeholder="New show, discount, co-production opportunity, festival news..."
                className="w-full bg-transparent border-2 border-white/20 focus:border-brand-yellow text-white font-bold italic p-4 outline-none placeholder:text-white/20 resize-none h-28 transition-colors"
              />
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePost}
                  disabled={submitting || !newPost.trim()}
                  className="bg-brand-yellow text-black px-8 py-3 font-black uppercase italic border-4 border-black hover:bg-white transition-all disabled:opacity-40 text-sm"
                >
                  {submitting ? 'Posting...' : 'Punch It Out →'}
                </button>
                <p className="text-white/20 text-xs italic">Visible to all members</p>
              </div>
            </div>
          )}

          {/* FEED */}
          <div className="space-y-4">
            {loading ? (
              [1,2,3].map(i => (
                <div key={i} className="border-4 border-white/10 p-6 animate-pulse space-y-3">
                  <div className="h-3 bg-white/10 w-1/4"></div>
                  <div className="h-5 bg-white/10 w-3/4"></div>
                  <div className="h-4 bg-white/10 w-1/2"></div>
                </div>
              ))
            ) : (
              posts.map((post, i) => {
                const type = POST_TYPES[post.type] || POST_TYPES.news;
                const isBlurred = !isLaff && i >= 3;
                return (
                  <div key={post.id} className={`border-4 border-white/20 hover:border-brand-yellow transition-all p-6 relative ${isBlurred ? 'opacity-20 pointer-events-none select-none' : ''}`}>
                    {/* TOP ROW */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[8px] font-black uppercase italic px-2 py-1 border-2 border-black ${type.color}`}>
                          {type.label}
                        </span>
                        {post.profiles?.id && onViewProducer ? (
                          <button
                            onClick={() => { onViewProducer(post.profiles.id); onNavigate('producer'); }}
                            className="font-black uppercase italic text-sm text-white hover:text-brand-yellow transition-colors"
                          >
                            {post.profiles?.name || 'Producer'}
                          </button>
                        ) : (
                          <span className="font-black uppercase italic text-sm text-white">
                            {post.profiles?.name || 'Producer'}
                          </span>
                        )}
                        {post.profiles?.is_verified && (
                          <span className="text-[7px] font-black uppercase text-black bg-brand-cyan px-1.5 py-0.5 italic border border-black">VERIFIED</span>
                        )}
                        {post.profiles?.is_founding && (
                          <span className="text-[7px] font-black uppercase text-black bg-brand-yellow px-1.5 py-0.5 italic border border-black">FOUNDING</span>
                        )}
                      </div>
                      <span className="text-white/20 text-[10px] font-black italic flex-shrink-0">{timeAgo(post.created_at)}</span>
                    </div>
                    {/* CONTENT */}
                    <p className="text-white/80 font-bold italic leading-relaxed">{post.content}</p>
                  </div>
                );
              })
            )}
          </div>

          {/* UPGRADE BANNER */}
          {!isLaff && (
            <div className="mt-10 border-8 border-brand-yellow p-8 text-center shadow-neo-yellow">
              <h2 className="text-3xl font-black uppercase italic text-white mb-2">Want the full wire?</h2>
              <p className="text-white/40 font-bold italic text-sm mb-6">
                LAFF members see 7 days · ROAR members get it live, real-time
              </p>
              <button
                onClick={() => onNavigate('pricing')}
                className="bg-brand-yellow text-black px-10 py-4 font-black uppercase italic border-4 border-black hover:bg-white transition-all"
              >
                Upgrade Now →
              </button>
            </div>
          )}

        </div>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default LaffWirePage;
