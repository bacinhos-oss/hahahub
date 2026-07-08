import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface Props {
  userId: string;
  userName: string;
  onComplete: (intent: string) => void;
}

const COUNTRIES = [
  'Albania', 'Austria', 'Belgium', 'Bosnia & Herzegovina', 'Bulgaria', 'Croatia',
  'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece',
  'Hungary', 'Iceland', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg',
  'Malta', 'Montenegro', 'Netherlands', 'North Macedonia', 'Norway', 'Poland',
  'Portugal', 'Romania', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden',
  'Switzerland', 'Ukraine', 'United Kingdom', 'Australia', 'Canada', 'Israel',
  'Japan', 'New Zealand', 'South Africa', 'USA', 'Other'
];

const OnboardingWizard: React.FC<Props> = ({ userId, userName, onComplete }) => {
  const [step, setStep] = useState(1);
  const [intent, setIntent] = useState<'buyer' | 'seller' | 'both' | null>(null);
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);

  const finish = async (page: string) => {
    setSaving(true);
    const { error: onboardError } = await supabase.from('profiles').update({
      onboarded: true,
      user_intent: intent,
      location: location || null,
    }).eq('id', userId);
    if (onboardError) console.error('Onboarding save failed (wizard will reappear next login):', onboardError);
    setSaving(false);
    onComplete(intent! + '|' + page);
  };

  return (
    <div className="fixed inset-0 z-50 bg-brand-black/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-brand-surface border-4 border-white w-full max-w-lg shadow-neo-yellow">

        {/* Progress */}
        <div className="flex border-b-4 border-white/10">
          {[1, 2, 3].map(s => (
            <div key={s} className={"flex-1 h-1 transition-all " + (s <= step ? 'bg-brand-yellow' : 'bg-white/10')} />
          ))}
        </div>

        {/* Step 1 — Who are you */}
        {step === 1 && (
          <div className="p-8 space-y-6">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-brand-cyan italic mb-2">Step 1 of 3</p>
              <h2 className="text-3xl font-black uppercase italic text-white leading-tight">
                Welcome,<br /><span className="text-brand-yellow">{userName}.</span>
              </h2>
              <p className="text-white/40 text-sm italic mt-2">How will you use HahaHub?</p>
            </div>
            <div className="space-y-3">
              {[
                { key: 'buyer',  emoji: '🎭', title: "I'm a Buyer",  desc: 'I want to license comedy shows for my theatre.' },
                { key: 'seller', emoji: '🎬', title: "I'm a Seller", desc: 'I want to license out my shows internationally.' },
                { key: 'both',   emoji: '🥊', title: 'Both',          desc: 'I buy and sell rights — full power.' },
              ].map(opt => (
                <button key={opt.key} onClick={() => setIntent(opt.key as any)}
                  className={"w-full text-left border-4 p-4 transition-all flex items-center gap-4 " +
                    (intent === opt.key ? 'border-brand-yellow bg-brand-yellow/10' : 'border-white/20 hover:border-white/40')}>
                  <span className="text-3xl">{opt.emoji}</span>
                  <div>
                    <p className="font-black uppercase italic text-white">{opt.title}</p>
                    <p className="text-white/40 text-xs italic">{opt.desc}</p>
                  </div>
                  {intent === opt.key && <span className="ml-auto text-brand-yellow font-black">✓</span>}
                </button>
              ))}
            </div>
            <button onClick={() => intent && setStep(2)} disabled={!intent}
              className="w-full bg-brand-yellow text-black py-4 font-black uppercase italic text-sm border-4 border-black hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              Next →
            </button>
          </div>
        )}

        {/* Step 2 — Where are you based */}
        {step === 2 && (
          <div className="p-8 space-y-6">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-brand-cyan italic mb-2">Step 2 of 3</p>
              <h2 className="text-3xl font-black uppercase italic text-white leading-tight">
                Where are you<br /><span className="text-brand-cyan">based?</span>
              </h2>
              <p className="text-white/40 text-sm italic mt-2">Helps buyers and sellers find you.</p>
            </div>
            <div>
              <select value={location} onChange={e => setLocation(e.target.value)}
                className="w-full bg-brand-black border-4 border-white/20 focus:border-brand-cyan text-white font-black uppercase italic text-sm px-4 py-4 outline-none">
                <option value="">Select your country...</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-shrink-0 border-4 border-white/20 text-white/40 px-6 py-4 font-black uppercase italic text-sm hover:border-white hover:text-white transition-all">
                ←
              </button>
              <button onClick={() => setStep(3)} disabled={!location}
                className="flex-1 bg-brand-yellow text-black py-4 font-black uppercase italic text-sm border-4 border-black hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                Next →
              </button>
            </div>
            <button onClick={() => setStep(3)} className="w-full text-white/20 hover:text-white font-black uppercase italic text-xs transition-all">
              Skip →
            </button>
          </div>
        )}

        {/* Step 3 — First move */}
        {step === 3 && (
          <div className="p-8 space-y-6">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-brand-cyan italic mb-2">Step 3 of 3</p>
              <h2 className="text-3xl font-black uppercase italic text-white leading-tight">
                What's your<br /><span className="text-brand-pink">first move?</span>
              </h2>
              <p className="text-white/40 text-sm italic mt-2">You can always do both later.</p>
            </div>
            <div className="space-y-3">
              {(intent === 'seller' ? [
                { emoji: '📤', title: 'Upload a Show',  desc: 'List your show on the marketplace.', page: 'upload' },
                { emoji: '🔍', title: 'Browse Catalog', desc: 'See what others are listing.',       page: 'discovery' },
              ] : intent === 'buyer' ? [
                { emoji: '🔍', title: 'Browse Catalog', desc: 'Find shows to license.',             page: 'discovery' },
                { emoji: '🔥', title: 'Check LaffWire', desc: 'See latest industry news.',          page: 'wire' },
              ] : [
                { emoji: '🔍', title: 'Browse Catalog', desc: 'Tickle a show you like.',            page: 'discovery' },
                { emoji: '📤', title: 'Upload a Show',  desc: 'List your show on the marketplace.', page: 'upload' },
                { emoji: '🔥', title: 'Check LaffWire', desc: "See what's happening.",              page: 'wire' },
              ]).map(opt => (
                <button key={opt.page} onClick={() => finish(opt.page)} disabled={saving}
                  className="w-full text-left border-4 border-white/20 hover:border-brand-pink p-4 transition-all flex items-center gap-4 group">
                  <span className="text-3xl">{opt.emoji}</span>
                  <div>
                    <p className="font-black uppercase italic text-white group-hover:text-brand-pink transition-colors">{opt.title}</p>
                    <p className="text-white/40 text-xs italic">{opt.desc}</p>
                  </div>
                  <span className="ml-auto text-white/20 group-hover:text-brand-pink font-black transition-colors">→</span>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)} className="w-full text-white/20 hover:text-white font-black uppercase italic text-xs transition-all">
              ← Back
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default OnboardingWizard;
