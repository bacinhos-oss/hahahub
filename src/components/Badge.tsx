import React from 'react';

interface BadgeProps {
  type: 'verified' | 'founding' | 'roar' | 'laff' | 'active' | 'international';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const BADGE_CONFIG = {
  verified:      { bg: '#03DAC6', icon: 'check',        label: 'Verified',      textColor: '#000' },
  founding:      { bg: '#FFDE03', icon: 'star',         label: 'Founding',      textColor: '#000' },
  roar:          { bg: '#FF0266', icon: 'bolt',         label: 'ROAR',          textColor: '#fff' },
  laff:          { bg: '#ffffff', icon: 'music_note',   label: 'LAFF',          textColor: '#000' },
  active:        { bg: '#22c55e', icon: 'trending_up',  label: 'Active',        textColor: '#fff' },
  international: { bg: '#3b82f6', icon: 'language',     label: 'International', textColor: '#fff' },
};

const SIZES = {
  xs: { circle: 14, font: 7,  label: 'text-[7px]' },
  sm: { circle: 18, font: 9,  label: 'text-[8px]' },
  md: { circle: 24, font: 11, label: 'text-[9px]' },
  lg: { circle: 32, font: 14, label: 'text-[11px]' },
};

export const Badge: React.FC<BadgeProps> = ({ type, size = 'sm', showLabel = false }) => {
  const cfg = BADGE_CONFIG[type];
  const s = SIZES[size];
  if (!cfg) return null;
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className="rounded-full border-2 border-black flex items-center justify-center flex-shrink-0"
        style={{ width: s.circle, height: s.circle, background: cfg.bg }}
        title={cfg.label}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: s.font, color: cfg.textColor, fontVariationSettings: "'wght' 700, 'FILL' 1" }}
        >
          {cfg.icon}
        </span>
      </span>
      {showLabel && (
        <span className={`font-black uppercase italic ${s.label}`} style={{ color: cfg.bg }}>
          {cfg.label}
        </span>
      )}
    </span>
  );
};

// Avatar with badges overlay
interface AvatarProps {
  name: string;
  url?: string;
  size?: number;
  badges?: Array<'verified' | 'founding' | 'roar' | 'laff' | 'active' | 'international'>;
  onClick?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({ name, url, size = 44, badges = [], onClick }) => {
  const hasBadge = badges.length > 0;
  const primaryBadge = badges[0];
  const borderColor = badges.includes('verified') || badges.includes('roar') ? '#03DAC6' :
                      badges.includes('founding') ? '#FFDE03' : 'rgba(255,255,255,0.2)';

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className="relative flex-shrink-0 disabled:cursor-default"
      style={{ width: size + 8, height: size + 8 }}
    >
      {/* Ring for verified/founding */}
      {hasBadge && (
        <div className="absolute inset-0 rounded-full" style={{ border: `3px solid ${borderColor}`, borderRadius: '50%' }} />
      )}
      {/* Avatar circle */}
      <div
        className="absolute rounded-full overflow-hidden flex items-center justify-center bg-brand-surface border-2 border-black"
        style={{ width: size, height: size, top: 4, left: 4 }}
      >
        {url ? (
          <img src={url} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="font-black uppercase text-white/40" style={{ fontSize: size * 0.38 }}>
            {name?.[0] || '?'}
          </span>
        )}
      </div>
      {/* Primary badge bottom right */}
      {primaryBadge && (
        <div className="absolute bottom-0 right-0">
          <Badge type={primaryBadge} size="xs" />
        </div>
      )}
    </button>
  );
};

// Helper to get badges from profile data
export const getProfileBadges = (profile: any, postCount = 0, countriesCount = 0): Array<'verified' | 'founding' | 'roar' | 'laff' | 'active' | 'international'> => {
  const badges: Array<'verified' | 'founding' | 'roar' | 'laff' | 'active' | 'international'> = [];
  if (profile?.is_verified || profile?.user_type === 'roar') badges.push('verified');
  if (profile?.is_founding) badges.push('founding');
  if (profile?.user_type === 'roar') badges.push('roar');
  else if (profile?.is_paid || profile?.user_type === 'laff') badges.push('laff');
  if (postCount >= 5) badges.push('active');
  if (countriesCount >= 3) badges.push('international');
  return badges;
};

export default Badge;
