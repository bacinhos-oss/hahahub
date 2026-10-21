import React from 'react';
import { Page } from '../types';
import { Logo } from './Logo';
import { SpectrumBar } from './SpectrumBar';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-brand-black mt-auto">
      <SpectrumBar height={8} />
      <div className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            {/* Brand */}
            <div className="space-y-4">
              <Logo height={40} />
              <p className="text-[11px] font-bold italic text-white/40 leading-relaxed">
                The global producer-to-producer comedy rights exchange. No agents. No middlemen.
              </p>
            </div>

            {/* Platform */}
            <div className="space-y-4">
              <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 italic">
                <span className="inline-block w-2.5 h-2.5 bg-spectrum-pink" />
                Platform
              </h4>
              <div className="flex flex-col gap-3">
                <button onClick={() => onNavigate('discovery')} className="text-left text-xs font-bold italic text-white/60 hover:text-spectrumLight-pink transition-colors">The Laff Exchange</button>
                <button onClick={() => onNavigate('about')} className="text-left text-xs font-bold italic text-white/60 hover:text-spectrumLight-pink transition-colors">Mission</button>
                <button onClick={() => onNavigate('pricing')} className="text-left text-xs font-bold italic text-white/60 hover:text-spectrumLight-pink transition-colors">Pricing</button>
                <button onClick={() => onNavigate('faq')} className="text-left text-xs font-bold italic text-white/60 hover:text-spectrumLight-pink transition-colors">FAQ</button>
                <button onClick={() => onNavigate('subscription')} className="text-left text-xs font-bold italic text-white/60 hover:text-spectrumLight-pink transition-colors">My Hub</button>
                <button onClick={() => onNavigate('login')} className="text-left text-xs font-bold italic text-white/60 hover:text-spectrumLight-pink transition-colors">Sign In</button>
              </div>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 italic">
                <span className="inline-block w-2.5 h-2.5 bg-spectrum-orange" />
                Legal
              </h4>
              <div className="flex flex-col gap-3">
                <button onClick={() => onNavigate('privacy')} className="text-left text-xs font-bold italic text-white/60 hover:text-spectrumLight-orange transition-colors">Privacy Policy</button>
                <button onClick={() => onNavigate('terms')} className="text-left text-xs font-bold italic text-white/60 hover:text-spectrumLight-orange transition-colors">Terms of Service</button>
                <button onClick={() => onNavigate('privacy')} className="text-left text-xs font-bold italic text-white/60 hover:text-spectrumLight-orange transition-colors">Cookie Policy</button>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 italic">
                <span className="inline-block w-2.5 h-2.5 bg-spectrum-teal" />
                Contact
              </h4>
              <div className="flex flex-col gap-3">
                <a href="mailto:info@hahahub.art" className="text-xs font-bold italic text-brand-cyan hover:text-white transition-colors">info@hahahub.art</a>
                <a href="mailto:legal@hahahub.art" className="text-xs font-bold italic text-white/60 hover:text-spectrumLight-teal transition-colors">legal@hahahub.art</a>
                <p className="text-[10px] font-bold italic text-white/30">Ljubljana, Slovenia</p>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">© 2026 HAHAHUB. All laughs reserved.</p>
            <p className="text-[10px] font-bold italic text-white/20">Built for theater comedy producers worldwide.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
