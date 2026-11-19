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
      { q: 'Who is HahaHub for?', a: 'Independent and private theatres, production companies, producers, venue programmers and festival directors who work with comedy. Whether you want to license a show from another country or bring your own production abroad, HahaHub is your direct route.' },
      { q: 'What is The Laff Exchange?', a: 'The Laff Exchange is our name for how HahaHub works: producers showcase their comedies, discover new titles and license rights to each other directly, without agents or middlemen.' },
      { q: 'Do I need to register to browse?', a: 'You can see the catalog as a guest. To open full dossiers, send a tickle, post on LaffWire or list a show, you need a free membership.' },
      { q: 'Is HahaHub free?', a: 'Yes. Membership is free and needs no credit card. HahaHub takes no commission on your deals. If paid tools are introduced later, we will tell you in advance. Founding members keep free access for life.' },
    ]
  },
  {
    category: 'Membership',
    icon: 'workspace_premium',
    color: 'brand-cyan',
    items: [
      { q: 'What is a Verified Producer?', a: 'A member who has listed at least one show. It happens automatically when you publish your first show, and you get an email. Verified Producers can read script excerpts, see creative teams and where shows have played, and use the full Studio in My Hub.' },
      { q: 'What do the titles and colours mean?', a: 'Every member has a title, shown as a coloured smile and a ring around the profile photo. Grey is Member, green is Verified Producer, pink is Special Member (very important to the HahaHub community) and gold is Founding (built HahaHub with us from day one).' },
      { q: 'What is the difference between The Script and Full Punch?', a: 'With The Script you get the script and the right to perform it, and you make your own production: your own director, set, music and costumes. With Full Punch you also get the know-how of the original production, such as the director\'s book, music, set plans and costumes, so you can restage the show the way it plays at home.' },
      { q: 'Can I edit or delete my LaffWire posts?', a: 'Yes. Under your own post you will find Edit and Delete.' },
    ]
  },
  {
    category: 'Licensing & Rights',
    icon: 'gavel',
    color: 'brand-pink',
    items: [
      { q: 'How does licensing work?', a: 'You find a show, choose a package and click "Tickle It". The rights holder gets your message and replies to you directly. HahaHub gives you the tools: the catalog, Pipeline and contract templates in Documents. The licence is signed between you and the producer, with no commission.' },
      { q: 'Is HahaHub a rights agency?', a: 'No. HahaHub is a producer-to-producer network. We do not represent any shows, take commissions or act as an intermediary in licensing deals.' },
      { q: 'What rights are available?', a: 'Each show sets its own terms: deal type (licence, option or co-production), exclusivity, territories, royalty and advance. All terms are set by the producer who owns the rights.' },
      { q: 'Are contract templates included?', a: 'Yes. Members get access to a library of contract templates covering performance rights, touring rights, translation rights, and co-production agreements. These are provided for reference and do not constitute legal advice.' },
    ]
  },
  {
    category: 'Uploading Shows',
    icon: 'upload',
    color: 'brand-yellow',
    items: [
      { q: 'Can I list my own show?', a: 'Yes. Every member can list shows. Your first show makes you a Verified Producer automatically, and the show is visible to producers worldwide.' },
      { q: 'What do I need to upload a show?', a: 'To publish you need only the essentials: English title, playwright, original language, country, genre, synopsis in English, cast size, running time, copyright holder, a licensing package and a poster. About 5 minutes. Everything else (creative team, script excerpt, staging, track record) is optional and can be added later in My Hub, but it helps producers abroad decide faster.' },
      { q: 'What languages are supported?', a: 'HahaHub is in English, so the title and synopsis need to be in English. The show itself can be in any language. A script excerpt is optional and can be in any language, though English works best. Shows with an excerpt get a badge in the catalog.' },
      { q: 'Can I upload a show that is not yet produced?', a: 'Currently HahaHub focuses on shows that have been produced and have performance history. We may expand to pre-production in the future.' },
    ]
  },
  {
    category: 'Platform & Technical',
    icon: 'settings',
    color: 'brand-pink',
    items: [
      { q: 'What is STEFUNNY?', a: 'STEFUNNY, the Tickle Finder, is our smart search. Type anything (genre, country, cast size, type of humour, keywords) and STEFUNNY finds matching shows across the whole catalog.' },
      { q: 'What is The Dossier?', a: 'The Dossier is a downloadable PDF for each show with the synopsis, staging, rights and licensing packages. Verified Producers also see the creative team, script excerpt and track record.' },
      { q: 'Is my data safe?', a: 'Yes. Your data is stored in the EU with row-level security, and is never sold or shared with third parties. Scripts, creative teams and track records are visible only to Verified Producers.' },
      { q: 'How do I contact support?', a: 'Email us at info@hahahub.art. We usually reply within 1 business day.' },
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
      <Navigation activePage="faq" onNavigate={onNavigate} onLogout={onLogout} user={user} />

      <main className="pt-32 pb-20 px-4 md:px-12">
        <div className="max-w-4xl mx-auto space-y-16">

          {/* HEADER */}
          <section className="space-y-6">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-white/50">FAQ</p>
            <h1 className="font-display text-white text-4xl sm:text-6xl md:text-7xl leading-[0.95] tracking-tight">
              Questions <span className="text-spectrumLight-purple">&amp; answers.</span>
            </h1>
            <p className="text-white/50 font-bold italic text-lg">Everything you need to know about The Laff Exchange.</p>

            {/* SEARCH */}
            <div className="flex items-center gap-4 bg-brand-surface border border-white/10 p-4 mt-6 focus-within:border-white/40 transition-colors">
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
                    <div key={ii} className={`border transition-all ${isOpen ? `border-${cat.color}` : 'border-white/10'}`}>
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
          <section className="border border-white/10 p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-4xl font-black uppercase italic text-white mb-4">Still have questions?</h2>
            <p className="text-white/40 font-bold italic mb-8">We're a small team of producers. We actually reply.</p>
            <a
              href="mailto:info@hahahub.art"
              className="inline-block bg-white text-black px-10 py-4 font-black uppercase text-sm tracking-widest hover:bg-brand-pink hover:text-white transition-colors italic"
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
