import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const LiveActivity: React.FC = () => {
  const [activity, setActivity] = useState<any[]>([]);
  const [stats, setStats] = useState({ producers: 0, shows: 0, deals: 0, countries: 12 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: profiles }, { data: inquiries }, { data: allInquiries }, { count: pCount }, { count: sCount }, { count: dCount }] = await Promise.all([
          supabase.from('profiles').select('created_at').eq('onboarded', true).order('created_at', { ascending: false }).limit(4),
          supabase.from('inquiries').select('territory, created_at, package_type').order('created_at', { ascending: false }).limit(4),
          supabase.from('inquiries').select('territory'),
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('shows').select('*', { count: 'exact', head: true }),
          supabase.from('inquiries').select('*', { count: 'exact', head: true }),
        ]);

        const countries = new Set(allInquiries?.map((i: any) => i.territory).filter(Boolean)).size;

        const items: any[] = [];
        profiles?.forEach(p => items.push({ 
          text: `A producer joined HahaHub`, 
          time: p.created_at, color: 'text-brand-cyan' 
        }));
        inquiries?.forEach(i => items.push({ 
          text: `A producer${i.territory ? ' from ' + i.territory : ''} sent a ${i.package_type === 'full_punch' ? 'Full Punch' : 'Script'} inquiry`, 
          time: i.created_at, color: 'text-brand-pink' 
        }));
        items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        setActivity(items.slice(0, 6));
        setStats({ producers: pCount || 0, shows: sCount || 0, deals: dCount || 0, countries: countries || 0 });
        setLoaded(true);
      } catch (e) {
        // silently fail — never crash parent
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

  return (
    <section className="px-4 md:px-12 py-8 border-b-4 border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6 items-start">

          {/* Stats */}
          <div className="flex-shrink-0 space-y-2 w-full md:w-44">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-brand-pink animate-pulse"></span>
              <p className="text-[9px] font-black uppercase tracking-widest text-brand-pink italic">Live</p>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-1 gap-2">
              {[
                { label: 'Producers', value: stats.producers, color: 'text-brand-cyan' },
                { label: 'Shows', value: stats.shows, color: 'text-brand-yellow' },
                { label: 'Deals', value: stats.deals, color: 'text-brand-pink' },
                { label: 'Countries', value: stats.countries, color: 'text-white' },
              ].map((s, i) => (
                <div key={i} className="border-2 border-white/10 px-3 py-2">
                  <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-[8px] font-black uppercase italic text-white/30">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Activity feed */}
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/30 italic mb-3">Latest Activity</p>
            <div className="space-y-2">
              {activity.map((a, i) => (
                <div key={i} className="flex items-center gap-3 border-l-2 border-white/10 pl-3 py-1">
                  <p className={`text-xs font-black italic truncate flex-1 ${a.color}`}>{a.text}</p>
                  <p className="text-[8px] text-white/20 flex-shrink-0">{timeAgo(a.time)}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default LiveActivity;
