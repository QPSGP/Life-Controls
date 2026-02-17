import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

type InvoiceWithMemberAndPayments = {
  id: string;
  memberId: string;
  invoiceNumber: string | null;
  amountCents: number;
  dueDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  member: { id: string; email: string; firstName: string | null; lastName: string | null };
  payments: { id: string; amountCents: number }[];
};

export default async function AdminInvoicesPage(props: {
  searchParams: Promise<{ error?: string; created?: string; paid?: string }> | { error?: string; created?: string; paid?: string };
}) {
  const params = typeof (props.searchParams as Promise<unknown>)?.then === "function"
    ? await (props.searchParams as Promise<{ error?: string; created?: string; paid?: string }>)
    : (props.searchParams as { error?: string; created?: string; paid?: string });
  const { error, created, paid } = params;

  let members: { id: string; email: string; firstName: string | null; lastName: string | null }[] = [];
  let invoices: InvoiceWithMemberAndPayments[] = [];
  let dbError: string | null = null;
  try {
    const [membersData, invoicesData] = await Promise.all([
      prisma.member.findMany({
        orderBy: { lastName: "asc" },
        select: { id: true, email: true, firstName: true, lastName: true },
      }),
      prisma.invoice.findMany({
        orderBy: { dueDate: "desc" },
        take: 100,
        include: {
          member: { select: { id: true, email: true, firstName: true, lastName: true } },
          payments: true,
        },
      }),
    ]);
    members = membersData;
    invoices = invoicesData;
  } catch (e) {
    dbError = e instanceof Error ? e.message : String(e);
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
          <h1 className="text-2xl font-semibold">Invoices</h1>
          <Link href="/admin" className="text-neutral-400 hover:text-white text-sm">← Admin</Link>
        </header>

        {dbError && (
          <div className="mb-4 p-4 rounded bg-red-950/50 border border-red-800 text-red-200 text-sm">
            <p>Database error: {dbError}. Run &quot;DB push and seed&quot;.</p>
            <p className="mt-1"><a href="/api/db-status" target="_blank" rel="noopener noreferrer" className="underline">Open /api/db-status</a> for details.</p>
          </div>
        )}
        {error === "missing" && <p className="text-amber-500 text-sm mb-4">Member, amount, and due date are required.</p>}
        {error === "amount" && <p className="text-amber-500 text-sm mb-4">Payment amount must be greater than 0.</p>}
        {error === "create" && <p className="text-amber-500 text-sm mb-4">Failed to create invoice.</p>}
        {error === "payment" && <p className="text-amber-500 text-sm mb-4">Failed to record payment.</p>}
        {created && <p className="text-emerald-500 text-sm mb-4">Invoice created.</p>}
        {paid && <p className="text-emerald-500 text-sm mb-4">Payment recorded.</p>}

        <section className="mb-8">
          <h2 className="text-lg font-medium text-neutral-300 mb-3">Create invoice</h2>
          <form action="/api/invoices" method="POST" className="rounded bg-neutral-900 p-4 flex flex-wrap gap-3">
            <select name="memberId" required className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700 min-w-[200px]">
              <option value="">Select member…</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.firstName ?? ""} {m.lastName ?? ""} — {m.email}</option>
              ))}
            </select>
            <input type="number" name="amountCents" placeholder="Amount (cents)" required min="1" className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700 w-32" />
            <input type="date" name="dueDate" required className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            <button type="submit" className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">Create invoice</button>
          </form>
          <p className="text-neutral-500 text-xs mt-1">Amount in cents (e.g. 19900 = $199.00)</p>
        </section>

        <section>
          <h2 className="text-lg font-medium text-neutral-300 mb-3">Recent invoices</h2>
          {invoices.length === 0 ? (
            <p className="text-neutral-500 text-sm">No invoices yet.</p>
          ) : (
            <ul className="space-y-2">
              {invoices.map((inv) => {
                const totalPaid = inv.payments.reduce((s, p) => s + p.amountCents, 0);
                const balance = inv.amountCents - totalPaid;
                return (
                  <li key={inv.id} className="rounded bg-neutral-900 p-4 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="font-medium">{inv.invoiceNumber ?? inv.id.slice(0, 8)}</span>
                      <span className="text-neutral-400 ml-2">{inv.member.firstName} {inv.member.lastName}</span>
                      <span className="text-neutral-500 text-sm block">Due {inv.dueDate.toLocaleDateString()} · ${(inv.amountCents / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      {balance > 0 && (
                        <span className="text-amber-500 text-sm">${(balance / 100).toFixed(2)} due</span>
                      )}
                      {inv.status === "paid" && <span className="text-emerald-500 text-sm">Paid</span>}
                      <RecordPaymentForm invoiceId={inv.id} maxCents={balance > 0 ? balance : inv.amountCents} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

function RecordPaymentForm({ invoiceId, maxCents }: { invoiceId: string; maxCents: number }) {
  return (
    <form action={`/api/invoices/${invoiceId}/payment`} method="POST" className="flex items-center gap-2">
      <input type="number" name="amountCents" placeholder="Amount (¢)" required min="1" max={maxCents} className="rounded bg-neutral-800 px-2 py-1 text-sm text-white border border-neutral-700 w-24" />
      <input type="hidden" name="currencyType" value="fiat" />
      <input type="hidden" name="currencyCode" value="USD" />
      <input type="hidden" name="paymentProvider" value="manual" />
      <button type="submit" className="rounded bg-neutral-700 px-2 py-1 text-xs text-white hover:bg-neutral-600">Record payment</button>
    </form>
  );
}
