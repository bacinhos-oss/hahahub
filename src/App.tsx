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
import TermsPage from './pages/TermsPage'
import UploadPage from './pages/UploadPage'
import CookieBanner from './components/CookieBanner'
import FeedbackButton from './components/FeedbackButton'
import OnboardingWizard from './components/OnboardingWizard'
import NotFoundPage from './pages/NotFoundPage'
import PricingPage from './pages/PricingPage'
import FAQPage from './pages/FAQPage'
import LaffWirePage from './pages/LaffWirePage'
import ProducerPage from './pages/ProducerPage'
import StefunnyPage from './pages/StefunnyPage'
import { Analytics } from "@vercel/analytics/react"
import { logError } from './lib/errorLogger'
import DealsPipelinePage from './pages/DealsPipelinePage'

const ADMIN_EMAIL = 'bacinhos@gmail.com'
const VALID_PAGES: string[] = ['landing','discovery','admin','login','subscription','about','privacy','upload','pricing','faq','stefunny','producer','wire','pipeline']

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

  useEffect(() => {
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
      }
    }
    window.addEventListener('hashchange', handleHashChange)

    loadShows()

    // onAuthStateChange pokrije vse — INITIAL_SESSION, SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        if (session?.user) {
          loadProfile(session.user.id, session.user.email!)
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
      if (!data?.onboarded && !isAdmin) setShowOnboarding(true)
      setLoading(false)
    } catch { 
      setCurrentUser(null)
      setLoading(false)
    }
  }

  const loadShows = async () => {
    const { data } = await supabase.from('shows').select('*').order('created_at', { ascending: false })
    if (!data) return
    const userIds = [...new Set(data.map((s: any) => s.user_id).filter(Boolean))]
    let profileMap: Record<string, { is_verified: boolean; is_founding: boolean; user_type: string }> = {}
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, is_verified, is_founding, user_type')
        .in('id', userIds)
      if (profiles) {
        profiles.forEach((p: any) => {
          profileMap[p.id] = { is_verified: p.is_verified || false, is_founding: p.is_founding || false, user_type: p.user_type || 'gigl' }
        })
      }
    }
    mapAndSetShows(data, profileMap)
  }

  const mapAndSetShows = (data: any[], profileMap: Record<string, { is_verified: boolean; is_founding: boolean; user_type: string }> = {}) => {
    const mapped = data.map((s: any) => ({
      ...s,
      is_verified: profileMap[s.user_id]?.is_verified || false,
      is_founding: profileMap[s.user_id]?.is_founding || false,
      producer_plan: profileMap[s.user_id]?.user_type || 'gigl',
      id: s.id,
      title: s.title || '',
      author: s.author || '',
      director: s.director || '',
      synopsis: s.synopsis || '',
      synopsis_en: s.synopsis_en || '',
      original_language: s.original_language || '',
      trailer_url: s.trailer_url || '',
      script_in_english: s.script_in_english || 'false',
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
      // Creative Assets
      music_author: s.music_author || '',
      has_original_music: s.has_original_music || false,
      video_author: s.video_author || '',
      has_video_projections: s.has_video_projections || false,
      video_description: s.video_description || '',
      scenographer: s.scenographer || '',
      set_available: s.set_available || 'false',
      lighting_designer: s.lighting_designer || '',
      lighting_design_available: s.lighting_design_available || 'false',
      // Packages
      hasScriptPackage: s.has_script_package !== false,
      scriptRoyaltyPct: s.script_royalty_pct || null,
      scriptAdvanceFee: s.script_advance_fee || null,
      hasFullPunchPackage: s.has_full_punch_package || false,
      fullPunchRoyaltyPct: s.full_punch_royalty_pct || null,
      fullPunchAdvanceFee: s.full_punch_advance_fee || null,
      // Full Punch contents
      fpTheScript: s.fp_the_script !== false,
      fpThePlaybook: s.fp_the_playbook || false,
      fpTheSoundtrack: s.fp_the_soundtrack || false,
      fpTheVisuals: s.fp_the_visuals || false,
      fpTheWardrobe: s.fp_the_wardrobe || false,
      fpTheSetBlueprint: s.fp_the_set_blueprint || false,
      fpTheTechRider: s.fp_the_tech_rider || false,
      fpThePromoKit: s.fp_the_promo_kit || false,
      fpTheHandoverSession: s.fp_the_handover_session || false,
      fpPunchLanguage: s.fp_punch_language || 'EN',
      fpPunchSupport: s.fp_punch_support || false,
      // Extra
      englishTitle: s.english_title || '',
      internationalSuccessNotes: s.international_success_notes || '',
      translationsAvailable: s.translations_available || '',
      awards: s.awards || '',
      premiereLocation: s.premiere_location || '',
      locationsPlayed: s.locations_played || '',
      territoriesAvailable: s.territories_available || '',
      stageType: s.stage_type || 'Main Stage',
      adaptationFlexibility: s.adaptation_flexibility || 'Medium',
      technicalComplexity: s.technical_complexity || 'Medium',
      costumeComplexity: s.costume_complexity || 'Medium',
      setComplexity: s.set_complexity || 'Medium',
      hasIntermission: s.has_intermission || false,
    }))
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
    if (type === 'view') {
      // Single atomic call — replaces the old read-then-write + separate
      // insert, which could race or get abandoned on fast navigation.
      const { error: viewError } = await supabase.rpc('record_show_view', { p_show_id: showId, p_user_id: currentUser?.id || null })
      if (viewError) console.error('record_show_view failed:', viewError)
    }
    if (type === 'inquiry') {
      const { data } = await supabase.from('shows').select('inquiries_count').eq('id', showId).maybeSingle()
      await supabase.from('shows').update({ inquiries_count: (data?.inquiries_count || 0) + 1 }).eq('id', showId)
    }
  }

  if (loading) return null

  const handleUpload = async (newShow: Show) => {
    const { data, error } = await supabase.from('shows').insert([{
      title: newShow.title, author: newShow.author, director: newShow.director,
      director_notes: newShow.directorNotes, original_production_solutions: newShow.originalProductionSolutions,
      synopsis: newShow.synopsis,
      synopsis_en: (newShow as any).synopsis_en || '',
      original_language: (newShow as any).original_language || '',
      trailer_url: (newShow as any).trailerUrl || (newShow as any).trailer_url || '',
      script_in_english: (newShow as any).script_in_english || 'false',
      image_url: newShow.imageUrl,
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
      // Packages
      has_script_package: newShow.hasScriptPackage,
      script_royalty_pct: newShow.scriptRoyaltyPct || null,
      script_advance_fee: newShow.scriptAdvanceFee || null,
      has_full_punch_package: newShow.hasFullPunchPackage,
      full_punch_royalty_pct: newShow.fullPunchRoyaltyPct || null,
      full_punch_advance_fee: newShow.fullPunchAdvanceFee || null,
      // Full Punch contents
      fp_the_script: (newShow as any).fpTheScript !== false,
      fp_the_playbook: (newShow as any).fpThePlaybook || false,
      fp_the_soundtrack: (newShow as any).fpTheSoundtrack || false,
      fp_the_visuals: (newShow as any).fpTheVisuals || false,
      fp_the_wardrobe: (newShow as any).fpTheWardrobe || false,
      fp_the_set_blueprint: (newShow as any).fpTheSetBlueprint || false,
      fp_the_tech_rider: (newShow as any).fpTheTechRider || false,
      fp_the_promo_kit: (newShow as any).fpThePromoKit || false,
      fp_the_handover_session: (newShow as any).fpTheHandoverSession || false,
      fp_punch_language: (newShow as any).fpPunchLanguage || 'EN',
      fp_punch_support: (newShow as any).fpPunchSupport || false,
      // Creative assets (V4)
      music_author: (newShow as any).musicAuthor || (newShow as any).music_author || null,
      has_original_music: (newShow as any).hasOriginalMusic || false,
      video_author: (newShow as any).videoAuthor || (newShow as any).video_author || null,
      has_video_projections: (newShow as any).hasVideoProjections || false,
      video_description: (newShow as any).videoDescription || (newShow as any).video_description || null,
      scenographer: (newShow as any).scenographer || null,
      set_available: (newShow as any).setAvailable || (newShow as any).set_available || 'false',
      lighting_designer: (newShow as any).lightingDesigner || null,
      lighting_design_available: (newShow as any).lightingDesignAvailable || (newShow as any).lighting_design_available || 'false',
      english_title: (newShow as any).englishTitle || (newShow as any).english_title || newShow.title,
      likes_count: 0, views_count: 0, inquiries_count: 0,
      production_photos: newShow.productionPhotos, is_produced: true,
      user_id: currentUser?.id,
    }]).select().maybeSingle()
    if (error) {
      console.error('UPLOAD ERROR:', error)
      logError('handleUpload', error, { userId: currentUser?.id, userEmail: currentUser?.email, page: 'upload' })
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
      logError('sendEmail', err, { userId: currentUser?.id, userEmail: currentUser?.email, details: { type } });
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
    const userShowCount = shows.filter(s => (s as any).user_id === currentUser?.id).length
    const uploadLimit = currentUser?.isAdmin ? 9999 : currentUser?.plan === 'roar' ? 9999 : currentUser?.plan === 'laff' ? 5 : 1
    const isAtLimit = userShowCount >= uploadLimit

    const effectivePage = (() => {
      if (currentPage === 'landing' && currentUser) return 'discovery'
      if (currentPage === 'upload' && !currentUser) return 'landing'
      if (currentPage === 'upload' && currentUser && !currentUser.isAdmin && isAtLimit) return 'subscription'
      return currentPage
    })()

    switch (effectivePage) {
      case 'landing': return <LandingPage onNavigate={(p) => setCurrentPage(p)} onPurchaseSuccess={handlePurchaseSuccess} shows={shows} />
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
      case 'pricing': return <PricingPage onNavigate={(p) => setCurrentPage(p)} onLogout={handleLogout} user={currentUser || undefined} onPurchaseSuccess={handlePurchaseSuccess} />
      case 'faq': return <FAQPage onNavigate={(p) => setCurrentPage(p)} onLogout={handleLogout} user={currentUser || undefined} />
      case 'wire': return <LaffWirePage onNavigate={(p) => setCurrentPage(p)} onLogout={handleLogout} user={currentUser || undefined} onViewProducer={(id) => { setCurrentProducerId(id); setCurrentPage('producer'); }} />
      case 'stefunny': return <StefunnyPage onNavigate={(p) => setCurrentPage(p)} onLogout={handleLogout} user={currentUser || undefined} shows={shows} onToggleFavorite={handleToggleFavorite} onUpdateStats={handleUpdateStats} />
      case 'producer': return <ProducerPage onNavigate={(p) => setCurrentPage(p)} onLogout={handleLogout} user={currentUser || undefined} producerId={currentProducerId} shows={shows} onUpdateStats={handleUpdateStats} onViewShow={(id) => { setCurrentShowId(id); setCurrentPage('discovery'); }} />
      case 'pipeline':
        return currentUser
          ? <DealsPipelinePage user={currentUser} onNavigate={(p) => setCurrentPage(p as Page)} />
          : <LoginPage onSuccess={() => setCurrentPage('pipeline')} onBack={() => setCurrentPage('landing')} setCurrentUser={setCurrentUser} />
      default: return <NotFoundPage onNavigate={(p) => setCurrentPage(p)} />
    }
  }

  return (
    <div className="min-h-screen">
      {renderPage()}
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
