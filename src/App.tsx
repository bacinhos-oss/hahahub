import { mapShow } from './lib/mapShow';
import React, { useState, useEffect, lazy as lazyReact, Suspense } from 'react'
import { supabase } from './lib/supabase'
import { Page, User, Show } from './types'
import LandingPage from './pages/LandingPage'
import DiscoveryPage from './pages/DiscoveryPage'
import CookieBanner from './components/CookieBanner'
import FeedbackButton from './components/FeedbackButton'
import OnboardingWizard from './components/OnboardingWizard'
import Smile from './components/Smile'
import { Analytics } from "@vercel/analytics/react"
import { logError } from './lib/errorLogger'
import { getTier, isSampleShow } from './components/Mascot'
// Pages most visitors never open load only when needed, so the first screen appears faster on phones.
// If a new version was deployed while the tab was open, the old page files are gone: reload once to get the new ones.
const lazy = (load: () => Promise<{ default: React.ComponentType<any> }>) =>
  lazyReact(() => load().catch((err) => {
    if (!sessionStorage.getItem('hh-reloaded')) { sessionStorage.setItem('hh-reloaded', '1'); window.location.reload() }
    throw err
  }))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const UploadPage = lazy(() => import('./pages/UploadPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const FAQPage = lazy(() => import('./pages/FAQPage'))
const LaffWirePage = lazy(() => import('./pages/LaffWirePage'))
const ProducerPage = lazy(() => import('./pages/ProducerPage'))

const ADMIN_EMAIL = 'bacinhos@gmail.com'
const VALID_PAGES: string[] = ['landing','discovery','admin','login','subscription','about','privacy','terms','upload','faq','producer','wire']

const App: React.FC = () => {
  const [currentPage, setCurrentPageRaw] = useState<Page>('landing')
  const setCurrentPage = (page: Page) => {
    window.scrollTo(0, 0)
    setCurrentPageRaw(page)
    // Pushes a real browser history entry, so the back button moves between
    // in-app pages instead of leaving the app, and a refresh lands back on
    // the same page instead of resetting to Landing.
    if (window.location.hash !== `#${page}`) {
      window.location.hash = page
    }
  }
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [shows, setShows] = useState<Show[]>([])
  const [currentProducerId, setCurrentProducerId] = useState<string | undefined>(undefined)
  const [currentShowId, setCurrentShowId] = useState<string | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [suspendedNotice, setSuspendedNotice] = useState(false)

  // My Hub tells us when the member changes their profile photo, so the navigation updates at once.
  useEffect(() => {
    const onAvatar = (e: Event) => setCurrentUser(u => (u ? ({ ...u, avatar_url: (e as CustomEvent).detail || '' } as any) : u))
    window.addEventListener('hh-avatar', onAvatar)
    return () => window.removeEventListener('hh-avatar', onAvatar)
  }, [])

  useEffect(() => {
    // Direct show link: hahahub.art/show/<id>  ->  open that show in the catalog
    const showMatch = window.location.pathname.match(/^\/show\/([A-Za-z0-9-]+)/)
    if (showMatch) {
      setCurrentShowId(showMatch[1])
      setCurrentPageRaw('discovery')
      window.history.replaceState(null, '', '/#discovery')
    }
    const hash = window.location.hash
    if (hash.includes('type=recovery')) {
      setCurrentPage('login')
      setLoading(false)
      return
    }
    if (hash === '#login' || hash === '#signup') {
      setCurrentPageRaw('login')
    } else {
      const hashPage = hash.substring(1)
      if (VALID_PAGES.includes(hashPage)) {
        setCurrentPageRaw(hashPage as Page)
      } else if (hashPage && !hashPage.includes('=')) {
        setCurrentPageRaw('notfound' as any) // unknown #page -> 404
      }
    }

    // Back/forward browser navigation between in-app pages.
    const handleHashChange = () => {
      const h = window.location.hash.substring(1)
      if (h === 'signup') return // signup is a LoginPage-only sub-state, not a real page
      if (VALID_PAGES.includes(h)) {
        setCurrentPageRaw(h as Page)
        window.scrollTo(0, 0)
      } else if (h === '') {
        setCurrentPageRaw('landing')
        window.scrollTo(0, 0)
      } else if (!h.includes('=')) {
        setCurrentPageRaw('notfound' as any)
        window.scrollTo(0, 0)
      }
    }
    window.addEventListener('hashchange', handleHashChange)

    loadShows()

    // onAuthStateChange pokrije vse — INITIAL_SESSION, SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        if (session?.user) {
          loadProfile(session.user.id, session.user.email!, event === 'INITIAL_SESSION')
          // On a fresh page load with an already-active session (e.g. after
          // a browser refresh), land logged-in users on Discovery instead of
          // the public Landing page. Only kicks in if nothing else (like a
          // #login/#signup link, or password recovery) already navigated us
          // away from the default 'landing' state.
          if (event === 'INITIAL_SESSION') {
            setCurrentPageRaw(prev => {
              if (prev === 'landing') {
                window.location.hash = 'discovery'
                return 'discovery'
              }
              return prev
            })
          }
        } else {
          setLoading(false)
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null)
        setLoading(false)
      }
    })

    const channel = supabase
      .channel('shows-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'shows' }, () => {
        loadShows()
      })
      .subscribe()

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
      authSubscription.unsubscribe()
      supabase.removeChannel(channel)
    }
  }, [])

  const loadProfile = async (userId: string, email: string, showNotice = false) => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
      const isAdmin = email === ADMIN_EMAIL
      if (data?.suspended && !isAdmin) {
        await supabase.auth.signOut()
        setCurrentUser(null)
        if (showNotice) setSuspendedNotice(true)
        setLoading(false)
        return
      }
      const user: User = {
        id: userId, email,
        name: data?.name || email.split('@')[0].toUpperCase(),
        role: isAdmin ? 'admin' : 'Producer',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        isPaid: data?.is_paid || isAdmin, isAdmin,
        plan: 'roar', // HahaHub is free: every member has full access
        is_verified: data?.is_verified || false,
        is_founding: data?.is_founding || false,
        member_tier: data?.member_tier || null,
        avatar_url: data?.avatar_url || '',
        subscription: data?.is_paid || isAdmin ? { type: 'Annual', expiryDate: data?.subscription_expiry || 'Dec 24, 2025', status: 'Active', discounts: ['-20% on script printing', 'VIP Networking', 'Unlimited PDF downloads'] } : undefined,
        favorites: data?.favorites || [],
      }
      setCurrentUser(user)
      if (isAdmin) setIsAdminAuthenticated(true)
      if (!data?.onboarded && !isAdmin) setShowOnboarding(true)
      setLoading(false)
    } catch { 
      setCurrentUser(null)
      setLoading(false)
    }
  }

  const loadShows = async () => {
    let { data } = await supabase.from('shows').select('*').order('created_at', { ascending: false })
    if (!data) return
    // Hide shows of suspended members (if the function is missing, show everything)
    const { data: suspendedIds } = await supabase.rpc('suspended_member_ids')
    const hidden = new Set<string>((suspendedIds || []).map((r: any) => typeof r === 'string' ? r : r?.suspended_member_ids).filter(Boolean))
    if (hidden.size) data = data.filter((s: any) => !hidden.has(s.user_id))
    const userIds = [...new Set(data.map((s: any) => s.user_id).filter(Boolean))]
    let profileMap: Record<string, { is_verified: boolean; is_founding: boolean; user_type: string; member_tier: string | null }> = {}
    if (userIds.length > 0) {
      const { data: profiles } = await supabase.rpc('show_producer_flags', { p_ids: userIds })
      if (profiles) {
        profiles.forEach((p: any) => {
          profileMap[p.id] = { is_verified: p.is_verified || false, is_founding: p.is_founding || false, user_type: p.user_type || 'gigl', member_tier: p.member_tier || null }
        })
      }
    }
    mapAndSetShows(data, profileMap)
  }

  const mapAndSetShows = (data: any[], profileMap: Record<string, { is_verified: boolean; is_founding: boolean; user_type: string; member_tier: string | null }> = {}) => {
    const mapped = data.map((s: any) => mapShow(s, profileMap[s.user_id]))
    setShows(mapped)
  }

  const handleUpdateShow = (updatedShow: Show) => {
    setShows(prev => prev.map(s => s.id === updatedShow.id ? updatedShow : s))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setCurrentUser(null)
    setIsAdminAuthenticated(false)
    setCurrentPage('landing')
  }

  const handleToggleFavorite = async (showId: string) => {
    if (!currentUser) return
    const isFav = currentUser.favorites.includes(showId)
    const newFavs = isFav 
      ? currentUser.favorites.filter((id: string) => id !== showId)
      : [...currentUser.favorites, showId]
    setCurrentUser({ ...currentUser, favorites: newFavs })
    setShows(prev => prev.map(s => s.id === showId 
      ? { ...s, likesCount: isFav ? Math.max(0, s.likesCount - 1) : s.likesCount + 1 }
      : s
    ))
    if (currentUser.id) {
      const { error: favErr } = await supabase.from('profiles').update({ favorites: newFavs }).eq('id', currentUser.id)
      if (favErr) {
        console.error('Favorite save failed:', favErr)
        // roll back the optimistic update so the heart tells the truth
        setCurrentUser((u: any) => u ? { ...u, favorites: currentUser.favorites } : u)
        setShows(prev => prev.map(s => s.id === showId ? { ...s, likesCount: isFav ? s.likesCount + 1 : Math.max(0, s.likesCount - 1) } : s))
        alert('Could not save your like (' + favErr.message + '). Please log out and in again, or contact info@hahahub.art.')
        return
      }
      const { error: likeErr } = await supabase.rpc('adjust_show_likes', { p_show_id: showId, p_delta: isFav ? -1 : 1 })
      if (likeErr) console.error('adjust_show_likes failed:', likeErr)
    }
  }

  const handleUpdateStats = async (showId: string, type: 'view' | 'inquiry') => {
    if (!showId) return
    // A producer looking at their own show, or the admin browsing, is not a real view.
    if (type === 'view') {
      const sh: any = shows.find(s => s.id === showId)
      if (currentUser?.isAdmin || currentUser?.email === 'bacinhos@gmail.com' || (sh && currentUser?.id && sh.user_id === currentUser.id)) return
    }
    // Optimistic update UI
    setShows(prev => prev.map(s => {
      if (s.id !== showId) return s
      return {
        ...s,
        viewsCount: type === 'view' ? s.viewsCount + 1 : s.viewsCount,
        inquiriesCount: type === 'inquiry' ? s.inquiriesCount + 1 : s.inquiriesCount,
      }
    }))
    if (type === 'view') {
      // Single atomic call — replaces the old read-then-write + separate
      // insert, which could race or get abandoned on fast navigation.
      const { error: viewError } = await supabase.rpc('record_show_view', { p_show_id: showId, p_user_id: currentUser?.id || null })
      if (viewError) console.error('record_show_view failed:', viewError)
    }
    if (type === 'inquiry') {
      const { error: inqErr } = await supabase.rpc('bump_show_inquiries', { p_show_id: showId })
      if (inqErr) console.error('bump_show_inquiries failed:', inqErr)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center">
      <Smile height={96} className="animate-pulse" />
    </div>
  )

  const handleUpload = async (newShow: Show) => {
    // UploadPage.tsx already performed the actual insert and got back the
    // real DB row (with id) before calling this. This used to insert AGAIN
    // here, re-mapping camelCase field names against an already-snake_case
    // object — which both duplicated every upload in the shows table AND
    // wrote a mostly-empty second row (since e.g. newShow.maleRoles is
    // undefined on a snake_case row, only newShow.male_roles exists).
    // Simplest correct fix: just refresh from DB so the new row is mapped
    // through the same camelCase pipeline as everything else.
    await loadShows()
    // Announce the new show on LaffWire (not for sample shows).
    const ns: any = newShow
    if (currentUser?.id && ns?.id && !isSampleShow(ns)) {
      const title = ns.english_title || ns.title || 'A new show'
      const kind = (ns.subgenre || ns.genre || 'comedy').toString().toLowerCase()
      const from = ns.location ? ` from ${ns.location}` : ''
      const post = { user_id: currentUser.id, type: 'new_show', content: `New in the catalog: "${title}", a ${kind}${from}.`, likes_count: 0, is_private: false }
      const { error: postErr } = await supabase.from('posts').insert({ ...post, show_id: String(ns.id) })
      if (postErr) await supabase.from('posts').insert(post)
    }
    // First show listed: the member becomes a Verified Producer.
    if (currentUser && !currentUser.isAdmin && getTier(currentUser) === 'member') {
      const { data: promoted } = await supabase.rpc('claim_verified')
      if (promoted === true) {
        setCurrentUser({ ...currentUser, is_verified: true, member_tier: 'verified' } as any)
        const n: any = newShow
        sendEmail('became_verified', currentUser.email, { name: currentUser.name, showTitle: n?.english_title || n?.title || newShow?.title || '' })
      }
    }
  }

  const sendEmail = async (type: string, to: string, data: any) => {
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, to, data }),
      });
    } catch (err) {
      console.error('Email send error:', err);
      logError('sendEmail', err, { userId: currentUser?.id, userEmail: currentUser?.email, details: { type } });
    }
  };

  const renderPage = () => {

    const effectivePage = (() => {
      if (currentPage === 'landing' && currentUser) return 'discovery'
      if (currentPage === 'upload' && !currentUser) return 'landing'
      if ((currentPage === 'wire' || currentPage === 'subscription') && !currentUser) return 'login'
      return currentPage
    })()

    switch (effectivePage) {
      case 'landing': return <LandingPage onNavigate={(p) => setCurrentPage(p)} shows={shows} />
      case 'discovery': return <DiscoveryPage onNavigate={(p) => setCurrentPage(p)} onLogout={handleLogout} user={currentUser || undefined} onToggleFavorite={handleToggleFavorite} onUpdateStats={handleUpdateStats} shows={shows} onViewProducer={(id) => setCurrentProducerId(id)} initialShowId={currentShowId} />
      case 'admin': return <AdminPage onNavigate={(p) => setCurrentPage(p)} onLogout={handleLogout} shows={shows} onDeleteShow={(id) => setShows(prev => prev.filter(s => s.id !== id))} />
      case 'login': return <LoginPage 
        onSuccess={(isPaid: boolean) => setCurrentPage('discovery')} 
        onBack={() => setCurrentPage('landing')} 
        setCurrentUser={setCurrentUser} 
      />
      case 'subscription': return <SubscriptionPage onUpdateShow={handleUpdateShow} onNavigate={(p) => { if (p === 'producer' && currentUser?.id) { setCurrentProducerId(currentUser.id); } setCurrentPage(p); }} onLogout={handleLogout} user={currentUser || undefined} onToggleFavorite={handleToggleFavorite} shows={shows} onDeleteShow={(id) => setShows(prev => prev.filter(s => s.id !== id))} />
      case 'about': return <AboutPage onNavigate={(p) => setCurrentPage(p)} onLogout={handleLogout} user={currentUser || undefined} />
      case 'privacy': return <PrivacyPage onNavigate={(p) => setCurrentPage(p)} onLogout={handleLogout} user={currentUser || undefined} />
      case 'terms': return <TermsPage onNavigate={(p) => setCurrentPage(p)} onLogout={handleLogout} user={currentUser || undefined} />
      case 'upload': return <UploadPage onNavigate={(p) => setCurrentPage(p)} onLogout={handleLogout} user={currentUser || undefined} onUpload={handleUpload} userShowCount={shows.filter(s => (s as any).user_id === currentUser?.id).length} />
      case 'faq': return <FAQPage onNavigate={(p) => setCurrentPage(p)} onLogout={handleLogout} user={currentUser || undefined} />
      case 'wire': return <LaffWirePage onNavigate={(p) => setCurrentPage(p)} onLogout={handleLogout} user={currentUser || undefined} onViewProducer={(id) => { setCurrentProducerId(id); setCurrentPage('producer'); }} shows={shows} onViewShow={(id) => { setCurrentShowId(id); setCurrentPage('discovery'); }} />
      case 'producer': return <ProducerPage onNavigate={(p) => setCurrentPage(p)} onLogout={handleLogout} user={currentUser || undefined} producerId={currentProducerId} shows={shows} onUpdateStats={handleUpdateStats} onViewShow={(id) => { setCurrentShowId(id); setCurrentPage('discovery'); }} />
      default: return <NotFoundPage onNavigate={(p) => setCurrentPage(p)} />
    }
  }

  return (
    <div className="min-h-screen">
      <Suspense fallback={<div className="min-h-screen bg-brand-black flex items-center justify-center"><Smile height={96} className="animate-pulse" /></div>}>
        {renderPage()}
      </Suspense>
      {suspendedNotice && (
        <div className="fixed inset-0 z-[100] bg-brand-black/95 flex items-center justify-center px-4">
          <div className="max-w-md w-full border-2 border-brand-pink bg-brand-black p-8 text-center">
            <Smile height={72} className="mx-auto mb-6" />
            <h2 className="text-2xl font-black uppercase italic text-white mb-3">Membership on hold</h2>
            <p className="text-white/60 font-bold italic leading-relaxed mb-8">Your HahaHub.art membership is paused while we review it. Check your email, or write to info@hahahub.art.</p>
            <button onClick={() => { setSuspendedNotice(false); setCurrentPage('landing') }} className="bg-white text-black px-8 py-3 font-black uppercase italic text-sm hover:bg-brand-pink hover:text-white transition-colors">OK</button>
          </div>
        </div>
      )}
      <CookieBanner />
      <FeedbackButton />
      <Analytics />
      {showOnboarding && currentUser?.id && (
        <OnboardingWizard
          userId={currentUser.id}
          userName={currentUser.name}
          onComplete={(result) => {
            setShowOnboarding(false);
            const page = result.split('|')[1];
            if (page) setCurrentPage(page as any);
          }}
        />
      )}
    </div>
  )
}

export default App
