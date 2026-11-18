import React from 'react';

// Member titles. The admin assigns one per member in the Admin panel.
// Order = rank (lowest first). To rename a title or change its colours, edit it here.
export const TIERS = {
  member:   { label: 'Member',         desc: 'Welcome to the Laff Exchange.', text: '#BBBBBB', colors: ['#3A3A3A', '#5A5A5A', '#4A4A4A', '#6A6A6A'] },
  verified: { label: 'Verified',       desc: 'A verified theatre producer.', text: '#6EC6A0', colors: ['#833998', '#BB4F9C', '#19A596', '#6EC6A0'] },
  special:  { label: 'Special Member', desc: 'Very important to the HahaHub community.', text: '#FF8FB8', colors: ['#EF4986', '#FF8FB8', '#FBA21B', '#FFD27A'] },
  founding: { label: 'Founding',       desc: 'Built HahaHub with us from day one.', text: '#FFC80E', colors: ['#C9900A', '#FFC80E', '#E8A80C', '#FFE07A'] },
} as const;

export type Tier = keyof typeof TIERS;
export const TIER_ORDER: Tier[] = ['member', 'verified', 'special', 'founding'];

// Title from a profile: the one set in Admin, otherwise derived from the old flags.
export const getTier = (p: any): Tier => {
  const t = p?.member_tier;
  if (t && t in TIERS) return t as Tier;
  if (p?.is_founding) return 'founding';
  if (p?.is_verified) return 'verified';
  return 'member';
};

// The upright "UB" smile from the logo, drawn as shapes so it can take any colours.
export const Mascot: React.FC<{ tier: Tier; height?: number; className?: string }> = ({ tier, height = 18, className }) => {
  const [topOut, topIn, botOut, botIn] = TIERS[tier].colors;
  return (
    <svg viewBox="0 0 465 668" height={height} width={Math.round(height * 465 / 668)} className={className} aria-hidden="true" style={{ display: 'block', flexShrink: 0 }}>
      <title>{TIERS[tier].label}: {TIERS[tier].desc}</title>
      <rect x="14" y="14" width="438" height="313" fill={topOut} />
      <rect x="66" y="72" width="143" height="191" fill={topIn} />
      <rect x="260" y="72" width="141" height="191" fill={topIn} />
      <rect x="116" y="136" width="47" height="69" fill="#050505" />
      <rect x="304" y="136" width="47" height="69" fill="#050505" />
      <rect x="14" y="346" width="438" height="309" fill={botOut} />
      <path d="M14 402 H402 V590 H14 V527 H351 V466 H14 Z" fill={botIn} />
      <rect x="14" y="466" width="337" height="61" fill="#050505" />
    </svg>
  );
};

// Titles worth showing to other producers (Member is the default, so it stays quiet).
export const isShownTier = (t: Tier) => t !== 'member';
export const isSampleShow = (s: any) =>
  [s?.rights_holder, s?.rightsHolder, s?.producer_name, s?.producerName]
    .some(v => typeof v === 'string' && v.trim().toLowerCase() === 'demo productions');

// Big diagonal "SAMPLE" ribbon for the top-left corner of a poster (parent must be relative + overflow-hidden).
export const SampleRibbon: React.FC<{ big?: boolean }> = ({ big }) => (
  <div className="absolute top-0 left-0 z-20 pointer-events-none overflow-hidden" style={{ width: big ? 190 : 120, height: big ? 190 : 120 }}>
    <div
      className="absolute bg-brand-yellow text-black font-black uppercase italic text-center border-y-2 border-black shadow-lg"
      style={{ width: big ? 270 : 170, top: big ? 42 : 26, left: big ? -66 : -42, transform: 'rotate(-45deg)', fontSize: big ? 18 : 12, letterSpacing: big ? 6 : 4, padding: big ? '6px 0' : '4px 0' }}
    >
      Sample
    </div>
  </div>
);

// Verified-only content (scripts, creators, performance history, Studio tools).
export const canSeeVerified = (user: any) =>
  !!user && (user.isAdmin || user.email === 'bacinhos@gmail.com' || getTier(user) !== 'member');

export const VerifiedLock: React.FC<{ what: string; onList?: () => void }> = ({ what, onList }) => (
  <div className="border-2 border-dashed border-white/20 bg-white/[0.02] p-6 md:p-8 flex flex-col sm:flex-row sm:items-center gap-5">
    <Mascot tier="verified" height={52} />
    <div className="flex-1">
      <p className="text-[10px] font-black uppercase italic tracking-[0.3em] mb-1" style={{ color: TIERS.verified.text }}>Verified Producers only</p>
      <p className="text-white/70 font-bold italic leading-relaxed">{what} List your first show and you unlock it automatically.</p>
    </div>
    {onList && (
      <button onClick={onList} className="bg-white text-black px-6 py-3 font-black uppercase italic text-xs tracking-widest hover:bg-brand-pink hover:text-white transition-colors whitespace-nowrap">
        List your show →
      </button>
    )}
  </div>
);

// Small pill: mascot + title.
export const TierPill: React.FC<{ tier: Tier; size?: 'sm' | 'md' }> = ({ tier, size = 'sm' }) => (
  <span
    title={TIERS[tier].desc}
    className={`inline-flex items-center gap-1.5 border-2 font-black uppercase italic tracking-widest ${size === 'md' ? 'px-2.5 py-1 text-[10px]' : 'px-2 py-0.5 text-[9px]'}`}
    style={{ borderColor: TIERS[tier].text, color: TIERS[tier].text }}
  >
    <Mascot tier={tier} height={size === 'md' ? 16 : 13} />
    {TIERS[tier].label}
  </span>
);

export default Mascot;
