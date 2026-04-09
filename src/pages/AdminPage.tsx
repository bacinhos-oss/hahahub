import React, { useState, useEffect } from 'react'
import Navigation from '../components/Navigation'
import { supabase } from '../lib/supabase'
import { Page, User, Show } from '../types'

interface Props {
  user?: User | null
  shows: Show[]
  onNavigate: (page: Page) => void
  onLogout: () => void
  onDeleteShow: (id: string) => void
}

const AdminPage: React.FC<Props> = ({ user, shows, onNavigate, onLogout, onDeleteShow }) => {
  const [tab, setTab] = useState<'shows' | 'users' | 'stats'>('stats')
  const [users, setUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    if (tab === 'users') loadUsers()
  }, [tab])

  const loadUsers = async () => {
    setLoadingUsers(true)
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (data) setUsers(data)
    setLoadingUsers(false)
  }

  const togglePaid = async (userId: string, currentPaid: boolean) => {
    await supabase.from('profiles').update({ is_paid: !currentPaid }).eq('id', userId)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_paid: !currentPaid } : u))
  }

  const tabBtn = (t: typeof tab, label: string) => (
    <button
      onClick={() => setTab(t)}
      style={{
        padding: '0.875rem 2rem', border: 'none', cursor: 'pointer',
        background: tab === t ? '#FFD600' : 'transparent',
        color: tab === t ? '#0a0a0a' : 'rgba(245,245,240,0.5)',
        fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic',
        fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em',
        borderBottom: tab === t ? '4px solid #0a0a0a' : '4px solid transparent'
      }}
    >
      {label}
    </button>
  )

  const tdStyle: React.CSSProperties = { padding: '0.75rem 1rem', fontFamily: 'Space Mono', fontSize: '0.72rem', borderBottom: '1px solid rgba(245,245,240,0.05)', verticalAlign: 'middle' }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#f5f5f0' }}>
      <Navigation activePage="admin" user={user} onNavigate={onNavigate} onLogout={onLogout} />

      <main style={{ paddingTop: '6rem', padding: '6rem 2rem 4rem', maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '4rem', textTransform: 'uppercase', marginBottom: '2rem', lineHeight: 0.9 }}>
          ADMIN <span style={{ color: '#FF0266' }}>PANEL</span>
        </h1>

        <div style={{ display: 'flex', borderBottom: '4px solid rgba(245,245,240,0.1)', marginBottom: '2rem' }}>
          {tabBtn('stats', 'Statistics')}
          {tabBtn('shows', `Predstave (${shows.length})`)}
          {tabBtn('users', 'Uporabniki')}
        </div>

        {tab === 'stats' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {[
              { label: 'Total Shows', value: shows.length, color: '#FFD600' },
              { label: 'Total Views', value: shows.reduce((a, s) => a + (s.viewsCount || 0), 0), color: '#00E5FF' },
              { label: 'Total Likes', value: shows.reduce((a, s) => a + (s.likesCount || 0), 0), color: '#FF0266' },
              { label: 'Users', value: users.length, color: '#f5f5f0' },
            ].map(stat => (
              <div key={stat.label} style={{ background: '#161616', border: '4px solid rgba(245,245,240,0.1)', padding: '2rem' }}>
                <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '3.5rem', color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(245,245,240,0.4)', fontFamily: 'Barlow Condensed', fontWeight: 700, marginTop: '0.5rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'shows' && (
          <div style={{ background: '#161616', border: '4px solid rgba(245,245,240,0.1)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#FF0266' }}>
                  {['Title', 'Author', 'Producer', 'Genre', 'Status', 'Action'].map(h => (
                    <th key={h} style={{ ...tdStyle, color: '#fff', fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shows.map(show => (
                  <tr key={show.id} style={{ transition: 'background 0.1s' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={tdStyle}><strong>{show.title}</strong></td>
                    <td style={{ ...tdStyle, color: 'rgba(245,245,240,0.5)' }}>{show.author}</td>
                    <td style={{ ...tdStyle, color: 'rgba(245,245,240,0.5)' }}>{show.producerName}</td>
                    <td style={tdStyle}>{show.genre}</td>
                    <td style={tdStyle}>
                      <span style={{ background: '#00E5FF', color: '#0a0a0a', padding: '0.15rem 0.5rem', fontSize: '0.6rem', fontFamily: 'Barlow Condensed', fontWeight: 700, textTransform: 'uppercase' }}>{show.rightsStatus}</span>
                    </td>
                    <td style={tdStyle}>
                      <button onClick={() => { if (confirm(`Delete "${show.title}"?`)) onDeleteShow(show.id) }} style={{ background: '#FF0266', color: '#fff', border: 'none', padding: '0.3rem 0.75rem', fontFamily: 'Barlow Condensed', fontWeight: 700, fontStyle: 'italic', fontSize: '0.75rem', textTransform: 'uppercase', cursor: 'pointer' }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'users' && (
          <div style={{ background: '#161616', border: '4px solid rgba(245,245,240,0.1)', overflow: 'hidden' }}>
            {loadingUsers ? (
              <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '2rem', color: '#FFD600' }}>LOADING...</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#FFD600' }}>
                    {['Name', 'Status', 'Subscription Until', 'Uploads', 'Action'].map(h => (
                      <th key={h} style={{ ...tdStyle, color: '#0a0a0a', fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={tdStyle}><strong>{u.name || '—'}</strong></td>
                      <td style={tdStyle}>
                        <span style={{ background: u.is_paid ? '#00E5FF' : 'rgba(255,255,255,0.1)', color: u.is_paid ? '#0a0a0a' : '#f5f5f0', padding: '0.15rem 0.5rem', fontSize: '0.6rem', fontFamily: 'Barlow Condensed', fontWeight: 700, textTransform: 'uppercase' }}>
                          {u.is_paid ? 'PRO' : 'FREE'}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, color: 'rgba(245,245,240,0.5)' }}>{u.subscription_expiry || '—'}</td>
                      <td style={tdStyle}>{u.uploaded_show_ids?.length || 0}</td>
                      <td style={tdStyle}>
                        <button onClick={() => togglePaid(u.id, u.is_paid)} style={{ background: u.is_paid ? '#FF0266' : '#00E5FF', color: u.is_paid ? '#fff' : '#0a0a0a', border: 'none', padding: '0.3rem 0.75rem', fontFamily: 'Barlow Condensed', fontWeight: 700, fontStyle: 'italic', fontSize: '0.75rem', textTransform: 'uppercase', cursor: 'pointer' }}>
                          {u.is_paid ? 'Revoke PRO' : 'Grant PRO'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminPage
