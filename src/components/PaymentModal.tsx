import React, { useState, useEffect, useRef } from 'react';

// STRIPE PUBLIC KEY — zamenjaj z živim ključem pred launchom
const STRIPE_PUBLIC_KEY = 'pk_test_51TU05V2eTQB4erlR7UWNCCI5lcntrAaPbCcY53jIrMqdCGilLM8cJDTBgIlAh80Oo63nrwrtbDlcN7jJRMtG5Kij00dAFaxx94';

interface PaymentModalProps {
  planName: string;
  price: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userEmail?: string;
  userName?: string;
}

const PLAN_AMOUNTS: Record<string, number> = {
  'Annual Pass': 9900,      // v centih = €99.00
  'Quarterly Pass': 5900,   // v centih = €59.00
};

const PaymentModal: React.FC<PaymentModalProps> = ({ planName, price, isOpen, onClose, onSuccess, userEmail, userName }) => {
  const [step, setStep] = useState<'confirm' | 'paying' | 'success'>('confirm');
  const [errorMsg, setErrorMsg] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const stripeRef = useRef<any>(null);
  const elementsRef = useRef<any>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setStep('confirm');
      setErrorMsg('');
      setIsProcessing(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || step !== 'paying') return;
    loadStripe();
  }, [isOpen, step]);

  const loadStripe = async () => {
    if (stripeRef.current) { mountCard(); return; }
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.onload = () => {
      stripeRef.current = (window as any).Stripe(STRIPE_PUBLIC_KEY);
      mountCard();
    };
    script.onerror = () => setErrorMsg('Missed the punch. Check your connection and try again.');
    document.body.appendChild(script);
  };

  const mountCard = () => {
    if (!cardRef.current || !stripeRef.current) return;
    elementsRef.current = stripeRef.current.elements();
    const card = elementsRef.current.create('card', {
      style: {
        base: {
          color: '#000',
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: '700',
          fontSize: '16px',
          '::placeholder': { color: '#999' },
        },
        invalid: { color: '#FF0266' },
      },
      hidePostalCode: true,
    });
    cardRef.current.innerHTML = '';
    card.mount(cardRef.current);
  };

  const handlePay = async () => {
    if (!stripeRef.current || !elementsRef.current) return;
    setIsProcessing(true);
    setErrorMsg('');
    try {
      // 1. Create PaymentIntent via backend
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planName,
          email: userEmail,
          companyName,
          vatNumber,
          country,
        }),
      });
      const { clientSecret, error: backendError } = await response.json();
      if (backendError) {
        setErrorMsg(backendError);
        setIsProcessing(false);
        return;
      }

      // 2. Confirm payment with Stripe
      const card = elementsRef.current.getElement('card');
      const { error, paymentIntent } = await stripeRef.current.confirmCardPayment(clientSecret, {
        payment_method: {
          card,
          billing_details: {
            name: companyName || userName || '',
            email: userEmail || '',
          },
        },
      });

      if (error) {
        setErrorMsg(error.message || 'Missed the punch. Try again.');
        setIsProcessing(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        setStep('success');
        generateInvoice();
        setTimeout(() => onSuccess(), 2500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Missed the punch. Try again.');
      setIsProcessing(false);
    }
  };

  const generateInvoice = () => {
    const invoiceNum = 'HH-' + Date.now().toString().slice(-6);
    const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const amount = PLAN_AMOUNTS[planName] / 100;
    const vatRate = country === 'SI' ? 0.22 : vatNumber ? 0 : 0.22;
    const vatAmount = amount * vatRate;
    const total = amount + vatAmount;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>HahaHub Invoice ${invoiceNum}</title>
  <style>
    body { font-family: 'Arial', sans-serif; max-width: 700px; margin: 40px auto; padding: 40px; color: #000; }
    .logo { font-size: 32px; font-weight: 900; letter-spacing: -2px; text-transform: uppercase; margin-bottom: 4px; }
    .slogan { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #999; margin-bottom: 40px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 4px solid #000; padding-bottom: 20px; }
    .invoice-num { font-size: 24px; font-weight: 900; }
    .date { color: #666; font-size: 12px; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 30px 0; }
    th { background: #000; color: #FFDE03; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; }
    td { padding: 12px 10px; border-bottom: 1px solid #eee; }
    .total-row td { font-weight: 900; font-size: 18px; border-top: 4px solid #000; }
    .footer { margin-top: 40px; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
    .paid { background: #000; color: #FFDE03; padding: 6px 16px; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; display: inline-block; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">HahaHub</div>
      <div class="slogan">Tickle. Set Up. Punch.</div>
      <div style="font-size:12px; color:#666;">HahaHub d.o.o.<br>Ljubljana, Slovenia<br>info@hahahub.art</div>
    </div>
    <div style="text-align:right;">
      <div class="invoice-num">INVOICE<br>${invoiceNum}</div>
      <div class="date">${date}</div>
      <div style="margin-top:12px;"><span class="paid">✓ PAID</span></div>
    </div>
  </div>

  <div style="margin-bottom:30px;">
    <div style="font-size:11px; color:#999; text-transform:uppercase; letter-spacing:2px; margin-bottom:6px;">Bill To</div>
    <div style="font-weight:700;">${companyName || userName || userEmail || '—'}</div>
    ${vatNumber ? `<div style="font-size:12px; color:#666;">VAT: ${vatNumber}</div>` : ''}
    <div style="font-size:12px; color:#666;">${userEmail || ''}</div>
  </div>

  <table>
    <tr><th>Description</th><th>Amount</th></tr>
    <tr><td>HahaHub ${planName}<br><span style="font-size:11px;color:#999;">Annual subscription — Comedy Rights Marketplace</span></td><td>€${amount.toFixed(2)}</td></tr>
    <tr><td>VAT ${vatNumber ? '0% (Reverse charge)' : `${(vatRate * 100).toFixed(0)}%`}</td><td>€${vatAmount.toFixed(2)}</td></tr>
    <tr class="total-row"><td>TOTAL DUE</td><td>€${total.toFixed(2)}</td></tr>
  </table>

  ${vatNumber ? '<p style="font-size:11px;color:#999;">Reverse charge: VAT to be accounted for by the recipient.</p>' : ''}

  <div class="footer">
    <p>HahaHub d.o.o. | Ljubljana, Slovenia | legal@hahahub.art</p>
    <p>This invoice was generated automatically. Break a Leg. 🎭</p>
  </div>
</body>
</html>`;

    // Auto-download as HTML (print-to-PDF)
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HahaHub-Invoice-${invoiceNum}.html`;
    a.click();
    URL.revokeObjectURL(url);

    // Save to localStorage for My Hub archive
    const invoices = JSON.parse(localStorage.getItem('hahahub_invoices') || '[]');
    invoices.unshift({ id: invoiceNum, date, plan: planName, amount: total.toFixed(2), html });
    localStorage.setItem('hahahub_invoices', JSON.stringify(invoices.slice(0, 20)));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-6">
      <div className="absolute inset-0 bg-brand-black/90 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white border-8 border-black w-full max-w-lg p-6 md:p-10 shadow-neo-magenta animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-black hover:text-brand-pink transition-colors">
          <span className="material-symbols-outlined font-black">close</span>
        </button>

        {step === 'confirm' && (
          <div className="text-black space-y-6">
            <div>
              <h2 className="text-2xl font-black uppercase italic mb-1">Set It Up. 🥊</h2>
              <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Secure checkout</p>
            </div>

            {/* Plan summary */}
            <div className="bg-gray-100 p-5 border-4 border-black">
              <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Selected Plan</p>
              <h3 className="text-xl font-black uppercase">{planName}</h3>
              <div className="flex justify-between items-end border-t-2 border-black/10 pt-3 mt-3">
                <span className="text-sm font-bold uppercase">Total</span>
                <span className="text-3xl font-black">{price}</span>
              </div>
            </div>

            {/* Billing info */}
            <div className="space-y-3">
              <p className="text-xs font-black uppercase tracking-widest text-gray-500">Billing Info (for invoice)</p>
              <input
                type="text"
                placeholder="Company / Producer Name"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full bg-gray-100 border-2 border-black px-4 py-3 font-bold text-sm outline-none focus:border-brand-cyan"
              />
              <input
                type="text"
                placeholder="VAT Number (optional — EU B2B)"
                value={vatNumber}
                onChange={e => setVatNumber(e.target.value)}
                className="w-full bg-gray-100 border-2 border-black px-4 py-3 font-bold text-sm outline-none focus:border-brand-cyan"
              />
              <select
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="w-full bg-gray-100 border-2 border-black px-4 py-3 font-bold text-sm outline-none"
              >
                <option value="">Select Country</option>
                <option value="SI">Slovenia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="ES">Spain</option>
                <option value="IT">Italy</option>
                <option value="HR">Croatia</option>
                <option value="AT">Austria</option>
                <option value="PL">Poland</option>
                <option value="NL">Netherlands</option>
                <option value="BE">Belgium</option>
                <option value="GB">United Kingdom</option>
                <option value="US">United States</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {vatNumber && (
              <div className="bg-brand-cyan/10 border-2 border-brand-cyan p-3">
                <p className="text-xs font-black uppercase text-brand-cyan">✓ EU B2B — Reverse charge applies. 0% VAT.</p>
              </div>
            )}

            <button
              onClick={() => setStep('paying')}
              className="w-full bg-black text-brand-yellow font-black py-5 uppercase text-lg border-4 border-black shadow-neo-cyan hover:bg-brand-pink hover:text-white transition-all italic"
            >
              Continue to Payment →
            </button>
          </div>
        )}

        {step === 'paying' && (
          <div className="text-black space-y-6">
            <div>
              <h2 className="text-2xl font-black uppercase italic mb-1">Punch It. 🥊</h2>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{planName} — {price}</p>
            </div>

            {/* Stripe card element */}
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Card Details</p>
              <div ref={cardRef} className="bg-gray-100 border-4 border-black px-4 py-5 min-h-[50px]">
                <div className="flex items-center justify-center py-2">
                  <div className="w-6 h-6 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="bg-brand-pink text-white p-4 font-black uppercase text-xs italic">{errorMsg}</div>
            )}

            <div className="flex items-center gap-2 text-gray-400">
              <span className="material-symbols-outlined text-base">lock</span>
              <p className="text-[10px] font-bold uppercase tracking-widest">Secured by Stripe. HahaHub never sees your card.</p>
            </div>

            <button
              onClick={handlePay}
              disabled={isProcessing}
              className="w-full bg-black text-brand-yellow font-black py-5 uppercase text-lg border-4 border-black shadow-neo-cyan hover:bg-brand-pink hover:text-white transition-all italic disabled:opacity-50"
            >
              {isProcessing ? 'Setting it up...' : `Pay ${price} →`}
            </button>
            <button onClick={() => setStep('confirm')} className="w-full text-center text-gray-400 text-xs font-black uppercase tracking-widest hover:text-black transition-colors">
              ← Back
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="text-black text-center py-8 space-y-6 animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-brand-yellow border-4 border-black mx-auto flex items-center justify-center rotate-3 shadow-[8px_8px_0px_#FF0266]">
              <span className="text-5xl">🥊</span>
            </div>
            <div>
              <h2 className="text-4xl font-black uppercase italic mb-2">Punchline Delivered!</h2>
              <p className="font-bold text-brand-pink uppercase tracking-[0.2em] text-sm">You're set up. Go hunt. 🎭</p>
            </div>
            <p className="text-sm font-medium text-gray-500">Invoice downloaded automatically. Check your downloads folder.</p>
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Break a Leg.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
