import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { Page, User, Show } from './types'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import DiscoveryPage from './pages/DiscoveryPage'
import UploadPage from './pages/UploadPage'
import AdminPage from './pages/AdminPage'
import SubscriptionPage from './pages/SubscriptionPage'

const ADMIN_EMAIL = 'bacinhos@gmail.com'

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('landing')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [shows, setShows] = useState<Show[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user.id, session.user.email!)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user.id, session.user.email!)
      } else {
        setCurrentUser(null)
        setLoading(false)
      }
    })

    loadShows()

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId: string, email: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      const user: User = {
        id: userId,
        email,
        name: data?.name || email.split('@')[0].toUpperCase(),
        role: email === ADMIN_EMAIL ? 'admin' : 'producer',
        isPaid: data?.is_paid || false,
        subscriptionExpiry: data?.subscription_expiry,
        favorites: data?.favorites || [],
        uploadedShowIds: data?.uploaded_show_ids || [],
      }
      setCurrentUser(user)
    } catch {
      setCurrentUser(null)
    }
    setLoading(false)
  }

  const loadShows = async () => {
    const { data } = await supabase
      .from('shows')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setShows(data)
  }

  const handleLogin = () => {
    setCurrentPage('discovery')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setCurrentUser(null)
    setCurrentPage('landing')
  }

  const handleUpload = async (show: Partial<Show>) => {
    if (!currentUser) return
    const newShow = {
      ...show,
      producer_name: currentUser.name,
      producer_email: currentUser.email,
      user_id: currentUser.id,
      likes_count: 0,
      views_count: 0,
    }
    const { data } = await supabase.from('shows').insert([newShow]).select().single()
    if (data) {
      setShows(prev => [data, ...prev])
      // Update user's uploaded show ids
      await supabase.from('profiles').update({
        uploaded_show_ids: [...currentUser.uploadedShowIds, data.id]
      }).eq('id', currentUser.id)
      setCurrentUser(prev => prev ? {
        ...prev,
        uploadedShowIds: [...prev.uploadedShowIds, data.id]
      } : null)
    }
  }

  const handleDeleteShow = async (id: string) => {
    await supabase.from('shows').delete().eq('id', id)
    setShows(prev => prev.filter(s => s.id !== id))
  }

  const handlePurchaseSuccess = async () => {
    if (!currentUser) return
    const expiry = new Date()
    expiry.setFullYear(expiry.getFullYear() + 1)
    const expiryStr = expiry.toLocaleDateString('sl-SI')

    await supabase.from('profiles').update({
      is_paid: true,
      subscription_expiry: expiryStr
    }).eq('id', currentUser.id)

    setCurrentUser(prev => prev ? { ...prev, isPaid: true, subscriptionExpiry: expiryStr } : null)
    setCurrentPage('discovery')
  }

  const navigate = (page: Page) => {
    if ((page === 'upload' || page === 'subscription') && !currentUser) {
      setCurrentPage('login')
      return
    }
    if (page === 'admin' && currentUser?.role !== 'admin') {
      return
    }
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#FFD600', fontFamily: 'Barlow Condensed, sans-serif', fontSize: '3rem', fontWeight: 900, fontStyle: 'italic' }}>
          LOADING...
        </div>
      </div>
    )
  }

  switch (currentPage) {
    case 'login':
      return <LoginPage onSuccess={handleLogin} onBack={() => setCurrentPage('landing')} setCurrentUser={setCurrentUser} />
    case 'discovery':
      return <DiscoveryPage user={currentUser} shows={shows} onNavigate={navigate} onLogout={handleLogout} />
    case 'upload':
      return <UploadPage user={currentUser} onNavigate={navigate} onLogout={handleLogout} onUpload={handleUpload} />
    case 'admin':
      return <AdminPage user={currentUser} shows={shows} onNavigate={navigate} onLogout={handleLogout} onDeleteShow={handleDeleteShow} />
    case 'subscription':
      return <SubscriptionPage user={currentUser} shows={shows} onNavigate={navigate} onLogout={handleLogout} onPurchaseSuccess={handlePurchaseSuccess} />
    default:
      return <LandingPage shows={shows} onNavigate={navigate} onPurchaseSuccess={handlePurchaseSuccess} currentUser={currentUser} />
  }
}

export default App
