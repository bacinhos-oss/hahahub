import React from 'react'
import { Page, User } from '../types'

interface NavProps {
  activePage: Page
  user?: User | null
  onNavigate: (page: Page) => void
  onLogout?: () => void
}

const Navigation: React.FC<NavProps> = ({ activePage, user, onNavigate, onLogout }) => {
  const s: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
    background: '#0a0a0a', borderBottom: '4px solid #f5f5f0',
    padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
  }
  const navLink = (page: Page, label: string, color = '#f5f5f0') => (
    <button
      onClick={() => onNavigate(page)}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontStyle: 'italic',
        fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase',
        color: activePage === page ? color : 'rgba(245,245,240,0.5)',
        borderBottom: activePage === page ? `3px solid ${color}` : '3px solid transparent',
        paddingBottom: '2px', transition: 'all 0.2s'
      }}
    >
      {label}
    </button>
  )

  return (
    <header style={s}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
        <button
          onClick={() => onNavigate('landing')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: '2rem', color: '#FFD600', letterSpacing: '-0.02em' }}
        >
          HAHAHUB
        </button>
        <nav style={{ display: 'flex', gap: '2rem' }}>
          {navLink('discovery', 'Catalog', '#FFD600')}
          {navLink('upload', 'Upload', '#00E5FF')}
          {user?.role === 'admin' && navLink('admin', 'Admin', '#FF0266')}
        </nav>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {user ? (
          <>
            <button
              onClick={() => onNavigate('subscription')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'right' }}
            >
              <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '0.85rem', color: '#f5f5f0' }}>{user.name}</div>
              <div style={{ fontSize: '0.6rem', color: '#00E5FF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>{user.isPaid ? 'PRO MEMBER' : 'FREE'}</div>
            </button>
            <button
              onClick={onLogout}
              style={{ background: 'none', border: '2px solid rgba(245,245,240,0.2)', color: '#f5f5f0', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>logout</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => onNavigate('login')}
            style={{ background: '#f5f5f0', color: '#0a0a0a', border: '3px solid #0a0a0a', padding: '0.5rem 1.5rem', fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', boxShadow: '3px 3px 0 #FF0266' }}
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  )
}

export default Navigation
