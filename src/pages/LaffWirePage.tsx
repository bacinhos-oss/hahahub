import React, { useState, useEffect, useRef } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Page, User } from '../types';
import { supabase } from '../lib/supabase';
import { Avatar, Badge, getProfileBadges } from '../components/Badge';

interface LaffWirePageProps {
  onNavigate: (page: Page) => void;
  onLogout?: () => void;
  user?: User;
  onViewProducer?: (producerId: string) => void;
  initialThreadId?: string;
}

const POST_TYPES: Record<string, { label: string; bg: string; text: string }> = {
  deal:          { label: '🥊 DEAL CLOSED',   bg: '#FF0266', text: '#fff' },
  new_show:      { label: 'NEW SHOW',         bg: '#FFDE03', text: '#000' },
  discount:      { label: 'DISCOUNT',         bg: '#FF0266', text: '#fff' },
  co_production: { label: 'CO-PRODUCTION',    bg: '#03DAC6', text: '#000' },
  news:          { label: 'NEWS',             bg: '#fff',    text: '#000' },
  rights:        { label: 'RIGHTS',           bg: '#FFDE03', text: '#000' },
};

function extractVideoUrl(text: string): string | null {
  const match = text.match(/(https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|vimeo\.com\/)[\w\-?=&]+)/);
  return match ? match[0] : null;
}

function getEmbedUrl(url: string): string {
  if (url.includes('youtube.com/watch')) return url.replace('watch?v=', 'embed/').split('&')[0];
  if (url.includes('youtu.be/')) return 'https://www.youtube.com/embed/' + url.split('youtu.be/')[1].split('?')[0];
  if (url.includes('vimeo.com/')) return 'https://player.vimeo.com/video/' + url.split('vimeo.com/')[1].split('?')[0];
  return url;
}

export async function openDealThread(dealId: string, showTitle: string, producerId: string, buyerId: string, systemMsg: string): Promise<string> {
  const { data: existing } = await supabase
    .from('posts')
    .select('thread_id')
    .eq('deal_id', dealId)
    .eq('is_private', true)
    .limit(1)
    .single();

  if (existing?.thread_id) return existing.thread_id;

  const threadId = crypto.randomUUID();
  await supabase.from('posts').insert({
    user_id: producerId,
    type: 'news',
    content: systemMsg,
    likes_count: 0,
    is_private: true,
    thread_id: threadId,
    participants: [producerId, buyerId],
    deal_id: dealId,
    is_system: true,
  });
  return threadId;
}

export async function postToThread(threadId: string, userId: string, producerId: string, buyerId: string, dealId: string, content: string, isSystem = false) {
  await supabase.from('posts').insert({
    user_id: userId,
    type: 'news',
    content,
    likes_count: 0,
    is_private: true,
    thread_id: threadId,
    participants: [producerId, buyerId],
    deal_id: dealId,
    is_system: isSystem,
  });
}

const LaffWirePage: React.FC<LaffWirePageProps> = ({ onNavigate, onLogout, user, onViewProducer, initialThreadId }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState('news');
  const [submitting, setSubmitting] = useState(false);
  const [postError, setPostError] = useState('');
  const [postSuccess, setPostSuccess] = useState(false);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [activeView, setActiveView] = useState<'public' | 'private'>(initialThreadId ? 'private' : 'public');
  const [activeThread, setActiveThread] = useState<string | null>(initialThreadId || null);
  const [threads, setThreads] = useState<any[]>([]);
  const [threadPosts, setThreadPosts] = useState<any[]>([]);
  const [threadMsg, setThreadMsg] = useState('');
  const [sendingThread, setSendingThread] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  const plan = (user as any)?.plan || 'gigl';
  const isRoar = plan === 'roar' || user?.isAdmin;
  const isLaff = plan === 'laff' || isRoar;

  useEffect(() => { loadPosts(); loadThreads(); }, []);

  useEffect(() => {
    if (activeThread) loadThreadPosts(activeThread);
  }, [activeThread]);

  useEffect(() => {
    if (initialThreadId) { setActiveView('private'); setActiveThread(initialThreadId); }
  }, [initialThreadId]);

  const loadPosts = async () => {
    setLoading(true);
    let q = supabase.from('posts')
      .select('*, profiles(id, name, is_verified, is_founding)')
      .eq('is_private', false)
      .order('created_at', { ascending: false });
    if (!isLaff) q = q.limit(3);
    else if (!isRoar) q = q.gte('created_at', new Date(Date.now() - 7*86400000).toISOString());
    const { data } = await q;
    setPosts(data || []);
    const lc: Record<string, number> = {};
    data?.forEach((p: any) => { lc[p.id] = p.likes_count || 0; });
    setLikeCounts(lc);
    setLoading(false);
  };

  const loadThreads = async () => {
    if (!user?.id) return;
    const { data } = await supabase.from('posts')
      .select('thread_id, deal_id, content, created_at, show_title')
      .eq('is_private', true)
      .contains('participants', [user.id])
      .eq('is_system', true)
      .order('created_at', { ascending: false });
    const unique = data ? [...new Map(data.map((t: any) => [t.thread_id, t])).values()] : [];
    setThreads(unique);
  };

  const loadThreadPosts = async (threadId: string) => {
    const { data } = await supabase.from('posts')
      .select('*, profiles(id, name, is_verified)')
      .eq('is_private', true)
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });
    setThreadPosts(data || []);
    setTimeout(() => threadRef.current?.scrollTo(0, threadRef.current.scrollHeight), 100);
  };

  const sendThreadMsg = async () => {
    if (!threadMsg.trim() || !activeThread || !user?.id) return;
    setSendingThread(true);
    const thread = threadPosts[0];
    if (!thread) return;
    await supabase.from('posts').insert({
      user_id: user.id,
      type: 'news',
      content: threadMsg.trim(),
      likes_count: 0,
      is_private: true,
      thread_id: activeThread,
      participants: thread.participants,
      deal_id: thread.deal_id,
      is_system: false,
    });
    setThreadMsg('');
    loadThreadPosts(activeThread);
    setSendingThread(false);
  };

  const handlePost = async () => {
    if (!newPost.trim()) return;
    if (!user?.id) { setPostError('Login required'); return; }
    setSubmitting(true); setPostError('');
    const { error } = await supabase.from('posts').insert({
      user_id: user.id, type: postType, content: newPost.trim(), likes_count: 0, is_private: false
    });
    if (error) { setPostError('Error: ' + error.message); }
    else { setNewPost(''); setPostSuccess(true); setTimeout(() => setPostSuccess(false), 3000); loadPosts(); }
    setSubmitting(false);
  };

  const handleLike = async (postId: string) => {
    if (!user) { onNavigate('login'); return; }
    const isNowLiked = !liked[postId];
    const current = likeCounts[postId] || 0;
    const next = isNowLiked ? current + 1 : Math.max(0, current - 1);
    setLiked(p => ({ ...p, [postId]: isNowLiked }));
    setLikeCounts(p => ({ ...p, [postId]: next }));
    await supabase.from('posts').update({ likes_count: next }).eq('id', postId);
  };

  const timeAgo = (d: string) => {
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s/60) + 'm';
    if (s < 86400) return Math.floor(s/3600) + 'h';
    return Math.floor(s/86400) + 'd';
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-black">
      <Navigation activePage="wire" onNavigate={onNavigate} onLogout={onLogout} user={user} />

      <main className="pt-28 pb-20 flex-1">

        <div className="px-4 md:px-12 pb-8 border-b-4 border-white/10">
          <div className="max-w-2xl mx-auto flex items-end justify-between gap-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.5em] italic text-brand-pink mb-1">Live Feed</p>
              <h1 className="text-5xl md:text-7xl font-black uppercase italic leading-none tracking-tighter text-white">
                THE LAFF <span className="text-brand-pink">WIRE</span>
              </h1>
            </div>
            <div className="flex items-center gap-3 pb-2">
              {isRoar && (
                <div className="flex items-center gap-1.5 text-brand-pink text-[9px] font-black uppercase italic">
                  <span className="w-2 h-2 rounded-full bg-brand-pink animate-pulse"></span>LIVE
                </div>
              )}
              {!isLaff && (
                <button onClick={() => onNavigate('pricing')} className="bg-brand-yellow text-black px-4 py-2 font-black uppercase italic text-xs border-2 border-black">
                  Upgrade →
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 md:px-0 py-6">

          {/* VIEW TOGGLE */}
          {isLaff && (
            <div className="flex border-4 border-white/20 mb-6">
              <button onClick={() => setActiveView('public')}
                className={"flex-1 py-2 font-black uppercase italic text-xs transition-all " + (activeView === 'public' ? 'bg-brand-yellow text-black' : 'text-white/40 hover:text-white')}>
                Public Feed
              </button>
              <button onClick={() => setActiveView('private')}
                className={"flex-1 py-2 font-black uppercase italic text-xs transition-all flex items-center justify-center gap-2 " + (activeView === 'private' ? 'bg-brand-cyan text-black' : 'text-white/40 hover:text-white')}>
                🔒 Private Threads
                {threads.length > 0 && <span className={"text-[8px] px-2 py-0.5 font-black " + (activeView === 'private' ? 'bg-black text-brand-cyan' : 'bg-brand-cyan text-black')}>{threads.length}</span>}
              </button>
            </div>
          )}

          {/* PRIVATE THREADS */}
          {activeView === 'private' && isLaff && (
            <div className="space-y-4">
              {threads.length === 0 ? (
                <div className="border-4 border-white/10 p-8 text-center">
                  <p className="text-white/20 font-black uppercase italic">No private threads yet.</p>
                  <p className="text-white/10 text-sm italic mt-2">Threads open automatically when a deal starts.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {threads.map((t: any) => (
                    <button key={t.thread_id} onClick={() => setActiveThread(activeThread === t.thread_id ? null : t.thread_id)}
                      className={"w-full text-left border-4 p-4 transition-all " + (activeThread === t.thread_id ? 'border-brand-cyan bg-brand-cyan/5' : 'border-white/20 hover:border-white/40')}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[8px] font-black uppercase text-brand-cyan italic tracking-widest mb-1">🔒 Private Thread</p>
                          <p className="font-black uppercase italic text-white text-sm">{t.show_title || 'Deal Thread'}</p>
                          <p className="text-white/30 text-xs italic mt-1 line-clamp-1">{t.content}</p>
                        </div>
                        <span className="text-white/20 text-[9px] ml-4">{timeAgo(t.created_at)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* THREAD MESSAGES */}
              {activeThread && (
                <div className="border-4 border-brand-cyan mt-4">
                  <div className="border-b-4 border-brand-cyan/30 px-4 py-3">
                    <p className="text-[9px] font-black uppercase italic text-brand-cyan tracking-widest">🔒 Private Conversation</p>
                  </div>
                  <div ref={threadRef} className="p-4 space-y-4 max-h-96 overflow-y-auto">
                    {threadPosts.map((p: any) => {
                      const isMe = p.user_id === user?.id;
                      const isSystem = p.is_system;
                      if (isSystem) return (
                        <div key={p.id} className="text-center">
                          <span className="text-[8px] font-black uppercase italic text-white/20 border border-white/10 px-3 py-1">
                            📌 {p.content}
                          </span>
                        </div>
                      );
                      return (
                        <div key={p.id} className={"flex gap-3 " + (isMe ? 'flex-row-reverse' : '')}>
                          <Avatar name={p.profiles?.name || '?'} size={32} badges={[]} />
                          <div className={"max-w-xs " + (isMe ? 'text-right' : '')}>
                            <p className={"text-[8px] font-black uppercase italic mb-1 " + (isMe ? 'text-brand-yellow' : 'text-brand-cyan')}>
                              {p.profiles?.name || 'User'} · {timeAgo(p.created_at)}
                            </p>
                            <div className={"border-2 p-3 " + (isMe ? 'border-brand-yellow bg-brand-yellow/5' : 'border-white/20')}>
                              <p className="text-white font-bold italic text-sm">{p.content}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t-4 border-brand-cyan/30 p-4 flex gap-3">
                    <textarea
                      value={threadMsg}
                      onChange={e => setThreadMsg(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendThreadMsg(); }}}
                      placeholder="Type a message..."
                      rows={2}
                      className="flex-1 bg-black border-2 border-white/20 p-3 text-white font-bold italic text-sm outline-none focus:border-brand-cyan resize-none"
                    />
                    <button onClick={sendThreadMsg} disabled={sendingThread || !threadMsg.trim()}
                      className="bg-brand-cyan text-black px-4 font-black uppercase italic text-xs border-2 border-black disabled:opacity-30 hover:bg-white transition-all">
                      Send →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PUBLIC FEED */}
          {activeView === 'public' && (
            <div className="space-y-0">
              {isLaff && (
                <div className="border-b-4 border-white/10 pb-6 mb-2">
                  <div className="flex gap-3">
                    <Avatar name={user?.name || '?'} size={44} badges={getProfileBadges(user)} />
                    <div className="flex-1 space-y-3">
                      <textarea
                        ref={textRef}
                        value={newPost}
                        onChange={e => { setNewPost(e.target.value); setPostError(''); }}
                        placeholder="What's happening in your theatre world?"
                        className="w-full bg-transparent border-none text-white font-bold italic text-base outline-none placeholder:text-white/20 resize-none min-h-[60px]"
                        rows={2}
                      />
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(POST_TYPES).map(([key, val]) => (
                          <button key={key} onClick={() => setPostType(key)}
                            className={`px-3 py-1 text-[8px] font-black uppercase italic border-2 transition-all rounded-full ${postType === key ? 'border-black' : 'border-white/20 text-white/30 hover:border-white/50'}`}
                            style={postType === key ? { background: val.bg, color: val.text, borderColor: '#000' } : {}}>
                            {val.label}
                          </button>
                        ))}
                      </div>
                      {postError && <p className="text-brand-pink text-xs font-black italic">⚠ {postError}</p>}
                      {postSuccess && <p className="text-brand-cyan text-xs font-black italic">✓ Punchline delivered!</p>}
                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <p className="text-white/20 text-[10px] italic">{newPost.length}/500</p>
                        <button onClick={handlePost} disabled={submitting || !newPost.trim()}
                          className="bg-brand-yellow text-black px-6 py-2 font-black uppercase italic text-xs border-2 border-black disabled:opacity-30 hover:bg-white transition-all">
                          {submitting ? '...' : 'Punch It Out →'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="space-y-0">
                  {[1,2,3].map(i => (
                    <div key={i} className="py-5 border-b border-white/10 flex gap-3 animate-pulse">
                      <div className="w-11 h-11 rounded-full bg-white/10 flex-shrink-0"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-white/10 w-1/3 rounded"></div>
                        <div className="h-4 bg-white/10 w-5/6 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-white/20 font-black uppercase italic text-lg">Nothing on the wire yet.</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {posts.map((post, i) => {
                    const type = POST_TYPES[post.type] || POST_TYPES.news;
                    const isBlurred = !isLaff && i >= 3;
                    const pid = post.profiles?.id;
                    const isVerified = post.profiles?.is_verified;
                    const isFounding = post.profiles?.is_founding;
                    const lc = likeCounts[post.id] ?? 0;
                    const isLiked = liked[post.id] || false;

                    return (
                      <div key={post.id} className={`py-5 border-b border-white/10 ${isBlurred ? 'opacity-20 pointer-events-none select-none' : ''}`}>
                        <div className="flex gap-3">
                          <button onClick={() => pid && onViewProducer && (onViewProducer(pid), onNavigate('producer'))} disabled={!pid} className="flex-shrink-0 disabled:cursor-default">
                            <Avatar name={post.profiles?.name || '?'} size={44} badges={getProfileBadges(post.profiles)} onClick={() => {}} />
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <button onClick={() => pid && onViewProducer && (onViewProducer(pid), onNavigate('producer'))} disabled={!pid}
                                className="font-black uppercase italic text-sm text-white hover:text-brand-yellow transition-colors disabled:cursor-default">
                                {post.profiles?.name || 'Producer'}
                              </button>
                              {isVerified && (
                                <span className="w-3.5 h-3.5 rounded-full bg-brand-cyan border border-black flex items-center justify-center">
                                  <span className="material-symbols-outlined text-black" style={{ fontSize: '7px', fontVariationSettings: "'wght' 700" }}>check</span>
                                </span>
                              )}
                              {isFounding && (
                                <span className="w-3.5 h-3.5 rounded-full bg-brand-yellow border border-black flex items-center justify-center">
                                  <span className="material-symbols-outlined text-black" style={{ fontSize: '7px' }}>star</span>
                                </span>
                              )}
                              <span className="text-white/20 text-[9px] italic ml-auto">{timeAgo(post.created_at)}</span>
                            </div>
                            <span className="inline-block text-[7px] font-black uppercase italic px-2 py-0.5 rounded-full mb-2 border border-black"
                              style={{ background: type.bg, color: type.text }}>
                              {type.label}
                            </span>
                            <p className="text-white/80 font-bold italic leading-relaxed text-sm">{post.content}</p>
                            {(() => {
                              const videoUrl = extractVideoUrl(post.content);
                              if (!videoUrl) return null;
                              return (
                                <div className="relative w-full mt-3 border-2 border-white/20" style={{paddingBottom:'56.25%'}}>
                                  <iframe className="absolute inset-0 w-full h-full" src={getEmbedUrl(videoUrl)}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                                </div>
                              );
                            })()}
                            {post.type === 'deal' && (
                              <div className="mt-3 border-2 border-brand-pink/40 bg-brand-pink/10 px-4 py-3 flex items-center gap-3">
                                <span className="material-symbols-outlined text-brand-pink text-2xl">handshake</span>
                                <p className="text-brand-pink text-[10px] font-black uppercase italic tracking-widest">Deal Announced — Rights Licensed</p>
                              </div>
                            )}
                            <div className="flex items-center gap-5 mt-3">
                              <button onClick={() => handleLike(post.id)}
                                className={`flex items-center gap-1 text-[11px] font-black transition-all ${isLiked ? 'text-brand-pink' : 'text-white/30 hover:text-brand-pink'}`}>
                                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                                {lc > 0 && <span>{lc}</span>}
                              </button>
                              {pid && (
                                <button onClick={() => { onViewProducer?.(pid); onNavigate('producer'); }}
                                  className="text-[10px] font-black uppercase italic text-white/20 hover:text-brand-cyan transition-colors">
                                  Profile →
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!isLaff && (
                <div className="mt-8 border-4 border-brand-yellow p-8 text-center shadow-neo-yellow">
                  <p className="text-[9px] font-black uppercase italic text-brand-yellow tracking-widest mb-2">Members only</p>
                  <h2 className="text-3xl font-black uppercase italic text-white mb-1">Full Wire Access</h2>
                  <p className="text-white/40 font-bold italic text-sm mb-6">LAFF — 7 days · ROAR — live, real-time, post & engage</p>
                  <button onClick={() => onNavigate('pricing')}
                    className="bg-brand-yellow text-black px-10 py-4 font-black uppercase italic border-4 border-black hover:bg-white transition-all">
                    Upgrade Now →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default LaffWirePage;
