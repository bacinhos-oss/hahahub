const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

const PLAN_AMOUNTS = {
  'LAFF Annual': 9900,
  'ROAR Annual': 18900,
  // Legacy names — kept in case anything still sends these
  'Annual Pass': 9900,
  'Quarterly Pass': 5900,
};

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { planName, email, companyName, vatNumber, country } = req.body;
  const amount = PLAN_AMOUNTS[planName];
  if (!amount) return res.status(400).json({ error: 'Invalid plan' });

  try {
    const isReverseCharge = !!vatNumber && country !== 'SI';
    const vatRate = isReverseCharge ? 0 : 0.22;
    const vatAmount = Math.round(amount * vatRate);
    const total = amount + vatAmount;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: 'eur',
      receipt_email: email || undefined,
      metadata: {
        planName,
        companyName: companyName || '',
        vatNumber: vatNumber || '',
        country: country || '',
      },
      description: `HahaHub ${planName}`,
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      total,
      vatAmount,
      isReverseCharge,
    });
  } catch (err) {
    console.error('Stripe error:', err);
    return res.status(500).json({ error: err.message });
  }
};
