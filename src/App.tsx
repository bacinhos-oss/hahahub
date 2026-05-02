import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { Page, User, Show } from './types'
import LandingPage from './pages/LandingPage'
import DiscoveryPage from './pages/DiscoveryPage'
import AdminPage from './pages/AdminPage'
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
        const savedSession = localStorage.getItem('sb-jnilgukmyfukazwduuig-auth-token')
        if (savedSession) {
          try {
            const parsed = JSON.parse(savedSession)
            if (parsed?.user) {
              loadProfile(parsed.user.id, parsed.user.email || parsed.user.email)
            } else {
              setLoading(false)
            }
          } catch {
            setLoading(false)
          }
        } else {
          setLoading(false)
        }
      }
    })
    loadShows()
    return () => {}
  }, [])

  const loadProfile = async (userId: string, email: string) => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
      const isAdmin = email === ADMIN_EMAIL
      const user: User = {
        id: userId, email,
        name: data?.name || email.split('@')[0].toUpperCase(),
        role: isAdmin ? 'admin' : 'Producer',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        isPaid: data?.is_paid || isAdmin, isAdmin,
        subscription: data?.is_paid || isAdmin ? { type: 'Annual', expiryDate: data?.subscription_expiry || 'Dec 24, 2025', status: 'Active', discounts: ['-20% on script printing', 'VIP Networking', 'Unlimited PDF downloads'] } : undefined,
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
    const handleDeleteShow = async (id: string) => {
  await supabase.from('shows').delete().eq('id', id);
  setShows(prev => prev.filter(s => s.id !== id));
};

  const mapAndSetShows = (data: any[]) => {
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
      riskProfile: s.risk_profile || 'Emerging',
      subgenre: s.subgenre || '',
      directorNotes: s.director_notes || '',
      licensedCountries: s.licensed_countries || '',
      rightsStatus: s.rights_status || 'Available',
      licensingModel: s.licensing_model || 'Royalty-based',
      royaltyRange: s.royalty_range || '',
      advanceFee: s.advance_fee || '',
      exclusivityLevel: s.exclusivity_level || 'Exclusive',
      rightsClearingSpeed: s.rights_clearing_speed || 'Medium',
      boxOfficeIndicator: s.box_office_indicator || 'Emerging',
      budgetRange: s.budget_range || 'Medium',
      humorType: s.humor_type || 'Universal',
      productionScale: s.production_scale || 'Medium',
      isTouringFriendly: s.is_touring_friendly ?? true,
      techStaffLighting: s.tech_staff_lighting || 1,
      techStaffSound: s.tech_staff_sound || 1,
      techStaffPrompter: s.tech_staff_prompter || 0,
      techStaffStagehands: s.tech_staff_stagehands || 1,
      performancesCount: s.performances_count || 0,
      totalAudience: s.total_audience || 0,
      transparencyScore: s.transparency_score || 80,
      productionPhotos: s.production_photos || [],
    }))
    setShows(mapped)
  }

  const handleUpdateShow = (updatedShow: Show) => {
    setShows(prev => prev.map(s => s.id === updatedShow.id ? updatedShow : s))
  }

  const handleLogout = async () => {
    localStorage.removeItem('sb-jnilgukmyfukazwduuig-auth-token')
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
      await supabase.from('profiles').update({ favorites: newFavs }).eq('id', currentUser.id)
      await supabase.from('shows').update({ 
        likes_count: isFav ? Math.max(0, (shows.find(s => s.id === showId)?.likesCount || 1) - 1) : (shows.find(s => s.id === showId)?.likesCount || 0) + 1
      }).eq('id', showId)
    }
  }

  const handleUpdateStats = async (showId: string, type: 'view' | 'inquiry') => {
    if (!showId) return
    setShows(prev => prev.map(s => s.id === showId
      ? { ...s, viewsCount: type === 'view' ? s.viewsCount + 1 : s.viewsCount, inquiriesCount: type === 'inquiry' ? s.inquiriesCount + 1 : s.inquiriesCount }
      : s
    ))
    if (type === 'view') await supabase.from('shows').update({ views_count: (shows.find(s => s.id === showId)?.viewsCount || 0) + 1 }).eq('id', showId)
    if (type === 'inquiry') await supabase.from('shows').update({ inquiries_count: (shows.find(s => s.id === showId)?.inquiriesCount || 0) + 1 }).eq('id', showId)
  }

 
    await supabase.from('shows').delete().eq('id', id);
    setShows(prev => prev.filter(s => s.id !== id));
  };

 
    const { data, error } = await supabase.from('shows').insert([{
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
      user_id: currentUser?.id,
      likes_count: 0,
      views_count: 0,
      inquiries_count: 0
    }]).select().single()

    if (error) {
      alert('Error saving show: ' + error.message)
      return
    }
    if (data) {
      setShows(prev => [{ ...newShow, id: data.id }, ...prev])
      if (currentUser?.id) {
        const newIds = [...(currentUser.uploadedShowIds || []), data.id]
        await supabase.from('profiles').update({ uploaded_show_ids: newIds }).eq('id', currentUser.id)
        setCurrentUser(prev => prev ? { ...prev, uploadedShowIds: newIds } : null)
      }
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'Bowlby One SC, cursive', fontSize: '3rem', color: '#FFDE03' }}>HAHAHUB</div>
      </div>
    )
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'landing': return <LandingPage onNavigate={(p) => setCurrentPage(p)} onPurchaseSuccess={() => {}} shows={shows} />
      case 'discovery': return <DiscoveryPage onNavigate={(p) => setCurrentPage(p)} onLogout={handleLogout} user={currentUser || undefined} onToggleFavorite={handleToggleFavorite} onUpdateStats={handleUpdateStats} shows={shows} />
      case 'admin': return <AdminPage onNavigate={(p) => setCurrentPage(p)} onLogout={handleLogout} shows={shows} onDeleteShow={handleDeleteShow} />
      case 'login': return <LoginPage onSuccess={() => setCurrentPage('discovery')} onBack={() => setCurrentPage('landing')} setCurrentUser={setCurrentUser} />
      case 'subscription': return <SubscriptionPage onDeleteShow={handleDeleteShow} onUpdateShow={handleUpdateShow} onNavigate={(p) => setCurrentPage(p)} onLogout={handleLogout} user={currentUser || undefined} onToggleFavorite={handleToggleFavorite} shows={shows} onUpload={handleUpload} />
      case 'about': return <AboutPage onNavigate={(p) => setCurrentPage(p)} onLogout={handleLogout} user={currentUser || undefined} />
      case 'privacy': return <PrivacyPage onNavigate={(p) => setCurrentPage(p)} onLogout={handleLogout} user={currentUser || undefined} />
      default: return <LandingPage onNavigate={(p) => setCurrentPage(p)} onPurchaseSuccess={() => {}} shows={shows} />
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
