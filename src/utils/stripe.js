export async function redirectToCheckout(mentorId, parentEmail) {
  try {
    const response = await fetch(
      "https://yfvdjpxahsovlncayqhg.supabase.co/functions/v1/create-checkout-session",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorId, parentEmail }),
      }
    );

    const data = await response.json();

    if (data.url) {
      window.location.href = data.url; // go to Stripe
    } else {
      alert("Unable to start checkout. Please try again.");
      console.error("Stripe response error:", data);
    }
  } catch (error) {
    console.error("❌ Payment error:", error);
    alert("Something went wrong while starting checkout. Please try again.");
  }
}