import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPeoplePage(props: {
  searchParams: Promise<{ error?: string }> | { error?: string };
}) {
  const params = typeof (props.searchParams as Promise<unknown>)?.then === "function"
    ? await (props.searchParams as Promise<{ error?: string }>)
    : (props.searchParams as { error?: string });
  const { error } = params;

  let persons: { id: string; personalId: string | null; lastName: string | null; firstName: string | null; middle: string | null; aliases: { id: string; aliasIdNum: string | null }[] }[] = [];
  let dbError: string | null = null;
  try {
    persons = await prisma.universaPerson.findMany({
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      include: { aliases: true },
    });
  } catch (e) {
    dbError = e instanceof Error ? e.message : String(e);
  }

  const displayName = (p: { personalId: string | null; lastName: string | null; firstName: string | null; middle: string | null }) =>
    [p.lastName, p.firstName, p.middle].filter(Boolean).join(", ") || p.personalId || "—";

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
          <h1 className="text-2xl font-semibold">People (UNIVERSA)</h1>
          <div className="flex items-center gap-4">
            <Link href="/admin/documents" className="text-neutral-400 hover:text-white text-sm">Documents</Link>
            <Link href="/admin" className="text-neutral-400 hover:text-white text-sm">← Admin</Link>
          </div>
        </header>

        {dbError && (
          <div className="mb-4 p-4 rounded bg-red-950/50 border border-red-800 text-red-200 text-sm">
            Database error: {dbError}. Run &quot;DB push and seed&quot;.
          </div>
        )}
        {error === "duplicate" && <p className="text-amber-500 text-sm mb-4">A person with that Personal ID already exists.</p>}
        {error === "create" && <p className="text-amber-500 text-sm mb-4">Could not create person.</p>}
        {error === "delete" && <p className="text-amber-500 text-sm mb-4">Could not delete person.</p>}

        <section className="mb-8">
          <h2 className="text-lg font-medium text-neutral-300 mb-3">Add person</h2>
          <form action="/api/universa/persons" method="POST" className="rounded-lg bg-neutral-900 p-4 space-y-3 max-w-md">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Personal ID (optional, unique)</label>
              <input type="text" name="personalId" placeholder="Legacy Personal ID" className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Last name</label>
                <input type="text" name="lastName" className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">First name</label>
                <input type="text" name="firstName" className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Middle</label>
              <input type="text" name="middle" className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            </div>
            <button type="submit" className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">Add person</button>
          </form>
        </section>

        <section>
          <h2 className="text-lg font-medium text-neutral-300 mb-3">All persons ({persons.length})</h2>
          {persons.length === 0 ? (
            <p className="text-neutral-500 text-sm">No people yet. Add one above or import from CSV (see docs/UNIVERSA_IMPORT.md).</p>
          ) : (
            <ul className="space-y-2">
              {persons.map((p) => (
                <li key={p.id} className="flex items-center justify-between rounded bg-neutral-900 p-3">
                  <div>
                    <Link href={"/admin/people/" + p.id + "/edit"} className="text-emerald-400 hover:underline font-medium">
                      {displayName(p)}
                    </Link>
                    {p.personalId && <span className="ml-2 text-neutral-500 text-sm">ID: {p.personalId}</span>}
                    {p.aliases.length > 0 && (
                      <span className="ml-2 text-neutral-500 text-sm">({p.aliases.length} alias{p.aliases.length !== 1 ? "es" : ""})</span>
                    )}
                  </div>
                  <form action={"/api/universa/persons/" + p.id + "/delete"} method="POST" className="inline">
                    <button type="submit" className="rounded bg-red-900/50 px-2 py-1 text-xs text-red-200 hover:bg-red-800/50">Delete</button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
