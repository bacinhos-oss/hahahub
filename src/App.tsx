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
    if (!currentUser?.id) {
      const { data } = await supabase.from('shows').select('*').order('created_at', { ascending: false })
      if (data) mapAndSetShows(data)
      return
    }
    const { data } = await supabase.from('shows').select('*').order('created_at', { ascending: false }).eq('user_id', currentUser.id)
    if (data) mapAndSetShows(data)
  }

  const mapAndSetShows = (data: any[]) => {
    const mapped = data.map((s: any) => ({
      ...s, id: s.id, title: s.title || '', author: s.author || '', director: s.director || '',
      synopsis: s.synopsis || '', imageUrl: s.image_url || '', genre: s.genre || '',
      language: s.language || '', location: s.location || '', duration: s.duration || 90,
      maleRoles: s.male_roles || 1, femaleRoles: s.female_roles || 1,
      producerName: s.producer_name || '', producerEmail: s.producer_email || '',
      rightsHolder: s.rights_holder || '', premiereDate: s.premiere_date || '',
      productionYear: s.production_year || new Date().getFullYear(), licenseType: s.license_type || 'License',
      scriptScenario: s.script_scenario || '', likesCount: s.likes_count || 0,
      viewsCount: s.views_count || 0, inquiriesCount: s.inquiries_count || 0,
    }))
    setShows(mapped)
  }  }

  const handleDeleteShow = async (id: string) => {
    await supabase.from('shows').delete().eq('id', id);
    setShows(prev => prev.filter(s => s.id !== id));
  };

  const handleUpload = async (newShow: Show) => {
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
      case 'discovery': return <DiscoveryPage onNavigate={(p) => setCurrentPage(p)} onLogout={() => {}} user={currentUser || undefined} onToggleFavorite={() => {}} onUpdateStats={() => {}} shows={shows} />
      case 'upload': return <UploadPage onNavigate={(p) => setCurrentPage(p)} onLogout={() => {}} user={currentUser || undefined} onUpload={handleUpload} />
      case 'admin': return <AdminPage onNavigate={(p) => setCurrentPage(p)} onLogout={() => {}} shows={shows} onDeleteShow={() => {}} />
      case 'login': return <LoginPage onSuccess={() => setCurrentPage('discovery')} onBack={() => setCurrentPage('landing')} setCurrentUser={setCurrentUser} />
      case 'subscription': return <SubscriptionPage onDeleteShow={handleDeleteShow} onNavigate={(p) => setCurrentPage(p)} onLogout={() => {}} user={currentUser || undefined} onToggleFavorite={() => {}} shows={shows} onUpload={handleUpload} />
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
// force rebuild Wed Apr 29 00:34:39 CEST 2026
