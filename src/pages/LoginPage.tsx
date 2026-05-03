import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { User } from '../types'

const ADMIN_EMAIL = 'bacinhos@gmail.com'

interface Props {
  onSuccess: () => void
  onBack: () => void
  setCurrentUser: (user: User) => void
  adminMode?: boolean
}

const LoginPage: React.FC<Props> = ({ onSuccess, onBack, setCurrentUser, adminMode = false }) => {
  const [isNew, setIsNew] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkEmail, setCheckEmail] = useState(false)
  const [isResetMode, setIsResetMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  useEffect(() => {
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    if (params.get('type') === 'recovery') {
      setIsResetMode(true)
    }
  }, [])

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.')
      return
    }
    setError('')
    setLoading(true)
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://www.hahahub.art/login'
    })
    if (resetError) {
      setError(resetError.message)
    } else {
      setResetSent(true)
    }
    setLoading(false)
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setError(updateError.message)
    } else {
      setError('Password updated! You can now sign in.')
      setIsResetMode(false)
      setPassword('')
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isNew) {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
        if (signUpError) throw signUpError
        if (data.user) {
          const isAdmin = email === ADMIN_EMAIL
          // Preveri invitation
          const { data: invite } = await supabase
            .from('invitations')
            .select('*')
            .eq('email', email)
            .eq('status', 'pending')
            .maybeSingle()
          const isPaid = isAdmin || !!invite
          if (invite) {
            await supabase.from('invitations').update({ status: 'used' }).eq('id', invite.id)
          }
          await supabase.from('profiles').insert([{
            id: data.user.id,
            name: name.toUpperCase(),
            is_paid: isPaid,
            favorites: [],
            uploaded_show_ids: []
          }])
          if (data.session) {
            setCurrentUser({
              id: data.user.id, email,
              name: name.toUpperCase(),
              role: isAdmin ? 'admin' : 'Producer',
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
              isPaid, isAdmin,
              subscription: isPaid ? { type: 'Annual', expiryDate: 'Dec 24, 2025', status: 'Active', discounts: ['-20% on script printing', 'VIP Networking', 'Unlimited PDF downloads'] } : undefined,
              favorites: [], uploadedShowIds: [],
            })
            onSuccess()
          } else {
            setCheckEmail(true)
          }
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
        if (data.user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle()
          const isAdmin = email === ADMIN_EMAIL
          setCurrentUser({
            id: data.user.id, email,
            name: profile?.name || email.split('@')[0].toUpperCase(),
            role: isAdmin ? 'admin' : 'Producer',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            isPaid: profile?.is_paid || isAdmin, isAdmin,
            subscription: (profile?.is_paid || isAdmin) ? {
              type: 'Annual', expiryDate: profile?.subscription_expiry || 'Dec 24, 2025',
              status: 'Active', discounts: ['-20% on script printing', 'VIP Networking', 'Unlimited PDF downloads']
            } : undefined,
            favorites: profile?.favorites || [],
            uploadedShowIds: profile?.uploaded_show_ids || [],
          })
          onSuccess()
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error')
    }
    setLoading(false)
  }

  const handleBackToSignIn = () => {
    setCheckEmail(false)
    setIsResetMode(false)
    setResetSent(false)
    setIsNew(false)
    setError('')
  }

  if (isResetMode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-brand-black text-black">
        <div className="max-w-md w-full bg-white border-8 border-black p-12 shadow-[12px_12px_0px_#03DAC6]">
          <button onClick={handleBackToSignIn} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors mb-8 italic">← Back</button>
          <div className="logo-text text-4xl uppercase mb-12 text-center">HAHAHUB</div>
          <h2 className="text-black text-2xl font-black uppercase mb-8 italic">Set New Password</h2>
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-gray-500 italic">New Password</label>
              <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-100 border-4 border-black px-4 py-4 text-black font-bold focus:ring-0 focus:border-brand-cyan transition-all outline-none" placeholder="••••••••" />
            </div>
            {error && (
              <div className="bg-brand-pink text-white p-4 font-black uppercase text-xs italic tracking-wider">{error}</div>
            )}
            <button type="submit" disabled={loading} className="w-full bg-black text-brand-cyan font-black py-5 uppercase text-lg border-4 border-black shadow-neo-cyan italic hover:bg-brand-cyan hover:text-black transition-all">
              {loading ? 'SAVING...' : 'UPDATE PASSWORD'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (checkEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-brand-black">
        <div className="max-w-md w-full bg-white border-8 border-black p-12 shadow-neo-magenta text-black">
          <div className="logo-text text-4xl uppercase mb-8 text-center">HAHAHUB</div>
          <h2 className="text-3xl font-black uppercase italic mb-4 text-brand-pink">CHECK YOUR EMAIL</h2>
          <p className="font-bold italic text-gray-600 mb-8">
            We sent a confirmation link to <strong>{email}</strong>.<br /><br />
            Click the link, then come back and sign in.
          </p>
          <button onClick={handleBackToSignIn} className="w-full bg-black text-brand-yellow font-black py-5 uppercase text-lg border-4 border-black shadow-neo-cyan italic">
            Back to Sign In
          </button>
        </div>
      </div>
    )
  }

  if (resetSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-brand-black">
        <div className="max-w-md w-full bg-white border-8 border-black p-12 shadow-neo-cyan text-black">
          <div className="logo-text text-4xl uppercase mb-8 text-center">HAHAHUB</div>
          <h2 className="text-3xl font-black uppercase italic mb-4 text-brand-cyan">CHECK YOUR EMAIL</h2>
          <p className="font-bold italic text-gray-600 mb-8">
            We sent a password reset link to <strong>{email}</strong>.<br /><br />
            Click the link to set a new password.
          </p>
          <button onClick={handleBackToSignIn} className="w-full bg-black text-brand-cyan font-black py-5 uppercase text-lg border-4 border-black shadow-neo-cyan italic">
            Back to Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-brand-black text-black">
      <div className="max-w-md w-full bg-white border-8 border-black p-12 shadow-[12px_12px_0px_#FF0266]">
        <button onClick={onBack} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors mb-8 italic">← Back</button>
       
        <div className="logo-text text-4xl uppercase mb-12 text-center">HAHAHUB</div>

        {adminMode ? (
          <div className="mb-8">
            <span className="bg-brand-pink text-white px-4 py-1 text-xs font-black uppercase tracking-[0.3em] italic">Admin Access</span>
          </div>
        ) : (
          <div className="flex border-4 border-black mb-8 p-1">
            {[false, true].map((val, i) => (
              <button key={i} onClick={() => setIsNew(val)} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-all ${isNew === val ? 'bg-black text-white' : 'bg-transparent text-black'}`}>
                {i === 0 ? 'Sign In' : 'Join Hub'}
              </button>
            ))}
          </div>
        )}

        <h2 className="text-black text-2xl font-black uppercase mb-8 italic">
          {adminMode ? 'Control Center Access' : isNew ? 'Create your account' : 'Welcome back, legend'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isNew && !adminMode && (
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-gray-500 italic">Name / Production Company</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-100 border-4 border-black px-4 py-4 text-black font-bold focus:ring-0 focus:border-brand-cyan transition-all outline-none" placeholder="E.G. COMEDY STAGE NYC" />
            </div>
          )}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-gray-500 italic">Email Address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-100 border-4 border-black px-4 py-4 text-black font-bold focus:ring-0 focus:border-brand-cyan transition-all outline-none" placeholder="COMEDY@PRODUCER.COM" />
          </div>
          {!isNew && !adminMode && (
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-gray-500 italic">Password</label>
              <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-100 border-4 border-black px-4 py-4 text-black font-bold focus:ring-0 focus:border-brand-pink transition-all outline-none" placeholder="••••••••" />
            </div>
          )}
          {isNew && (
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-gray-500 italic">Password</label>
              <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-100 border-4 border-black px-4 py-4 text-black font-bold focus:ring-0 focus:border-brand-pink transition-all outline-none" placeholder="••••••••" />
            </div>
          )}

          {error && (
            <div className="bg-brand-pink text-white p-4 font-black uppercase text-xs italic tracking-wider">{error}</div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-black text-brand-yellow font-black py-5 uppercase text-lg border-4 border-black shadow-neo-cyan italic hover:bg-brand-pink transition-all">
            {loading ? 'LOADING...' : adminMode ? 'ENTER HQ' : isNew ? 'CREATE ACCOUNT' : 'ENTER THE VAULT'}
          </button>
        </form>

        {!isNew && !adminMode && (
          <button
            onClick={handleForgotPassword}
            className="mt-6 w-full text-center text-gray-500 text-xs font-black uppercase tracking-widest hover:text-brand-pink transition-colors italic"
          >
            Forgot password?
          </button>
        )}
      </div>
    </div>
  )
}

export default LoginPage