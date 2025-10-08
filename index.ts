import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.6.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-06-20" });
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

serve(async (req) => {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
  } catch (err) {
    console.error("❌ Invalid webhook signature:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const s: any = event.data.object;
    const sessionId = s.metadata?.sessionId;

    try {
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      if (sessionId) {
        const { error } = await supabase
          .from("sessions")
          .update({
            status: "paid",
            stripe_session_id: s.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", sessionId);

        if (error) console.error("❌ Supabase update failed:", error);
        else console.log("✅ Session marked as paid:", sessionId);
      } else {
        console.warn("⚠️ Missing metadata.sessionId");
      }
    } catch (e) {
      console.error("❌ Webhook handler error:", e);
    }
  }

  return new Response("ok", { status: 200 });
});
