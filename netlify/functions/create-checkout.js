const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
  try {
    const body = JSON.parse(event.body);
    const { items } = body;
    if (!Array.isArray(items) || items.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No cart items provided.' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }
    let total = 0;
    let description = [];
    for (const item of items) {
      if (!item.price || isNaN(parseFloat(item.price.replace('£', '')))) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: `Cart item '${item.name || item.id}' is missing a valid price.` }),
          headers: { 'Content-Type': 'application/json' },
        };
      }
      const price = parseFloat(item.price.replace('£', ''));
      total += price * (item.qty || 1);
      description.push(`${item.qty || 1} x ${item.name || item.id}`);
    }
    const amount = Math.round(total * 100); // in pence
    if (amount < 50) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Total amount must be at least 50p.' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }
    // Debug logging
    console.log('[Stripe Checkout] Creating PaymentIntent', { amount, items, description });
    let paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'gbp',
      description: description.join(', '),
      metadata: { items: JSON.stringify(items) },
    });
    return {
      statusCode: 200,
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
      }),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (err) {
    console.error('[Stripe Checkout] Error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};
