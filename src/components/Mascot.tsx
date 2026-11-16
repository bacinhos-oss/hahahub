import React from 'react';

// Member titles. The admin assigns one per member in the Admin panel.
// Order = rank (lowest first). To rename a title or change its colours, edit it here.
export const TIERS = {
  member:   { label: 'Member',         text: '#BBBBBB', colors: ['#3A3A3A', '#5A5A5A', '#4A4A4A', '#6A6A6A'] },
  verified: { label: 'Verified',       text: '#6EC6A0', colors: ['#833998', '#BB4F9C', '#19A596', '#6EC6A0'] },
  special:  { label: 'Special Member', text: '#FF8FB8', colors: ['#EF4986', '#FF8FB8', '#FBA21B', '#FFD27A'] },
  founding: { label: 'Founding',       text: '#FFC80E', colors: ['#C9900A', '#FFC80E', '#E8A80C', '#FFE07A'] },
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

// Small pill: mascot + title.
export const TierPill: React.FC<{ tier: Tier; size?: 'sm' | 'md' }> = ({ tier, size = 'sm' }) => (
  <span
    className={`inline-flex items-center gap-1.5 border-2 font-black uppercase italic tracking-widest ${size === 'md' ? 'px-2.5 py-1 text-[10px]' : 'px-2 py-0.5 text-[9px]'}`}
    style={{ borderColor: TIERS[tier].text, color: TIERS[tier].text }}
  >
    <Mascot tier={tier} height={size === 'md' ? 16 : 13} />
    {TIERS[tier].label}
  </span>
);

export default Mascot;
