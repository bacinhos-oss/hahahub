import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { User } from '../types'

const ADMIN_EMAIL = 'bacinhos@gmail.com'

interface Props {
  onSuccess: () => void
  onBack: () => void
  setCurrentUser: (user: User) => void
}

const LoginPage: React.FC<Props> = ({ onSuccess, onBack, setCurrentUser }) => {
  const [isNew, setIsNew] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkEmail, setCheckEmail] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isNew) {
        // Register
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
        if (signUpError) throw signUpError

        if (data.user) {
          // Create profile
          await supabase.from('profiles').insert([{
            id: data.user.id,
            name: name.toUpperCase(),
            is_paid: false,
            favorites: [],
            uploaded_show_ids: []
          }])
          setCheckEmail(true)
        }
      } else {
        // Login
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError

        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()

          setCurrentUser({
            id: data.user.id,
            email,
            name: profile?.name || email.split('@')[0].toUpperCase(),
            role: email === ADMIN_EMAIL ? 'admin' : 'producer',
            isPaid: profile?.is_paid || false,
            subscriptionExpiry: profile?.subscription_expiry,
            favorites: profile?.favorites || [],
            uploadedShowIds: profile?.uploaded_show_ids || [],
          })
          onSuccess()
        }
      }
    } catch (err: any) {
      setError(err.message || 'Napaka pri prijavi')
    }
    setLoading(false)
  }

  const box: React.CSSProperties = {
    minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
  }
  const card: React.CSSProperties = {
    background: '#f5f5f0', border: '8px solid #0a0a0a', padding: '3rem', maxWidth: '420px', width: '100%',
    boxShadow: '12px 12px 0px #FF0266'
  }
  const input: React.CSSProperties = {
    width: '100%', background: '#e8e8e3', border: '4px solid #0a0a0a', padding: '1rem', color: '#0a0a0a',
    fontFamily: 'Space Mono, monospace', fontWeight: 700, fontSize: '0.85rem', outline: 'none'
  }
  const label: React.CSSProperties = {
    display: 'block', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em',
    marginBottom: '0.5rem', color: '#666', fontFamily: 'Barlow Condensed, sans-serif'
  }
  const btn: React.CSSProperties = {
    width: '100%', background: '#0a0a0a', color: '#FFD600', border: '4px solid #0a0a0a',
    padding: '1rem', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontStyle: 'italic',
    fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
    boxShadow: '4px 4px 0 #FFD600', marginTop: '0.5rem'
  }

  if (checkEmail) {
    return (
      <div style={box}>
        <div style={card}>
          <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '3rem', color: '#FF0266', marginBottom: '1rem' }}>CHECK EMAIL</div>
          <p style={{ fontFamily: 'Space Mono', fontSize: '0.85rem', lineHeight: 1.6, color: '#0a0a0a' }}>
            We sent a confirmation email to <strong>{email}</strong>.<br /><br />
            Confirm your email then sign in.
          </p>
          <button onClick={() => setCheckEmail(false)} style={{ ...btn, marginTop: '2rem' }}>Back to login</button>
        </div>
      </div>
    )
  }

  return (
    <div style={box}>
      <div style={card}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Space Mono', fontSize: '0.7rem', color: '#999', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>← Back</button>

        <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '3rem', color: '#0a0a0a', marginBottom: '0.5rem' }}>HAHAHUB</div>

        <div style={{ display: 'flex', border: '4px solid #0a0a0a', marginBottom: '2rem' }}>
          {['login', 'register'].map((t, i) => (
            <button key={t} onClick={() => setIsNew(i === 1)} style={{
              flex: 1, padding: '0.75rem', background: (isNew ? i === 1 : i === 0) ? '#0a0a0a' : 'transparent',
              color: (isNew ? i === 1 : i === 0) ? '#FFD600' : '#0a0a0a', border: 'none', cursor: 'pointer',
              fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '0.9rem', textTransform: 'uppercase'
            }}>
              {i === 0 ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {isNew && (
            <div>
              <label style={label}>Name / Production Company</label>
              <input style={input} value={name} onChange={e => setName(e.target.value)} placeholder="E.G. COMEDY THEATER NYC" required />
            </div>
          )}
          <div>
            <label style={label}>Email</label>
            <input style={input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="COMEDY@PRODUCER.COM" required />
          </div>
          <div>
            <label style={label}>Password</label>
            <input style={input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
          </div>

          {error && (
            <div style={{ background: '#FF0266', color: '#fff', padding: '0.75rem', fontFamily: 'Space Mono', fontSize: '0.75rem', fontWeight: 700 }}>
              {error}
            </div>
          )}

          <button type="submit" style={btn} disabled={loading}>
            {loading ? 'LOADING...' : isNew ? 'CREATE ACCOUNT' : 'ENTER THE VAULT'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
