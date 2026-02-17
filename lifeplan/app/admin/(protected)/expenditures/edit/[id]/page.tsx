import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ExpenditureEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [exp, members] = await Promise.all([
    prisma.expenditure.findUnique({ where: { id } }),
    prisma.member.findMany({
      orderBy: { lastName: "asc" },
      select: { id: true, email: true, firstName: true, lastName: true },
    }),
  ]);
  if (!exp) notFound();
  const dateStr = exp.date.toISOString().slice(0, 10);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="border-b border-neutral-800 pb-4 mb-6">
          <Link href="/admin/expenditures" className="text-neutral-400 hover:text-white text-sm">← Expenditures</Link>
          <h1 className="text-2xl font-semibold mt-2">Edit expenditure</h1>
        </header>

        <form action={"/api/expenditures/" + id} method="POST" className="rounded bg-neutral-900 p-4 space-y-3">
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Member</label>
            <select name="memberId" defaultValue={exp.memberId ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700">
              <option value="">— No member (global) —</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.firstName ?? ""} {m.lastName ?? ""} — {m.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Description (required)</label>
            <input type="text" name="description" required defaultValue={exp.description} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Amount (cents)</label>
            <input type="number" name="amountCents" step="1" defaultValue={exp.amountCents} className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700 w-40" />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Date</label>
            <input type="date" name="date" defaultValue={dateStr} className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Notes</label>
            <textarea name="notes" rows={2} defaultValue={exp.notes ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          </div>
          <button type="submit" className="rounded bg-neutral-600 px-4 py-2 text-sm text-white hover:bg-neutral-500">Save changes</button>
        </form>
      </div>
    </main>
  );
}
