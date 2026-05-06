import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const PLAN_AMOUNTS: Record<string, number> = {
  'Annual Pass': 9900,
  'Quarterly Pass': 5900,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { planName, email, companyName, vatNumber, country } = req.body;

  const amount = PLAN_AMOUNTS[planName];
  if (!amount) {
    return res.status(400).json({ error: 'Invalid plan' });
  }

  try {
    // VAT logic — EU reverse charge if VAT number provided
    const isReverseCharge = !!vatNumber && country !== 'SI';
    const vatRate = isReverseCharge ? 0 : 0.22;
    const vatAmount = Math.round(amount * vatRate);
    const total = amount + vatAmount;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: 'eur',
      receipt_email: email,
      metadata: {
        planName,
        companyName: companyName || '',
        vatNumber: vatNumber || '',
        country: country || '',
        isReverseCharge: String(isReverseCharge),
      },
      description: `HahaHub ${planName} — Tickle. Set Up. Punch.`,
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      total,
      vatAmount,
      isReverseCharge,
    });
  } catch (err: any) {
    console.error('Stripe error:', err);
    return res.status(500).json({ error: err.message });
  }
}
