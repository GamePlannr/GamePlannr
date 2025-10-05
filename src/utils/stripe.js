export async function redirectToCheckout(mentorName, sessionDate, sessionTime) {
  try {
    const response = await fetch(
      "https://yfvdjpxahsovlncayqhg.supabase.co/functions/v1/create-checkout-session",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mentorName,
          sessionDate,
          sessionTime,
        }),
      }
    );

    const data = await response.json();

    if (data.url) {
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } else {
      alert("Unable to start checkout. Please try again.");
      console.error("Stripe response error:", data);
    }
  } catch (err) {
    console.error("Payment error:", err);
    alert("Something went wrong while starting checkout. Please try again.");
  }
}