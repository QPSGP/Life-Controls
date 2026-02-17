import type { Chore } from "@prisma/client";
import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminChoresPage(props: {
  searchParams: Promise<{ error?: string }> | { error?: string };
}) {
  const params = typeof (props.searchParams as Promise<unknown>)?.then === "function"
    ? await (props.searchParams as Promise<{ error?: string; updated?: string }>)
    : (props.searchParams as { error?: string; updated?: string });
  const { error, updated } = params;

  let chores: Chore[] = [];
  let dbError: string | null = null;
  try {
    chores = await prisma.chore.findMany({
      orderBy: [{ done: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    });
  } catch (e) {
    dbError = e instanceof Error ? e.message : String(e);
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
          <h1 className="text-2xl font-semibold">Chores</h1>
          <Link href="/admin" className="text-neutral-400 hover:text-white text-sm">← Admin</Link>
        </header>

        {dbError && (
          <div className="mb-4 p-4 rounded bg-red-950/50 border border-red-800 text-red-200 text-sm">
            <p>Database error: {dbError}. Run &quot;DB push and seed&quot;.</p>
          </div>
        )}
        {error && <p className="text-amber-500 text-sm mb-4">Title is required.</p>}
        {updated && <p className="text-emerald-500 text-sm mb-4">Chore updated.</p>}

        <form action="/api/chores" method="POST" className="flex gap-2 mb-6">
          <input type="text" name="title" placeholder="Title (required)" required className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700 flex-1" />
          <input type="text" name="description" placeholder="Description" className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700 flex-1" />
          <button type="submit" className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">Add</button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-neutral-400 border-b border-neutral-700">
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Description</th>
                <th className="py-2 pr-4">Done</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {chores.length === 0 ? (
                <tr><td colSpan={4} className="py-2 text-neutral-500 text-sm">No chores yet.</td></tr>
              ) : (
                chores.map((c) => (
                  <tr key={c.id} className={`border-b border-neutral-800 ${c.done ? "opacity-70" : ""}`}>
                    <td className="py-2 pr-4">{c.done ? <span className="line-through text-neutral-500">{c.title}</span> : c.title}</td>
                    <td className="py-2 pr-4 text-neutral-400">{c.description ?? "—"}</td>
                    <td className="py-2 pr-4">{c.done ? "Yes" : "No"}</td>
                    <td className="py-2">
                      <Link href={"/admin/chores/edit/" + c.id} className="text-neutral-400 text-sm hover:underline mr-2">Edit</Link>
                      <form action={`/api/chores/${c.id}/done`} method="POST" className="inline">
                        <input type="hidden" name="done" value={c.done ? "false" : "true"} />
                        <button type="submit" className="rounded px-2 py-1 text-xs border border-neutral-600 hover:bg-neutral-800">
                          {c.done ? "Undo" : "Done"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
