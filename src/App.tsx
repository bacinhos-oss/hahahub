import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { Page, User, Show } from './types'
import LandingPage from './pages/LandingPage'
import DiscoveryPage from './pages/DiscoveryPage'
import AdminPage from './pages/AdminPage'
import UploadPage from './pages/UploadPage'
import SubscriptionPage from './pages/SubscriptionPage'
import AboutPage from './pages/AboutPage'
import LoginPage from './pages/LoginPage'
import PrivacyPage from './pages/PrivacyPage'
import CookieBanner from './components/CookieBanner'

const ADMIN_EMAIL = 'bacinhos@gmail.com'

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('landing')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [shows, setShows] = useState<Show[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)

  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('type=recovery')) {
      setCurrentPage('login')
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        localStorage.setItem('sb-jnilgukmyfukazwduuig-auth-token', JSON.stringify(session))
        loadProfile(session.user.id, session.user.email!)
      } else {
        setLoading(false)
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setCurrentPage('login')
        setLoading(false)
      } else if (session?.user) {
        localStorage.setItem('sb-jnilgukmyfukazwduuig-auth-token', JSON.stringify(session))
        loadProfile(session.user.id, session.user.email!)
      } else {
        setCurrentUser(null)
        setLoading(false)
      }
    })    
    loadShows()
    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId: string, email: string) => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
      const isAdmin = email === ADMIN_EMAIL
      const user: User = {
        id: userId,
        email,
        name: data?.name || email.split('@')[0].toUpperCase(),
        role: isAdmin ? 'admin' : 'Producer',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        isPaid: data?.is_paid || isAdmin,
        isAdmin,
        subscription: data?.is_paid || isAdmin ? {
          type: 'Annual',
          expiryDate: data?.subscription_expiry || 'Dec 24, 2025',
          status: 'Active',
          discounts: ['-20% on script printing', 'VIP Networking', 'Unlimited PDF downloads']
        } : undefined,
        favorites: data?.favorites || [],
        uploadedShowIds: data?.uploaded_show_ids || [],
      }
      setCurrentUser(user)
      if (isAdmin) setIsAdminAuthenticated(true)
      setLoading(false)
    } catch { 
      setCurrentUser(null)
      setLoading(false)
    }
  }

  const loadShows = async () => {
    const { data } = await supabase.from('shows').select('*').order('created_at', { ascending: false })
    if (data) {
      const mapped = data.map((s: any) => ({
        ...s,
        id: s.id,
        title: s.title || '',
        author: s.author || '',
        director: s.director || '',
        synopsis: s.synopsis || '',
        imageUrl: s.image_url || '',
        genre: s.genre || '',
        language: s.language || '',
        location: s.location || '',
        duration: s.duration || 90,
        maleRoles: s.male_roles || 1,
        femaleRoles: s.female_roles || 1,
        producerName: s.producer_name || '',
        producerEmail: s.producer_email || '',
        rightsHolder: s.rights_holder || '',
        premiereDate: s.premiere_date || '',
        productionYear: s.production_year || new Date().getFullYear(),
        licenseType: s.license_type || 'License',
        scriptScenario: s.script_scenario || '',
        likesCount: s.likes_count || 0,
        viewsCount: s.views_count || 0,
        inquiriesCount: s.inquiries_count || 0,
        productionScale: s.production_scale || 'Medium',
        isTouringFriendly: s.is_touring_friendly ?? true,
        hasIntermission: s.has_intermission ?? true,
        exclusivityLevel: s.exclusivity_level || 'Exclusive',
        licensingModel: s.licensing_model || 'Royalty-based',
      }))
      setShows(mapped)
    }
  }

  const handleNavigate = (page: Page) => {
    if (page === 'upload' || page === 'subscription') {
      if (!currentUser) {
        setCurrentPage('login')
        return
      }
    }
    if (page === 'admin' && !isAdminAuthenticated) {
      setCurrentPage('login')
      return
    }
    setCurrentPage(page)
  }

  const handleLogin = (user: User) => {
    setCurrentUser(user)
    setCurrentPage('discovery')
  }

  const handleLogout = async () => {
    localStorage.removeItem('sb-jnilgukmyfukazwduuig-auth-token')
    await supabase.auth.signOut()
    setCurrentUser(null)
    setIsAdminAuthenticated(false)
    setCurrentPage('landing')
  }

  const handleToggleFavorite = (showId: string) => {
    if (!currentUser) return
    const isFav = currentUser.favorites.includes(showId)
    setShows(prev => prev.map(s => s.id === showId ? { ...s, likesCount: isFav ? Math.max(0, s.likesCount - 1) : s.likesCount + 1 } : s))
    const newFavs = isFav ? currentUser.favorites.filter(id => id !== showId) : [...currentUser.favorites, showId]
    setCurrentUser({ ...currentUser, favorites: newFavs })
    if (currentUser.id) {
      supabase.from('profiles').update({ favorites: newFavs }).eq('id', currentUser.id)
    }
  }

  const handleUpdateStats = (showId: string, type: 'view' | 'inquiry') => {
    setShows(prev => prev.map(s => {
      if (s.id === showId) {
        if (type === 'view') return { ...s, viewsCount: s.viewsCount + 1 }
        if (type === 'inquiry') return { ...s, inquiriesCount: s.inquiriesCount + 1 }
      }
      return s
    }))
  }

  const handleUpload = async (newShow: Show) => {
    const dbShow: any = {
      user_id: currentUser?.id,
      title: newShow.title,
      author: newShow.author,
      director: newShow.director,
      synopsis: newShow.synopsis,
      image_url: newShow.imageUrl,
      genre: newShow.genre,
      language: newShow.language,
      location: newShow.location,
      duration: newShow.duration,
      male_roles: newShow.maleRoles,
      female_roles: newShow.femaleRoles,
      producer_name: newShow.producerName,
      producer_email: newShow.producerEmail,
      rights_holder: newShow.rightsHolder,
      premiere_date: newShow.premiereDate,
      production_year: newShow.productionYear,
      license_type: newShow.licenseType,
      script_scenario: newShow.scriptScenario,
      likes_count: 0,
      views_count: 0,
      inquiries_count: 0
    }
    const { data, error } = await supabase.from('shows').insert([dbShow]).select().single()
    if (error) {
      alert('Error saving show: ' + error.message)
      return
    }
    if (data) {
      const mapped = { ...newShow, id: data.id }
      setShows(prev => [mapped, ...prev])
      if (currentUser?.id) {
        const newIds = [...(currentUser.uploadedShowIds || []), data.id]
        await supabase.from('profiles').update({ uploaded_show_ids: newIds }).eq('id', currentUser.id)
        setCurrentUser(prev => prev ? { ...prev, uploadedShowIds: newIds } : null)
      }
    }
  }

  const handleDeleteShow = async (id: string) => {
    await supabase.from('shows').delete().eq('id', id)
    setShows(prev => prev.filter(s => s.id !== id))
  }

  const handlePurchaseSuccess = async (planName: string) => {
    const expiry = new Date()
    expiry.setFullYear(expiry.getFullYear() + 1)
    const expiryStr = expiry.toISOString().split('T')[0]
    if (currentUser?.id) {
      await supabase.from('profiles').update({ is_paid: true, subscription_expiry: expiryStr }).eq('id', currentUser.id)
    }
    const premiumUser: User = {
      ...currentUser!,
      isPaid: true,
      subscription: {
        type: planName.includes('Annual') ? 'Annual' : 'Quarterly',
        expiryDate: expiryStr,
        status: 'Active',
        discounts: ['-20% on script printing', 'VIP Networking', 'Unlimited PDF downloads']
      }
    }
    setCurrentUser(premiumUser)
    setCurrentPage('discovery')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'Bowlby One SC, cursive', fontSize: '3rem', color: '#FFDE03', textShadow: '2px 2px 0 #FF0266, 4px 4px 0 #03DAC6' }}>HAHAHUB</div>
      </div>
    )
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} onPurchaseSuccess={handlePurchaseSuccess} shows={shows} />
      case 'discovery':
        return <DiscoveryPage onNavigate={handleNavigate} onLogout={handleLogout} user={currentUser || undefined} onToggleFavorite={handleToggleFavorite} onUpdateStats={handleUpdateStats} shows={shows} />
      case 'subscription':
        return <SubscriptionPage onNavigate={handleNavigate} onLogout={handleLogout} user={currentUser || undefined} onToggleFavorite={handleToggleFavorite} onUpload={handleUpload} shows={shows} />
      case 'about':
        return <AboutPage onNavigate={handleNavigate} onLogout={handleLogout} user={currentUser || undefined} />
      case 'upload':
        return <UploadPage onNavigate={handleNavigate} onLogout={handleLogout} user={currentUser || undefined} onUpload={handleUpload} />
      case 'admin':
        return isAdminAuthenticated
          ? <AdminPage onNavigate={handleNavigate} onLogout={handleLogout} shows={shows} onDeleteShow={handleDeleteShow} />
          : <LoginPage onSuccess={() => { setIsAdminAuthenticated(true); setCurrentPage('admin') }} onBack={() => setCurrentPage('landing')} setCurrentUser={setCurrentUser} adminMode />
      case 'login':
        return <LoginPage onSuccess={() => { handleLogin(currentUser!); setCurrentPage('discovery') }} onBack={() => setCurrentPage('landing')} setCurrentUser={setCurrentUser} />
      case 'privacy':
        return <PrivacyPage onNavigate={handleNavigate} onLogout={handleLogout} user={currentUser || undefined} />
      default:
        return <LandingPage onNavigate={handleNavigate} onPurchaseSuccess={handlePurchaseSuccess} shows={shows} />
    }
  }

  return (
    <div className="min-h-screen">
      {renderPage()}
      <CookieBanner />
    </div>
  )
}

export default App