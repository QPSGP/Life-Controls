import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ChoreEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const chore = await prisma.chore.findUnique({ where: { id } });
  if (!chore) notFound();

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="border-b border-neutral-800 pb-4 mb-6">
          <Link href="/admin/chores" className="text-neutral-400 hover:text-white text-sm">← Chores</Link>
          <h1 className="text-2xl font-semibold mt-2">Edit chore</h1>
        </header>

        <form action={"/api/chores/" + id} method="POST" className="rounded bg-neutral-900 p-4 space-y-3">
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Title (required)</label>
            <input type="text" name="title" required defaultValue={chore.title} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Description</label>
            <input type="text" name="description" defaultValue={chore.description ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          </div>
          <button type="submit" className="rounded bg-neutral-600 px-4 py-2 text-sm text-white hover:bg-neutral-500">Save changes</button>
        </form>
      </div>
    </main>
  );
}
