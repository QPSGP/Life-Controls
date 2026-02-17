import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CommunicationEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [comm, members] = await Promise.all([
    prisma.communication.findUnique({
      where: { id },
      include: { member: { select: { id: true, email: true, firstName: true, lastName: true } } },
    }),
    prisma.member.findMany({
      orderBy: { lastName: "asc" },
      select: { id: true, email: true, firstName: true, lastName: true },
    }),
  ]);
  if (!comm) notFound();

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="border-b border-neutral-800 pb-4 mb-6">
          <Link href="/admin/communications" className="text-neutral-400 hover:text-white text-sm">← Communications</Link>
          <h1 className="text-2xl font-semibold mt-2">Edit communication</h1>
        </header>

        <form action={"/api/communications/" + id} method="POST" className="rounded bg-neutral-900 p-4 space-y-3">
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Member</label>
            <select name="memberId" required defaultValue={comm.memberId} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700">
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.firstName ?? ""} {m.lastName ?? ""} — {m.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Type</label>
            <select name="type" defaultValue={comm.type} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700">
              <option value="call">Call</option>
              <option value="mailout">Mailout</option>
              <option value="email">Email</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Subject (required)</label>
            <input type="text" name="subject" required defaultValue={comm.subject ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Notes</label>
            <textarea name="notes" rows={3} defaultValue={comm.notes ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          </div>
          <button type="submit" className="rounded bg-neutral-600 px-4 py-2 text-sm text-white hover:bg-neutral-500">Save changes</button>
        </form>
      </div>
    </main>
  );
}
