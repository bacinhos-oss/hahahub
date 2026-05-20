import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Page, User } from '../types';

interface FAQPageProps {
  onNavigate: (page: Page) => void;
  onLogout?: () => void;
  user?: User;
}

const FAQ_CATEGORIES = [
  {
    category: 'Getting Started',
    icon: 'rocket_launch',
    color: 'brand-yellow',
    items: [
      { q: 'Who is HahaHub for?', a: 'Theater producers, venue programmers, festival directors, and co-production houses. Whether you want to license a show from another country or sell your own production internationally — HahaHub is your direct route.' },
      { q: 'What is The Laff Exchange?', a: 'The Laff Exchange is our name for the HahaHub catalog — a producer-to-producer The Laff Exchange where comedy theatre rights are bought and sold directly, without agents or middlemen.' },
      { q: 'Do I need to register to browse?', a: 'You can see the catalog in preview mode as a guest, but full dossiers, contact info, and uploads require a Pro membership.' },
      { q: 'What is the Founding Producer offer?', a: 'The first 30 producers join free forever. No annual fee, ever. In return, upload at least one show with full data and give us feedback to help shape The Laff Exchange.' },
    ]
  },
  {
    category: 'Licensing & Rights',
    icon: 'gavel',
    color: 'brand-pink',
    items: [
      { q: 'How does licensing work?', a: 'You find a show, click "Tickle It", and contact the rights holder directly. HahaHub provides the discovery tools and contract templates — the deal is between you and the producer. No commission.' },
      { q: 'Is HahaHub a rights agency?', a: 'No. We are a producer-to-producer The Laff Exchange. We do not represent any shows, take commissions, or act as an intermediary in licensing deals.' },
      { q: 'What rights are available?', a: 'Each show specifies its own rights package — exclusive or non-exclusive, territory-by-territory, royalty-based or flat fee. All terms are set by the originating producer.' },
      { q: 'Are contract templates included?', a: 'Yes. Pro members get access to a library of contract templates covering performance rights, touring rights, translation rights, and co-production agreements. These are provided for reference and do not constitute legal advice.' },
      { q: 'What is the Transparency Score?', a: 'Every show is rated 0–100 based on the completeness of its commercial data — cast size, rights terms, budget range, royalty range, and more. Higher score = more ready to license.' },
    ]
  },
  {
    category: 'Payments & Subscriptions',
    icon: 'credit_card',
    color: 'brand-cyan',
    items: [
      { q: 'What payment methods do you accept?', a: 'We currently accept PayPal. Stripe integration is coming soon. All prices are in EUR.' },
      { q: 'Can I cancel or get a refund?', a: 'Subscriptions are annual and non-refundable. They do not auto-renew — you will be notified 30 days before expiry.' },
      { q: 'What is included in the Pro plan?', a: 'Full catalog access, unlimited show uploads, direct contact with rights holders, contract templates, performance analytics, The Dossier PDF download, and priority support — all for €99/year.' },
      { q: 'What is the Studio plan?', a: 'The Studio / Production House plan at €299/year adds verified badge, priority listing, multi-user access, and dedicated support. Currently in beta — contact us to reserve your spot.' },
      { q: 'Are there any per-inquiry or commission fees?', a: 'Never. HahaHub charges a flat annual membership fee only. We take no cut from any licensing deal.' },
    ]
  },
  {
    category: 'Uploading Shows',
    icon: 'upload',
    color: 'brand-yellow',
    items: [
      { q: 'Can I list my own show?', a: 'Yes. Every Pro member can upload unlimited shows with full commercial data — cast size, royalty terms, territories, script scenario in English. Your show is visible to producers worldwide.' },
      { q: 'What do I need to upload a show?', a: 'You need: show poster/image, synopsis, cast breakdown, rights terms, royalty range, and a 3-page script scenario in English. The more data you provide, the higher your Transparency Score.' },
      { q: 'What languages are supported?', a: 'The Laff Exchange is in English. Shows can be in any language — we require a 3-page script scenario in English for every listing.' },
      { q: 'Can I upload a show that is not yet produced?', a: 'Currently HahaHub focuses on shows that have been produced and have performance history. We may expand to pre-production in the future.' },
    ]
  },
  {
    category: 'Platform & Technical',
    icon: 'settings',
    color: 'brand-pink',
    items: [
      { q: 'What is STEFUNNY?', a: 'STEFUNNY — Tickle Finder is our smart search. Type anything — genre, country, cast size, humor type, keywords — and STEFUNNY finds matching shows across the full catalog.' },
      { q: 'What is The Dossier?', a: 'The Dossier is a downloadable press kit for each show — a branded HTML/PDF document with full production specs, rights terms, transparency score, and contact info. Available to Pro members.' },
      { q: 'Is my data safe?', a: 'Yes. HahaHub is built on Supabase with row-level security. Your uploaded show data and contact information are never shared with third parties.' },
      { q: 'How do I contact support?', a: 'Email us at info@hahahub.art. Pro members get priority response within 1 business day.' },
    ]
  },
];

const FAQPage: React.FC<FAQPageProps> = ({ onNavigate, onLogout, user }) => {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = searchQuery.trim()
    ? FAQ_CATEGORIES.map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
          item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(cat => cat.items.length > 0)
    : FAQ_CATEGORIES;

  return (
    <div className="flex flex-col min-h-screen bg-brand-black">
      <Navigation activePage="landing" onNavigate={onNavigate} onLogout={onLogout} user={user} />

      <main className="pt-32 pb-20 px-4 md:px-12">
        <div className="max-w-4xl mx-auto space-y-16">

          {/* HEADER */}
          <section className="space-y-6">
            <span className="bg-brand-pink text-white px-4 py-1 text-xs font-black uppercase tracking-[0.4em] italic inline-block">FAQ</span>
            <h1 className="font-display text-white text-6xl md:text-[100px] uppercase italic leading-[0.85] tracking-tighter">
              Every<br/><span className="text-brand-yellow">Answer.</span>
            </h1>
            <p className="text-white/40 font-bold italic text-lg">Everything you need to know about The Laff Exchange.</p>

            {/* SEARCH */}
            <div className="flex items-center gap-4 bg-brand-surface border-4 border-white/20 p-4 mt-6 focus-within:border-brand-yellow transition-colors">
              <span className="material-symbols-outlined text-white/40 text-2xl">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search questions..."
                className="flex-1 bg-transparent border-none text-white font-bold italic outline-none placeholder:text-white/20"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-white/40 hover:text-brand-pink transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}
            </div>
          </section>

          {/* FAQ CATEGORIES */}
          {filtered.map((cat, ci) => (
            <section key={ci} className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <span className={`material-symbols-outlined text-${cat.color} text-2xl`}>{cat.icon}</span>
                <h2 className={`text-2xl font-black uppercase italic text-${cat.color}`}>{cat.category}</h2>
              </div>
              <div className="space-y-3">
                {cat.items.map((item, ii) => {
                  const key = `${ci}-${ii}`;
                  const isOpen = openItem === key;
                  return (
                    <div key={ii} className={`border-4 transition-all ${isOpen ? `border-${cat.color}` : 'border-white/20'}`}>
                      <button
                        onClick={() => setOpenItem(isOpen ? null : key)}
                        className="w-full flex items-center justify-between p-5 text-left gap-4"
                      >
                        <span className="font-black uppercase italic text-white text-sm md:text-base">{item.q}</span>
                        <span className={`material-symbols-outlined text-2xl flex-shrink-0 transition-transform ${isOpen ? `text-${cat.color} rotate-45` : 'text-white/40'}`}>add</span>
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 border-t-2 border-white/10 pt-4">
                          <p className="text-white/60 font-bold italic leading-relaxed text-sm">{item.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          {/* STILL HAVE QUESTIONS */}
          <section className="border-8 border-brand-yellow p-8 md:p-12 text-center shadow-neo-yellow">
            <h2 className="text-3xl md:text-5xl font-black uppercase italic text-white mb-4">Still Have<br/><span className="text-brand-yellow">Questions?</span></h2>
            <p className="text-white/40 font-bold italic mb-8">We're a small team of producers. We actually reply.</p>
            <a
              href="mailto:info@hahahub.art"
              className="inline-block bg-brand-yellow text-black px-10 py-4 font-black uppercase text-sm border-4 border-black shadow-neo-magenta hover:bg-white transition-all italic"
            >
              Email Us →
            </a>
            <p className="text-white/20 text-xs font-bold italic mt-4">Break a Laffing Leg. 🦵</p>
          </section>

        </div>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default FAQPage;
