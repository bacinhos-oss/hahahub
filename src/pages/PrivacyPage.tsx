import React from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { OPERATOR, OPERATOR_ADDRESS } from '../lib/operator';
import { openCookieSettings } from '../components/CookieBanner';
import { Page, User } from '../types';

interface PrivacyPageProps {
  onNavigate: (page: Page) => void;
  onLogout?: () => void;
  user?: User;
}


const li = (items: React.ReactNode[]) => (
  <ul className="space-y-2 border-l-4 border-brand-pink pl-5">{items.map((t, i) => <li key={i}>{t}</li>)}</ul>
);
const mail = (m: string) => <a href={`mailto:${m}`} className="text-brand-yellow">{m}</a>;

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  { title: '1. Who we are', body: <>
    <p>HahaHub (hahahub.art) is operated by <span className="text-white">{OPERATOR.name}</span>, {OPERATOR_ADDRESS}, European Union. We are the controller of your personal data. Write to us at {mail(OPERATOR.email)}.</p>
  </> },
  { title: '2. What data we collect', body: <>
    {li([
      <><span className="text-white">Account:</span> your email address, your name or company name, and your password (stored only in encrypted form by our login provider; we never see it).</>,
      <><span className="text-white">Profile:</span> what you add yourself, such as a profile photo, a short bio and your city, and the title we give you (Member, Verified, Special, Founding).</>,
      <><span className="text-white">Shows you list:</span> production details, poster, photos, script excerpt, creative team, track record, rights and licensing terms.</>,
      <><span className="text-white">Activity:</span> tickles you send and receive (including the message and contact details you enter), deals in your Pipeline, LaffWire posts and likes, and feedback you send us.</>,
      <><span className="text-white">Usage:</span> how often shows are viewed, and, if you allow it, how the site is used (Google Analytics, see section 5).</>,
      <><span className="text-white">Technical:</span> IP address and browser data in our hosting provider's server logs, kept for security.</>,
    ])}
  </> },
  { title: '3. Why we use it', body: <>
    {li([
      <><span className="text-white">To run your membership and the platform</span> (performance of our agreement with you): your account, the catalog, tickles, Pipeline, LaffWire and emails about your account and your tickles.</>,
      <><span className="text-white">To keep HahaHub safe and make it better</span> (our legitimate interest): reviewing new members, preventing misuse, security logs and view counts.</>,
      <><span className="text-white">Analytics with cookies</span> (your consent): only if you click "Accept all".</>,
      <><span className="text-white">Legal duties</span> (legal obligation): when the law requires us to keep or hand over data.</>,
    ])}
    <p>We do not sell your data, do not use it for advertising and do not make automated decisions about you.</p>
  </> },
  { title: '4. Who sees your data', body: <>
    {li([
      <><span className="text-white">Other members and visitors</span> see what you publish: your show listings, your profile and your LaffWire posts. Script excerpts, creative teams and track records are shown only to Verified Producers.</>,
      <><span className="text-white">The producer you tickle</span> receives your message and the contact details you enter, so they can reply to you.</>,
      <><span className="text-white">Our service providers</span>, who process data only on our behalf: Supabase (database, login and file storage), Vercel (hosting), Resend (sending emails) and Google (Analytics, and the web fonts the site loads from Google's servers).</>,
    ])}
    <p>Some of these providers are based in the United States. Transfers outside the EU are protected by the EU Standard Contractual Clauses or the EU-US Data Privacy Framework.</p>
  </> },
  { title: '5. Cookies and analytics', body: <>
    {li([
      <><span className="text-white">Essential:</span> your login session and your cookie choice, stored in your browser. The site does not work without them.</>,
      <><span className="text-white">Analytics:</span> Google Analytics sets its cookies only after you click "Accept all". Until then it may receive anonymous signals without cookies (Google Consent Mode). IP addresses are anonymised, and Google signals and ad personalisation are switched off.</>,
    ])}
    <p>You can change your choice at any time: <button onClick={openCookieSettings} className="text-brand-yellow underline">Cookie settings</button>.</p>
  </> },
  { title: '6. How long we keep it', body: <>
    <p>We keep your data while your account is active. When you delete your account (My Hub, Profile, Delete account) or ask us to, we delete your profile, your listings and your posts. Copies in backups disappear in the normal backup cycle. We keep data longer only where the law requires it. Analytics data is kept according to the Google Analytics retention setting, at most 14 months.</p>
  </> },
  { title: '7. Your rights', body: <>
    <p>Under the GDPR you have the right to:</p>
    {li([
      'access your personal data and get a copy of it',
      'have it corrected or deleted',
      'restrict or object to its use',
      'take it with you (data portability)',
      'withdraw your consent at any time',
    ])}
    <p>Write to {mail(OPERATOR.email)} and we will answer within one month. You can also complain to the Slovenian data protection authority: Informacijski pooblaščenec, Dunajska cesta 22, 1000 Ljubljana, Slovenia, <a href="https://www.ip-rs.si" target="_blank" rel="noopener noreferrer" className="text-brand-yellow">www.ip-rs.si</a>.</p>
  </> },
  { title: '8. Age', body: <p>HahaHub is a professional platform for people aged 18 and over.</p> },
  { title: '9. Changes', body: <p>If we change this policy, we will update the date at the top and tell members about important changes by email.</p> },
  { title: '10. Contact', body: <p>{OPERATOR.name}, {OPERATOR_ADDRESS}. Email {mail(OPERATOR.email)}.</p> },
];

const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigate, onLogout, user }) => {
  return (
    <div className="min-h-screen bg-brand-black flex flex-col">
      <Navigation activePage="privacy" onNavigate={onNavigate} onLogout={onLogout} user={user} />

      <main className="flex-1 pt-40 pb-20 px-6 md:px-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-16">

          <section className="space-y-6">
            <span className="bg-spectrum-purple text-white px-4 py-1 text-xs font-black uppercase tracking-[0.4em] rotate-[-2deg] inline-block italic">Legal</span>
            <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white leading-none">
              PRIVACY<br /><span className="text-spectrumLight-purple">POLICY.</span>
            </h1>
            <p className="text-white/40 font-bold italic">Last updated: November 2026</p>
          </section>

          <div className="space-y-12 text-white/70 font-bold italic leading-relaxed">
            {SECTIONS.map(sec => (
              <section key={sec.title} className="space-y-4">
                <h2 className="text-2xl font-black uppercase text-white">{sec.title}</h2>
                {sec.body}
              </section>
            ))}
          </div>

          <section className="py-10 text-center border-t-4 border-white/10">
            <button
              onClick={() => onNavigate('landing')}
              className="bg-white text-black px-12 py-5 font-black uppercase text-lg border-2 border-white  italic hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all"
            >
              Back to Home
            </button>
          </section>
        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default PrivacyPage;
