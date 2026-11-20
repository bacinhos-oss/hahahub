import React, { useState, useEffect, useRef } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Page, User } from '../types';
import { supabase } from '../lib/supabase';
import Smile from '../components/Smile';
import { Mascot, ProfilePhoto, getTier, isShownTier } from '../components/Mascot';

interface LaffWirePageProps {
  onNavigate: (page: Page) => void;
  onLogout?: () => void;
  user?: User;
  onViewProducer?: (producerId: string) => void;
  shows?: any[];
  onViewShow?: (id: string) => void;
}

const POST_TYPES: Record<string, { label: string; bg: string; text: string }> = {
  deal:          { label: '🥊 DEAL CLOSED',   bg: '#EF4986', text: '#fff' },
  new_show:      { label: 'NEW SHOW',         bg: '#FFC80E', text: '#000' },
  discount:      { label: 'DISCOUNT',         bg: '#EF4986', text: '#fff' },
  co_production: { label: 'CO-PRODUCTION',    bg: '#19A596', text: '#000' },
  news:          { label: 'NEWS',             bg: '#fff',    text: '#000' },
  rights:        { label: 'RIGHTS',           bg: '#FFC80E', text: '#000' },
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



const LaffWirePage: React.FC<LaffWirePageProps> = ({ onNavigate, onLogout, user, onViewProducer, shows = [], onViewShow }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState('news');
  const [submitting, setSubmitting] = useState(false);
  const [postError, setPostError] = useState('');
  const [postSuccess, setPostSuccess] = useState(false);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [myAvatar, setMyAvatar] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editType, setEditType] = useState('news');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ id: string; msg: string } | null>(null);


  useEffect(() => { loadPosts(); }, []);
  useEffect(() => {
    if (!user?.id) return;
    supabase.from('profiles').select('avatar_url').eq('id', user.id).maybeSingle()
      .then(({ data }) => setMyAvatar(data?.avatar_url || ''));
  }, [user?.id]);

  const startEdit = (post: any) => {
    setEditingId(post.id); setEditText(post.content || ''); setEditType(post.type || 'news');
    setConfirmDeleteId(null); setRowError(null);
  };

  const saveEdit = async (post: any) => {
    const text = editText.trim();
    if (!text) return;
    setBusyId(post.id); setRowError(null);
    const { error } = await supabase.rpc('edit_post', { p_post_id: String(post.id), p_content: text, p_type: editType });
    setBusyId(null);
    if (error) { setRowError({ id: post.id, msg: 'Could not save the change. Please try again.' }); return; }
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, content: text, type: editType, edited_at: new Date().toISOString() } : p));
    setEditingId(null);
  };

  const deletePost = async (post: any) => {
    setBusyId(post.id); setRowError(null);
    const { error } = await supabase.rpc('delete_post', { p_post_id: String(post.id) });
    setBusyId(null);
    if (error) { setRowError({ id: post.id, msg: 'Could not delete the post. Please try again.' }); return; }
    setPosts(prev => prev.filter(p => p.id !== post.id));
    setConfirmDeleteId(null);
  };

  const loadPosts = async () => {
    setLoading(true);
    let q = supabase.from('posts')
      .select('*, profiles(id, name, is_verified, is_founding, member_tier, avatar_url)')
      .eq('is_private', false)
      .order('created_at', { ascending: false });
    q = q.limit(200);
    const { data } = await q;
    setPosts(data || []);
    const lc: Record<string, number> = {};
    data?.forEach((p: any) => { lc[p.id] = p.likes_count || 0; });
    setLikeCounts(lc);
    setLoading(false);
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
    await supabase.rpc('adjust_post_likes', { p_post_id: postId, p_delta: isNowLiked ? 1 : -1 });
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
              <div className="flex items-center gap-1.5 text-brand-pink text-[9px] font-black uppercase italic">
                <span className="w-2 h-2 rounded-full bg-brand-pink animate-pulse"></span>LIVE
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 md:px-0 py-6">



          {/* PUBLIC FEED */}
          <div className="space-y-0">
              {user && (
                <div className="border-b-4 border-white/10 pb-6 mb-2">
                  <div className="flex gap-3">
                    <ProfilePhoto name={user?.name} url={myAvatar || user?.avatar_url} tier={getTier(user || {})} size={44} className="mt-1" />
                    <div className="flex-1 space-y-3">
                      <textarea
                        ref={textRef}
                        value={newPost}
                        onChange={e => { setNewPost(e.target.value); setPostError(''); }}
                        placeholder="What's happening in your theatre world?"
                        className="w-full bg-transparent border-none text-white font-bold italic text-base outline-none placeholder:text-white/20 resize-none min-h-[60px]"
                        rows={2}
                        maxLength={500}
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
                          className="bg-white text-black px-6 py-2 font-black uppercase italic text-xs border-2 border-black disabled:opacity-30 hover:bg-brand-pink hover:text-white transition-all">
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
                <div className="py-20 text-center space-y-4">
                  <div className="flex justify-center"><Smile height={96} className="opacity-70" /></div>
                  <p className="text-white/40 font-black uppercase italic text-lg">Wire's quiet.</p>
                  <p className="text-white/20 text-sm italic">No industry news yet. Be the first to punch it out.</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {posts.map((post, i) => {
                    const type = POST_TYPES[post.type] || POST_TYPES.news;
                    const pid = post.profiles?.id;
                    const lc = likeCounts[post.id] ?? 0;
                    const isLiked = liked[post.id] || false;
                    const isMine = !!user?.id && post.user_id === user.id;
                    const canDelete = isMine || !!user?.isAdmin;
                    const isEditing = editingId === post.id;

                    return (
                      <div key={post.id} className="py-5 border-b border-white/10">
                        <div className="flex gap-3">
                          <button onClick={() => pid && onViewProducer && (onViewProducer(pid), onNavigate('producer'))} disabled={!pid} className="flex-shrink-0 self-start disabled:cursor-default">
                            <ProfilePhoto name={post.profiles?.name} url={post.profiles?.avatar_url} tier={getTier(post.profiles || {})} size={44} className="mt-1" />
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <button onClick={() => pid && onViewProducer && (onViewProducer(pid), onNavigate('producer'))} disabled={!pid}
                                className="font-black uppercase italic text-sm text-white hover:text-brand-yellow transition-colors disabled:cursor-default">
                                {post.profiles?.name || 'Producer'}
                              </button>
                              {isShownTier(getTier(post.profiles || {})) && <Mascot tier={getTier(post.profiles || {})} height={16} />}
                              <span className="text-white/20 text-[9px] italic ml-auto">{timeAgo(post.created_at)}{post.edited_at ? ' · edited' : ''}</span>
                            </div>
                            {isEditing ? (
                              <div className="space-y-3 border-2 border-white/20 p-3 mb-1">
                                <textarea value={editText} onChange={e => setEditText(e.target.value)} maxLength={500} rows={3} autoFocus
                                  className="w-full bg-transparent text-white font-bold italic text-sm outline-none resize-y" />
                                <div className="flex gap-2 flex-wrap">
                                  {Object.entries(POST_TYPES).map(([key, val]) => (
                                    <button key={key} onClick={() => setEditType(key)}
                                      className={`px-3 py-1 text-[8px] font-black uppercase italic border-2 transition-all rounded-full ${editType === key ? 'border-black' : 'border-white/20 text-white/30 hover:border-white/50'}`}
                                      style={editType === key ? { background: val.bg, color: val.text, borderColor: '#000' } : {}}>
                                      {val.label}
                                    </button>
                                  ))}
                                </div>
                                <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10">
                                  <p className="text-white/20 text-[10px] italic">{editText.length}/500</p>
                                  <div className="flex gap-2">
                                    <button onClick={() => setEditingId(null)} className="px-4 py-1.5 text-[10px] font-black uppercase italic text-white/50 hover:text-white">Cancel</button>
                                    <button onClick={() => saveEdit(post)} disabled={busyId === post.id || !editText.trim()}
                                      className="bg-white text-black px-4 py-1.5 font-black uppercase italic text-[10px] border-2 border-black disabled:opacity-30 hover:bg-brand-cyan transition-all">
                                      {busyId === post.id ? '...' : 'Save'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <>
                                <span className="inline-block text-[7px] font-black uppercase italic px-2 py-0.5 rounded-full mb-2 border border-black"
                                  style={{ background: type.bg, color: type.text }}>
                                  {type.label}
                                </span>
                                <p className="text-white/80 font-bold italic leading-relaxed text-sm whitespace-pre-line break-words">{post.content}</p>
                              </>
                            )}
                            {!isEditing && (() => {
                              const videoUrl = extractVideoUrl(post.content);
                              if (!videoUrl) return null;
                              return (
                                <div className="relative w-full mt-3 border-2 border-white/20" style={{paddingBottom:'56.25%'}}>
                                  <iframe className="absolute inset-0 w-full h-full" src={getEmbedUrl(videoUrl)}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                                </div>
                              );
                            })()}
                            {!isEditing && post.show_id && (() => {
                              const sh: any = shows.find((x: any) => String(x.id) === String(post.show_id));
                              if (!sh) return null;
                              return (
                                <button onClick={() => onViewShow?.(String(sh.id))}
                                  className="mt-3 w-full flex gap-4 items-center text-left border-2 border-white/15 hover:border-brand-yellow bg-brand-surface p-3 transition-colors group">
                                  <span className="w-14 aspect-[2/3] flex-shrink-0 bg-black overflow-hidden flex items-center justify-center">
                                    {sh.imageUrl || sh.image_url
                                      ? <img src={sh.imageUrl || sh.image_url} loading="lazy" decoding="async" alt={sh.title} className="w-full h-full object-cover" />
                                      : <span className="font-black italic text-white/20 text-2xl">{(sh.title || '?')[0]}</span>}
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className="block text-[9px] font-black uppercase italic tracking-widest text-brand-pink">{sh.subgenre || sh.genre}{sh.location ? ' · ' + sh.location : ''}</span>
                                    <span className="block font-black uppercase italic text-white text-base leading-tight truncate">{sh.title}</span>
                                    <span className="block text-[10px] font-black uppercase italic text-white/40 group-hover:text-brand-yellow mt-1">View in catalog →</span>
                                  </span>
                                </button>
                              );
                            })()}
                            {post.type === 'deal' && (
                              <div className="mt-3 border-2 border-brand-pink/40 bg-brand-pink/10 px-4 py-3 flex items-center gap-3">
                                <span className="material-symbols-outlined text-brand-pink text-2xl">handshake</span>
                                <p className="text-brand-pink text-[10px] font-black uppercase italic tracking-widest">Deal Announced — Rights Licensed</p>
                              </div>
                            )}
                            {rowError?.id === post.id && <p className="text-brand-pink text-xs font-black italic mt-2">⚠ {rowError.msg}</p>}
                            <div className="flex items-center gap-5 mt-3 flex-wrap">
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
                              {!isEditing && (isMine || canDelete) && (
                                <div className="ml-auto flex items-center gap-4">
                                  {confirmDeleteId === post.id ? (
                                    <>
                                      <span className="text-[10px] font-black uppercase italic text-brand-pink">Delete this post?</span>
                                      <button onClick={() => deletePost(post)} disabled={busyId === post.id}
                                        className="text-[10px] font-black uppercase italic text-white bg-brand-pink px-3 py-1 disabled:opacity-40">
                                        {busyId === post.id ? '...' : 'Yes, delete'}
                                      </button>
                                      <button onClick={() => setConfirmDeleteId(null)} className="text-[10px] font-black uppercase italic text-white/40 hover:text-white">No</button>
                                    </>
                                  ) : (
                                    <>
                                      {isMine && (
                                        <button onClick={() => startEdit(post)} className="text-[10px] font-black uppercase italic text-white/25 hover:text-brand-yellow transition-colors">Edit</button>
                                      )}
                                      {canDelete && (
                                        <button onClick={() => { setConfirmDeleteId(post.id); setEditingId(null); setRowError(null); }}
                                          className="text-[10px] font-black uppercase italic text-white/25 hover:text-brand-pink transition-colors">Delete</button>
                                      )}
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!user && (
                <div className="mt-8 border-2 border-brand-yellow p-8 text-center ">
                  <p className="text-[9px] font-black uppercase italic text-brand-yellow tracking-widest mb-2">Members only</p>
                  <h2 className="text-3xl font-black uppercase italic text-white mb-1">Post on LaffWire</h2>
                  <p className="text-white/40 font-bold italic text-sm mb-6">LaffWire is open to every member. Membership is free.</p>
                  <button onClick={() => onNavigate('login')}
                    className="bg-white text-black px-10 py-4 font-black uppercase italic border-2 border-black hover:bg-brand-pink hover:text-white transition-all">
                    Become a member →
                  </button>
                </div>
              )}
            </div>
        </div>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default LaffWirePage;
