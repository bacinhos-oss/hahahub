import React, { useState } from 'react'
import { Page, Show, User } from '../types'

const STRIPE_PUBLISHABLE_KEY = 'pk_test_51TJtFpHA029MGmx3hv4y9Yp8ZT2X4yOHjc2eJ4ZIuQALgGmIRNf1pQdPNHfCj1RImqG16Vr5iCWuvEd2PrZLj05h00Y8PMocak'

interface Props {
  shows: Show[]
  onNavigate: (page: Page) => void
  onPurchaseSuccess: () => void
  currentUser?: User | null
}

const LandingPage: React.FC<Props> = ({ shows, onNavigate, onPurchaseSuccess, currentUser }) => {
  const [payLoading, setPayLoading] = useState(false)
  const [payError, setPayError] = useState('')

  const handleCheckout = async () => {
    if (!currentUser) {
      onNavigate('login')
      return
    }
    setPayLoading(true)
    setPayError('')
    try {
      // Load Stripe
      const { loadStripe } = await import('https://js.stripe.com/v3/') as any
      // For test mode - simulate success
      setTimeout(() => {
        setPayLoading(false)
        onPurchaseSuccess()
      }, 2000)
    } catch {
      setPayLoading(false)
      setPayError('Napaka pri plačilu. Poskusi znova.')
    }
  }

  const teaserShows = shows.slice(0, 4)

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#f5f5f0' }}>
      {/* HEADER */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(10,10,10,0.95)', borderBottom: '4px solid #f5f5f0', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '2rem', color: '#FFD600', letterSpacing: '-0.02em' }}>HAHAHUB</div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={() => onNavigate('discovery')} style={{ background: 'none', border: 'none', color: 'rgba(245,245,240,0.6)', fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer' }}>Katalog</button>
          <button onClick={() => onNavigate('login')} style={{ background: '#f5f5f0', color: '#0a0a0a', border: '3px solid #0a0a0a', padding: '0.5rem 1.5rem', fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '0.9rem', textTransform: 'uppercase', cursor: 'pointer', boxShadow: '3px 3px 0 #FF0266' }}>
            {currentUser ? currentUser.name : 'Prijava'}
          </button>
        </div>
      </header>

      {/* HERO */}
      <section style={{ paddingTop: '10rem', paddingBottom: '5rem', paddingLeft: '2rem', paddingRight: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'inline-block', background: '#FF0266', color: '#fff', padding: '0.25rem 1rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3em', transform: 'rotate(-2deg)', marginBottom: '2rem', fontFamily: 'Barlow Condensed' }}>
          The Stage Is Yours
        </div>
        <h1 style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: 'clamp(3rem, 10vw, 8rem)', lineHeight: 0.85, textTransform: 'uppercase', marginBottom: '3rem' }}>
          INTERNATIONAL<br />
          <span style={{ color: '#FFD600' }}>THEATRE COMEDY</span><br />
          <span style={{ color: '#00E5FF' }}>PRODUCERS HUB</span>
        </h1>
        <p style={{ fontFamily: 'Space Mono', fontSize: '0.9rem', lineHeight: 1.8, color: 'rgba(245,245,240,0.7)', maxWidth: '600px', borderLeft: '6px solid #FF0266', paddingLeft: '1.5rem', marginBottom: '3rem' }}>
          Globalna platforma za gledališke producente komedij. Naloži svoje predstave, odkrivaj nove, pridobi licence. Vse na enem mestu.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={() => onNavigate(currentUser ? 'discovery' : 'login')} style={{ background: '#FFD600', color: '#0a0a0a', border: '4px solid #0a0a0a', padding: '1rem 2.5rem', fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', boxShadow: '6px 6px 0 #FF0266' }}>
            Vstopi v Katalog →
          </button>
          <button onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: 'transparent', color: '#f5f5f0', border: '4px solid #f5f5f0', padding: '1rem 2.5rem', fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}>
            Cenik
          </button>
        </div>
      </section>

      {/* TEASER SHOWS */}
      {teaserShows.length > 0 && (
        <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '3rem', textTransform: 'uppercase', marginBottom: '2rem' }}>
            V <span style={{ color: '#FF0266' }}>Katalogu</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {teaserShows.map(show => (
              <div key={show.id} style={{ background: '#161616', border: '4px solid #f5f5f0', padding: '1.5rem', position: 'relative', boxShadow: '4px 4px 0 #FFD600' }}>
                {show.imageUrl && <img src={show.imageUrl} alt={show.title} style={{ width: '100%', height: '180px', objectFit: 'cover', marginBottom: '1rem', border: '3px solid rgba(255,255,255,0.1)' }} />}
                <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#00E5FF', marginBottom: '0.5rem', fontFamily: 'Barlow Condensed', fontWeight: 700 }}>{show.genre} · {show.language}</div>
                <h3 style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '1.3rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{show.title}</h3>
                <p style={{ fontSize: '0.75rem', color: 'rgba(245,245,240,0.5)', fontFamily: 'Space Mono' }}>{show.author}</p>
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.5rem', fontSize: '0.6rem', fontFamily: 'Barlow Condensed', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  🔒 PRO
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PLANS */}
      <section id="plans" style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '3.5rem', textTransform: 'uppercase', marginBottom: '0.5rem', textAlign: 'center' }}>
          Izberi <span style={{ color: '#FFD600' }}>Plan</span>
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(245,245,240,0.5)', fontFamily: 'Space Mono', fontSize: '0.8rem', marginBottom: '3rem' }}>Letna naročnina. Prekini kadarkoli.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
          {/* FREE */}
          <div style={{ background: '#161616', border: '4px solid rgba(245,245,240,0.2)', padding: '2.5rem' }}>
            <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '1.5rem', textTransform: 'uppercase', marginBottom: '0.5rem', color: 'rgba(245,245,240,0.5)' }}>Free</div>
            <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontSize: '4rem', lineHeight: 1, marginBottom: '1.5rem' }}>€0</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              {['Ogled kataloga (omejeno)', 'Registracija', 'Brez uploada'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontFamily: 'Space Mono', fontSize: '0.75rem', color: 'rgba(245,245,240,0.5)' }}>
                  <span>○</span> {f}
                </div>
              ))}
            </div>
            <button onClick={() => onNavigate('login')} style={{ width: '100%', background: 'transparent', border: '3px solid rgba(245,245,240,0.3)', color: '#f5f5f0', padding: '0.875rem', fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '1rem', textTransform: 'uppercase', cursor: 'pointer' }}>
              Registracija
            </button>
          </div>

          {/* PRO ANNUAL */}
          <div style={{ background: '#f5f5f0', border: '6px solid #0a0a0a', padding: '2.5rem', boxShadow: '10px 10px 0 #FFD600', transform: 'translateY(-8px)' }}>
            <div style={{ display: 'inline-block', background: '#FF0266', color: '#fff', padding: '0.2rem 0.75rem', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1rem', fontFamily: 'Barlow Condensed' }}>Priporočeno</div>
            <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '1.5rem', textTransform: 'uppercase', marginBottom: '0.5rem', color: '#0a0a0a' }}>Pro Annual</div>
            <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontSize: '4rem', lineHeight: 1, marginBottom: '0.25rem', color: '#0a0a0a' }}>€79</div>
            <div style={{ fontSize: '0.7rem', color: '#666', fontFamily: 'Space Mono', marginBottom: '1.5rem' }}>/leto</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              {['Neomejen dostop do kataloga', 'Upload neomejeno predstav', 'Admin nadzorna plošča', 'Licensing kontakti', 'Prioritetna podpora'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontFamily: 'Space Mono', fontSize: '0.75rem', color: '#0a0a0a' }}>
                  <span style={{ color: '#FF0266', fontWeight: 700 }}>✓</span> {f}
                </div>
              ))}
            </div>
            {payError && <div style={{ background: '#FF0266', color: '#fff', padding: '0.5rem', fontSize: '0.7rem', fontFamily: 'Space Mono', marginBottom: '1rem' }}>{payError}</div>}
            <button
              onClick={handleCheckout}
              disabled={payLoading}
              style={{ width: '100%', background: '#0a0a0a', color: '#FFD600', border: '4px solid #0a0a0a', padding: '1rem', fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '1.2rem', textTransform: 'uppercase', cursor: 'pointer', boxShadow: '4px 4px 0 #FF0266', letterSpacing: '0.05em' }}
            >
              {payLoading ? 'PROCESIRANJE...' : 'KUPI DOSTOP →'}
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '4px solid rgba(245,245,240,0.1)', padding: '2rem', textAlign: 'center', fontFamily: 'Space Mono', fontSize: '0.7rem', color: 'rgba(245,245,240,0.3)' }}>
        © 2025 HAHAHUB – The Global Theater Comedy Hub
      </footer>
    </div>
  )
}

export default LandingPage
