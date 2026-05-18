const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

const supabase = createClient(
  'https://jnilgukmyfukazwduuig.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY  // service role — ne anon! Za pisanje iz serverja.
);

// Plan mapping: Stripe metadata planName → Supabase user_type
const PLAN_MAP = {
  'LAFF Annual': { user_type: 'laff', months: 12 },
  'ROAR Annual': { user_type: 'roar', months: 12 },
  // Legacy nazivi iz create-payment-intent.js (če so še v uporabi)
  'Annual Pass': { user_type: 'laff', months: 12 },
  'Quarterly Pass': { user_type: 'laff', months: 3 },
};

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    // Stripe zahteva raw body za signature verification
    const rawBody = req.body instanceof Buffer ? req.body : Buffer.from(JSON.stringify(req.body));
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  console.log('Stripe webhook event:', event.type);

  switch (event.type) {

    // ✅ Plačilo uspešno
    case 'payment_intent.succeeded': {
      const pi = event.data.object;
      const email = pi.receipt_email;
      const planName = pi.metadata?.planName;

      if (!email || !planName) {
        console.warn('Missing email or planName in payment_intent metadata');
        break;
      }

      const plan = PLAN_MAP[planName];
      if (!plan) {
        console.warn('Unknown planName:', planName);
        break;
      }

      const expiry = addMonths(new Date(), plan.months);

      // Poiščemo user po emailu
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (profileErr || !profile) {
        console.error('Profile not found for email:', email, profileErr);
        break;
      }

      const { error: updateErr } = await supabase
        .from('profiles')
        .update({
          is_paid: true,
          user_type: plan.user_type,
          subscription_expiry: expiry,
        })
        .eq('id', profile.id);

      if (updateErr) {
        console.error('Failed to update profile after payment:', updateErr);
      } else {
        console.log(`✅ ${email} upgraded to ${plan.user_type} until ${expiry}`);
      }
      break;
    }

    // ❌ Plačilo neuspešno (npr. kartica zavrnjena)
    case 'payment_intent.payment_failed': {
      const pi = event.data.object;
      const email = pi.receipt_email;
      console.warn(`Payment failed for ${email}:`, pi.last_payment_error?.message);
      // Tukaj bi lahko poslal email prek Resend — po potrebi dodaj
      break;
    }

    // 🔄 Subscription cancelled ali expired (če kdaj preideš na Stripe Billing)
    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      const customerId = sub.customer;

      // Fetchamo customer email iz Stripe
      try {
        const customer = await stripe.customers.retrieve(customerId);
        const email = customer.email;

        if (email) {
          await supabase
            .from('profiles')
            .update({ is_paid: false, user_type: 'gigl' })
            .eq('email', email);

          console.log(`🔴 Subscription cancelled for ${email} — downgraded to GIGL`);
        }
      } catch (err) {
        console.error('Error handling subscription.deleted:', err);
      }
      break;
    }

    default:
      console.log('Unhandled event type:', event.type);
  }

  return res.status(200).json({ received: true });
};
