import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const LiveActivity: React.FC = () => {
  const [activity, setActivity] = useState<any[]>([]);
  const [stats, setStats] = useState({ producers: 0, shows: 0, views: 0, countries: 0 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [
          { data: profiles },
          { data: inquiries },
          { data: profileLocations },
          { count: pCount },
          { count: sCount },
          { count: vCount },
        ] = await Promise.all([
          supabase.from('profiles').select('created_at, location').order('created_at', { ascending: false }).limit(4),
          supabase.from('inquiries').select('territory, created_at, package_type').order('created_at', { ascending: false }).limit(4),
          supabase.from('profiles').select('location').not('location', 'is', null),
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('shows').select('*', { count: 'exact', head: true }),
          supabase.from('show_views').select('*', { count: 'exact', head: true }),
        ]);

        // Count unique countries from producer profiles — start at 1 (Slovenia)
        const countrySet = new Set<string>(['Slovenia']);
        profileLocations?.forEach((p: any) => { if (p.location) countrySet.add(p.location.trim()); });

        const items: any[] = [];
        profiles?.forEach((p: any) => {
          const loc = (p as any).location;
          items.push({
            text: `A producer${loc ? ' from ' + loc : ''} joined HahaHub`,
            time: p.created_at,
            color: 'cyan',
          });
        });
        inquiries?.forEach((i: any) => {
          items.push({
            text: `A producer${i.territory ? ' from ' + i.territory : ''} sent a ${i.package_type === 'full_punch' ? 'Full Punch' : 'Script'} inquiry`,
            time: i.created_at,
            color: 'pink',
          });
        });
        items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        setActivity(items.slice(0, 6));
        setStats({ producers: pCount || 0, shows: sCount || 0, views: vCount || 0, countries: countrySet.size });
        setLoaded(true);
      } catch (e) {
        // silently fail
      }
    };
    load();
    const interval = setInterval(load, 1800000);
    return () => clearInterval(interval);
  }, []);

  if (!loaded) return null;

  const timeAgo = (time: string) => {
    const diff = Math.floor((Date.now() - new Date(time).getTime()) / 60000);
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  const statItems = [
    { label: 'Producers', value: stats.producers, color: '#03DAC6', border: '#03DAC6' },
    { label: 'Shows', value: stats.shows, color: '#FFDE03', border: '#FFDE03' },
    { label: 'Views', value: stats.views, color: '#FF0266', border: '#FF0266' },
    { label: 'Countries', value: stats.countries, color: '#fff', border: 'rgba(255,255,255,0.3)' },
  ];

  return (
    <section style={{ borderBottom: '4px solid rgba(255,255,255,0.08)', padding: '32px 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF0266', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
          <p style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '4px', color: '#FF0266', fontStyle: 'italic', margin: 0 }}>Live on HahaHub</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '32px', alignItems: 'start' }}>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', minWidth: '240px' }}>
            {statItems.map((s, i) => (
              <div key={i} style={{ border: `2px solid ${s.border}20`, padding: '12px 16px', background: `${s.border}08` }}>
                <p style={{ fontSize: '32px', fontWeight: 900, color: s.color, margin: '0 0 2px', lineHeight: 1, fontStyle: 'italic' }}>{s.value}</p>
                <p style={{ fontSize: '8px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Activity feed */}
          <div>
            <p style={{ fontSize: '8px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '3px', color: 'rgba(255,255,255,0.2)', marginBottom: '12px', fontStyle: 'italic' }}>Latest Activity</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {activity.length === 0 ? (
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>No activity yet — be the first.</p>
              ) : activity.map((a, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  borderLeft: `3px solid ${a.color === 'cyan' ? '#03DAC6' : '#FF0266'}30`,
                  paddingLeft: '12px', paddingTop: '6px', paddingBottom: '6px',
                }}>
                  <p style={{
                    fontSize: '11px', fontWeight: 900, fontStyle: 'italic',
                    color: a.color === 'cyan' ? '#03DAC6' : '#FF0266',
                    margin: 0, flex: 1,
                  }}>{a.text}</p>
                  <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.2)', flexShrink: 0, margin: 0, fontWeight: 700 }}>{timeAgo(a.time)}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }`}</style>
    </section>
  );
};

export default LiveActivity;
