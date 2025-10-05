export async function redirectToCheckout(sessionId, mentorName, sessionDate, sessionTime) {
  try {
    const response = await fetch(
      "https://yfvdjpxahsovlncayqhg.supabase.co/functions/v1/create-checkout-session",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentorName,
          sessionDate,
          sessionTime,
        }),
      }
    );

    const data = await response.json();

    if (data.url) {
      window.location.href = data.url; // Redirect to Stripe Checkout
    } else {
      alert("Unable to start checkout. Please try again.");
      console.error("Stripe response error:", data);
    }
  } catch (err) {
    console.error("Payment error:", err);
    alert("Something went wrong while starting checkout. Please try again.");
  }
}