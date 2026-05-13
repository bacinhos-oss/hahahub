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
import UploadPage from './pages/UploadPage'
import CookieBanner from './components/CookieBanner'
import NotFoundPage from './pages/NotFoundPage'
import PricingPage from './pages/PricingPage'
import FAQPage from './pages/FAQPage'
import LaffWirePage from './pages/LaffWirePage'
import ProducerPage from './pages/ProducerPage'
import StefunnyPage from './pages/StefunnyPage'
import { Analytics } from "@vercel/analytics/next"

const ADMIN_EMAIL = 'bacinhos@gmail.com'

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('landing')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [shows, setShows] = useState<Show[]>([])
  const [currentProducerId, setCurrentProducerId] = useState<string | undefined>(undefined)
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

    const channel = supabase
      .channel('shows-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'shows' }, () => {
        loadShows()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const loadProfile = async (userId: string, email: string) => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
      const isAdmin = email === ADMIN_EMAIL
      const user: User = {
        id: userId, email,
        name: data?.name || email.split('@')[0].toUpperCase(),
        role: isAdmin ? 'admin' : 'Producer',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        isPaid: data?.is_paid || isAdmin, isAdmin,
        plan: isAdmin ? 'roar' : (data?.user_type === 'roar' ? 'roar' : (data?.user_type === 'laff' || data?.is_paid ? 'laff' : 'gigl')),
        is_verified: data?.is_verified || false,
        is_founding: data?.is_founding || false,
        subscription: data?.is_paid || isAdmin ? { type: 'Annual', expiryDate: data?.subscription_expiry || 'Dec 24, 2025', status: 'Active', discounts: ['-20% on script printing', 'VIP Networking', 'Unlimited PDF downloads'] } : undefined,
        favorites: data?.favorites || [],
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
    if (!data) return
    // Fetch profiles to get is_verified + is_founding per producer
    const userIds = [...new Set(data.map((s: any) => s.user_id).filter(Boolean))]
    let profileMap: Record<string, { is_verified: boolean; is_founding: boolean }> = {}
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, is_verified, is_founding')
        .in('id', userIds)
      if (profiles) {
        profiles.forEach((p: any) => {
          profileMap[p.id] = { is_verified: p.is_verified || false, is_founding: p.is_founding || false }
        })
      }
    }
    mapAndSetShows(data, profileMap)
  }

  const mapAndSetShows = (data: any[], profileMap: Record<string, { is_verified: boolean; is_founding: boolean }> = {}) => {
    const mapped = data.map((s: any) => ({
      ...s,
      is_verified: profileMap[s.user_id]?.is_verified || false,
      is_founding: profileMap[s.user_id]?.is_founding || false,
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
      is_produced: s.is_produced ?? true,
      user_id: s.user_id || null,
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
      // Read fresh value from DB to avoid stale closure race condition
      const { data: freshShow } = await supabase.from('shows').select('likes_count').eq('id', showId).maybeSingle()
      const currentLikes = freshShow?.likes_count || 0
      await supabase.from('shows').update({
        likes_count: Math.max(0, currentLikes + (isFav ? -1 : 1))
      }).eq('id', showId)
    }
  }

  const handleUpdateStats = async (showId: string, type: 'view' | 'inquiry') => {
    if (!showId) return
    // Optimistic update UI
    setShows(prev => prev.map(s => {
      if (s.id !== showId) return s
      return {
        ...s,
        viewsCount: type === 'view' ? s.viewsCount + 1 : s.viewsCount,
        inquiriesCount: type === 'inquiry' ? s.inquiriesCount + 1 : s.inquiriesCount,
      }
    }))
    // Always use direct DB read + write to avoid RPC/RLS issues
    if (type === 'view') {
      const { data } = await supabase.from('shows').select('views_count').eq('id', showId).maybeSingle()
      await supabase.from('shows').update({ views_count: (data?.views_count || 0) + 1 }).eq('id', showId)
    }
    if (type === 'inquiry') {
      const { data } = await supabase.from('shows').select('inquiries_count').eq('id', showId).maybeSingle()
      await supabase.from('shows').update({ inquiries_count: (data?.inquiries_count || 0) + 1 }).eq('id', showId)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <div style={{ fontFamily: 'Bowlby One SC, cursive', fontSize: '3rem', color: '#FFDE03', textShadow: '3px 3px 0 #FF0266' }}>HAHAHUB</div>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.2)', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 900 }}>Tickling the vault...</div>
      </div>
    )
  }

  const handleUpload = async (newShow: Show) => {
    const { data, error } = await supabase.from('shows').insert([{
      title: newShow.title, author: newShow.author, director: newShow.director,
      director_notes: newShow.directorNotes, original_production_solutions: newShow.originalProductionSolutions,
      synopsis: newShow.synopsis, image_url: newShow.imageUrl,
      genre: newShow.genre, subgenre: newShow.subgenre, language: newShow.language,
      location: newShow.location, duration: newShow.duration,
      male_roles: newShow.maleRoles, female_roles: newShow.femaleRoles,
      can_merge_roles: newShow.canMergeRoles, has_intermission: newShow.hasIntermission,
      is_director_mandatory: newShow.isDirectorMandatory,
      creative_team_availability: newShow.creativeTeamAvailability,
      production_scale: newShow.productionScale, is_touring_friendly: newShow.isTouringFriendly,
      technical_complexity: newShow.technicalComplexity, costume_complexity: newShow.costumeComplexity,
      set_complexity: newShow.setComplexity, adaptation_flexibility: newShow.adaptationFlexibility,
      scalability_notes: newShow.scalabilityNotes, stage_type: newShow.stageType,
      tech_staff_lighting: newShow.techStaffLighting, tech_staff_sound: newShow.techStaffSound,
      tech_staff_prompter: newShow.techStaffPrompter, tech_staff_stagehands: newShow.techStaffStagehands,
      tech_staff_other: newShow.techStaffOther,
      premiere_date: newShow.premiereDate, premiere_location: newShow.premiereLocation,
      production_year: newShow.productionYear, performances_count: newShow.performancesCount,
      total_audience: newShow.totalAudience, locations_played: newShow.locationsPlayed,
      buyout_locations: newShow.buyoutLocations, box_office_indicator: newShow.boxOfficeIndicator,
      awards: newShow.awards, audience_profile: newShow.audienceProfile,
      producer_name: newShow.producerName, producer_email: newShow.producerEmail,
      rights_holder: newShow.rightsHolder, rights_status: newShow.rightsStatus,
      territories_available: newShow.territoriesAvailable, licensed_countries: newShow.licensedCountries,
      license_type: newShow.licenseType, licensing_model: newShow.licensingModel,
      exclusivity_level: newShow.exclusivityLevel, royalty_range: newShow.royaltyRange,
      advance_fee: newShow.advanceFee, rights_clearing_speed: newShow.rightsClearingSpeed,
      decision_maker_type: newShow.decisionMakerType, risk_profile: newShow.riskProfile,
      break_even_threshold: newShow.breakEvenThreshold, break_even_performances: newShow.breakEvenPerformances,
      budget_range: newShow.budgetRange, humor_type: newShow.humorType,
      translations_available: newShow.translationsAvailable,
      translation_rights_included: newShow.translationRightsIncluded,
      is_sponsor_friendly: newShow.isSponsorFriendly, is_group_sales_friendly: newShow.isGroupSalesFriendly,
      exit_scenarios: newShow.exitScenarios,
      originating_producer_track_record: newShow.originatingProducerTrackRecord,
      territory_conflicts: newShow.territoryConflicts, media_conflicts: newShow.mediaConflicts,
      international_success_notes: newShow.internationalSuccessNotes,
      script_scenario: newShow.scriptScenario,
      programming_compatibility: newShow.programmingCompatibility,
      transparency_score: newShow.transparencyScore,
      likes_count: 0, views_count: 0, inquiries_count: 0,
      production_photos: newShow.productionPhotos, is_produced: true,
      user_id: currentUser?.id,
    }]).select().maybeSingle()
    if (error) {
      console.error('UPLOAD ERROR:', error)
      alert('Upload error: ' + error.message)
      return
    }
    if (data) setShows(prev => [{ ...newShow, id: data.id, user_id: currentUser?.id } as any, ...prev])
    else setShows(prev => [{ ...newShow, id: crypto.randomUUID(), user_id: currentUser?.id } as any, ...prev])
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
    }
  };

  const handlePurchaseSuccess = async (planName: string) => {
    if (!currentUser) return
    const expiry = planName.includes('Annual') 
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    await supabase.from('profiles').update({ is_paid: true, subscription_expiry: expiry }).eq('id', currentUser.id)
    const newPlan = planName.toLowerCase().includes('roar') ? 'roar' : 'laff'
    setCurrentUser(prev => prev ? { ...prev, isPaid: true, plan: newPlan, subscription: { type: planName.includes('Annual') ? 'Annual' : 'Quarterly', expiryDate: expiry, status: 'Active', discounts: ['-20% on script printing', 'VIP Networking', 'Unlimited PDF downloads'] } } : null)
    // Send welcome + payment confirmation emails
    const invoiceNum = 'HH-' + Date.now().toString().slice(-6);
    await sendEmail('payment_confirmation', currentUser.email, {
      name: currentUser.name,
      planName,
      amount: planName.includes('Annual') ? '€99' : '€59',
      invoiceNum,
      expiry,
    });
    await sendEmail('welcome', currentUser.email, {
      name: currentUser.name,
      email: currentUser.email,
    });
    setCurrentPage('discovery')
  }

  const renderPage = () => {
    // After loading, redirect paid users from landing to discovery
    const effectivePage = (() => {
      if (currentPage === 'landing' && currentUser?.isPaid) return 'discovery'
      if (currentPage === 'landing' && currentUser?.isAdmin) return 'discovery'
      if ((currentPage === 'upload') && currentUser && !currentUser.isPaid && !currentUser.isAdmin) return 'landing'
      return currentPage
    })()

    switch (effectivePage) {
      case 'landing': return <LandingPage onNavigate={(p) => setCurrentPage(p)} onPurchaseSuccess={handlePurchaseSuccess} shows={shows} />
      case 'discovery': return <DiscoveryPage onNavigate={(p) => setCurrentPage(p)} onLogout={handleLogout} user={currentUser || undefined} onToggleFavorite={handleToggleFavorite} onUpdateStats={handleUpdateStats} shows={shows} onViewProducer={(id) => setCurrentProducerId(id)} />
      case 'admin': return <AdminPage onNavigate={(p) => setCurrentPage(p)} onLogout={handleLogout} shows={shows} />
      case 'login': return <LoginPage 
        onSuccess={(isPaid: boolean) => setCurrentPage(isPaid ? 'discovery' : 'landing')} 
        onBack={() => setCurrentPage('landing')} 
        setCurrentUser={setCurrentUser} 
      />
      case 'subscription': return <SubscriptionPage onUpdateShow={handleUpdateShow} onNavigate={(p) => { if (p === 'producer' && currentUser?.id) { setCurrentProducerId(currentUser.id); } setCurrentPage(p); }} onLogout={handleLogout} user={currentUser || undefined} onToggleFavorite={handleToggleFavorite} shows={shows} onDeleteShow={(id) => setShows(prev => prev.filter(s => s.id !== id))} />
      case 'about': return <AboutPage onNavigate={(p) => setCurrentPage(p)} onLogout={handleLogout} user={currentUser || undefined} />
      case 'privacy': return <PrivacyPage onNavigate={(p) => setCurrentPage(p)} onLogout={handleLogout} user={currentUser || undefined} />
      case 'upload': return <UploadPage onNavigate={(p) => setCurrentPage(p)} onLogout={handleLogout} user={currentUser || undefined} onUpload={handleUpload} />
      case 'pricing': return <PricingPage onNavigate={(p) => setCurrentPage(p)} onLogout={handleLogout} user={currentUser || undefined} onPurchaseSuccess={handlePurchaseSuccess} />
      case 'faq': return <FAQPage onNavigate={(p) => setCurrentPage(p)} onLogout={handleLogout} user={currentUser || undefined} />
      case 'wire': return <LaffWirePage onNavigate={(p) => setCurrentPage(p)} onLogout={handleLogout} user={currentUser || undefined} onViewProducer={(id) => { setCurrentProducerId(id); setCurrentPage('producer'); }} />
      case 'stefunny': return <StefunnyPage onNavigate={(p) => setCurrentPage(p)} onLogout={handleLogout} user={currentUser || undefined} shows={shows} onToggleFavorite={handleToggleFavorite} onUpdateStats={handleUpdateStats} />
      case 'producer': return <ProducerPage onNavigate={(p) => setCurrentPage(p)} onLogout={handleLogout} user={currentUser || undefined} producerId={currentProducerId} shows={shows} onUpdateStats={handleUpdateStats} />
      default: return <NotFoundPage onNavigate={(p) => setCurrentPage(p)} />
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
