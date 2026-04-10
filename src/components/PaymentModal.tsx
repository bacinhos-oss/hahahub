
import React, { useState, useEffect } from 'react';

interface PaymentModalProps {
  planName: string;
  price: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ planName, price, isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<'confirm' | 'processing' | 'success'>('confirm');

  useEffect(() => {
    if (!isOpen) setStep('confirm');
  }, [isOpen]);

  const handlePay = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }, 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-brand-black/90 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white border-8 border-black w-full max-w-lg p-10 shadow-neo-magenta animate-in fade-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-4 right-4 text-black hover:text-brand-pink transition-colors">
          <span className="material-symbols-outlined font-black">close</span>
        </button>

        {step === 'confirm' && (
          <div className="text-black">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-[#0070ba] p-3 text-white rounded-lg">
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M7 21h-4l3-18h11c4.5 0 5 3 5 5s-2 6-7 6h-3l-1 7zm0-9h3c2 0 3-1 3-3s-1-3-3-3h-3l-1 6z"/></svg>
              </div>
              <h2 className="font-display text-2xl uppercase italic">PayPal Checkout</h2>
            </div>
            <div className="bg-gray-100 p-6 border-4 border-black mb-8">
              <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Selected Plan</p>
              <h3 className="text-xl font-black uppercase mb-4">{planName}</h3>
              <div className="flex justify-between items-end border-t-2 border-black/10 pt-4">
                <span className="text-sm font-bold uppercase">Total Due</span>
                <span className="text-3xl font-black">{price}</span>
              </div>
            </div>
            <p className="text-sm font-medium mb-8 leading-relaxed">
              Unlock the global comedy grid. Your premium credentials will be active as soon as the signal is confirmed.
            </p>
            <button 
              onClick={handlePay}
              className="w-full bg-[#ffc439] hover:bg-[#f4bb33] text-black font-black py-5 uppercase text-lg border-4 border-black shadow-[4px_4px_0px_black] transition-all flex items-center justify-center gap-3"
            >
              Pay with PayPal
            </button>
          </div>
        )}

        {step === 'processing' && (
          <div className="text-black text-center py-10 space-y-8">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 border-8 border-brand-yellow/20 rounded-full"></div>
              <div className="absolute inset-0 border-8 border-brand-yellow border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black uppercase leading-none">Establishing Connection</h2>
              <p className="font-bold text-gray-500 uppercase tracking-widest text-[10px] italic">Synching vault permissions with PayPal...</p>
              <div className="flex justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-2 h-2 bg-brand-cyan animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-black text-center py-10 space-y-8 animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-brand-cyan border-4 border-black mx-auto flex items-center justify-center rotate-3 shadow-[8px_8px_0px_#FF0266]">
              <span className="material-symbols-outlined text-black text-6xl font-black">check</span>
            </div>
            <div>
              <h2 className="text-4xl font-black uppercase mb-2 italic">Signal Locked!</h2>
              <p className="font-bold text-brand-pink uppercase tracking-[0.2em] text-sm">Premium Access Active</p>
            </div>
            <p className="text-sm font-medium">Provisioning your Producer Dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
