import React, { useState } from 'react'
import Navigation from '../components/Navigation'
import { Page, User, Show } from '../types'

interface Props {
  user?: User | null
  shows: Show[]
  onNavigate: (page: Page) => void
  onLogout: () => void
}

const DiscoveryPage: React.FC<Props> = ({ user, shows, onNavigate, onLogout }) => {
  const [search, setSearch] = useState('')
  const [filterGenre, setFilterGenre] = useState('')

  const genres = [...new Set(shows.map(s => s.genre).filter(Boolean))]

  const filtered = shows.filter(s => {
    const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.author.toLowerCase().includes(search.toLowerCase())
    const matchGenre = !filterGenre || s.genre === filterGenre
    return matchSearch && matchGenre
  })

  const canSeeDetails = user?.isPaid || user?.role === 'admin'

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#f5f5f0' }}>
      <Navigation activePage="discovery" user={user} onNavigate={onNavigate} onLogout={onLogout} />

      <main style={{ paddingTop: '6rem', padding: '6rem 2rem 4rem', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: 'clamp(3rem, 8vw, 6rem)', textTransform: 'uppercase', lineHeight: 0.9, marginBottom: '1rem' }}>
            KATALOG <span style={{ color: '#FFD600' }}>KOMEDIJ</span>
          </h1>
          <p style={{ fontFamily: 'Space Mono', fontSize: '0.8rem', color: 'rgba(245,245,240,0.5)' }}>{shows.length} predstav v bazi</p>
        </div>

        {/* FILTERS */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Išči po naslovu, avtorju..."
            style={{ flex: 1, minWidth: '200px', background: '#161616', border: '3px solid rgba(245,245,240,0.2)', padding: '0.75rem 1rem', color: '#f5f5f0', fontFamily: 'Space Mono', fontSize: '0.8rem', outline: 'none' }}
          />
          <select
            value={filterGenre}
            onChange={e => setFilterGenre(e.target.value)}
            style={{ background: '#161616', border: '3px solid rgba(245,245,240,0.2)', padding: '0.75rem 1rem', color: '#f5f5f0', fontFamily: 'Barlow Condensed', fontWeight: 700, fontStyle: 'italic', fontSize: '0.9rem', textTransform: 'uppercase', cursor: 'pointer', outline: 'none' }}
          >
            <option value="">Vsi žanri</option>
            {genres.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        {!canSeeDetails && (
          <div style={{ background: '#FF0266', border: '4px solid #0a0a0a', padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '1rem', textTransform: 'uppercase' }}>
              🔒 Za popoln dostop potrebuješ Pro naročnino
            </div>
            <button onClick={() => onNavigate('landing')} style={{ background: '#fff', color: '#FF0266', border: '3px solid #0a0a0a', padding: '0.5rem 1.5rem', fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '0.9rem', textTransform: 'uppercase', cursor: 'pointer' }}>
              Kupi dostop →
            </button>
          </div>
        )}

        {/* SHOWS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {filtered.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem', color: 'rgba(245,245,240,0.2)', fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '2rem', textTransform: 'uppercase' }}>
              Ni zadetkov
            </div>
          ) : filtered.map(show => (
            <div key={show.id} style={{ background: '#161616', border: '4px solid rgba(245,245,240,0.15)', padding: '0', overflow: 'hidden', position: 'relative', transition: 'box-shadow 0.2s', cursor: canSeeDetails ? 'pointer' : 'default' }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '6px 6px 0 #FFD600')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
            >
              {show.imageUrl ? (
                <img src={show.imageUrl} alt={show.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '200px', background: 'linear-gradient(135deg, #161616, #222)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '5rem', color: 'rgba(255,255,255,0.05)' }}>HA</span>
                </div>
              )}
              <div style={{ padding: '1.25rem' }}>
                <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#00E5FF', marginBottom: '0.4rem', fontFamily: 'Barlow Condensed', fontWeight: 700 }}>
                  {show.genre} · {show.language} · {show.location}
                </div>
                <h3 style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '1.4rem', textTransform: 'uppercase', marginBottom: '0.3rem', lineHeight: 1.1 }}>{show.title}</h3>
                <p style={{ fontSize: '0.72rem', color: 'rgba(245,245,240,0.5)', fontFamily: 'Space Mono', marginBottom: '1rem' }}>{show.author}</p>

                {canSeeDetails ? (
                  <div>
                    {show.synopsis && <p style={{ fontSize: '0.72rem', color: 'rgba(245,245,240,0.7)', fontFamily: 'Space Mono', lineHeight: 1.6, marginBottom: '1rem' }}>{show.synopsis.substring(0, 120)}...</p>}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', fontSize: '0.6rem', fontFamily: 'Barlow Condensed', fontWeight: 700, textTransform: 'uppercase' }}>{show.duration} min</span>
                      <span style={{ background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', fontSize: '0.6rem', fontFamily: 'Barlow Condensed', fontWeight: 700, textTransform: 'uppercase' }}>{show.licenseType}</span>
                      <span style={{ background: '#00E5FF', color: '#0a0a0a', padding: '0.2rem 0.5rem', fontSize: '0.6rem', fontFamily: 'Barlow Condensed', fontWeight: 700, textTransform: 'uppercase' }}>{show.rightsStatus}</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: 'rgba(255,2,102,0.1)', border: '2px solid rgba(255,2,102,0.3)', padding: '0.75rem', textAlign: 'center' }}>
                    <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '0.85rem', color: '#FF0266', textTransform: 'uppercase' }}>🔒 Pro Only</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default DiscoveryPage
