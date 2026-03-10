import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminPersonEditPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }> | { error?: string };
}) {
  const { id } = await props.params;
  const params = typeof (props.searchParams as Promise<unknown>)?.then === "function"
    ? await (props.searchParams as Promise<{ error?: string }>)
    : (props.searchParams as { error?: string });
  const { error } = params;

  const person = await prisma.universaPerson.findUnique({
    where: { id },
    include: { aliases: true },
  });
  if (!person) notFound();

  const displayName = [person.lastName, person.firstName, person.middle].filter(Boolean).join(", ") || person.personalId || "Person";

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="border-b border-neutral-800 pb-4 mb-6">
          <Link href="/admin/people" className="text-neutral-400 hover:text-white text-sm">← People</Link>
          <h1 className="text-2xl font-semibold mt-2">Edit person — {displayName}</h1>
        </header>

        {error === "update" && <p className="text-amber-500 text-sm mb-4">Could not update person.</p>}
        {error === "alias" && <p className="text-amber-500 text-sm mb-4">Could not save or delete alias.</p>}

        <form action={"/api/universa/persons/" + id} method="POST" className="rounded-lg bg-neutral-900 p-6 space-y-4 mb-8">
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Personal ID (unique)</label>
            <input type="text" name="personalId" defaultValue={person.personalId ?? ""} placeholder="Optional" className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Last name</label>
              <input type="text" name="lastName" defaultValue={person.lastName ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">First name</label>
              <input type="text" name="firstName" defaultValue={person.firstName ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Middle</label>
            <input type="text" name="middle" defaultValue={person.middle ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          </div>
          <button type="submit" className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">Save person</button>
        </form>

        <section>
          <h2 className="text-lg font-medium text-neutral-300 mb-3">Aliases</h2>
          {person.aliases.length === 0 ? (
            <p className="text-neutral-500 text-sm mb-3">None. Add below.</p>
          ) : (
            <ul className="space-y-2 mb-4">
              {person.aliases.map((a) => (
                <li key={a.id} className="rounded bg-neutral-900 p-3 flex items-center justify-between">
                  <form action={"/api/universa/persons/" + id + "/aliases/" + a.id} method="POST" className="flex items-center gap-2 flex-1">
                    <input type="text" name="aliasIdNum" defaultValue={a.aliasIdNum ?? ""} placeholder="Alias ID NUM" className="rounded bg-neutral-800 px-2 py-1 text-white border border-neutral-700 flex-1 max-w-xs" />
                    <button type="submit" className="rounded bg-neutral-600 px-2 py-1 text-xs text-white hover:bg-neutral-500">Save</button>
                  </form>
                  <form action={"/api/universa/persons/" + id + "/aliases/" + a.id + "/delete"} method="POST" className="inline">
                    <button type="submit" className="rounded bg-red-900/50 px-2 py-1 text-xs text-red-200 hover:bg-red-800/50">Delete</button>
                  </form>
                </li>
              ))}
            </ul>
          )}
          <form action={"/api/universa/persons/" + id + "/aliases"} method="POST" className="rounded bg-neutral-900 p-3 flex gap-2">
            <input type="text" name="aliasIdNum" placeholder="Alias ID NUM" className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700 flex-1" />
            <button type="submit" className="rounded bg-emerald-700 px-3 py-2 text-sm text-white hover:bg-emerald-600">Add alias</button>
          </form>
        </section>

        <p className="mt-6">
          <Link href="/admin/people" className="text-neutral-400 hover:text-white text-sm">← Back to People</Link>
        </p>
      </div>
    </main>
  );
}
