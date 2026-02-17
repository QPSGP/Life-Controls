import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

type CommunicationWithMember = {
  id: string;
  memberId: string;
  type: string;
  subject: string | null;
  notes: string | null;
  createdAt: Date;
  member: { id: string; email: string; firstName: string | null; lastName: string | null };
};

export default async function AdminCommunicationsPage(props: {
  searchParams: Promise<{ error?: string; created?: string; updated?: string }> | { error?: string; created?: string; updated?: string };
}) {
  const params = typeof (props.searchParams as Promise<unknown>)?.then === "function"
    ? await (props.searchParams as Promise<{ error?: string; created?: string; updated?: string }>)
    : (props.searchParams as { error?: string; created?: string; updated?: string });
  const { error, created, updated } = params;

  let members: { id: string; email: string; firstName: string | null; lastName: string | null }[] = [];
  let communications: CommunicationWithMember[] = [];
  let dbError: string | null = null;
  try {
    const [membersData, communicationsData] = await Promise.all([
      prisma.member.findMany({
        orderBy: { lastName: "asc" },
        select: { id: true, email: true, firstName: true, lastName: true },
      }),
      prisma.communication.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
        include: { member: { select: { id: true, email: true, firstName: true, lastName: true } } },
      }),
    ]);
    members = membersData;
    communications = communicationsData;
  } catch (e) {
    dbError = e instanceof Error ? e.message : String(e);
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
          <h1 className="text-2xl font-semibold">Communications</h1>
          <Link href="/admin" className="text-neutral-400 hover:text-white text-sm">← Admin</Link>
        </header>

        {dbError && (
          <div className="mb-4 p-4 rounded bg-red-950/50 border border-red-800 text-red-200 text-sm">
            <p>Database error: {dbError}. Run &quot;DB push and seed&quot;.</p>
            <p className="mt-1"><a href="/api/db-status" target="_blank" rel="noopener noreferrer" className="underline">Open /api/db-status</a> for details.</p>
          </div>
        )}
        {error === "missing" && <p className="text-amber-500 text-sm mb-4">Member and subject are required.</p>}
        {error === "create" && <p className="text-amber-500 text-sm mb-4">Failed to log communication.</p>}
        {created && <p className="text-emerald-500 text-sm mb-4">Communication logged.</p>}
        {updated && <p className="text-emerald-500 text-sm mb-4">Communication updated.</p>}

        <section className="mb-8">
          <h2 className="text-lg font-medium text-neutral-300 mb-3">Log communication</h2>
          <form action="/api/communications" method="POST" className="rounded bg-neutral-900 p-4 space-y-3">
            <div className="flex flex-wrap gap-3">
              <select name="memberId" required className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700 min-w-[200px]">
                <option value="">Select member…</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.firstName ?? ""} {m.lastName ?? ""} — {m.email}</option>
                ))}
              </select>
              <select name="type" className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700">
                <option value="call">Call</option>
                <option value="mailout">Mailout</option>
                <option value="email">Email</option>
              </select>
            </div>
            <input type="text" name="subject" placeholder="Subject (required)" required className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            <textarea name="notes" placeholder="Notes" rows={2} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            <button type="submit" className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">Log</button>
          </form>
        </section>

        <section>
          <h2 className="text-lg font-medium text-neutral-300 mb-3">Recent communications</h2>
          {communications.length === 0 ? (
            <p className="text-neutral-500 text-sm">None yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left text-neutral-400 border-b border-neutral-700">
                    <th className="py-2 pr-4">Type</th>
                    <th className="py-2 pr-4">Member</th>
                    <th className="py-2 pr-4">Subject</th>
                    <th className="py-2 pr-4">Notes</th>
                    <th className="py-2 pr-4">Created</th>
                    <th className="py-2 pr-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {communications.map((c) => (
                    <tr key={c.id} className="border-b border-neutral-800">
                      <td className="py-2 pr-4">{c.type}</td>
                      <td className="py-2 pr-4">{c.member.firstName} {c.member.lastName}</td>
                      <td className="py-2 pr-4">{c.subject ?? "—"}</td>
                      <td className="py-2 pr-4 text-neutral-400 max-w-[200px] truncate">{c.notes ?? "—"}</td>
                      <td className="py-2 pr-4 text-neutral-500 text-xs">{c.createdAt.toLocaleString()}</td>
                      <td className="py-2 pr-4"><Link href={"/admin/communications/edit/" + c.id} className="text-neutral-400 text-sm hover:underline">Edit</Link></td>
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
