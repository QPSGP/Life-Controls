import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MOVEMENT_TYPES } from "@/lib/movement-types";

export const dynamic = "force-dynamic";

export default async function ResponsibilityPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id: areaOfResponsibilityId } = await params;
  const { error } = await searchParams;
  const responsibility = await prisma.areaOfResponsibility.findUnique({
    where: { id: areaOfResponsibilityId },
    include: {
      physicalMovements: { orderBy: [{ done: "asc" }, { sortOrder: "asc" }] },
      areaOfPurpose: { include: { subjectBusiness: { select: { id: true, name: true } } } },
    },
  });
  if (!responsibility) notFound();

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="border-b border-neutral-800 pb-4 mb-6">
          <Link href={"/admin/life-plan/purpose/" + responsibility.areaOfPurpose.id} className="text-neutral-400 hover:text-white text-sm">← {responsibility.areaOfPurpose.name}</Link>
          <h1 className="text-2xl font-semibold mt-2">{responsibility.name}</h1>
          <p className="text-neutral-500 text-sm">Area of responsibility</p>
        </header>

        {error === "create" && <p className="text-amber-500 text-sm mb-4">Failed to create.</p>}
        {error === "missing" && <p className="text-amber-500 text-sm mb-4">Verb is required.</p>}
        {error === "update" && <p className="text-amber-500 text-sm mb-4">Failed to update.</p>}

        <h2 id="edit" className="text-lg font-medium text-neutral-300 mb-3">Edit this area of responsibility</h2>
        <form action={"/api/life-plan/area-of-responsibility/" + areaOfResponsibilityId} method="POST" className="rounded bg-neutral-900 p-4 mb-6 space-y-2">
          <input type="text" name="name" placeholder="Name (required)" required defaultValue={responsibility.name} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          <div className="grid grid-cols-2 gap-2">
            <input type="text" name="verb" placeholder="Verb" defaultValue={responsibility.verb ?? ""} className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            <input type="text" name="noun" placeholder="Noun" defaultValue={responsibility.noun ?? ""} className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            <input type="text" name="object" placeholder="Object" defaultValue={responsibility.object ?? ""} className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            <input type="text" name="objective" placeholder="Objective" defaultValue={responsibility.objective ?? ""} className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          </div>
          <button type="submit" className="rounded bg-neutral-600 px-4 py-2 text-sm text-white hover:bg-neutral-500">Save changes</button>
        </form>

        <h2 className="text-lg font-medium text-neutral-300 mb-3">Physical movements</h2>
        <form action="/api/life-plan/physical-movement" method="POST" className="rounded bg-neutral-900 p-4 mb-6 space-y-2">
          <input type="hidden" name="areaOfResponsibilityId" value={areaOfResponsibilityId} />
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Type (miniday category)</label>
            <select name="movementType" className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700">
              <option value="">—</option>
              {MOVEMENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <input type="text" name="verb" placeholder="Verb (required)" required className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            <input type="text" name="noun" placeholder="Noun" className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            <input type="text" name="object" placeholder="Object" className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          </div>
          <input type="text" name="objective" placeholder="Objective" className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          <input type="text" name="results" placeholder="Results" className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">DATE</label>
              <input type="date" name="scheduledDate" className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">TIME</label>
              <input type="time" name="scheduledTime" className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">D/R (D=Date specific, R=Rolls over)</label>
              <select name="dateOrRollover" className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700">
                <option value="">—</option>
                <option value="D">D — Date Specific</option>
                <option value="R">R — Rolls over</option>
              </select>
            </div>
          </div>
          <button type="submit" className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">Add movement</button>
        </form>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-neutral-400 border-b border-neutral-700">
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Verb</th>
                <th className="py-2 pr-4">Noun</th>
                <th className="py-2 pr-4">Object</th>
                <th className="py-2 pr-4">Objective</th>
                <th className="py-2 pr-4">Results</th>
                <th className="py-2 pr-4">Done</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {responsibility.physicalMovements.map((m) => (
                <tr key={m.id} className={`border-b border-neutral-800 ${m.done ? "opacity-70" : ""}`}>
                  <td className="py-2 pr-4 text-neutral-400">{m.movementType ?? "—"}</td>
                  <td className="py-2 pr-4">{m.verb ?? "—"}</td>
                  <td className="py-2 pr-4">{m.noun ?? "—"}</td>
                  <td className="py-2 pr-4">{m.object ?? "—"}</td>
                  <td className="py-2 pr-4 text-neutral-400">{m.objective ?? "—"}</td>
                  <td className="py-2 pr-4 text-neutral-400">{m.results ?? "—"}</td>
                  <td className="py-2 pr-4">{m.done ? "Yes" : "No"}</td>
                  <td className="py-2">
                    <Link href={"/admin/life-plan/movement/" + m.id + "/edit"} className="text-neutral-400 text-sm hover:underline mr-2">Edit</Link>
                    <form action={"/api/life-plan/physical-movement/" + m.id + "/done"} method="POST" className="inline">
                      <input type="hidden" name="done" value={m.done ? "false" : "true"} />
                      <button type="submit" className="rounded px-2 py-1 text-xs border border-neutral-600 hover:bg-neutral-800">
                        {m.done ? "Undo" : "Done"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {responsibility.physicalMovements.length === 0 && <p className="text-neutral-500 text-sm py-2">No physical movements yet.</p>}
        </div>
      </div>
    </main>
  );
}
