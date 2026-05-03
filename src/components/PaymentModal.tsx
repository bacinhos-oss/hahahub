import React, { useState, useEffect, useRef } from 'react';

const PAYPAL_CLIENT_ID = 'AWTdSJP21yPSFId7J2fucaypo0J5G1EEb93kwYuptegD_LY2g7G8lxC0ioNL4AeZhBEuEuFODiIbGQIX';

interface PaymentModalProps {
  planName: string;
  price: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PLAN_AMOUNTS: Record<string, string> = {
  'Quarterly Pass': '59.00',
  'Annual Pass': '99.00',
};

const PaymentModal: React.FC<PaymentModalProps> = ({ planName, price, isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<'confirm' | 'paying' | 'success' | 'error'>('confirm');
  const [errorMsg, setErrorMsg] = useState('');
  const paypalRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (!isOpen) { setStep('confirm'); setErrorMsg(''); }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || step !== 'paying') return;
    if (scriptLoaded.current) { renderButtons(); return; }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=EUR`;
    script.onload = () => { scriptLoaded.current = true; renderButtons(); };
    script.onerror = () => setErrorMsg('Failed to load PayPal. Check your connection.');
    document.body.appendChild(script);
  }, [isOpen, step]);

  const renderButtons = () => {
    if (!paypalRef.current || !(window as any).paypal) return;
    paypalRef.current.innerHTML = '';
    const amount = PLAN_AMOUNTS[planName] || '99.00';

    (window as any).paypal.Buttons({
      style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' },
      createOrder: (_data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{ amount: { value: amount, currency_code: 'EUR' }, description: `HAHAHUB ${planName}` }]
        });
      },
      onApprove: async (_data: any, actions: any) => {
        await actions.order.capture();
        setStep('success');
        setTimeout(() => onSuccess(), 2000);
      },
      onError: (err: any) => {
        console.error('PayPal error:', err);
        setErrorMsg('Payment failed. Please try again.');
        setStep('confirm');
      },
      onCancel: () => { setStep('confirm'); }
    }).render(paypalRef.current);
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
            {errorMsg && (
              <div className="bg-brand-pink text-white p-4 font-black uppercase text-xs italic tracking-wider mb-6">{errorMsg}</div>
            )}
            <p className="text-sm font-medium mb-8 leading-relaxed">
              Unlock the global comedy grid. Your premium credentials will be active as soon as the signal is confirmed.
            </p>
            <button
              onClick={() => setStep('paying')}
              className="w-full bg-[#ffc439] hover:bg-[#f4bb33] text-black font-black py-5 uppercase text-lg border-4 border-black shadow-[4px_4px_0px_black] transition-all flex items-center justify-center gap-3"
            >
              Pay with PayPal
            </button>
          </div>
        )}

        {step === 'paying' && (
          <div className="text-black">
            <h2 className="text-2xl font-black uppercase italic mb-2">Complete Payment</h2>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-8">{planName} — {price}</p>
            <div ref={paypalRef} className="min-h-[150px]">
              <div className="flex items-center justify-center py-10">
                <div className="w-10 h-10 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
            <button onClick={() => setStep('confirm')} className="mt-4 text-xs text-gray-400 hover:text-black font-black uppercase tracking-widest transition-colors">
              ← Back
            </button>
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
