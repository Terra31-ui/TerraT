import Stripe from "stripe";
const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);

export async function POST({ request }) {
  try {
    const body = await request.json();
    const { items } = body;
    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "No cart items provided." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    // Calculate total amount and validate items
    let total = 0;
    let description = [];
    for (const item of items) {
      if (!item.price || isNaN(parseFloat(item.price.replace("£", "")))) {
        return new Response(JSON.stringify({ error: `Cart item '${item.name || item.id}' is missing a valid price.` }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      const price = parseFloat(item.price.replace("£", ""));
      total += price * (item.qty || 1);
      description.push(`${item.qty || 1} x ${item.name || item.id}`);
    }
    const amount = Math.round(total * 100); // in pence
    if (amount < 50) {
      return new Response(JSON.stringify({ error: "Total amount must be at least 50p." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Debug logging
    console.log("[Stripe Checkout] Creating PaymentIntent", { amount, items, description });

    // Create PaymentIntent
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "gbp",
        description: description.join(", "),
        metadata: {
          items: JSON.stringify(items),
        },
        automatic_payment_methods: { enabled: true },
      });
    } catch (stripeErr) {
      console.error("[Stripe Error]", stripeErr);
      return new Response(JSON.stringify({ error: stripeErr.message, stripeError: stripeErr }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Return clientSecret and publishableKey for Payment Element
    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        publishableKey: import.meta.env.STRIPE_PUBLISHABLE_KEY,
        debug: { amount, items, description },
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[API Error]", error);
    return new Response(JSON.stringify({ error: error.message, apiError: error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}