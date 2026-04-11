import React from 'react';
import Navigation from '../components/Navigation';
import { Page, User } from '../types';

interface PrivacyPageProps {
  onNavigate: (page: Page) => void;
  onLogout?: () => void;
  user?: User;
}

const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigate, onLogout, user }) => {
  return (
    <div className="min-h-screen bg-brand-black flex flex-col">
      <Navigation activePage="about" onNavigate={onNavigate} onLogout={onLogout} user={user} />

      <main className="flex-1 pt-40 pb-20 px-6 md:px-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-16">

          <section className="space-y-6">
            <span className="bg-brand-pink text-white px-4 py-1 text-xs font-black uppercase tracking-[0.4em] rotate-[-2deg] inline-block italic">Legal</span>
            <h1 className="text-7xl md:text-[100px] font-black uppercase italic tracking-tighter text-brand-yellow leading-none">
              PRIVACY<br /><span className="text-white">POLICY.</span>
            </h1>
            <p className="text-white/40 font-bold italic">Last updated: April 2025</p>
          </section>

          <div className="space-y-12 text-gray-300 font-bold italic leading-relaxed border-t-4 border-white/10 pt-12">

            <section className="space-y-4">
              <h2 className="text-2xl font-black uppercase text-white">1. Who We Are</h2>
              <p>HAHAHUB (hahahub.art) is a producer-to-producer platform for international theater comedies. Contact us at <span className="text-brand-yellow">info@hahahub.art</span>.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black uppercase text-white">2. What Data We Collect</h2>
              <p>We collect the following personal data when you register or use our platform:</p>
              <ul className="list-none space-y-2 pl-4 border-l-4 border-brand-pink">
                <li>— Email address</li>
                <li>— Name or production company name</li>
                <li>— Show and production data you upload</li>
                <li>— Usage data (pages visited, features used)</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black uppercase text-white">3. How We Use Your Data</h2>
              <p>We use your data to:</p>
              <ul className="list-none space-y-2 pl-4 border-l-4 border-brand-cyan">
                <li>— Provide and improve our platform</li>
                <li>— Send you access credentials and important notifications</li>
                <li>— Process your subscription payments</li>
                <li>— Display your productions in our catalog</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black uppercase text-white">4. Data Storage</h2>
              <p>Your data is stored securely using Supabase (EU region). We do not sell your personal data to third parties.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black uppercase text-white">5. Cookies</h2>
              <p>We use only essential cookies required for authentication and platform functionality. We do not use advertising or tracking cookies.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black uppercase text-white">6. Your Rights (GDPR)</h2>
              <p>Under EU GDPR, you have the right to:</p>
              <ul className="list-none space-y-2 pl-4 border-l-4 border-brand-yellow">
                <li>— Access your personal data</li>
                <li>— Request correction or deletion of your data</li>
                <li>— Withdraw consent at any time</li>
                <li>— Data portability</li>
              </ul>
              <p>To exercise these rights, contact us at <span className="text-brand-yellow">info@hahahub.art</span>.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black uppercase text-white">7. Contact</h2>
              <p>For any privacy-related questions: <span className="text-brand-yellow">info@hahahub.art</span></p>
            </section>
          </div>

          <section className="py-10 text-center border-t-4 border-white/10">
            <button
              onClick={() => onNavigate('landing')}
              className="bg-brand-yellow text-black px-12 py-5 font-black uppercase text-lg border-4 border-white shadow-neo-magenta italic hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all"
            >
              Back to Home
            </button>
          </section>
        </div>
      </main>

      <footer className="bg-brand-black border-t-4 border-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="logo-text text-2xl uppercase opacity-50">HAHAHUB</div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">© 2025 ALL LAUGHS RESERVED</p>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPage;
