import { redirect } from "next/navigation";
import Link from "next/link";
import { stripeClient, activatePaidSignup } from "@/lib/billing";
import { setMemberCookie } from "@/lib/member-auth";

export const dynamic = "force-dynamic";

export default async function SignupCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  const stripe = stripeClient();
  if (!stripe || !sessionId) {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <p className="text-neutral-300 mb-4">We could not confirm that payment.</p>
          <Link href="/login" className="text-emerald-400 hover:underline">Sign in</Link>
        </div>
      </main>
    );
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.metadata?.kind !== "signup" || session.payment_status !== "paid") {
    redirect("/signup?error=stripe");
  }

  const stripeSubscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
  const pi = session.payment_intent;
  const providerPaymentId = pi ? (typeof pi === "string" ? pi : pi.id) : `checkout_${session.id}`;
  await activatePaidSignup({
    subscriptionId: session.metadata.subscriptionId,
    invoiceId: session.metadata.invoiceId,
    stripeSubscriptionId: stripeSubscriptionId ?? null,
    amountCents: session.amount_total ?? 0,
    providerPaymentId,
  });

  const memberId = session.metadata.memberId;
  if (memberId) await setMemberCookie(memberId);
  redirect("/portal?joined=1");
}
