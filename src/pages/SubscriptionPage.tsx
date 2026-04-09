import React from 'react'
import Navigation from '../components/Navigation'
import { Page, User, Show } from '../types'

interface Props {
  user?: User | null
  shows: Show[]
  onNavigate: (page: Page) => void
  onLogout: () => void
  onPurchaseSuccess: () => void
}

const SubscriptionPage: React.FC<Props> = ({ user, shows, onNavigate, onLogout, onPurchaseSuccess }) => {
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <button onClick={() => onNavigate('login')} style={{ background: '#FFD600', color: '#0a0a0a', border: '4px solid #0a0a0a', padding: '1.25rem 3rem', fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '1.25rem', textTransform: 'uppercase', cursor: 'pointer', boxShadow: '6px 6px 0 #FF0266' }}>
          Sign in →
        </button>
      </div>
    )
  }

  const myShows = shows.filter(s => user.uploadedShowIds.includes(s.id))

  const statCard = (label: string, value: string | number, color: string) => (
    <div style={{ background: '#161616', border: '4px solid rgba(245,245,240,0.1)', padding: '1.5rem' }}>
      <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '2.5rem', color, lineHeight: 1, marginBottom: '0.25rem' }}>{value}</div>
      <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(245,245,240,0.4)', fontFamily: 'Barlow Condensed', fontWeight: 700 }}>{label}</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#f5f5f0' }}>
      <Navigation activePage="subscription" user={user} onNavigate={onNavigate} onLogout={onLogout} />

      <main style={{ paddingTop: '6rem', padding: '6rem 2rem 4rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3rem', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '5rem', textTransform: 'uppercase', lineHeight: 0.9, marginBottom: '0.5rem' }}>
              MY <span style={{ color: '#FF0266' }}>HUB</span>
            </h1>
            <p style={{ fontFamily: 'Space Mono', fontSize: '0.75rem', color: 'rgba(245,245,240,0.4)' }}>{user.email}</p>
          </div>

          <div style={{ background: '#161616', border: '4px solid #f5f5f0', padding: '1.5rem 2rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '1.25rem', textTransform: 'uppercase' }}>{user.name}</div>
              <div style={{ fontSize: '0.6rem', color: '#00E5FF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', fontFamily: 'Barlow Condensed' }}>
                {user.isPaid ? 'PRO MEMBER' : 'FREE'}
              </div>
            </div>
            {user.isPaid && user.subscriptionExpiry && (
              <div style={{ borderLeft: '2px solid rgba(245,245,240,0.1)', paddingLeft: '1.5rem' }}>
                <div style={{ fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(245,245,240,0.4)', fontFamily: 'Barlow Condensed', fontWeight: 700 }}>Valid until</div>
                <div style={{ fontFamily: 'Space Mono', fontSize: '0.75rem', color: '#FFD600', marginTop: '0.25rem' }}>{user.subscriptionExpiry}</div>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
          {statCard('Uploaded Shows', myShows.length, '#FFD600')}
          {statCard('Total Views', myShows.reduce((a, s) => a + (s.viewsCount || 0), 0), '#00E5FF')}
          {statCard('Total Likes', myShows.reduce((a, s) => a + (s.likesCount || 0), 0), '#FF0266')}
          {statCard('Favorites', user.favorites.length, '#f5f5f0')}
        </div>

        {!user.isPaid && (
          <div style={{ background: '#FFD600', border: '6px solid #0a0a0a', padding: '2rem', marginBottom: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', boxShadow: '8px 8px 0 #FF0266' }}>
            <div>
              <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '1.75rem', color: '#0a0a0a', textTransform: 'uppercase' }}>Upgrade to PRO</div>
              <div style={{ fontFamily: 'Space Mono', fontSize: '0.75rem', color: '#0a0a0a' }}>€79/year · Unlimited access · Upload shows</div>
            </div>
            <button onClick={onPurchaseSuccess} style={{ background: '#0a0a0a', color: '#FFD600', border: '4px solid #0a0a0a', padding: '1rem 2rem', fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '1.1rem', textTransform: 'uppercase', cursor: 'pointer' }}>
              Buy PRO →
            </button>
          </div>
        )}

        {/* My shows */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '2.5rem', textTransform: 'uppercase' }}>Moje <span style={{ color: '#FFD600' }}>Predstave</span></h2>
            <button onClick={() => onNavigate('upload')} style={{ background: '#00E5FF', color: '#0a0a0a', border: '3px solid #0a0a0a', padding: '0.5rem 1.25rem', fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '0.9rem', textTransform: 'uppercase', cursor: 'pointer' }}>
              + New
            </button>
          </div>

          {myShows.length === 0 ? (
            <div style={{ border: '4px dashed rgba(245,245,240,0.1)', padding: '4rem', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '1.5rem', color: 'rgba(245,245,240,0.2)', textTransform: 'uppercase', marginBottom: '1rem' }}>No shows uploaded yet</div>
              <button onClick={() => onNavigate('upload')} style={{ background: '#00E5FF', color: '#0a0a0a', border: '3px solid #0a0a0a', padding: '0.75rem 2rem', fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '1rem', textTransform: 'uppercase', cursor: 'pointer' }}>
                Add first →
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {myShows.map(show => (
                <div key={show.id} style={{ background: '#161616', border: '4px solid rgba(245,245,240,0.1)', display: 'flex', gap: '1rem', padding: '1rem', alignItems: 'flex-start' }}>
                  {show.imageUrl && <img src={show.imageUrl} alt={show.title} style={{ width: '70px', height: '90px', objectFit: 'cover', flexShrink: 0, border: '2px solid rgba(255,255,255,0.1)' }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '1.1rem', textTransform: 'uppercase', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{show.title}</h3>
                    <p style={{ fontFamily: 'Space Mono', fontSize: '0.65rem', color: 'rgba(245,245,240,0.4)', marginBottom: '0.75rem' }}>{show.author}</p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span style={{ background: '#00E5FF', color: '#0a0a0a', padding: '0.1rem 0.4rem', fontSize: '0.55rem', fontFamily: 'Barlow Condensed', fontWeight: 700, textTransform: 'uppercase' }}>{show.rightsStatus}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default SubscriptionPage
