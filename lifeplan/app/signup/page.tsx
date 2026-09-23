import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { setMemberCookie } from "@/lib/member-auth";
import { appOrigin, createCheckoutForSubscription, ensureStarterPlan, stripeClient } from "@/lib/billing";
import { addMonths } from "@/lib/calendar";

export const dynamic = "force-dynamic";

const PLANS = [
  { slug: "sovereign-personal", label: "SOVEREIGN: Personal", price: "$25 / month" },
  { slug: "sovereign-business", label: "SOVEREIGN: Business", price: "$250 / month" },
] as const;

async function signupAction(formData: FormData) {
  "use server";
  const email = (formData.get("email") as string)?.trim().toLowerCase() ?? "";
  const password = (formData.get("password") as string) ?? "";
  const firstName = (formData.get("firstName") as string)?.trim() || null;
  const lastName = (formData.get("lastName") as string)?.trim() || null;
  const planSlug = (formData.get("plan") as string)?.trim() ?? "";

  if (!email.includes("@") || password.length < 6) {
    redirect("/signup?error=invalid");
  }
  if (planSlug !== "sovereign-personal" && planSlug !== "sovereign-business") {
    redirect("/signup?error=plan");
  }
  if (!process.env.AUTH_SECRET?.trim()) {
    redirect("/signup?error=config");
  }

  try {
  const plan = await prisma.subscriptionPlan.findUnique({ where: { slug: planSlug } });
  if (!plan) redirect("/signup?error=plan");

  const existing = await prisma.member.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true, passwordHash: true },
  });

  let memberId: string;
  if (existing) {
    if (!existing.passwordHash || !(await bcrypt.compare(password, existing.passwordHash))) {
      redirect("/signup?error=taken");
    }
    memberId = existing.id;
  } else {
    const created = await prisma.member.create({
      data: {
        email,
        passwordHash: await bcrypt.hash(password, 10),
        firstName,
        lastName,
      },
      select: { id: true },
    });
    memberId = created.id;
    await ensureStarterPlan(memberId, planSlug);
  }

  const h = await headers();
  const origin = appOrigin(h.get("x-forwarded-host") || h.get("host"), h.get("x-forwarded-proto"));

  let subscription = await prisma.subscription.findFirst({
    where: { memberId, subscriptionPlanId: plan.id, status: { in: ["pending", "active", "trial", "past_due"] } },
    orderBy: { createdAt: "desc" },
  });

  if (subscription?.status === "active" || subscription?.status === "trial") {
    await setMemberCookie(memberId);
    redirect("/portal?joined=1");
  }

  if (!stripeClient()) {
    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: {
          memberId,
          subscriptionPlanId: plan.id,
          status: "active",
          currentPeriodEnd: addMonths(new Date(), 1),
        },
      });
    } else if (subscription.status === "pending") {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: "active", currentPeriodEnd: addMonths(new Date(), 1) },
      });
    }
    await prisma.invoice.updateMany({
      where: { memberId, status: "open", payments: { none: {} } },
      data: { status: "canceled" },
    });
    await setMemberCookie(memberId);
    redirect("/portal?joined=1");
  }

  if (!subscription) {
    subscription = await prisma.subscription.create({
      data: {
        memberId,
        subscriptionPlanId: plan.id,
        status: "pending",
        currentPeriodEnd: new Date(),
      },
    });
  }

  let invoice = await prisma.invoice.findFirst({
    where: { memberId, status: "open", amountCents: plan.amountCents },
    orderBy: { createdAt: "desc" },
  });
  if (!invoice) {
    invoice = await prisma.invoice.create({
      data: {
        memberId,
        invoiceNumber: `SUB-${Date.now().toString(36).toUpperCase()}`,
        amountCents: plan.amountCents,
        dueDate: new Date(),
        status: "open",
      },
    });
  }

  let url: string | null = null;
  try {
    url = await createCheckoutForSubscription({
      memberId,
      memberEmail: email,
      subscriptionId: subscription.id,
      invoiceId: invoice.id,
      planName: plan.name,
      amountCents: plan.amountCents,
      origin,
    });
  } catch (e) {
    console.error(e);
    redirect("/signup?error=stripe");
  }
  if (!url) redirect("/signup?error=stripe");
  redirect(url);
  } catch (e) {
    const digest = typeof e === "object" && e && "digest" in e ? String((e as { digest?: unknown }).digest ?? "") : "";
    if (digest.includes("NEXT_REDIRECT")) throw e;
    console.error(e);
    redirect("/signup?error=db");
  }
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; email?: string }>;
}) {
  const { error, email } = await searchParams;
  const cardCheckout = !!stripeClient();

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg bg-neutral-900 p-6 border border-neutral-800">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-2">Sovereign Life Control Tool</p>
        <h1 className="text-xl font-semibold mb-2">Join</h1>
        <p className="text-sm text-neutral-400 mb-4">
          Create your member account. You get a life plan and today’s call list as soon as you sign in.
        </p>
        {error === "invalid" && <p className="text-amber-500 text-sm mb-3">Use a real email and a password of at least 6 characters.</p>}
        {error === "plan" && <p className="text-amber-500 text-sm mb-3">Choose Personal or Business. If this persists, run DB push and seed so the plans exist.</p>}
        {error === "taken" && <p className="text-amber-500 text-sm mb-3">That email already has an account. Sign in, or use the password that belongs to it to continue checkout.</p>}
        {error === "config" && <p className="text-amber-500 text-sm mb-3">AUTH_SECRET is not set on the server.</p>}
        {error === "stripe" && <p className="text-amber-500 text-sm mb-3">Could not start card checkout. Try again in a moment.</p>}
        {error === "db" && <p className="text-amber-500 text-sm mb-3">The database did not respond. Wait a few seconds and try again.</p>}
        {error === "cancel" && <p className="text-amber-500 text-sm mb-3">Checkout was canceled. You can try again with the same email and password.</p>}
        {!cardCheckout && (
          <p className="text-neutral-500 text-sm mb-3">Card checkout is not configured on this server. Your account will open so you can use the portal. An administrator can attach billing later.</p>
        )}
        <form action={signupAction} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <input name="firstName" placeholder="First name" className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            <input name="lastName" placeholder="Last name" className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          </div>
          <input type="email" name="email" required defaultValue={email ?? ""} placeholder="Email" autoComplete="email" className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          <input type="password" name="password" required minLength={6} placeholder="Password (6+ characters)" autoComplete="new-password" className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          <fieldset className="space-y-2">
            <legend className="text-sm text-neutral-400 mb-1">Plan</legend>
            {PLANS.map((p) => (
              <label key={p.slug} className="flex items-center gap-2 text-sm">
                <input type="radio" name="plan" value={p.slug} required defaultChecked={p.slug === "sovereign-personal"} />
                <span>{p.label}</span>
                <span className="text-neutral-500">{p.price}</span>
              </label>
            ))}
          </fieldset>
          <button type="submit" className="w-full rounded bg-emerald-700 py-2 text-white hover:bg-emerald-600">
            {cardCheckout ? "Continue to payment" : "Create account"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-neutral-500">
          Already a member? <Link href="/login" className="text-neutral-300 hover:text-white">Sign in</Link>
        </p>
        <p className="mt-2 text-center">
          <Link href="/" className="text-sm text-neutral-400 hover:text-white">← Home</Link>
        </p>
      </div>
    </main>
  );
}
