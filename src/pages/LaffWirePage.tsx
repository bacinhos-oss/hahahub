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

const LaffWirePage: React.FC<LaffWirePageProps> = ({ onNavigate, onLogout, user, onViewProducer }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState('news');
  const [submitting, setSubmitting] = useState(false);
  const [postError, setPostError] = useState('');
  const [postSuccess, setPostSuccess] = useState(false);
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [liked, setLiked] = useState<Record<string, boolean>>({});

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
        .select('*, profiles(id, name, is_verified, is_founding, user_type)')
        .order('created_at', { ascending: false });

      if (!isLaff) query = query.limit(3);
      else if (!isRoar) {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('created_at', sevenDaysAgo);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Posts error:', error);
        setPosts([]);
      } else {
        setPosts(data || []);
        // Init likes
        const l: Record<string, number> = {};
        data?.forEach((p: any) => { l[p.id] = p.likes_count || 0; });
        setLikes(l);
      }
    } catch (e) {
      console.error(e);
      setPosts([]);
    }
    setLoading(false);
  };

  const handlePost = async () => {
    if (!newPost.trim()) { setPostError('Write something first.'); return; }
    if (!user?.id) { setPostError('You must be logged in.'); return; }
    if (!isLaff) { setPostError('LAFF or ROAR membership required.'); return; }
    
    setSubmitting(true);
    setPostError('');
    
    const { data, error } = await supabase.from('posts').insert({
      user_id: user.id,
      type: postType,
      content: newPost.trim(),
      likes_count: 0,
    }).select();
    
    if (error) {
      console.error('Insert error:', error);
      setPostError('Failed to post: ' + error.message);
    } else {
      setNewPost('');
      setPostSuccess(true);
      setTimeout(() => setPostSuccess(false), 3000);
      loadPosts();
    }
    setSubmitting(false);
  };

  const handleLike = async (postId: string) => {
    if (!user?.id) { onNavigate('login'); return; }
    const isLiked = liked[postId];
    const current = likes[postId] || 0;
    const newCount = isLiked ? current - 1 : current + 1;
    
    // Optimistic update
    setLikes(prev => ({ ...prev, [postId]: newCount }));
    setLiked(prev => ({ ...prev, [postId]: !isLiked }));
    
    // Save to DB
    await supabase.from('posts').update({ likes_count: newCount }).eq('id', postId);
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
        <div className="max-w-3xl mx-auto space-y-10">

          {/* HEADER */}
          <div>
            <span className="text-brand-pink text-[10px] font-black uppercase tracking-[0.5em] italic block mb-2">Live Feed</span>
            <div className="flex items-end justify-between gap-4">
              <h1 className="text-6xl md:text-9xl font-black uppercase italic leading-[0.85] tracking-tighter text-white">
                THE LAFF<br/><span className="text-brand-pink">WIRE</span>
              </h1>
              {isRoar && (
                <div className="flex items-center gap-2 text-brand-pink text-[9px] font-black uppercase italic pb-4">
                  <span className="w-2 h-2 rounded-full bg-brand-pink animate-pulse"></span>
                  Live
                </div>
              )}
            </div>
            <p className="text-white/30 font-bold italic mt-3 text-sm">What's happening on The Laff Exchange. Right now.</p>
          </div>

          {/* COMPOSER — always visible for LAFF+ */}
          {isLaff ? (
            <div className="border-4 border-brand-yellow p-6 space-y-4 shadow-neo-yellow">
              <p className="text-[10px] font-black uppercase italic text-brand-yellow tracking-widest">Punch It Out →</p>
              
              {/* Type selector */}
              <div className="flex gap-2 flex-wrap">
                {Object.entries(POST_TYPES).map(([key, val]) => (
                  <button key={key} onClick={() => setPostType(key)}
                    className={`px-3 py-1 text-[9px] font-black uppercase italic border-2 transition-all ${postType === key ? `${val.color} border-black` : 'border-white/20 text-white/40 hover:border-white'}`}>
                    {val.label}
                  </button>
                ))}
              </div>

              <textarea
                value={newPost}
                onChange={e => { setNewPost(e.target.value); setPostError(''); }}
                placeholder="New show, discount offer, co-production opportunity, festival news..."
                className="w-full bg-brand-black border-2 border-white/20 focus:border-brand-yellow text-white font-bold italic p-4 outline-none placeholder:text-white/20 resize-none h-28 transition-colors"
              />

              {postError && <p className="text-brand-pink text-xs font-black italic">⚠ {postError}</p>}
              {postSuccess && <p className="text-brand-cyan text-xs font-black italic">✓ Posted! Punchline delivered.</p>}

              <div className="flex items-center gap-4">
                <button onClick={handlePost} disabled={submitting || !newPost.trim()}
                  className="bg-brand-yellow text-black px-10 py-4 font-black uppercase italic border-4 border-black hover:bg-white transition-all disabled:opacity-40 text-sm shadow-[4px_4px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                  {submitting ? 'Punching...' : 'Punch It Out →'}
                </button>
                <p className="text-white/20 text-xs italic">Visible to all members</p>
              </div>
            </div>
          ) : (
            <div className="border-4 border-white/10 p-6 text-center">
              <p className="text-white/30 font-bold italic text-sm mb-3">Want to post on The Laff Wire?</p>
              <button onClick={() => onNavigate('pricing')} className="bg-brand-yellow text-black px-8 py-3 font-black uppercase italic border-4 border-black text-sm">
                Upgrade to LAFF →
              </button>
            </div>
          )}

          {/* FEED */}
          <div className="space-y-4">
            {loading ? (
              [1,2,3].map(i => (
                <div key={i} className="border-4 border-white/10 p-6 animate-pulse space-y-3">
                  <div className="h-3 bg-white/10 w-1/4 rounded"></div>
                  <div className="h-5 bg-white/10 w-3/4 rounded"></div>
                  <div className="h-4 bg-white/10 w-1/2 rounded"></div>
                </div>
              ))
            ) : posts.length === 0 ? (
              <div className="border-4 border-white/10 p-12 text-center">
                <p className="text-white/20 font-black uppercase italic">Nothing on the wire yet.</p>
                {isLaff && <p className="text-white/10 text-xs italic mt-2">Be the first to punch it out.</p>}
              </div>
            ) : (
              posts.map((post, i) => {
                const type = POST_TYPES[post.type] || POST_TYPES.news;
                const isBlurred = !isLaff && i >= 3;
                const producerId = post.profiles?.id;
                const isVerified = post.profiles?.is_verified || post.profiles?.user_type === 'roar';
                const isFounding = post.profiles?.is_founding;
                const postLikes = likes[post.id] ?? (post.likes_count || 0);
                const isLiked = liked[post.id] || false;

                return (
                  <div key={post.id} className={`border-4 transition-all p-5 md:p-6 ${isBlurred ? 'border-white/10 opacity-30 pointer-events-none select-none' : 'border-white/20 hover:border-brand-yellow'}`}>
                    
                    {/* TOP ROW */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Type badge */}
                        <span className={`text-[8px] font-black uppercase italic px-2 py-1 border-2 border-black ${type.color}`}>
                          {type.label}
                        </span>
                        
                        {/* Producer name — clickable if has ID */}
                        {producerId ? (
                          <button
                            onClick={() => { onViewProducer?.(producerId); onNavigate('producer'); }}
                            className="font-black uppercase italic text-sm text-white hover:text-brand-yellow transition-colors underline-offset-2 hover:underline"
                          >
                            {post.profiles?.name || 'Producer'}
                          </button>
                        ) : (
                          <span className="font-black uppercase italic text-sm text-white">
                            {post.profiles?.name || 'Producer'}
                          </span>
                        )}

                        {/* Instagram-style badges */}
                        {isVerified && (
                          <span className="w-4 h-4 rounded-full bg-brand-cyan border border-black flex items-center justify-center" title="Verified">
                            <span className="material-symbols-outlined text-black" style={{fontSize:'9px'}}>check</span>
                          </span>
                        )}
                        {isFounding && (
                          <span className="w-4 h-4 rounded-full bg-brand-yellow border border-black flex items-center justify-center" title="Founding">
                            <span className="material-symbols-outlined text-black" style={{fontSize:'9px'}}>star</span>
                          </span>
                        )}
                      </div>
                      <span className="text-white/20 text-[10px] font-black italic flex-shrink-0">{timeAgo(post.created_at)}</span>
                    </div>

                    {/* CONTENT */}
                    <p className="text-white/80 font-bold italic leading-relaxed text-sm md:text-base">{post.content}</p>

                    {/* BOTTOM ROW — likes */}
                    <div className="mt-4 flex items-center gap-4">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1.5 text-[10px] font-black uppercase italic transition-all ${isLiked ? 'text-brand-pink' : 'text-white/30 hover:text-brand-pink'}`}
                      >
                        <span className="material-symbols-outlined text-sm">{isLiked ? 'favorite' : 'favorite_border'}</span>
                        {postLikes > 0 && <span>{postLikes}</span>}
                      </button>
                      {producerId && (
                        <button
                          onClick={() => { onViewProducer?.(producerId); onNavigate('producer'); }}
                          className="text-[10px] font-black uppercase italic text-white/20 hover:text-brand-cyan transition-colors"
                        >
                          View Producer →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* UPGRADE BANNER for GIGL */}
          {!isLaff && (
            <div className="border-8 border-brand-yellow p-8 text-center shadow-neo-yellow">
              <h2 className="text-3xl font-black uppercase italic text-white mb-2">Want the full wire?</h2>
              <p className="text-white/40 font-bold italic text-sm mb-6">
                LAFF — 7 days · ROAR — live, real-time, post anything
              </p>
              <button onClick={() => onNavigate('pricing')}
                className="bg-brand-yellow text-black px-10 py-4 font-black uppercase italic border-4 border-black hover:bg-white transition-all">
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
