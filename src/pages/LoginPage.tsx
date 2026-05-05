import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { User } from '../types'

const ADMIN_EMAIL = 'bacinhos@gmail.com'
const PAYPAL_CLIENT_ID = 'AWTdSJP21yPSFId7J2fucaypo0J5G1EEb93kwYuptegD_LY2g7G8lxC0ioNL4AeZhBEuEuFODiIbGQIX'

interface Props {
  onSuccess: (isPaid: boolean) => void
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
  const [isResetMode, setIsResetMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  // Registration flow steps
  const [regStep, setRegStep] = useState<'form' | 'payment' | 'success'>('form')
  const [pendingUser, setPendingUser] = useState<any>(null)
  const paypalRef = useRef<HTMLDivElement>(null)
  const paypalLoaded = useRef(false)

  useEffect(() => {
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    if (params.get('type') === 'recovery') setIsResetMode(true)
  }, [])

  useEffect(() => {
    if (regStep !== 'payment') return
    const loadPayPal = () => {
      if (paypalLoaded.current) { 
        setTimeout(() => renderPayPal(), 100)
        return 
      }
      // Check if already loaded
      if ((window as any).paypal) {
        paypalLoaded.current = true
        setTimeout(() => renderPayPal(), 100)
        return
      }
      const existing = document.querySelector('script[src*="paypal.com/sdk"]')
      if (existing) {
        existing.addEventListener('load', () => { paypalLoaded.current = true; renderPayPal() })
        return
      }
      const script = document.createElement('script')
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=EUR`
      script.onload = () => { paypalLoaded.current = true; setTimeout(() => renderPayPal(), 100) }
      document.body.appendChild(script)
    }
    loadPayPal()
  }, [regStep])

  const renderPayPal = () => {
    if (!paypalRef.current || !(window as any).paypal) return
    paypalRef.current.innerHTML = ''
    ;(window as any).paypal.Buttons({
      style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' },
      createOrder: (_data: any, actions: any) => actions.order.create({
        purchase_units: [{ amount: { value: '99.00', currency_code: 'EUR' }, description: 'HAHAHUB Annual Pass' }]
      }),
      onApprove: async (_data: any, actions: any) => {
        await actions.order.capture()
        await completeRegistration()
      },
      onError: () => { setError('PayPal payment failed. Please try again.'); setRegStep('form') },
      onCancel: () => setRegStep('form')
    }).render(paypalRef.current)
  }

  const completeRegistration = async () => {
    if (!pendingUser) return
    const expiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    await supabase.from('profiles').update({ is_paid: true, subscription_expiry: expiry }).eq('id', pendingUser.id)
    const user: User = {
      id: pendingUser.id, email: pendingUser.email,
      name: name.toUpperCase(),
      role: 'Producer',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${pendingUser.email}`,
      isPaid: true, isAdmin: false,
      subscription: { type: 'Annual', expiryDate: expiry, status: 'Active', discounts: ['-20% on script printing', 'VIP Networking', 'Unlimited PDF downloads'] },
      favorites: [], uploadedShowIds: [],
    }
    setCurrentUser(user)
    setRegStep('success')
    // Wait for success screen then navigate - user is already set so discovery guard will pass
    setTimeout(() => {
      onSuccess(true)
    }, 3500)
  }

  const handleForgotPassword = async () => {
    if (!email) { setError('Please enter your email address first.'); return }
    setLoading(true)
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://www.hahahub.art/login' })
    if (resetError) setError(resetError.message)
    else setResetSent(true)
    setLoading(false)
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) setError(updateError.message)
    else { setError('Password updated! You can now sign in.'); setIsResetMode(false); setPassword('') }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isNew) {
        // Check if invited (free access)
        const { data: invite } = await supabase.from('invitations').select('*').eq('email', email).eq('status', 'pending').maybeSingle()
        const isAdmin = email === ADMIN_EMAIL
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
        if (signUpError) throw signUpError
        if (data.user) {
          const isPaid = isAdmin || !!invite
          if (invite) await supabase.from('invitations').update({ status: 'used' }).eq('id', invite.id)
          await supabase.from('profiles').insert([{ id: data.user.id, name: name.toUpperCase(), is_paid: isPaid, favorites: [], uploaded_show_ids: [] }])
          if (isPaid) {
            // Invited or admin — skip payment
            setCurrentUser({
              id: data.user.id, email, name: name.toUpperCase(), role: isAdmin ? 'admin' : 'Producer',
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
              isPaid: true, isAdmin,
              subscription: { type: 'Annual', expiryDate: 'Dec 24, 2025', status: 'Active', discounts: ['-20% on script printing', 'VIP Networking', 'Unlimited PDF downloads'] },
              favorites: [], uploadedShowIds: [],
            })
            onSuccess(true)
          } else {
            // Go to payment step
            setPendingUser({ id: data.user.id, email })
            setRegStep('payment')
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
            subscription: (profile?.is_paid || isAdmin) ? { type: 'Annual', expiryDate: profile?.subscription_expiry || 'Dec 24, 2025', status: 'Active', discounts: ['-20% on script printing', 'VIP Networking', 'Unlimited PDF downloads'] } : undefined,
            favorites: profile?.favorites || [],
            uploadedShowIds: profile?.uploaded_show_ids || [],
          })
          onSuccess(profile?.is_paid || isAdmin)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error')
    }
    setLoading(false)
  }

  // PASSWORD RESET SCREENS
  if (isResetMode) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-brand-black text-black">
      <div className="max-w-md w-full bg-white border-8 border-black p-12 shadow-[12px_12px_0px_#03DAC6]">
        <button onClick={() => setIsResetMode(false)} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black mb-8 italic">← Back</button>
        <div className="logo-text text-4xl uppercase mb-12 text-center">HAHAHUB</div>
        <h2 className="text-2xl font-black uppercase mb-8 italic">Set New Password</h2>
        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-100 border-4 border-black px-4 py-4 font-bold outline-none" placeholder="••••••••" />
          {error && <div className="bg-brand-pink text-white p-4 font-black uppercase text-xs italic">{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-black text-brand-cyan font-black py-5 uppercase text-lg border-4 border-black shadow-neo-cyan italic">
            {loading ? 'SAVING...' : 'UPDATE PASSWORD'}
          </button>
        </form>
      </div>
    </div>
  )

  if (resetSent) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-brand-black">
      <div className="max-w-md w-full bg-white border-8 border-black p-12 shadow-neo-cyan text-black">
        <div className="logo-text text-4xl uppercase mb-8 text-center">HAHAHUB</div>
        <h2 className="text-3xl font-black uppercase italic mb-4 text-brand-cyan">CHECK YOUR EMAIL</h2>
        <p className="font-bold italic text-gray-600 mb-8">We sent a password reset link to <strong>{email}</strong>.</p>
        <button onClick={() => { setResetSent(false); setIsResetMode(false) }} className="w-full bg-black text-brand-cyan font-black py-5 uppercase border-4 border-black shadow-neo-cyan italic">Back to Sign In</button>
      </div>
    </div>
  )

  // PAYMENT STEP
  if (regStep === 'payment') return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-brand-black">
      <div className="max-w-md w-full bg-white border-8 border-black p-12 shadow-[12px_12px_0px_#FF0266]">
        <div className="logo-text text-4xl uppercase mb-6 text-center text-black">HAHAHUB</div>
        <div className="text-center mb-8">
          <span className="bg-brand-yellow text-black px-4 py-1 text-xs font-black uppercase tracking-[0.3em] italic">Step 2 of 2</span>
        </div>
        <h2 className="text-2xl font-black uppercase italic mb-2 text-black">Unlock the Vault</h2>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-6">Annual Pass — €99</p>
        <div className="bg-gray-100 border-4 border-black p-4 mb-8 text-black">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Registering as</p>
          <p className="font-black uppercase">{name}</p>
          <p className="text-xs text-gray-500">{email}</p>
        </div>
        {error && <div className="bg-brand-pink text-white p-4 font-black uppercase text-xs italic mb-6">{error}</div>}
        <div ref={paypalRef} className="min-h-[150px]">
          <div className="flex items-center justify-center py-10">
            <div className="w-10 h-10 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        <button onClick={() => setRegStep('form')} className="mt-6 w-full text-center text-gray-400 text-xs font-black uppercase tracking-widest hover:text-black italic">← Back</button>
      </div>
    </div>
  )

  // SUCCESS SCREEN
  if (regStep === 'success') return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-brand-black">
      <div className="max-w-md w-full bg-white border-8 border-black p-12 shadow-[12px_12px_0px_#03DAC6] text-center">
        <div className="logo-text text-4xl uppercase mb-8 text-black">HAHAHUB</div>
        <div className="w-28 h-28 bg-brand-yellow border-4 border-black mx-auto flex items-center justify-center rotate-3 shadow-[8px_8px_0px_#FF0266] mb-8">
          <span className="text-5xl">🎭</span>
        </div>
        <h2 className="text-4xl font-black uppercase italic mb-3 text-black leading-tight">Tickle<br/>the Laugh!</h2>
        <p className="font-black text-brand-pink uppercase tracking-[0.2em] text-sm mb-4">Premium Access Active</p>
        <p className="text-gray-600 font-bold text-sm mb-2">Welcome, <strong className="text-black">{name.toUpperCase()}</strong>!</p>
        <p className="text-gray-400 text-xs uppercase font-bold tracking-widest">Entering the vault...</p>
        <div className="flex justify-center gap-1 mt-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-brand-cyan animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}></div>
          ))}
        </div>
      </div>
    </div>
  )

  // MAIN LOGIN/REGISTER FORM
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-brand-black text-black">
      <div className="max-w-md w-full bg-white border-8 border-black p-12 shadow-[12px_12px_0px_#FF0266]">
        <button onClick={onBack} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black mb-8 italic">← Back</button>
        <div className="logo-text text-4xl uppercase mb-12 text-center">HAHAHUB</div>

        {adminMode ? (
          <div className="mb-8"><span className="bg-brand-pink text-white px-4 py-1 text-xs font-black uppercase tracking-[0.3em] italic">Admin Access</span></div>
        ) : (
          <div className="flex border-4 border-black mb-8 p-1">
            {[false, true].map((val, i) => (
              <button key={i} onClick={() => setIsNew(val)} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-all ${isNew === val ? 'bg-black text-white' : 'bg-transparent text-black'}`}>
                {i === 0 ? 'Sign In' : 'Join Hub'}
              </button>
            ))}
          </div>
        )}

        {isNew && (
          <div className="mb-6">
            <div className="flex items-center gap-3 bg-brand-yellow/20 border-2 border-brand-yellow p-3">
              <span className="text-lg">🎭</span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Step 1 of 2</p>
                <p className="text-xs font-black uppercase">Create Account → PayPal Payment</p>
              </div>
            </div>
          </div>
        )}

        <h2 className="text-black text-2xl font-black uppercase mb-8 italic">
          {adminMode ? 'Control Center Access' : isNew ? 'Create Account' : 'Welcome back, legend'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isNew && !adminMode && (
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-gray-500 italic">Name / Production Company</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-100 border-4 border-black px-4 py-4 font-bold outline-none focus:border-brand-cyan transition-all" placeholder="E.G. COMEDY STAGE NYC" />
            </div>
          )}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-gray-500 italic">Email Address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-100 border-4 border-black px-4 py-4 font-bold outline-none focus:border-brand-cyan transition-all" placeholder="COMEDY@PRODUCER.COM" />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-gray-500 italic">Password</label>
            <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-100 border-4 border-black px-4 py-4 font-bold outline-none focus:border-brand-pink transition-all" placeholder="••••••••" />
          </div>

          {error && <div className="bg-brand-pink text-white p-4 font-black uppercase text-xs italic tracking-wider">{error}</div>}

          <button type="submit" disabled={loading} className="w-full bg-black text-brand-yellow font-black py-5 uppercase text-lg border-4 border-black shadow-neo-cyan italic hover:bg-brand-pink transition-all">
            {loading ? 'LOADING...' : adminMode ? 'ENTER HQ' : isNew ? 'NEXT → PAYMENT' : 'ENTER THE VAULT'}
          </button>
        </form>

        {!isNew && !adminMode && (
          <button onClick={handleForgotPassword} className="mt-6 w-full text-center text-gray-500 text-xs font-black uppercase tracking-widest hover:text-brand-pink transition-colors italic">
            Forgot password?
          </button>
        )}
      </div>
    </div>
  )
}

export default LoginPage
