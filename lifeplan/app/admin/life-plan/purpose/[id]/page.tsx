import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PurposePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id: areaOfPurposeId } = await params;
  const { error } = await searchParams;
  const purpose = await prisma.areaOfPurpose.findUnique({
    where: { id: areaOfPurposeId },
    include: {
      areasOfResponsibility: { orderBy: { sortOrder: "asc" } },
      subjectBusiness: { select: { id: true, name: true } },
    },
  });
  if (!purpose) notFound();

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="border-b border-neutral-800 pb-4 mb-6">
          <Link href={"/admin/life-plan/subject/" + purpose.subjectBusiness.id} className="text-neutral-400 hover:text-white text-sm">← {purpose.subjectBusiness.name}</Link>
          <h1 className="text-2xl font-semibold mt-2">{purpose.name}</h1>
          <p className="text-neutral-500 text-sm">Area of purpose</p>
        </header>

        {error === "create" && <p className="text-amber-500 text-sm mb-4">Failed to create.</p>}
        {error === "update" && <p className="text-amber-500 text-sm mb-4">Failed to update.</p>}
        {error === "missing" && <p className="text-amber-500 text-sm mb-4">Name is required.</p>}

        <h2 id="edit" className="text-lg font-medium text-neutral-300 mb-3">Edit this area of purpose</h2>
        <form action={"/api/life-plan/area-of-purpose/" + areaOfPurposeId} method="POST" className="rounded bg-neutral-900 p-4 mb-6 space-y-2">
          <input type="text" name="name" placeholder="Name (required)" required defaultValue={purpose.name} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          <div className="grid grid-cols-2 gap-2">
            <input type="text" name="verb" placeholder="Verb" defaultValue={purpose.verb ?? ""} className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            <input type="text" name="noun" placeholder="Noun" defaultValue={purpose.noun ?? ""} className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            <input type="text" name="object" placeholder="Object" defaultValue={purpose.object ?? ""} className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            <input type="text" name="objective" placeholder="Objective" defaultValue={purpose.objective ?? ""} className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          </div>
          <button type="submit" className="rounded bg-neutral-600 px-4 py-2 text-sm text-white hover:bg-neutral-500">Save changes</button>
        </form>

        <h2 className="text-lg font-medium text-neutral-300 mb-3">Areas of responsibility</h2>
        <form action="/api/life-plan/area-of-responsibility" method="POST" className="rounded bg-neutral-900 p-4 mb-4 space-y-2">
          <input type="hidden" name="areaOfPurposeId" value={areaOfPurposeId} />
          <input type="text" name="name" placeholder="Name (required)" required className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          <div className="grid grid-cols-2 gap-2">
            <input type="text" name="verb" placeholder="Verb" className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            <input type="text" name="noun" placeholder="Noun" className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            <input type="text" name="object" placeholder="Object" className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            <input type="text" name="objective" placeholder="Objective" className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          </div>
          <button type="submit" className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">Add</button>
        </form>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-neutral-400 border-b border-neutral-700">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Verb</th>
                <th className="py-2 pr-4">Noun</th>
                <th className="py-2 pr-4">Object</th>
                <th className="py-2 pr-4">Objective</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {purpose.areasOfResponsibility.map((a) => (
                <tr key={a.id} className="border-b border-neutral-800">
                  <td className="py-2 pr-4">{a.name}</td>
                  <td className="py-2 pr-4 text-neutral-400">{a.verb ?? "—"}</td>
                  <td className="py-2 pr-4 text-neutral-400">{a.noun ?? "—"}</td>
                  <td className="py-2 pr-4 text-neutral-400">{a.object ?? "—"}</td>
                  <td className="py-2 pr-4 text-neutral-400">{a.objective ?? "—"}</td>
                  <td className="py-2">
                    <Link href={"/admin/life-plan/responsibility/" + a.id} className="text-emerald-400 text-sm hover:underline">Open</Link>
                    <span className="mx-1 text-neutral-600">|</span>
                    <Link href={"/admin/life-plan/responsibility/" + a.id + "#edit"} className="text-neutral-400 text-sm hover:underline">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {purpose.areasOfResponsibility.length === 0 && <p className="text-neutral-500 text-sm py-2">No areas of responsibility yet.</p>}
        </div>
      </div>
    </main>
  );
}
