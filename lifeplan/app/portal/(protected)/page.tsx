import { redirect } from "next/navigation";
import Link from "next/link";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PortalPage(props: { searchParams: Promise<{ updated?: string; error?: string }> | { updated?: string; error?: string } }) {
  const memberId = await getMemberIdFromCookie();
  if (!memberId) redirect("/login");
  const params = typeof (props.searchParams as Promise<unknown>)?.then === "function"
    ? await (props.searchParams as Promise<{ updated?: string; error?: string }>)
    : (props.searchParams as { updated?: string; error?: string });

  const [member, subscriptions, invoices, subjectBusinesses] = await Promise.all([
    prisma.member.findUniqueOrThrow({
      where: { id: memberId },
      include: { categories: { select: { category: true } } },
    }),
    prisma.subscription.findMany({
      where: { memberId, status: { in: ["active", "trial"] } },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.invoice.findMany({
      where: { memberId },
      include: { payments: true },
      orderBy: { dueDate: "desc" },
      take: 20,
    }),
    prisma.subjectBusiness.findMany({
      where: { memberId },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-8">
          <h1 className="text-2xl font-semibold">My account</h1>
          <form action="/api/auth/member/logout" method="POST">
            <button type="submit" className="text-neutral-400 hover:text-white text-sm">Sign out</button>
          </form>
        </header>

        {params.updated && <p className="text-emerald-500 text-sm mb-4">Profile updated.</p>}
        {params.error === "update" && <p className="text-amber-500 text-sm mb-4">Failed to update profile.</p>}

        <section className="mb-8">
          <h2 className="text-lg font-medium text-neutral-300 mb-3">Profile</h2>
          <div className="rounded-lg bg-neutral-900 p-4 space-y-2 text-sm">
            <p><span className="text-neutral-500">Name:</span> {member.firstName ?? ""} {member.lastName ?? ""}</p>
            <p><span className="text-neutral-500">Email:</span> {member.email}</p>
            {member.company && <p><span className="text-neutral-500">Company:</span> {member.company}</p>}
            {member.phone && <p><span className="text-neutral-500">Phone:</span> {member.phone}</p>}
            {(member.street || member.city) && (
              <p><span className="text-neutral-500">Address:</span> {[member.street, member.city, member.state, member.zip].filter(Boolean).join(", ")}</p>
            )}
          </div>
          <p className="mt-2">
            <Link href="/portal/profile/edit" className="text-emerald-400 text-sm hover:underline">Edit profile</Link>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-medium text-neutral-300 mb-3">My miniday schedule</h2>
          <p className="text-neutral-500 text-sm mb-2">View and print all activities from your life plan.</p>
          <Link href="/portal/schedule" className="inline-block rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">View schedule →</Link>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-medium text-neutral-300 mb-3">My subscription(s)</h2>
          {subscriptions.length === 0 ? (
            <p className="text-neutral-500 text-sm">No active subscription.</p>
          ) : (
            <ul className="space-y-2">
              {subscriptions.map((s) => (
                <li key={s.id} className="rounded-lg bg-neutral-900 p-4 flex items-center justify-between">
                  <span className="font-medium">{s.plan.name}</span>
                  <span className="text-emerald-400">${(s.plan.amountCents / 100).toFixed(2)} / {s.plan.interval}</span>
                  <span className="text-neutral-500 text-sm">{s.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {subjectBusinesses.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-medium text-neutral-300 mb-3">My plan</h2>
            <p className="text-neutral-500 text-sm mb-2">You have a life plan linked to your account.</p>
            <Link href="/portal/plan" className="inline-block rounded bg-neutral-800 px-4 py-2 text-sm text-white hover:bg-neutral-700">View my plan →</Link>
          </section>
        )}

        <section className="mb-8">
          <h2 className="text-lg font-medium text-neutral-300 mb-3">Invoices & payments</h2>
          {invoices.length === 0 ? (
            <p className="text-neutral-500 text-sm">No invoices yet.</p>
          ) : (
            <ul className="space-y-2">
              {invoices.map((inv) => {
                const paid = inv.payments.reduce((s, p) => s + p.amountCents, 0);
                const open = inv.amountCents - paid;
                return (
                  <li key={inv.id} className="rounded-lg bg-neutral-900 p-4 flex items-center justify-between text-sm">
                    <div>
                      <span className="text-neutral-400">{inv.invoiceNumber ?? inv.id.slice(0, 8)}</span>
                      <span className="ml-2">Due {inv.dueDate.toLocaleDateString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400">${(inv.amountCents / 100).toFixed(2)}</span>
                      {open > 0 && <span className="ml-2 text-amber-500">${(open / 100).toFixed(2)} due</span>}
                      {inv.status === "paid" && <span className="ml-2 text-neutral-500">Paid</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <p className="text-center">
          <Link href="/" className="text-sm text-neutral-400 hover:text-white">← Home</Link>
        </p>
      </div>
    </main>
  );
}
