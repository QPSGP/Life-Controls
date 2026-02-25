import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MOVEMENT_TYPES } from "@/lib/movement-types";

export const dynamic = "force-dynamic";

export default async function MovementEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const movement = await prisma.physicalMovement.findUnique({
    where: { id },
    include: { areaOfResponsibility: { select: { id: true, name: true } } },
  });
  if (!movement) notFound();
  const backUrl = "/admin/life-plan/responsibility/" + movement.areaOfResponsibilityId;
  const currentVerb = movement.verb ?? "";

  let minidayCategories: { id: string; name: string }[] = [];
  try {
    if ("minidayCategory" in prisma && typeof (prisma as { minidayCategory?: { findMany: (opts: unknown) => Promise<{ id: string; name: string }[]> } }).minidayCategory?.findMany === "function") {
      minidayCategories = await (prisma as { minidayCategory: { findMany: (opts: unknown) => Promise<{ id: string; name: string }[]> } }).minidayCategory.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
    }
  } catch {
    // Prisma client may not include MinidayCategory yet
  }
  if (minidayCategories.length === 0) {
    minidayCategories = MOVEMENT_TYPES.map((name) => ({ id: name, name }));
  }
  const verbInList = minidayCategories.some((c) => c.name === currentVerb);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="border-b border-neutral-800 pb-4 mb-6">
          <Link href={backUrl} className="text-neutral-400 hover:text-white text-sm">← {movement.areaOfResponsibility.name}</Link>
          <h1 className="text-2xl font-semibold mt-2">Edit physical movement</h1>
        </header>

        {error && <p className="text-amber-500 text-sm mb-4">Verb is required.</p>}

        <p className="mb-2">
          <Link href="/admin/life-plan/miniday-categories" className="text-neutral-400 text-sm hover:underline">Edit miniday categories (verbs)</Link>
        </p>
        <form action={"/api/life-plan/physical-movement/" + id} method="POST" className="rounded bg-neutral-900 p-4 space-y-2">
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Verb (miniday category)</label>
            <select name="verb" required defaultValue={verbInList ? currentVerb : (currentVerb ? "__other__" : "")} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700">
              <option value="">—</option>
              {minidayCategories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
              <option value="__other__">Other (enter below)</option>
            </select>
            <input type="text" name="verbOther" placeholder="Custom verb (if Other)" defaultValue={!verbInList ? currentVerb : ""} className="mt-1 w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" title="Used when Verb is Other" />
          </div>
          <input type="hidden" name="movementType" value="" />
          <div className="grid grid-cols-2 gap-2">
            <input type="text" name="noun" placeholder="Noun" defaultValue={movement.noun ?? ""} className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            <input type="text" name="object" placeholder="Object" defaultValue={movement.object ?? ""} className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          </div>
          <input type="text" name="objective" placeholder="Objective" defaultValue={movement.objective ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          <input type="text" name="results" placeholder="Results" defaultValue={movement.results ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">DATE</label>
              <input type="date" name="scheduledDate" defaultValue={movement.scheduledDate ? new Date(movement.scheduledDate).toISOString().slice(0, 10) : ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">TIME</label>
              <input type="time" name="scheduledTime" defaultValue={movement.scheduledTime ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">D/R (D=Date specific, R=Rolls over)</label>
              <select name="dateOrRollover" defaultValue={movement.dateOrRollover ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700">
                <option value="">—</option>
                <option value="D">D — Date Specific</option>
                <option value="R">R — Rolls over</option>
              </select>
            </div>
          </div>
          <button type="submit" className="rounded bg-neutral-600 px-4 py-2 text-sm text-white hover:bg-neutral-500">Save changes</button>
        </form>

        <p className="mt-4">
          <Link href={backUrl} className="text-neutral-400 hover:text-white text-sm">← Back to responsibility</Link>
        </p>
      </div>
    </main>
  );
}
