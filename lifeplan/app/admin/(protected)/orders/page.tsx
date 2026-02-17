import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage(props: {
  searchParams: Promise<{ error?: string; open?: string }> | { error?: string; open?: string };
}) {
  const params = typeof (props.searchParams as Promise<unknown>)?.then === "function"
    ? await (props.searchParams as Promise<{ error?: string; open?: string }>)
    : (props.searchParams as { error?: string; open?: string });
  const { error, open: openOrderId } = params;

  let members: { id: string; email: string; firstName: string | null; lastName: string | null }[] = [];
  type OrderWithMemberAndLines = {
    id: string;
    memberId: string;
    orderNumber: string | null;
    totalCents: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    member: { id: string; email: string; firstName: string | null; lastName: string | null };
    orderLines: { id: string; orderId: string; type: string | null; item: string | null; unitCents: number; quantity: number; totalCents: number; createdAt: Date }[];
  };
  let orders: OrderWithMemberAndLines[] = [];
  let dbError: string | null = null;
  try {
    const [membersData, ordersData] = await Promise.all([
      prisma.member.findMany({
        orderBy: { lastName: "asc" },
        select: { id: true, email: true, firstName: true, lastName: true },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          member: { select: { id: true, email: true, firstName: true, lastName: true } },
          orderLines: true,
        },
      }),
    ]);
    members = membersData;
    orders = ordersData;
  } catch (e) {
    dbError = e instanceof Error ? e.message : String(e);
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
          <h1 className="text-2xl font-semibold">Orders</h1>
          <Link href="/admin" className="text-neutral-400 hover:text-white text-sm">← Admin</Link>
        </header>

        {dbError && (
          <div className="mb-4 p-4 rounded bg-red-950/50 border border-red-800 text-red-200 text-sm">
            <p>Database error: {dbError}. Run &quot;DB push and seed&quot;.</p>
          </div>
        )}
        {error === "missing" && <p className="text-amber-500 text-sm mb-4">Select a member.</p>}
        {error === "create" && <p className="text-amber-500 text-sm mb-4">Failed to create order.</p>}
        {error === "line" && <p className="text-amber-500 text-sm mb-4">Failed to add line.</p>}

        <section className="mb-8">
          <h2 className="text-lg font-medium text-neutral-300 mb-3">Create order</h2>
          <form action="/api/orders" method="POST" className="flex flex-wrap gap-3">
            <select name="memberId" required className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700 min-w-[200px]">
              <option value="">Select member…</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.firstName ?? ""} {m.lastName ?? ""} — {m.email}</option>
              ))}
            </select>
            <input type="text" name="orderNumber" placeholder="Order # (optional)" className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            <button type="submit" className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">Create order</button>
          </form>
        </section>

        <section>
          <h2 className="text-lg font-medium text-neutral-300 mb-3">Recent orders</h2>
          {orders.length === 0 ? (
            <p className="text-neutral-500 text-sm">No orders yet.</p>
          ) : (
            <ul className="space-y-4">
              {orders.map((o) => (
                <li key={o.id} className="rounded bg-neutral-900 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{o.member.firstName} {o.member.lastName}</span>
                    <span className="text-neutral-400 text-sm">{o.orderNumber ?? o.id.slice(0, 8)}</span>
                    <span className="text-emerald-400">${(o.totalCents / 100).toFixed(2)}</span>
                    <span className="text-neutral-500 text-sm">{o.status}</span>
                  </div>
                  {openOrderId === o.id && (
                    <form action={`/api/orders/${o.id}/lines`} method="POST" className="flex flex-wrap gap-2 mb-3 p-3 rounded bg-neutral-800">
                      <input type="text" name="type" placeholder="Type" className="rounded bg-neutral-700 px-2 py-1 text-sm w-24" />
                      <input type="text" name="item" placeholder="Item" className="rounded bg-neutral-700 px-2 py-1 text-sm flex-1 min-w-[120px]" />
                      <input type="number" name="unitCents" placeholder="Cents" step="1" className="rounded bg-neutral-700 px-2 py-1 text-sm w-24" />
                      <input type="number" name="quantity" placeholder="Qty" min={1} defaultValue={1} className="rounded bg-neutral-700 px-2 py-1 text-sm w-16" />
                      <button type="submit" className="rounded bg-emerald-700 px-2 py-1 text-xs text-white">Add line</button>
                    </form>
                  )}
                  <a href={openOrderId === o.id ? "/admin/orders" : `/admin/orders?open=${o.id}`} className="text-sm text-neutral-400 hover:text-white">
                    {openOrderId === o.id ? "Close" : "Add line"}
                  </a>
                  {o.orderLines.length > 0 && (
                    <ul className="mt-2 text-sm text-neutral-400">
                      {o.orderLines.map((l) => (
                        <li key={l.id}>{l.item ?? l.type ?? "—"} × {l.quantity} = ${(l.totalCents / 100).toFixed(2)}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
