// This file is now unused. The create-checkout API is now handled by Netlify Functions for static output.
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