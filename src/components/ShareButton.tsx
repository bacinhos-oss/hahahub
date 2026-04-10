
import React, { useState } from 'react';

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ title, text, url }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button 
      onClick={handleShare}
      className="group relative flex items-center gap-3 bg-brand-black text-white px-6 py-3 border-4 border-white hover:bg-brand-yellow hover:text-black transition-all shadow-neo-magenta hover:shadow-none hover:translate-x-1 hover:translate-y-1"
    >
      <span className="material-symbols-outlined text-xl">
        {copied ? 'check_circle' : 'share'}
      </span>
      <span className="text-[10px] font-black uppercase tracking-widest italic">
        {copied ? 'Link Copied!' : 'Share My Hub'}
      </span>
      
      {/* Visual Glitch Decor */}
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-brand-cyan group-hover:bg-brand-pink transition-colors"></div>
    </button>
  );
};

export default ShareButton;
