import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminExpendituresPage(props: {
  searchParams: Promise<{ error?: string }> | { error?: string };
}) {
  const params = typeof (props.searchParams as Promise<unknown>)?.then === "function"
    ? await (props.searchParams as Promise<{ error?: string; updated?: string }>)
    : (props.searchParams as { error?: string; updated?: string });
  const { error, updated } = params;

  let members: { id: string; email: string; firstName: string | null; lastName: string | null }[] = [];
  type ExpenditureWithMember = { id: string; memberId: string | null; description: string; amountCents: number; date: Date; notes: string | null; createdAt: Date; member: { firstName: string | null; lastName: string | null; email: string } | null };
  let expenditures: ExpenditureWithMember[] = [];
  let dbError: string | null = null;
  try {
    const [membersData, expendituresData] = await Promise.all([
      prisma.member.findMany({
        orderBy: { lastName: "asc" },
        select: { id: true, email: true, firstName: true, lastName: true },
      }),
      prisma.expenditure.findMany({
        orderBy: { date: "desc" },
        take: 100,
        include: { member: { select: { firstName: true, lastName: true, email: true } } },
      }),
    ]);
    members = membersData;
    expenditures = expendituresData;
  } catch (e) {
    dbError = e instanceof Error ? e.message : String(e);
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
          <h1 className="text-2xl font-semibold">Expenditures</h1>
          <Link href="/admin" className="text-neutral-400 hover:text-white text-sm">← Admin</Link>
        </header>

        {dbError && (
          <div className="mb-4 p-4 rounded bg-red-950/50 border border-red-800 text-red-200 text-sm">
            <p>Database error: {dbError}. Run &quot;DB push and seed&quot;.</p>
          </div>
        )}
        {error && <p className="text-amber-500 text-sm mb-4">Please fill required fields.</p>}
        {updated && <p className="text-emerald-500 text-sm mb-4">Expenditure updated.</p>}

        <section className="mb-8">
          <h2 className="text-lg font-medium text-neutral-300 mb-3">Log expenditure</h2>
          <form action="/api/expenditures" method="POST" className="rounded bg-neutral-900 p-4 space-y-3">
            <select name="memberId" className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700 min-w-[200px]">
              <option value="">— No member (global) —</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.firstName ?? ""} {m.lastName ?? ""} — {m.email}</option>
              ))}
            </select>
            <input type="text" name="description" placeholder="Description (required)" required className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            <input type="number" name="amountCents" placeholder="Amount (cents)" step="1" className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700 w-40" />
            <input type="date" name="date" className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            <input type="text" name="notes" placeholder="Notes" className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            <button type="submit" className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">Log</button>
          </form>
        </section>

        <section>
          <h2 className="text-lg font-medium text-neutral-300 mb-3">Recent expenditures</h2>
          {expenditures.length === 0 ? (
            <p className="text-neutral-500 text-sm">None yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left text-neutral-400 border-b border-neutral-700">
                    <th className="py-2 pr-4">Description</th>
                    <th className="py-2 pr-4">Member</th>
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Notes</th>
                    <th className="py-2 pr-4">Created</th>
                    <th className="py-2 pr-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {expenditures.map((e) => (
                    <tr key={e.id} className="border-b border-neutral-800">
                      <td className="py-2 pr-4">{e.description}</td>
                      <td className="py-2 pr-4 text-neutral-400">{e.member ? `${e.member.firstName ?? ""} ${e.member.lastName ?? ""}`.trim() || e.member.email : "—"}</td>
                      <td className="py-2 pr-4 text-emerald-400">${(e.amountCents / 100).toFixed(2)}</td>
                      <td className="py-2 pr-4 text-neutral-400">{e.date.toLocaleDateString()}</td>
                      <td className="py-2 pr-4 text-neutral-400 max-w-[150px] truncate">{e.notes ?? "—"}</td>
                      <td className="py-2 pr-4 text-neutral-500 text-xs">{e.createdAt.toLocaleString()}</td>
                      <td className="py-2 pr-4"><Link href={"/admin/expenditures/edit/" + e.id} className="text-neutral-400 text-sm hover:underline">Edit</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
