import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { User } from '../types'
import PaymentModal from '../components/PaymentModal'

const ADMIN_EMAIL = 'bacinhos@gmail.com'

interface Props {
  onSuccess: (isPaid: boolean) => void
  onBack: () => void
  setCurrentUser: (user: User) => void
  adminMode?: boolean
}

const PLAN_CONFIG = {
  gigl: { label: 'GIGL', price: '€0', color: 'text-white', desc: 'Free · Solo Producer', isPaid: false },
  laff: { label: 'LAFF', price: '€99', color: 'text-brand-pink', desc: 'Pro · €99/year', isPaid: true },
  roar: { label: 'ROAR', price: '€189', color: 'text-brand-pink', desc: 'Studio · €189/year', isPaid: true },
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
  const [regStep, setRegStep] = useState<'form' | 'payment' | 'success'>('form')
  const [pendingUser, setPendingUser] = useState<any>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'gigl' | 'laff' | 'roar'>('laff')

  useEffect(() => {
    // Read plan from sessionStorage (set by Landing page buttons)
    const plan = sessionStorage.getItem('selectedPlan') as 'gigl' | 'laff' | 'roar' | null
    if (plan) { setSelectedPlan(plan); setIsNew(true); }
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    if (params.get('type') === 'recovery') setIsResetMode(true)
  }, [])

  const planConfig = PLAN_CONFIG[selectedPlan]

  const completeRegistration = async (planOverride?: 'gigl' | 'laff' | 'roar') => {
    if (!pendingUser) return
    const plan = planOverride || selectedPlan
    const isPaid = plan !== 'gigl'
    const expiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    await supabase.from('profiles').update({
      is_paid: isPaid,
      user_type: plan,
      subscription_expiry: isPaid ? expiry : null
    }).eq('id', pendingUser.id)
    const user: User = {
      id: pendingUser.id, email: pendingUser.email,
      name: name.toUpperCase(), role: 'Producer',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${pendingUser.email}`,
      isPaid, isAdmin: false, plan,
      subscription: isPaid ? { type: 'Annual', expiryDate: expiry, status: 'Active', discounts: [] } : undefined,
      favorites: [], uploadedShowIds: [],
    }
    setCurrentUser(user)
    setShowPaymentModal(false)
    sessionStorage.removeItem('selectedPlan')
    setRegStep('success')
    setTimeout(() => { onSuccess(isPaid) }, 3000)
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
    e.preventDefault(); setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) setError(updateError.message)
    else { setError('Password updated!'); setIsResetMode(false); setPassword('') }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      if (isNew) {
        const { data: invite } = await supabase.from('invitations').select('*').eq('email', email).eq('status', 'pending').maybeSingle()
        const isAdmin = email === ADMIN_EMAIL
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
        if (signUpError) throw signUpError
        if (data.user) {
          const invitePlan = invite?.plan || 'laff'
          const isInvited = !!invite || isAdmin
          if (invite) await supabase.from('invitations').update({ status: 'used' }).eq('id', invite.id)
          await supabase.from('profiles').insert([{
            id: data.user.id, name: name.toUpperCase(),
            is_paid: isInvited,
            user_type: isAdmin ? 'roar' : isInvited ? invitePlan : selectedPlan === 'gigl' ? 'gigl' : null,
            favorites: [], uploaded_show_ids: []
          }])
          if (isInvited) {
            // Invited or admin — skip payment
            const expiry = new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
            setCurrentUser({
              id: data.user.id, email, name: name.toUpperCase(),
              role: isAdmin ? 'admin' : 'Producer',
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
              isPaid: true, isAdmin, plan: isAdmin ? 'roar' : invitePlan as any,
              subscription: { type: 'Annual', expiryDate: expiry, status: 'Active', discounts: [] },
              favorites: [], uploadedShowIds: [],
            })
            sessionStorage.removeItem('selectedPlan')
            onSuccess(true)
          } else if (selectedPlan === 'gigl') {
            // Free plan — no payment
            setCurrentUser({
              id: data.user.id, email, name: name.toUpperCase(),
              role: 'Producer', avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
              isPaid: false, isAdmin: false, plan: 'gigl',
              favorites: [], uploadedShowIds: [],
            })
            sessionStorage.removeItem('selectedPlan')
            setRegStep('success')
            setTimeout(() => onSuccess(false), 3000)
          } else {
            // LAFF or ROAR — go to payment
            setPendingUser({ id: data.user.id, email })
            setShowPaymentModal(true)
          }
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
        if (data.user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle()
          const isAdmin = email === ADMIN_EMAIL
          const plan = isAdmin ? 'roar' : (profile?.user_type === 'roar' ? 'roar' : profile?.user_type === 'laff' || profile?.is_paid ? 'laff' : 'gigl')
          setCurrentUser({
            id: data.user.id, email,
            name: profile?.name || email.split('@')[0].toUpperCase(),
            role: isAdmin ? 'admin' : 'Producer',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            isPaid: profile?.is_paid || isAdmin, isAdmin, plan: plan as any,
            subscription: (profile?.is_paid || isAdmin) ? { type: 'Annual', expiryDate: profile?.subscription_expiry || '', status: 'Active', discounts: [] } : undefined,
            favorites: profile?.favorites || [],
            uploadedShowIds: profile?.uploaded_show_ids || [],
          })
          onSuccess(profile?.is_paid || isAdmin)
        }
      }
    } catch (err: any) { setError(err.message || 'Authentication error') }
    setLoading(false)
  }

  if (isResetMode) return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-brand-black text-black">
      <div className="w-full max-w-md bg-white border-8 border-black p-6 md:p-12 shadow-[12px_12px_0px_#03DAC6]">
        <button onClick={() => setIsResetMode(false)} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black mb-8 italic">← Back</button>
        <div className="logo-text text-4xl uppercase mb-12 text-center">HAHAHUB</div>
        <h2 className="text-2xl font-black uppercase mb-8 italic">Set New Password</h2>
        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-100 border-4 border-black px-4 py-4 font-bold outline-none" placeholder="••••••••" />
          {error && <div className="bg-brand-pink text-white p-4 font-black uppercase text-xs italic">{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-black text-brand-cyan font-black py-5 uppercase text-lg border-4 border-black shadow-neo-cyan italic">{loading ? 'SAVING...' : 'UPDATE PASSWORD'}</button>
        </form>
      </div>
    </div>
  )

  if (resetSent) return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-brand-black">
      <div className="w-full max-w-md bg-white border-8 border-black p-6 md:p-12 shadow-neo-cyan text-black">
        <div className="logo-text text-4xl uppercase mb-8 text-center">HAHAHUB</div>
        <h2 className="text-3xl font-black uppercase italic mb-4 text-brand-cyan">CHECK YOUR EMAIL</h2>
        <p className="font-bold italic text-gray-600 mb-8">We sent a reset link to <strong>{email}</strong>.</p>
        <button onClick={() => { setResetSent(false); setIsResetMode(false) }} className="w-full bg-black text-brand-cyan font-black py-5 uppercase border-4 border-black shadow-neo-cyan italic">Back to Sign In</button>
      </div>
    </div>
  )

  if (regStep === 'success') return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-brand-black">
      <div className="w-full max-w-md bg-white border-8 border-black p-6 md:p-12 shadow-[12px_12px_0px_#03DAC6] text-center">
        <div className="logo-text text-4xl uppercase mb-8 text-black">HAHAHUB</div>
        <div className="w-28 h-28 bg-brand-yellow border-4 border-black mx-auto flex items-center justify-center rotate-3 shadow-[8px_8px_0px_#FF0266] mb-8">
          <span className="text-5xl">🥊</span>
        </div>
        <h2 className="text-4xl font-black uppercase italic mb-3 text-black leading-tight">All Set Up.<br/>Time to Punch.</h2>
        <p className="font-black text-brand-pink uppercase tracking-[0.2em] text-sm mb-4">{planConfig.label} — {planConfig.desc}</p>
        <p className="text-gray-600 font-bold text-sm mb-2">Welcome, <strong>{name.toUpperCase()}</strong>!</p>
        <p className="text-gray-400 text-xs uppercase font-bold tracking-widest">Break a Laffing Leg. 🦵</p>
        <div className="flex justify-center gap-1 mt-6">
          {[...Array(5)].map((_, i) => <div key={i} className="w-2 h-2 bg-brand-cyan animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}></div>)}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-brand-black text-black">
      <PaymentModal
        isOpen={showPaymentModal}
        planName={selectedPlan === 'roar' ? 'ROAR Annual' : 'LAFF Annual'}
        price={selectedPlan === 'roar' ? '€189' : '€99'}
        userEmail={email}
        userName={name}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={() => completeRegistration()}
      />
      <div className="w-full max-w-md bg-white border-8 border-black p-6 md:p-12 shadow-[12px_12px_0px_#FF0266]">
        <button onClick={onBack} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black mb-8 italic">← Back</button>
        <div className="logo-text text-4xl uppercase mb-8 text-center">HAHAHUB</div>

        {/* Plan selector for new users */}
        {isNew && !adminMode && (
          <div className="mb-6 border-4 border-black p-4 space-y-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 italic">Selected Plan</p>
            <div className="flex gap-2">
              {(['gigl', 'laff', 'roar'] as const).map(plan => (
                <button key={plan} onClick={() => setSelectedPlan(plan)}
                  className={`flex-1 py-2 text-[10px] font-black uppercase italic border-2 transition-all ${selectedPlan === plan ?
                    plan === 'roar' ? 'bg-brand-pink text-white border-brand-pink' :
                    plan === 'laff' ? 'bg-black text-brand-yellow border-black' :
                    'bg-gray-100 text-black border-black'
                  : 'border-gray-200 text-gray-400 hover:border-gray-400'}`}>
                  {plan.toUpperCase()}<br/>
                  <span className="font-bold normal-case">{PLAN_CONFIG[plan].price}</span>
                </button>
              ))}
            </div>
            <p className="text-[9px] italic text-gray-500 text-center">{planConfig.desc}</p>
          </div>
        )}

        {!adminMode && (
          <div className="flex border-4 border-black mb-8 p-1">
            {[false, true].map((val, i) => (
              <button key={i} onClick={() => setIsNew(val)} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-all ${isNew === val ? 'bg-black text-white' : 'bg-transparent text-black'}`}>
                {i === 0 ? 'Tickle In' : 'Set Up Hub'}
              </button>
            ))}
          </div>
        )}

        <h2 className="text-black text-2xl font-black uppercase mb-8 italic">
          {adminMode ? 'Control Center' : isNew ? `Join as ${planConfig.label}.` : 'Welcome back. 🥊'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isNew && !adminMode && (
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-gray-500 italic">Name / Production Company</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-100 border-4 border-black px-4 py-4 font-bold outline-none focus:border-brand-cyan transition-all" placeholder="E.G. COMEDY STAGE NYC" />
            </div>
          )}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-gray-500 italic">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-100 border-4 border-black px-4 py-4 font-bold outline-none focus:border-brand-cyan transition-all" placeholder="COMEDY@PRODUCER.COM" />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-gray-500 italic">Password</label>
            <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-100 border-4 border-black px-4 py-4 font-bold outline-none focus:border-brand-pink transition-all" placeholder="••••••••" />
          </div>
          {error && <div className="bg-brand-pink text-white p-4 font-black uppercase text-xs italic">{error}</div>}
          <button type="submit" disabled={loading} className={`w-full font-black py-5 uppercase text-lg border-4 border-black italic hover:opacity-90 transition-all ${
            selectedPlan === 'roar' && isNew ? 'bg-brand-pink text-white shadow-[4px_4px_0px_black]' :
            selectedPlan === 'laff' && isNew ? 'bg-black text-brand-yellow shadow-neo-cyan' :
            'bg-black text-white'
          }`}>
            {loading ? 'Tickling...' : adminMode ? 'ENTER HQ' : isNew ?
              (selectedPlan === 'gigl' ? 'Start for Free →' : `Continue to Payment — ${PLAN_CONFIG[selectedPlan].price}`) :
              'Tickle In →'}
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
