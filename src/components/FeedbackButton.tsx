import React, { useState } from 'react';

const FeedbackButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'bug' | 'idea' | 'other'>('bug');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'feedback',
          to: 'info@hahahub.art',
          data: { feedbackType: type, message, url: window.location.href, ts: new Date().toISOString() }
        })
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || 'Send failed'); setSending(false); return; }
      setSent(true);
      setTimeout(() => { setSent(false); setOpen(false); setMessage(''); setType('bug'); setError(''); }, 2500);
    } catch (e: any) {
      setError(e?.message || 'Network error');
    }
    setSending(false);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-brand-surface border-4 border-white/20 hover:border-brand-yellow text-white/50 hover:text-brand-yellow transition-all px-3 py-2 font-black uppercase italic text-[10px] tracking-widest flex items-center gap-2 shadow-lg"
        style={{ display: open ? 'none' : 'flex' }}
      >
        <span className="material-symbols-outlined text-sm">bug_report</span>
        Feedback
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-6">
          <div className="bg-brand-surface border-4 border-white w-full max-w-sm shadow-neo-yellow">

            {/* Header */}
            <div className="flex items-center justify-between border-b-4 border-white/10 px-5 py-4">
              <p className="font-black uppercase italic text-white text-sm tracking-widest">Beta Feedback</p>
              <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white transition-all">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4">
              {sent ? (
                <div className="py-8 text-center">
                  <p className="text-brand-cyan font-black uppercase italic text-lg">Sent! 🥊</p>
                  <p className="text-white/30 text-xs mt-1">Thanks for helping us punch it out.</p>
                </div>
              ) : (
                <>
                  {/* Type */}
                  <div className="flex gap-2">
                    {([
                      { key: 'bug', label: '🐛 Bug', color: 'border-brand-pink text-brand-pink' },
                      { key: 'idea', label: '💡 Idea', color: 'border-brand-yellow text-brand-yellow' },
                      { key: 'other', label: '💬 Other', color: 'border-brand-cyan text-brand-cyan' },
                    ] as const).map(t => (
                      <button key={t.key} onClick={() => setType(t.key)}
                        className={`flex-1 py-2 font-black uppercase italic text-[10px] border-2 transition-all ${type === t.key ? t.color + ' bg-white/5' : 'border-white/20 text-white/30 hover:border-white/40'}`}>
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Message */}
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={4}
                    placeholder={type === 'bug' ? 'What broke? Where? What did you expect?' : type === 'idea' ? 'What would make HahaHub better?' : 'Tell us anything...'}
                    className="w-full bg-brand-black border-2 border-white/20 focus:border-brand-yellow px-4 py-3 text-white text-sm font-bold outline-none resize-none placeholder:text-white/20"
                  />

                  {/* Send */}
                  <button
                    onClick={handleSend}
                    disabled={sending || !message.trim()}
                    className="w-full bg-brand-yellow text-black py-3 font-black uppercase italic text-sm border-4 border-black hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {sending ? 'Sending...' : 'Punch It Out →'}
                  </button>
                  {error && <p className="text-brand-pink text-[10px] font-black text-center">{error}</p>}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackButton;
